# Graph Report - mariadb-magic  (2026-05-16)

## Corpus Check
- 156 files · ~115,944 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 652 nodes · 1024 edges · 34 communities detected
- Extraction: 62% EXTRACTED · 38% INFERRED · 0% AMBIGUOUS · INFERRED: 393 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 41|Community 41]]

## God Nodes (most connected - your core abstractions)
1. `run()` - 40 edges
2. `WriteError()` - 37 edges
3. `handleAPI()` - 30 edges
4. `ProfilesHandler` - 20 edges
5. `New()` - 14 edges
6. `runProfilesPlaybook()` - 13 edges
7. `SyncSessionsRepo` - 13 edges
8. `TranslateToFunc()` - 13 edges
9. `Load()` - 12 edges
10. `Validate()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `NewSystemHandler()` --calls--> `run()`  [INFERRED]
  internal/api/system.go → cmd/magicsync/main.go
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
Cohesion: 0.1
Nodes (17): ConnectionHandler, ConnectionResponse, getID(), toConnectionResponse(), CreateConnectionRequest, WriteError(), MaintHandler, getProfileID() (+9 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (18): detectWSL(), OpenURL(), Retention, Stats, Column, ForeignKey, NewIntrospector(), Schema (+10 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (34): NewConnectionHandler(), NewMaintHandler(), NewOnboardingHandler(), OnboardingHandler, OnboardingState, NewProfilesHandler(), NewSessionsHandler(), runCommand() (+26 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (6): Introspector, LogGroup, scanMappingProfileRows(), MappingProfilesRepo, SyncLog, SyncLogsRepo

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (9): Handler(), Broker, NewBroker(), Event, EventData, NewEvent(), EventType, Handler (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (13): NewBootstrapper(), Bootstrapper, cleanupZombieSessions(), EnsureDB(), HasDB(), Heal(), quarantineAndRebuild(), extractVersion() (+5 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (14): translateCast(), translateDate(), translateEnumMap(), fmtValue(), translateRegex(), translateString(), ToFriendly(), TranslateToFunc() (+6 more)

### Community 7 - "Community 7"
Cohesion: 0.16
Nodes (9): KeystoreProvider, Params, NewPassphraseKeyProvider(), NewPassphraseProvider(), TestPassphraseEncryptDecrypt(), TestPassphraseRekey(), TestPassphraseWrongKey(), PassphraseProvider (+1 more)

### Community 8 - "Community 8"
Cohesion: 0.16
Nodes (13): Config, execChunk(), collectAndSync(), execute(), findMapping(), findPKCols(), New(), processTable() (+5 more)

### Community 9 - "Community 9"
Cohesion: 0.17
Nodes (12): Conflict, TestConflictStr(), TestToFriendlyCollisionEmpty(), TestToFriendlyCollisionMultiple(), TestToFriendlyCollisionSingle(), conflictStr(), strPtr(), TestValidateProfileForReady() (+4 more)

### Community 10 - "Community 10"
Cohesion: 0.24
Nodes (15): createConnection(), createTestConnections(), main(), runProfilesPlaybook(), testAdversarial(), testAutoDowngrade(), testCrossProfileCollision(), testKeyboardNavigation() (+7 more)

### Community 11 - "Community 11"
Cohesion: 0.14
Nodes (12): CastRule, CastTargetType, DateParseErrorMode, DateRule, EnumMapRule, FallbackStrategy, RegexRule, Rule (+4 more)

### Community 12 - "Community 12"
Cohesion: 0.26
Nodes (11): Config, getEnvOrDefault(), Load(), TestLoad_DefaultValues(), TestLoad_EnvOverride(), TestLoad_InvalidAppEnv(), TestLoad_InvalidLogLevel(), TestLoad_LoopbackAlways_Passes() (+3 more)

### Community 13 - "Community 13"
Cohesion: 0.26
Nodes (4): TestClosureAdvisorExpand(), TestClosureAdvisorTopologicalSort(), ClosureAdvisor, TableWithRole

### Community 14 - "Community 14"
Cohesion: 0.24
Nodes (9): ErrorCategory, ToFriendly(), FriendlyError, extractColumn(), extractFK(), extractUniqueKey(), extractValue(), isEmoji() (+1 more)

### Community 15 - "Community 15"
Cohesion: 0.17
Nodes (4): ExecTx(), scanConnectionRows(), Connection, ConnectionsRepo

### Community 16 - "Community 16"
Cohesion: 0.2
Nodes (5): handleTest(), onSubmit(), SSERunner, friendlyError(), TestConnection()

### Community 17 - "Community 17"
Cohesion: 0.22
Nodes (7): checkDestDrift(), DriftItem, DriftReport, getSchema(), Preflight(), ToFriendlyDrift(), checkSourceDrift()

### Community 18 - "Community 18"
Cohesion: 0.24
Nodes (10): CreateProfileRequest, MarkReadyRequest, PreviewRuleRequest, isPK(), modelSchemaFromMaria(), modelSchemaMapFromMaria(), toModelTableSchemaMap(), SchemaResponse (+2 more)

### Community 19 - "Community 19"
Cohesion: 0.31
Nodes (2): runTests(), TestRunner

### Community 20 - "Community 20"
Cohesion: 0.31
Nodes (2): runTests(), TestRunner

### Community 21 - "Community 21"
Cohesion: 0.28
Nodes (3): openBrowser(), Instance, OpenURL()

### Community 22 - "Community 22"
Cohesion: 0.22
Nodes (8): ColumnInfo, ColumnPairing, MappingProfile, ProfileMappings, SourceValueType, TableMapping, TableSchema, TableSelection

### Community 23 - "Community 23"
Cohesion: 0.36
Nodes (7): apiDelete(), ApiError, apiGet(), apiPost(), apiPut(), generateCorrelationId(), request()

### Community 25 - "Community 25"
Cohesion: 0.25
Nodes (1): FormField()

### Community 27 - "Community 27"
Cohesion: 0.33
Nodes (3): createConnection(), deleteConnection(), updateConnection()

### Community 28 - "Community 28"
Cohesion: 0.4
Nodes (4): Getter, KeyMode, KeyProvider, ProviderFactory

### Community 32 - "Community 32"
Cohesion: 0.5
Nodes (3): isRemoteExposed(), NewSystemHandler(), SystemHandler

### Community 33 - "Community 33"
Cohesion: 0.5
Nodes (1): AppSettingsRepo

### Community 34 - "Community 34"
Cohesion: 0.5
Nodes (2): RemoteExposedBanner(), useSystemInfo()

### Community 37 - "Community 37"
Cohesion: 0.67
Nodes (2): ErrorBody, ErrorEnvelope

### Community 38 - "Community 38"
Cohesion: 0.67
Nodes (2): AppSettings, Connection

### Community 39 - "Community 39"
Cohesion: 0.67
Nodes (1): RootLayout()

### Community 41 - "Community 41"
Cohesion: 0.67
Nodes (1): cn()

## Knowledge Gaps
- **62 isolated node(s):** `TableWithRole`, `Config`, `Result`, `UpsertFunc`, `ErrorCategory` (+57 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 19`** (9 nodes): `runTests()`, `TestRunner`, `.assert()`, `.constructor()`, `.generateMarkdown()`, `.request()`, `.saveResults()`, `.test()`, `test-settings-playbook.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (9 nodes): `runTests()`, `TestRunner`, `.assert()`, `.constructor()`, `.generateMarkdown()`, `.request()`, `.saveResults()`, `.test()`, `test-profiles-playbook.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (8 nodes): `Form()`, `FormControl()`, `FormField()`, `FormFieldProvider()`, `FormItem()`, `FormLabel()`, `FormMessage()`, `form.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (4 nodes): `app_settings.go`, `NewAppSettingsRepo()`, `AppSettingsRepo`, `.Get()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (4 nodes): `RemoteExposedBanner()`, `useSystemInfo()`, `RemoteExposedBanner.tsx`, `useSystemInfo.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (3 nodes): `ErrorBody`, `ErrorEnvelope`, `errors.go`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (3 nodes): `app.go`, `AppSettings`, `Connection`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (3 nodes): `RootLayout()`, `layout.tsx`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (3 nodes): `cn()`, `utils.ts`, `utils.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `run()` connect `Community 2` to `Community 0`, `Community 1`, `Community 32`, `Community 3`, `Community 4`, `Community 5`, `Community 7`, `Community 9`, `Community 12`, `Community 13`, `Community 16`?**
  _High betweenness centrality (0.151) - this node is a cross-community bridge._
- **Why does `handleAPI()` connect `Community 0` to `Community 32`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 5`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Why does `collectAndSync()` connect `Community 8` to `Community 0`, `Community 3`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Are the 35 inferred relationships involving `run()` (e.g. with `TestClosureAdvisorTopologicalSort()` and `TestClosureAdvisorExpand()`) actually correct?**
  _`run()` has 35 INFERRED edges - model-reasoned connections that need verification._
- **Are the 36 inferred relationships involving `WriteError()` (e.g. with `.List()` and `.Get()`) actually correct?**
  _`WriteError()` has 36 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `handleAPI()` (e.g. with `.Info()` and `.List()`) actually correct?**
  _`handleAPI()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `New()` (e.g. with `.Acquire()` and `.Insert()`) actually correct?**
  _`New()` has 13 INFERRED edges - model-reasoned connections that need verification._