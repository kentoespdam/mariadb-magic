# Column Pairing editor: explicit commit per tabel, bukan auto-save per kolom

`PairingEditor` di FE (`web/src/app/profiles/_components/builder/PairingEditor.tsx`) sebelumnya auto-save setiap perubahan dropdown/input — `await profileService.updatePairings(...)` dipanggil di handler `updatePairing()`. Pola ini menyebabkan race yang ter-reproduksi: saat user men-switch tabel di sidebar sebelum SWR refetch profile selesai, `useMemo(() => parse(profile.column_pairings_json))` masih meng-derive dari snapshot stale, sehingga `JSON.stringify(newMappings)` yang dikirim ke `PUT /api/profiles/{id}/pairings` kehilangan entri tabel yang barusan disimpan. Karena endpoint `UpdatePairings` melakukan **full overwrite** `column_pairings_json` (`internal/api/profiles_extra.go:78`), entri tabel lain ter-hapus permanen di DB. Gejala observable: user checklist 2+ tabel di `TablePicker`, atur pairing di tiap tabel, klik **Tandai Siap** → 400 dengan `errors[0].Message = "Tabel di selection belum punya column pairings"`. Keputusan: ganti auto-save dengan **explicit commit per tabel** — pairing diedit di dirty state lokal, tersimpan saat user klik tombol "Simpan Pairing untuk Tabel Ini"; pindah tabel dengan dirty state memunculkan dialog konfirmasi (Buang / Simpan / Batal). Sejalan dengan keluhan UX awam: "setelah checklist tabel, aku tidak tahu harus apa lagi" — mental model sekarang konsisten dengan `TablePicker` ("edit lokal → klik Simpan Seleksi").

## Considered Options

- **(A) Fix race, pertahankan auto-save** — gunakan `mutate(key, fetcher, { revalidate: true })` blocking, optimistic update, tambah indicator "Tersimpan ✓ 14:23". Ditolak: (1) mental model "magic auto-save" tetap membingungkan orang awam, tidak menjawab keluhan asli; (2) `useMemo` derive dari `profile` props yang mengalir lewat SWR cache tetap bisa stale pada cross-component re-render — perbaikan parsial dan rapuh.
- **(B) Explicit commit per tabel** *(dipilih)* — state dirty di-isolate di `PairingEditor` per `tableName`. Save dipanggil 1× saat klik tombol; tombol di-disable saat in-flight; pindah tabel dengan dirty state ditahan dialog. Konsisten dengan pola `TablePicker` ("Simpan Seleksi").
- **(C) BE per-tabel merge endpoint** — buat `PUT /api/profiles/{id}/pairings/{table}` yang merge ke `column_pairings_json` existing di BE. Race jadi mustahil di level data. Ditolak: (1) mental model FE tetap "auto-save magic" — keluhan UX awam tidak teratasi; (2) menambah surface API baru tanpa keuntungan UX; (3) endpoint full-overwrite existing sudah cocok untuk pola commit per tabel (FE kirim full mappings yang sudah benar).

## Consequences

### FE state model

- `PairingEditor` punya `useState<ProfileMappings>` lokal sebagai *draft*, di-`init` dari `profile.column_pairings_json` saat mount / saat `tableName` berubah.
- Boolean `isDirty` derived: deep-compare draft vs source.
- Tombol "Simpan Pairing untuk Tabel Ini" di bawah tabel pairing — `disabled={!isDirty || isSaving}`, label saat saving = "Menyimpan...".
- Pindah tabel saat `isDirty=true` → dialog (radix `<AlertDialog>`): `[Buang Perubahan]` `[Simpan Dulu]` `[Batal]`. Default focus = Batal (paling aman).
- Setelah commit sukses: `mutate(key)` dengan await, lalu `setDirty(false)`.
- `RuleEditorDialog` tetap auto-save di handler `handleSaveRule` — rules per-kolom punya granularity berbeda dan sudah modal-confirmed; tidak ikut perubahan ini.

### BE

- Tidak ada perubahan kontrak `PUT /api/profiles/{id}/pairings` — full overwrite sudah benar untuk commit per tabel selama FE selalu kirim draft yang sudah merge entri tabel-tabel lain dari source fresh.
- Auto-downgrade `ready → draft` di `profiles_extra.go:75-77` tetap berlaku saat commit (lihat revisi ADR-0014).

### UX awam

- Mental model jelas: "saya tahu kapan tersimpan" — feedback eksplisit.
- Indikator dirty (badge "Belum disimpan" di tab tabel sidebar) mencegah user lupa commit sebelum klik Tandai Siap.
- Tombol "Tandai Siap" otomatis di-disable saat ada dirty state di tabel manapun (cek across-table dirty melalui state lifted ke `ProfileDetailClient`).

### Trade-off

- Lebih banyak klik (1 ekstra "Simpan" per tabel) dibanding auto-save.
- Implementasi butuh state lifting dari `PairingEditor` ke `ProfileDetailClient` agar `MarkReadyButton` tahu ada dirty tab.
- Test perlu di-update: `PairingEditor.test.tsx` saat ini meng-assert auto-save behavior; harus diubah ke commit behavior.

### Mitigasi bug data yang sudah terjadi

- Setelah deploy fix, profile yang `column_pairings_json`-nya parsial (akibat race lama) akan ditolak `MarkReady` dengan pesan ramah. User perlu buka builder, atur ulang pairing untuk tabel yang hilang, klik commit. Tidak ada migrasi otomatis — data parsial tidak bisa di-recover tanpa input user.

### Pengaruh ke ADR sebelumnya

- **ADR-0014** direvisi: tambah klausa eksplisit bahwa "commit pairing per tabel" adalah pemicu auto-downgrade `ready → draft` yang konsisten (sebelumnya hanya disebut implisit lewat "edit yang merusak invarian"). Selaras dengan kode `profiles_extra.go:75-77` yang sudah auto-downgrade.
- **CONTEXT.md** baris ~106 (klaim "edit pairing/rules tidak otomatis turunkan status di V1 — explicit toggle") perlu dikoreksi — itu kontradiksi dengan kode dan dengan ADR-0014 itu sendiri.
