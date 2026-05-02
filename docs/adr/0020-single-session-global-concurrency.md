# Concurrent Sync Sessions: single-session global di V1

V1 membatasi **maksimal satu Sync Session berstatus `running` di seluruh aplikasi** pada satu waktu. Bukan per-Profile, bukan per-Destination, bukan per-Source — global. Implementasi via mutex/semaphore di `internal/sync/runner.go` dan check di `POST /api/sessions` yang return `409 Conflict` ramah kalau ada session lain sedang jalan. UI tombol "Mulai Sync" di profile lain disabled dengan tooltip menyebut nama profile yang sedang aktif. Tujuan: persona target (UMKM non-IT) tidak perlu memikirkan resource contention, dua koneksi MariaDB paralel ke Source produksi, atau race antar runner yang share state kecil tapi non-trivial (SSE broker, retention trigger, log writer).

## Considered Options

- **(A) Single-session global** *(dipilih)*. Hanya satu Sync Session boleh `running` di seluruh aplikasi. Implementasi: `sync.Mutex` (atau `chan struct{}` cap 1) di runner package-level + query `SELECT 1 FROM sync_sessions WHERE status = 'running' LIMIT 1` di API handler sebelum insert row baru. Kalau ada → 409 ramah "Sinkronisasi '{nama profile aktif}' sedang berjalan. Tunggu selesai atau klik Batalkan, lalu coba lagi." UI Mapping Profile list disabled tombol "Mulai Sync" untuk semua profile selain yang aktif, dengan tooltip serupa.
- **(B) Single-session per Profile** — paralel kalau Profile beda. Ditolak: cross-profile collision sudah hard-fail di save (lihat operational note "Cross-profile collision" + ADR-0007), jadi dua profile yang valid bersamaan punya Selection Set disjoint per Destination. Tapi dua profile bisa share Source — paralel = dua chunk SELECT ke Source produksi yang sama, beban Source 2× tanpa user awareness. Persona UMKM tidak akan reasoning "berapa connection pool Source saya boleh tambah". Selain itu paralel tetap perlu locking sub-system (SSE broker, retention) yang menambah complexity tanpa value V1.
- **(C) Single-session per Destination** — paralel kalau Destination beda. Ditolak: tidak menambah safety baru di atas (B) untuk persona target (Source contention tetap sama; cross-profile collision sudah dicegah save-time). Permissiveness extra (paralel ke Destination berbeda) hanya berguna kalau user sengaja punya banyak Destination terpisah dan ingin throughput max — bukan use case persona UMKM yang dijanjikan PRD. Menambah surface untuk bug subtle (mis. retention trigger fired oleh dua runner bersamaan → race di `incremental_vacuum`).
- **(D) Bebas paralel — runner spawn goroutine per session**. Ditolak: implikasi resource (N×2 koneksi MariaDB, N runner goroutine, N SSE broker subscriber set) tidak sebanding dengan persona target. Tidak ada cap natural ("klik Mulai 10×" → 10 session paralel) sehingga butuh cap eksplisit yang akhirnya tetap = single-session-with-different-N. Dataset target persona kecil-menengah; throughput tunggal sekuensial sudah cukup.

## Consequences

### Implementasi (`internal/sync/runner.go` + `internal/api/sessions.go`)

```go
// internal/sync/runner.go
package sync

import "sync"

// runningSessionLock memastikan hanya satu Sync Session aktif di proses ini.
var runningSessionLock sync.Mutex

// TryAcquire returns false kalau ada session lain sedang running.
// API handler boleh decide apa yang dilakukan (mis. return 409 ramah).
func TryAcquire() bool {
    return runningSessionLockTryLock()
}

func Release() {
    runningSessionLock.Unlock()
}
```

- Mutex package-level cukup untuk single-binary (tidak ada multi-process di V1).
- API handler `POST /api/sessions`:
  1. Validate profile `ready`, dll (per ADR-0014).
  2. `repo.SyncSessions.AnyRunning(ctx)` — query SQLite `SELECT id, profile_id FROM sync_sessions WHERE status = 'running' LIMIT 1`. Kalau ada → return 409 dengan body `{error_friendly, conflict_session_id, conflict_profile_name}`.
  3. Kalau bersih: insert row session baru status `running`, lalu `runner.Start(sessionID)` yang akan `runningSessionLock.Lock()` (akan blocking kalau runner pernah crash dan release tidak terpanggil — guard via `defer Release()` + check di startup).
- Startup recovery (`internal/db/bootstrap.go`): row `status='running'` yang tertinggal dari proses sebelumnya (crash/SIGKILL) → mark `interrupted` saat boot **sebelum** runner start menerima request. Ini juga membersihkan kondisi yang bikin handler 409 untuk session zombie.

### UI affordance

- **Mapping Profile list**: tombol "Mulai Sync" per row. Kalau ada session running di app:
  - Row pemilik session aktif → tombol berubah jadi "Sedang berjalan…" disabled + link ke Session detail.
  - Row lain → tombol "Mulai Sync" disabled, tooltip "Sinkronisasi '{nama profile aktif}' sedang berjalan. Tunggu selesai atau batalkan dulu."
- **Header global**: kalau ada session running, mini badge "1 sync berjalan" di top bar (klik → Session detail). Bukan toast — toast cocok untuk transient event, badge cocok untuk persistent state.
- **Dashboard**: card "Sync Sessions terbaru" (post-onboarding) menyorot row running di paling atas dengan badge animasi ringan (dot + "Berjalan"). `prefers-reduced-motion` → drop animasi, badge static.

### Error response (`POST /api/sessions` 409)

```json
{
  "error": "concurrent_session",
  "error_friendly": "Sinkronisasi 'Laporan Penjualan Q1' sedang berjalan. Tunggu selesai atau klik Batalkan dulu, lalu coba lagi.",
  "conflict_session_id": 42,
  "conflict_profile_name": "Laporan Penjualan Q1"
}
```

- Frontend tangkap 409 → tampilkan dialog ramah dengan tombol "Lihat sync yang berjalan" (link ke Session detail) + "OK".
- Tidak ada auto-queue ("ditambahkan ke antrian, akan jalan setelah session aktif selesai") — menambah mental model + state machine baru tanpa value V1. User explicit retry setelah session aktif `done`/`cancelled`.

### Interaksi dengan ADR sebelumnya

- **ADR-0007 (cross-profile collision hard-fail di save)**: tetap berlaku — collision dicek save-time, bukan runtime. Single-session global menambah lapisan kedua "tidak ada paralel sama sekali" yang membuat collision-saat-runtime mustahil. Bukan duplikasi: ADR-0007 melindungi dari overlap data tulis (post-Sync Source-wins menimpa); ADR ini melindungi dari resource contention runtime.
- **ADR-0008 (profile snapshot)**: tidak ada perubahan — snapshot tetap di-freeze saat session start; single-session berarti tidak ada pertanyaan "snapshot session A vs session B mana yang menang".
- **ADR-0009 (cancel = cancelled, no rollback)**: cancel mid-run release lock setelah chunk in-flight commit (per operational note Cancel UX). User boleh start session baru segera setelah SSE `event: cancelled` diterima.
- **ADR-0019 (fresh-run-only)**: re-run setelah `interrupted`/`failed`/`cancelled` adalah session baru — single-session global memastikan re-run tidak memulai sebelum session lama selesai status update (nyaris instan, tapi check 409 melindungi race window).

### Skenario edge

- **"Saya klik Mulai Sync di Profile A, lalu klik Mulai Sync di Profile B sebelum A selesai"** → request B return 409 ramah. UI tombol B sebenarnya sudah disabled, jadi 409 hanya defensive untuk concurrent multi-tab atau race klik cepat.
- **"App crash saat session running, saya restart"** → bootstrap mark session `interrupted` → tombol Mulai Sync semua profile aktif kembali. Persona target tidak perlu manual intervene state.
- **"Saya buka dua tab browser, klik Mulai Sync di kedua tab nyaris bersamaan"** → request pertama acquire lock + insert row running; request kedua check 409 (atau acquire fail) → tab kedua tampil dialog ramah. Race window kecil (insert row + lock acquire bukan satu transaksi atom, tapi dilindungi mutex Go di proses tunggal).
- **"Saya cancel session aktif, lalu klik Mulai Sync di profile lain"** → setelah SSE `event: cancelled` diterima frontend (= status SQLite sudah `cancelled` + lock released), tombol baru aktif. Latency kecil (chunk in-flight selesai = ratusan ms–detik per Cancel UX).

### Test M4

- **Concurrent start 409**: session A `running`, `POST /api/sessions` untuk profile B → response 409 dengan `error_friendly` menyebut nama profile A. Row session B tidak ter-insert.
- **Mutex semantik**: dua goroutine paralel call `runner.Start(sessionID_A)` dan `runner.Start(sessionID_B)` → A acquire, B blocking sampai A release (dengan timeout test menengah, assert B tidak pernah jalan paralel dengan A).
- **Crash recovery**: insert row manual `status='running'` di SQLite, restart bootstrap → row jadi `interrupted` sebelum `POST /api/sessions` baru bisa di-handle. Test via `internal/db/bootstrap_test.go`.
- **UI disabled state**: smoke test web — saat session running di profile A, tombol Mulai Sync di profile B punya `aria-disabled=true` + tooltip text mengandung nama profile A.
- **Cancel + immediate restart**: cancel session A → tunggu SSE `event: cancelled` → POST sessions untuk profile A lagi → 200 (bukan 409), session baru ter-insert.

### V2 candidate

- **Per-Destination concurrency**: lock per `destination_connection_id`. Memungkinkan paralel ke Destination berbeda. Menarik kalau persona berkembang ke power user dengan multi-Destination, tapi butuh sub-system locking yang lebih halus (SSE broker per-session sudah; retention trigger butuh global lock atau debounce).
- **Auto-queue**: kalau user klik Mulai Sync di profile B saat A running, daftarkan B ke antrian + flash "ditambahkan ke antrian setelah A selesai". Butuh state baru `queued` di `sync_sessions.status` enum + UI affordance "antrian: 2 pending".
- **Session priority / pause-resume**: pause session aktif untuk start session prioritas tinggi, resume nanti. Implikasi besar (resume semantics — bertabrakan dengan ADR-0019 fresh-run-only); kemungkinan tidak masuk roadmap dekat.
- **Multi-process scenario**: kalau V3 introduce CLI/headless mode paralel dengan UI, mutex package-level tidak cukup — perlu file-lock atau row-level claim di SQLite. V1 single-process, tidak relevan.
