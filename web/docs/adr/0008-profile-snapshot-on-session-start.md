# Mapping Profile mutable + snapshot beku di Sync Session

`mapping_profiles` row di-update in-place setiap kali Closure Advisor expand atau user edit pairing/rules. Audit trail dipertahankan dengan `sync_sessions.profile_snapshot_json` — snapshot full `selection_json` + `rules_json` + connection IDs yang dibekukan saat session start. Runner membaca snapshot, bukan profile aktif. UI Sync Session detail menampilkan snapshot dengan badge "profile sudah berubah" kalau hash snapshot ≠ hash profile aktif.

## Considered Options

- **(A) Mutate in-place tanpa snapshot** — profile = satu row, di-update setiap expand. Ditolak: history "bohong" — Sync Session lama reference profile yang sudah berubah, user tidak bisa rekonstruksi apa yang sebenarnya jalan.
- **(B) Copy-on-write versioning** — `M1@v1`, `M1@v2`, dst. Ditolak untuk V1: UI listing harus filter versi lama, GC versi yatim, persona non-IT tidak peduli konsep versi.
- **(C) Mutate in-place + freeze snapshot di session** *(dipilih)*.

## Consequences

- **`sync_sessions.profile_snapshot_json TEXT NOT NULL`** kolom baru. Ditulis sekali saat `INSERT` row session di awal, immutable. Isi: `{selection: <selection_json>, rules: <rules_json>, source_connection_id, destination_connection_id, profile_id, snapshotted_at}`. Credentials *tidak* di-snapshot (di kolom `connections` terpisah, di-decrypt runtime).
- **`sync_sessions.profile_id` tetap ada** sebagai pointer lemah untuk grouping ("tampilkan semua session untuk profile ini"). Tidak FK strict — boleh dangling kalau user hapus profile (V2 mungkin tambah `ON DELETE SET NULL`).
- **`runner.go` membaca snapshot, bukan profile aktif**: melindungi dari race saat user edit profile mid-session (multi-tab) dan menjamin retry/rerun konsisten dengan run pertama.
- **Closure Advisor expand → dialog OK → mutate**: setelah user setuju expand, `mapping_profiles.selection_json` di-update; row tidak digandakan. Pairing kolom baru yang advisor tarik ikut auto-match (kalau bisa) atau ditandai unresolved.
- **UI Sync Session detail**: render snapshot. Compute `hash(profile_snapshot_json) != hash(current_profile)` → badge "Mapping Profile saat ini sudah berubah dari yang dijalankan di session ini". Hash cukup; full diff defer ke V2.
- **Storage**: ~beberapa KB per session × retention 30 hari × frekuensi user. Untuk target persona (sync mingguan) = trivial. Tidak ada kompresi V1.
- **Test M3/M5/M6**: session start menulis snapshot, edit profile setelah session selesai tidak mengubah snapshot, runner pakai snapshot bukan profile aktif, hash mismatch ditampilkan di UI.
