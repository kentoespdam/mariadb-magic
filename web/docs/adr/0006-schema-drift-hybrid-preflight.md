# Schema drift detection: hybrid pre-flight struktural + runtime type

Destination bisa berubah skemanya antara saat user simpan Mapping Profile dan saat klik Start (DBA tambah kolom, rename, narrow type). V1 mendeteksi drift dengan dua jalur komplementer: **(1) pre-flight struktural** — saat Start, runner re-introspect Destination, bandingkan dengan snapshot kolom di `mapping_profiles.selection_json`, klasifikasikan jadi Blocking / Auto-handled, hard-fail kalau Blocking. **(2) runtime type** — narrowing type yang lolos pre-flight (VARCHAR(100)→VARCHAR(20), INT→TINYINT) ditangani per-baris oleh classifier ADR-0003 lewat error code 1406/1264/1366. Soft-warn untuk type narrowing di pre-flight di-defer ke V2.

## Considered Options

- **(A) Pre-flight struktural saja** — diff column list, PK, table existence; hard-fail kalau apapun beda. Ditolak: type narrowing tidak terdeteksi sampai chunk pertama meledak (1406), padahal user sudah commit secara mental "sync sedang jalan".
- **(B) Runtime saja, semua via error classifier** — biarkan MariaDB yang teriak (1054 unknown column, 1146 table missing). Ditolak: kolom hilang = *seluruh* tabel gagal dengan error sama berulang ribuan kali; pesan error tingkat row tidak komunikatif untuk masalah tingkat skema; tidak ada gunanya start sync untuk hard-fail.
- **(C) Hybrid: pre-flight struktural + runtime type via classifier** *(dipilih)*.

## Consequences

- **Snapshot di `mapping_profiles.selection_json`** harus simpan, per tabel: `{table, role, columns: [{name, is_pk, is_paired}]}`. Tidak menyimpan tipe / precision — itu ranah runtime classifier; menyimpan tipe akan menggandakan permukaan drift (ribuan permutasi VARCHAR length) untuk benefit minimal di V1.
- **`internal/sync/preflight.go` baru** (split dari `runner.go` supaya tetap ≤120 baris): re-introspect Destination, hitung diff terhadap `selection_json`, kembalikan `DriftReport{Blocking, AutoHandled}`. Dipanggil setelah Closure Advisor compile-time-pass kedua tapi sebelum chunk loop.
- **Klasifikasi drift**:
  - *Blocking*: paired column missing, PK column missing atau berubah, table missing, kolom baru NOT NULL tanpa DEFAULT.
  - *Auto-handled*: kolom baru NULLABLE → di-skip dari INSERT list (Destination pakai NULL implisit). Kolom baru dengan DEFAULT → di-skip dari INSERT list (Destination pakai DEFAULT). Type widened (VARCHAR(50)→100, INT→BIGINT) → diam, runtime aman.
  - *Soft-warn (V2, defer)*: type narrowed (VARCHAR(100)→20, INT→SMALLINT). V1 strategi: lolos pre-flight, dideteksi runtime per-row via 1406/1264/1366 → masuk `sync_logs` per ADR-0003.
- **Format pesan drift** masuk `internal/sync/errors.go`: fungsi `ToFriendlyDrift(diff) (userMsg, technicalMsg)` — beda jalur dari `ToFriendly` row-error formatter karena konteks pre-flight (satu pesan untuk seluruh sync, bukan per baris). UI menampilkan di banner pre-start, bukan di Sync Log.
- **Pre-flight tidak bypass-able di V1**: tidak ada flag "force start". User yang tidak setuju dengan diagnosis pre-flight harus edit Mapping Profile (re-pair kolom, exclude tabel) lalu Start ulang.
- **Test matrix M4/M5**: paired column dropped, PK column renamed, kolom baru nullable (auto-skip), kolom baru NOT NULL no-default (blocking), kolom baru NOT NULL with DEFAULT (auto-skip), VARCHAR widened (silent), VARCHAR narrowed (lolos pre-flight, ketangkap runtime → 1406 → row log).
- **Race risk**: DBA mengubah skema *antara* pre-flight pass dan chunk pertama. Tidak ditangani secara eksplisit di V1; akan muncul sebagai runtime error 1054/1146 → session `failed` (bukan `interrupted`) per ADR-0003 karena bukan transient. Mitigasi: pre-flight dijalankan sedekat mungkin dengan chunk loop pertama, bukan di waktu user klik Start UI.
