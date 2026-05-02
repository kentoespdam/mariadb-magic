# Product Requirements Document (PRD) v2.0
## Project: Magic MariaDB Sync (Portable Edition)
### 1. Executive Summary
**Magic MariaDB Sync** adalah aplikasi desktop *portable* yang dirancang untuk memudahkan sinkronisasi data antar *database* MariaDB dengan skema yang berbeda. Fokus utamanya adalah menyembunyikan kompleksitas teknis (SQL, *Foreign Key*, *Type Casting*) dari pengguna melalui antarmuka visual, namun tetap memberikan integritas data tingkat tinggi bagi kebutuhan *backup* dan *reporting*.
### 2. User Personas & Problem Statement
 * **User:** Staf operasional atau pengguna non-IT yang perlu memindahkan data dari server produksi ke server lokal untuk kebutuhan laporan.
 * **Problem:** Alat sinkronisasi yang ada terlalu teknis, sering gagal karena kendala relasi tabel (*Foreign Key*), dan sulit dikonfigurasi untuk transformasi data sederhana tanpa bantuan tim IT.
### 3. Functional Requirements (Core Features)
| Fitur | Deskripsi |
|---|---|
| **Smart Mapping** | Deteksi otomatis kolom identik dan *Visual Rule Builder* (IFTTT) untuk transformasi nilai (e.g., enum to bool). |
| **JIT Parent Sync** | Logika rekursif yang otomatis mencari dan menyinkronkan data induk yang hilang di tujuan sebelum memasukkan data anak. |
| **Chunked UPSERT** | Pemindahan data dalam *batch* besar dengan mempertahankan Primary Key asli dari sumber. |
| **Real-time Tracking** | Indikator progres sinkronisasi yang diperbarui secara instan via Server-Sent Events (SSE). |
| **Internal Logging** | Pencatatan detail kegagalan baris-per-baris ke database internal untuk laporan pasca-sinkronisasi. |
### 4. Technical Architecture
 * **Backend:** **Go (Golang)** - Dipilih karena performa tinggi, konkurensi (Goroutines), dan kemudahan kompilasi menjadi *single binary*. *V1 dibangun untuk Linux (amd64, arm64) dan Windows (amd64); macOS direncanakan V2 setelah Apple Developer Program tersedia — lihat ADR-0021.*
 * **Frontend:** **Next.js (Static Export)** - Antarmuka interaktif yang dibungkus ke dalam *binary* Go menggunakan go:embed.
 * **Database Internal:** **SQLite (Pure Go)** - Digunakan untuk menyimpan profil koneksi, aturan pemetaan, dan log sesi.
 * **Communication:** **SSE (Server-Sent Events)** - Aliran data satu arah untuk *progress tracking* dari Go ke UI.
### 5. Resiliency & Maintenance (The DBA Standard)
 * **Self-Healing SQLite:**
   * *Missing File:* Otomatis membuat ulang database dan skema saat *startup*.
   * *Corruption:* Mekanisme "Quarantine & Rebuild" (me-rename file rusak menjadi .bak dan membuat baru).
 * **Maintenance:**
   * *Retention Policy:* Penghapusan log otomatis setelah 30 hari.
   * *Auto-Vacuum:* Menjaga ukuran file database internal tetap ramping.
 * **Network Safety:** Penanganan *graceful degradation* saat koneksi ke Host A atau Host B terputus di tengah proses.
### 6. Internal Data Schema (SQLite)
 1. **connections**: Identitas dan kredensial Host A/B.
 2. **mapping_profiles**: Resep pemetaan tabel dan kolom (dalam format JSON).
 3. **sync_sessions**: Ringkasan eksekusi (waktu, jumlah data, status).
 4. **sync_logs**: Detail kegagalan teknis dan pesan ramah pengguna.
### 7. Implementation Roadmap
 * **Milestone 1:** Setup struktur folder, integrasi go:embed dengan Next.js, dan inisialisasi SQLite.
 * **Milestone 2:** Modul Dynamic Query Builder dan Rule Translator di sisi Go.
 * **Milestone 3:** Implementasi logika rekursif JIT Parent Sync.
 * **Milestone 4:** Pembangunan UI interaktif (Drag-and-drop mapping) dan SSE integration.
 * **Milestone 5:** Finalisasi pelaporan (Post-Sync Receipt) dan mekanisme *auto-vacuum*.
### 8. Out of Scope (V1)
 * Sinkronisasi dua arah (*Bidirectional*).
 * Penjadwalan otomatis (*Daemon/Background Task*).
 * Dukungan database selain MariaDB/MySQL.
> **Catatan Arsitek:** Fokus utama pada rilis pertama (MVP) adalah **keandalan JIT Sync**. Pastikan unit test mencakup skenario dependensi tabel yang dalam (lebih dari 3 level) untuk menjamin stabilitas rekursi.
