# Rule DSL: 5 tipe whitelisted, single-rule-per-pairing, unconditional, flat JSON

`mapping_profiles.rules_json` menyimpan transformasi nilai sebagai **flat JSON** dengan key `"<destination_table>.<destination_column>"`. V1 mendukung tepat **5 tipe Rule whitelisted** (`cast`, `enum_map`, `regex_replace`, `string_op`, `date_format`), **maksimal satu Rule per Column Pairing** (no chaining), dan **tanpa kondisional** (no IFTTT branching meski label legacy di PRD menyebut "IFTTT"). Fan-out 1-Source→N-Destination ditangani lewat **duplicate Column Pairings** dengan Rule berbeda — bukan primitive khusus di DSL.

## Considered Options

- **(A) DSL ekspresif: nested AST + custom Go callback hook**. Ditolak: target maintainer = junior dev / AI lokal kecil, target persona = non-IT user. Custom callback membuka pintu eksekusi kode arbiter yang membutuhkan sandboxing + review surface yang besar. Nested AST sulit di-render di UI sebagai form, memaksa user belajar sintaks.
- **(B) Whitelist 5 tipe + chain (urutan rule per pairing)**. Ditolak untuk V1: chaining menambah kompleksitas evaluasi (urutan, type-flow antar step, error attribution per step) tanpa use case yang nyata pada persona target. Use case kombinasi yang muncul (mis. trim → cast) bisa diatasi dengan menambah varian rule kalau benar-benar perlu di V2.
- **(C) Whitelist 5 tipe + IFTTT conditional (`if value matches X then Y`)**. Ditolak: persona non-IT lebih tertolong oleh `enum_map` lookup (visual table) daripada syntax conditional. Conditional yang sering muncul di operasional UMKM = "kalau status = X, set kolom lain ke Y" — itu fan-out + enum_map, bukan branching dalam satu rule.
- **(D) Whitelist 5 tipe, single rule, unconditional, flat JSON keyed (table, column)** *(dipilih)*.
- **(E) Nested JSON by table** (`{"users": {"status": {...}}}`). Ditolak: flat key `"users.status"` lebih mudah di-merge, di-diff, dan di-iterate di translator. Tidak ada keuntungan struktural untuk grouping di runtime.

## Consequences

### 5 tipe Rule

```jsonc
// cast — ubah tipe MariaDB → MariaDB
{"type": "cast", "from": "src.t.col", "to": "INT"}            // atau "VARCHAR", "DECIMAL(10,2)", "DATE"

// enum_map — lookup nilai diskrit, dengan default
{"type": "enum_map", "from": "src.t.col",
 "map": {"Enabled": 1, "Disabled": 0, "Deleted": 0},
 "default": 0}

// regex_replace — POSIX/Go regex
{"type": "regex_replace", "from": "src.t.col",
 "pattern": "^\\s+|\\s+$", "replacement": ""}

// string_op — operasi string atomik whitelist
{"type": "string_op", "from": "src.t.col",
 "op": "trim"}                                                  // trim | upper | lower | substring
// substring varian: "op": "substring", "start": 0, "length": 10

// date_format — parse + reformat
{"type": "date_format", "from": "src.t.col",
 "input_format": "2006-01-02 15:04:05",                          // Go time layout
 "output_format": "02/01/2006",
 "on_parse_error": "null"}                                       // null | keep_original_string | fail_row
```

### Skema `rules_json`

```jsonc
{
  "users.status":    {"type": "enum_map", "from": "src.users.status",
                      "map": {"Enabled":"Enabled","Disabled":"Disabled","Deleted":"Disabled"},
                      "default": "Disabled"},
  "users.isdeleted": {"type": "enum_map", "from": "src.users.status",
                      "map": {"Enabled":0,"Disabled":0,"Deleted":1},
                      "default": 0},
  "users.created_at":{"type": "date_format", "from": "src.users.tgl_buat",
                      "input_format": "02/01/2006",
                      "output_format": "2006-01-02",
                      "on_parse_error": "fail_row"}
}
```

- Key absen = pairing tanpa Rule (passthrough nilai dari Source).
- `from` boleh sama untuk multiple key — itulah mekanisme fan-out.

### Translator (`internal/rules/`)

- `dsl.go` — struct + JSON schema validator (whitelisted `type`, required field per type, type-check `to` di `cast`, kompilasi regex, parse `input_format` Go time layout).
- `translate.go` — terima `rules_json` + Source row → Destination row siap-INSERT. Loop per Destination column di INSERT list, lookup `rules_json["<table>.<col>"]`, eksekusi rule kalau ada, kalau tidak passthrough.
- `validate.go` — dipanggil saat user simpan Mapping Profile + saat Sync Session start (sebelum chunk pertama). Gagal validasi = hard-fail dengan pesan ramah, bukan crash runtime.
- **Tidak ada Turing-complete escape hatch**. User yang butuh transformasi di luar whitelist harus pre-process di Source view atau menunggu V2.

### Fan-out via duplicate pairings

- UI Mapping Builder **tidak** memvalidasi "Source column sudah dipakai" — boleh dipilih lagi untuk Destination column lain.
- Rule untuk masing-masing Destination column independen — edit satu tidak menyentuh yang lain.
- Audit Sync Log per row failure mereferensikan **destination column** spesifik, jadi attribution tetap unambiguous.

### Constraint PK

- Match Key (kolom PK Destination) **tidak boleh** punya Rule. PK = identitas, bukan nilai. Validator menolak rule key yang menunjuk PK column dengan pesan "Kolom kunci tidak boleh ditransformasi".

### Error attribution di Sync Log

- Failure runtime (cast overflow, regex tidak match dengan `on_parse_error: fail_row`, dll) di-log dengan field `destination_column` + `rule_type` + `mariadb_code` (kalau dari MariaDB) atau `rule_error` (kalau dari translator). User-message via `ToFriendly` mengarahkan ke kolom + tipe rule, bukan ke ekspresi DSL mentah.

### Migrasi V2 (kalau perlu)

- Menambah tipe rule baru = additive di whitelist + bump version field. Profile lama tetap valid.
- Menambah chaining = breaking change struktur (`{type:...}` → `[{type:...}, ...]`). Migrasi data wajib + UI redesign. Itu sebabnya V1 dikunci single-rule.
- Menambah conditional = breaking, butuh AST. Lebih besar dari V1 ingin commit.

### Test M5

- Schema validator menolak `type` di luar whitelist, missing required field, regex tidak compile, `cast` `to` tidak dikenal MariaDB.
- Translator: 5 tipe round-trip dengan input valid + invalid (per-type edge cases).
- `date_format` `on_parse_error`: `null` → kolom NULL, `keep_original_string` → string asli (gagal di MariaDB kalau tipe DATE, lolos kalau VARCHAR), `fail_row` → row failure dengan attribution.
- Fan-out: dua pairing dengan `from` sama, dua rule berbeda, hasil per Destination column independen.
- PK + Rule = validator reject.
- `enum_map` default dipakai saat input tidak match key apapun.
- Profile dengan `rules_json: {}` (kosong) = passthrough seluruh Source value.
