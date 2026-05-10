# Graph Report - .  (2026-05-10)

## Corpus Check
- 104 files · ~52,534 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 645 nodes · 978 edges · 70 communities detected
- Extraction: 69% EXTRACTED · 31% INFERRED · 0% AMBIGUOUS · INFERRED: 306 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]

## God Nodes (most connected - your core abstractions)
1. `run()` - 22 edges
2. `Close()` - 21 edges
3. `handleAPI()` - 16 edges
4. `ProfilesHandler` - 13 edges
5. `TranslateToFunc()` - 13 edges
6. `Validate()` - 12 edges
7. `Handler` - 12 edges
8. `ADR-0019: Sync Session fresh-run-only` - 12 edges
9. `ADR-0014: Mapping Profile draft/ready layered validation` - 11 edges
10. `Rule` - 11 edges

## Surprising Connections (you probably didn't know these)
- `NewBootstrapper()` --calls--> `run()`  [INFERRED]
  internal/db/bootstrap.go → cmd/magicsync/main.go
- `JIT Parent Sync (CLAUDE.md framing)` --semantically_similar_to--> `JIT Parent Sync (legacy term)`  [INFERRED] [semantically similar]
  CLAUDE.md → CONTEXT.md
- `Capacity-based retention with export` --semantically_similar_to--> `Retention Policy (30 days, PRD)`  [INFERRED] [semantically similar]
  CONTEXT.md → plan/prd.md
- `ColumnPair` --conceptually_related_to--> `Column Pairing`  [INFERRED]
  web/src/types/types.ts → CONTEXT.md
- `Profile` --conceptually_related_to--> `Mapping Profile`  [INFERRED]
  web/src/types/types.ts → CONTEXT.md

## Hyperedges (group relationships)
- **Upsert Processing Pipeline** — upsert_processor, upsert_execute, upsert_processtable, upsert_collectandsync, upsert_execchunk, upsert_scanrows, upsert_buildinsertquery, upsert_buildplaceholders [EXTRACTED 1.00]
- **Sync Error Handling** — errors_errorcategory, errors_friendlyerror, errors_tofriendly, errors_templates [EXTRACTED 1.00]
- **Table Ordering Strategies** — closure_closureadvisor, closure_topologicalsort, runner_startsession, runner_run [INFERRED 0.75]
- **KeyProvider Interface Implementations** — provider_keyprovider_interface, provider_newpassphraseprovider, provider_newkeystoreprovider [EXTRACTED 1.00]
- **Profile Ready Validation Flow** — api_profiles_handler_mark_ready, mappingprofiles_repo_validate_profile_for_ready, mappingprofiles_repo_has_collision, mappingprofiles_repo_to_friendly_collision [EXTRACTED 1.00]
- **Database Healing and Bootstrap** — db_bootstrapper_ensure, db_heal, db_bootstrapper_apply_migrations, db_heal_quarantine [EXTRACTED 1.00]
- **Rules Translation Pipeline** — rules_translatetofunc, rules_translatecast, rules_translateenummap, rules_translateregex, rules_translatestringop, rules_translatedate, rules_fmtvalue [EXTRACTED 1.00]
- **SSE Event Streaming** — sse_broker, sse_event, sse_eventdata, sse_handler [EXTRACTED 1.00]
- **Schema Introspection** — mariadb_introspector, mariadb_schema, mariadb_tableschema, mariadb_column, mariadb_foreignkey [EXTRACTED 1.00]
- **Rule Editor Flow** — comp_profiletable, comp_ruleeditordialog, types_rule, types_previewresult, ctx_rule, ctx_samplepreview [EXTRACTED 1.00]
- **Profile Builder State Management** — hook_useprofilebuilder, types_profile, types_schemadata, types_profilemappings, types_columnpair, types_rule [EXTRACTED 1.00]
- **Profile Lifecycle Validation Flow** — page_profiles_id, comp_confirmdialog, hook_useprofilebuilder, types_profile, types_markreadyresponse, ctx_draft_ready, ctx_builder_preflight [INFERRED 0.85]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (65): ADR-0010: Capacity-based Eviction with Export, CSV Export Log (per-session + bulk), PRAGMA incremental_vacuum, maint.EvictIfOver triggers, Settings/Health Page, sync_logs cap (500k/400k watermark), sync_sessions cap (10k/9k watermark), ADR-0012: Rule DSL whitelisted single unconditional (+57 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (24): NewSessionsHandler(), openBrowser(), Instance, OpenURL(), friendlyError(), TestConnection(), NewSyncLogsRepo(), NewSyncSessionsRepo() (+16 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (44): ADR-0001 JIT as compile-time Closure Advisor, ADR-0002 Self-ref FK via FOREIGN_KEY_CHECKS=0, ADR-0003 Chunk transaction with per-row fallback, sync_logs schema fields, sync_sessions.status enum (running/done/interrupted/failed), ADR-0005 SSE snapshot-on-connect, no replay, internal/sync/preflight.go, ADR-0006 Schema drift hybrid pre-flight (+36 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (31): binaryDir(), main(), run(), translateCast(), translateDate(), translateEnumMap(), fmtValue(), PreviewResult (+23 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (15): detectWSL(), OpenURL(), NewIntrospector(), Introspector, Close(), scanConnectionRows(), stringPtr(), Connection (+7 more)

### Community 5 - "Community 5"
Cohesion: 0.17
Nodes (9): ConnectionHandler, getID(), CreateConnectionRequest, getProfileID(), ProfilesHandler, getSessionID(), SessionsHandler, handleAPI() (+1 more)

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (21): PassphraseProvider, NewBootstrapper(), Bootstrapper, Bootstrapper ApplyMigrations, Heal Function, cleanupZombieSessions, cleanupZombieSessions(), EnsureDB() (+13 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (25): CreateProfileRequest, MarkReadyRequest, PreviewRuleRequest, isPK(), modelSchemaFromMaria(), modelSchemaMapFromMaria(), NewProfilesHandler(), toModelTableSchemaMap() (+17 more)

### Community 8 - "Community 8"
Cohesion: 0.1
Nodes (34): ConfirmDialog, ProfileSidebar, ProfileTable, ProfileTabs, RuleEditorDialog, Builder-time vs Preflight Validation, Closure Advisor, Column Pairing (+26 more)

### Community 9 - "Community 9"
Cohesion: 0.15
Nodes (6): Broker, Event, EventData, NewEvent(), EventType, Handler

### Community 10 - "Community 10"
Cohesion: 0.16
Nodes (9): KeystoreProvider, Params, NewPassphraseKeyProvider(), NewPassphraseProvider(), TestPassphraseEncryptDecrypt(), TestPassphraseRekey(), TestPassphraseWrongKey(), AppSettingsRepo (+1 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (18): buildDAG Method, ClosureAdvisor, detectCycle Method, Expand Method, topologicalSort Method, connectProfile Method, DB Helpers, Run Method (+10 more)

### Community 12 - "Community 12"
Cohesion: 0.19
Nodes (12): Column, ForeignKey, Schema, TableSchema, ColumnInfo, ColumnPairing, MappingProfile, ProfileMappings (+4 more)

### Community 13 - "Community 13"
Cohesion: 0.2
Nodes (12): CastRule, CastTargetType, DateParseErrorMode, DateRule, EnumMapRule, FallbackStrategy, RegexRule, Rule (+4 more)

### Community 14 - "Community 14"
Cohesion: 0.26
Nodes (4): TestClosureAdvisorExpand(), TestClosureAdvisorTopologicalSort(), ClosureAdvisor, TableWithRole

### Community 15 - "Community 15"
Cohesion: 0.24
Nodes (9): ErrorCategory, ToFriendly(), FriendlyError, extractColumn(), extractFK(), extractUniqueKey(), extractValue(), isEmoji() (+1 more)

### Community 16 - "Community 16"
Cohesion: 0.22
Nodes (7): checkDestDrift(), DriftItem, DriftReport, getSchema(), Preflight(), ToFriendlyDrift(), checkSourceDrift()

### Community 17 - "Community 17"
Cohesion: 0.25
Nodes (3): NewConnectionHandler(), NewConnectionsRepo(), ConnectionsRepo

### Community 18 - "Community 18"
Cohesion: 0.54
Nodes (8): fmtValue, translateCast, translateDate, translateEnumMap, translateRegex, translateStringOp, TranslateToFunc, Validate

### Community 19 - "Community 19"
Cohesion: 0.29
Nodes (7): Magic MariaDB Sync (project guidance), Target folder layout, M1 Bootstrap & Embed, M8 Packaging, Implementation plan (M1–M8), PRD v2.0 executive summary, PRD original draft

### Community 20 - "Community 20"
Cohesion: 0.4
Nodes (4): Getter, KeyMode, KeyProvider, ProviderFactory

### Community 21 - "Community 21"
Cohesion: 0.4
Nodes (5): ConnectionHandler Create, ConnectionHandler Update, KeyProvider Interface, NewKeystoreProvider, NewPassphraseProvider

### Community 22 - "Community 22"
Cohesion: 0.6
Nodes (5): ProfilesHandler MarkReady, Conflict Struct, HasCollision, ToFriendlyCollision, ValidateProfileForReady

### Community 23 - "Community 23"
Cohesion: 0.5
Nodes (2): useProfileBuilder(), ProfileBuilderPage()

### Community 25 - "Community 25"
Cohesion: 0.5
Nodes (4): CSV export of sync_logs, Capacity-based retention with export, M6 Maintenance (retention, vacuum), Retention Policy (30 days, PRD)

### Community 26 - "Community 26"
Cohesion: 0.5
Nodes (4): Self-healing SQLite (internal/db/heal.go), App startup & lifecycle (ephemeral port + single-instance), SQLite migration strategy (numbered SQL), Self-Healing SQLite (PRD §5)

### Community 27 - "Community 27"
Cohesion: 0.67
Nodes (4): Connection Struct, ConnectionsRepo Get, ConnectionsRepo List, MappingProfilesRepo GetConnection

### Community 28 - "Community 28"
Cohesion: 0.67
Nodes (3): AES-GCM credential encryption, Credential mode wizard (lazy-prompt), M2 Repos, Connections, Schema Introspection

### Community 29 - "Community 29"
Cohesion: 0.67
Nodes (3): ADR-0008 Profile snapshot on session start, sync_sessions.profile_snapshot_json column, Profile snapshot in Sync Session

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (3): checkDestDrift Function, checkSourceDrift Function, Preflight Function

### Community 31 - "Community 31"
Cohesion: 0.67
Nodes (3): openBrowser, Instance Acquire, OpenURL Browser

### Community 32 - "Community 32"
Cohesion: 0.67
Nodes (3): SessionsHandler Start, MappingProfilesRepo List, SyncSessionsRepo AnyRunning

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (2): Internal SQLite schema (4 tables), Internal Data Schema (PRD §6)

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (2): File size cap rule (≤100/120 lines), Definition of Done checklist

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (2): Error Templates, ToFriendly Function

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (2): KeystoreProvider Encrypt, PassphraseProvider Encrypt

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (2): KeystoreProvider Decrypt, PassphraseProvider Decrypt

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (2): SessionsHandler Get, SyncSessionsRepo Get

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (2): SessionsHandler List, SyncSessionsRepo List

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (2): SessionsHandler, SyncSessionsRepo Create

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (2): ConnectionHandler TestPostSave, ConnectionHandler TestPreSave

### Community 55 - "Community 55"
Cohesion: 1.0
Nodes (1): Smart Mapping feature

### Community 56 - "Community 56"
Cohesion: 1.0
Nodes (1): Out of Scope V1 (PRD §8)

### Community 57 - "Community 57"
Cohesion: 1.0
Nodes (1): SQL Builder

### Community 58 - "Community 58"
Cohesion: 1.0
Nodes (1): Row Reader

### Community 59 - "Community 59"
Cohesion: 1.0
Nodes (1): Upsert Executor

### Community 60 - "Community 60"
Cohesion: 1.0
Nodes (1): SyncSessionsRepo UpdateStatus

### Community 61 - "Community 61"
Cohesion: 1.0
Nodes (1): SyncSessionsRepo UpdateProgress

### Community 62 - "Community 62"
Cohesion: 1.0
Nodes (1): SyncSessionsRepo GetProfileSnapshot

### Community 63 - "Community 63"
Cohesion: 1.0
Nodes (1): SyncSessionsRepo GetConnection

### Community 64 - "Community 64"
Cohesion: 1.0
Nodes (1): SyncLogsRepo Insert

### Community 65 - "Community 65"
Cohesion: 1.0
Nodes (1): SyncLogsRepo ListBySession

### Community 66 - "Community 66"
Cohesion: 1.0
Nodes (1): SyncLogsRepo CountByCode

### Community 67 - "Community 67"
Cohesion: 1.0
Nodes (1): SyncLogsRepo CountByTable

### Community 68 - "Community 68"
Cohesion: 1.0
Nodes (1): ConnectionsRepo Create

### Community 69 - "Community 69"
Cohesion: 1.0
Nodes (1): ConnectionsRepo Update

### Community 70 - "Community 70"
Cohesion: 1.0
Nodes (1): ConnectionsRepo Delete

### Community 71 - "Community 71"
Cohesion: 1.0
Nodes (1): ConnectionsRepo UpdateTestStatus

### Community 72 - "Community 72"
Cohesion: 1.0
Nodes (1): MappingProfilesRepo Get

### Community 73 - "Community 73"
Cohesion: 1.0
Nodes (1): MappingProfilesRepo Create

### Community 74 - "Community 74"
Cohesion: 1.0
Nodes (1): MappingProfilesRepo Update

### Community 75 - "Community 75"
Cohesion: 1.0
Nodes (1): MappingProfilesRepo Delete

### Community 76 - "Community 76"
Cohesion: 1.0
Nodes (1): AppSettingsRepo Get

### Community 77 - "Community 77"
Cohesion: 1.0
Nodes (1): AppSettingsRepo Set

### Community 78 - "Community 78"
Cohesion: 1.0
Nodes (1): ProfilesHandler

### Community 79 - "Community 79"
Cohesion: 1.0
Nodes (1): ProfilesHandler GetSchema

### Community 80 - "Community 80"
Cohesion: 1.0
Nodes (1): ProfilesHandler Preflight

### Community 81 - "Community 81"
Cohesion: 1.0
Nodes (1): ConnectionHandler

### Community 82 - "Community 82"
Cohesion: 1.0
Nodes (1): TestConnection

### Community 83 - "Community 83"
Cohesion: 1.0
Nodes (1): ColumnInfo

## Knowledge Gaps
- **163 isolated node(s):** `TableWithRole`, `Config`, `Result`, `ErrorCategory`, `FriendlyError` (+158 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 23`** (4 nodes): `useProfileBuilder()`, `ProfileBuilderPage()`, `page.tsx`, `useProfileBuilder.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (2 nodes): `Internal SQLite schema (4 tables)`, `Internal Data Schema (PRD §6)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (2 nodes): `File size cap rule (≤100/120 lines)`, `Definition of Done checklist`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (2 nodes): `Error Templates`, `ToFriendly Function`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (2 nodes): `KeystoreProvider Encrypt`, `PassphraseProvider Encrypt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (2 nodes): `KeystoreProvider Decrypt`, `PassphraseProvider Decrypt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (2 nodes): `SessionsHandler Get`, `SyncSessionsRepo Get`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (2 nodes): `SessionsHandler List`, `SyncSessionsRepo List`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (2 nodes): `SessionsHandler`, `SyncSessionsRepo Create`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (2 nodes): `ConnectionHandler TestPostSave`, `ConnectionHandler TestPreSave`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (1 nodes): `Smart Mapping feature`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (1 nodes): `Out of Scope V1 (PRD §8)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (1 nodes): `SQL Builder`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (1 nodes): `Row Reader`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (1 nodes): `Upsert Executor`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (1 nodes): `SyncSessionsRepo UpdateStatus`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (1 nodes): `SyncSessionsRepo UpdateProgress`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (1 nodes): `SyncSessionsRepo GetProfileSnapshot`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (1 nodes): `SyncSessionsRepo GetConnection`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (1 nodes): `SyncLogsRepo Insert`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (1 nodes): `SyncLogsRepo ListBySession`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 66`** (1 nodes): `SyncLogsRepo CountByCode`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 67`** (1 nodes): `SyncLogsRepo CountByTable`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 68`** (1 nodes): `ConnectionsRepo Create`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 69`** (1 nodes): `ConnectionsRepo Update`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 70`** (1 nodes): `ConnectionsRepo Delete`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 71`** (1 nodes): `ConnectionsRepo UpdateTestStatus`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 72`** (1 nodes): `MappingProfilesRepo Get`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 73`** (1 nodes): `MappingProfilesRepo Create`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (1 nodes): `MappingProfilesRepo Update`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 75`** (1 nodes): `MappingProfilesRepo Delete`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (1 nodes): `AppSettingsRepo Get`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (1 nodes): `AppSettingsRepo Set`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 78`** (1 nodes): `ProfilesHandler`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (1 nodes): `ProfilesHandler GetSchema`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 80`** (1 nodes): `ProfilesHandler Preflight`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (1 nodes): `ConnectionHandler`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 82`** (1 nodes): `TestConnection`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 83`** (1 nodes): `ColumnInfo`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.