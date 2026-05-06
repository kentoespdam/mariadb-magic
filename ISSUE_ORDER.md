# Issue Execution Order (tracer‑bullet vertical slices)

1. **Setup Project Skeleton** (`mariadb-magic-8ej`)  
   *Foundations*: folder hierarchy, `go:embed` integration, initial SQLite schema.

2. **Implement Dynamic Query Builder** (`mariadb-magic-gzt`)  
   *Generates* dynamic INSERT/UPDATE statements, preserves primary keys, validates against SQLite schema.

3. **Build Rule Translator** (`mariadb-magic-7fz`)  
   *Translates* visual mapping rules (IF‑THEN‑ELSE) into executable transformations.

4. **JIT Parent Sync Engine** (`mariadb-magic-819`)  
   *Recursively* discovers missing parent rows and syncs them in correct order.

5. **Chunked UPSERT Implementation** (`mariadb-magic-kyj`)  
   *Performs* bulk upserts in configurable batches while preserving original keys.

6. **User Interface – Drag‑and‑Drop Mapping** (`mariadb-magic-829`)  
   *Builds* visual canvas for source/target table mapping and auto‑detects identical columns.

7. **SSE – Real‑time Progress Tracker** (`mariadb-magic-ufi`)  
   *Streams* progress events from Go backend to Next.js UI via SSE.

8. **Internal Logging & Reporting** (`mariadb-magic-4rb`)  
   *Logs* line‑by‑line failures to SQLite, generates post‑sync receipt, enforces retention policy.

9. **SQLite Self‑Healing & Maintenance** (`mariadb-magic-8p3`)  
   *Handles* auto‑creation, corruption recovery, retention cleanup, and auto‑vacuum.

*Dependencies*: each slice is ordered so that blockers are completed first; slices marked **AFK** can be merged without human input, while **HITL** slices (currently JIT Parent Sync) may need design review.