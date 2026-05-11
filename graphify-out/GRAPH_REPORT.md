# Graph Report - mariadb-magic  (2026-05-11)

## Corpus Check
- 94 files · ~93,935 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 472 nodes · 821 edges · 24 communities detected
- Extraction: 58% EXTRACTED · 42% INFERRED · 0% AMBIGUOUS · INFERRED: 341 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 29|Community 29]]

## God Nodes (most connected - your core abstractions)
1. `WriteError()` - 36 edges
2. `run()` - 33 edges
3. `handleAPI()` - 29 edges
4. `ProfilesHandler` - 20 edges
5. `TranslateToFunc()` - 13 edges
6. `Validate()` - 12 edges
7. `New()` - 11 edges
8. `SyncSessionsRepo` - 11 edges
9. `SyncLogsRepo` - 10 edges
10. `MappingProfilesRepo` - 9 edges

## Surprising Connections (you probably didn't know these)
- `NewBootstrapper()` --calls--> `run()`  [INFERRED]
  internal/db/bootstrap.go → cmd/magicsync/main.go
- `NewBroker()` --calls--> `run()`  [INFERRED]
  internal/sse/broker.go → cmd/magicsync/main.go
- `NewHandler()` --calls--> `run()`  [INFERRED]
  internal/sse/handler.go → cmd/magicsync/main.go
- `TestClosureAdvisorTopologicalSort()` --calls--> `run()`  [INFERRED]
  internal/sync/closure_test.go → cmd/magicsync/main.go
- `TestClosureAdvisorExpand()` --calls--> `run()`  [INFERRED]
  internal/sync/closure_test.go → cmd/magicsync/main.go

## Communities

### Community 0 - "Community 0"
Cohesion: 0.15
Nodes (11): ConnectionHandler, getID(), toConnectionResponse(), WriteError(), MaintHandler, getProfileID(), ProfilesHandler, getSessionID() (+3 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (33): NewMaintHandler(), binaryDir(), main(), run(), TestDriftReport_IsReadyEligible(), translateCast(), translateDate(), translateEnumMap() (+25 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (15): Column, ForeignKey, NewIntrospector(), Schema, TableSchema, scanConnectionRows(), stringPtr(), Connection (+7 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (21): ConnectionResponse, NewConnectionHandler(), CreateConnectionRequest, NewOnboardingHandler(), OnboardingHandler, OnboardingState, NewProfilesHandler(), NewSessionsHandler() (+13 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (14): PassphraseProvider, NewBootstrapper(), Bootstrapper, cleanupZombieSessions(), EnsureDB(), HasDB(), Heal(), quarantineAndRebuild() (+6 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (5): SSERunner, Introspector, friendlyError(), TestConnection(), SyncLogsRepo

### Community 6 - "Community 6"
Cohesion: 0.1
Nodes (14): Conflict, TestConflictStr(), TestToFriendlyCollisionEmpty(), TestToFriendlyCollisionMultiple(), TestToFriendlyCollisionSingle(), conflictStr(), scanMappingProfileRows(), strPtr() (+6 more)

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (8): Broker, NewBroker(), Event, EventData, NewEvent(), EventType, Handler, NewHandler()

### Community 8 - "Community 8"
Cohesion: 0.15
Nodes (6): detectWSL(), OpenURL(), openBrowser(), Instance, OpenURL(), Retention

### Community 9 - "Community 9"
Cohesion: 0.16
Nodes (13): Config, execChunk(), collectAndSync(), execute(), findMapping(), findPKCols(), New(), processTable() (+5 more)

### Community 10 - "Community 10"
Cohesion: 0.23
Nodes (8): KeystoreProvider, Params, NewPassphraseKeyProvider(), NewPassphraseProvider(), TestPassphraseEncryptDecrypt(), TestPassphraseRekey(), TestPassphraseWrongKey(), decryptPassword()

### Community 11 - "Community 11"
Cohesion: 0.14
Nodes (12): CastRule, CastTargetType, DateParseErrorMode, DateRule, EnumMapRule, FallbackStrategy, RegexRule, Rule (+4 more)

### Community 12 - "Community 12"
Cohesion: 0.26
Nodes (4): TestClosureAdvisorExpand(), TestClosureAdvisorTopologicalSort(), ClosureAdvisor, TableWithRole

### Community 13 - "Community 13"
Cohesion: 0.24
Nodes (9): ErrorCategory, ToFriendly(), FriendlyError, extractColumn(), extractFK(), extractUniqueKey(), extractValue(), isEmoji() (+1 more)

### Community 14 - "Community 14"
Cohesion: 0.22
Nodes (7): checkDestDrift(), DriftItem, DriftReport, getSchema(), Preflight(), ToFriendlyDrift(), checkSourceDrift()

### Community 15 - "Community 15"
Cohesion: 0.27
Nodes (9): CreateProfileRequest, MarkReadyRequest, PreviewRuleRequest, isPK(), modelSchemaFromMaria(), modelSchemaMapFromMaria(), toModelTableSchemaMap(), SchemaResponse (+1 more)

### Community 16 - "Community 16"
Cohesion: 0.22
Nodes (8): ColumnInfo, ColumnPairing, MappingProfile, ProfileMappings, SourceValueType, TableMapping, TableSchema, TableSelection

### Community 17 - "Community 17"
Cohesion: 0.4
Nodes (4): Getter, KeyMode, KeyProvider, ProviderFactory

### Community 20 - "Community 20"
Cohesion: 0.5
Nodes (1): AppSettingsRepo

### Community 23 - "Community 23"
Cohesion: 0.67
Nodes (2): ErrorBody, ErrorEnvelope

### Community 24 - "Community 24"
Cohesion: 0.67
Nodes (2): AppSettings, Connection

### Community 25 - "Community 25"
Cohesion: 0.67
Nodes (1): RootLayout()

### Community 27 - "Community 27"
Cohesion: 0.67
Nodes (1): cn()

### Community 29 - "Community 29"
Cohesion: 0.67
Nodes (1): handleMarkReady()

## Knowledge Gaps
- **60 isolated node(s):** `TableWithRole`, `Config`, `Result`, `UpsertFunc`, `ErrorCategory` (+55 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 20`** (4 nodes): `app_settings.go`, `NewAppSettingsRepo()`, `AppSettingsRepo`, `.Get()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (3 nodes): `ErrorBody`, `ErrorEnvelope`, `errors.go`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (3 nodes): `app.go`, `AppSettings`, `Connection`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (3 nodes): `RootLayout()`, `layout.tsx`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (3 nodes): `cn()`, `utils.ts`, `utils.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (3 nodes): `handleMarkReady()`, `handleStartSync()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `run()` connect `Community 1` to `Community 0`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 10`, `Community 12`?**
  _High betweenness centrality (0.186) - this node is a cross-community bridge._
- **Why does `handleAPI()` connect `Community 0` to `Community 1`, `Community 4`, `Community 5`, `Community 7`, `Community 8`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Why does `collectAndSync()` connect `Community 9` to `Community 0`, `Community 5`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Are the 35 inferred relationships involving `WriteError()` (e.g. with `.List()` and `.Get()`) actually correct?**
  _`WriteError()` has 35 INFERRED edges - model-reasoned connections that need verification._
- **Are the 29 inferred relationships involving `run()` (e.g. with `TestClosureAdvisorTopologicalSort()` and `TestClosureAdvisorExpand()`) actually correct?**
  _`run()` has 29 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `handleAPI()` (e.g. with `.List()` and `.Create()`) actually correct?**
  _`handleAPI()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `TranslateToFunc()` (e.g. with `execChunk()` and `TestTranslateCast()`) actually correct?**
  _`TranslateToFunc()` has 12 INFERRED edges - model-reasoned connections that need verification._