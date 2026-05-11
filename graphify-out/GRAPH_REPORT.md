# Graph Report - mariadb-magic  (2026-05-11)

## Corpus Check
- 90 files · ~92,932 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 459 nodes · 766 edges · 22 communities detected
- Extraction: 61% EXTRACTED · 39% INFERRED · 0% AMBIGUOUS · INFERRED: 300 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 27|Community 27]]

## God Nodes (most connected - your core abstractions)
1. `run()` - 32 edges
2. `handleAPI()` - 29 edges
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
Cohesion: 0.12
Nodes (11): ConnectionHandler, getID(), CreateConnectionRequest, getProfileID(), ProfilesHandler, getSessionID(), SessionsHandler, handleAPI() (+3 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (31): binaryDir(), main(), run(), translateCast(), translateDate(), translateEnumMap(), fmtValue(), PreviewResult (+23 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (17): NewConnectionHandler(), NewOnboardingHandler(), OnboardingHandler, OnboardingState, NewProfilesHandler(), NewSessionsHandler(), NewRetention(), Stats (+9 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (9): NewMaintHandler(), MaintHandler, detectWSL(), OpenURL(), openBrowser(), Instance, OpenURL(), Retention (+1 more)

### Community 4 - "Community 4"
Cohesion: 0.1
Nodes (7): scanConnectionRows(), stringPtr(), Connection, SyncSessionsRepo, connectMariaDB(), Runner, SessionError

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (14): Conflict, TestConflictStr(), TestToFriendlyCollisionEmpty(), TestToFriendlyCollisionMultiple(), TestToFriendlyCollisionSingle(), conflictStr(), scanMappingProfileRows(), strPtr() (+6 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (8): Broker, NewBroker(), Event, EventData, NewEvent(), EventType, Handler, NewHandler()

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (15): Column, ForeignKey, NewIntrospector(), Schema, TableSchema, checkDestDrift(), DriftItem, DriftReport (+7 more)

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (13): NewBootstrapper(), Bootstrapper, cleanupZombieSessions(), EnsureDB(), HasDB(), Heal(), quarantineAndRebuild(), extractVersion() (+5 more)

### Community 9 - "Community 9"
Cohesion: 0.15
Nodes (3): SSERunner, Introspector, SyncLogsRepo

### Community 10 - "Community 10"
Cohesion: 0.16
Nodes (9): KeystoreProvider, Params, NewPassphraseKeyProvider(), NewPassphraseProvider(), TestPassphraseEncryptDecrypt(), TestPassphraseRekey(), TestPassphraseWrongKey(), PassphraseProvider (+1 more)

### Community 11 - "Community 11"
Cohesion: 0.16
Nodes (13): Config, execChunk(), collectAndSync(), execute(), findMapping(), findPKCols(), New(), processTable() (+5 more)

### Community 12 - "Community 12"
Cohesion: 0.14
Nodes (12): CastRule, CastTargetType, DateParseErrorMode, DateRule, EnumMapRule, FallbackStrategy, RegexRule, Rule (+4 more)

### Community 13 - "Community 13"
Cohesion: 0.26
Nodes (4): TestClosureAdvisorExpand(), TestClosureAdvisorTopologicalSort(), ClosureAdvisor, TableWithRole

### Community 14 - "Community 14"
Cohesion: 0.24
Nodes (9): ErrorCategory, ToFriendly(), FriendlyError, extractColumn(), extractFK(), extractUniqueKey(), extractValue(), isEmoji() (+1 more)

### Community 15 - "Community 15"
Cohesion: 0.27
Nodes (9): CreateProfileRequest, MarkReadyRequest, PreviewRuleRequest, isPK(), modelSchemaFromMaria(), modelSchemaMapFromMaria(), toModelTableSchemaMap(), SchemaResponse (+1 more)

### Community 16 - "Community 16"
Cohesion: 0.22
Nodes (8): ColumnInfo, ColumnPairing, MappingProfile, ProfileMappings, SourceValueType, TableMapping, TableSchema, TableSelection

### Community 17 - "Community 17"
Cohesion: 0.4
Nodes (4): Getter, KeyMode, KeyProvider, ProviderFactory

### Community 22 - "Community 22"
Cohesion: 0.67
Nodes (2): AppSettings, Connection

### Community 23 - "Community 23"
Cohesion: 0.67
Nodes (1): RootLayout()

### Community 25 - "Community 25"
Cohesion: 0.67
Nodes (1): cn()

### Community 27 - "Community 27"
Cohesion: 0.67
Nodes (1): handleMarkReady()

## Knowledge Gaps
- **56 isolated node(s):** `TableWithRole`, `Config`, `Result`, `UpsertFunc`, `ErrorCategory` (+51 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 22`** (3 nodes): `app.go`, `AppSettings`, `Connection`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (3 nodes): `RootLayout()`, `layout.tsx`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (3 nodes): `cn()`, `utils.ts`, `utils.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (3 nodes): `handleMarkReady()`, `handleStartSync()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `run()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 5`, `Community 6`, `Community 8`, `Community 9`, `Community 10`, `Community 13`?**
  _High betweenness centrality (0.190) - this node is a cross-community bridge._
- **Why does `handleAPI()` connect `Community 0` to `Community 1`, `Community 3`, `Community 6`, `Community 7`, `Community 8`, `Community 9`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **Why does `collectAndSync()` connect `Community 11` to `Community 0`, `Community 9`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `run()` (e.g. with `TestClosureAdvisorTopologicalSort()` and `TestClosureAdvisorExpand()`) actually correct?**
  _`run()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `handleAPI()` (e.g. with `.List()` and `.Create()`) actually correct?**
  _`handleAPI()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `TranslateToFunc()` (e.g. with `execChunk()` and `TestTranslateCast()`) actually correct?**
  _`TranslateToFunc()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `Validate()` (e.g. with `.PreviewRule()` and `TestValidateCast()`) actually correct?**
  _`Validate()` has 6 INFERRED edges - model-reasoned connections that need verification._