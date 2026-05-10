# ARCHITECTURE.md

[OVERVIEW]
Magic MariaDB Sync. Portable desktop. 1-way sync (Source-wins UPSERT). 2 MariaDB schemas. Single binary. Zero-config.

[STACK]
- FE: Next.js v16.2.6 (App Router, src/ dir, TypeScript, Static) + shadcn/ui v4.7.0 + Tailwind CSS v4.3.0. `go:embed` in binary.
- BE: Go (std lib + SQL drivers). API + runner.
- State: SQLite (pure-Go/CGO-free). Stores connections, profiles, sessions, logs.
- Comm: SSE (Real-time progress Go -> UI).

[CORE]
- Runner: Whole-table (`SELECT *`). UPSERT (PK Dest = Match Key, Source wins). Chunk 500-1000 rows/tx.
- Closure Advisor (ADR-0015): Compile-time FK DAG (Source ∪ Dest). Replaces runtime JIT. Topological order.
- Rule Engine: Go-side transform. Whitelist: `cast`, `enum_map`, `regex_replace`, `string_op`, `date_format`.
- Crypto (ADR-0004/0011): AES-GCM for SQLite creds. KeyProvider: OS Keystore (default) | Passphrase (portable).
- DB Heal (ADR-0017): DB beside binary. Auto-recreate if lost, quarantine if corrupt.

[FLOW]
1. Setup: User defines Mapping Profile (selection, pairs, rules).
2. Closure: Advisor resolves FK dependencies.
3. Preflight: Check schema drift (Source/Dest).
4. Run: Fetch chunk -> apply Rules -> UPSERT Dest.
5. Notify: SSE Broker sends progress/errors to UI.

[INTERNAL_SCHEMA]
`connections` (enc creds) | `mapping_profiles` (JSON) | `sync_sessions` (logs) | `sync_logs` (row-fail user-friendly).

[DEPLOY] (ADR-0021)
Manual cross-compile: Win (amd64), Linux (amd64/arm64). Portable single binary. SQLite auto-created first-run.