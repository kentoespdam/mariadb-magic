# Self-ref FK didukung via FOREIGN_KEY_CHECKS=0 per-tabel; cycle antar-tabel ditolak

Saat Closure Advisor membangun DAG dependency, FK siklik mungkin muncul. Self-ref (e.g. `employees.manager_id → employees.id`, kategori bersarang, reply-to message) umum dan harus didukung; cycle antar-tabel langka dan biasanya code smell. Kami dukung self-ref dengan menjalankan `SET SESSION FOREIGN_KEY_CHECKS=0` pada koneksi Destination **hanya selama insert tabel itu**, lalu re-enable sebelum lanjut tabel berikutnya. Cycle antar-tabel ditolak total oleh advisor dengan pesan ramah; user diminta exclude salah satu tabel atau perbaiki skema.

## Considered Options

- **(A) Tolak semua cycle termasuk self-ref** — terlalu restriktif, banyak skema produksi punya self-ref legit.
- **(B) Self-ref di-defer per-tabel; cycle antar-tabel ditolak** *(dipilih)*.
- **(C) Defer-all FK check sepanjang session** — ditolak: menyembunyikan bug data nyata yang seharusnya muncul sebagai Sync Log per-baris.

## Consequences

- `internal/sync/runner.go` perlu tahu mana tabel punya self-ref dan toggle `FOREIGN_KEY_CHECKS` per-tabel, bukan per-session. Re-enable + jalankan validasi manual setelah tabel selesai supaya bug data tetap ketangkap.
- DAG builder boleh "potong" self-ref edge supaya topological sort tidak deadlock; cycle antar-tabel = error eksplisit, sync tidak boleh start.
