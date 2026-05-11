# ARCHITECTURE.md

[OVERVIEW]
Magic MariaDB Sync. Portable desktop. 1-way sync (Source-wins UPSERT). 2 MariaDB schemas. Single binary. Zero-config.

[STACK]
*Snapshot 2026-05-10 — source of truth: `web/package.json` + `go.mod`. Versi di sini bisa drift; cek lockfile bila ragu.*
- FE: Next.js v16.x (App Router, `src/` dir, TypeScript, Static export) + shadcn/ui + Tailwind CSS. `go:embed` in binary.
- Comm: SSE (Real-time progress Go -> UI).

[FLOW]
1. Setup: User defines Mapping Profile (selection, pairs, rules).
2. Closure: Advisor resolves FK dependencies.
3. Preflight: Check schema drift (Source/Dest).
4. Run: Fetch chunk -> apply Rules -> UPSERT Dest.
5. Notify: SSE Broker sends progress/errors to UI.

[INTERNAL_SCHEMA]
`connections` (enc creds) | `mapping_profiles` (JSON) | `sync_sessions` (logs) | `sync_logs` (row-fail user-friendly).