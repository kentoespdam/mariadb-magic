# Cross-profile collision: hard-fail saat save Mapping Profile

Dua Mapping Profile yang menulis ke tabel Destination yang sama dari Source yang berbeda akan saling menimpa baris berdasarkan PK — konsekuensi langsung dari **Source-wins UPSERT** + **Match Key = PK Destination**. V1 mendeteksi konfigurasi ini saat **save Mapping Profile** dan hard-fail dengan pesan eksplisit. Cek dilakukan setelah Closure Advisor expand Selection Set, sebelum profile ditulis ke `mapping_profiles`. Definisi overlap = ada tabel di Selection Set profile baru yang juga ada di Selection Set profile lain dengan `destination_id` sama. User harus exclude tabel atau hapus profile lama.

## Considered Options

- **(A) Trust the user, dokumentasi-only** — tooltip + release notes, tidak block. Ditolak: persona non-IT (target aplikasi) tidak akan baca dokumentasi ownership semantics; data loss diam-diam terlalu beresiko untuk sistem yang dijual sebagai "aman dipakai tanpa pengetahuan SQL".
- **(B) Hard-fail saat save Mapping Profile** *(dipilih)*.
- **(C) Per-row source provenance** (kolom `_source_id` di Destination, Match Key composite). Ditolak permanen: melanggar kontrak "tidak menyentuh skema Destination kecuali insert baris".

## Consequences

- **Validasi di `internal/repo/mapping_profiles.go`** saat save (create + update): query profile lain dengan `destination_id` sama, gabungkan Selection Set mereka, intersect dengan Selection Set profile baru (post-Closure-Advisor expansion). Intersect non-kosong → return error structural dengan daftar tabel bentrok dan nama profile pemilik.
- **Cek dilakukan saat save, bukan saat Start**: feedback lebih cepat, user tidak terlanjur klik Start dan menunggu sebelum tahu ada masalah.
- **Yang dicek = nama tabel Destination**, bukan Source. Dua Source berbeda yang sync ke tabel Destination yang sama tetap bentrok — Source identity tidak relevan untuk collision detection.
- **Closure Advisor harus jalan dulu**: validasi pakai Selection Set hasil ekspansi (`selection_json`), bukan yang user-pilih eksplisit. Tabel induk yang ditarik via FK juga ikut dicek — kalau profile A user-select `invoices` (advisor tarik `customers`), profile B user-select `customers`, mereka bentrok di `customers`.
- **Pesan error**: `ToFriendlyCollision(conflicts) (userMsg, technicalMsg)` di `internal/sync/errors.go` — daftar tabel + nama profile pemilik, plus dua opsi resolusi: "exclude tabel X dari profile ini" atau "hapus profile Y". UI di Mapping Builder menampilkan sebagai modal sebelum save berhasil.
- **Edge case multi-cabang merge**: user yang *memang* mau konsolidasi multi-Source ke satu Destination tabel (misal sync Jakarta + Surabaya ke `invoices` tunggal) di-block di V1. Workaround: sync ke dua Destination terpisah lalu UNION manual via SQL. V2 bisa unblock dengan composite Match Key opt-in.
- **Test M5/M6**: profile baru overlap dengan satu profile lain, dengan dua profile lain, overlap hanya via advisor-added table (bukan user-selected), update profile yang menambah tabel baru sehingga jadi overlap.
- **Tidak block self-update**: saat update profile yang sudah ada, exclude diri sendiri dari query collision (`WHERE id != ?`).
