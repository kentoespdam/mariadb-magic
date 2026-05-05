# CLAUDE.md

Guide for Claude Code in this repo.

## Status

Pre-code. Only `plan/prd.md` + `plan/implementation.md` (M1–M8) exist. No `cmd/`, `internal/`, `web/` yet. Read both plans before any task. Plan in Bahasa Indonesia -> keep that. Code identifiers + comments in English.

## Product

**Magic MariaDB Sync** — single-binary portable desktop app. Sync 2 MariaDB DBs w/ different schemas. Hide SQL/FK/cast complexity behind visual UI. Backend Go. Frontend Next.js static-export -> `go:embed`. State (conns, profiles, sessions, row failures) in pure-Go SQLite next to binary.

Critical subsystem: **JIT Parent Sync** (`internal/sync/`, M4). Before insert child row in dest -> recursively resolve+insert missing FK parents from source. Handle ≥3 FK depth, detect cycles, idempotent. PRD = MVP reliability bar.

Other load-bearing:
- **Rule translator** (`internal/rules/`): visual IFTTT -> runtime `func(row) row`. JSON in `mapping_profiles.rules_json`.
- **SSE broker** (`internal/sse/`): per-session progress/row_failed/done -> UI.
- **Self-heal SQLite** (`internal/db/heal.go`): on `PRAGMA integrity_check` fail -> rename `.bak` + rebuild. Startup never fail on missing/corrupt DB.

## Architectural rules (override generic conventions)

- ≤100 lines/file, hard cap 120. Split before commit. One struct/file in `internal/models/`. One resource/handler in `internal/api/`. One table/file in `internal/repo/`.
- DRY at 2nd duplication. Helper used twice -> extract (`repo/common.go` for `scanRow`/`execTx`). No premature abstraction.
- Race detector ON for `internal/sync` + `internal/sse` tests.
- Encrypt conn passwords at rest w/ AES-GCM (key from OS keystore or passphrase). Never plaintext creds in SQLite.
- JIT recursion max-depth guard (default 10, configurable). Fail loud, not spin.
- Frontend a11y mandatory: skeleton, empty state, error toast, kbd nav, focus ring, ARIA, `prefers-reduced-motion`, ≥360px responsive. Each route ≤100 lines -> push detail to `web/components/`.
- V1 = one-way only. Out: bidir sync, scheduled/daemon, non-MariaDB. No hooks for them.

## Tooling protocol (MANDATORY)

### Codebase scan = `graphify query` first

Always use `graphify query` to search for files, methods, or descriptions within the project. Avoid using `ls`, `cat`, `grep`, or `find`. Definition of Done per milestone = `graphify query` pass confirming no duplication.

### Library/API lookup = `context7` first

Always use `context7` (MCP `mcp__context7__*` or `npx ctx7@latest library/docs`) before writing integration code. Get best-practice + latest source. Required for: router (chi), `modernc.org/sqlite`, `go-sql-driver/mysql`, AES-GCM lib, dnd-kit, Next.js App Router, TanStack Query, shadcn/ui.

### Unit tests = always

New module -> always write unit tests alongside. No new module merged without test coverage. TDD preferred via `tdd` skill.

### Skills available

In `.agents/skills/`, locked via `skills-lock.json`: `tdd`, `diagnose`, `grill-me`, `grill-with-docs`, `improve-codebase-architecture`, `to-prd`, `to-issues`, `triage`, `zoom-out`, `caveman`, `write-a-skill`, `setup-matt-pocock-skills`. Invoke via Skill tool. `tdd` + `diagnose` most useful for M2–M6.

## Target layout (not yet created)

```
cmd/magicsync/main.go     entrypoint: env, init DB, mount API, embed web/out
internal/db/              bootstrap, migrate (embedded .sql), heal
internal/models/          one struct/file
internal/repo/            CRUD, one file/table, common.go = tx/scan helpers
internal/mariadb/         pool (ping retry) + introspect (tables, cols, PK, FK)
internal/sync/            graph (FK DAG + cycle detect), jit, upsert (chunk 500–1000), runner
internal/rules/           dsl, translate, validate
internal/sse/             broker, events
internal/api/             one file/resource
internal/maint/           retention (30d), incremental vacuum
web/                      Next.js App Router, output: 'export' -> web/out
```

## Build / run / test

No `go.mod` yet. After M1:

- `go test -race ./internal/sync/... ./internal/sse/...` — race-required
- `go test ./...` — rest
- `cd web && pnpm build` (pnpm locked in M1) -> `web/out` consumed by `go:embed`
- `go build -ldflags "-s -w" -o magicsync ./cmd/magicsync` — release. Cross-compile linux/win/mac in M8.

Smoke test: drop binary in empty dir, run, confirm SQLite created + UI loads.

## Internal SQLite schema (PRD §6)

4 tables via embedded `.sql` migrations in `internal/db/`:

1. `connections` — Host A/B + AES-GCM-encrypted creds
2. `mapping_profiles` — `rules_json` = IFTTT rule tree
3. `sync_sessions` — one row/run (start/end, counts, status: running/done/interrupted/failed)
4. `sync_logs` — row failures w/ technical + user-friendly msg. 30-day retention.

## Testing expectations

- JIT depth tests mandatory at depths 1, 2, 3, 5. Plus: cycle detect, mid-batch missing parent, idempotent rerun, net drop (= `interrupted` not `failed`, last batch rolled back).
- Retention test cover 29-day vs 31-day boundary.
- SSE broker pass `-race`, cover reconnect + cancel-mid-flight.
- Repos -> in-memory SQLite. MariaDB introspect -> testcontainer or mock.


<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:ca08a54f -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd dolt push
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
<!-- END BEADS INTEGRATION -->
