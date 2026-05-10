# Changelog

All notable changes to Magic MariaDB Sync will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-05-10

### Added
- **Fitur Koneksi**: Wizard koneksi database MariaDB dengan mode kredensial (AES-GCM)
- **Profile Management**: Pembuatan mapping profile dengan status draft/ready
- **Column Pairing**: Builder visual untuk pemetaan kolom source ke destination per tabel
- **Rule Editor**: Lima jenis rule transformasi data (cast, enum_map, regex_replace, string_op, date_format)
- **Preflight Check**: Deteksi schema drift sebelum sync dimulai
- **Sync Engine**: Whole-table chunked UPSERT dengan cooperative cancel
- **Sync Log**: Error logging dengan grouping berdasarkan kode MariaDB
- **CSV Export**: Export log error per session atau per grup kode error
- **Dashboard**: Halaman utama dengan tiga card progress untuk first-run
- **Settings/Health**: Halaman pengaturan dengan statistik database dan cleanup
- **Retention**: Kapasitas-based cleanup otomatis (500k logs, 10k sessions)
- **SSE Events**: Real-time progress update via Server-Sent Events

### Platform Support
- Linux amd64
- Linux arm64
- Windows amd64

### Known Issues
- macOS belum didukung (akan tersedia di versi mendatang)
- Binary belum di-signed (Windows: gunakan "Run anyway" jika SmartScreen muncul)