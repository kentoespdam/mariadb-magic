# SSE reconnect: snapshot-on-connect, tanpa event replay

Saat client connect / reconnect ke `/api/sessions/{id}/events`, broker mengirim satu event `snapshot` (current counts + last N row failures dari `sync_logs`) sebagai message pertama, lalu lanjut live stream dari titik sekarang. Tidak ada ring buffer event di memory, tidak ada `last_event_seq` di skema, dan header `Last-Event-ID` dari `EventSource` diabaikan di V1. Source of truth untuk progress = kolom-kolom di `sync_sessions` yang di-update per chunk-commit; source of truth untuk row failures = `sync_logs`. SSE event = ephemeral notification, bukan event log.

## Considered Options

- **(A) No-replay, snapshot-on-connect** *(dipilih)* — re-derive state dari `sync_sessions` + `sync_logs` saat reconnect.
- **(B) Ring buffer in-memory + Last-Event-ID** — broker simpan 500 event terakhir per session, replay via `Last-Event-ID`. Ditolak: menambah memory pressure + seq wraparound bug surface untuk nilai marjinal; user yang refresh tab peduli kondisi *sekarang*, bukan event yang ke-miss.
- **(C) Persistent event log di `sync_events`** — setiap event ditulis ke SQLite, reconnect query by seq. Ditolak: overkill — app crash di tengah sync = session `interrupted` per ADR-0003 dan user rerun; replay event lama tidak relevan ke recovery flow.

## Consequences

- **`sync_sessions` skema** tambah kolom: `current_table TEXT`, `rows_processed INTEGER NOT NULL DEFAULT 0`, `rows_failed INTEGER NOT NULL DEFAULT 0`, `total_rows_estimated INTEGER NULL`. `last_event_seq` *tidak* ditambahkan. `total_rows_estimated` boleh NULL — kalau pre-pass `SELECT COUNT(*)` di-skip, progress bar indeterminate.
- **Update protocol per chunk**: `runner.go` setelah commit chunk wajib UPDATE `sync_sessions` SET counts dulu, *baru* publish event SSE. Urutannya penting supaya snapshot-on-connect tidak pernah lebih basi dari live event yang sudah disiarkan.
- **Broker tetap simple**: `map[sessionID][]chan Event`, tidak ada per-client cursor / buffer / seq counter. Cap channel size (e.g. 64) — slow client di-drop koneksinya, bukan bikin sender block.
- **Endpoint `GET /api/sessions/{id}/events`**: handshake = baca `sync_sessions` row + `SELECT ... FROM sync_logs WHERE session_id=? ORDER BY id DESC LIMIT 50`, kirim sebagai `event: snapshot\ndata: {...}\n\n`, lalu subscribe ke broker. `Last-Event-ID` header diabaikan.
- **Trade-off diterima**: SSE event `row_failed` yang drop di tengah jalan karena network blip tidak akan muncul di live feed UI — tapi tetap ke-log di `sync_logs`, accessible dari halaman Session Detail post-run. Ini cukup untuk persona non-IT yang fokus ke summary, bukan tail log realtime.
- **Test SSE broker dengan -race** (per CLAUDE.md) tetap wajib; cancel-mid-flight = client disconnect, broker prune channel — coba dengan slow consumer + producer fanout untuk verifikasi tidak ada goroutine leak.
