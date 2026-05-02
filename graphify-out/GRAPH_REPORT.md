# Graph Report - /mnt/DATA/go/mariadb-magic  (2026-05-02)

## Corpus Check
- Corpus is ~27,327 words - fits in a single context window. You may not need a graph.

## Summary
- 136 nodes · 174 edges · 17 communities detected
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.76)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Validation & Error Mapping|Validation & Error Mapping]]
- [[_COMMUNITY_Mapping Profile & Builder|Mapping Profile & Builder]]
- [[_COMMUNITY_Portable Distribution & Single-Instance|Portable Distribution & Single-Instance]]
- [[_COMMUNITY_Sync Session Lifecycle & Cancel|Sync Session Lifecycle & Cancel]]
- [[_COMMUNITY_Capacity Eviction & Health|Capacity Eviction & Health]]
- [[_COMMUNITY_JIT Closure Advisor|JIT Closure Advisor]]
- [[_COMMUNITY_Project Plan & Milestones|Project Plan & Milestones]]
- [[_COMMUNITY_Rule DSL & Translator|Rule DSL & Translator]]
- [[_COMMUNITY_SSE Progress Streaming|SSE Progress Streaming]]
- [[_COMMUNITY_Retention & Log Export|Retention & Log Export]]
- [[_COMMUNITY_SQLite Bootstrap & Self-Heal|SQLite Bootstrap & Self-Heal]]
- [[_COMMUNITY_Connection Credentials (AES-GCM)|Connection Credentials (AES-GCM)]]
- [[_COMMUNITY_Profile Snapshot at Session Start|Profile Snapshot at Session Start]]
- [[_COMMUNITY_File Size & DoD Conventions|File Size & DoD Conventions]]
- [[_COMMUNITY_Internal SQLite Schema|Internal SQLite Schema]]
- [[_COMMUNITY_Smart Mapping (Future)|Smart Mapping (Future)]]
- [[_COMMUNITY_Out of Scope V1|Out of Scope V1]]

## God Nodes (most connected - your core abstractions)
1. `ADR-0019: Sync Session fresh-run-only` - 12 edges
2. `ADR-0014: Mapping Profile draft/ready layered validation` - 11 edges
3. `ADR-0010: Capacity-based Eviction with Export` - 10 edges
4. `ADR-0015: Closure Advisor dual-side FK + 1452 fallback` - 10 edges
5. `ADR-0023: Column Pairing non-Source options distinct UPSERT` - 10 edges
6. `ADR-0020: Single-session global concurrency` - 9 edges
7. `ADR-0003 Chunk transaction with per-row fallback` - 8 edges
8. `ADR-0016: Connection test explicit split` - 8 edges
9. `ADR-0017: DB location same-dir-as-binary` - 7 edges
10. `ADR-0022: Single-instance per data directory` - 7 edges

## Surprising Connections (you probably didn't know these)
- `JIT Parent Sync (legacy term)` --semantically_similar_to--> `JIT Parent Sync (CLAUDE.md framing)`  [INFERRED] [semantically similar]
  CONTEXT.md → CLAUDE.md
- `Capacity-based retention with export` --semantically_similar_to--> `Retention Policy (30 days, PRD)`  [INFERRED] [semantically similar]
  CONTEXT.md → plan/prd.md
- `M8 Packaging` --references--> `Magic MariaDB Sync (project guidance)`  [INFERRED]
  plan/implementation.md → CLAUDE.md
- `App startup & lifecycle (ephemeral port + single-instance)` --shares_data_with--> `Self-healing SQLite (internal/db/heal.go)`  [INFERRED]
  CONTEXT.md → CLAUDE.md
- `ADR-0002 Self-ref FK via FOREIGN_KEY_CHECKS=0` --rationale_for--> `Closure Advisor`  [EXTRACTED]
  docs/adr/0002-self-ref-fk-via-disabled-checks.md → CONTEXT.md

## Hyperedges (group relationships)
- **Closure Advisor flow (Selection Set, Dependency Closure, Mapping Profile)** — context_md_closure_advisor, context_md_selection_set, context_md_dependency_closure, context_md_mapping_profile [EXTRACTED 1.00]
- **Chunk atomicity contract (transaction, row fallback, status enum, sync_logs)** — adr_0003_chunk_transaction, adr_0003_sync_session_status_enum, adr_0003_sync_logs_schema, context_md_to_friendly [EXTRACTED 1.00]
- **Sync Session lifecycle (snapshot, cancel, schema drift)** — context_md_sync_session, adr_0008_profile_snapshot, adr_0009_cancel_no_rollback, adr_0006_schema_drift [EXTRACTED 0.95]
- **INSERT...ON DUPLICATE KEY UPDATE branch semantics** — 0013_auto_increment_no_counter_intervention_upsert_contract, 0023_column_pairing_non_source_options_distinct_upsert_semantics_upsert_partition, 0019_sync_session_fresh_run_only_idempotent_upsert [INFERRED 0.85]
- **Profile lifecycle validation chain** — 0014_mapping_profile_draft_ready_layered_validation_layer1_builder, 0014_mapping_profile_draft_ready_layered_validation_layer2_preflight, 0012_rule_dsl_whitelisted_single_unconditional_translator, 0023_column_pairing_non_source_options_distinct_upsert_semantics_adr [INFERRED 0.80]
- **Single-writer invariants (instance + session + DB location)** — 0017_db_location_same_dir_as_binary_adr, 0020_single_session_global_concurrency_adr, 0022_single_instance_per_data_directory_adr [INFERRED 0.85]

## Communities

### Community 0 - "Validation & Error Mapping"
Cohesion: 0.1
Nodes (32): ADR-0013: AUTO_INCREMENT no counter intervention, ToFriendly(1062) template, INSERT...ON DUPLICATE KEY UPDATE contract, ADR-0014: Mapping Profile draft/ready layered validation, Layer 2 Preflight validator, mapping_profiles.status (draft|ready), ADR-0015: Closure Advisor dual-side FK + 1452 fallback, Dual-side FK introspection (Source ∪ Destination) (+24 more)

### Community 1 - "Mapping Profile & Builder"
Cohesion: 0.14
Nodes (16): internal/sync/preflight.go, ADR-0006 Schema drift hybrid pre-flight, Rule Translator (internal/rules), Column Pairing, Destination database (derived copy), Mapping Builder UI (low-build-cost shadcn), Mapping Profile, Mapping Profile lifecycle (draft/ready) (+8 more)

### Community 2 - "Portable Distribution & Single-Instance"
Cohesion: 0.19
Nodes (14): ADR-0017: DB location same-dir-as-binary, Portable single-binary promise, Read-only folder friendly error, db.Resolve via os.Executable + EvalSymlinks, runningSessionLock package mutex, ADR-0021: Distribusi V1 Linux+Windows (skip macOS), macOS skip V1 (Apple Dev $99 deferred), scripts/release.sh manual cross-compile (+6 more)

### Community 3 - "Sync Session Lifecycle & Cancel"
Cohesion: 0.22
Nodes (13): ADR-0003 Chunk transaction with per-row fallback, sync_logs schema fields, sync_sessions.status enum (running/done/interrupted/failed), ADR-0007 Cross-profile collision hard-fail, POST /api/sessions/{id}/cancel endpoint, ADR-0009 Cancel as cancelled, no rollback, Cancel UX (cooperative, no rollback), Charset utf8mb4 enforcement (+5 more)

### Community 4 - "Capacity Eviction & Health"
Cohesion: 0.2
Nodes (12): ADR-0010: Capacity-based Eviction with Export, CSV Export Log (per-session + bulk), PRAGMA incremental_vacuum, maint.EvictIfOver triggers, Settings/Health Page, sync_logs cap (500k/400k watermark), sync_sessions cap (10k/9k watermark), 24h drift threshold banner (+4 more)

### Community 5 - "JIT Closure Advisor"
Cohesion: 0.31
Nodes (10): ADR-0001 JIT as compile-time Closure Advisor, ADR-0002 Self-ref FK via FOREIGN_KEY_CHECKS=0, JIT Parent Sync (CLAUDE.md framing), Testing expectations (JIT depths, retention, SSE race), Closure Advisor, Dependency Closure, JIT Parent Sync (legacy term), Selection Set (+2 more)

### Community 6 - "Project Plan & Milestones"
Cohesion: 0.29
Nodes (7): Magic MariaDB Sync (project guidance), Target folder layout, M1 Bootstrap & Embed, M8 Packaging, Implementation plan (M1–M8), PRD v2.0 executive summary, PRD original draft

### Community 7 - "Rule DSL & Translator"
Cohesion: 0.33
Nodes (7): ADR-0012: Rule DSL whitelisted single unconditional, Fan-out via duplicate pairings, PK column may not have Rule, 5 Rule types (cast, enum_map, regex_replace, string_op, date_format), rules_json flat schema, internal/rules translator, Layer 1 Builder-time validator

### Community 8 - "SSE Progress Streaming"
Cohesion: 0.5
Nodes (5): ADR-0005 SSE snapshot-on-connect, no replay, SSE Broker (internal/sse), SSE progress stream endpoint, M5 SSE & API Sync Control, Real-time Tracking via SSE

### Community 9 - "Retention & Log Export"
Cohesion: 0.5
Nodes (4): CSV export of sync_logs, Capacity-based retention with export, M6 Maintenance (retention, vacuum), Retention Policy (30 days, PRD)

### Community 10 - "SQLite Bootstrap & Self-Heal"
Cohesion: 0.5
Nodes (4): Self-healing SQLite (internal/db/heal.go), App startup & lifecycle (ephemeral port + single-instance), SQLite migration strategy (numbered SQL), Self-Healing SQLite (PRD §5)

### Community 11 - "Connection Credentials (AES-GCM)"
Cohesion: 0.67
Nodes (3): AES-GCM credential encryption, Credential mode wizard (lazy-prompt), M2 Repos, Connections, Schema Introspection

### Community 12 - "Profile Snapshot at Session Start"
Cohesion: 0.67
Nodes (3): ADR-0008 Profile snapshot on session start, sync_sessions.profile_snapshot_json column, Profile snapshot in Sync Session

### Community 13 - "File Size & DoD Conventions"
Cohesion: 1.0
Nodes (2): File size cap rule (≤100/120 lines), Definition of Done checklist

### Community 14 - "Internal SQLite Schema"
Cohesion: 1.0
Nodes (2): Internal SQLite schema (4 tables), Internal Data Schema (PRD §6)

### Community 15 - "Smart Mapping (Future)"
Cohesion: 1.0
Nodes (1): Smart Mapping feature

### Community 16 - "Out of Scope V1"
Cohesion: 1.0
Nodes (1): Out of Scope V1 (PRD §8)

## Knowledge Gaps
- **55 isolated node(s):** `Rule Translator (internal/rules)`, `AES-GCM credential encryption`, `File size cap rule (≤100/120 lines)`, `Internal SQLite schema (4 tables)`, `Testing expectations (JIT depths, retention, SSE race)` (+50 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `File Size & DoD Conventions`** (2 nodes): `File size cap rule (≤100/120 lines)`, `Definition of Done checklist`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Internal SQLite Schema`** (2 nodes): `Internal SQLite schema (4 tables)`, `Internal Data Schema (PRD §6)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Smart Mapping (Future)`** (1 nodes): `Smart Mapping feature`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Out of Scope V1`** (1 nodes): `Out of Scope V1 (PRD §8)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ADR-0014: Mapping Profile draft/ready layered validation` connect `Validation & Error Mapping` to `Capacity Eviction & Health`, `Rule DSL & Translator`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **Why does `ADR-0020: Single-session global concurrency` connect `Validation & Error Mapping` to `Portable Distribution & Single-Instance`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `ADR-0010: Capacity-based Eviction with Export` connect `Capacity Eviction & Health` to `Validation & Error Mapping`, `Portable Distribution & Single-Instance`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **What connects `Rule Translator (internal/rules)`, `AES-GCM credential encryption`, `File size cap rule (≤100/120 lines)` to the rest of the system?**
  _55 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Validation & Error Mapping` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Mapping Profile & Builder` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._