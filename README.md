# Magic MariaDB Sync

Magic MariaDB Sync adalah aplikasi sinkronisasi satu arah untuk MariaDB/MySQL dengan antarmuka web yang tersemat dalam binary Go.

## Fitur Utama

- Sinkronisasi satu arah (source → destination) dengan mode UPSERT.
- Mapping profile untuk menyelaraskan tabel dan kolom antara source dan destination.
- Dukungan aturan transformasi data (misalnya cast, enum_map, regex_replace, string_op, date_format).
- Deteksi drift skema sebelum menjalankan sinkronisasi.
- Enkripsi kredensial koneksi di SQLite menggunakan AES-GCM.
- GUI berbasis Next.js yang di-embed ke dalam binary.
- Dukungan Linux (amd64/arm64) dan Windows (amd64).

## Cara Pakai

1. Jalankan binary `magicsync` dari direktori proyek atau dari release.
2. Buka browser yang muncul secara otomatis, atau akses `http://localhost:3000` jika tidak terbuka.
3. Tambahkan koneksi MariaDB sebagai source atau destination.
4. Buat mapping profile dan pilih tabel serta pasangan kolom.
5. Tandai profile sebagai "Siap" dan jalankan sync.
6. Pantau progress realtime dan unduh log CSV bila diperlukan.

## Arsitektur Singkat

- Backend: Go + SQLite untuk state, SSE untuk progres realtime.
- Frontend: Next.js + TailwindCSS.
- Data diambil dengan `SELECT *`, diproses per-chunk, lalu diterapkan ke destination dengan UPSERT.
- Rule engine dan closure advisor memastikan dependensi kunci asing ditangani dengan benar.

## Pengembangan

### Membangun Binary

```bash
git clone https://github.com/kentoespdam/mariadb-magic.git
cd mariadb-magic

go build -ldflags "-s -w" -o magicsync ./cmd/magicsync
```

### Menjalankan Aplikasi

```bash
./magicsync
```

### Pengujian

```bash
go test -race ./internal/sync/... ./internal/sse/...
```

### Frontend Lokal

```bash
cd web
npm install
npm run dev
```

### Membangun Frontend

```bash
cd web
npm run build
```

## Release

```bash
./scripts/release.sh v0.1.0
```

Perintah ini akan menghasilkan binary release yang siap didistribusikan.

## Lisensi

MIT License