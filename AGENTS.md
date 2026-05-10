# AGENTS.md

[META] Code/Identifiers=English. Docs/UI=Bahasa Indonesia.

[LAZY_LOAD_DOCS]
- Architecture/Data Flow: Read `ARCHITECTURE.md` when designing, debugging core logic, checking stack, or resolving frontend/backend integration decisions. DO NOT read proactively outside relevant tasks.
- Web Development Rules: Read `WEB_RULES.md` when working on UI, web components, frontend logic, or any Next.js/React implementation. DO NOT read proactively outside relevant tasks.

[TRUTH] 1. `docs/adr/` (Overrides all) -> 2. `ARCHITECTURE.md` -> 3. `CONTEXT.md` -> 4. `plan/prd.md`.

[PRODUCT]
Magic MariaDB Sync. 1-way sync. Go backend + Next.js FE (`go:embed`). State: SQLite.
Arsitektur detail: `ARCHITECTURE.md`.
Subs: Closure Advisor (compile-time FK), Rule Translator, SSE broker, Self-heal SQLite, Crypto AES-GCM.

[CODE_RULES]
- ≤100 lines/file (cap 120). Split before commit.
- 1 struct/file (`models`), 1 resource (`api`), 1 table (`repo`).
- DRY at 2nd dup. NO premature abstraction.
- NO runtime FK recursion. Fallback per-row 1452 only.
- FE a11y MUST: skeleton, error toast, kbd nav, focus ring, ARIA, responsive.

[LAYOUT]
`cmd/`, `internal/db/`, `internal/models/`, `internal/repo/`, `internal/sync/`, `internal/rules/`, `internal/sse/`, `internal/api/`, `internal/crypto/`, `web/`.

[TEST/BUILD]
`go test -race ./internal/sync/... ./internal/sse/...`
FE: `cd web && bun build`. BE: `go build -ldflags "-s -w" -o magicsync ./cmd/magicsync`.

[TRACKER: BEADS]
MUST use `bd` CLI. NO Markdown TODOs/MEMORY.md.
Flow: `bd ready` -> `bd show <id>` -> `bd update <id> --claim` -> `bd close <id>`.

[TOOLING_MANDATE]
1. Code Search: `graphify query "..."` FIRST. Fallback: grep/ls. NO `ls -R`.
2. **BEFORE ANY CODE**: `context7-mcp` for libs, frameworks, APIs. Official docs, best practice, **ALWAYS latest library versions**. Avoid guessing versions or implementations.
3. New modules = skill `tdd`.
4. Principle: Resolve-library-id (lib name + question) → Pick best match → Query-docs → Answer only from fetched docs.
5. After creating or modifying code/files, update graphify so the workspace knowledge graph stays current.

[SHELL_RULES]
- ALWAYS use force flags to avoid hanging prompts (`cp -f`, `rm -rf`, `mv -f`).

[SESSION_CLOSE]
Work incomplete until push success.
1. `git pull --rebase`
2. `bd dolt push`
3. `git push`
4. update `claim-order.md` checklist.
[CRITICAL] NEVER say "ready to push". YOU push. Fix errors & retry until success.