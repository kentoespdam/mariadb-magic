# Destination AUTO_INCREMENT divergence: log error 1062, no counter intervention

V1 **tidak menyentuh** AUTO_INCREMENT counter di Destination. Match Key memakai nilai PK eksplisit dari Source (bukan AUTO_INCREMENT Destination), sehingga counter Destination dan Source berkembang independen sepanjang umur Destination. Kalau collision terjadi (PK Source = N sudah ada di Destination tanpa berasal dari Source — biasanya hasil insert manual operator di Destination), MariaDB akan throw error **1062 Duplicate entry** saat UPSERT dengan `INSERT ... ON DUPLICATE KEY UPDATE` — kasus ini di V1 ditangkap sebagai *non-collision* (UPDATE branch jalan, baris ditimpa, sesuai Source-wins UPSERT). Collision yang **gagal** adalah yang mengenai UNIQUE constraint non-PK; itu di-log per-row via `ToFriendly(1062)` dengan template kontekstual yang menjelaskan "ada baris di Destination yang bukan dari Source". Tidak ada `ALTER TABLE ... AUTO_INCREMENT = MAX(id)+1` post-sync, tidak ada pre-sync scan untuk deteksi collision.

## Considered Options

- **(A) Tidak sentuh counter, MariaDB error per-row → `sync_logs` via `ToFriendly`** *(dipilih)*.
- **(B) Post-sync `ALTER TABLE SET AUTO_INCREMENT = MAX(id)+1`** untuk setiap tabel di Selection Set. Ditolak: (1) `ALTER TABLE` mengambil metadata lock yang bisa lama di tabel besar; (2) Destination mungkin dipakai aplikasi laporan lain yang juga insert — counter-bump dari sync membuat ID di app lain melompat tanpa peringatan; (3) tidak menyelesaikan masalah aslinya (collision pada UNIQUE non-PK tetap akan terjadi); (4) menggeser framing "Destination = derived copy" ke "Destination = managed by sync" yang tidak benar.
- **(C) Pre-sync scan deteksi PK collision** (`SELECT id FROM dest.t WHERE id IN (...)` atau full scan). Ditolak: (1) full PK scan di tabel besar mahal sebelum sync bahkan mulai; (2) hanya informatif — tidak ada resolusi otomatis (user tidak bisa "merge"); (3) menduplikasi logic dengan runtime 1062 yang lebih akurat (mendeteksi collision pada UNIQUE non-PK juga, bukan cuma PK).
- **(D) Sync mode "reset Destination tabel sebelum mulai"** (`TRUNCATE` per Selection Set table). Ditolak: destruktif, melanggar prinsip "user yang punya data manual di Destination boleh tambah di luar sync"; di luar scope V1.

## Consequences

### Kontrak runtime

- UPSERT statement: `INSERT INTO dest.t (...) VALUES (...) ON DUPLICATE KEY UPDATE col1=VALUES(col1), ...`. Branch UPDATE menutupi PK collision yang baris-nya **memang dari Source sebelumnya** — itu re-sync normal, bukan error.
- Kasus error 1062 yang bocor ke `sync_logs`: collision pada **UNIQUE constraint non-PK** (mis. `users.email` unique, dua baris Source dengan email berbeda salah satu sudah ditempati baris manual di Destination). PK collision murni di-handle oleh `ON DUPLICATE KEY UPDATE`.
- Tidak ada deteksi proaktif "ID Source ini sudah ada di Destination dari sumber lain" — pertama kali UPSERT, branch UPDATE akan timpa baris manual itu (Source-wins, sesuai kontrak). User yang insert manual ke kolom AUTO_INCREMENT di Destination diasumsikan paham risikonya.

### `ToFriendly(1062)` template kontekstual

```go
// internal/sync/errors.go
case 1062:
    // Parse "Duplicate entry 'val' for key 'keyname'"
    val, keyName := parseDup(err.Message)
    userMsg = fmt.Sprintf(
        "Baris ini bertabrakan dengan data yang sudah ada di Destination "+
        "pada kolom unik %q (nilai %q). Kemungkinan ada baris di Destination "+
        "yang bukan berasal dari Source — misalnya hasil input manual. "+
        "Periksa data di Destination dan hapus baris yang konflik, lalu jalankan sync ulang.",
        keyName, val)
```

- Pesan menyebutkan nama constraint + nilai yang konflik untuk kemudahan debugging manual oleh persona non-IT.
- Tidak menyebut "AUTO_INCREMENT" karena persona target tidak familiar dengan istilah; "kolom unik" lebih akrab.

### Test M5 / M6

- **PK collision via re-sync**: insert baris di Source dengan PK=100, sync sekali (baris masuk Destination), edit nilai non-PK di Source, sync kedua → baris di Destination ter-overwrite, no log entry.
- **PK collision via manual insert**: insert manual di Destination dengan PK=100, lalu Source juga punya baris PK=100 dengan nilai berbeda → sync overwrite (Source wins), no log. *Inilah perilaku yang di-dokumentasikan ke user — manual insert dengan PK yang akhirnya di-claim Source akan hilang.*
- **UNIQUE non-PK collision**: tabel `users` PK=id, UNIQUE=email. Insert manual di Destination `(id=999, email='x@y.com')`. Source punya `(id=42, email='x@y.com')`. Sync → error 1062 di `sync_logs` dengan pesan kontekstual menyebut email + nama constraint. Baris Source `id=42` tidak masuk Destination.
- **Counter divergence**: Source counter di 8473, Destination di 12000. Sync → no error. Destination counter tetap 12000 (atau lebih tinggi kalau ada insert eksternal); ID dari Source masuk apa adanya. Tidak ada `ALTER TABLE` post-sync.

### Dokumentasi user-facing

- README + Settings/Help page menyebut: "Destination dirancang sebagai salinan dari Source. Insert manual ke Destination yang menumpang ID akan ditimpa atau ditolak saat sync. Pakai Destination terpisah kalau perlu data hibrida."
- Tidak ada toggle "Destination managed mode" di V1.

### V2 candidate

- Mode "Destination read-only di luar sync" — pre-sync verifikasi tidak ada baris di luar yang berasal dari Source, hard-fail kalau ditemukan. Berguna untuk user yang ingin garansi "sync = satu-satunya penulis".
- Mode "Soft collision" — log collision pre-sync, tampilkan ke user, biarkan pilih per-row resolve. Memerlukan UI batch resolution; di luar scope V1.
