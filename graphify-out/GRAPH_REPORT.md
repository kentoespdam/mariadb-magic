# Graph Report - mariadb-magic  (2026-05-09)

## Corpus Check
- 23 files · ~37,124 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 282 nodes · 383 edges · 26 communities detected
- Extraction: 83% EXTRACTED · 17% INFERRED · 0% AMBIGUOUS · INFERRED: 67 edges (avg confidence: 0.79)
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
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]

## God Nodes (most connected - your core abstractions)
1. `ADR-0019: Sync Session fresh-run-only` - 12 edges
2. `Close()` - 11 edges
3. `ADR-0014: Mapping Profile draft/ready layered validation` - 11 edges
4. `ADR-0010: Capacity-based Eviction with Export` - 10 edges
5. `ADR-0015: Closure Advisor dual-side FK + 1452 fallback` - 10 edges
6. `ADR-0023: Column Pairing non-Source options distinct UPSERT` - 10 edges
7. `ADR-0020: Single-session global concurrency` - 9 edges
8. `ConnectionHandler` - 8 edges
9. `Introspector` - 8 edges
10. `ADR-0003 Chunk transaction with per-row fallback` - 8 edges

## Surprising Connections (you probably didn't know these)
- `JIT Parent Sync (CLAUDE.md framing)` --semantically_similar_to--> `JIT Parent Sync (legacy term)`  [INFERRED] [semantically similar]
  CLAUDE.md → CONTEXT.md
- `Capacity-based retention with export` --semantically_similar_to--> `Retention Policy (30 days, PRD)`  [INFERRED] [semantically similar]
  CONTEXT.md → plan/prd.md
- `Close()` --calls--> `run()`  [INFERRED]
  internal/mariadb/pool.go → cmd/magicsync/main.go
- `run()` --calls--> `OpenURL()`  [INFERRED]
  cmd/magicsync/main.go → pkg/browser/browser.go
- `Magic MariaDB Sync (project guidance)` --references--> `M8 Packaging`  [INFERRED]
  CLAUDE.md → plan/implementation.md

## Hyperedges (group relationships)
- **Closure Advisor flow (Selection Set, Dependency Closure, Mapping Profile)** — context_md_closure_advisor, context_md_selection_set, context_md_dependency_closure, context_md_mapping_profile [EXTRACTED 1.00]
- **Chunk atomicity contract (transaction, row fallback, status enum, sync_logs)** — adr_0003_chunk_transaction, adr_0003_sync_session_status_enum, adr_0003_sync_logs_schema, context_md_to_friendly [EXTRACTED 1.00]
- **Sync Session lifecycle (snapshot, cancel, schema drift)** — context_md_sync_session, adr_0008_profile_snapshot, adr_0009_cancel_no_rollback, adr_0006_schema_drift [EXTRACTED 0.95]
- **INSERT...ON DUPLICATE KEY UPDATE branch semantics** — 0013_auto_increment_no_counter_intervention_upsert_contract, 0023_column_pairing_non_source_options_distinct_upsert_semantics_upsert_partition, 0019_sync_session_fresh_run_only_idempotent_upsert [INFERRED 0.85]
- **Profile lifecycle validation chain** — 0014_mapping_profile_draft_ready_layered_validation_layer1_builder, 0014_mapping_profile_draft_ready_layered_validation_layer2_preflight, 0012_rule_dsl_whitelisted_single_unconditional_translator, 0023_column_pairing_non_source_options_distinct_upsert_semantics_adr [INFERRED 0.80]
- **Single-writer invariants (instance + session + DB location)** — 0017_db_location_same_dir_as_binary_adr, 0020_single_session_global_concurrency_adr, 0022_single_instance_per_data_directory_adr [INFERRED 0.85]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (39): ADR-0012: Rule DSL whitelisted single unconditional, Fan-out via duplicate pairings, PK column may not have Rule, 5 Rule types (cast, enum_map, regex_replace, string_op, date_format), rules_json flat schema, internal/rules translator, ADR-0013: AUTO_INCREMENT no counter intervention, ToFriendly(1062) template (+31 more)

### Community 1 - "Community 1"
Cohesion: 0.1
Nodes (26): ADR-0001 JIT as compile-time Closure Advisor, ADR-0002 Self-ref FK via FOREIGN_KEY_CHECKS=0, internal/sync/preflight.go, ADR-0006 Schema drift hybrid pre-flight, JIT Parent Sync (CLAUDE.md framing), Rule Translator (internal/rules), Testing expectations (JIT depths, retention, SSE race), Closure Advisor (+18 more)

### Community 2 - "Community 2"
Cohesion: 0.1
Nodes (26): ADR-0010: Capacity-based Eviction with Export, CSV Export Log (per-session + bulk), PRAGMA incremental_vacuum, maint.EvictIfOver triggers, Settings/Health Page, sync_logs cap (500k/400k watermark), sync_sessions cap (10k/9k watermark), 24h drift threshold banner (+18 more)

### Community 3 - "Community 3"
Cohesion: 0.13
Nodes (9): ConnectionHandler, getID(), CreateConnectionRequest, CreateProfileRequest, getProfileID(), NewProfilesHandler(), ProfilesHandler, friendlyError() (+1 more)

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (10): Bootstrapper, EnsureDB(), HasDB(), Heal(), quarantineAndRebuild(), extractVersion(), readMigrationContent(), readMigrations() (+2 more)

### Community 5 - "Community 5"
Cohesion: 0.15
Nodes (18): ADR-0003 Chunk transaction with per-row fallback, sync_logs schema fields, sync_sessions.status enum (running/done/interrupted/failed), ADR-0005 SSE snapshot-on-connect, no replay, ADR-0007 Cross-profile collision hard-fail, POST /api/sessions/{id}/cancel endpoint, ADR-0009 Cancel as cancelled, no rollback, SSE Broker (internal/sse) (+10 more)

### Community 6 - "Community 6"
Cohesion: 0.2
Nodes (6): KeystoreProvider, NewPassphraseProvider(), TestPassphraseEncryptDecrypt(), TestPassphraseRekey(), TestPassphraseWrongKey(), AppSettingsRepo

### Community 7 - "Community 7"
Cohesion: 0.13
Nodes (6): NewConnectionHandler(), scanConnectionRows(), stringPtr(), Connection, NewConnectionsRepo(), ConnectionsRepo

### Community 8 - "Community 8"
Cohesion: 0.19
Nodes (6): Column, ForeignKey, Introspector, Close(), Schema, TableSchema

### Community 9 - "Community 9"
Cohesion: 0.22
Nodes (3): NewMappingProfilesRepo(), scanMappingProfileRows(), MappingProfilesRepo

### Community 10 - "Community 10"
Cohesion: 0.33
Nodes (2): ClosureAdvisor, TableWithRole

### Community 11 - "Community 11"
Cohesion: 0.28
Nodes (3): openBrowser(), Instance, OpenURL()

### Community 12 - "Community 12"
Cohesion: 0.48
Nodes (2): Params, PassphraseProvider

### Community 13 - "Community 13"
Cohesion: 0.43
Nodes (5): detectWSL(), OpenURL(), binaryDir(), main(), run()

### Community 14 - "Community 14"
Cohesion: 0.29
Nodes (7): Magic MariaDB Sync (project guidance), Target folder layout, M1 Bootstrap & Embed, M8 Packaging, Implementation plan (M1–M8), PRD v2.0 executive summary, PRD original draft

### Community 15 - "Community 15"
Cohesion: 0.4
Nodes (4): Getter, KeyMode, KeyProvider, ProviderFactory

### Community 16 - "Community 16"
Cohesion: 0.5
Nodes (4): Self-healing SQLite (internal/db/heal.go), App startup & lifecycle (ephemeral port + single-instance), SQLite migration strategy (numbered SQL), Self-Healing SQLite (PRD §5)

### Community 17 - "Community 17"
Cohesion: 0.5
Nodes (4): CSV export of sync_logs, Capacity-based retention with export, M6 Maintenance (retention, vacuum), Retention Policy (30 days, PRD)

### Community 18 - "Community 18"
Cohesion: 0.67
Nodes (2): AppSettings, Connection

### Community 19 - "Community 19"
Cohesion: 0.67
Nodes (2): MappingProfile, TableSelection

### Community 20 - "Community 20"
Cohesion: 0.67
Nodes (3): AES-GCM credential encryption, Credential mode wizard (lazy-prompt), M2 Repos, Connections, Schema Introspection

### Community 21 - "Community 21"
Cohesion: 0.67
Nodes (3): ADR-0008 Profile snapshot on session start, sync_sessions.profile_snapshot_json column, Profile snapshot in Sync Session

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (2): Internal SQLite schema (4 tables), Internal Data Schema (PRD §6)

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (2): File size cap rule (≤100/120 lines), Definition of Done checklist

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (1): Smart Mapping feature

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (1): Out of Scope V1 (PRD §8)

## Knowledge Gaps
- **72 isolated node(s):** `TableWithRole`, `Params`, `KeyMode`, `KeyProvider`, `ProviderFactory` (+67 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 10`** (9 nodes): `closure.go`, `NewClosureAdvisor()`, `ClosureAdvisor`, `.bfsExpand()`, `.buildDAG()`, `.detectCycle()`, `.Expand()`, `.topologicalSort()`, `TableWithRole`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (7 nodes): `Params`, `PassphraseProvider`, `.Decrypt()`, `.Encrypt()`, `.Key()`, `.Rekey()`, `passphrase.go`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (3 nodes): `app.go`, `AppSettings`, `Connection`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (3 nodes): `mapping_profile.go`, `MappingProfile`, `TableSelection`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (2 nodes): `Internal SQLite schema (4 tables)`, `Internal Data Schema (PRD §6)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (2 nodes): `File size cap rule (≤100/120 lines)`, `Definition of Done checklist`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `Smart Mapping feature`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `Out of Scope V1 (PRD §8)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Close()` connect `Community 8` to `Community 3`, `Community 4`, `Community 7`, `Community 9`, `Community 13`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **Why does `TestConnection()` connect `Community 3` to `Community 8`, `Community 4`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `run()` connect `Community 13` to `Community 8`, `Community 6`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Are the 10 inferred relationships involving `Close()` (e.g. with `.List()` and `.List()`) actually correct?**
  _`Close()` has 10 INFERRED edges - model-reasoned connections that need verification._
- **What connects `TableWithRole`, `Params`, `KeyMode` to the rest of the system?**
  _72 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._