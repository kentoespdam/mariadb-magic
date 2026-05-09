# Implementation Plan — Magic MariaDB Sync

> Audience: junior dev / small local AI model. Bahasa high-level, no code.
> **Aturan wajib (semua task):**
> - Scan/cari logic pakai `/graphify query`. JANGAN pakai `ls`/`grep`/`cat`.
> - Cari referensi library/API resmi. Hindari nebak versi.
> - Tulis unit test untuk SETIAP modul sebelum lanjut. Fix bug langsung saat ketemu.
> - DRY: ekstrak helper jika sama dipakai 2x. Hindari abstraksi prematur.
> - Target ±100 baris per file. Split kalau lebih.
> - FE: ikuti best practice UI/UX (a11y, keyboard nav, loading/empty/error states, responsive).

---

## Struktur Folder Target
```
/cmd/magicsync          → entrypoint (main.go)
/internal/db            → SQLite bootstrap, migrations, self-heal
/internal/models        → struct domain (Connection, Profile, Session, Log)
/internal/repo          → CRUD per tabel (1 file/tabel)
/internal/mariadb       → koneksi pool + introspeksi schema
/internal/sync          → engine: planner, jit, upsert, runner
/internal/rules         → rule translator (IFTTT → SQL/Go func)
/internal/sse           → broker SSE + event types
/internal/api           → HTTP handler (chi/echo), 1 file per resource
/internal/maint         → retention, vacuum, scheduler
/web                    → Next.js (static export)
/web/app                → routes
/web/components         → UI atoms/molecules
/web/lib                → fetcher, sse client, types
```

---

## M1 — Bootstrap & Embed
**Goal:** binary Go melayani UI Next.js statis + SQLite siap pakai.

1. Init `go mod` + pilih router (chi/echo).
2. Buat `cmd/magicsync/main.go` (≤100 baris): load config env, init DB, mount API, embed `web/out` via `go:embed`.
3. `internal/db/bootstrap.go`: open SQLite (pure-Go driver, cek dokumentasi resmi untuk modernc.org/sqlite). Auto-create file kalau hilang.
4. `internal/db/migrate.go`: apply skema (4 tabel PRD §6) via embedded `.sql`.
5. `internal/db/heal.go`: deteksi corruption (PRAGMA integrity_check) → rename `.bak` → rebuild.
6. Next.js init di `/web` (App Router, `output: 'export'`). Halaman placeholder.
7. **Test:** unit untuk migrate (idempoten), heal (mock corrupt file), embed serve 200.

**Verify dengan `/graphify query "go embed entry point"`** sebelum closing milestone.

---

## M2 — Repos, Connections, Schema Introspection
**Goal:** simpan profil koneksi & baca schema MariaDB target.

1. `internal/models/*.go`: 1 struct/file (Connection, MappingProfile, SyncSession, SyncLog).
2. `internal/repo/connections.go`, `profiles.go`, `sessions.go`, `logs.go` — CRUD pakai `database/sql` + prepared stmt. DRY: helper `scanRow`/`execTx` di `repo/common.go`.
3. `internal/mariadb/pool.go`: dial dengan timeout + ping retry. Cek driver "go-sql-driver/mysql".
4. `internal/mariadb/introspect.go`: list tabel, kolom (type, nullable, default), PK, FK. Return struct rapi.
5. API `/api/connections` (CRUD), `/api/connections/:id/schema` (introspect).
6. Enkripsi password di rest (AES-GCM key dari OS keystore atau passphrase user). Cari library yang sesuai.
7. **Test:** repo (in-memory SQLite), introspect (testcontainer MariaDB atau mock), handler (httptest).

---

## M3 — Rule Translator & Mapping
**Goal:** ubah aturan visual jadi transformasi runtime.

1. `internal/rules/dsl.go`: definisikan tipe Rule (op: equals/in/range/regex; action: setValue/cast/null).
2. `internal/rules/translate.go`: Rule → fungsi `func(row map[string]any) map[string]any`. DRY per operator.
3. `internal/rules/validate.go`: validasi rule sebelum simpan (tipe kolom kompatibel).
4. Profile JSON disimpan di `mapping_profiles.rules_json`.
5. API `/api/profiles` CRUD + `/api/profiles/:id/preview` (jalankan rule di sample 10 baris).
6. **Test:** unit per operator, validate negative cases, preview integration.

---

## M4 — JIT Parent Sync (CORE — paling kritis)
**Goal:** rekursif resolve FK sebelum insert anak. **PRD §Catatan Arsitek: test ≥3 level depth.**

1. `internal/sync/graph.go`: bangun DAG dependency dari FK introspect. Detect cycle (error eksplisit).
2. `internal/sync/jit.go`: 
   - Input: tabel + PK list yang mau di-sync.
   - Untuk tiap FK kolom → query parent di src, cek exist di dst, kalau tidak → recurse.
   - Cache visited (map per session) supaya tidak dobel.
   - Max depth guard (config, default 10) — fail loud.
3. `internal/sync/upsert.go`: chunked UPSERT (batch 500–1000), `INSERT ... ON DUPLICATE KEY UPDATE`, preserve PK.
4. `internal/sync/runner.go`: orchestrate per session, emit progress event ke SSE broker, tulis `sync_logs` per kegagalan baris.
5. **Test (wajib lengkap):**
   - Depth 1, 2, 3, 5 level.
   - Cycle detection.
   - Parent missing di tengah batch.
   - Idempoten (rerun = nol perubahan).
   - Network drop di tengah (graceful: rollback batch terakhir, status `interrupted`).

---

## M5 — SSE & API Sync Control
1. `internal/sse/broker.go`: hub subscriber per sessionID. Channel buffered, drop slow client.
2. `internal/sse/events.go`: tipe event (progress, row_failed, done, error).
3. API `/api/sync/start` (POST), `/api/sync/:id/stream` (SSE), `/api/sync/:id/cancel`.
4. **Test:** broker concurrency (race detector ON), reconnect, cancel mid-flight.

---

## M6 — Maintenance
1. `internal/maint/retention.go`: cron tiap startup + interval — hapus `sync_logs` >30 hari.
2. `internal/maint/vacuum.go`: `PRAGMA auto_vacuum=INCREMENTAL` + jalankan `incremental_vacuum` periodik.
3. **Test:** retention boundary (29 vs 31 hari), vacuum tidak korupsi data.

---

## M7 — Frontend (Next.js)
**UI/UX wajib:** loading skeleton, empty state, error toast, keyboard nav, focus ring, responsive ≥360px, ARIA labels, prefers-reduced-motion. Cek pola melalui dokumentasi resmi.

Halaman (1 file route ≤100 baris, pecah ke components):
1. **Connections** — list + form (test koneksi tombol).
2. **Mapping Builder** — pilih src/dst tabel, drag-drop kolom (lib: dnd-kit), Rule Builder modal (IFTTT visual).
3. **Sync Run** — pilih profile, tombol Start, progress bar real-time (EventSource), live log tail.
4. **Post-Sync Receipt** — ringkasan + tabel kegagalan (filter, export CSV).
5. `web/lib/sse.ts`: wrapper EventSource dengan auto-reconnect.
6. `web/lib/api.ts`: fetch wrapper, error normalization.
7. **Test:** komponen pakai Vitest + Testing Library; happy + error path. Smoke E2E (Playwright) untuk flow Connection → Mapping → Sync.

---

## M8 — Packaging
1. Build `next export` → `web/out`.
2. `go build -ldflags "-s -w" -o magicsync` (cross-compile linux/win/mac).
3. Smoke test: jalankan binary di folder kosong → SQLite tercipta → UI tampil.
4. README minimal: cara jalankan + env vars.

---

## Definition of Done (per milestone)
- [ ] `/graphify query` dipakai untuk verifikasi tidak ada duplikasi.
- [ ] Semua file ≤120 baris (target 100).
- [ ] Unit test hijau, race detector ON untuk paket sync/sse.
- [ ] Tidak ada TODO/komentar sampah.
- [ ] API didokumentasi singkat di file handler (1 baris/endpoint).

## Catatan
- Kalau ragu API library → cek dokumentasi resmi, jangan tebak.
- Kalau ketemu duplikasi >2x → ekstrak ke helper langsung.
- Kalau file >120 baris → split sebelum commit.
- Prioritas reliability: M4 > M5 > sisanya.
