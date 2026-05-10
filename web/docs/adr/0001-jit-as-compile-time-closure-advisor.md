# JIT Parent Sync sebagai Closure Advisor compile-time, bukan rekursi runtime

PRD v2.0 dan `plan/implementation.md` M4 awalnya mendefinisikan **JIT Parent Sync** sebagai rekursi runtime: saat insert baris anak ke Destination, recurse cari & sync induk yang hilang via FK, dengan tes wajib hingga depth ≥3. Setelah grilling kontrak sync, kami pindahkan logika ini ke **compile-time** sebagai *Closure Advisor*: saat user simpan Mapping Profile atau klik Start, sistem hitung Dependency Closure dari Selection Set dan paksa user menambahkan tabel induk yang hilang lewat dialog konfirmasi. Sync runtime jadi *whole-table dump* polos dalam topological order — tidak ada rekursi FK, tidak ada cache visited, tidak ada nested batch logic.

## Considered Options

- **(A) Rekursi runtime murni** (PRD asli) — JIT recurse per chunk anak, max-depth guard 10, cache visited per session. Ditolak: kompleks, idempotency & interrupt recovery sulit, progress bar non-deterministik, beban tes besar.
- **(B) Topological pre-pass dengan JIT-only mode untuk induk besar** — closure dihitung di awal, tabel induk yang tidak di Selection Set di-pull hanya baris yang dirujuk via FK. Ditolak: masih butuh accumulator FK values jutaan entry + dedup runtime; kompleksitas tidak sebanding manfaat untuk persona MVP.
- **(C) Closure Advisor compile-time + whole-table semua** *(dipilih)* — user dipaksa pilih tabel induk eksplisit lewat dialog. Sederhana, predictable, cocok persona non-IT.

## Consequences

- **JIT runtime hilang** — `internal/sync/jit.go` di plan asli diganti `internal/sync/closure.go` (advisor) + `graph.go` (DAG, topological sort, cycle detect). Test "depth ≥3" jadi test *closure computation*, bukan rekursi runtime.
- **Trade-off performa diterima**: tabel induk yang masuk closure akan di-dump utuh, meskipun hanya sedikit barisnya yang dirujuk. Asumsi: induk biasanya master-data (customers, products) yang relatif kecil. Kalau asumsi ini patah di lapangan, V2 bisa tambahkan JIT-only mode opt-in (opsi Y/Z dari diskusi).
- **Cycle antar-tabel ditolak total** oleh advisor; self-ref FK didukung lewat `FOREIGN_KEY_CHECKS=0` per-tabel (lihat ADR berikutnya kalau diputuskan).
- **PRD §Catatan Arsitek** tentang test JIT depth tetap relevan tapi sekarang berlaku untuk advisor closure computation, bukan eksekusi runtime.
