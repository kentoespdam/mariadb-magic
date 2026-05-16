# Graph Report - internal  (2026-05-16)

## Corpus Check
- 59 files · ~16,576 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 391 nodes · 683 edges · 20 communities detected
- Extraction: 64% EXTRACTED · 36% INFERRED · 0% AMBIGUOUS · INFERRED: 249 edges (avg confidence: 0.8)
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

## God Nodes (most connected - your core abstractions)
1. `WriteError()` - 38 edges
2. `Close()` - 27 edges
3. `ProfilesHandler` - 20 edges
4. `New()` - 16 edges
5. `SyncSessionsRepo` - 13 edges
6. `SyncLogsRepo` - 11 edges
7. `MappingProfilesRepo` - 11 edges
8. `ConnectionHandler` - 10 edges
9. `Handler` - 10 edges
10. `getProfileID()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `collectAndSync()` --calls--> `Close()`  [INFERRED]
  sync/upsert/processor.go → mariadb/pool.go
- `execChunk()` --calls--> `TranslateToFunc()`  [INFERRED]
  sync/upsert/executor.go → rules/translate.go
- `CorrelationID()` --calls--> `New()`  [INFERRED]
  api/middleware/correlation.go → sync/runner/runner.go
- `Init()` --calls--> `New()`  [INFERRED]
  observability/logger.go → sync/runner/runner.go
- `friendlyError()` --calls--> `New()`  [INFERRED]
  mariadb/test.go → sync/runner/runner.go

## Communities

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (18): BatchCreateRequest, BatchCreateResponse, ConnectionHandler, ConnectionResponse, getID(), toConnectionResponse(), CreateConnectionRequest, ErrorBody (+10 more)

### Community 1 - "Community 1"
Cohesion: 0.12
Nodes (15): CreateProfileRequest, MarkReadyRequest, PreviewRuleRequest, getProfileID(), isPK(), modelSchemaFromMaria(), modelSchemaMapFromMaria(), toModelTableSchemaMap() (+7 more)

### Community 2 - "Community 2"
Cohesion: 0.1
Nodes (14): Params, NewPassphraseKeyProvider(), NewPassphraseProvider(), Column, ForeignKey, NewIntrospector(), Schema, TableSchema (+6 more)

### Community 3 - "Community 3"
Cohesion: 0.1
Nodes (20): NewConnectionHandler(), NewOnboardingHandler(), OnboardingHandler, OnboardingState, NewProfilesHandler(), NewSessionsHandler(), Config, getEnvOrDefault() (+12 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (17): translateCast(), translateDate(), translateEnumMap(), fmtValue(), PreviewResult, translateRegex(), translateString(), ToFriendly() (+9 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (12): PassphraseProvider, Bootstrapper, cleanupZombieSessions(), EnsureDB(), HasDB(), Heal(), quarantineAndRebuild(), extractVersion() (+4 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (7): ExecTx(), scanConnectionRows(), stringPtr(), Connection, ConnectionsRepo, SyncSession, SyncSessionsRepo

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (7): Handler(), Broker, Event, EventData, NewEvent(), EventType, Handler

### Community 8 - "Community 8"
Cohesion: 0.15
Nodes (3): Introspector, Close(), SyncLogsRepo

### Community 9 - "Community 9"
Cohesion: 0.12
Nodes (8): Conflict, conflictStr(), scanMappingProfileRows(), ToFriendlyCollision(), ValidateProfileForReady(), MappingProfilesRepo, ValidationError, ValidationResult

### Community 10 - "Community 10"
Cohesion: 0.15
Nodes (5): openBrowser(), Instance, OpenURL(), Retention, Stats

### Community 11 - "Community 11"
Cohesion: 0.16
Nodes (13): Config, execChunk(), collectAndSync(), execute(), findMapping(), findPKCols(), New(), processTable() (+5 more)

### Community 12 - "Community 12"
Cohesion: 0.14
Nodes (12): CastRule, CastTargetType, DateParseErrorMode, DateRule, EnumMapRule, FallbackStrategy, RegexRule, Rule (+4 more)

### Community 13 - "Community 13"
Cohesion: 0.24
Nodes (9): ErrorCategory, ToFriendly(), FriendlyError, extractColumn(), extractFK(), extractUniqueKey(), extractValue(), isEmoji() (+1 more)

### Community 14 - "Community 14"
Cohesion: 0.22
Nodes (7): checkDestDrift(), DriftItem, DriftReport, getSchema(), Preflight(), ToFriendlyDrift(), checkSourceDrift()

### Community 15 - "Community 15"
Cohesion: 0.22
Nodes (8): ColumnInfo, ColumnPairing, MappingProfile, ProfileMappings, SourceValueType, TableMapping, TableSchema, TableSelection

### Community 16 - "Community 16"
Cohesion: 0.4
Nodes (4): Getter, KeyMode, KeyProvider, ProviderFactory

### Community 17 - "Community 17"
Cohesion: 0.5
Nodes (2): isRemoteExposed(), SystemHandler

### Community 18 - "Community 18"
Cohesion: 0.5
Nodes (1): AppSettingsRepo

### Community 19 - "Community 19"
Cohesion: 0.67
Nodes (2): AppSettings, Connection

## Knowledge Gaps
- **64 isolated node(s):** `TableWithRole`, `Config`, `Result`, `UpsertFunc`, `ErrorCategory` (+59 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 17`** (5 nodes): `system.go`, `isRemoteExposed()`, `NewSystemHandler()`, `SystemHandler`, `.Info()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (4 nodes): `app_settings.go`, `NewAppSettingsRepo()`, `AppSettingsRepo`, `.Get()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (3 nodes): `app.go`, `AppSettings`, `Connection`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Close()` connect `Community 8` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 9`, `Community 11`?**
  _High betweenness centrality (0.223) - this node is a cross-community bridge._
- **Why does `WriteError()` connect `Community 0` to `Community 8`, `Community 1`, `Community 2`, `Community 4`?**
  _High betweenness centrality (0.176) - this node is a cross-community bridge._
- **Why does `New()` connect `Community 3` to `Community 0`, `Community 5`, `Community 6`, `Community 8`, `Community 9`, `Community 10`?**
  _High betweenness centrality (0.112) - this node is a cross-community bridge._
- **Are the 37 inferred relationships involving `WriteError()` (e.g. with `.List()` and `.Get()`) actually correct?**
  _`WriteError()` has 37 INFERRED edges - model-reasoned connections that need verification._
- **Are the 26 inferred relationships involving `Close()` (e.g. with `collectAndSync()` and `.connectProfile()`) actually correct?**
  _`Close()` has 26 INFERRED edges - model-reasoned connections that need verification._
- **Are the 15 inferred relationships involving `New()` (e.g. with `.Acquire()` and `.Insert()`) actually correct?**
  _`New()` has 15 INFERRED edges - model-reasoned connections that need verification._
- **What connects `TableWithRole`, `Config`, `Result` to the rest of the system?**
  _64 weakly-connected nodes found - possible documentation gaps or missing edges._