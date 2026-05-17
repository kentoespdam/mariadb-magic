# Issue 13 — Fix connection test response key mismatch (status vs success)

## Masalah
Notifikasi "Koneksi gagal" muncul meskipun API mengembalikan status 200 OK dengan `{"status": "ok"}`. Hal ini disebabkan karena Frontend mengharapkan properti `success` (boolean), bukan `status` (string).

## Rencana Perbaikan
1. **Backend**: Ubah `internal/api/connections_extra.go` agar mengembalikan kunci `success` (boolean) untuk menyamakan dengan interface `TestResult` di Frontend.
   - `TestPreSave`: return `{"success": true}` saat berhasil.
   - `TestPostSave`: return `{"success": status == "ok", "error": friendly}`.
2. **Frontend Type**: Update `web/src/types/Connection.ts` agar `last_test_status` menggunakan nilai `ok` (bukan `success`) untuk selaras dengan DB CHECK constraint (`untested`, `ok`, `failed`) dan `domainStatus.ts`.
3. **Dokumentasi**: Update `CONTEXT.md` pada bagian **Connection test** untuk mencerminkan perubahan shape response ini.

## Acceptance Criteria
- Tombol "Test Koneksi" menampilkan notifikasi sukses saat backend mengembalikan 200 OK.
- Response API `/api/connections/test` dan `/api/connections/{id}/test` memiliki key `success: boolean`.
- Tipe data `Connection` di Frontend selaras dengan nilai di Database (`ok` bukan `success`).
