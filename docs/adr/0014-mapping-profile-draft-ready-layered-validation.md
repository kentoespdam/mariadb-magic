# Mapping Profile lifecycle: draft/ready states with layered validation

`mapping_profiles` punya kolom `status` dengan dua nilai: `draft` (work-in-progress, boleh ada Column Pairing yang belum di-resolve) dan `ready` (siap dipakai Sync Session). Validasi dipisah ke **dua layer**: (1) **Builder-time** memvalidasi *struktural impossibilities* (PK belum di-pair, "Kosongkan/NULL" / "Lewati" pada kolom NOT NULL tanpa DEFAULT, Rule pada kolom PK) — error inline di UI, blocking transisi `draft → ready`; (2) **Preflight** (saat Start) fokus pada *schema drift* dan *runtime concerns* — diff Destination introspection vs `selection_json` snapshot. Sync Session hanya boleh start kalau profile berstatus `ready`. Save permisif terhadap `draft` (user boleh tinggal kerja setengah jadi), tapi `ready` punya kontrak ketat.

## Considered Options

- **(A) Single chokepoint di Preflight**, save selalu permisif. Ditolak: persona non-IT klik Start, dapat error wall-of-text dari Preflight tentang 12 kolom belum di-pair, frustrasi tinggi. Builder tahu *saat user pilih* "Lewati" pada kolom NOT NULL no-default itu structurally impossible — feedback langsung di kolom itu jauh lebih actionable. Single chokepoint juga mencampur "kerjaan kamu belum selesai" (user error) dengan "skema Destination berubah sejak save" (environment drift), padahal akar masalahnya berbeda dan resolusinya berbeda.
- **(B) Layered: Builder structural + Preflight drift, dengan `status` `draft`/`ready`** *(dipilih)*.
- **(C) Layered tanpa `status`** — simpan profile selalu, Sync Session start panggil validator structural+drift sebelum runner. Ditolak: tanpa `status`, UI tidak punya cara cepat tampilkan "profile siap dipakai" badge — harus jalankan validator full setiap render daftar profile. Dengan `status` jadi field denormalisasi murah yang di-update saat save sukses lewat layer 1.
- **(D) Tiga state** (`draft` / `ready` / `archived`). Ditolak V1: archived tidak punya use case konkret yang dijustifikasi persona target — pemakaian seharian = create + sync + edit. V2 bisa tambahkan additif tanpa breaking change.

## Consequences

### Skema

- **`mapping_profiles.status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready'))`**.
- Profile baru dibuat = `draft`. Naik ke `ready` lewat layer 1 validator yang lulus.
- Edit profile `ready` yang merusak invarian (mis. ubah Column Pairing PK ke "Lewati") → otomatis turun ke `draft` di transaksi save. UI tampil banner "Profile turun ke status draft karena ada perubahan yang perlu diselesaikan".
- Selection Set (`selection_json`) di-freeze hanya saat `draft → ready`; `draft → draft` save tidak menjalankan Closure Advisor (terlalu mahal untuk WIP). Konsekuensi: `selection_json` boleh kosong atau stale di profile `draft` — tidak boleh dipakai sebagai source of truth sampai `ready`.

### Layer 1: Builder-time validator (`internal/repo/mapping_profiles.go` + UI)

Aturan structural impossibility (blocking `draft → ready`, ditampilkan inline di builder):

1. **PK Destination wajib di-pair ke kolom Source** (bukan Constant/NULL/Default/Skip). Pesan: "Kolom kunci wajib mengambil nilai dari Source — pilih salah satu kolom Source di sini." Sumber: ADR di Match Key (CONTEXT.md), PK = identitas.
2. **PK Destination tidak boleh punya Rule**. Pesan: "Kolom kunci tidak bisa ditransformasi — hapus aturan transformasi di kolom ini." Sumber: ADR-0012.
3. **Kolom NOT NULL tanpa DEFAULT tidak boleh "Kosongkan/NULL"**. Pesan: "Kolom ini wajib diisi di Destination — pilih kolom Source atau Konstanta sebagai gantinya."
4. **Kolom NOT NULL tanpa DEFAULT tidak boleh "Lewati"**. Pesan sama seperti (3) plus catatan "Lewati hanya boleh untuk kolom yang punya DEFAULT atau boleh NULL."
5. **Kolom NOT NULL dengan DEFAULT boleh "Lewati"** (DB akan isi sendiri) dan boleh "Default DB". Tidak ada warning.
6. **Closure Advisor expand → dialog konfirmasi wajib**, shrink → info ringan. Konfirmasi adalah bagian dari transisi `draft → ready` (post-Closure-Advisor, pre-write `selection_json`).
7. **Cross-profile collision** (overlap Selection Set dengan profile `ready` lain ber-`destination_id` sama, post-Closure-Advisor): hard-fail di transisi `draft → ready` — `ToFriendlyCollision`. Profile lain yang masih `draft` tidak dihitung sebagai konflik (belum berkomitmen).

UI counter "X dari Y kolom belum siap" di header tab Mapping Builder agregat aturan 1–4. Tombol "Tandai siap dipakai" disabled sampai counter = 0.

### Layer 2: Preflight (`internal/sync/preflight.go`, dijalankan saat klik Start)

Asumsi: profile sudah `ready` (gate-checked di handler `POST /api/sessions`). Preflight fokus pada hal yang *tidak bisa* divalidasi saat save:

- **Re-introspect Destination** dan diff terhadap `selection_json` snapshot (per ADR drift detection di CONTEXT.md):
  - *Blocking*: paired column missing, PK column missing/berubah, table missing, kolom baru NOT NULL tanpa DEFAULT.
  - *Auto-handled* (skip dari INSERT list): kolom baru nullable, kolom baru ber-DEFAULT, type widened.
  - *Type narrowed*: tidak ditangkap pre-flight, lewat runtime 1406/1264/1366.
- **Re-introspect Source** ringan: pastikan tabel + kolom yang di-`from`-pair masih ada. Hilang → blocking dengan pesan menunjuk profile harus di-edit (turun ke `draft`).
- **Tidak mengulang aturan 1–4 layer 1**: kalau profile `ready`, layer 1 sudah lulus saat save terakhir; kalau ternyata invariant rusak (mis. user edit `selection_json` manual via SQL), itu bug — pesan generik "Profile rusak, edit ulang Mapping" + auto-turun `draft`.

### Eksekusi sync

- Runner hanya menerima `session_id` yang `profile_snapshot_json`-nya bersumber dari profile `ready`. Snapshot diambil saat session dibuat (ADR-0008), jadi Sync Session tetap konsisten meskipun profile turun ke `draft` mid-run setelah edit user (rerun mungkin tidak valid lagi, itu di-flag di Session Detail).
- Edit profile `ready` mid-running session: **tidak diblokir** (snapshot mengisolasi runner), tapi UI Mapping Builder tampil banner "Sync Session aktif memakai versi profile sebelumnya, perubahan baru akan dipakai sync berikutnya".

### UI affordance

- **Daftar Mapping Profile**: badge `Draft` (abu-abu) atau `Siap` (hijau muda). Profile `draft` tidak punya tombol "Mulai Sync" — diganti tombol "Lanjutkan edit".
- **Builder header**: progress "X dari Y kolom siap" + tombol final "Tandai siap dipakai" (transisi `draft → ready`). Tombol disabled = tooltip menjelaskan kolom mana yang belum siap.
- **Edit profile `ready` yang merusak invarian**: dialog "Perubahan ini akan menurunkan profile ke status Draft. Lanjutkan?" sebelum save.
- **Status di Session Detail**: link ke profile + badge status saat ini (kalau ≠ snapshot hash, tambah "profile sudah berubah" — sejalan dengan ADR-0008).

### Pengaruh ke ADR sebelumnya

- **ADR-0010 (cross-profile collision)**: query overlap difilter ke profile lain yang `status = 'ready'`. Profile `draft` tidak diperhitungkan (belum committed; bisa overlap selama belum di-`ready`-kan).
- **ADR-0008 (profile snapshot)**: snapshot diambil saat session dibuat dari profile `ready`; `draft` tidak bisa jadi snapshot source. Properti "snapshot membekukan state" tidak berubah.
- **ADR-0012 (Rule DSL)**: validator DSL (whitelist + schema) tetap dipanggil saat save baik `draft` maupun `ready` — invalid DSL ≠ unfinished work, itu user error yang harus diperbaiki segera.

### Test M3/M5

- Save profile dengan PK belum di-pair → `status` tetap `draft`, error inline di kolom PK.
- Save profile dengan "Kosongkan/NULL" pada kolom NOT NULL no-default → `status` tetap `draft`, error inline.
- Save profile dengan "Lewati" pada kolom NOT NULL ber-DEFAULT → boleh `ready`.
- Edit profile `ready`: ubah pairing PK ke "Lewati" → confirm dialog, save sukses, `status` turun ke `draft`.
- `POST /api/sessions` dengan `profile_id` ber-`status='draft'` → 400 dengan pesan ramah "Profile belum siap dipakai, lengkapi pengaturan kolom dulu."
- Cross-profile collision: profile A `ready`, profile B `draft` overlap selection → save B ke `ready` gagal; sementara B masih `draft` save tidak menyentuh validator collision.
- Preflight blocking case: profile `ready`, lalu Destination drop kolom yang di-pair → klik Start → Preflight fail dengan `ToFriendlyDrift`, status profile tidak otomatis turun (drift = environment, bukan user error; user diarahkan untuk re-introspect/save ulang).

### V2 candidate

- State `archived` untuk profile yang sudah tidak dipakai tapi sayang dihapus (referensi historical). Butuh UI tab "Arsip" + filter list.
- Auto-promote `draft → ready` saat semua aturan layer 1 lulus tanpa user klik. Ditolak V1: ambiguity "kapan tepatnya naik?" + risiko user salah anggap profile siap padahal belum review final. Eksplisit lebih aman.
