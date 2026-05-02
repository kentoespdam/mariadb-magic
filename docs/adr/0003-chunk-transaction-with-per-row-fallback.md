# Chunk-level transaction dengan fallback per-row + klasifikasi error infra/data

Kontrak atomicity Sync Session: per-tabel jadi boundary semantic (tabel-N selesai sebelum tabel-N+1 mulai), tapi tiap chunk 500–1000 baris adalah unit transaction independen. Chunk gagal karena error baris (data too long, FK violation, dll. — whitelist berdasar MariaDB error code) → rollback chunk → retry baris-per-baris dalam mini-trx → log fail ke `sync_logs` → lanjut. Chunk gagal karena error infra (koneksi putus, deadlock) → retry chunk dengan exponential backoff (3x), habis retry → session jadi `interrupted` (bukan `failed`), boundary tabel sebelumnya tetap commit, rerun aman karena UPSERT idempotent. User cancel = finish chunk berjalan, stop di boundary chunk berikutnya.

## Considered Options

- **(A) Per-session transaction** — seluruh session satu trx besar. Ditolak: lock contention dan transaction log meledak untuk laporan bulanan jutaan baris; bertabrakan dengan "graceful degradation saat koneksi terputus" PRD.
- **(B) Per-table transaction murni** — tiap tabel satu trx. Ditolak: tidak punya granularitas baris untuk Sync Log per-row yang diminta PRD.
- **(C) Per-chunk transaction murni tanpa fallback** — gagal chunk = log seluruh chunk sebagai fail. Ditolak: kehilangan baris valid yang berbeda chunk dengan baris bermasalah.
- **(D) Per-row INSERT** — lambat, tidak idiomatic untuk batch besar.
- **(E) Hybrid per-table boundary + per-chunk trx + per-row fallback** *(dipilih)*.

## Consequences

- **`sync_sessions.status` punya makna eksplisit**: `running | done | interrupted | failed`. `interrupted` = transient (rerun aman); `failed` = konfigurasi rusak (user fix profile dulu). Discriminator: error code MariaDB.
- **`sync_logs` schema** wajib punya: `error_code` (int), `error_message_technical`, `error_message_user_friendly`, `row_pk_json`, `table_name`, `session_id`, `created_at`.
- **`internal/sync/` butuh classifier error** (whitelist row-error codes vs infra). Lokasi: `internal/sync/recovery.go` — split dari `upsert.go` supaya tetap ≤120 baris.
- **Retry policy hardcode di V1**: 3 attempts, exponential backoff 1s → 2s → 4s. Diekspos sebagai konstanta, bukan config — kalau lapangan butuh tuning, V2 promosikan ke env var.
- **Cancel SSE** harus cooperative: runner cek context.Done() di boundary chunk, bukan tengah chunk. UPSERT mid-chunk yang sudah jalan harus selesai untuk integritas chunk-trx.
