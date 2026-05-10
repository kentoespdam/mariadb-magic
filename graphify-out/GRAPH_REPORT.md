# Graph Report - mariadb-magic  (2026-05-10)

## Corpus Check
- 126 files · ~68,923 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 541 nodes · 813 edges · 24 communities detected
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
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 35|Community 35]]

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
- `NewMaintHandler()` --calls--> `run()`  [INFERRED]
  internal/api/maint.go → cmd/magicsync/main.go
- `NewBootstrapper()` --calls--> `run()`  [INFERRED]
  internal/db/bootstrap.go → cmd/magicsync/main.go
- `NewBroker()` --calls--> `run()`  [INFERRED]
  internal/sse/broker.go → cmd/magicsync/main.go
- `NewHandler()` --calls--> `run()`  [INFERRED]
  internal/sse/handler.go → cmd/magicsync/main.go
- `TestClosureAdvisorTopologicalSort()` --calls--> `run()`  [INFERRED]
  internal/sync/closure_test.go → cmd/magicsync/main.go

## Communities

### Community 0 - "Community 0"
Cohesion: 0.13
Nodes (10): ConnectionHandler, getID(), CreateConnectionRequest, getProfileID(), ProfilesHandler, getSessionID(), SessionsHandler, handleAPI() (+2 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (31): binaryDir(), main(), run(), translateCast(), translateDate(), translateEnumMap(), fmtValue(), PreviewResult (+23 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (19): NewConnectionHandler(), NewOnboardingHandler(), OnboardingHandler, OnboardingState, NewProfilesHandler(), NewSessionsHandler(), NewRetention(), Stats (+11 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (14): Column, ForeignKey, NewIntrospector(), Schema, TableSchema, scanConnectionRows(), stringPtr(), Connection (+6 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (9): NewMaintHandler(), MaintHandler, detectWSL(), OpenURL(), openBrowser(), Instance, OpenURL(), Retention (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (14): Conflict, TestConflictStr(), TestToFriendlyCollisionEmpty(), TestToFriendlyCollisionMultiple(), TestToFriendlyCollisionSingle(), conflictStr(), scanMappingProfileRows(), strPtr() (+6 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (3): SSERunner, Introspector, SyncLogsRepo

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (13): NewBootstrapper(), Bootstrapper, cleanupZombieSessions(), EnsureDB(), HasDB(), Heal(), quarantineAndRebuild(), extractVersion() (+5 more)

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (8): Broker, NewBroker(), Event, EventData, NewEvent(), EventType, Handler, NewHandler()

### Community 9 - "Community 9"
Cohesion: 0.16
Nodes (9): KeystoreProvider, Params, NewPassphraseKeyProvider(), NewPassphraseProvider(), TestPassphraseEncryptDecrypt(), TestPassphraseRekey(), TestPassphraseWrongKey(), PassphraseProvider (+1 more)

### Community 10 - "Community 10"
Cohesion: 0.16
Nodes (13): Config, execChunk(), collectAndSync(), execute(), findMapping(), findPKCols(), New(), processTable() (+5 more)

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

### Community 17 - "Community 17"
Cohesion: 0.22
Nodes (8): ColumnInfo, ColumnPairing, MappingProfile, ProfileMappings, SourceValueType, TableMapping, TableSchema, TableSelection

### Community 18 - "Community 18"
Cohesion: 0.38
Nodes (4): StatusBadge(), getConnectionStatusStyle(), getProfileStatusStyle(), getSessionStatusStyle()

### Community 21 - "Community 21"
Cohesion: 0.4
Nodes (4): Getter, KeyMode, KeyProvider, ProviderFactory

### Community 22 - "Community 22"
Cohesion: 0.4
Nodes (2): ApiError, apiFetch()

### Community 23 - "Community 23"
Cohesion: 0.4
Nodes (2): cn(), Badge()

### Community 29 - "Community 29"
Cohesion: 0.67
Nodes (2): AppSettings, Connection

### Community 30 - "Community 30"
Cohesion: 0.67
Nodes (1): RootLayout()

### Community 35 - "Community 35"
Cohesion: 0.67
Nodes (1): handleMarkReady()

## Knowledge Gaps
- **56 isolated node(s):** `TableWithRole`, `Config`, `Result`, `UpsertFunc`, `ErrorCategory` (+51 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 22`** (5 nodes): `ApiError`, `.constructor()`, `apiFetch()`, `getApiErrorMessage()`, `api.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (5 nodes): `cn()`, `Badge()`, `utils.ts`, `badge.tsx`, `utils.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (3 nodes): `app.go`, `AppSettings`, `Connection`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (3 nodes): `RootLayout()`, `layout.tsx`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (3 nodes): `handleMarkReady()`, `handleStartSync()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `run()` connect `Community 1` to `Community 0`, `Community 2`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 12`?**
  _High betweenness centrality (0.131) - this node is a cross-community bridge._
- **Why does `handleAPI()` connect `Community 0` to `Community 8`, `Community 1`, `Community 4`, `Community 6`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `collectAndSync()` connect `Community 10` to `Community 0`, `Community 6`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Are the 26 inferred relationships involving `run()` (e.g. with `TestClosureAdvisorTopologicalSort()` and `TestClosureAdvisorExpand()`) actually correct?**
  _`run()` has 26 INFERRED edges - model-reasoned connections that need verification._
- **Are the 25 inferred relationships involving `handleAPI()` (e.g. with `.List()` and `.Create()`) actually correct?**
  _`handleAPI()` has 25 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `TranslateToFunc()` (e.g. with `execChunk()` and `TestTranslateCast()`) actually correct?**
  _`TranslateToFunc()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `Validate()` (e.g. with `.PreviewRule()` and `TestValidateCast()`) actually correct?**
  _`Validate()` has 6 INFERRED edges - model-reasoned connections that need verification._