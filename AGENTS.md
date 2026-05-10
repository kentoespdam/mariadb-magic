# AGENTS.md

[LAZY_LOAD_DOCS]
- Architecture/Data Flow: Read `ARCHITECTURE.md` when designing, debugging core logic, checking stack, or resolving frontend/backend integration decisions. DO NOT read proactively outside relevant tasks.
- Web Development Rules: Read `WEB_RULES.md` when working on UI, web components, frontend logic, or any Next.js/React implementation. DO NOT read proactively outside relevant tasks.
- Domain Glossary: Read `CONTEXT.md` for canonical terms (Source, Destination, Mapping Profile, Closure Advisor, etc.) and operational invariants. Source of truth untuk istilah domain.
- ADR Index: `docs/adr/README.md` (overrides all).

[TRUTH] `plan/PRD-Rebuild-UI-FE.md`

[PRODUCT]
Magic MariaDB Sync. 1-way sync. Go backend + Next.js FE (`go:embed`). State: SQLite.
Arsitektur detail: `ARCHITECTURE.md`. Domain glossary: `CONTEXT.md`.

[CODE_RULES] (universal — domain invariants di CONTEXT.md, FE rules di WEB_RULES.md)
- ≤100 lines/file (cap 120). Split before commit.
- 1 struct/file (`models`), 1 resource (`api`), 1 table (`repo`).
- DRY at 2nd dup. NO premature abstraction.
- Identifier (status enum, function names, error code constants) = English literal. Prosa = Bahasa Indonesia. Istilah teknis tanpa padanan Indonesia (UPSERT, fallback, runtime, chunk) boleh code-switch in-line. Code-switch di luar daftar ini? Cek CONTEXT.md dulu — kalau istilah ada definisinya, pakai versi CONTEXT.md.

[LAYOUT]
`cmd/`, `web/`, `internal/{db,models,repo,sync,rules,sse,api,crypto,lock,maint,mariadb}/`.

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