# Graph Report - mariadb-magic  (2026-05-10)

## Corpus Check
- 82 files · ~60,107 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 437 nodes · 746 edges · 21 communities detected
- Extraction: 60% EXTRACTED · 40% INFERRED · 0% AMBIGUOUS · INFERRED: 296 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]

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
Cohesion: 0.1
Nodes (12): ConnectionHandler, getID(), CreateConnectionRequest, MaintHandler, getProfileID(), ProfilesHandler, getSessionID(), SessionsHandler (+4 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (32): NewMaintHandler(), binaryDir(), main(), run(), translateCast(), translateDate(), translateEnumMap(), fmtValue() (+24 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (18): NewConnectionHandler(), NewOnboardingHandler(), OnboardingHandler, OnboardingState, NewProfilesHandler(), NewSessionsHandler(), NewRetention(), Stats (+10 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (11): SSERunner, Column, ForeignKey, NewIntrospector(), Introspector, Schema, TableSchema, SyncLogsRepo (+3 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (9): detectWSL(), OpenURL(), Retention, scanConnectionRows(), stringPtr(), Connection, SyncSessionsRepo, connectMariaDB() (+1 more)

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

### Community 15 - "Community 15"
Cohesion: 0.28
Nodes (3): openBrowser(), Instance, OpenURL()

### Community 16 - "Community 16"
Cohesion: 0.22
Nodes (8): ColumnInfo, ColumnPairing, MappingProfile, ProfileMappings, SourceValueType, TableMapping, TableSchema, TableSelection

### Community 17 - "Community 17"
Cohesion: 0.4
Nodes (4): Getter, KeyMode, KeyProvider, ProviderFactory

### Community 18 - "Community 18"
Cohesion: 0.5
Nodes (1): AppSettingsRepo

### Community 21 - "Community 21"
Cohesion: 0.67
Nodes (2): AppSettings, Connection

### Community 22 - "Community 22"
Cohesion: 0.67
Nodes (1): handleMarkReady()

## Knowledge Gaps
- **56 isolated node(s):** `TableWithRole`, `Config`, `Result`, `UpsertFunc`, `ErrorCategory` (+51 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 18`** (4 nodes): `app_settings.go`, `NewAppSettingsRepo()`, `AppSettingsRepo`, `.Get()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (3 nodes): `app.go`, `AppSettings`, `Connection`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (3 nodes): `handleMarkReady()`, `handleStartSync()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `run()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 11`?**
  _High betweenness centrality (0.199) - this node is a cross-community bridge._
- **Why does `handleAPI()` connect `Community 0` to `Community 1`, `Community 3`, `Community 4`, `Community 7`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Why does `collectAndSync()` connect `Community 9` to `Community 0`, `Community 3`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Are the 26 inferred relationships involving `run()` (e.g. with `TestClosureAdvisorTopologicalSort()` and `TestClosureAdvisorExpand()`) actually correct?**
  _`run()` has 26 INFERRED edges - model-reasoned connections that need verification._
- **Are the 25 inferred relationships involving `handleAPI()` (e.g. with `.List()` and `.Create()`) actually correct?**
  _`handleAPI()` has 25 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `TranslateToFunc()` (e.g. with `execChunk()` and `TestTranslateCast()`) actually correct?**
  _`TranslateToFunc()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `Validate()` (e.g. with `.PreviewRule()` and `TestValidateCast()`) actually correct?**
  _`Validate()` has 6 INFERRED edges - model-reasoned connections that need verification._