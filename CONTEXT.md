# Magic MariaDB Sync

Desktop portable app. Sync satu arah antar 2 MariaDB skema beda. Tujuan: pindah data produksi ke salinan lokal buat laporan tanpa SQL.

## Language

**Source**: MariaDB asal, *system of record*. _Avoid_: master/primary/origin/Host A (kecuali UI koneksi).

**Destination**: MariaDB tujuan, *derived copy*. PK match -> ditimpa. _Avoid_: target/replica/slave/Host B.

**Sync Session**: 1 eksekusi Source->Destination pakai 1 Mapping Profile. Status: `running`/`done`/`interrupted`/`failed`/`cancelled`. **Tidak resumable V1** — non-`done` -> mulai baru fresh. Idempoten via Source-wins UPSERT -> re-run aman. ADR-0019. _Avoid_: job/run/transfer/resume.

**Mapping Profile**: resep sync, ikat 1 pasang Source/Dest. Isi: Selection Set + Column Pairing per tabel + Rules. Disimpan JSON di `mapping_profiles.rules_json`. `status`: `draft` (boleh unresolved) | `ready` (lulus structural validator). Hanya `ready` boleh start Session. _Avoid_: template/config/recipe.

**Column Pairing**: map 1-per-1 kolom Dest -> sumber: Source col / Constant / NULL / DB Default / Skip. Auto-match: nama identik (case-insensitive) + tipe kompatibel; sisanya user-resolved. Tidak boleh unresolved sebelum sync. 1 Source col -> N pairing OK (fan-out). Semantik UPSERT non-Source distinct:
- `Kosongkan/NULL` = INSERT NULL + UPDATE col=NULL (selalu NULL)
- `Default DB` = INSERT DEFAULT + UPDATE col=DEFAULT(col) (re-sync reset)
- `Lewati` = drop dari INSERT list + UPDATE skip kolom (**preserve existing** — opt-out Source-wins per kolom)

ADR-0023. _Avoid_: column mapping/field binding.

**Rule**: transformasi per pairing. V1: 5 tipe whitelist — `cast`, `enum_map`, `regex_replace`, `string_op` (trim/upper/lower/substring), `date_format` (`on_parse_error`: `null`|`keep_original_string`|`fail_row`). Max 1 per pairing, no chaining, no conditional (label legacy "IFTTT" misleading). Disimpan flat JSON di `rules_json` key `"<dest_table>.<dest_col>"`. Runtime `func(row) row`. Pairing = dari mana, Rule = bagaimana. PK col tidak boleh punya Rule. _Avoid_: transform/mapping/IFTTT.

**Closure Advisor**: compile-time, jalan 2x:
1. Save profile -> ekspansi closure, simpan ke `mapping_profiles.selection_json` dgn role per tabel (`user_selected`|`advisor_added`)
2. Klik Start -> re-introspect Source, recompute closure, deteksi drift

Closure pakai **dual-side FK** (union FK Source ∪ FK Dest) -> skenario "Dest punya FK yg Source ngga" tidak meledak. Expand -> dialog wajib; shrink -> info ringan. Sync block sebelum Selection Set tertutup FK. Race runtime (orphan/live write) -> fallback per-baris error 1452. _Avoid_: FK validator/parent checker.

**JIT Parent Sync** *(istilah PRD legacy = Closure Advisor V1)*: dulu rekursi runtime, sekarang compile-time. Tidak ada rekursi FK saat eksekusi. _Avoid_: cascade insert/FK resolver/runtime parent resolution.

**Whole-table mode**: V1 strategi tunggal — `SELECT *` Source seluruh Selection Set (closed under FK), upsert ke Dest chunk 500–1000 baris.

**Source-wins UPSERT**: Match Key cocok -> Dest ditimpa nilai Source. Edit lokal Dest hilang.

**Match Key**: tuple PK Dest. Closure Advisor wajib pastikan tiap PK Dest paired ke Source (bukan Const/Default/NULL/Skip), tidak boleh di-Rule. AUTO_INCREMENT Dest diabaikan; nilai eksplisit Source dikirim. UNIQUE-non-PK tidak didukung sbg Match Key V1. _Avoid_: primary key (ambigu)/upsert key.

**Selection Set**: tabel yang user **pilih eksplisit**. User pilih dari kebutuhan laporan, bukan topologi FK. **Tabel-level only V1**: `[]string` nama tabel, no kolom-subset. Filter kolom via Pairing "Lewati" atau desain skema Dest. ADR-0018. _Avoid_: column selection/table+column subset.

**Dependency Closure**: Selection Set ekspansi ke induk transitif via FK. Dihitung pre-Session start, preview ke user, eksekusi topological order (induk dulu).

**Sample Preview**: read-only side-by-side **20 baris pertama per tabel** post-Pairing+Rule. Tujuan: user lihat hasil Rule sebelum Start (catch enum_map salah, format tanggal salah, regex over-match). Non-blocking, no Dest connection, no transaksi. SELECT-only Source. Beda dari Closure preview (daftar tabel). Bukan dry-run penuh. **Strategy**: `SELECT ... LIMIT 20` natural order, no `ORDER BY`. Persona butuh sanity-check Rule, bukan audit data. Edge case data -> Preflight + runtime fallback. _Avoid_: dry-run/test sync.

## Relationships

- 1 Mapping Profile -> 1 Selection Set + pasangan Source/Dest
- Dependency Closure = Selection Set ∪ semua induk transitif FK
- Closure Advisor enforce: Selection Set = Dependency Closure pre-Session
- 1 Sync Session -> Whole-table atas Selection Set, topo order
- 1 Sync Session -> N Sync Log (per baris gagal)

## Example dialogue

> **Dev:** "User edit baris di Dest, lalu Sync berikutnya menyentuh PK sama, apa terjadi?"
> **Domain expert:** "Edit hilang. Konsekuensi Source-wins UPSERT — Dest bukan tempat menyimpan perubahan."

## Flagged ambiguities

- "sinkronisasi" sempat ambigu (replikasi/fill-gaps/merge) -> resolved: Source-wins UPSERT.

## Operational notes

- **Friendly errors**: `internal/sync/errors.go` -> `ToFriendly(mysqlErr) (userMsg, technicalMsg)`. Lookup MariaDB code + regex extract konteks (kolom/nilai/constraint) ke template ID. Whitelist V1: 1048/1062/1264/1292/1366/1406/1452 (row); 2002/2003/2006/2013 (conn -> SSE error event, bukan row log). Fallback generic. No i18n V1; identifier code English.

- **SSE progress**: `GET /api/sessions/{id}/events` -> event `snapshot` (counts + last 50 row failures) saat connect, lalu live `progress`/`row_failed`/`done`. No replay buffer; source of truth = `sync_sessions` (counts update per chunk-commit *sebelum* publish event) + `sync_logs`. Reconnect = snapshot baru. `Last-Event-ID` ignored V1.

- **Profile snapshot**: `mapping_profiles` update in-place, tapi `sync_sessions.profile_snapshot_json` freeze full `{selection, rules, source_connection_id, destination_connection_id, profile_id}` saat Session start. Runner baca snapshot, bukan profile aktif. UI Session Detail render snapshot + badge "profile berubah" jika hash beda. Credentials tidak di-snapshot (decrypt runtime dari `connections`).

- **Cross-profile collision**: save profile -> `internal/repo/mapping_profiles.go` cek overlap Selection Set (post-Closure) dgn profile lain `destination_id` sama. Overlap != 0 -> hard-fail `ToFriendlyCollision(conflicts)` daftar tabel + nama profile owner. Cegah 2 Source tulis ke tabel Dest sama. Self-update exclude diri. No bypass V1; user butuh multi-Source merge -> 2 Dest terpisah.

- **Schema drift**: hybrid pre-flight struktural + runtime type, **kedua sisi**. Saat Start, `internal/sync/preflight.go` re-introspect 2 DB, diff vs snapshot kolom di `selection_json` (per tabel: `{name, is_pk, is_paired, side: 'source'|'destination'}`, no tipe).
  - *Block Dest*: paired col missing, PK col missing/berubah, tabel missing, kolom baru NOT NULL no-DEFAULT, kolom `Default DB` kehilangan DEFAULT
  - *Block Source*: paired Source col missing, Source tabel missing -> "Kolom Source `{tabel}.{kolom}` tidak ditemukan. Mungkin di-rename atau dihapus. Buka Mapping Profile dan pilih ulang sumber kolom."
  - *Auto Dest*: kolom baru nullable, kolom baru ber-DEFAULT, type widened
  - *Auto Source*: kolom baru tidak referenced -> skip

  Type narrowed (VARCHAR(100)->20, INT->SMALLINT) tidak ditangkap pre-flight V1 -> deteksi runtime via 1406/1264/1366 -> `sync_logs`. **No rename detection heuristic** (similarity/type+position) -> risk salah-rebind silent. User explicit pilih ulang. Pesan via `ToFriendlyDrift` (jalur terpisah dari `ToFriendly`), banner pre-start. No bypass flag V1.

- **Retention via capacity**: V1 no time limit. `sync_logs` cap 500k high / 400k low; `sync_sessions` cap 10k / 9k. Eviction oldest-first via `id ASC LIMIT N` (autoincrement = proxy waktu). Trigger: post-write async dari runner setelah `rows_failed` naik + `time.Ticker` 1jam di `internal/maint/retention.go` (safety net). **`auto_vacuum = INCREMENTAL` set di migrasi M1** (irreversible retroaktif); `PRAGMA incremental_vacuum(N)` post-eviction batch — tanpa ini file tidak shrink. CASCADE: session evict -> `sync_logs` ikut hapus (incl `profile_snapshot_json`). **Export CSV wajib**: per-Session di detail + bulk di Settings/Health; tombol "Bersihkan log lama" block sampai user export atau confirm. No auto export. UI Settings/Health tampil counter + ukuran DB sbg transparansi. Test boundary: 499.999/500.001 + post-vacuum `page_count` reduction + CSV roundtrip (UTF-8 BOM Excel Windows).

- **Cancel UX**: klik Cancel mid-sync -> `POST /api/sessions/{id}/cancel` (idempotent) -> `context.Cancel()`. Cooperative chunk boundary ADR-0003: **chunk yg sudah `BEGIN` selalu commit penuh**. Cancel cegah fetch chunk berikutnya, bukan abort tx in-flight. No `tx.Rollback()` V1; chunk in-flight selesai normal, runner exit loop saat `ctx.Err() != nil` sebelum SELECT next. Latency Cancel = sisa chunk in-flight (500–1000 baris ~ratusan ms–detik); UI spinner "Membatalkan…". Status final = `cancelled` (5th enum: `running|done|interrupted|failed|cancelled`), beda dari `interrupted` (system: conn drop/crash) & `failed` (hard error). **No rollback**: baris ter-commit Dest tetap ada. UI badge netral + "{processed} baris sudah masuk Destination, hapus manual jika perlu". SSE `event: cancelled` payload `{processed, failed, cancelled_at}`. V2: PK-tracking rollback opsional / abort-chunk via `tx.Rollback()`.

- **Credential encryption**: AES-GCM untuk password MariaDB di SQLite. Hybrid `KeyProvider` interface di `internal/crypto/`:
  - (a) OS keystore (go-keyring) default
  - (b) passphrase + Argon2id KDF portable

  Mode pilih sekali first-run, simpan di `app_settings.key_mode` (`os_keystore`|`passphrase`). Ganti mode = re-key flow (decrypt-old -> encrypt-new). Lupa passphrase = credential hilang permanen. Salt + KDF params di `app_settings`, ciphertext + nonce di `connections.password_ciphertext`.

- **Mapping Builder UI (low-build-cost)**: per-tabel via shadcn `<Tabs>` + `<ScrollArea>` sidebar, 1 tab = 1 Dest table. Body = HTML `<Table>` kolom `Kolom Destination | Sumber nilai | Detail | Status`. **Sumber = 1 shadcn `<Select>` grouped** (group "Kolom Source" + "Opsi khusus": Konstanta/Kosongkan/Default DB/Lewati) — bukan two-step radio. "Konstanta" -> reveal text input adjacent conditional render. Auto-match feedback **conditional className saja** (putih + badge "Auto" abu-abu auto-matched; kuning muda + badge "Isi" oranye unresolved) — no animation lib. Counter "X dari Y belum diisi" di header tab. **Drag-drop SKIP V1** (dnd-kit + a11y + edge case touch terlalu mahal) -> dropdown searchable cukup (cmdk shadcn). **Type-mismatch warning tidak di builder** -> divalidasi Preflight (single source of truth). "Tambahkan aturan" di Detail -> shadcn `<Dialog>` (Rule editor terpisah). Stack: `Tabs`/`ScrollArea`/`Table`/`Select`/`Input`/`Badge`/`Button`/`Dialog`. Trade-off: scroll panjang tabel ≥50 kolom; no visualisasi "Source col unused"; type mismatch baru muncul Preflight.

- **Profile lifecycle (`draft`/`ready`)**: kolom `mapping_profiles.status`. Validasi 2 layer:
  - **Builder-time** (`internal/repo/mapping_profiles.go` + UI) -> *structural impossibilities*: PK Dest wajib Source (bukan Const/NULL/Default/Skip), PK no Rule, NOT NULL no-default tidak boleh "Kosongkan/NULL" atau "Lewati" (NOT NULL ber-DEFAULT boleh "Lewati"), Closure dialog wajib, cross-profile collision cek hanya vs `ready`. Block transisi `draft -> ready` dgn error inline.
  - **Preflight** (`internal/sync/preflight.go` saat Start) -> *schema drift*, tidak ulang aturan layer 1, asumsi `ready`.

  Edit `ready` yg rusak invariant -> auto-turun ke `draft` + dialog confirm. `selection_json` freeze hanya saat `draft -> ready` (Closure mahal untuk WIP save). UI: badge `Draft` (abu-abu)/`Siap` (hijau), "Mulai Sync" hanya muncul `ready`, builder header counter "X dari Y kolom siap" + "Tandai siap dipakai". `POST /api/sessions` profile `draft` -> 400 ramah. Snapshot ambil saat Session dibuat dari `ready` -> edit mid-run (turun ke `draft`) tidak ganggu runner aktif.

- **AUTO_INCREMENT Dest**: V1 tidak menyentuh counter Dest. UPSERT pakai PK eksplisit Source via `INSERT ... ON DUPLICATE KEY UPDATE`; PK collision re-sync -> branch UPDATE Source-wins. Collision gagal = UNIQUE non-PK (mis. email): error 1062 `ToFriendly` -> "Baris bertabrakan dengan data yang sudah ada di Destination pada kolom unik {key} (nilai {val}). Kemungkinan ada baris di Destination yang bukan berasal dari Source", masuk `sync_logs`. No `ALTER TABLE SET AUTO_INCREMENT` post-sync (lock cost + risiko bentrok app lain), no pre-sync scan deteksi collision (mahal + no resolusi). User insert manual Dest dgn PK yg di-claim Source -> ter-overwrite tanpa peringatan.

- **Sync Log UI (group-by-default)**: Session detail -> row failures **default group-by `mariadb_code`** (mis. "8.231 baris — Referensi data hilang (1452)") via shadcn `<Accordion>`. Per group: count, ToFriendly summary, "Unduh CSV grup ini", expand -> tabel 50 baris pertama (Dest table, PK, kolom bermasalah, pesan ramah). "Lihat semua sebagai tabel" -> flat paginated (50/halaman, sortable `created_at` + `mariadb_code`). Live count via SSE `progress` saat running — group counts re-compute client-side dari snapshot + delta. No full-text search V1. Per-group CSV pakai SQL filter `mariadb_code` di repo (bukan client-side) -> hindari memori spike. UTF-8 BOM Excel-Windows konsisten ADR-0010.

- **First-run onboarding (3-card progress)**: dashboard kosong -> **3 shadcn `<Card>`**:
  1. "Tambahkan Koneksi" — selalu unlocked
  2. "Buat Mapping Profile" — locked sampai `hasConnections` (≥1 Source + ≥1 Dest)
  3. "Mulai Sync Pertama" — locked sampai `hasReadyProfile` (≥1 `status='ready'` per ADR-0014)

  Locked: `disabled` (opacity 50%, non-interaktif, tooltip "Lengkapi langkah sebelumnya dulu"). Unlocked: CTA primer. Copy max 1–2 kalimat awam. `hasAnySession` true -> 3 card dilepas, ganti daftar Sessions terbaru + "Mulai sync baru". **No tour lib** (Shepherd/Intro/Driver) — a11y + maintenance vs payoff rendah. State derivation server: single endpoint `GET /api/onboarding/state` -> `{hasConnections, hasReadyProfile, hasAnySession}`; no 3 list separate. Trade-off: power user tidak bisa skip ke "advanced view" — V2.

- **Sample Preview (live inline per Rule)**: Rule editor (ADR-0012) -> **panel preview live** di bawah form — tabel 2-kolom `Nilai Source -> Hasil`, **5 nilai distinct + 1 NULL**. Sumber: `SELECT DISTINCT col FROM src.t WHERE col IS NOT NULL LIMIT 5` + 1 NULL hard-coded, jalan saat dialog open (cache per dialog session). Translasi Rule **client-side** pakai output `internal/rules/translate.go` via stateless endpoint `POST /api/preview/rule` body `{rule_dsl, source_connection_id, table, column}` -> `[{source_value, dest_value, status: 'ok'|'error', error_friendly?}]`. Debounce **300ms** sejak edit DSL terakhir. Per-row `status='error'` -> cell `Hasil` pesan ramah ("Tipe tidak cocok") tanpa block save Rule (runtime fallback ADR-0003). Endpoint stateless: tidak sentuh `mapping_profiles`, no persist sample (PII concern Source produksi). Spinner di panel, tidak block Save. No bulk preview "5 baris × all columns" di builder utama. No preview untuk non-Rule (Konstanta/Kosongkan/Default DB/Lewati) — eksplisit di Select.

- **Connection test (Test+Save split)**: form Tambah/Edit Koneksi -> **2 tombol independen**:
  - "Test Koneksi" — handshake `Open + Ping + USE db + SELECT 1`, timeout 5dtk per step, tidak persist
  - "Simpan" — persist apa adanya, no auto-test

  Kolom `connections.last_test_at`, `last_test_status` (`untested`|`ok`|`failed`), `last_test_error_friendly`. Edit credential -> reset `untested`. Endpoints: `POST /api/connections/test` (pre-save) + `POST /api/connections/{id}/test` (post-save, update kolom). `ToFriendlyHandshake` map -> 1045 password salah / 1049 db tidak ditemukan / 2003 server tidak terhubung / 2002 timeout / 2005 host tidak dikenal. Pesan **tidak** memuat password/full DSN. UI list badge `Belum dites`/`OK`/`Gagal` + "Test Ulang"; Builder banner kuning `failed`, abu-abu `untested` atau `last_test_at > 24h`. Banner advisory — tidak block save/start (Preflight catch handshake fail di chunk pertama). Threshold 24h hardcoded V1. Save yg hanya ubah label tidak reset `last_test_status`.

- **SQLite location (same-dir-as-binary)**: `magicsync.db` (+ `.bak` self-heal) di folder binary, resolve via `os.Executable()` + `filepath.EvalSymlinks` + `filepath.Dir()` di `internal/db/path.go`. Bukan CWD (rapuh double-click Windows), bukan `%APPDATA%`/`~/.local/share/`/`~/Library/Application Support/` (lepas portable USB), bukan user-pilih first-run wizard (onboarding bloat). Symlink eval penting: `ln -s /opt/.../magicsync ~/bin/magicsync` -> DB di `/opt/...` (folder binary nyata) -> pindah binary bawa DB. Read-only folder (mis. `/usr/local/bin/`) -> bootstrap fail pesan ramah stderr "Aplikasi tidak bisa menulis di folder X, pindahkan ke Desktop/Documents". No native dialog V1. Distribusi M8 = 1 binary per OS + README, DB lahir first-run. Pindah lintas mesin = copy folder utuh; passphrase mode (ADR-0011) ikut natural, OS keystore mode tetap terikat OS asal (banner re-input). V2: env `MAGICSYNC_DATA_DIR` override.

- **Session retry (fresh-run-only)**: Session `interrupted`/`failed`/`cancelled` tidak resume. UI Session detail non-`done` -> tombol primer "Mulai Sync Baru" (bukan "Lanjutkan") -> redirect Start Session standar dgn profile pre-selected. Runner setiap Session traversal Selection Set dari index 0 topo order; no lookup session sebelumnya, no resume state di `sync_sessions`. Idempoten via UPSERT — baris cocok PK -> UPDATE nilai Source saat ini, baris baru -> INSERT, baris yatim Dest (Source delete sejak last) tetap ada (V1 no delete propagation). Snapshot per Session independen — Session 2 freeze snapshot baru. Closure Advisor + Preflight re-jalan setiap Session start. Trade-off: dataset >10jt baris yang sering `interrupted` -> re-fetch full table. V2 candidate: `resume_from_table` + `resume_from_offset`, delete propagation opt-in, auto-retry exponential backoff.

- **Single-session global concurrency**: max **1 Session `running`** seluruh app — bukan per-Profile, bukan per-Dest. `internal/sync/runner.go` pakai `sync.Mutex` package-level + `repo.SyncSessions.AnyRunning()` cek di `POST /api/sessions` -> `409 Conflict` ramah `{error_friendly, conflict_session_id, conflict_profile_name}`. Bootstrap (`internal/db/bootstrap.go`) mark zombie `running` (crash/SIGKILL) jadi `interrupted` sebelum runner accept request baru. UI: "Mulai Sync" profile non-aktif disabled tooltip nama profile aktif; row owner aktif -> "Sedang berjalan…" + link Session detail; header global mini badge "1 sync berjalan". No auto-queue (state machine tambahan tanpa value V1) — user explicit retry. Cancel mid-run release lock setelah chunk in-flight commit. Trade-off: power user Source/Dest independent tidak bisa paralel. V2: per-Dest lock, auto-queue, multi-process file-lock. ADR-0020.

- **Distribusi M8 (Linux+Windows unsigned, manual cross-compile)**: V1 -> **linux/amd64 + linux/arm64 + windows/amd64**, **macOS skip** (Apple Dev Program $99/yr prematur + Gatekeeper friction tinggi). Cross-compile manual via `scripts/release.sh vX.Y.Z` di mesin dev (loop `GOOS`/`GOARCH` ~15 baris -> `dist/`), upload via `gh release create vX.Y.Z dist/* --notes-file CHANGELOG.md`. **SemVer longgar** mulai `v0.1.0` -> `v1.0.0` (M1–M8 lulus + smoke 3-OS); pre-1.0 breaking schema/profile JSON boleh tanpa MAJOR bump. Versi inject via `-ldflags "-X main.version=$VERSION"`, expose `GET /api/version` + UI Settings/About. **CHANGELOG.md** [Keep a Changelog](https://keepachangelog.com/) Bahasa Indonesia user akhir (mis. "Tambah dukungan Sync Session yang bisa dibatalkan"); `gh release` baca section terbaru. Flow: edit `CHANGELOG.md` -> `git tag` -> `git push --tags` -> `./scripts/release.sh` -> `gh release create`. **No GitHub Actions V1** — solo dev, cadence rendah, debug terminal lokal. Public repo Actions tetap gratis (V2 reversible). Binary unsigned: Linux nihil friction, Windows SmartScreen "More info -> Run anyway" didokumentasikan README + 2 screenshot awam (no jargon "code signing"/"EV cert"). Landing page badge platform + "macOS akan didukung versi mendatang, sementara via Docker/Lima". `-ldflags "-s -w"` cukup; **NO UPX** (trigger AV false positive Windows Defender heuristic). V2: Apple Dev + notarization, Windows EV cert ($300–400/yr), Actions matrix on-tag-push, in-app auto-update. ADR-0021.

- **CSV export format (sync_logs)**: scope **per-Session** (no cross-Session) -> `profile_snapshot_json` konsisten. **8 kolom fixed**:
  1. `waktu` (ISO 8601 UTC)
  2. `tabel_destination`
  3. `pk_baris` (JSON object selalu quoted, support composite PK)
  4. `kolom_bermasalah`
  5. `nilai_source` (string repr; NULL = literal `NULL` no quote)
  6. `kode_mariadb` (mis. `1452`/`1366`)
  7. `pesan_teknis` (raw MariaDB error)
  8. `pesan_ramah` (`ToFriendly` output)

  No `nilai_dest_existing` (Source-wins -> tidak relevan triage), no `rule_yang_aktif` (derive dari `profile_snapshot_json` + bocor DSL ke admin). **UTF-8 BOM** (`\xEF\xBB\xBF`) -> Excel Windows render Bahasa Indonesia non-ASCII benar. Quoting RFC 4180 (`csv.Writer` default): koma/newline/quote escape; `pk_baris` JSON selalu wrapped. **Streaming write** ke `io.Writer` (HTTP response) — no full result set ke memory; 100k+ baris no spike RSS. Filename: `magicsync-failures-{session_id}-{profile_slug}-{YYYY-MM-DD}.csv` (slug lowercase + dash, max 40 char). Per-group CSV (Sync Log accordion) pakai SQL filter `WHERE session_id=? AND mariadb_code=?` di repo (bukan client-side). Bulk export Settings/Health -> 1 file per Session (bukan gabungan). No `.xlsx` (binary cost ~5MB excelize). Endpoints: `GET /api/sessions/{id}/logs.csv` + `?mariadb_code=1452`. Content-Type `text/csv; charset=utf-8`, Content-Disposition `attachment; filename=...`.

- **App startup & lifecycle (ephemeral port + single-instance per data dir)**: V1 = **lokal-server-buka-browser**, bukan webview. Flow: bootstrap SQLite (ADR-0017) -> acquire single-instance lock -> `net.Listen("tcp", "127.0.0.1:0")` (kernel pilih ephemeral port; URL via `Listener.Addr()`) -> start HTTP -> `pkg/browser.OpenURL(url)` -> fallback print `Magic MariaDB Sync siap di {url}` ke stderr (headless/no DISPLAY). **Bind 127.0.0.1 only**, bukan `0.0.0.0` — local-first security: kredensial MariaDB plaintext di memori runtime + endpoint mutating tanpa CSRF (V1 trust local boundary). Remote = V2 explicit `--bind 0.0.0.0` + auth token. **Single-instance lock per data dir**: file `magicsync.lock` (advisory file lock via `github.com/gofrs/flock`) di folder `magicsync.db`. Instance kedua folder sama -> baca URL dari lock file (server tulis port saat startup), `pkg/browser.OpenURL(url)`, exit 0 — user dapat tab baru, bukan error. Folder beda = lock beda = independen (passphrase + DB terpisah, sah jalankan 2 instance). **No tray icon V1**: cross-OS systray (`fyne.io/systray`) -> CGO + macOS skip (ADR-0021) + Windows COM init + Linux DBus dependency — biaya tidak sebanding persona episodic (buka/sync/tutup). Shutdown V1 = `Ctrl+C` terminal / Task Manager / `kill PID`; README "tutup browser tidak menutup app — kembali ke terminal Ctrl+C". No idle timeout V1 — V2 candidate. Trade-off: URL ganti tiap run (no bookmark stabil) — persona double-click binary tiap sesi; user tanpa terminal awareness mungkin tinggal proses zombie sampai reboot (mitigasi: README + V2 idle timeout). ADR-0022.

- **Timezone (UTC enforcement per koneksi)**: setiap koneksi MariaDB (Source + Dest) jalankan `SET time_zone = '+00:00'` di `internal/mariadb/pool.go` setelah `Ping` sukses, sebelum query. Via `mysql.Config.Params["time_zone"] = "'+00:00'"` di DSN (paling robust — re-applied per fresh connection di pool, incl reconnect setelah idle).
  - **`TIMESTAMP`**: stored UTC internal MariaDB, dikonversi ke session `time_zone` saat SELECT — UTC enforcement -> nilai Source = UTC apa adanya, ditulis Dest dgn `time_zone` sama = **identical wall-clock string**. No drift implicit lewat zone session beda (mis. `+07:00` Jakarta vs `UTC`).
  - **`DATETIME`**: string wall-clock no zone semantics — pass-through, tidak terpengaruh `time_zone`.
  - **Rule `date_format`**: parse `time.ParseInLocation(layout, val, time.UTC)` untuk both. `internal/rules/translate.go` tidak introspect tipe MariaDB — semua nilai diasumsikan UTC. Output reformat juga UTC. Edge: `DATETIME` user-edit zone non-UTC (mis. wall-clock Jakarta `2026-05-02 14:00:00`) diperlakukan UTC saat reformat — dokumentasikan di Rule editor tooltip "Waktu dianggap UTC".

  **Preflight handshake** jalankan `SELECT @@session.time_zone, @@global.time_zone, @@system_time_zone` -> simpan ke `connections.notes_text` (advisory non-blocking) — admin Source bisa lihat "session time_zone diforce ke +00:00 oleh aplikasi". No UI per-koneksi tz override V1 (kompleks: `mysql.time_zone_name` belum tentu loaded di Source, fallback offset numerik confusing). No handshake fail "Source dan Destination harus identik time_zone" — UTC enforcement membuat redundan. **Trade-off**: downstream pipeline baca `TIMESTAMP` Dest dgn `time_zone='+07:00'` -> nilai bergeser 7 jam vs Source live (juga read `+07:00`) — mitigasi: README "Mengapa angka jam berbeda saat saya buka Destination dengan tools lain" + Settings/Health badge "Aplikasi memaksa zona UTC saat sync". V2: per-koneksi tz setting + Rule date_format `tz` field eksplisit.

- **SQLite migration strategy**: plain numbered SQL files di `internal/db/migrations/` (`001_init.sql`, `002_add_x.sql`), embedded `//go:embed migrations/*.sql`. Tabel `_migrations` (`version INTEGER PRIMARY KEY`, `applied_at TEXT`) track applied. Bootstrap (`internal/db/bootstrap.go`) loop: list embedded, version > `MAX(_migrations.version)` -> exec dalam transaction, insert version row. **No down migrations** V1 — rollback = self-heal `.bak` rebuild atau user manual restore. **No third-party lib** (golang-migrate/goose/atlas) — single binary ethos, ~30 baris hand-rolled cukup. Pre-1.0 breaking schema boleh tanpa MAJOR bump (ADR-0021); CHANGELOG.md wajib document migration affect existing data. Failure mid-migration = tx rollback, bootstrap exit pesan ramah stderr, `.bak` tidak dibuat (file asli tidak rusak — fail sebelum apply, bukan corruption).

- **Connection pool sizing**: per koneksi MariaDB di `internal/mariadb/pool.go`: `SetMaxOpenConns(4)`, `SetMaxIdleConns(2)`, `SetConnMaxLifetime(30m)`, `SetConnMaxIdleTime(5m)`. Single-session global (ADR-0020) -> max 8 conn aktif ke 1 host saat sync (4 Source + 4 Dest — read+upsert+test). Aman utk MariaDB default `max_connections=151`. Lifetime + IdleTime cegah "MySQL has gone away" setelah server `wait_timeout` (default 8jam, sering tune lebih pendek di shared hosting). Hardcoded V1; UI tuning V2.

- **Charset & collation (DSN-enforce + runtime fallback)**: setiap koneksi force `charset=utf8mb4` di DSN `internal/mariadb/pool.go` (`mysql.Config.Params["charset"] = "utf8mb4"`) — same location dgn UTC enforcement. **No preflight detection** charset/collation per kolom: `INFORMATION_SCHEMA.COLUMNS.CHARACTER_SET_NAME` + `COLLATION_NAME` introspect mahal di skema lebar; persona tidak akan reasoning "tabel A.kolom B utf8mb3 vs Dest utf8mb4 — apa yang harus saya lakukan?". `utf8mb3` deprecated MariaDB 10.6+; `utf8mb4` Source -> `utf8mb4` Dest = no-op (kasus paling umum). **Runtime per-row fallback** via existing `ToFriendly` whitelist 1366 (`Incorrect string value`): pattern hex prefix `\xF0\x9F` (4-byte UTF-8 leading = emoji/supplementary plane) -> friendly hint "Nilai mengandung karakter khusus (emoji atau aksara non-Latin) yang tidak didukung kolom Destination. Minta admin Destination ubah charset kolom ke utf8mb4 dengan `ALTER TABLE {tabel} CONVERT TO CHARACTER SET utf8mb4`". Generic 1366 (non-emoji) -> existing template "Tipe data atau format nilai tidak cocok dengan kolom Destination". **No collation mismatch detection V1**: skenario "Source `utf8mb4_general_ci` vs Dest `utf8mb4_unicode_ci` -> 1062 unique violation karena 'café' vs 'cafe' ranking beda" — rare untuk UMKM, existing 1062 template cukup. **No Builder badge "charset mismatch"** — over-engineering, noise visual non-actionable. Trade-off: 1366 baru muncul di `sync_logs` setelah first run (bukan upfront Preflight) — mitigasi: friendly message guiding admin ke `ALTER TABLE` SQL paste-able; user re-run setelah ALTER (idempotent UPSERT aman). V2: optional Preflight charset diff scan (per `INFORMATION_SCHEMA.COLUMNS`) non-blocking advisory, atau Builder per-kolom badge.

- **Credential mode wizard (lazy-prompt)**: wizard `key_mode` **tidak** muncul first-run binary; muncul saat user pertama klik "Tambah Koneksi" (first credential-touching action). Copy awam: "Komputer ini hanya saya pakai sendiri" -> OS keystore, "Saya bawa di USB / komputer berganti-ganti" -> passphrase. Detail teknis (AES-GCM, Argon2id, nama keystore per OS) di collapsible. Mode passphrase wajib checkbox "Saya sudah simpan passphrase di tempat aman, lupa = data hilang permanen" sebelum Lanjut aktif. **No auto-detection** portable vs fixed (heuristik USB/path tidak reliable lintas OS). Probe keystore gagal Linux tanpa keyring service -> fallback dialog passphrase. Re-key flow di Settings -> Keamanan; 1 transaksi SQLite (decrypt-old -> encrypt-new -> update `key_mode`); rollback atomic kalau gagal. Lupa passphrase -> "Reset semua koneksi" sbg escape hatch destructive; no Forgot Passphrase link. Pindah binary+SQLite lintas mesin di mode keystore -> banner "credential terikat ke OS asal" + tombol "Re-input" yang mengosongkan ciphertext tanpa hapus row connection. Unlock passphrase salah 3x -> lock 60dtk (rate limit, bukan delete).
