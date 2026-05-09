# AGENTS.md

[META] Code/Identifiers=English. Docs/UI=Bahasa Indonesia.

[LAZY_LOAD_DOCS]
- Architecture/Data Flow: Read `ARCHITECTURE.md` ONLY when designing, debugging core logic, or checking stack. DO NOT read proactively.

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
FE: `cd web && pnpm build`. BE: `go build -ldflags "-s -w" -o magicsync ./cmd/magicsync`.

[TRACKER: BEADS]
MUST use `bd` CLI. NO Markdown TODOs/MEMORY.md.
Flow: `bd ready` -> `bd show <id>` -> `bd update <id> --claim` -> `bd close <id>`.

[TOOLING_MANDATE]
1. Code Search: `graphify query "..."` FIRST. Fallback: grep/ls. NO `ls -R`.
2. Lib/API: Selalu gunakan `context7` untuk mendapatkan dokumentasi resmi, best practice, dan source code terbaru. Hindari menebak versi.
3. Modul baru = skill `tdd`.

[SHELL_RULES]
- ALWAYS use force flags to avoid hanging prompts (`cp -f`, `rm -rf`, `mv -f`).

[SESSION_CLOSE]
Work incomplete until push success.
1. `git pull --rebase`
2. `bd dolt push`
3. `git push`
[CRITICAL] NEVER say "ready to push". YOU push. Fix errors & retry until success.