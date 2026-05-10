# Connection test: explicit "Test Koneksi" + "Save" split, persisted last-test status

Form Tambah/Edit Koneksi memakai **dua tombol independen**: "Test Koneksi" (handshake non-destruktif, tidak menyentuh DB internal) dan "Simpan" (persist ke `connections` apa adanya — tidak memvalidasi handshake). Hasil test terakhir disimpan di kolom baru `last_test_at`, `last_test_status` (`untested` | `ok` | `failed`), `last_test_error_friendly` agar daftar koneksi bisa menampilkan badge status proaktif tanpa melakukan re-test setiap render. Mapping Profile Builder menampilkan banner kalau Source/Destination yang dipilih ber-`last_test_status != 'ok'` atau `last_test_at` lebih lama dari 24 jam (drift threshold) — user disarankan re-test sebelum lanjut, **tidak diblok**.

## Considered Options

- **(A) Test on save blocking** — handshake `Ping + SELECT 1 + USE db_name` dijalankan otomatis di submit; gagal = no save. Ditolak: (1) handshake di network lambat (DB remote, VPN) bisa ≥5 detik, blocking submit terasa hang; (2) user yang typo password tidak bisa cepat iterate (form harus disubmit ulang); (3) tidak menjawab kebutuhan "verifikasi belakangan" — koneksi yang dulu OK sekarang mati, save-time test tidak membantu; (4) persona non-IT tidak punya mental model "kenapa Save saya gagal kalau saya cuma mau simpan dulu".
- **(B) Test on save non-blocking** — save langsung, background goroutine handshake, status badge di list. Ditolak: ambigu — user submit form, badge "testing..." muncul tanpa user explicit minta, hasil bisa muncul beberapa detik kemudian saat user sudah pindah halaman. UX confusing dibanding intent eksplisit.
- **(C) Explicit Test + Save split, hasil dipersist** *(dipilih)*. Test dan Save jadi dua intent independen. User boleh test berkali-kali tanpa save, atau save tanpa test (mis. hanya mengubah label). Hasil test terakhir tetap actionable di multi-surface (list koneksi, profile builder).
- **(D) Continuous health check** — goroutine periodik ping semua koneksi, badge live. Ditolak: over-engineering untuk desktop app single-user; menambah noise log + traffic ke Source produksi yang tidak perlu; tidak menyelesaikan "test sebelum pakai pertama kali" (baru jalan setelah save).

## Consequences

### Skema (`internal/db/migrations/000X_connections_test.sql`)

```sql
ALTER TABLE connections ADD COLUMN last_test_at TIMESTAMP NULL;
ALTER TABLE connections ADD COLUMN last_test_status TEXT NOT NULL DEFAULT 'untested'
    CHECK (last_test_status IN ('untested','ok','failed'));
ALTER TABLE connections ADD COLUMN last_test_error_friendly TEXT NULL;
```

- Default `untested` untuk row baru + row existing saat migrasi.
- `last_test_error_friendly` hanya berisi pesan ramah hasil `ToFriendlyHandshake(err)` — tidak menyimpan technical message untuk hindari leak credential di error log dump.

### Endpoint

- **`POST /api/connections/test`** (body: full form payload, **tidak** butuh `id`) — handshake-only, return `{status: 'ok' | 'failed', error_friendly?: string}`. Tidak menyentuh DB internal. Dipakai sebelum save (form belum committed) maupun setelah save (re-test dari list).
- **`POST /api/connections/{id}/test`** — variant untuk koneksi yang sudah tersimpan; handshake pakai credential terdekrip dari row, **dan** update `last_test_*` columns dalam transaksi.
- **`POST /api/connections`** dan **`PUT /api/connections/{id}`** — save apa adanya, set `last_test_status = 'untested'` saat field credential berubah (host/port/user/password/db_name) — invalidasi cache test lama. Save yang hanya mengubah label tidak reset status.

### Handshake sequence

```go
// internal/mariadb/handshake.go
func Test(ctx context.Context, cfg ConnConfig) error {
    db, err := sql.Open("mysql", dsn(cfg))                 // 1. parse DSN
    if err != nil { return err }
    defer db.Close()
    pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()
    if err := db.PingContext(pingCtx); err != nil { return err }   // 2. TCP + auth
    if _, err := db.ExecContext(pingCtx, "USE `"+cfg.Database+"`"); err != nil { return err } // 3. db ada
    var one int
    if err := db.QueryRowContext(pingCtx, "SELECT 1").Scan(&one); err != nil { return err }   // 4. query path
    return nil
}
```

- Timeout 5 detik untuk masing-masing operasi; total worst-case ~15 detik. UI tampil spinner di tombol Test.
- Tidak menjalankan `SHOW TABLES` atau introspeksi — itu konsumsi privilege berbeda; handshake fokus pada "kredensial valid + database accessible".

### `ToFriendlyHandshake` — mapping pesan ramah

| MariaDB code / driver error | Pesan ramah Bahasa Indonesia |
|------|------|
| 1045 (Access denied) | "Username atau password salah, atau user tidak punya izin masuk ke database ini." |
| 1049 (Unknown database) | "Database `{name}` tidak ditemukan di server. Periksa ejaan nama database." |
| 1044 (Access denied for db) | "User `{user}` tidak punya izin akses database `{name}`. Hubungi admin database." |
| 2002 (driver: timeout dial) | "Server tidak merespons dalam 5 detik. Periksa alamat host dan koneksi jaringan." |
| 2003 (Can't connect) | "Tidak bisa terhubung ke server di `{host}:{port}`. Periksa apakah server menyala dan port terbuka." |
| 2005 (Unknown host) | "Alamat host `{host}` tidak dikenal. Periksa ejaan dan DNS." |
| Lainnya | "Gagal terhubung: {sanitized message}." Sanitisasi = strip credential pattern. |

- Pesan **tidak boleh** menyebut password atau memuat full DSN — hindari leak ke `last_test_error_friendly` yang ter-render di UI list.
- Code 2006/2013 tidak relevan di handshake (itu mid-query). Code 1862 (password expired) → "Password user `{user}` sudah expired di server, perlu di-reset oleh admin."

### UI affordance

- **Form Tambah/Edit**: dua tombol berdampingan, "Test Koneksi" (sekunder) di kiri, "Simpan" (primer) di kanan. Hasil test live: panel hijau "Berhasil terhubung" / merah "{pesan ramah}", **tidak** auto-trigger save.
- **List Koneksi**: badge per row — `Belum dites` (abu-abu, untested), `OK` (hijau, ok, dengan tooltip "Tes terakhir: 2 jam lalu"), `Gagal` (merah, failed, tooltip pesan ramah). Tombol "Test Ulang" inline.
- **Mapping Profile Builder header**: kalau Source atau Destination yang dipilih `last_test_status = 'failed'` → banner kuning "Koneksi {label} terakhir gagal dites. [Test ulang]". Kalau `last_test_at` lebih lama dari 24 jam *atau* `untested` → banner abu-abu "Koneksi {label} belum dites baru-baru ini. [Test sekarang]". **Tidak memblok** save profile maupun start session — keputusan akhir di tangan user. Preflight saat Start tetap akan menangkap kalau handshake gagal di production load.
- **24 jam threshold**: bukan hard rule — heuristik berdasar pengamatan UMKM (kredensial DB shared kadang di-rotate harian oleh hosting provider). Tidak dikonfigurasi di V1; hard-coded.

### Interaksi dengan ADR sebelumnya

- **ADR-0008/0014**: profile snapshot tetap memuat `source_connection_id`/`destination_connection_id` (bukan `last_test_status`). Snapshot tidak peduli status test — runner pakai credential live saat eksekusi.
- **ADR-0011 (credential encryption)**: handshake yang menyimpan ke `last_test_*` memakai credential yang sama dengan persisted row (sudah terdekrip via `KeyProvider`). Test pre-save (endpoint `POST /api/connections/test`) memakai payload form mentah — credential plaintext hanya hidup di memori request handler, tidak pernah di-log.
- **ADR-0010 (capacity retention)**: kolom test status tidak ikut retention — `connections` bukan log table, tidak dibatasi capacity.

### Test M2

- Save koneksi tanpa test → row tersimpan, `last_test_status = 'untested'`.
- Test endpoint dengan password salah → `failed`, pesan ramah "Username atau password salah...".
- Test endpoint dengan database tidak ada → `failed`, pesan ramah "Database `{name}` tidak ditemukan...".
- Test endpoint dengan host tidak reachable + timeout 5 detik → `failed`, pesan ramah "Tidak bisa terhubung..." dalam ≤6 detik wall-clock.
- Test sukses → `last_test_status = 'ok'`, `last_test_at` ter-update, `last_test_error_friendly = NULL`.
- Edit row hanya field label → `last_test_status` tidak reset.
- Edit row field credential (host/user/password/db_name) → `last_test_status` reset ke `untested`.
- Banner di Profile Builder muncul untuk koneksi `failed` dan `untested`/`>24h`; tidak muncul untuk `ok` dengan `last_test_at` ≤24h.
- `ToFriendlyHandshake` tidak memuat password substring untuk skenario manapun (test sanity dengan password mengandung karakter khusus).

### V2 candidate

- Threshold drift "24 jam" jadi setting per-koneksi (mis. credential rotation policy hosting tertentu beda).
- Auto re-test koneksi sebelum start session (toggle Settings) — saat ini tidak ada karena Preflight sudah catch handshake failure di chunk pertama.
- Tampilkan `last_test_at` relative time live (TanStack Query auto-refresh) — V1 cukup format absolut + tooltip.
