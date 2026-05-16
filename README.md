# Magic MariaDB Sync

**Versi 0.1.0** — Sinkronisasi satu arah (source → destination) untuk MariaDB/MySQL. Portable single binary dengan antarmuka web tersemat.

> ⚠️ **Beta**. Belum signed. Windows: "Run anyway" jika SmartScreen muncul.

---

## Fitur Utama

- **Sinkronisasi 1 arah** — Source-wins UPSERT per-chunk (500–1000 rows/tx).
- **Mapping Profile** — Pilih tabel, pasangkan kolom source ↔ destination.
- **Rule Engine** — 5 jenis transformasi data: `cast`, `enum_map`, `regex_replace`, `string_op`, `date_format`.
- **Closure Advisor** — Resolusi dependensi FK otomatis (topological order).
- **Preflight Check** — Deteksi schema drift sebelum sync dimulai.
- **Sync Log** — Error logging dengan pengelompokan kode error MariaDB.
- **CSV Export** — Export log error per session atau per grup kode error.
- **SSE Real-time** — Progress bar dan notifikasi via Server-Sent Events.
- **Dashboard** — 3-card progress untuk first-run; halaman sessions & log.
- **Settings & Health** — Statistik DB, kapasitas log, tombol cleanup.
- **Retensi Otomatis** — Capacity-based (500k log rows / 10k sessions).
- **Enkripsi Kredensial** — AES-GCM, key dari OS keystore atau file passphrase.
- **DB Auto-Heal** — SQLite auto-created first-run; quarantine jika korup.
- **Prometheus Metrics** — Opsional, via endpoint `/metrics`.

## Platform

| Platform | Arch | Status |
|----------|------|--------|
| Linux    | amd64 | ✅ |
| Linux    | arm64 | ✅ |
| Windows  | amd64 | ✅ |
| macOS    | -     | ❌ (rencana) |

## Arsitektur Singkat

```
┌─────────────────────────────────────┐
│  Single Binary (magicsync)          │
│  ┌──────────┐  ┌──────────────────┐ │
│  │ Go       │  │ Next.js (statis) │ │
│  │ Backend  │◄─┤ go:embed         │ │
│  │          │  │ shadcn/ui        │ │
│  │ API      │  │ Tailwind CSS     │ │
│  │ SSE      │  │ SWR + Zod        │ │
│  │ Runner   │  └──────────────────┘ │
│  │ SQLite   │                       │
│  └──────────┘                       │
└─────────────────────────────────────┘
```

**Stack:**
- **Backend**: Go 1.24 (stdlib + `go-sql-driver/mysql` + `mattn/go-sqlite3`)
- **Frontend**: Next.js 16 (App Router, `src/`, TypeScript, static export) + shadcn/ui + Tailwind CSS v4
- **State**: SQLite (CGO-free)
- **Real-time**: SSE (Go → UI)
- **Crypto**: AES-GCM (OS keystore / passphrase)
- **Observability**: Structured logging + Prometheus metrics

**Alur Sync:**
1. User buat Mapping Profile (pilih tabel, pasang kolom, atur rules)
2. Closure Advisor resolve FK dependencies → topological order
3. Preflight cek schema drift (source vs destination)
4. Runner: `SELECT *` → chunk → apply Rules → UPSERT destination
5. SSE kirim progress/error ke UI

## Cara Pakai

1. **Download** binary dari [releases](https://github.com/kentoespdam/mariadb-magic/releases) atau build sendiri.
2. **Siapkan** file key untuk enkripsi kredensial (32 byte):
   ```bash
   echo -n "kunci-rahasia-32-byte-untuk-aes-gcm" > .key
   ```
3. **Jalankan**:
   ```bash
   export ENCRYPTION_KEY_PATH=$(pwd)/.key
   ./magicsync
   ```
4. **Buka** browser di `http://localhost:8080` (atau URL yang muncul otomatis).
5. **Tambahkan** koneksi MariaDB (source & destination).
6. **Buat** mapping profile, pilih tabel, pasangkan kolom, atur rules.
7. **Tandai** profile sebagai **Siap** → klik **Sync**.
8. **Pantau** progress real-time; unduh log CSV bila perlu.

### Variabel Lingkungan

| Variabel | Default | Wajib | Deskripsi |
|----------|---------|-------|-----------|
| `APP_ENV` | `dev` | — | `dev` / `prod` |
| `LISTEN_ADDR` | `127.0.0.1:8080` | — | Bind address HTTP |
| `META_DB_PATH` | `./magic.db` | — | Path SQLite DB |
| `ENCRYPTION_KEY_PATH` | — | ✅ | File berisi kunci AES-256 (32 byte) |
| `LOG_LEVEL` | `info` | — | `debug`, `info`, `warn`, `error` |
| `METRICS_ENABLED` | `false` | — | Nyalakan endpoint `/metrics` |
| `MAGIC_ALLOW_REMOTE` | `false` | — | ⚠️ Izinkan akses remote (tidak aman) |

## Pengembangan

### Prasyarat

- Go 1.24+
- Bun 1.x
- Docker + Docker Compose (untuk E2E)

### Clone & Build

```bash
git clone https://github.com/kentoespdam/mariadb-magic.git
cd mariadb-magic

make build       # Build web + binary
```

### Menjalankan (Dev)

Buka **dua terminal**:

```bash
# Terminal 1 — Frontend
make dev-web     # cd web && bun dev → http://localhost:3000

# Terminal 2 — Backend
make dev-go      # go run ./cmd/magicsync → http://localhost:8080
```

### Testing

```bash
make test                    # Go test + web vitest
go test -race ./...          # Go test (race detector)
cd web && bun run test       # Web test (vitest) saja
```

### Makefile Targets

| Target | Deskripsi |
|--------|-----------|
| `dev` | Petunjuk menjalankan dev (dua terminal) |
| `dev-web` | Next.js dev server (`bun dev`) |
| `dev-go` | Go backend (`go run ./cmd/magicsync`) |
| `build` | Build web + binary |
| `build-web` | Build frontend hanya |
| `build-go` | Build Go binary hanya |
| `test` | Go test + web vitest |
| `embed-check` | Cek apakah FE bundle stale |
| `db-up` | Start MariaDB test containers (Docker) |
| `db-down` | Stop & hapus test containers |
| `db-reset` | Restart + seed ulang |
| `test-e2e` | Full E2E: up → bin → URL |
| `clean` | Hapus artifacts |

### CI Check (sebelum push)

```bash
make embed-check && make build && make test
```

### Struktur Proyek

```
cmd/magicsync/        # Entrypoint binary
internal/
  api/                # HTTP handlers (connections, profiles, sessions, logs, maint, system)
  config/             # Konfigurasi aplikasi
  crypto/             # AES-GCM encrypt/decrypt
  db/                 # Koneksi & migrasi SQLite
  lock/               # File lock (single-instance)
  maint/              # Maintenance (retensi log)
  mariadb/            # Interaksi MariaDB/MySQL
  models/             # Struktur data
  observability/      # Logging, metrics, handler
  repo/               # Repository pattern (SQLite)
  rules/              # Rule engine (cast, enum_map, regex, string_op, date_format, dsl)
  sse/                # Server-Sent Events broker
  sync/               # Sync engine (closure, preflight, runner, upsert)
web/                  # Next.js frontend (App Router, shadcn/ui, Tailwind)
scripts/              # release.sh
tests/                # Fixtures Docker Compose untuk E2E
```

### Frontend (manual)

```bash
cd web
bun install
bun run dev          # Dev server :3000
bun run build        # Static export → web/out/
bun run test         # Vitest
```

### Release

```bash
./scripts/release.sh v0.1.0
```

Menghasilkan binary untuk Linux (amd64/arm64) dan Windows (amd64).

## Lisensi

MIT License
