---
type: "query"
date: "2026-05-02T05:31:18.399922+00:00"
question: "How do credential-mode ADRs influence session management and sync behavior?"
contributor: "graphify"
source_nodes: ["Concurrent Sync Sessions: single-session global di V1", "Sync Session retry: selalu fresh run, tidak ada resume dari checkpoint di V1"]
---

# Q: How do credential-mode ADRs influence session management and sync behavior?

## Answer

The credential-mode ADRs (0011 and 0004) were skipped as sensitive, so no nodes exist. However, the graph shows ADR 0019 (sync-session-fresh-run-only) and ADR 0020 (single-session-global-concurrency) are tightly linked via shared concepts: session, sync, SSE, snapshot, connect, cancel, rollback, chunk, time, and implementation files (internal/sync/runner.go, internal/api/sessions.go). Session management and sync behavior are colocated in code, but the influence of credential-mode decisions cannot be traced without those ADRs present.

## Source Nodes

- Concurrent Sync Sessions: single-session global di V1
- Sync Session retry: selalu fresh run, tidak ada resume dari checkpoint di V1