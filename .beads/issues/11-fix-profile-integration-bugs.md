# Issue: Fix Mapping Profile Integration & Data Corruption

## MASALAH
Terjadi kegagalan integrasi pada fitur Mapping Profile yang menyebabkan data korup dan UI reset:
1. **Data Wiping (BE)**: Handler `Update` di `internal/api/profiles.go` melakukan full-overwrite menggunakan data partial dari request. Saat user menyimpan seleksi tabel dari FE, field `Name`, `SourceConnectionID`, dan `DestinationConnectionID` terhapus (menjadi string kosong). Akibatnya profil menjadi tidak valid dan UI kembali ke tampilan awal (Empty State).
2. **Type Mismatch Validation (BE)**: Handler `MarkReady` mencoba meng-unmarshal `RulesJSON` ke `map[string][]string`, sedangkan data di database disimpan dalam format `RuleStore` (`map[string]map[string]Rule`). Ini menyebabkan validasi aturan gagal.
3. **Missing Integration (FE)**: Komponen `RuleEditorDialog.tsx` belum dihubungkan ke `PairingEditor.tsx`.

## SOLUSI
1. **BE: Fix `Update` Handler**: Lakukan partial update (fetch existing first, then merge).
2. **BE: Fix `MarkReady` Validation**: Unmarshal `RulesJSON` ke `rules.RuleStore` dan konversi key-nya untuk validasi repo.
3. **FE: Link Rule Editor**: Tambahkan tombol aksi di `PairingEditor.tsx` untuk membuka `RuleEditorDialog`.

## ACCEPTANCE CRITERIA
1. Klik "Simpan Seleksi" tidak menghapus koneksi sumber/tujuan.
2. UI tetap di halaman detail setelah simpan seleksi.
3. User bisa membuka Rule Editor dan menyimpan aturan.
4. Validasi "PK tidak boleh punya Rule" berjalan di backend.
