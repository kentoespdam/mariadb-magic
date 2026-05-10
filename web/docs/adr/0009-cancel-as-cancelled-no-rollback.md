# Cancel = status `cancelled` baru, tanpa rollback

User yang klik **Cancel** di tengah Sync Session akan menghentikan eksekusi di chunk boundary berikutnya, dan session akan ditandai dengan status baru `cancelled` (bukan `interrupted` dan bukan `failed`). Baris yang sudah ter-commit di Destination **tidak di-rollback** — itu konsekuensi langsung dari **Source-wins UPSERT** + chunk autocommit per ADR-0003. Status enum `sync_sessions.status` di-extend dari 4 ke 5 nilai: `running | done | interrupted | failed | cancelled`. Cancel adalah aksi user-intent yang eksplisit, berbeda semantiknya dari `interrupted` (system event: koneksi drop / app crash) dan `failed` (hard error skema atau classifier non-transient).

## Considered Options

- **(A) Cancel = `interrupted`** (reuse status existing). Ditolak: campur-aduk semantik aksi user (intent: stop) dengan event sistem (transient: connection drop). UI tidak bisa kasih pesan tepat — "rerun direkomendasikan" cocok untuk drop tapi salah untuk cancel intentional. Persona non-IT akan bingung.
- **(B) Cancel = `cancelled`, tanpa rollback offer** *(dipilih)*.
- **(C) Cancel = `cancelled` + dialog rollback opsional** ("Stop saja" / "Stop dan hapus baris yang ter-insert"). Ditolak: (1) UPSERT yang menimpa baris existing tidak bisa di-undo tanpa snapshot nilai sebelumnya — rollback "delete inserted rows" hanya separuh-jujur (insert bisa, overwrite tidak); (2) per-session PK tracking menambah skema + I/O signifikan untuk fitur edge; (3) janji rollback yang tidak utuh lebih berbahaya daripada tidak ada janji sama sekali.

## Consequences

- **Skema**: `sync_sessions.status` enum di-extend ke `running | done | interrupted | failed | cancelled`. Migrasi additive — tidak ada session existing yang perlu di-rewrite.
- **Endpoint baru `POST /api/sessions/{id}/cancel`**: idempotent. Pertama kali dipanggil → set `context.Done()` di runner via cancel function tersimpan di in-memory map session aktif. Panggilan kedua atau pada session yang sudah selesai → 200 dengan body `{status: <terminal>}`, no-op.
- **Cooperative cancel di chunk boundary** (per ADR-0003): runner cek `ctx.Err()` *setelah* commit chunk, *sebelum* fetch chunk berikutnya. Tidak ada kill mid-statement; chunk yang sedang jalan diselesaikan agar autocommit tidak meninggalkan transaksi setengah.
- **SSE event baru `event: cancelled`**: payload `{processed, failed, cancelled_at}`. Dipublish setelah runner exit cleanly dan `sync_sessions.status` di-set ke `cancelled`. Browser tab yang mendengarkan akan transisi dari spinner "Membatalkan…" → final state.
- **UI Sync Session detail untuk `cancelled`**: badge khas (warna netral, bukan merah seperti `failed`), pesan "Sync dibatalkan oleh user. {processed} baris sudah masuk Destination dan **tidak akan dihapus otomatis**. Untuk membersihkan, hapus manual via SQL atau pakai profile lain dengan Selection Set yang sesuai." Tidak ada tombol "rollback" di V1.
- **Antara klik Cancel dan event `cancelled`**: UI menampilkan spinner "Membatalkan…" dengan disabled button. Worst-case latensi = sisa waktu chunk yang sedang jalan (≤beberapa detik untuk chunk 500–1000 baris). Tidak ada hard timeout; kalau chunk macet karena lock Destination, session tetap di state `running` sampai timeout query MariaDB native (ranah `failed`, bukan `cancelled`).
- **Race**: dua user di dua tab klik Cancel bersamaan → kedua call masuk handler, tapi `context.Cancel()` idempotent, hanya satu yang efektif. Map session aktif di-protect mutex.
- **Dibedakan dari ADR-0003**: ADR-0003 menetapkan kontrak chunk-atomicity + classifier untuk error otomatis. ADR ini menetapkan semantik aksi user-initiated. Keduanya share infrastruktur cooperative-cancel tapi maksudnya beda — atomicity vs intent.
- **V2 candidate**: rollback opsional dengan PK tracking per session. Disimpan di tabel `sync_session_writes (session_id, table, pk_json)` saat `processed`-counter naik, di-replay sebagai DELETE saat user pilih rollback. Tidak akan undo overwrite, hanya hapus insert baru. UI harus eksplisit menulis batas garansi ini.
- **Test M3/M5**: cancel sebelum chunk pertama (status langsung `cancelled`, processed=0), cancel di tengah (processed > 0, sisa chunk tidak dijalankan), cancel pada session yang sudah `done` (no-op idempotent), cancel dua kali berturut-turut (idempotent), SSE `cancelled` event diterima oleh subscriber aktif.
