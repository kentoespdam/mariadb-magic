# Graph Report - mariadb-magic  (2026-05-10)

## Corpus Check
- 40 files · ~43,336 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 335 nodes · 496 edges · 27 communities detected
- Extraction: 76% EXTRACTED · 24% INFERRED · 0% AMBIGUOUS · INFERRED: 117 edges (avg confidence: 0.79)
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
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]

## God Nodes (most connected - your core abstractions)
1. `run()` - 16 edges
2. `handleAPI()` - 13 edges
3. `Close()` - 12 edges
4. `ADR-0019: Sync Session fresh-run-only` - 12 edges
5. `ProfilesHandler` - 11 edges
6. `ADR-0014: Mapping Profile draft/ready layered validation` - 11 edges
7. `ADR-0010: Capacity-based Eviction with Export` - 10 edges
8. `ADR-0015: Closure Advisor dual-side FK + 1452 fallback` - 10 edges
9. `ADR-0023: Column Pairing non-Source options distinct UPSERT` - 10 edges
10. `ConnectionHandler` - 9 edges

## Surprising Connections (you probably didn't know these)
- `NewBootstrapper()` --calls--> `run()`  [INFERRED]
  internal/db/bootstrap.go → cmd/magicsync/main.go
- `JIT Parent Sync (CLAUDE.md framing)` --semantically_similar_to--> `JIT Parent Sync (legacy term)`  [INFERRED] [semantically similar]
  CLAUDE.md → CONTEXT.md
- `Capacity-based retention with export` --semantically_similar_to--> `Retention Policy (30 days, PRD)`  [INFERRED] [semantically similar]
  CONTEXT.md → plan/prd.md
- `NewPassphraseKeyProvider()` --calls--> `run()`  [INFERRED]
  internal/crypto/passphrase.go → cmd/magicsync/main.go
- `TestValidateProfileForReady()` --calls--> `run()`  [INFERRED]
  internal/repo/mapping_profiles_test.go → cmd/magicsync/main.go

## Hyperedges (group relationships)
- **Closure Advisor flow (Selection Set, Dependency Closure, Mapping Profile)** — context_md_closure_advisor, context_md_selection_set, context_md_dependency_closure, context_md_mapping_profile [EXTRACTED 1.00]
- **Chunk atomicity contract (transaction, row fallback, status enum, sync_logs)** — adr_0003_chunk_transaction, adr_0003_sync_session_status_enum, adr_0003_sync_logs_schema, context_md_to_friendly [EXTRACTED 1.00]
- **Sync Session lifecycle (snapshot, cancel, schema drift)** — context_md_sync_session, adr_0008_profile_snapshot, adr_0009_cancel_no_rollback, adr_0006_schema_drift [EXTRACTED 0.95]
- **INSERT...ON DUPLICATE KEY UPDATE branch semantics** — 0013_auto_increment_no_counter_intervention_upsert_contract, 0023_column_pairing_non_source_options_distinct_upsert_semantics_upsert_partition, 0019_sync_session_fresh_run_only_idempotent_upsert [INFERRED 0.85]
- **Profile lifecycle validation chain** — 0014_mapping_profile_draft_ready_layered_validation_layer1_builder, 0014_mapping_profile_draft_ready_layered_validation_layer2_preflight, 0012_rule_dsl_whitelisted_single_unconditional_translator, 0023_column_pairing_non_source_options_distinct_upsert_semantics_adr [INFERRED 0.80]
- **Single-writer invariants (instance + session + DB location)** — 0017_db_location_same_dir_as_binary_adr, 0020_single_session_global_concurrency_adr, 0022_single_instance_per_data_directory_adr [INFERRED 0.85]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (51): ADR-0010: Capacity-based Eviction with Export, CSV Export Log (per-session + bulk), PRAGMA incremental_vacuum, maint.EvictIfOver triggers, Settings/Health Page, sync_logs cap (500k/400k watermark), sync_sessions cap (10k/9k watermark), ADR-0012: Rule DSL whitelisted single unconditional (+43 more)

### Community 1 - "Community 1"
Cohesion: 0.24
Nodes (6): ConnectionHandler, getID(), CreateConnectionRequest, getProfileID(), ProfilesHandler, handleAPI()

### Community 2 - "Community 2"
Cohesion: 0.1
Nodes (26): ADR-0001 JIT as compile-time Closure Advisor, ADR-0002 Self-ref FK via FOREIGN_KEY_CHECKS=0, internal/sync/preflight.go, ADR-0006 Schema drift hybrid pre-flight, JIT Parent Sync (CLAUDE.md framing), Rule Translator (internal/rules), Testing expectations (JIT depths, retention, SSE race), Closure Advisor (+18 more)

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (10): detectWSL(), OpenURL(), binaryDir(), main(), run(), NewClosureAdvisor(), TestClosureAdvisorExpand(), TestClosureAdvisorTopologicalSort() (+2 more)

### Community 4 - "Community 4"
Cohesion: 0.16
Nodes (8): KeystoreProvider, Params, NewPassphraseKeyProvider(), NewPassphraseProvider(), TestPassphraseEncryptDecrypt(), TestPassphraseRekey(), TestPassphraseWrongKey(), AppSettingsRepo

### Community 5 - "Community 5"
Cohesion: 0.15
Nodes (18): ADR-0003 Chunk transaction with per-row fallback, sync_logs schema fields, sync_sessions.status enum (running/done/interrupted/failed), ADR-0005 SSE snapshot-on-connect, no replay, ADR-0007 Cross-profile collision hard-fail, POST /api/sessions/{id}/cancel endpoint, ADR-0009 Cancel as cancelled, no rollback, SSE Broker (internal/sse) (+10 more)

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (7): scanMappingProfileRows(), strPtr(), TestValidateProfileForReady(), ValidateProfileForReady(), MappingProfilesRepo, ValidationError, ValidationResult

### Community 7 - "Community 7"
Cohesion: 0.2
Nodes (9): NewBootstrapper(), Bootstrapper, EnsureDB(), HasDB(), Heal(), quarantineAndRebuild(), extractVersion(), readMigrationContent() (+1 more)

### Community 8 - "Community 8"
Cohesion: 0.19
Nodes (7): Column, ForeignKey, NewIntrospector(), Introspector, Close(), Schema, TableSchema

### Community 9 - "Community 9"
Cohesion: 0.14
Nodes (6): NewConnectionHandler(), scanConnectionRows(), stringPtr(), Connection, NewConnectionsRepo(), ConnectionsRepo

### Community 10 - "Community 10"
Cohesion: 0.19
Nodes (14): ADR-0017: DB location same-dir-as-binary, Portable single-binary promise, Read-only folder friendly error, db.Resolve via os.Executable + EvalSymlinks, runningSessionLock package mutex, ADR-0021: Distribusi V1 Linux+Windows (skip macOS), macOS skip V1 (Apple Dev $99 deferred), scripts/release.sh manual cross-compile (+6 more)

### Community 11 - "Community 11"
Cohesion: 0.24
Nodes (5): PassphraseProvider, Config, Open(), friendlyError(), TestConnection()

### Community 12 - "Community 12"
Cohesion: 0.24
Nodes (10): CreateProfileRequest, MarkReadyRequest, isPK(), modelSchemaFromMaria(), modelSchemaMapFromMaria(), NewProfilesHandler(), toModelTableSchemaMap(), SchemaResponse (+2 more)

### Community 13 - "Community 13"
Cohesion: 0.28
Nodes (3): openBrowser(), Instance, OpenURL()

### Community 14 - "Community 14"
Cohesion: 0.22
Nodes (8): ColumnInfo, ColumnPairing, MappingProfile, ProfileMappings, SourceValueType, TableMapping, TableSchema, TableSelection

### Community 15 - "Community 15"
Cohesion: 0.29
Nodes (7): Magic MariaDB Sync (project guidance), Target folder layout, M1 Bootstrap & Embed, M8 Packaging, Implementation plan (M1–M8), PRD v2.0 executive summary, PRD original draft

### Community 16 - "Community 16"
Cohesion: 0.4
Nodes (4): Getter, KeyMode, KeyProvider, ProviderFactory

### Community 17 - "Community 17"
Cohesion: 0.5
Nodes (2): ProfileBuilderPage(), useProfileBuilder()

### Community 18 - "Community 18"
Cohesion: 0.5
Nodes (4): CSV export of sync_logs, Capacity-based retention with export, M6 Maintenance (retention, vacuum), Retention Policy (30 days, PRD)

### Community 19 - "Community 19"
Cohesion: 0.5
Nodes (4): Self-healing SQLite (internal/db/heal.go), App startup & lifecycle (ephemeral port + single-instance), SQLite migration strategy (numbered SQL), Self-Healing SQLite (PRD §5)

### Community 20 - "Community 20"
Cohesion: 0.67
Nodes (2): AppSettings, Connection

### Community 21 - "Community 21"
Cohesion: 0.67
Nodes (3): AES-GCM credential encryption, Credential mode wizard (lazy-prompt), M2 Repos, Connections, Schema Introspection

### Community 22 - "Community 22"
Cohesion: 0.67
Nodes (3): ADR-0008 Profile snapshot on session start, sync_sessions.profile_snapshot_json column, Profile snapshot in Sync Session

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (2): File size cap rule (≤100/120 lines), Definition of Done checklist

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (2): Internal SQLite schema (4 tables), Internal Data Schema (PRD §6)

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (1): Smart Mapping feature

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (1): Out of Scope V1 (PRD §8)

## Knowledge Gaps
- **82 isolated node(s):** `TableWithRole`, `Params`, `KeyMode`, `KeyProvider`, `ProviderFactory` (+77 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 17`** (4 nodes): `ProfileBuilderPage()`, `useProfileBuilder()`, `page.tsx`, `useProfileBuilder.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (3 nodes): `app.go`, `AppSettings`, `Connection`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (2 nodes): `File size cap rule (≤100/120 lines)`, `Definition of Done checklist`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (2 nodes): `Internal SQLite schema (4 tables)`, `Internal Data Schema (PRD §6)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `Smart Mapping feature`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `Out of Scope V1 (PRD §8)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `run()` connect `Community 3` to `Community 1`, `Community 4`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 11`, `Community 12`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `Close()` connect `Community 8` to `Community 1`, `Community 3`, `Community 6`, `Community 7`, `Community 9`, `Community 11`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `handleAPI()` connect `Community 1` to `Community 8`, `Community 3`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `run()` (e.g. with `TestClosureAdvisorTopologicalSort()` and `TestClosureAdvisorExpand()`) actually correct?**
  _`run()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `handleAPI()` (e.g. with `.List()` and `.Create()`) actually correct?**
  _`handleAPI()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `Close()` (e.g. with `.List()` and `.List()`) actually correct?**
  _`Close()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **What connects `TableWithRole`, `Params`, `KeyMode` to the rest of the system?**
  _82 weakly-connected nodes found - possible documentation gaps or missing edges._