# Graph Report - mariadb-magic  (2026-05-05)

## Corpus Check
- 5 files · ~35,271 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 164 nodes · 217 edges · 18 communities detected
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.76)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]

## God Nodes (most connected - your core abstractions)
1. `ADR-0019: Sync Session fresh-run-only` - 12 edges
2. `ADR-0014: Mapping Profile draft/ready layered validation` - 11 edges
3. `ADR-0010: Capacity-based Eviction with Export` - 10 edges
4. `ADR-0015: Closure Advisor dual-side FK + 1452 fallback` - 10 edges
5. `ADR-0023: Column Pairing non-Source options distinct UPSERT` - 10 edges
6. `JITParentSyncer` - 9 edges
7. `ADR-0020: Single-session global concurrency` - 9 edges
8. `ADR-0003 Chunk transaction with per-row fallback` - 8 edges
9. `ADR-0016: Connection test explicit split` - 8 edges
10. `ADR-0017: DB location same-dir-as-binary` - 7 edges

## Surprising Connections (you probably didn't know these)
- `JIT Parent Sync (CLAUDE.md framing)` --semantically_similar_to--> `JIT Parent Sync (legacy term)`  [INFERRED] [semantically similar]
  CLAUDE.md → CONTEXT.md
- `Capacity-based retention with export` --semantically_similar_to--> `Retention Policy (30 days, PRD)`  [INFERRED] [semantically similar]
  CONTEXT.md → plan/prd.md
- `TestLogRotation()` --calls--> `join()`  [INFERRED]
  logging/rotate_test.go → sync/jit.go
- `Magic MariaDB Sync (project guidance)` --references--> `M8 Packaging`  [INFERRED]
  CLAUDE.md → plan/implementation.md
- `Self-healing SQLite (internal/db/heal.go)` --shares_data_with--> `App startup & lifecycle (ephemeral port + single-instance)`  [INFERRED]
  CLAUDE.md → CONTEXT.md

## Hyperedges (group relationships)
- **Closure Advisor flow (Selection Set, Dependency Closure, Mapping Profile)** — context_md_closure_advisor, context_md_selection_set, context_md_dependency_closure, context_md_mapping_profile [EXTRACTED 1.00]
- **Chunk atomicity contract (transaction, row fallback, status enum, sync_logs)** — adr_0003_chunk_transaction, adr_0003_sync_session_status_enum, adr_0003_sync_logs_schema, context_md_to_friendly [EXTRACTED 1.00]
- **Sync Session lifecycle (snapshot, cancel, schema drift)** — context_md_sync_session, adr_0008_profile_snapshot, adr_0009_cancel_no_rollback, adr_0006_schema_drift [EXTRACTED 0.95]
- **INSERT...ON DUPLICATE KEY UPDATE branch semantics** — 0013_auto_increment_no_counter_intervention_upsert_contract, 0023_column_pairing_non_source_options_distinct_upsert_semantics_upsert_partition, 0019_sync_session_fresh_run_only_idempotent_upsert [INFERRED 0.85]
- **Profile lifecycle validation chain** — 0014_mapping_profile_draft_ready_layered_validation_layer1_builder, 0014_mapping_profile_draft_ready_layered_validation_layer2_preflight, 0012_rule_dsl_whitelisted_single_unconditional_translator, 0023_column_pairing_non_source_options_distinct_upsert_semantics_adr [INFERRED 0.80]
- **Single-writer invariants (instance + session + DB location)** — 0017_db_location_same_dir_as_binary_adr, 0020_single_session_global_concurrency_adr, 0022_single_instance_per_data_directory_adr [INFERRED 0.85]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.1
Nodes (32): ADR-0013: AUTO_INCREMENT no counter intervention, ToFriendly(1062) template, INSERT...ON DUPLICATE KEY UPDATE contract, ADR-0014: Mapping Profile draft/ready layered validation, Layer 2 Preflight validator, mapping_profiles.status (draft|ready), ADR-0015: Closure Advisor dual-side FK + 1452 fallback, Dual-side FK introspection (Source ∪ Destination) (+24 more)

### Community 1 - "Community 1"
Cohesion: 0.15
Nodes (18): ADR-0003 Chunk transaction with per-row fallback, sync_logs schema fields, sync_sessions.status enum (running/done/interrupted/failed), ADR-0005 SSE snapshot-on-connect, no replay, ADR-0007 Cross-profile collision hard-fail, POST /api/sessions/{id}/cancel endpoint, ADR-0009 Cancel as cancelled, no rollback, SSE Broker (internal/sse) (+10 more)

### Community 2 - "Community 2"
Cohesion: 0.22
Nodes (6): ForeignKey, join(), NewJITParentSyncer(), setupDBs(), TestDepth1ParentResolution(), JITParentSyncer

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (15): internal/sync/preflight.go, ADR-0006 Schema drift hybrid pre-flight, Rule Translator (internal/rules), Column Pairing, Destination database (derived copy), Mapping Builder UI (low-build-cost shadcn), Mapping Profile, Mapping Profile lifecycle (draft/ready) (+7 more)

### Community 4 - "Community 4"
Cohesion: 0.19
Nodes (14): ADR-0017: DB location same-dir-as-binary, Portable single-binary promise, Read-only folder friendly error, db.Resolve via os.Executable + EvalSymlinks, runningSessionLock package mutex, ADR-0021: Distribusi V1 Linux+Windows (skip macOS), macOS skip V1 (Apple Dev $99 deferred), scripts/release.sh manual cross-compile (+6 more)

### Community 5 - "Community 5"
Cohesion: 0.2
Nodes (12): ADR-0010: Capacity-based Eviction with Export, CSV Export Log (per-session + bulk), PRAGMA incremental_vacuum, maint.EvictIfOver triggers, Settings/Health Page, sync_logs cap (500k/400k watermark), sync_sessions cap (10k/9k watermark), 24h drift threshold banner (+4 more)

### Community 6 - "Community 6"
Cohesion: 0.27
Nodes (11): ADR-0001 JIT as compile-time Closure Advisor, ADR-0002 Self-ref FK via FOREIGN_KEY_CHECKS=0, JIT Parent Sync (CLAUDE.md framing), Testing expectations (JIT depths, retention, SSE race), Closure Advisor, Dependency Closure, JIT Parent Sync (legacy term), Selection Set (+3 more)

### Community 7 - "Community 7"
Cohesion: 0.33
Nodes (5): compressFile(), InitRotatingWriter(), NewRotatingWriter(), TestLogRotation(), RotatingWriter

### Community 8 - "Community 8"
Cohesion: 0.29
Nodes (7): Magic MariaDB Sync (project guidance), Target folder layout, M1 Bootstrap & Embed, M8 Packaging, Implementation plan (M1–M8), PRD v2.0 executive summary, PRD original draft

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (7): ADR-0012: Rule DSL whitelisted single unconditional, Fan-out via duplicate pairings, PK column may not have Rule, 5 Rule types (cast, enum_map, regex_replace, string_op, date_format), rules_json flat schema, internal/rules translator, Layer 1 Builder-time validator

### Community 10 - "Community 10"
Cohesion: 0.5
Nodes (4): Self-healing SQLite (internal/db/heal.go), App startup & lifecycle (ephemeral port + single-instance), SQLite migration strategy (numbered SQL), Self-Healing SQLite (PRD §5)

### Community 11 - "Community 11"
Cohesion: 0.5
Nodes (4): CSV export of sync_logs, Capacity-based retention with export, M6 Maintenance (retention, vacuum), Retention Policy (30 days, PRD)

### Community 12 - "Community 12"
Cohesion: 0.67
Nodes (3): AES-GCM credential encryption, Credential mode wizard (lazy-prompt), M2 Repos, Connections, Schema Introspection

### Community 13 - "Community 13"
Cohesion: 0.67
Nodes (3): ADR-0008 Profile snapshot on session start, sync_sessions.profile_snapshot_json column, Profile snapshot in Sync Session

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (2): File size cap rule (≤100/120 lines), Definition of Done checklist

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (2): Internal SQLite schema (4 tables), Internal Data Schema (PRD §6)

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (1): Smart Mapping feature

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (1): Out of Scope V1 (PRD §8)

## Knowledge Gaps
- **56 isolated node(s):** `ForeignKey`, `Rule Translator (internal/rules)`, `AES-GCM credential encryption`, `File size cap rule (≤100/120 lines)`, `Internal SQLite schema (4 tables)` (+51 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 15`** (2 nodes): `File size cap rule (≤100/120 lines)`, `Definition of Done checklist`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (2 nodes): `Internal SQLite schema (4 tables)`, `Internal Data Schema (PRD §6)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (1 nodes): `Smart Mapping feature`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (1 nodes): `Out of Scope V1 (PRD §8)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ADR-0014: Mapping Profile draft/ready layered validation` connect `Community 0` to `Community 9`, `Community 5`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Why does `ADR-0020: Single-session global concurrency` connect `Community 0` to `Community 4`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `ADR-0010: Capacity-based Eviction with Export` connect `Community 5` to `Community 0`, `Community 4`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **What connects `ForeignKey`, `Rule Translator (internal/rules)`, `AES-GCM credential encryption` to the rest of the system?**
  _56 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._