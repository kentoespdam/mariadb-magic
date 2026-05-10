# Graph Report - mariadb-magic  (2026-05-10)

## Corpus Check
- 54 files · ~48,574 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 415 nodes · 651 edges · 26 communities detected
- Extraction: 70% EXTRACTED · 30% INFERRED · 0% AMBIGUOUS · INFERRED: 193 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]

## God Nodes (most connected - your core abstractions)
1. `run()` - 22 edges
2. `handleAPI()` - 16 edges
3. `Close()` - 15 edges
4. `ProfilesHandler` - 13 edges
5. `TranslateToFunc()` - 12 edges
6. `Validate()` - 12 edges
7. `ADR-0019: Sync Session fresh-run-only` - 12 edges
8. `ADR-0014: Mapping Profile draft/ready layered validation` - 11 edges
9. `ADR-0010: Capacity-based Eviction with Export` - 10 edges
10. `ADR-0015: Closure Advisor dual-side FK + 1452 fallback` - 10 edges

## Surprising Connections (you probably didn't know these)
- `NewBootstrapper()` --calls--> `run()`  [INFERRED]
  internal/db/bootstrap.go → cmd/magicsync/main.go
- `JIT Parent Sync (CLAUDE.md framing)` --semantically_similar_to--> `JIT Parent Sync (legacy term)`  [INFERRED] [semantically similar]
  CLAUDE.md → CONTEXT.md
- `Capacity-based retention with export` --semantically_similar_to--> `Retention Policy (30 days, PRD)`  [INFERRED] [semantically similar]
  CONTEXT.md → plan/prd.md
- `TestClosureAdvisorTopologicalSort()` --calls--> `run()`  [INFERRED]
  internal/sync/closure_test.go → cmd/magicsync/main.go
- `TestClosureAdvisorExpand()` --calls--> `run()`  [INFERRED]
  internal/sync/closure_test.go → cmd/magicsync/main.go

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
Cohesion: 0.06
Nodes (44): ADR-0001 JIT as compile-time Closure Advisor, ADR-0002 Self-ref FK via FOREIGN_KEY_CHECKS=0, ADR-0003 Chunk transaction with per-row fallback, sync_logs schema fields, sync_sessions.status enum (running/done/interrupted/failed), ADR-0005 SSE snapshot-on-connect, no replay, internal/sync/preflight.go, ADR-0006 Schema drift hybrid pre-flight (+36 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (30): detectWSL(), OpenURL(), binaryDir(), main(), run(), translateCast(), translateDate(), translateEnumMap() (+22 more)

### Community 3 - "Community 3"
Cohesion: 0.18
Nodes (10): ConnectionHandler, getID(), CreateConnectionRequest, getProfileID(), ProfilesHandler, handleAPI(), ToFriendly(), TranslateError (+2 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (25): CreateProfileRequest, MarkReadyRequest, PreviewRuleRequest, isPK(), modelSchemaFromMaria(), modelSchemaMapFromMaria(), NewProfilesHandler(), toModelTableSchemaMap() (+17 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (15): NewBootstrapper(), Bootstrapper, EnsureDB(), HasDB(), Heal(), quarantineAndRebuild(), extractVersion(), readMigrationContent() (+7 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (9): KeystoreProvider, Params, NewPassphraseKeyProvider(), NewPassphraseProvider(), TestPassphraseEncryptDecrypt(), TestPassphraseRekey(), TestPassphraseWrongKey(), PassphraseProvider (+1 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (12): Column, ForeignKey, NewIntrospector(), Schema, TableSchema, checkDestDrift(), DriftItem, DriftReport (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (6): NewConnectionHandler(), scanConnectionRows(), stringPtr(), Connection, NewConnectionsRepo(), ConnectionsRepo

### Community 9 - "Community 9"
Cohesion: 0.14
Nodes (12): CastRule, CastTargetType, DateParseErrorMode, DateRule, EnumMapRule, FallbackStrategy, RegexRule, Rule (+4 more)

### Community 10 - "Community 10"
Cohesion: 0.19
Nodes (14): ADR-0017: DB location same-dir-as-binary, Portable single-binary promise, Read-only folder friendly error, db.Resolve via os.Executable + EvalSymlinks, runningSessionLock package mutex, ADR-0021: Distribusi V1 Linux+Windows (skip macOS), macOS skip V1 (Apple Dev $99 deferred), scripts/release.sh manual cross-compile (+6 more)

### Community 11 - "Community 11"
Cohesion: 0.26
Nodes (4): TestClosureAdvisorExpand(), TestClosureAdvisorTopologicalSort(), ClosureAdvisor, TableWithRole

### Community 12 - "Community 12"
Cohesion: 0.28
Nodes (3): openBrowser(), Instance, OpenURL()

### Community 13 - "Community 13"
Cohesion: 0.22
Nodes (8): ColumnInfo, ColumnPairing, MappingProfile, ProfileMappings, SourceValueType, TableMapping, TableSchema, TableSelection

### Community 14 - "Community 14"
Cohesion: 0.29
Nodes (7): Magic MariaDB Sync (project guidance), Target folder layout, M1 Bootstrap & Embed, M8 Packaging, Implementation plan (M1–M8), PRD v2.0 executive summary, PRD original draft

### Community 15 - "Community 15"
Cohesion: 0.4
Nodes (4): Getter, KeyMode, KeyProvider, ProviderFactory

### Community 16 - "Community 16"
Cohesion: 0.5
Nodes (2): useProfileBuilder(), ProfileBuilderPage()

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

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (2): Internal SQLite schema (4 tables), Internal Data Schema (PRD §6)

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (2): File size cap rule (≤100/120 lines), Definition of Done checklist

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (1): Smart Mapping feature

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (1): Out of Scope V1 (PRD §8)

## Knowledge Gaps
- **98 isolated node(s):** `TableWithRole`, `DriftItem`, `Params`, `KeyMode`, `KeyProvider` (+93 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 16`** (4 nodes): `useProfileBuilder()`, `ProfileBuilderPage()`, `page.tsx`, `useProfileBuilder.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (3 nodes): `app.go`, `AppSettings`, `Connection`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (2 nodes): `Internal SQLite schema (4 tables)`, `Internal Data Schema (PRD §6)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (2 nodes): `File size cap rule (≤100/120 lines)`, `Definition of Done checklist`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `Smart Mapping feature`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `Out of Scope V1 (PRD §8)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `run()` connect `Community 2` to `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 8`, `Community 11`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Why does `Close()` connect `Community 5` to `Community 8`, `Community 2`, `Community 3`, `Community 4`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `handleAPI()` connect `Community 3` to `Community 2`, `Community 5`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Are the 18 inferred relationships involving `run()` (e.g. with `TestClosureAdvisorTopologicalSort()` and `TestClosureAdvisorExpand()`) actually correct?**
  _`run()` has 18 INFERRED edges - model-reasoned connections that need verification._
- **Are the 14 inferred relationships involving `handleAPI()` (e.g. with `.List()` and `.Create()`) actually correct?**
  _`handleAPI()` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 14 inferred relationships involving `Close()` (e.g. with `.List()` and `.List()`) actually correct?**
  _`Close()` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `TranslateToFunc()` (e.g. with `TestTranslateCast()` and `TestTranslateStringOp()`) actually correct?**
  _`TranslateToFunc()` has 11 INFERRED edges - model-reasoned connections that need verification._