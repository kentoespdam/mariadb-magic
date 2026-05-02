# Credential mode wizard: lazy-prompt, no auto-detection, loud passphrase warning

Pemilihan mode enkripsi credential (`os_keystore` vs `passphrase`) **tidak** ditanyakan saat first-run binary. Wizard muncul di titik *first credential-touching action* — tombol "Tambah Koneksi" pertama kali diklik. Wizard berbahasa awam dengan dua pilihan eksplisit ("Komputer ini hanya saya pakai sendiri" → OS keystore; "Saya pakai dari USB / komputer berganti-ganti" → passphrase), detail teknis disembunyikan di collapsible. Mode `passphrase` mewajibkan checkbox "Saya sudah simpan passphrase di tempat aman, lupa = data koneksi hilang permanen" sebelum tombol Lanjut aktif. **Tidak ada auto-detection** portable vs fixed — heuristik (drive USB, path relatif, dll) terlalu rentan false-positive untuk keputusan security-sensitive.

## Considered Options

- **(A) First-run modal wajib pilih sebelum apapun**. Ditolak: persona non-IT yang baru buka binary belum punya konteks "kenapa saya ditanya soal enkripsi" — wizard di luar konteks aksi terasa konfrontatif, drop-off tinggi, dan banyak user akan klik random tanpa baca.
- **(B) Lazy-prompt di first credential action + warning loud + tanpa auto-detection** *(dipilih)*.
- **(C) Auto-detect portable** (binary di drive USB → default passphrase, di path sistem → default keystore). Ditolak: heuristik USB tidak reliable di Linux (bind mounts, removable HDD), Windows (network drives mapped as local), macOS (DMG-mounted). False-positive bikin user di komputer fixed di-prompt passphrase tanpa alasan jelas; false-negative bikin user portable kehilangan credential saat pindah komputer. Lebih baik tanya eksplisit.
- **(D) Default ke passphrase tanpa wizard** (always-portable). Ditolak: persona target = single-user UMKM di komputer kerja sendiri; passphrase friction tidak proporsional dengan use case dominan.

## Consequences

### UX flow

- **First-run binary**: tidak ada modal credential. Aplikasi langsung tampil dashboard kosong dengan empty state.
- **First click "Tambah Koneksi"**: sebelum form connection dibuka, wizard mode credential muncul sebagai modal blocking. Pilih mode sekali; setelah submit, `app_settings.key_mode` di-persist dan modal tidak muncul lagi.
- **Wizard copy** (Bahasa Indonesia, plain language):
  - Judul: "Sebelum kita simpan password database, tentukan cara penyimpanan"
  - Pilihan A: "Komputer ini hanya saya pakai sendiri" — caption: "Password tersimpan otomatis di brankas sistem, tidak perlu input ulang setiap buka aplikasi."
  - Pilihan B: "Saya bawa aplikasi ini di USB / pakai di komputer berganti-ganti" — caption: "Password di-kunci dengan passphrase yang Anda buat. Setiap buka aplikasi, masukkan passphrase."
  - Collapsible "Detail teknis": menyebut AES-GCM, OS keystore (Windows Credential Manager / macOS Keychain / GNOME Keyring via `go-keyring`), dan Argon2id.
- **Passphrase mode**: setelah pilih B, layar kedua minta passphrase 2x + checkbox **mandatory** "Saya sudah simpan passphrase di tempat aman. Saya paham bahwa lupa passphrase = semua password database hilang permanen, tidak ada cara pemulihan." Tombol Lanjut disabled sampai checkbox ON.
- **OS keystore mode**: setelah pilih A, langsung commit; aplikasi melakukan probe `keyring.Set/Get/Delete` untuk verifikasi service tersedia. Probe gagal (Linux tanpa GNOME Keyring/KWallet, dll) → fallback dialog "Brankas sistem tidak tersedia di komputer ini. Gunakan passphrase?" → switch ke flow B.

### Re-key flow (Settings → Keamanan)

- **Tombol "Ganti mode penyimpanan password"**: buka wizard yang sama dengan mode aktif di-highlight.
- **Eksekusi**: dalam satu transaksi SQLite — dekripsi semua `connections.password_ciphertext` dengan provider lama → enkripsi ulang dengan provider baru → tulis kembali → update `app_settings.key_mode`. Atomic; gagal di tengah = rollback, mode tidak berubah.
- **Mode passphrase → keystore**: butuh user input passphrase lama untuk dekripsi; setelahnya keystore ambil alih.
- **Mode keystore → passphrase**: butuh user buat passphrase baru + checkbox warning sama seperti first-time.
- **Lupa passphrase tidak bisa di-rekey** — tidak ada decrypt path. UI menyediakan "Reset semua koneksi" (hapus semua row `connections`, tetap di mode passphrase atau pindah ke keystore) sebagai escape hatch destructive yang eksplisit.

### Skema

- **`app_settings`** (sudah ada per CONTEXT.md): `key_mode TEXT NOT NULL CHECK (key_mode IN ('os_keystore', 'passphrase'))`, plus salt + Argon2id params (memory, iterations, parallelism) saat mode passphrase. Default row tidak diisi sampai user menyelesaikan wizard — kolom nullable di V1, NOT NULL setelah wizard selesai (di-enforce di app layer, bukan constraint).
- **Tidak ada kolom "wizard_completed_at"**: presence of `key_mode` row sudah cukup sebagai sentinel.

### Edge cases

- **User klik "Tambah Koneksi" lalu cancel wizard**: wizard di-tutup, kembali ke dashboard tanpa state berubah. Klik berikutnya muncul lagi.
- **User punya passphrase mode, lupa, restart aplikasi**: prompt unlock muncul saat pertama kali credential dibutuhkan (start sync, edit connection, test connection). 3x salah = lock 60 detik (rate limit, bukan delete). Tidak ada "Forgot passphrase" link — UI sebut: "Passphrase tidak bisa direset. Hapus semua koneksi via Settings untuk memulai ulang."
- **User pindah binary + SQLite ke komputer baru, mode keystore**: keystore di komputer baru tidak punya entry → semua credential gagal didekripsi → UI tampil banner "Password database tidak bisa dibuka di komputer ini. Mode keystore terikat ke OS asal. Pindah ke mode passphrase atau re-input password koneksi." Tombol "Re-input semua koneksi" (hapus ciphertext, biarkan row + nama tetap, prompt password ulang per koneksi saat dipakai).
- **User pindah binary + SQLite ke komputer baru, mode passphrase**: passphrase prompt muncul; jika ingat → seamless. Inilah skenario yang dijaga oleh mode passphrase.

### UI Settings/Health

- "Mode penyimpanan password: Brankas sistem (OS Keystore)" atau "Passphrase"
- Tombol "Ganti mode penyimpanan password"
- Tombol "Reset semua koneksi" (destructive, dengan dialog konfirmasi double-prompt)

### Test M2/M7

- Wizard tidak muncul di first-run launch tanpa klik "Tambah Koneksi".
- Wizard muncul tepat sekali di first credential action, tidak muncul lagi setelahnya.
- Pilih passphrase tanpa centang checkbox → tombol Lanjut tetap disabled.
- Pilih keystore di Linux tanpa keyring service → fallback dialog ke passphrase.
- Re-key keystore → passphrase: semua connection row tetap bisa connect setelah re-key.
- Re-key passphrase → keystore dengan passphrase salah → rollback, mode tidak berubah, error message jelas.
- 3x salah passphrase di unlock → lock 60s, attempt ke-4 dalam window di-reject.
- SQLite + binary dipindah lintas mesin di mode keystore → banner muncul, tombol "Re-input" mengosongkan ciphertext bukan menghapus row.
