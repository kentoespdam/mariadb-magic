# Retention SQLite: capacity-based eviction + export log wajib

V1 menjaga ukuran SQLite internal dengan **batas kapasitas**, bukan batas waktu. `sync_logs` di-cap pada 500.000 row (high watermark) / 400.000 (low watermark); `sync_sessions` di-cap pada 10.000 / 9.000. Eviction memakai oldest-first via `id` ascending (autoincrement = proxy waktu, hemat index). `PRAGMA incremental_vacuum` wajib dijalankan setelah setiap eviction batch — tanpa itu file tidak shrink dan tujuan retensi gagal. Sebagai prasyarat eviction, **user harus punya jalan export log ke CSV** sebelum data hilang permanen — eviction yang menghapus tanpa escape hatch ekspor adalah data loss diam-diam.

## Considered Options

- **(A) Time-based 30-day rolling** (rekomendasi awal). Ditolak: motivasi sistem = "DB jangan bengkak", motivasi user = sama. Time-based memaksa user dengan frekuensi sync tinggi kehilangan riwayat sebelum DB-nya bahkan besar, sementara user dengan frekuensi rendah membiarkan DB tumbuh tanpa batas dalam window 30 hari (tidak akan tercapai). Tidak menyelaraskan motivasi.
- **(B) Asimetris time-based: logs 30 hari + sessions 180 hari**. Ditolak dengan alasan sama; lebih kompleks tanpa keuntungan.
- **(C) Capacity-based dengan high/low watermark + export log wajib** *(dipilih)*.
- **(D) Capacity-based tanpa export**. Ditolak: persona non-IT yang lihat log dihapus tanpa cara menyelamatkan akan kehilangan kepercayaan; CSV export trivial dan menutup kekhawatiran "data audit hilang".

## Consequences

### Skema & eviction

- **`sync_logs`**: high=500.000, low=400.000. Eviction: `DELETE FROM sync_logs WHERE id IN (SELECT id FROM sync_logs ORDER BY id ASC LIMIT N)` di mana `N = current - low`. Per-row, bukan per-session — session lama bisa kehilangan sebagian log dulu.
- **`sync_sessions`**: high=10.000, low=9.000. Eviction CASCADE ke `sync_logs` yang masih tersisa milik session itu.
- **`profile_snapshot_json`** ikut hilang saat session ter-evict — konsekuensi audit trail putus untuk session paling lama, sejalan dengan ADR-0008 (snapshot tidak abadi).
- **Tidak configurable V1**: cap di-hard-code. V2 bisa expose di `app_settings`.

### Trigger

- **Post-write**: setelah runner commit chunk yang menambah `rows_failed`, panggil `maint.EvictIfOver()` async (goroutine + recover). Cek murah (`SELECT COUNT(*)` dengan index PK = O(log n) atau O(1) di SQLite).
- **Periodic**: `time.Ticker` 1 jam di `internal/maint/retention.go`. Safety net kalau post-write missed (app restart, panic recovered).
- **Manual**: tombol "Bersihkan log lama sekarang" di Settings/Health page → force eviction ke low watermark. Tetap tunduk syarat export (lihat di bawah).
- **Tidak lazy-on-read**.

### `PRAGMA incremental_vacuum` (load-bearing, bukan optional)

- `auto_vacuum = INCREMENTAL` di-set saat DB pertama kali dibuat di M1 — **tidak bisa diubah retroaktif** tanpa rebuild seluruh DB. Migrasi awal harus include ini.
- `PRAGMA incremental_vacuum(N)` dipanggil setelah setiap eviction batch dengan `N` ≈ jumlah halaman yang baru saja jadi free.
- Tanpa langkah ini, eviction "berhasil" tapi file tetap besar — penyebab utama keluhan performa.

### Export log (komitmen yang menjadi prasyarat eviction)

- **Per-session CSV export**: di halaman Sync Session detail, tombol "Export log ke CSV". Streaming response `text/csv` dengan kolom `id, timestamp, table, pk_json, mariadb_code, technical_message, user_message`. Encoding UTF-8 BOM agar Excel di Windows tidak mis-parse.
- **Bulk pre-eviction export**: di Settings/Health page, tombol "Export semua log sebelum bersihkan". Workflow: download CSV dulu (browser save dialog) → setelah download komplet, baru tombol "Bersihkan" aktif. Tidak ada auto-export — user harus eksplisit klik save.
- **Tidak ada export otomatis**: V1 tidak menulis CSV ke disk tanpa user trigger. Persona non-IT lebih takut "file misterius muncul" daripada kehilangan log; eksplisit lebih baik.
- **Format JSON sebagai alternatif**: opsional di V2 kalau ada permintaan. CSV cukup untuk Excel persona target.

### UI Settings / Health page

- "Log entries: X / 500.000 (Y%)"
- "Sessions: X / 10.000"
- "Ukuran DB internal: X MB" (via `PRAGMA page_count * page_size`)
- Tombol "Export semua log" (CSV download)
- Tombol "Bersihkan log lama sekarang" (disabled sampai user klik export atau confirm "saya tidak butuh export")

### Test matrix

- Eviction trigger pada 499.999 row (no-op) vs 500.001 row (purge sampai 400.000).
- Post-eviction `COUNT(*) == low watermark`.
- `PRAGMA page_count` setelah `incremental_vacuum` < `page_count` sebelum vacuum.
- CASCADE: hapus session → log child terhapus.
- CSV export per-session round-trip (parse hasil, pastikan kolom + escaping benar untuk pesan multi-line).
- Manual eviction button blocked sampai export confirmation.
- Concurrent post-write trigger + periodic ticker tidak double-evict (mutex di `maint`).

### CLAUDE.md update

Baris "Retention test must cover the 29-day vs 31-day boundary" sudah obsolete — diganti "Eviction test must cover 499.999/500.001 watermark boundary + post-vacuum page_count reduction + export round-trip". Update wajib di milestone yang sama dengan implementasi.
