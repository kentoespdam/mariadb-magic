# Magic MariaDB Sync

Desktop portable app. Sync satu arah antar 2 MariaDB skema beda. Tujuan: pindah data produksi ke salinan lokal buat laporan tanpa SQL.

Dokumen ini = **istilah domain + invariants yang sudah dipresentasikan di kode**. Snapshot 2026-05-16. Truth ranking: ADR > kode > dokumen ini > `plan/`.

## Language

**Source**: MariaDB asal. Kolom DB: `connections.id` referenced sebagai `mapping_profiles.source_connection_id`. _Avoid_: master/primary/origin.

**Destination**: MariaDB tujuan. PK match -> ditimpa. Kolom DB: `mapping_profiles.destination_connection_id`. _Avoid_: target/replica/slave.

**Connection**: row di tabel `connections` (`internal/repo/connections.go`). Kolom: `id`, `name`, `host`, `port`, `user`, `password_ciphertext`, `database`, `last_test_at`, `last_test_status`, `last_test_error_friendly`, `created_at`, `updated_at`. Password disimpan sebagai `<ciphertext>:<nonce>` (concat string, lihat `internal/api/connections.go:259`).

**Sync Session**: 1 eksekusi Source->Destination pakai 1 Mapping Profile. Tabel `sync_sessions` (`internal/db/migrations/006_sync_sessions.sql`). Status CHECK enum: `running` | `done` | `interrupted` | `failed` | `cancelled`. **Tidak resumable V1** (ADR-0019) — non-`done` -> mulai baru fresh. Idempoten via Source-wins UPSERT. Runner: `internal/sync/runner/`.

**Mapping Profile**: tabel `mapping_profiles` (rebuild di `internal/db/migrations/009_rebuild_mapping_profiles.sql`). Kolom JSON: `selection_json`, `column_pairings_json`, `rules_json`. Status CHECK enum: `draft` | `ready` (default `draft`). Hanya `ready` boleh start Session — divalidasi `MarkReady` (`internal/api/profiles.go:446`). _Avoid_: template/config/recipe.

**Column Pairing**: map 1-per-1 kolom Dest -> sumber. Disimpan di `mapping_profiles.column_pairings_json`. Tipe sumber (sesuai builder UI + validator): Source col / Constant / NULL / DB Default / Skip. Semantik UPSERT non-Source distinct (ADR-0023):
- `Kosongkan/NULL` = INSERT NULL + UPDATE col=NULL
- `Default DB` = INSERT DEFAULT + UPDATE col=DEFAULT(col)
- `Lewati` = drop dari INSERT list + UPDATE skip kolom (**preserve existing**)

**Rule**: transformasi per pairing. 5 tipe whitelist diimplementasi di `internal/rules/`: `cast` (`cast.go`), `enum_map` (`enummap.go`), `regex_replace` (`regex.go`), `string_op` (`stringop.go`), `date_format` (`date.go`). Validasi: `validate.go`. Translate ke `func(any) (any, error)`: `translate.go`. Disimpan flat JSON di `rules_json` key `"<dest_table>.<dest_col>"`. Max 1 per pairing, no chaining, no conditional. `date_format` punya `on_parse_error`: `null` | `keep_original_string` | `fail_row`. _Avoid_: transform/mapping/IFTTT.

**Closure Advisor**: `internal/sync/closure.go`. Compile-time, dual-side FK (Source ∪ Dest). Fungsi utama:
- `buildDAG()` — gabung FK dari introspeksi 2 sisi
- `bfsExpand()` — ekspansi tabel Selection Set ke induk transitif
- `detectCycle()` — tolak cycle antar-tabel (ADR-0002 self-ref via `FOREIGN_KEY_CHECKS=0`)
- `TopologicalSort()` — urutan eksekusi induk-dulu

Output: `[]TableWithRole{Name, Role}`, `Role` ∈ {`user_selected`, `advisor_added`}. Dipanggil dari `ProfilesHandler.GetSchema`. Race runtime (orphan/live write) -> fallback per-baris error 1452 di runner (ADR-0015).

**Whole-table mode**: V1 strategi tunggal. Chunk default 500 baris (`upsert.DefaultChunkSize` di `internal/sync/upsert/processor.go:13`). `ChunkSize` configurable lewat `upsert.Config`. UPSERT via `INSERT ... ON DUPLICATE KEY UPDATE`.

**Source-wins UPSERT**: Match Key cocok -> Dest ditimpa nilai Source. Edit lokal Dest hilang.

**Match Key**: tuple PK Dest. AUTO_INCREMENT Dest diabaikan; nilai eksplisit Source dikirim (ADR-0013). UNIQUE-non-PK tidak didukung sbg Match Key V1.

**Selection Set**: tabel yang user **pilih eksplisit**. Tabel-level only V1 (ADR-0018): no kolom-subset. Disimpan di `mapping_profiles.selection_json` dengan format `{"tables": ["t1", "t2"]}`. **Backward compatibility**: `models.TableSelection` punya custom unmarshaler untuk dukung legacy format raw array `["t1", "t2"]` (Issue icu).

**Dependency Closure**: Selection Set ∪ semua induk transitif FK. Dihitung pre-Session start.

## Relationships

- 1 Mapping Profile -> 1 Selection Set + pasangan Source/Dest connection
- Dependency Closure = Selection Set ∪ FK-transitive parents (dual-side)
- 1 Sync Session -> snapshot `profile_snapshot_json` (freeze saat start) -> Whole-table topo order
- 1 Sync Session -> N Sync Log (per baris gagal, FK ON DELETE CASCADE)

## DB schema (implemented, post-migrasi 008)

| Tabel | Kolom inti | Catatan |
|---|---|---|
| `_migrations` | `version` PK, `applied_at` | bootstrap loop di `internal/db/bootstrap.go` |
| `connections` | id, name, host, port, user, `password_ciphertext`, `database`, `last_test_*`, timestamps | password format `cipher:nonce` |
| `app_settings` | `key_mode` CHECK(`os_keystore`\|`passphrase`), `kdf_salt`, `kdf_params_json` | dibuat saat first credential touch |
| `mapping_profiles` | id, name, source_connection_id, destination_connection_id, `selection_json`, `column_pairings_json`, `rules_json`, status CHECK(`draft`\|`ready`) | mutable; snapshot dibekukan di Session |
| `sync_sessions` | id, profile_id, `profile_snapshot_json`, status CHECK(`running`\|`done`\|`interrupted`\|`failed`\|`cancelled`), `rows_processed`, `rows_failed`, `current_table` | FK profile_id |
| `sync_logs` | id, session_id, destination_table, `pk_json`, problem_column, source_value, `mariadb_code`, technical_msg, friendly_msg | FK session_id ON DELETE CASCADE |

Migrasi 1..9 di `internal/db/migrations/`. PRAGMA `auto_vacuum = INCREMENTAL` set di 001.

## HTTP API (terdaftar di `cmd/magicsync/main.go`)

- `GET /api/system/info`, `GET /api/version`
- Connections: `GET|POST /api/connections/`, `GET|PUT|DELETE /api/connections/{id}`, `POST /api/connections/batch`, `POST /api/connections/test` (pre-save), `GET|POST /api/connections/{id}/test` (post-save)
- Profiles: `GET|POST /api/profiles/`, `GET|PUT|DELETE /api/profiles/{id}`, `GET /api/profiles/{id}/schema`, `POST /api/profiles/{id}/mark-ready`, `POST /api/profiles/{id}/downgrade`, `POST /api/profiles/{id}/pairings`, `GET /api/profiles/{id}/preflight`
- Sessions: `GET|POST /api/sessions/`, `GET /api/sessions/{id}`, `POST /api/sessions/{id}/cancel`, `GET /api/sessions/{id}/logs`, `GET /api/sessions/{id}/logs/groups`, `GET /api/sessions/{id}/logs.csv`
- SSE: `GET /api/sse/{sessionID}` (handler `internal/sse/handler.go`)
- Onboarding: `GET /api/onboarding/state`
- Preview: `POST /api/preview/rule`
- Maintenance: `GET /api/maint/stats`, `POST /api/maint/evict`

## Operational notes (implemented)

- **Password decryption robustness**: Decryption logic is centralized in `decryptPassword` helper (available in `ProfilesHandler` and `Runner`) to ensure consistent handling of the `<ciphertext>:<nonce>` format and proper error propagation. This fixes issues where some endpoints (like `/api/profiles/{id}/preflight`) would fail with "Access denied" due to incorrect nonce handling.

- **Connection test (ADR-0016)**: `internal/mariadb/test.go` — Connect + `PingContext(5s)` + `USE db` (kalau ada) + `SELECT 1`.
 Pre-save endpoint return shape `{success: bool, error?: string}`. Post-save endpoint identik shape, plus persist via `repo.UpdateTestStatus(id, status, friendly)`. **Catatan**: Status di database dan API menggunakan `untested`|`ok`|`failed` (selaras dengan CHECK constraint di migrasi 003). Frontend mapping `ok` ke label `OK` / variant `success`. Friendly error: `internal/mariadb/test.go` map 1045/1049/2002/2003/2005 ke pesan Bahasa Indonesia tanpa bocor DSN. Endpoint `/api/connections/test` meneruskan pesan *friendly* ini langsung dari driver MariaDB tanpa melakukan *masking*.

- **Friendly errors (sync)**: `internal/sync/errors/` -> `ToFriendly(mysqlErr) (userMsg, technicalMsg)`. Whitelist V1: 1048/1062/1264/1292/1366/1406/1452 (row-level -> `sync_logs`); 2002/2003/2006/2013 (conn-level -> SSE error event). Fallback generic. No i18n V1.

- **API Error Surface (Issue 7s0)**: `WriteError` di `internal/api/errors.go` membungkus error dalam JSON envelope. Field `details` diisi dengan `err.Error()` untuk mempermudah debugging FE/logs tanpa bocor credential (hanya pesan error DB/internal). Correlation ID (`X-Correlation-ID`) diinjeksikan secara konsisten ke semua API request melalui middleware (`internal/api/middleware/correlation.go`) dan tercatat eksplisit di `slog.Error` beserta rincian tambahan (`details`). Fallback ke `000...000` berlaku jika middleware terlewat.

- **SSE progress**: `internal/sse/` — events `progress`, `row_failed`, `done`, `cancelled`, `error`, `snapshot`. Broker pub/sub per `sessionID`. `internal/sse/handler.go` stream `text/event-stream` JSON lines. Source of truth = `sync_sessions` (counts) + `sync_logs`. Reconnect = `snapshot` baru. `Last-Event-ID` ignored V1 (ADR-0005).

- **Profile snapshot (ADR-0008)**: `sync_sessions.profile_snapshot_json` freeze full profile saat Session start (`internal/repo/sessions_query.go:GetProfileSnapshot`). Runner baca snapshot, bukan profile aktif. Credentials tidak di-snapshot (decrypt runtime).

- **Cross-profile collision (ADR-0007)**: `internal/repo/mapping_profiles.go:HasCollision(profileID, destID, tables)` cek overlap Selection Set vs profile `ready` lain di `destination_connection_id` sama. Dipanggil saat `MarkReady`. Output `[]Conflict{Table, ProfileID, ProfileName}`.

- **Schema drift (ADR-0006)**: `internal/sync/preflight/` — `CheckSourceDrift()` + `CheckDestDrift()` -> `DriftReport`. `IsReadyEligible=true` iff no blocking drift. Dipanggil di `MarkReady` + endpoint `/api/profiles/{id}/preflight`. Detail kategori block/auto sama dgn ADR-0006 (paired col missing -> block; nullable baru -> auto). Type narrowing runtime-only via 1406/1264/1366.

- **Retention (ADR-0010)**: `internal/maint/retention.go` — capacity-based eviction. Logs cap 500k/400k, sessions cap 10k/9k. Batch eviction 100k logs / 1k sessions oldest-first. Trigger: background goroutine 1jam (`time.Ticker`) + manual via `POST /api/maint/evict`. Post-eviction: `PRAGMA VACUUM`. Stats endpoint `/api/maint/stats`. CSV export wajib pre-evict di UI (FE responsibility).

- **Cancel UX (ADR-0009)**: `POST /api/sessions/{id}/cancel` -> `context.Cancel()`. Cooperative chunk-boundary (ADR-0003): chunk yg sudah `BEGIN` selalu commit penuh. Runner exit loop saat `ctx.Err() != nil` sebelum SELECT next. Status final = `cancelled` (beda dari `interrupted`/`failed`). No rollback V1.

- **Credential encryption (ADR-0004)**: `internal/crypto/` — `KeyProvider` interface (`provider.go`). 2 implementasi:
  - `KeystoreProvider` (`keystore.go`): wrap `zalando/go-keyring`, ciphertext disimpan di OS keystore (return plain + empty nonce).
  - `PassphraseProvider` (`passphrase.go`): Argon2id KDF (default M=64MB, t=1, p=NumCPU, saltLen=16, keyLen=32) -> AES-GCM. Output base64.

  Pilih mode lewat `app_settings.key_mode`. Rekey: signature ada di interface, implementasi belum lengkap di passphrase (line 112+).

- **Mapping Profile lifecycle (ADR-0014)**: status `draft`/`ready`. Transisi:
  - `draft -> ready`: `MarkReady` validasi pairing JSON parse + rules JSON shape + `ValidateProfileForReady` + collision check + preflight tanpa blocking drift.
  - `ready -> draft`: `DowngradeToDraft` (manual via endpoint). Edit pairing/rules tidak otomatis turunkan status di V1 — explicit toggle.

- **AUTO_INCREMENT Dest (ADR-0013)**: V1 tidak sentuh counter. UPSERT pakai PK eksplisit Source. Collision UNIQUE non-PK -> error 1062 -> `ToFriendly` -> `sync_logs`. No `ALTER TABLE SET AUTO_INCREMENT`.

- **CSV export (`internal/api/logs_csv.go`)**: scope per-Session. 8 kolom fixed: `waktu`, `tabel_destination`, `pk_baris`, `kolom_bermasalah`, `nilai_source`, `kode_mariadb`, `pesan_teknis`, `pesan_ramah`. UTF-8 BOM (`\xEF\xBB\xBF`). Delimiter: `;` (semicolon — beda dari RFC 4180 default; lihat `logs_csv.go:55`). Streaming write, paginated fetch 5k/batch. Filter `?mariadb_code=N`. Filename: `magicsync-failures-{sessionID[:8]}-{slug}-{date}.csv`.

- **Onboarding state (`internal/api/onboarding.go`)**: `GET /api/onboarding/state` -> `{HasConnections, HasReadyProfile, HasAnySession, ReadyProfiles, SessionsCount}`. Single endpoint untuk 3-card progress dashboard.

- **SQLite location (ADR-0017)**: `internal/db/path.go` resolve via `os.Executable()` + `EvalSymlinks` + `filepath.Dir()`. DB file: `magicsync.db` (+ `.bak` self-heal). Bootstrap + migration di `internal/db/{bootstrap.go,migration.go,heal.go}`.

- **Single-instance lock (ADR-0022)**: `internal/lock/instance.go` — flock advisory pakai `gofrs/flock` di file `magicsync.lock` di folder DB. `TryLock()` instance kedua -> baca URL dari lock file -> `internal/lock/browser.go` buka di browser -> exit 0. Folder beda = lock beda.

- **Connection pool**: `internal/mariadb/pool.go` — `SetMaxOpenConns(4)`, `SetMaxIdleConns(2)`, `SetConnMaxLifetime(30m)`, `SetConnMaxIdleTime(5m)`. UTC enforcement via `mysql.Config.Params["time_zone"]="'+00:00'"`. Charset enforcement via `Params["charset"]="utf8mb4"`.

- **Single-session global concurrency (ADR-0020)**: `internal/sync/runner/runner.go` pakai `globalLock sync.Mutex` package-level. `repo.SyncSessions.AnyRunning()` cek di `POST /api/sessions` -> 409 ramah kalau sudah ada. Bootstrap mark zombie `running` (crash) jadi `interrupted`.

- **Migration strategy**: plain numbered SQL di `internal/db/migrations/` (`001_init.sql` .. `008_add_database_to_connections.sql`), embedded `//go:embed migrations/*.sql`. Tabel `_migrations` track applied. Bootstrap loop di `internal/db/bootstrap.go`. No down migrations.

- **Rule Preview**: `POST /api/preview/rule` (handler di `ProfilesHandler.PreviewRule`) — stateless, terima `{rule_dsl, source_connection_id, table, column}`, return `[{source_value, dest_value, status, error_friendly?}]`. Translasi via `internal/rules/translate.go`. Sample: 5 distinct + 1 NULL. Tidak persist.

## Frontend (`web/`)

- Next.js 16 + React 19 + TypeScript + Tailwind + shadcn/ui (radix-ui v1.4) + react-hook-form + zod v4. Bundler: Bun. Test: Vitest.
- **Routing Strategy**: Menggunakan `output: export` untuk embedding ke binary Go. **Dilarang menggunakan dynamic routes** (misal `[id]/page.tsx`) karena konflik dengan static export fallback di binary. Gunakan query parameters (misal `?id=...`) untuk navigasi entitas.
- Halaman utama: `/` (dashboard onboarding), `/connections`, `/profiles/new`, `/profiles/edit` (builder), `/sessions/new`.
- **Profile Builder**: Terletak di `/profiles/edit?id={profile_id}`. Komponen builder dikonsolidasi di `web/src/app/profiles/_components/builder/`.
- Form components di `web/src/forms/`: 
  - `ConnectionForm.tsx`: CRUD single connection.
  - `DualConnectionForm.tsx`: Batch create Source + Destination sekaligus.
  - `NewProfileForm.tsx`: submit `{name, source_connection_id, destination_connection_id, tables: []}` -> `profileService.create` -> mutate `profiles/list` -> redirect `/`.
- Service layer di `web/src/lib/services/`: `connections`, `profiles`, `sessions`, `system`, `preflight`, `maint`. 
  - `connectionService` expose `list/get/create/update/delete/testPreSave/testPostSave` + `batchCreate`.
  - `profileService` expose `create/update/updatePairings/updateRules/markReady/downgrade/preflight`. `updateRules(id, json)` & `updatePairings(id, json)` keduanya hit `PUT /api/profiles/{id}/pairings` dgn field berbeda.
- Types contract (`web/src/types/MappingProfile.ts`): `MappingProfile` field `destination_connection_id` (selaras BE, bukan `dest_connection_id`). `CreateProfileInput` pakai `tables: string[]` (BE marshal jadi `selection_json`). `UpdatePairingsInput` = `{column_pairings_json, rules_json}` keduanya JSON string.
- API client: `web/src/lib/apiClient.ts` (fetch wrapper). Error surface: `web/src/hooks/errorSurface.ts`.
- Embed ke binary: `cmd/magicsync` pakai `go:embed` (lihat `cmd/magicsync/main.go`).

## Tests

Go: `tests/api/connections_route_test.go`, `tests/config/config_test.go`, `tests/crypto/passphrase_test.go`, `tests/repo/mapping_profiles_test.go`, `tests/repo/mapping_profiles_collision_test.go`, `tests/rules/validate_test.go`, `tests/sync/closure_test.go`, `tests/sync/preflight/preflight_test.go`.

TS: `web/src/lib/apiClient.test.ts`, `web/src/lib/services/connections.test.ts`, `web/src/hooks/errorSurface.test.ts`.

Run: `go test -race ./...` + `cd web && bun run test`.

## Distribusi (ADR-0021)

Linux amd64/arm64 + Windows amd64 unsigned. macOS skip V1. Cross-compile manual via `scripts/release.sh`. `-ldflags "-X main.version=$VERSION -s -w"`. NO UPX. Versi expose via `GET /api/version` + UI Settings/About.

## Example dialogue

> **Dev:** "User edit baris di Dest, lalu Sync berikutnya menyentuh PK sama, apa terjadi?"
> **Domain expert:** "Edit hilang. Konsekuensi Source-wins UPSERT — Dest bukan tempat menyimpan perubahan."

## Flagged ambiguities & open bugs

- **`last_test_status` enum drift**: code di `internal/api/connections.go:430` tulis `"success"`, CHECK constraint di migrasi 003 hanya allow `untested`|`ok`|`failed`. FE `Connection.last_test_status` type juga `"success"|"failed"`. SQLite default tidak enforce CHECK strict -> tidak crash, tapi inkonsistensi. Fix: pilih satu (likely turunkan ke `ok` + update FE type) atau migrasi `004+` ubah CHECK.
- **CSV delimiter**: `logs_csv.go` pakai `;`, beda dari RFC 4180. Sengaja untuk Excel Indonesia (locale comma decimal) atau bug? Tidak terdokumentasi di ADR-0010.
- **Rekey flow (ADR-0011)**: signature `KeyProvider.Rekey(old KeyProvider)` ada, implementasi `PassphraseProvider.Rekey` stub (`internal/crypto/passphrase.go:112+`). Belum testable.
