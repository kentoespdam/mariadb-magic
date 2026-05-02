# Closure Advisor: dual-side FK introspection (Source ∪ Destination) + runtime 1452 row-level fallback

Closure Advisor diperluas dari Source-only menjadi **dual-side**: ekspansi Selection Set memperhitungkan FK yang dideklarasikan di **Source schema** *dan* FK yang dideklarasikan di **Destination schema**. Closure final = `Selection ∪ parents-via-Source-FK ∪ parents-via-Destination-FK`. Tujuan: tutup skenario di mana Destination punya FK constraint yang Source tidak punya (Destination lebih ketat) — kalau hanya pakai Source FK, runner akan kena error 1452 di chunk pertama yang melibatkan child tanpa parent yang ter-dump. Skenario yang **inherently runtime** — race dengan write Source live, orphan data lama di Source — tidak bisa ditangkap compile-time; ditangani per-baris lewat `ToFriendly(1452)` dengan template kontekstual yang menjelaskan parent table + parent key value.

## Considered Options

- **(A) Source-only Closure Advisor + runtime 1452 fallback untuk semua skenario**. Ditolak: skenario "Destination punya FK yang Source tidak punya" adalah situasi struktural yang dapat diketahui saat save Mapping Profile — lempar ke runtime berarti chunk pertama yang menyentuh tabel itu akan loop spam 1452 untuk *setiap* baris child. Dependency Closure preview ke user juga jadi misleading — user lihat daftar tabel "lengkap" tapi sync gagal massal.
- **(B) Destination-only Closure Advisor**. Ditolak simetris dengan (A): Source punya FK yang Destination tidak punya berarti closure under-includes parent yang Destination tidak peduli, tapi *Source* peduli untuk integritas dump. Lebih penting: skenario lebih umum adalah Destination = Source dengan FK tambahan / sama, jarang Destination strip FK. Tetap mungkin → ditolak.
- **(C) Dual-side Closure Advisor (Source FK ∪ Destination FK) + runtime 1452 fallback** *(dipilih)*. Compile-time tutup struktural mismatch, runtime tutup data-driven leak.
- **(D) Pre-sync data-driven validation** — query Source untuk semua FK parent value yang dirujuk child, verifikasi tiap value akan ter-dump. Ditolak: mahal (full scan FK column tiap tabel child × tiap FK), tidak resolve apapun (cuma early-fail), duplikasi dengan runtime 1452. Persona target lebih tertolong oleh row log pasca-sync daripada delay di awal.

## Consequences

### Closure Advisor (`internal/sync/closure.go`)

- Introspeksi FK dijalankan **dua kali** per pasangan koneksi:
  - `mariadb.IntrospectFKs(sourceConn, table)` — FK yang Source schema deklarasikan.
  - `mariadb.IntrospectFKs(destConn, table)` — FK yang Destination schema deklarasikan.
- Closure ekspansi: untuk tiap tabel `t` di Selection Set, gabungkan parent set dari kedua sisi. Iterate sampai fixpoint (parent baru bisa membawa parent transitif lewat FK Destination yang tidak ada di Source, dan sebaliknya).
- Topological order untuk runtime tetap dihitung pakai **union DAG** — kalau salah satu sisi punya edge, edge itu wajib dihormati di urutan dump (parent dulu).
- Cycle detection: cycle yang muncul *hanya* di salah satu sisi tetap di-reject sebagai cycle — V1 tidak coba "ignore Destination edges to break cycle" karena membuat semantik tidak deterministik.
- **Dialog konfirmasi** ke user **tidak** membedakan asal FK (Source vs Destination). Pesan generik: "Tabel berikut perlu ikut tersinkron karena terhubung lewat relasi: [A, B, C]." Detail teknis "FK ini hanya ada di Destination" disembunyikan — persona non-IT tidak butuh tahu, dan menampilkannya bisa membuat user salah skip ("ah cuma Destination, skip aja").
- **`selection_json` snapshot** per ADR-0008/0014 menyimpan tabel hasil ekspansi tanpa flag asal FK. Pre-flight ADR-0006 tetap diff struktural tanpa peduli sisi mana yang originate edge.

### Skenario yang ditutup compile-time

- **Skenario D (Destination FK > Source FK)**: Destination `orders` punya FK ke `customers`, Source schema `orders` tidak deklarasikan FK ke `customers` (mis. legacy schema). User pilih hanya `orders` di Selection Set. Source-only advisor → closure = `{orders}`, sync → semua INSERT ke `orders` di Destination kena 1452. Dual-side advisor → closure = `{orders, customers}`, dialog "Tambahkan customers" muncul, user accept, sync sukses.

### Skenario yang **tidak bisa** ditutup compile-time → runtime fallback

- **Skenario A (race dengan Source live writes)**: Source lagi aktif dipakai aplikasi produksi. Saat advisor dump `customers`, customer baru `id=999` belum ada. Saat dump `orders`, sudah ada `order` yang `customer_id=999`. Destination INSERT `order` → 1452 (parent `999` tidak ada di Destination karena belum ter-dump). V1 tidak ada freeze/snapshot Source.
- **Skenario B (orphan data di Source)**: Source FK constraint tidak di-enforce historis (DBA pakai `FOREIGN_KEY_CHECKS=0` saat import lama, atau FK ditambahkan setelah data ada). Source punya child row dengan `parent_id` yang tidak ada di parent table. Source-side dump parent table tidak akan bawa parent itu (karena memang tidak ada). Destination INSERT child → 1452.

Untuk dua skenario ini, error 1452 di-log per-row ke `sync_logs` lewat `ToFriendly(1452)`, sync tidak fail-fast — sesuai kontrak ADR-0003 (per-row fallback untuk runtime errors di whitelist).

### `ToFriendly(1452)` template kontekstual

```go
// internal/sync/errors.go
case 1452:
    // Parse "Cannot add or update a child row: a foreign key constraint fails
    //  (`db`.`child`, CONSTRAINT `fk_name` FOREIGN KEY (`parent_id`)
    //   REFERENCES `parent` (`id`))"
    parentTable, parentCol, childCol := parseFK1452(err.Message)
    parentVal := rowValueFor(childCol, row) // ekstrak nilai dari row payload
    userMsg = fmt.Sprintf(
        "Baris ini merujuk ke data di tabel %q (kolom %q = %v) yang belum ada di Destination. "+
        "Kemungkinan data induk di Source belum lengkap, atau ada baris yang dibuat di Source "+
        "saat sinkronisasi sedang berjalan. Coba jalankan sync ulang setelah Source stabil; "+
        "kalau masalah berulang, periksa apakah ada baris %q yang tidak punya pasangan di %q di Source.",
        parentTable, parentCol, parentVal, "child", parentTable)
```

- Pesan menyebut nama parent table + nilai parent key — actionable untuk user yang bisa cek manual di Source.
- Tidak menyebut "FK" / "constraint" — istilah teknis. "Data induk" + "merujuk ke" lebih akrab.
- Saran "jalankan sync ulang" valid karena re-sync idempotent (Source-wins UPSERT) dan parent yang muncul belakangan akan ter-cover di run berikutnya.

### Status session saat 1452 muncul

- Per-row failures tidak menggagalkan session. Session berakhir `done` dengan `rows_failed > 0`. UI Session Detail tampilkan summary "X baris gagal karena referensi data hilang — lihat log untuk detail".
- Tidak ada rate-limit "kalau >50% baris gagal 1452, hard-fail" di V1 — kompleksitas threshold tuning + risiko false-stop pada legitimate large gap. Capacity-based retention (ADR-0010) tetap melindungi `sync_logs` dari ledakan ukuran.

### Pengaruh ke ADR sebelumnya

- **ADR-0001 (Closure Advisor)**: closure source diperluas dari "FK yang Source deklarasikan" ke "FK yang Source ∪ Destination deklarasikan". Topological order pakai union DAG. Properti "tidak ada rekursi runtime FK" tetap berlaku.
- **ADR-0006 (schema drift pre-flight)**: tidak berubah. Pre-flight diff struktural per kolom; FK constraint bukan domain pre-flight V1.
- **ADR-0014 (draft/ready)**: dialog Closure Advisor tetap wajib di transisi `draft → ready`; sekarang dialog mungkin menampilkan tabel tambahan dari Destination FK side. Tidak ada perubahan UX naming.
- **ADR-0003 (per-row fallback)**: error code 1452 ditambahkan ke whitelist row-error (sebelumnya disebut di CONTEXT.md operational note schema drift; sekarang formal). Whitelist final: 1048, 1062, 1264, 1292, 1366, 1406, 1452.

### Test M4/M5

- **Skenario D compile-time**: schema fixture Destination dengan FK `orders.customer_id → customers.id` yang Source tidak punya. User pilih `{orders}`. Closure Advisor harus ekspansi ke `{orders, customers}`, dialog konfirmasi muncul, post-confirm `selection_json` berisi keduanya.
- **Cycle dual-side**: Source punya `A → B`, Destination punya `B → A`. Advisor harus reject sebagai cycle (bukan diam-diam pilih satu sisi).
- **Closure idempotent**: dual-side run dua kali pada profile sama harus produce closure identik (tidak ada side-effect dari urutan introspect).
- **Skenario A runtime**: testcontainer dengan Source yang punya child row dengan `parent_id` mengarah ke parent yang tidak ada di parent table (simulasi orphan/race). Sync run → child table dump menghasilkan 1452 per row → `sync_logs` entry dengan `mariadb_code=1452` dan user message menyebutkan parent table + value. Session status = `done`, `rows_failed > 0`.
- **`ToFriendly(1452)` parser**: template error MariaDB yang berbeda format (constraint name dengan backtick vs tidak, multi-column FK) → parser robust atau fallback generic.

### V2 candidate

- Surface FK origin di dialog (icon kecil "⚠ ditambahkan karena Destination") untuk user power. V1 sembunyikan demi simplicity persona target.
- Pre-sync data-driven FK probe sebagai opt-in di Settings ("Verifikasi referensi sebelum sync — lebih lambat, lebih aman"). Berguna untuk Source dengan banyak orphan historical.
- Threshold "abort kalau >X% rows fail FK" sebagai sanity rail, bisa konfigurabel per profile.
