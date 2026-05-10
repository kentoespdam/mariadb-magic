# Graph Report - mariadb-magic  (2026-05-10)

## Corpus Check
- 128 files · ~69,193 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 544 nodes · 814 edges · 24 communities detected
- Extraction: 63% EXTRACTED · 37% INFERRED · 0% AMBIGUOUS · INFERRED: 301 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 34|Community 34]]

## God Nodes (most connected - your core abstractions)
1. `run()` - 30 edges
2. `handleAPI()` - 27 edges
3. `ProfilesHandler` - 20 edges
4. `TranslateToFunc()` - 13 edges
5. `Validate()` - 12 edges
6. `SyncSessionsRepo` - 11 edges
7. `New()` - 10 edges
8. `SyncLogsRepo` - 10 edges
9. `MappingProfilesRepo` - 9 edges
10. `getProfileID()` - 9 edges

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
Cohesion: 0.05
Nodes (44): NewConnectionHandler(), NewMaintHandler(), NewOnboardingHandler(), OnboardingHandler, OnboardingState, NewProfilesHandler(), NewSessionsHandler(), binaryDir() (+36 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (11): ConnectionHandler, getID(), CreateConnectionRequest, MaintHandler, getProfileID(), ProfilesHandler, getSessionID(), SessionsHandler (+3 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (16): detectWSL(), OpenURL(), Retention, Column, ForeignKey, NewIntrospector(), Schema, TableSchema (+8 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (9): openBrowser(), Instance, OpenURL(), friendlyError(), scanConnectionRows(), Connection, ConnectionsRepo, New() (+1 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (5): SSERunner, Introspector, LogGroup, SyncLog, SyncLogsRepo

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (14): Conflict, TestConflictStr(), TestToFriendlyCollisionEmpty(), TestToFriendlyCollisionMultiple(), TestToFriendlyCollisionSingle(), conflictStr(), scanMappingProfileRows(), strPtr() (+6 more)

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (13): NewBootstrapper(), Bootstrapper, cleanupZombieSessions(), EnsureDB(), HasDB(), Heal(), quarantineAndRebuild(), extractVersion() (+5 more)

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (8): Broker, NewBroker(), Event, EventData, NewEvent(), EventType, Handler, NewHandler()

### Community 8 - "Community 8"
Cohesion: 0.16
Nodes (9): KeystoreProvider, Params, NewPassphraseKeyProvider(), NewPassphraseProvider(), TestPassphraseEncryptDecrypt(), TestPassphraseRekey(), TestPassphraseWrongKey(), PassphraseProvider (+1 more)

### Community 9 - "Community 9"
Cohesion: 0.16
Nodes (13): Config, execChunk(), collectAndSync(), execute(), findMapping(), findPKCols(), New(), processTable() (+5 more)

### Community 10 - "Community 10"
Cohesion: 0.14
Nodes (12): CastRule, CastTargetType, DateParseErrorMode, DateRule, EnumMapRule, FallbackStrategy, RegexRule, Rule (+4 more)

### Community 11 - "Community 11"
Cohesion: 0.26
Nodes (4): TestClosureAdvisorExpand(), TestClosureAdvisorTopologicalSort(), ClosureAdvisor, TableWithRole

### Community 12 - "Community 12"
Cohesion: 0.24
Nodes (9): ErrorCategory, ToFriendly(), FriendlyError, extractColumn(), extractFK(), extractUniqueKey(), extractValue(), isEmoji() (+1 more)

### Community 13 - "Community 13"
Cohesion: 0.22
Nodes (7): checkDestDrift(), DriftItem, DriftReport, getSchema(), Preflight(), ToFriendlyDrift(), checkSourceDrift()

### Community 14 - "Community 14"
Cohesion: 0.27
Nodes (9): CreateProfileRequest, MarkReadyRequest, PreviewRuleRequest, isPK(), modelSchemaFromMaria(), modelSchemaMapFromMaria(), toModelTableSchemaMap(), SchemaResponse (+1 more)

### Community 16 - "Community 16"
Cohesion: 0.22
Nodes (8): ColumnInfo, ColumnPairing, MappingProfile, ProfileMappings, SourceValueType, TableMapping, TableSchema, TableSelection

### Community 17 - "Community 17"
Cohesion: 0.38
Nodes (4): StatusBadge(), getConnectionStatusStyle(), getProfileStatusStyle(), getSessionStatusStyle()

### Community 18 - "Community 18"
Cohesion: 0.4
Nodes (4): Getter, KeyMode, KeyProvider, ProviderFactory

### Community 19 - "Community 19"
Cohesion: 0.4
Nodes (2): ApiError, apiFetch()

### Community 20 - "Community 20"
Cohesion: 0.4
Nodes (2): cn(), Badge()

### Community 25 - "Community 25"
Cohesion: 0.5
Nodes (1): AppSettingsRepo

### Community 29 - "Community 29"
Cohesion: 0.67
Nodes (2): AppSettings, Connection

### Community 30 - "Community 30"
Cohesion: 0.67
Nodes (1): RootLayout()

### Community 34 - "Community 34"
Cohesion: 0.67
Nodes (1): handleMarkReady()

## Knowledge Gaps
- **56 isolated node(s):** `TableWithRole`, `Config`, `Result`, `UpsertFunc`, `ErrorCategory` (+51 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 19`** (5 nodes): `ApiError`, `.constructor()`, `apiFetch()`, `getApiErrorMessage()`, `api.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (5 nodes): `cn()`, `Badge()`, `utils.ts`, `badge.tsx`, `utils.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (4 nodes): `app_settings.go`, `NewAppSettingsRepo()`, `AppSettingsRepo`, `.Get()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (3 nodes): `app.go`, `AppSettings`, `Connection`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (3 nodes): `RootLayout()`, `layout.tsx`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (3 nodes): `handleMarkReady()`, `handleStartSync()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `run()` connect `Community 0` to `Community 1`, `Community 2`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 11`?**
  _High betweenness centrality (0.130) - this node is a cross-community bridge._
- **Why does `handleAPI()` connect `Community 1` to `Community 0`, `Community 2`, `Community 4`, `Community 7`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Why does `collectAndSync()` connect `Community 9` to `Community 1`, `Community 4`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Are the 26 inferred relationships involving `run()` (e.g. with `TestClosureAdvisorTopologicalSort()` and `TestClosureAdvisorExpand()`) actually correct?**
  _`run()` has 26 INFERRED edges - model-reasoned connections that need verification._
- **Are the 25 inferred relationships involving `handleAPI()` (e.g. with `.List()` and `.Create()`) actually correct?**
  _`handleAPI()` has 25 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `TranslateToFunc()` (e.g. with `execChunk()` and `TestTranslateCast()`) actually correct?**
  _`TranslateToFunc()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `Validate()` (e.g. with `.PreviewRule()` and `TestValidateCast()`) actually correct?**
  _`Validate()` has 6 INFERRED edges - model-reasoned connections that need verification._