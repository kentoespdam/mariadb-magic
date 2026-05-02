# Selection Set granularitas tabel-level only di V1

Selection Set di Mapping Profile direpresentasikan sebagai **daftar nama tabel saja** (`[]string`). Tidak ada kolom-subset per tabel di V1 — user tidak memilih "kolom Source mana yang ikut" untuk setiap tabel. Filtering kolom dilakukan di **dua lapisan eksisting**: (1) **Destination schema** — kolom yang tidak ada di Destination tidak akan ter-sync (Destination schema = source of truth untuk kolom yang sync-able); (2) **Column Pairing "Lewati"** — kolom Destination yang ada tapi tidak diinginkan ditandai "Lewati" (kalau structurally diperbolehkan; lihat ADR-0014). Source-side `SELECT * FROM table` di Whole-table mode tetap mengambil semua kolom — column projection tidak dilakukan di SELECT, hanya di INSERT.

## Considered Options

- **(A) Tabel-level only — Selection Set = `[]string` nama tabel** *(dipilih)*. Mental model persona: "Saya butuh data tabel orders + customers." Kolom yang tidak relevan dibuang via Destination schema design (kolom tidak dideklarasikan = tidak ter-sync) atau Column Pairing "Lewati" (eksplisit per kolom Destination). Closure Advisor introspect FK level tabel — tidak perlu reasoning kolom-level.
- **(B) Tabel + kolom subset — `Selection {table: string, columns: []string}`**. Ditolak: (1) **mental model bloat** untuk persona non-IT — sudah ada Column Pairing yang menentukan kolom Destination ambil dari mana; menambah "kolom Source mana yang dibawa ke memori" duplikasi tanggung jawab dan membingungkan ("kalau saya hilangkan kolom di Selection, apakah Column Pairing yang refer ke kolom itu jadi error?"). (2) **PII filtering false-sense-of-security** — user mungkin menganggap "uncheck kolom `password_hash` di Source = data tidak terbaca aplikasi", padahal `SELECT *` tetap dijalankan ke Source di Whole-table mode (V1), kolom hanya tidak di-project ke INSERT Destination. Mengkomunikasikan distinction "tidak dibaca" vs "dibaca tapi tidak ditulis" = friction tinggi, dan kalau user butuh privacy genuine, jawabnya bukan UI checkbox — itu DB user privilege di Source. (3) **Closure Advisor reasoning** jadi rumit: kalau parent table di-include via advisor tapi parent FK column tidak di-Selection-Set kolom-set, behavior ambigu (auto-include? error? warn?). Tabel-level menjaga advisor sederhana: "tabel ini perlu masuk" → masuk dengan semua kolom yang Destination peduli. (4) **UI Selection Set tab** jadi tree (tabel → kolom expand) bukan flat list, menambah loading time introspect Source + cognitive load.
- **(C) Tabel-level di V1 + opt-in kolom-subset di Settings power-mode**. Ditolak V1: tidak ada use case persona target yang menjustifikasi feature flag. Persona power-user yang butuh kolom-subset bisa: (a) bikin Destination schema yang memang minim kolom, atau (b) tandai kolom "Lewati" di Column Pairing. Mode toggle = surface tambahan yang harus dipertahankan tanpa value V1.
- **(D) Tabel-level + auto-exclude kolom Source tidak ter-pair**. Sudah merupakan behavior natural — kolom Source yang tidak menjadi sumber Column Pairing manapun memang tidak akan masuk INSERT. Bukan opsi terpisah; ini adalah konsekuensi (A).

## Consequences

### Skema (`mapping_profiles.selection_json`)

```json
{
  "tables": [
    {"name": "orders", "role": "user_selected"},
    {"name": "customers", "role": "advisor_added"},
    {"name": "products", "role": "advisor_added"}
  ]
}
```

- Field `tables` adalah array of `{name, role}` — `role` per ADR-0001/0015 (`user_selected` | `advisor_added`).
- **Tidak ada** field `columns` di sini. Kolom Destination yang ikut sync ditentukan di `mapping_profiles.column_pairings_json` per tabel.
- Migrasi V2 yang menambah kolom-subset: tambah field optional `columns?: []string` di entry tabel; absen = "semua kolom" (backward compatible).

### Filtering kolom: dua lapisan eksisting

1. **Destination schema design**: kolom yang tidak dideklarasikan di Destination tabel = otomatis tidak ter-sync. Persona target yang ingin filtering aktif diarahkan untuk meng-edit Destination schema (DDL `ALTER TABLE ... DROP COLUMN`) atau bikin Destination schema baru dari awal yang hanya berisi kolom yang dibutuhkan. Ini selaras dengan filosofi "Destination schema = source of truth" yang sudah ditegakkan ADR sebelumnya.
2. **Column Pairing "Lewati"**: untuk kolom Destination yang ada tapi user tidak ingin sinkronkan dari Source (mis. kolom yang punya DEFAULT di Destination dan ingin biarkan nilai DB). Validator ADR-0014 layer 1 memastikan "Lewati" hanya valid pada kolom yang punya DEFAULT atau nullable.

### Source SELECT tetap full-row di Whole-table mode

- Runner `internal/sync/runner.go` chunk Source pakai `SELECT * FROM source_table LIMIT ? OFFSET ?` (atau cursor PK-based). Tidak ada SELECT projection per Column Pairing — over-fetch ringan vs kompleksitas projection tracking.
- **Implikasi privasi**: data sensitif di Source (mis. `password_hash`, `ssn`) terbaca ke memori aplikasi meskipun tidak di-pair ke kolom Destination. Dokumentasi user-facing harus eksplisit: "Untuk membatasi data yang dibaca, atur izin akses user MariaDB Source — ini lebih aman daripada filter di aplikasi."
- V2 candidate: SELECT projection berbasis Column Pairing pairs ditambah kolom PK + FK yang dibutuhkan Closure Advisor — net win privacy, tapi butuh tracking dependency kolom yang non-trivial.

### UI affordance

- **Selection Set tab** di Mapping Builder = **flat list checkbox tabel**, bukan tree. Performance: introspect Source `SHOW TABLES` cukup, tidak perlu `SHOW COLUMNS` per tabel di Selection Set tab (kolom di-introspect lazy saat user buka Column Pairing tab per tabel).
- Closure Advisor dialog tetap menampilkan tabel-level: "Tabel berikut perlu ikut: [customers, products]." Tidak ada granularitas kolom.
- Tidak ada UI hint "Source kolom X tidak terpakai" — over-engineered untuk persona target. Auto-match Column Pairing sudah mengkomunikasikan kolom mana yang ter-bind via UI mapping itu sendiri.

### Pengaruh ke ADR sebelumnya

- **ADR-0001 / ADR-0015 (Closure Advisor)**: introspeksi FK tetap tabel-level. Union DAG dual-side memakai tabel sebagai node, edges tabel → tabel. Tidak ada perubahan algoritma.
- **ADR-0008 (profile snapshot)**: `selection_json` snapshot field tetap tabel-level; `column_pairings_json` snapshot menyimpan keputusan kolom. Pemisahan tetap bersih.
- **ADR-0014 (draft/ready validator)**: layer 1 validator tetap operate di kolom Destination via Column Pairing. Tidak ada validator baru "kolom Source mana yang valid".

### Test M3

- Save Mapping Profile dengan Selection Set `["orders"]` → `selection_json.tables = [{name: "orders", role: "user_selected"}]` (post-Closure-Advisor mungkin ekspansi). Tidak ada field `columns`.
- Migration kompatibel: existing profile (kalau ada di future migration) yang punya `selection_json` lama tanpa schema baru tetap parse-able.
- Source punya kolom yang tidak di-pair manapun → kolom tetap dibaca ke memori (verify via log SELECT statement), tapi tidak masuk INSERT statement Destination.
- UI Selection Set tab render flat checkbox — tidak ada nested tree. Smoke test: 50 tabel di Source = list scrollable, tanpa expand state.

### V2 candidate

- **Kolom-subset per tabel**: tambah field optional `columns?: []string` di `selection_json.tables[*]`. UI: setelah pilih tabel, expand row untuk pilih kolom Source. Reasoning Closure Advisor: kalau parent FK column tidak di-subset, auto-include + warn (lebih baik over-fetch daripada broken FK).
- **SELECT projection di runner**: hanya SELECT kolom yang dibutuhkan (Column Pairing sources ∪ PK ∪ FK columns). Privacy + bandwidth gain, butuh dependency tracking yang teliti.
- **PII compliance preset**: template Mapping Profile yang otomatis "Lewati" kolom dengan nama match pattern `password*`, `*_hash`, `ssn`, `*_token` di Destination. Soft-suggestion, bukan enforcement.
