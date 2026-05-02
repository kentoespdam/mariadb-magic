# Column Pairing opsi non-Source: tiga semantik UPSERT distinct (`Kosongkan/NULL` vs `Default DB` vs `Lewati`)

V1 menyediakan **tiga opsi non-Source distinct** di dropdown "Sumber nilai" Mapping Builder, masing-masing dengan semantik berbeda di branch INSERT dan UPDATE dari `INSERT ... ON DUPLICATE KEY UPDATE`:

- **`Kosongkan/NULL`** → INSERT eksplisit `NULL` + UPDATE `col = NULL`. Kolom **selalu NULL** post-sync di kedua branch.
- **`Default DB`** → INSERT keyword `DEFAULT` (server pakai column default / `AUTO_INCREMENT` / `CURRENT_TIMESTAMP`) + UPDATE `col = DEFAULT(col)`. Re-sync **reset** ke server default tiap run.
- **`Lewati`** → kolom **dihilangkan dari INSERT column list** + UPDATE branch tidak menyentuh kolom. Konsekuensi: INSERT memakai server default implisit (sama seperti `Default DB` di branch ini), tapi UPDATE **preserve existing value** di Destination — admin/aplikasi lokal yang edit kolom ini tidak ter-overwrite saat re-sync.

`Lewati` adalah **opt-out lokal Source-wins per kolom**: kontrak Source-wins UPSERT (Destination = derived copy, edit lokal hilang) berlaku per Mapping Profile secara default; `Lewati` membuat satu kolom **opt-out** dari kontrak itu — admin Destination boleh maintain kolom tersebut tanpa diganggu sync.

PK column: ketiga opsi builder-block (PK harus dari Source per ADR-0014).

## Considered Options

- **(A) Tiga opsi distinct dengan semantik di atas** *(dipilih)*. Builder UI: dropdown grup "Opsi khusus" → `Kosongkan/NULL`, `Default DB`, `Lewati` sebagai entri terpisah. Tooltip per opsi dalam Bahasa awam:
  - `Kosongkan/NULL`: "Kolom akan selalu kosong (NULL) di Destination, baik baris baru maupun update."
  - `Default DB`: "Kolom akan diisi nilai default dari Destination (mis. tanggal hari ini, nomor urut)."
  - `Lewati`: "Kolom tidak akan disentuh sync — nilai yang sudah ada di Destination dipertahankan saat update. Baris baru akan pakai nilai default Destination."
  Builder validation: kolom NOT NULL no-default → `Kosongkan/NULL` dan `Lewati` ditolak (`Lewati` di-block karena INSERT tanpa nilai akan fail server-side); kolom NOT NULL ber-DEFAULT → `Lewati` boleh.

- **(B) Dua opsi: `Kosongkan/NULL` + `Default DB` saja (tanpa `Lewati`)**. Ditolak: kehilangan use case "admin lokal tracking kolom `notes` / `last_reviewed_at` yang tidak ada di Source — tidak boleh ter-overwrite". Tanpa `Lewati`, satu-satunya cara opt-out adalah **menghapus kolom dari Destination schema** (hilang di sisi laporan) atau **tidak masuk Destination sama sekali**. Persona target butuh granularitas kolom-level untuk skenario "Source ekspor produksi minimal, Destination diperkaya lokal" yang nyata di UMKM (kolom audit, kolom kategorisasi internal, kolom flag manual). Menambah satu opsi dropdown + sedikit logic generator = biaya kecil, capability gain besar.

- **(C) `Lewati` = sama dengan `Default DB`** (alias / sinonim, satu opsi merged). Ditolak: hilangkan distinction yang load-bearing. `Default DB` saat re-sync **menimpa** edit lokal dengan server default (`UPDATE col = DEFAULT(col)`); `Lewati` **preserve** edit lokal. Untuk kolom seperti `created_at` (server `CURRENT_TIMESTAMP`), `Default DB` artinya tiap re-sync reset ke "now" — biasanya bukan yang user mau. `Lewati` artinya "biarkan apa adanya". Merging keduanya = pilih salah satu semantik, manapun dipilih = kehilangan use case lain.

- **(D) `Lewati` = INSERT `NULL` + UPDATE skip** (asimetris berdasarkan branch). Ditolak: kompleks tanpa benefit jelas. Mental model "INSERT vs UPDATE behave differently for same option" sulit dijelaskan di tooltip awam. Symmetry "INSERT pakai server default, UPDATE preserve" lebih mudah dipahami: "kolom ini tidak disentuh sync, baris baru pakai nilai default Destination, baris lama tetap apa adanya".

- **(E) Per-row mode toggle "preserve existing" di Rule editor** (bukan opsi top-level Sumber nilai). Ditolak: Rule editor di-scope untuk transformasi nilai *yang ada* (lihat ADR-0012 — Rule menerima `(row) row` dengan input dari Source). `Lewati` semantically tidak ada input — tidak ada Source value, tidak ada transform. Memaksa mental model "Rule yang outputnya 'jangan tulis kolom ini'" mengaburkan boundary Column Pairing vs Rule.

## Consequences

### SQL generation (`internal/sync/upsert.go`)

Per chunk, query builder partition kolom Destination ke tiga kategori berdasarkan Column Pairing option:

```go
// kategori per chunk:
// - sourceCols[]: kolom dari Source (atau Constant) — INSERT value + UPDATE col=VALUES(col)
// - nullCols[]:   Kosongkan/NULL — INSERT NULL + UPDATE col=NULL
// - defaultCols[]: Default DB — INSERT DEFAULT + UPDATE col=DEFAULT(col)
// - skipCols[]:   Lewati — DIHILANGKAN dari INSERT column list, tidak ada di UPDATE clause
```

INSERT clause: `INSERT INTO {tabel} ({sourceCols}, {nullCols}, {defaultCols}) VALUES ({rowValues}, NULL...NULL, DEFAULT...DEFAULT) ON DUPLICATE KEY UPDATE`. Catatan: `skipCols` **tidak muncul** sama sekali di INSERT — kolom yang absen dari column list otomatis diisi server dengan default-nya (atau NULL kalau nullable tanpa default).

UPDATE clause: `{sourceCols[i]}=VALUES({sourceCols[i]})`, `{nullCols[i]}=NULL`, `{defaultCols[i]}=DEFAULT({defaultCols[i]})`. `skipCols` **tidak muncul** di UPDATE — eksisting nilai di Destination tetap.

Catatan generator: `DEFAULT(col)` adalah MariaDB-specific syntax untuk reference column default di UPDATE. Test coverage wajib: kolom dengan `DEFAULT CURRENT_TIMESTAMP`, kolom dengan `AUTO_INCREMENT` (skip karena PK aturan ADR-0014, tapi non-PK auto-inc theoretical), kolom dengan literal default.

### Builder validation (`internal/repo/mapping_profiles.go`)

Saat transisi `draft → ready` (per ADR-0014):

- PK column dengan opsi `Kosongkan/NULL` / `Default DB` / `Lewati` → reject dengan pesan "Kolom kunci utama wajib diambil dari Source".
- NOT NULL no-default + `Kosongkan/NULL` → reject "Kolom tidak boleh kosong dan tidak punya nilai default — pilih sumber dari Source atau Konstanta".
- NOT NULL no-default + `Lewati` → reject "Kolom wajib diisi saat baris baru — pilih sumber dari Source, Konstanta, atau ubah skema agar punya DEFAULT".
- NOT NULL ber-DEFAULT + `Lewati` → terima (INSERT pakai DEFAULT implisit, UPDATE preserve OK).
- NOT NULL ber-DEFAULT + `Default DB` → terima (eksplisit DEFAULT keyword sah).
- Nullable + ketiga opsi → terima.

Validasi di-execute sekali di repo layer; UI render error inline di kolom yang bermasalah (per Mapping Builder UI operational note).

### Truth table (4 sifat kolom × 3 opsi)

| Sifat kolom | `Kosongkan/NULL` | `Default DB` | `Lewati` |
|---|---|---|---|
| Nullable, no default | OK (INSERT NULL, UPDATE NULL) | OK (server default = NULL implicit) | OK (preserve / NULL on insert) |
| Nullable, ber-default | OK | OK (reset ke default) | OK (preserve / default on insert) |
| NOT NULL, no default | **REJECT** | OK | **REJECT** |
| NOT NULL, ber-default | **REJECT** (NULL violate constraint) | OK (reset ke default) | OK (preserve / default on insert) |

### UI affordance

Mapping Builder dropdown "Sumber nilai" (per Mapping Builder operational note: shadcn `<Select>` grouped):

```
┌─ Kolom Source ────────────┐
│ id                         │
│ nama                       │
│ ...                        │
├─ Opsi khusus ──────────────┤
│ Konstanta                  │
│ Kosongkan / NULL           │
│ Default DB                 │
│ Lewati (jangan disentuh)   │
└────────────────────────────┘
```

Status badge per kolom:
- `Kosongkan/NULL` → badge biru "NULL" + Detail "Selalu kosong"
- `Default DB` → badge biru "Default" + Detail "Pakai default skema"
- `Lewati` → badge ungu "Lewati" + Detail "Pertahankan nilai Destination"

Badge ungu (`Lewati`) dibedakan secara visual dari badge biru (`NULL`/`Default`) karena semantiknya beda kelas: `Lewati` = opt-out kontrak Source-wins (sebagian besar user tidak butuh, perlu visibility ekstra di review profile).

### Interaksi dengan ADR sebelumnya

- **ADR-0014 (`draft`/`ready` layered validation)**: validasi NOT NULL × opsi non-Source di-handle di builder layer (Layer 1), bukan Preflight (Layer 2). Konsisten dengan filosofi "structural impossibilities di builder, schema drift di Preflight". Schema drift drop kolom dengan DEFAULT → opsi `Lewati` di profile lama jadi invalid (kolom hilang di Destination) → schema drift detection (ADR-0006) tangkap di Preflight.
- **ADR-0013 (AUTO_INCREMENT no counter intervention)**: `Default DB` di kolom `AUTO_INCREMENT` non-PK (rare tapi legal) = INSERT pakai counter Destination, bukan Source. Tidak melanggar ADR-0013 — tidak ada `ALTER TABLE SET AUTO_INCREMENT`, hanya pakai mekanisme native.
- **ADR-0003 (chunk transaction + per-row fallback)**: `Lewati` di INSERT column list = kolom NOT NULL no-default akan trigger error 1364 (`Field doesn't have a default value`) kalau builder validation luput — masuk row-level fallback `ToFriendly` dengan template baru "Kolom {col} wajib diisi tapi diset 'Lewati' di Mapping Profile — pilih sumber lain". Builder validation seharusnya cegah ini upfront; runtime fallback = defensive net.
- **ADR-0019 (fresh-run-only)**: re-run Sync Session dengan opsi `Default DB` aktif **akan reset** kolom tiap run — konsekuensi by-design, bukan idempotency violation. Re-run dengan `Lewati` aktif akan **preserve** edit lokal akumulatif — admin yang edit lokal tetap aman lintas re-run. Kontrak idempotensi (Source-wins UPSERT) berlaku di kolom Source-paired; opsi non-Source masing-masing punya kontrak sendiri yang konsisten lintas run.

### Skenario edge

- **"Saya pilih `Lewati` di kolom NOT NULL ber-DEFAULT, baris baru di-insert OK, tapi update existing tidak menyentuh kolom — admin saya edit kolom ini tahun lalu, masih aman?"** → Ya, persis itu use case. UPDATE branch tidak menyentuh kolom = nilai admin tahun lalu tetap.
- **"Saya pilih `Default DB` di kolom `created_at` dengan `DEFAULT CURRENT_TIMESTAMP`, kenapa setiap re-sync `created_at` jadi 'sekarang' bukan timestamp asli baris dibuat?"** → Konsekuensi `UPDATE col = DEFAULT(col)`. User yang ingin "preserve created_at original di re-sync, tapi pakai default untuk baris baru" → pilih `Lewati`, bukan `Default DB`. Tooltip `Default DB` perlu jelas: "tiap update, kolom direset ke nilai default — cocok untuk kolom yang memang ingin selalu di-reset (mis. `last_synced_at`); untuk preserve nilai lama gunakan 'Lewati'".
- **"Schema drift drop default value dari kolom yang saya pilih `Default DB`"** → Preflight (ADR-0006) catch sebagai blocking: "Kolom {col} kehilangan nilai default — opsi 'Default DB' tidak lagi valid". User edit profile, pilih ulang opsi.
- **"Saya pilih `Lewati` di kolom Destination yang juga di-Rule"** → builder block: Rule butuh input value, `Lewati` tidak punya input. Validation pesan: "Kolom dengan opsi 'Lewati' tidak bisa punya aturan transformasi".
- **"Source punya kolom yang sama namanya, tapi saya pilih `Default DB` — apa yang terjadi dengan nilai Source?"** → Diabaikan. Generator query tidak baca kolom Source untuk pairing yang non-Source. Fan-out 1→N (per Column Pairing definition) tidak terpengaruh — kolom Source masih bisa dipakai pairing lain.

### Test M2/M4

- **Generator partition test** (`internal/sync/upsert_test.go`): 4 kolom Destination dengan opsi berbeda × NULL/Default/Lewati/Source → assert generated SQL match expected (column list, value list, update clause). Test pakai snapshot-based assertion (golden file) supaya regresi visible.
- **Builder validation matrix** (`internal/repo/mapping_profiles_test.go`): 4 sifat kolom × 3 opsi (12 combinations) → assert REJECT/OK match truth table di atas.
- **Round-trip semantik** (M4 integration): seed Destination dengan baris X (kolom `notes` = "edit lokal"); profile dengan `notes` opsi `Lewati`; run Sync Session → assert post-sync `notes` masih "edit lokal" (preserved). Run lagi profile dengan `notes` opsi `Default DB` → assert post-sync `notes` = column default. Run lagi profile dengan `notes` opsi `Kosongkan/NULL` → assert post-sync `notes` = NULL.
- **NOT NULL no-default + `Lewati` defensive** (`internal/sync/upsert_test.go`): kalau builder validation di-bypass (test inject), runtime INSERT trigger error 1364 → masuk `sync_logs` dengan ToFriendly template baru.
- **Schema drift drop default** (M4): profile pakai `Default DB` di kolom X; `ALTER TABLE Destination ALTER X DROP DEFAULT` → Preflight gagal dengan pesan ramah.

### V2 candidate

- **Per-row conditional `Lewati`**: "preserve kalau Destination value sudah non-NULL, overwrite kalau NULL". Butuh runtime branch per-row di UPDATE clause — `UPDATE col = IF(col IS NULL, VALUES(col), col)`. Lebih powerful tapi mental model lebih rumit; tunda sampai ada use case konkret.
- **Default value override per Pairing**: pengganti `Default DB` yang server-side; user pilih literal default di Builder (mis. `0` untuk INT, `''` untuk VARCHAR). Sudah covered oleh opsi `Konstanta`, kecuali user butuh "default *yang berbeda* antara INSERT dan UPDATE branch". V2 marginal.
- **Bulk-set "preserve all admin-only columns"**: deteksi otomatis kolom yang di-Destination-tapi-tidak-di-Source, default ke `Lewati`. Saat ini auto-match by-name + tipe (per Column Pairing definition); kolom yang hanya ada di Destination otomatis unresolved → user manual pilih `Lewati`. Enhancement: "auto-skip" toggle di Builder header.
