# Magic MariaDB Sync

Sinkronisasi satu arah (one-way sync) untuk database MariaDB dengan antarmuka pengguna modern.

## Mulai Cepat

1. Unduh binary untuk sistem operasi Anda dari [Releases](https://github.com/kentoespdam/mariadb-magic/releases)
2. Eksekusi binary
3. Browser akan terbuka otomatis dengan antarmuka web
4. Tambahkan koneksi source dan destination MariaDB
5. Buat mapping profile dan jalankan sync pertama

## Persyaratan

- MariaDB/MySQL sebagai source dan/atau destination
- Sistem operasi: Linux (amd64/arm64) atau Windows (amd64)

## Cara Penggunaan

### Tambah Koneksi
1. Klik "Tambah Koneksi" di dashboard
2. Isi detail koneksi: nama, host, port, user, password
3. Klik "Test Koneksi" untuk memverifikasi
4. Simpan koneksi

### Buat Mapping Profile
1. Klik "Buat Mapping Profile"
2. Pilih koneksi source dan destination
3. Pilih tabel yang akan disinkronkan
4. Pasangkan kolom source ke kolom destination
5. Opsional: tambahkan rule transformasi data
6. Tandai sebagai "Siap" setelah selesai

### Jalankan Sync
1. Buka profile yang sudah siap
2. Klik "Mulai Sync"
3. Sistem akan melakukan preflight check
4. Jika lolos, sync dimulai dan progress ditampilkan
5. Bisa dibatalkan kapan saja

### Ekspor Log Error
- Di halaman detail session, klik "Unduh CSV" untuk export lengkap
- Di setiap grup error accordion, klik "Unduh CSV" untuk export per kode

## Windows SmartScreen

Jika Windows menampilkan SmartScreen warning:
1. Klik "More info"
2. Klik "Run anyway"

Ini karena binary belum di-signed. Tidak ada risiko keamanan - Anda bisa verifikasi kode sumber di GitHub.

## macOS

Versi macOS akan tersedia di versi mendatang. Sementara itu, bisa menggunakan [Docker](https://www.docker.com/) atau [Lima](https://github.com/lima-vm/lima) untuk menjalankan Linux binary.

## Pengembangan

### Build dari Sumber

```bash
# Clone repo
git clone https://github.com/kentoespdam/mariadb-magic.git
cd mariadb-magic

# Build
go build -ldflags "-s -w" -o magicsync ./cmd/magicsync

# Jalankan
./magicsync
```

### Release Build

```bash
./scripts/release.sh v0.1.0
```

Akan menghasilkan binary di folder `dist/`.

## Lisensi

MIT License