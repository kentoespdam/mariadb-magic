# PRD v2.0
## Magic MariaDB Sync (Portable)

### 1. Summary
Desktop portable app. Sync data antar 2 MariaDB skema beda. Hide SQL/FK/cast complexity via UI visual. Integritas tinggi -> backup + reporting.

### 2. User & Problem
- **User:** staf ops / non-IT. Pindah data prod -> lokal utk laporan.
- **Problem:** alat sync existing terlalu teknis, gagal di FK, susah konfig transform sederhana tanpa IT.

### 3. Functional Reqs
| Fitur | Deskripsi |
|---|---|
| **Smart Mapping** | Auto-detect kolom identik + Visual Rule Builder (IFTTT) -> transform nilai (enum->bool dll). |
| **JIT Parent Sync** | Rekursif: cari + sync parent hilang di Dest sebelum insert child. |
| **Chunked UPSERT** | Batch besar. PK source dipertahankan. |
| **Real-time Tracking** | Progres instan via SSE. |
| **Internal Logging** | Log gagal row-per-row -> DB internal -> laporan pasca-sync. |

### 4. Tech Arch
- **Backend:** Go. Perf, goroutines, single binary. V1 -> linux (amd64/arm64) + windows (amd64). macOS V2 (tunggu Apple Dev Program -> ADR-0021).
- **Frontend:** Next.js static export. Bundle via `go:embed`.
- **DB Internal:** SQLite pure-Go. Profil koneksi, mapping rules, log sesi.
- **Comms:** SSE. One-way Go -> UI utk progress.

### 5. Resiliency (DBA Standard)
- **Self-Healing SQLite:**
  - *Missing:* recreate DB + skema saat startup.
  - *Corrupt:* "Quarantine & Rebuild" -> rename `.bak`, build baru.
- **Maintenance:**
  - *Retention:* hapus log >30 hari.
  - *Auto-Vacuum:* DB ramping.
- **Network Safety:** graceful degradation kalau Host A/B putus mid-process.

### 6. Internal Schema (SQLite)
1. `connections` — identitas + kredensial Host A/B.
2. `mapping_profiles` — recipe pemetaan tabel/kolom (JSON).
3. `sync_sessions` — ringkasan run (waktu, count, status).
4. `sync_logs` — detail gagal teknis + pesan user-friendly.

### 7. Roadmap
- **M1:** struktur folder, `go:embed` + Next.js, init SQLite.
- **M2:** Dynamic Query Builder + Rule Translator (Go).
- **M3:** logika rekursif JIT Parent Sync.
- **M4:** UI interaktif (drag-drop mapping) + SSE.
- **M5:** finalisasi Post-Sync Receipt + auto-vacuum.

### 8. Out of Scope (V1)
- Sync 2-arah.
- Scheduling otomatis (daemon/bg task).
- DB selain MariaDB/MySQL.

> **Catatan Arsitek:** MVP fokus -> keandalan JIT Sync. Unit test wajib cover dependensi tabel >3 level -> jamin stabilitas rekursi.
