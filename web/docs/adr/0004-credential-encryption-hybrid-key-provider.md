# Credential encryption: hybrid KeyProvider (OS keystore default, passphrase opt-in)

Password koneksi MariaDB disimpan AES-GCM-encrypted di kolom `connections.password_ciphertext`. Sumber key dipilih sekali di first-run wizard antara dua mode: **OS keystore** (default, via go-keyring → libsecret/Keychain/Windows Credential Manager) atau **passphrase user** (Argon2id KDF, prompt saat app start). Mode disimpan di `app_settings.key_mode` dan tidak bisa diganti tanpa re-key flow eksplisit (dekripsi semua dengan provider lama → re-enkripsi dengan provider baru). Lupa passphrase = credential hilang permanen di V1; tidak ada escrow / recovery code.

## Considered Options

- **(A) OS keystore murni** — zero-prompt UX, paling aman terhadap pencurian file SQLite. Ditolak: pindah mesin / copy `.exe`+`.db` ke flashdisk = key hilang, semua credential jadi sampah. Bertabrakan langsung dengan tagline "single binary portable" di PRD.
- **(B) Passphrase murni** — portable, key tidak nempel di mesin. Ditolak: friction tiap start untuk persona non-IT yang biasanya satu mesin; lupa passphrase = data loss tanpa fallback.
- **(C) Hybrid via `KeyProvider` interface, mode dipilih di first-run** *(dipilih)*.

## Consequences

- **`internal/crypto/` punya 3 file**: `provider.go` (interface `KeyProvider { DeriveKey() ([]byte, error) }`), `keystore.go` (go-keyring impl), `passphrase.go` (Argon2id impl). Tetap di bawah cap 120 baris per file.
- **Tabel `app_settings` baru** di skema SQLite internal: `key_mode TEXT NOT NULL CHECK(key_mode IN ('os_keystore','passphrase'))`, `kdf_salt BLOB`, `kdf_params_json TEXT` (Argon2id memory/iterations/parallelism — disimpan untuk forward-compat saat tuning param). Migrasi V1 wajib seed satu row.
- **Format ciphertext on-disk**: `nonce(12B) || ciphertext || tag(16B)`, base64 di kolom `password_ciphertext`. AAD = `connection.id` (mencegah swap ciphertext antar koneksi).
- **First-run wizard di M1** harus dialog dua-tombol: "Mesin pribadi (recommended)" vs "Portable / pindah-pindah laptop". Default = OS keystore. Wizard ini blocker untuk fitur Connection Profile.
- **Re-key flow (Settings → Change key mode)** di-defer ke V2 *kecuali* dibutuhkan untuk testing — V1 cukup error message "untuk ganti mode, hapus `magicsync.db` dan setup ulang koneksi".
- **OS keystore service name**: konstanta `magicsync` (collision rendah, cukup untuk V1). Account name = `db-encryption-key-v1` supaya rotasi key di V2 bisa pakai versi suffix.
- **Race condition prompt passphrase**: app harus block semua handler API sampai passphrase ter-input dan key ter-derive. Implementasi: `internal/crypto.Provider` di-resolve di `main.go` sebelum `http.ListenAndServe`; UI passphrase prompt = halaman pre-app (bukan React route, melainkan static HTML kecil yang POST ke `/_init/unlock`).
