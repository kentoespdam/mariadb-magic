# Graph Report - mariadb-magic  (2026-05-11)

## Corpus Check
- 150 files · ~101,359 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 611 nodes · 966 edges · 29 communities detected
- Extraction: 60% EXTRACTED · 40% INFERRED · 0% AMBIGUOUS · INFERRED: 391 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 37|Community 37]]

## God Nodes (most connected - your core abstractions)
1. `run()` - 39 edges
2. `WriteError()` - 37 edges
3. `handleAPI()` - 30 edges
4. `ProfilesHandler` - 20 edges
5. `New()` - 14 edges
6. `SyncSessionsRepo` - 13 edges
7. `TranslateToFunc()` - 13 edges
8. `Load()` - 12 edges
9. `Validate()` - 12 edges
10. `SyncLogsRepo` - 11 edges

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
Cohesion: 0.11
Nodes (18): ConnectionHandler, ConnectionResponse, getID(), toConnectionResponse(), CreateConnectionRequest, WriteError(), MaintHandler, getProfileID() (+10 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (37): NewMaintHandler(), isRemoteExposed(), NewSystemHandler(), SystemHandler, runCommand(), binaryDir(), main(), run() (+29 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (15): SSERunner, Column, ForeignKey, NewIntrospector(), Introspector, Schema, TableSchema, stringPtr() (+7 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (14): PassphraseProvider, NewBootstrapper(), Bootstrapper, cleanupZombieSessions(), EnsureDB(), HasDB(), Heal(), quarantineAndRebuild() (+6 more)

### Community 4 - "Community 4"
Cohesion: 0.1
Nodes (14): Conflict, TestConflictStr(), TestToFriendlyCollisionEmpty(), TestToFriendlyCollisionMultiple(), TestToFriendlyCollisionSingle(), conflictStr(), scanMappingProfileRows(), strPtr() (+6 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (16): Config, getEnvOrDefault(), Load(), TestLoad_DefaultValues(), TestLoad_EnvOverride(), TestLoad_InvalidAppEnv(), TestLoad_InvalidLogLevel(), TestLoad_LoopbackAlways_Passes() (+8 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (9): Handler(), Broker, NewBroker(), Event, EventData, NewEvent(), EventType, Handler (+1 more)

### Community 7 - "Community 7"
Cohesion: 0.13
Nodes (15): NewConnectionHandler(), NewOnboardingHandler(), OnboardingHandler, OnboardingState, NewProfilesHandler(), NewSessionsHandler(), NewRetention(), Stats (+7 more)

### Community 8 - "Community 8"
Cohesion: 0.14
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
Cohesion: 0.15
Nodes (4): ExecTx(), scanConnectionRows(), Connection, ConnectionsRepo

### Community 13 - "Community 13"
Cohesion: 0.26
Nodes (4): TestClosureAdvisorExpand(), TestClosureAdvisorTopologicalSort(), ClosureAdvisor, TableWithRole

### Community 14 - "Community 14"
Cohesion: 0.24
Nodes (9): ErrorCategory, ToFriendly(), FriendlyError, extractColumn(), extractFK(), extractUniqueKey(), extractValue(), isEmoji() (+1 more)

### Community 15 - "Community 15"
Cohesion: 0.22
Nodes (7): checkDestDrift(), DriftItem, DriftReport, getSchema(), Preflight(), ToFriendlyDrift(), checkSourceDrift()

### Community 16 - "Community 16"
Cohesion: 0.24
Nodes (10): CreateProfileRequest, MarkReadyRequest, PreviewRuleRequest, isPK(), modelSchemaFromMaria(), modelSchemaMapFromMaria(), toModelTableSchemaMap(), SchemaResponse (+2 more)

### Community 17 - "Community 17"
Cohesion: 0.22
Nodes (8): ColumnInfo, ColumnPairing, MappingProfile, ProfileMappings, SourceValueType, TableMapping, TableSchema, TableSelection

### Community 18 - "Community 18"
Cohesion: 0.36
Nodes (7): apiDelete(), ApiError, apiGet(), apiPost(), apiPut(), generateCorrelationId(), request()

### Community 19 - "Community 19"
Cohesion: 0.25
Nodes (1): FormField()

### Community 22 - "Community 22"
Cohesion: 0.33
Nodes (3): createConnection(), deleteConnection(), updateConnection()

### Community 23 - "Community 23"
Cohesion: 0.4
Nodes (4): Getter, KeyMode, KeyProvider, ProviderFactory

### Community 27 - "Community 27"
Cohesion: 0.5
Nodes (1): AppSettingsRepo

### Community 28 - "Community 28"
Cohesion: 0.5
Nodes (2): RemoteExposedBanner(), useSystemInfo()

### Community 31 - "Community 31"
Cohesion: 0.67
Nodes (2): ErrorBody, ErrorEnvelope

### Community 32 - "Community 32"
Cohesion: 0.67
Nodes (2): AppSettings, Connection

### Community 33 - "Community 33"
Cohesion: 0.67
Nodes (1): RootLayout()

### Community 35 - "Community 35"
Cohesion: 0.67
Nodes (1): cn()

### Community 37 - "Community 37"
Cohesion: 0.67
Nodes (1): handleMarkReady()

## Knowledge Gaps
- **62 isolated node(s):** `TableWithRole`, `Config`, `Result`, `UpsertFunc`, `ErrorCategory` (+57 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 19`** (8 nodes): `Form()`, `FormControl()`, `FormField()`, `FormFieldProvider()`, `FormItem()`, `FormLabel()`, `FormMessage()`, `form.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (4 nodes): `app_settings.go`, `NewAppSettingsRepo()`, `AppSettingsRepo`, `.Get()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (4 nodes): `RemoteExposedBanner()`, `useSystemInfo()`, `RemoteExposedBanner.tsx`, `useSystemInfo.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (3 nodes): `ErrorBody`, `ErrorEnvelope`, `errors.go`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (3 nodes): `app.go`, `AppSettings`, `Connection`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (3 nodes): `RootLayout()`, `layout.tsx`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (3 nodes): `cn()`, `utils.ts`, `utils.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (3 nodes): `handleMarkReady()`, `handleStartSync()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `run()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 10`, `Community 13`?**
  _High betweenness centrality (0.160) - this node is a cross-community bridge._
- **Why does `handleAPI()` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 6`, `Community 8`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `collectAndSync()` connect `Community 9` to `Community 0`, `Community 2`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Are the 35 inferred relationships involving `run()` (e.g. with `TestClosureAdvisorTopologicalSort()` and `TestClosureAdvisorExpand()`) actually correct?**
  _`run()` has 35 INFERRED edges - model-reasoned connections that need verification._
- **Are the 36 inferred relationships involving `WriteError()` (e.g. with `.List()` and `.Get()`) actually correct?**
  _`WriteError()` has 36 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `handleAPI()` (e.g. with `.Info()` and `.List()`) actually correct?**
  _`handleAPI()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `New()` (e.g. with `.Acquire()` and `.Insert()`) actually correct?**
  _`New()` has 13 INFERRED edges - model-reasoned connections that need verification._