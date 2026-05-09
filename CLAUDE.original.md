# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

Pre-code: only `plan/prd.md` (product spec) and `plan/implementation.md` (milestone plan, M1–M8) exist. Source for `cmd/`, `internal/`, and `web/` has not been scaffolded yet — read both plan files before starting any task. The plan is in Bahasa Indonesia; preserve that language when editing the plan, but write code identifiers and comments in English.

## What this product is

**Magic MariaDB Sync** — a single-binary portable desktop app that syncs data between two MariaDB databases with *different schemas*, hiding SQL/FK/casting complexity behind a visual UI. Backend is Go, frontend is Next.js static-exported and served via `go:embed`. Internal state (connections, mapping profiles, sessions, row-level failure logs) lives in a pure-Go SQLite file next to the binary.

The single most critical subsystem is **JIT Parent Sync** (`internal/sync/`, milestone M4): before inserting a child row in the destination, the engine recursively resolves and inserts any missing FK parents from source. This must handle ≥3 levels of FK depth, detect cycles, and stay idempotent. PRD explicitly calls this out as the MVP reliability bar.

Other load-bearing pieces:
- **Rule translator** (`internal/rules/`): visual IFTTT rules → runtime `func(row) row` transforms, stored as JSON in `mapping_profiles.rules_json`.
- **SSE broker** (`internal/sse/`): per-session progress/row_failed/done events streamed to the UI.
- **Self-healing SQLite** (`internal/db/heal.go`): on `PRAGMA integrity_check` failure, rename file to `.bak` and rebuild — startup must never fail because the internal DB is missing or corrupt.

## Architectural rules from `plan/implementation.md`

These are mandatory and override generic Go/Next.js conventions:

- **Target ≤100 lines per file, hard cap 120.** Split before committing if exceeded. One struct per file under `internal/models/`. One resource per handler file under `internal/api/`. One table per file under `internal/repo/`.
- **DRY at the second duplication.** If a helper would be used twice, extract it (e.g. `repo/common.go` for `scanRow`/`execTx`). Avoid premature abstraction otherwise.
- **Race detector ON** for tests in `internal/sync` and `internal/sse`.
- **Encrypt connection passwords at rest** with AES-GCM (key from OS keystore or user passphrase) — never store plaintext credentials in SQLite.
- **JIT recursion must have a max-depth guard** (default 10, configurable) and fail loudly rather than spin.
- **Frontend a11y is non-negotiable:** loading skeleton, empty state, error toast, keyboard nav, focus ring, ARIA labels, `prefers-reduced-motion`, responsive ≥360px. Each route file ≤100 lines — push detail into `web/components/`.
- **V1 is one-way only.** Out of scope: bidirectional sync, scheduled/daemon mode, non-MariaDB engines. Don't add hooks for them.

## Tooling protocol (from plan + global rules)

- **Library/API lookup:** use `context7` (MCP `mcp__context7__*` tools, or `npx ctx7@latest library/docs`) before writing integration code. Specifically required for: router choice (chi vs echo), `modernc.org/sqlite` (pure-Go SQLite), `go-sql-driver/mysql`, AES-GCM lib, dnd-kit, Next.js App Router patterns, TanStack Query, shadcn/ui.
- **Codebase scan:** prefer `/graphify query "..."` over ad-hoc `ls`/`grep`/`cat` when checking for duplication or locating existing logic. Definition of Done for each milestone requires a `/graphify query` pass to confirm no duplication.
- **Skills available** (installed in `.agents/skills/`, locked via `skills-lock.json`): `tdd`, `diagnose`, `grill-me`, `grill-with-docs`, `improve-codebase-architecture`, `to-prd`, `to-issues`, `triage`, `zoom-out`, `caveman`, `write-a-skill`, `setup-matt-pocock-skills`. Invoke via the Skill tool when relevant — `tdd` and `diagnose` are the most directly useful for M2–M6 work.

## Target layout (not yet created)

```
cmd/magicsync/main.go     entrypoint: load env, init DB, mount API, embed web/out
internal/db/              bootstrap, migrate (embedded .sql), heal
internal/models/          one struct per file
internal/repo/            CRUD, one file per table, common.go for tx/scan helpers
internal/mariadb/         pool (ping retry) + introspect (tables, cols, PK, FK)
internal/sync/            graph (FK DAG + cycle detect), jit, upsert (chunk 500–1000), runner
internal/rules/           dsl, translate, validate
internal/sse/             broker, events
internal/api/             one file per resource
internal/maint/           retention (30d), incremental vacuum
web/                      Next.js App Router, output: 'export' → web/out
```

## Build / run / test

No `go.mod` exists yet. Once M1 lands, expected commands:

- `go test -race ./internal/sync/... ./internal/sse/...` — race-required packages
- `go test ./...` — everything else
- `cd web && bun build` (or `npm`/`yarn` — pick one in M1 and stick with it) → produces `web/out` consumed by `go:embed`
- `go build -ldflags "-s -w" -o magicsync ./cmd/magicsync` — release binary; cross-compile for linux/windows/mac in M8

Smoke test for the binary: drop it in an empty directory, run it, confirm SQLite file is created and the UI loads.

## Internal SQLite schema (PRD §6)

Four tables, defined via embedded `.sql` migrations in `internal/db/`:

1. `connections` — Host A/B identity + AES-GCM-encrypted credentials
2. `mapping_profiles` — `rules_json` column holds the IFTTT rule tree
3. `sync_sessions` — one row per run (start/end, counts, status: running/done/interrupted/failed)
4. `sync_logs` — row-level failures with both technical message and user-friendly message; subject to 30-day retention

## Testing expectations specific to this codebase

- **JIT depth tests are mandatory at depths 1, 2, 3, and 5**, plus cycle detection, mid-batch missing parent, idempotent rerun, and network drop (must end as `interrupted`, not `failed`, with last batch rolled back).
- **Retention test must cover the 29-day vs 31-day boundary.**
- **SSE broker** must pass with `-race` and cover reconnect + cancel-mid-flight.
- Repos test against in-memory SQLite; MariaDB introspection via testcontainer or mock.
