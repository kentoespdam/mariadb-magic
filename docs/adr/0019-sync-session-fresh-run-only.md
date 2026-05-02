# Sync Session retry: selalu fresh run, tidak ada resume dari checkpoint di V1

Sync Session yang berstatus `interrupted`, `failed`, atau `cancelled` tidak bisa "dilanjutkan" — user yang ingin sync lagi memulai **Session baru dari awal**, mengeksekusi seluruh Selection Set kembali dari tabel pertama. Tidak ada state checkpoint per-tabel atau per-chunk yang dipersist untuk resume. Idempotensi Source-wins UPSERT (PRD §6) menjamin re-run pada tabel yang sudah selesai sebelumnya tidak menduplikasi data — baris yang Match Key-nya cocok ditimpa dengan nilai Source (yang seharusnya identik kalau Source tidak berubah). Tujuan: simplisitas mental model + simplisitas implementasi runner; biaya re-run = waktu tambahan, bukan integritas data.

## Considered Options

- **(A) Selalu fresh run penuh dari awal** *(dipilih)*. Session baru = traversal Selection Set lengkap dari tabel pertama. Tabel yang sudah ter-sync di Session sebelumnya akan di-`SELECT *` lagi dan di-UPSERT lagi — Source-wins UPSERT idempotent (baris cocok PK ditimpa dengan nilai sama, baris Source baru ter-insert). Mental model satu jalur: "sync = run dari awal, lagi". Tidak ada UI "Lanjutkan" / "Mulai dari awal" — hanya "Mulai Sync".
- **(B) Resume dari checkpoint per-tabel atau per-chunk**. Runner persist `last_completed_table` + `last_committed_offset` di `sync_sessions`; Session yang `interrupted` punya tombol "Lanjutkan" → runner skip ke tabel/offset terakhir. Ditolak: (1) **race dengan Source live writes** (Skenario A ADR-0015) — tabel yang sudah "selesai" di Session 1 mungkin punya baris baru di Source antara Session 1 selesai dan Session 2 mulai. Resume dari tabel berikutnya = miss data baru itu sampai user manual re-sync. Persona target tidak akan menyadari gap ini sampai laporan downstream salah. (2) **Checkpoint schema baru**: `sync_sessions` butuh kolom `resume_state_json` + invariant runtime "kalau resume, jangan re-execute Closure Advisor / Preflight" (atau execute tapi handle drift mid-resume) — kompleksitas non-trivial. (3) **UI dual-path** "Lanjutkan vs Mulai dari awal" menambah keputusan yang user tidak siap ambil. Persona target tidak punya frame untuk membedakan kapan resume aman vs tidak. (4) **Snapshot profile** (ADR-0008) jadi rumit: Session 1 freeze snapshot v1; user edit profile jadi v2; Session 2 resume Session 1 — pakai v1 atau v2? Re-execute dari awal sidesteps semua ini.
- **(C) User pilih per-Session: "Lanjutkan dari mana berhenti" vs "Mulai dari awal"**. Ditolak: menimbun keputusan ke user yang tidak punya konteks teknis untuk memilih ("apakah Source berubah sejak interrupt? saya tidak tahu — kapan terakhir aplikasi tulis ke `orders`?"). Default safe = fresh run, tapi opsi "Lanjutkan" jadi trap yang menggoda untuk dataset besar. Bukan keputusan yang seharusnya di-delegasi ke persona target.
- **(D) Auto-retry session `interrupted` N kali oleh runner**. Ditolak: (1) `interrupted` di V1 = system event (connection drop, app crash) — penyebabnya kerap eksternal (network, OS sleep, MariaDB down). Auto-retry tanpa user awareness berisiko spam koneksi ke Source produksi yang lagi bermasalah. (2) Crash recovery butuh state machine baru (last attempt count, backoff schedule) yang kompleks tanpa value persona target jelas. (3) User idiomatic flow: lihat Session merah, klik "Mulai Sync" lagi — manual retry sudah cukup ergonomis di V1.

## Consequences

### Skema (`sync_sessions`)

Tidak ada kolom resume state baru di V1.

```sql
-- Struktur existing yang relevan (referensi PRD §6 + ADR-0008/0009):
-- sync_sessions(id, profile_snapshot_json, status, started_at, ended_at,
--               rows_processed, rows_failed, ...)
-- status enum: running | done | interrupted | failed | cancelled
```

V2 candidate: tambah kolom `resume_from_table TEXT NULL`, `resume_from_offset INT NULL`, `parent_session_id INT NULL` (forward-compatible — absent di V1 row, tidak break existing query).

### Runner behavior (`internal/sync/runner.go`)

- Setiap Session start → traversal Selection Set dari index 0 dalam topological order (parent dulu).
- Tidak ada lookup "session terakhir untuk profile ini" → Session baru independen sepenuhnya dari Session sebelumnya.
- Idempotensi dijamin di layer UPSERT (`INSERT ... ON DUPLICATE KEY UPDATE`) per ADR-0013. Baris yang sudah ada di Destination dari Session sebelumnya:
  - Match Key cocok → UPDATE dengan nilai Source saat ini. Kalau Source tidak berubah, UPDATE no-op semantik (nilai sama). Kalau Source berubah, Destination ter-overwrite — Source-wins, sesuai kontrak.
  - Match Key tidak cocok lagi (Source hapus baris itu sejak Session lalu) → tidak ter-touch di Session ini. **Catatan**: V1 tidak punya delete propagation — baris yatim di Destination tetap ada (lihat "V2 candidate").

### UI affordance

- **Sync Session detail** untuk `interrupted` / `failed` / `cancelled` tampilkan summary "{processed} baris diproses, {failed} gagal" + tombol primer **"Mulai Sync Baru"** (bukan "Lanjutkan"). Tombol redirect ke flow Start Session standar dengan profile yang sama pre-selected.
- **Tidak ada** tombol "Lanjutkan dari titik berhenti". Tidak ada toggle "Skip tabel yang sudah selesai".
- Copy ramah di banner: "Sinkronisasi terhenti di tabel `orders` baris ke-12.500. Untuk melanjutkan, klik 'Mulai Sync Baru' — data yang sudah masuk Destination akan diperiksa ulang dengan nilai Source terbaru, baris yang sama tidak akan diduplikasi." → komunikasikan idempotensi tanpa istilah teknis.
- **Mapping Profile detail** tidak menampilkan badge "ada session terhenti" — Session adalah artifact eksekusi, bukan state Profile.

### Performance dampak fresh re-run

- Worst case (Session 1 selesai 95% dari 1 juta baris, Session 2 fresh): re-`SELECT *` + re-UPSERT 950.000 baris yang sebenarnya tidak berubah. Trade-off diterima sadar:
  - Source-wins UPSERT pada baris identik tetap eksekusi UPDATE statement (MariaDB tidak free-lunch detect "no change") — ada cost CPU+IO Destination. Tapi tidak ada cost konsistensi.
  - Network: re-fetch full table dari Source. Untuk dataset persona target (UMKM, biasanya <10 juta baris per tabel), latency tambahan dalam menit bukan jam.
- User yang punya dataset sangat besar (>10 juta baris) dan sering kena `interrupted` = signal kuat untuk V2 resume. V1 tidak optimasi untuk skenario ini.

### Interaksi dengan ADR sebelumnya

- **ADR-0001/0015 (Closure Advisor)**: Setiap Session re-introspect Source schema dan recompute closure (sudah jadi requirement compile-time saat Start). Session 2 tidak shortcut "pakai closure Session 1" — schema mungkin drift, dan re-introspect adalah safety net.
- **ADR-0008 (profile snapshot)**: Setiap Session freeze snapshot baru saat start. Session 2 punya `profile_snapshot_json` independen dari Session 1, sekalipun profile tidak berubah. Tidak ada sharing snapshot antar-session.
- **ADR-0009 (cancel = no rollback)**: Konsisten — cancelled Session meninggalkan baris di Destination, fresh re-run akan UPSERT ulang nilai Source saat ini di atas baris itu. User yang cancel karena "salah pilih profile" tetap harus manual cleanup (atau pakai profile berbeda yang Selection Set-nya tidak overlap).
- **ADR-0006 (schema drift pre-flight)**: Pre-flight jalan di setiap Session start. Drift yang muncul antara Session 1 dan Session 2 ter-catch normal, tidak ada path "skip preflight karena ini resume".
- **ADR-0013 (no AUTO_INCREMENT counter intervention)**: Re-run aman — UPSERT memakai PK eksplisit dari Source, tidak ada `LAST_INSERT_ID` reliance.

### Skenario edge yang user mungkin tanyakan

- **"Source `orders` saya sekarang punya 100 baris baru sejak Session 1 yang interrupted di tengah `orders`. Apakah baris baru ikut?"** → Ya. Session 2 fresh `SELECT *` → 100 baris baru ter-include + baris lama ter-UPSERT idempotent.
- **"Saya hapus baris di Source `customers` setelah Session 1. Session 2 akan hapus baris itu di Destination?"** → Tidak. V1 tidak punya delete propagation — Source-wins UPSERT hanya menulis, tidak menghapus. Baris yatim tetap ada di Destination. (V2 candidate: opt-in `delete_orphans_in_destination` per profile.)
- **"Session 1 kena `failed` karena schema drift. Saya fix Destination schema lalu klik Mulai Sync Baru. Apakah preflight jalan lagi?"** → Ya. Session 2 = fresh start, preflight re-introspect penuh.

### Test M4/M5

- **Idempotent re-run after `done`**: Session 1 sukses sync 1.000 baris. Session 2 dijalankan tanpa perubahan Source → Destination row count tetap 1.000, no duplicates, `rows_processed` di Session 2 = 1.000.
- **Re-run after `interrupted`**: Session 1 sync 500 dari 1.000 baris lalu connection drop → status `interrupted`. Session 2 fresh start → process 1.000 baris (500 yang sudah ada ter-UPDATE no-op semantik, 500 sisanya ter-INSERT). Final Destination row count = 1.000.
- **Re-run picks up new Source rows**: Session 1 sync 1.000 baris, Source tambah 100 baris baru. Session 2 → final Destination = 1.100.
- **Re-run with Source row deleted**: Session 1 sync 1.000 baris, Source delete 1 baris (PK=42). Session 2 → Destination tetap 1.000 baris (PK=42 yatim).
- **No "resume" UI affordance**: Session detail page untuk Session `interrupted` smoke test — assert tidak ada tombol/link dengan label "Lanjutkan" / "Resume".
- **Snapshot independence**: Session 1 snapshot vs Session 2 snapshot setelah profile edit di antara → kedua snapshot beda di `mapping_profiles.rules_json` field, sesuai snapshot per session.

### V2 candidate

- **Resume dari checkpoint per-tabel**: tambah `resume_from_table` + `resume_from_offset` di `sync_sessions`, runner consult kalau `parent_session_id` ada. Butuh konfirmasi user "Source tidak berubah sejak interrupt" sebelum resume aman — bisa via dialog "Cek perubahan Source" yang query `MAX(updated_at)` per tabel kalau audit column tersedia.
- **Delete propagation opt-in**: `mapping_profiles.delete_strategy` enum (`none` | `mark_orphan` | `hard_delete`). Mahal: butuh diff PK Source vs Destination di tiap tabel. V1 tidak ada use case eksplisit dari persona.
- **Auto-retry interrupted dengan exponential backoff**: untuk skenario flaky network. Cap retry count + UI visibility "Mencoba ulang #N..." supaya user tahu sedang terjadi.
- **Session chaining UI**: Session detail tampilkan link "Session sebelumnya untuk profile ini" — riwayat naratif tanpa formal resume semantics. Kosmetik, tidak mengubah runner behavior.
