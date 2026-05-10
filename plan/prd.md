# PRD v2.1
## Magic MariaDB Sync (Portable)

> **Catatan revisi**: v2.1 menyesuaikan terminologi & strategi sync dengan keputusan final di `CONTEXT.md` + `docs/adr/`. **JIT Parent Sync** (rekursi runtime, PRD v2.0) digantikan **Closure Advisor** (compile-time, ADR-0001/0015). Untuk istilah otoritatif lihat `CONTEXT.md`; untuk keputusan teknis lihat `docs/adr/README.md`.

### 1. Summary
Desktop portable app. Sync **satu arah** (Source-wins UPSERT) antar 2 MariaDB skema beda. Menyembunyikan kompleksitas SQL/FK/cast lewat UI visual. Integritas tinggi via Closure Advisor + reporting per-baris.

### 2. User & Problem
- **User:** staf ops / non-IT. Pindah data prod -> lokal utk laporan.
- **Problem:** alat sync existing terlalu teknis, gagal di FK, susah konfig transform sederhana tanpa IT.

### 3. Functional Reqs
| Fitur | Deskripsi |
|---|---|
| **Mapping Profile + Smart Pairing** | Auto-match kolom Source<->Destination by-nama. Sisanya user-resolved via dropdown grouped (Kolom Source / Konstanta / Kosongkan / Default DB / Lewati). |
| **Rule Engine (whitelisted)** | 5 transformasi: `cast`, `enum_map`, `regex_replace`, `string_op`, `date_format`. Max 1/pairing, no chaining, no conditional (ADR-0012). |
| **Closure Advisor** | Compile-time, dual-side FK (Source ∪ Destination). Saat save profile + saat klik Start. Paksa user tambah induk lewat dialog (ADR-0001/0015). |
| **Whole-table Sync + Chunked UPSERT** | `SELECT *` per tabel topo order, UPSERT chunk 500–1000 baris, PK Source dipertahankan. |
| **Real-time Tracking** | SSE one-way Go -> UI: `progress`, `row_failed`, `done` event. Snapshot-on-connect, no replay (ADR-0005). |
| **Internal Logging** | Row-fail per-baris ke `sync_logs` -> friendly message via `ToFriendly`. Group-by-default UI di Sync Session detail. |

### 4. Tech Arch
- **Backend:** Go (std lib + SQL drivers). Single binary, goroutines.
- **Frontend:** Next.js static export, embedded via `go:embed`. Stack & versi: lihat `web/package.json` + `ARCHITECTURE.md`.
- **DB Internal:** SQLite pure-Go. Connections (terenkripsi AES-GCM), Mapping Profile (JSON), Sync Session, Sync Log.
- **Comms:** SSE. One-way Go -> UI utk progress.
- **Distribusi V1:** Linux amd64/arm64 + Windows amd64. **macOS skip V1** (ADR-0021).

### 5. Resiliency
- **Self-Healing SQLite** (ADR-0017):
  - *Missing:* recreate DB + skema saat startup.
  - *Corrupt:* "Quarantine & Rebuild" -> rename `.bak`, build baru.
- **Retention via capacity** (ADR-0010): cap 500k high/400k low untuk `sync_logs`, 10k/9k untuk `sync_sessions`. Eviction oldest-first + `PRAGMA incremental_vacuum`. Export CSV wajib sebelum eviction.
- **Crash recovery**: zombie `running` -> `interrupted` saat bootstrap. Sync Session non-`done` tidak resume — user start fresh (ADR-0019).
- **Single-session global** (ADR-0020): max 1 Session `running` seluruh app. Single-instance per data directory (ADR-0022).

### 6. Internal Schema (SQLite)
1. `connections` — identitas + kredensial Source/Destination (password AES-GCM ciphertext).
2. `mapping_profiles` — Selection Set + Column Pairing + Rule (JSON). Status: `draft`/`ready` (ADR-0014).
3. `sync_sessions` — ringkasan run + `profile_snapshot_json` beku saat start (ADR-0008). Status: `running`/`done`/`interrupted`/`failed`/`cancelled`.
4. `sync_logs` — detail gagal teknis + pesan ramah.

### 7. Roadmap (selaras CONTEXT.md & ADR)
- **M1:** struktur folder, `go:embed` + Next.js, init SQLite, migrasi numbered.
- **M2:** Mapping Profile builder + Rule Translator (Go-side).
- **M3:** **Closure Advisor compile-time** (dual-side FK introspection, dialog ekspansi). *(Sebelumnya M3 = "rekursif JIT Parent Sync"; di-deprecate via ADR-0001.)*
- **M4:** UI interaktif (Tabs + ScrollArea sidebar + Select grouped) + SSE progress.
- **M5:** Post-Sync Receipt, group-by-default Sync Log UI, CSV export, auto-vacuum + retention.

### 8. Out of Scope (V1)
- Sync 2-arah.
- Scheduling otomatis (daemon/bg task).
- DB selain MariaDB/MySQL.
- Resume Sync Session dari checkpoint (ADR-0019).
- Kolom-subset di Selection Set (ADR-0018).
- macOS distribusi (ADR-0021).

> **Catatan Arsitek:** MVP fokus -> keandalan **Closure Advisor** + idempoten Source-wins UPSERT. Unit test wajib cover dependency closure dual-side >3 level + drift detection (rename/drop kolom, narrow type) -> jamin stabilitas runtime fallback per-baris.
