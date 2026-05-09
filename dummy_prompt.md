[TASK: NEW_ISSUE_SESSION]
1. EXECUTE: `bd ready` to fetch open issues from Beads.
2. SELECT: Pick highest priority <id>. Run `bd show <id>` then `bd update <id> --claim`.
3. CONTEXT: Read `CLAUDE.md` (Code Rules) & `AGENTS.md` (Ops).
4. SEARCH: Run `graphify query` for issue logic. Use `context7-mcp` if lib integration needed.
5. DESIGN: If core logic affected, lazy-load `ARCHITECTURE.md`.
6. CODE: Apply `tdd` skill. Max 100-120 lines/file.
7. CLOSE: Trigger [SESSION_CLOSE] in `AGENTS.md` (Test -> bd close -> git pull/push -> update checklist int `claim-order.md`).
8. NO_WAIT: Do not ask for permission to push. Execute until success.