# Urutan Pengerjaan Issue Playwright MCP E2E - Magic MariaDB Sync

Urutan topologis berdasarkan dependency graph (`bd show <id>`). Klaim dari atas ke bawah; satu issue baru bisa diklaim setelah semua blocker-nya `closed`.

Perintah klaim: `bd update <id> --claim` · Tutup: `bd close <id>`

## Track — Playwright MCP E2E (epic `mariadb-magic-muu`)

Bangun suite E2E via **Playwright MCP server** (bukan `@playwright/test` native) untuk seluruh halaman Magic MariaDB Sync sebelum release M8. Playbook ditulis sebagai markdown di `tests/playwright-mcp/<page>.md`; agen menjalankan via tool MCP (`browser_navigate`, `browser_snapshot`, `browser_click`, `browser_type`, `browser_press_key`, `browser_evaluate`). Target binary produksi (`make build` → ephemeral port, ADR-0022), bukan `bun dev`.

**Catatan amendment Q51**: DECISIONS-Q1-Q60 me-lock testing V1 = Vitest unit + hooks only; e2e di-defer. Epic ini adalah amendment eksplisit untuk M8 candidate smoke run di binary build (Linux+Windows per Q60). Catat di body epic.

**Dua mode setiap playbook**:
1. **Happy path verification** — assert UI sesuai kontrak DECISIONS + CONTEXT.
2. **Bug-hunt mode (adversarial)** — provokasi negatif: handshake fail per error code, drift Start-time, single-session lock 409, SSE reconnect drop, Cancel UX timing, PK/NOT NULL edge, optimistic rollback, viewport gate, axe-core scan, console error assertion. Tujuan: temukan regresi sebelum release, bukan sekadar tick-mark hijau.

Epic: `mariadb-magic-muu`.

### Urutan klaim

- [x] 1. `mariadb-magic-muu.1` **[P0 fondasi]** — Infrastruktur harness: `tests/playwright-mcp/README.md` (selector convention WAJIB accessibility role/name), `tests/fixtures/docker-compose.yml` + seed SQL (Source 3307, Dest 3308; `customers`/`orders`/`order_items` + extra `customers.notes` di Dest), Makefile `test-e2e-up/-down/-bin/test-e2e`, temp-dir workaround `MAGICSYNC_DATA_DIR` _(no blocker)_ — **COMPLETED 2026-05-11**
- [x] 2. `mariadb-magic-muu.2` — Playbook **Dashboard / Onboarding** (`/`): 3-card state machine (fresh/mid/active), theme toggle, cmdk, viewport gate, remote banner _(← muu.1)_ — **COMPLETED 2026-05-12**
- [x] 3. `mariadb-magic-muu.3` — Playbook **Connections** (`/connections`): Test+Save split, handshake fail per code (1045/1049/2003/2002), edit reset `untested`, T1#3 skip-password, T1#5 delete cascade, Q49 form validation, correlation ID, LoadingBoundary _(← muu.1)_ — **COMPLETED 2026-05-12**
- [x] 4. `mariadb-magic-muu.4` — Playbook **Profile builder** (`/profiles/new`, `/profiles/{id}`): Q40 two-pane keyboard nav, Mapping Builder `<Tabs>` + grouped `<Select>`, structural validation (PK/NOT NULL/DEFAULT), Rule dialog + live preview debounce 300ms, MarkReady Q29 + DriftReport T1#2, T1#7 auto-downgrade, cross-profile collision, Q55 optimistic rename, Q56 prefetch off, no drag-drop _(← muu.1, muu.3)_ — **COMPLETED 2026-05-12**
- [x] 5. `mariadb-magic-muu.5` — Playbook **Sessions** (`/sessions/new` + detail): start happy + Closure preview, SSE `/api/sse/{id}` live progress (T1#1), Cancel UX, Sync Log group-by-mariadb_code accordion (T1#6 paginated), CSV export 8-kolom UTF-8 BOM, retry fresh-run, single-session 409 ADR-0020, schema drift Start-time, profile snapshot badge _(← muu.1, muu.4)_ — **COMPLETED 2026-05-12**
- [x] 6. `mariadb-magic-muu.6` — Playbook **Settings / Health**: credential wizard lazy-prompt, passphrase rate limit, re-key flow, retention counters + CSV bulk export, version, Q59 remote banner, timezone advisory, theme persistence, axe-core Q50 scan _(← muu.1)_ — **COMPLETED 2026-05-12**
- [x] 7. `mariadb-magic-muu.7` — Playbook **Cross-cutting**: viewport Q43, envelope Q44, surface Q45 (field/form/page/background/blocking), LoadingBoundary Q46 variants, dark contrast Q47, cmdk Q48, keyboard a11y Q50 (Tab/Arrow/Enter/Esc), correlation ID Q52, optimistic rollback Q55, prefetch Q56, Prometheus Q57, ListenAddr guard Q59 _(← muu.1, muu.2, muu.3, muu.4, muu.5, muu.6)_ — **COMPLETED 2026-05-12**

## Catatan

**Wajib baca sebelum klaim**:
1. `AGENTS.md` section `[TOOLING_MANDATE]` + `[SESSION_CLOSE]` + `[CODE_RULES]`.
2. `CONTEXT.md` — domain glossary + per-page operational notes.
3. `plan/DECISIONS-Q1-Q60.md` — Q29, Q38, Q40, Q42-Q50, Q55, Q56, Q57, Q59, plus T1#1/#2/#3/#5/#6/#7.
4. Issue description sendiri (acceptance criteria + bug-hunt scenarios).

**Tooling mandate**:
- `graphify query` SEBELUM grep / read mass file.
- `context7` mandatory untuk schema Playwright MCP tools (`browser_*`) — JANGAN tebak parameter.
- Selector **WAJIB** via accessibility role/name (`getByRole('button', {name: '...'})`); haram `text=` mentah / `nth-child` / CSS hash class (Q50 alignment).
- File playbook markdown ≤120 baris; pecah per skenario bila perlu.

**Konvensi playbook**:
- Format: pre-condition fixture → langkah bernomor → assertion via accessibility snapshot.
- Lokasi: `tests/playwright-mcp/<page>.md`.
- Results: `tests/playwright-mcp/results/<timestamp>/` (gitignore kecuali `.gitkeep`).
- Failure → markdown report + accessibility tree diff.

**Verifikasi acceptance muu.1**:
- `make test-e2e-up` start 2 docker MariaDB (`magicsync-src:3307`, `magicsync-dst:3308`), `make test-e2e-down` clean (no orphan container, no temp dir).
- `make test-e2e-bin` build binary + spawn di temp dir + tulis URL ke `.test-url`.
- `tests/playwright-mcp/README.md` cukup lengkap agar agen baru bisa langsung eksekusi tanpa nanya.
- Seed deterministic (`AUTO_INCREMENT` reset, INSERT literal ID, ~200 baris/tabel untuk uji chunk boundary 500).

**Verifikasi acceptance muu.2-muu.6** (per playbook):
- Semua skenario lulus pada binary M8 candidate (Linux + Windows per Q60; skip macOS).
- Tiap selector via accessibility role/name — grep playbook tidak boleh nemu `text=` mentah.
- Bug-hunt mode di-execute: minimal 1 skenario adversarial per playbook menemukan/mereproduksi behaviour spec (bukan crash test, tapi probe kontrak).

**Verifikasi acceptance muu.7**:
- 12 cross-cutting check lulus.
- Axe-core report attached, zero critical violation per halaman.
- Console error count = 0 saat golden path.

**Status real-time**:
- `bd ready` — yang siap dikerjakan.
- `bd blocked` — yang masih ke-block.
- `bd show mariadb-magic-muu` — status epic + child progress.
- `bd children mariadb-magic-muu` — list child issues epic.

**Session close protocol** (per AGENTS.md):
1. `git pull --rebase`
2. `bd dolt push`
3. `git push`
4. Update checklist file ini.
