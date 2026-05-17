# Graph Report - mariadb-magic  (2026-05-17)

## Corpus Check
- 197 files · ~168,017 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 753 nodes · 1182 edges · 37 communities detected
- Extraction: 58% EXTRACTED · 42% INFERRED · 0% AMBIGUOUS · INFERRED: 495 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 47|Community 47]]

## God Nodes (most connected - your core abstractions)
1. `run()` - 41 edges
2. `WriteError()` - 38 edges
3. `handleAPI()` - 34 edges
4. `ProfilesHandler` - 20 edges
5. `New()` - 14 edges
6. `runProfilesPlaybook()` - 13 edges
7. `SyncSessionsRepo` - 13 edges
8. `TranslateToFunc()` - 13 edges
9. `Load()` - 12 edges
10. `Validate()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `NewBroker()` --calls--> `run()`  [INFERRED]
  internal/sse/broker.go → cmd/magicsync/main.go
- `NewHandler()` --calls--> `run()`  [INFERRED]
  internal/sse/handler.go → cmd/magicsync/main.go
- `NewPassphraseProvider()` --calls--> `TestPassphraseEncryptDecrypt()`  [INFERRED]
  internal/crypto/passphrase.go → tests/crypto/passphrase_test.go
- `NewPassphraseProvider()` --calls--> `TestPassphraseWrongKey()`  [INFERRED]
  internal/crypto/passphrase.go → tests/crypto/passphrase_test.go
- `NewPassphraseProvider()` --calls--> `TestPassphraseRekey()`  [INFERRED]
  internal/crypto/passphrase.go → tests/crypto/passphrase_test.go

## Communities

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (29): ConnectionHandler, getID(), toConnectionResponse(), WriteError(), MaintHandler, getProfileID(), ProfilesHandler, getSessionID() (+21 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (19): SSERunner, Column, ForeignKey, NewIntrospector(), Introspector, Schema, TableSchema, scanConnectionRows() (+11 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (39): NewMaintHandler(), isRemoteExposed(), NewSystemHandler(), SystemHandler, runCommand(), toFriendly(), binaryDir(), main() (+31 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (21): NewConnectionHandler(), newTestDB(), TestHandleCreate(), TestHandlePostMethodOnIDRoute(), TestHandleRoutesTestPostSave(), TestHandleRoutesTestPreSave(), NewOnboardingHandler(), OnboardingHandler (+13 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (9): Handler(), Broker, NewBroker(), Event, EventData, NewEvent(), EventType, Handler (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (16): Config, getEnvOrDefault(), Load(), TestLoad_DefaultValues(), TestLoad_EnvOverride(), TestLoad_InvalidAppEnv(), TestLoad_InvalidLogLevel(), TestLoad_LoopbackAlways_Passes() (+8 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (13): Conflict, TestToFriendlyCollisionEmpty(), TestToFriendlyCollisionMultiple(), TestToFriendlyCollisionSingle(), conflictStr(), scanMappingProfileRows(), strPtr(), TestValidateProfileForReady() (+5 more)

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (13): NewBootstrapper(), Bootstrapper, cleanupZombieSessions(), EnsureDB(), HasDB(), Heal(), quarantineAndRebuild(), extractVersion() (+5 more)

### Community 8 - "Community 8"
Cohesion: 0.17
Nodes (12): a(), B(), D(), g(), i(), k(), o(), Q() (+4 more)

### Community 9 - "Community 9"
Cohesion: 0.14
Nodes (6): detectWSL(), OpenURL(), openBrowser(), Instance, OpenURL(), Retention

### Community 10 - "Community 10"
Cohesion: 0.16
Nodes (13): Config, execChunk(), collectAndSync(), execute(), findMapping(), findPKCols(), New(), processTable() (+5 more)

### Community 11 - "Community 11"
Cohesion: 0.24
Nodes (15): createConnection(), createTestConnections(), main(), runProfilesPlaybook(), testAdversarial(), testAutoDowngrade(), testCrossProfileCollision(), testKeyboardNavigation() (+7 more)

### Community 12 - "Community 12"
Cohesion: 0.14
Nodes (12): CastRule, CastTargetType, DateParseErrorMode, DateRule, EnumMapRule, FallbackStrategy, RegexRule, Rule (+4 more)

### Community 13 - "Community 13"
Cohesion: 0.31
Nodes (11): addSortIndicators(), enableUI(), getNthColumn(), getTable(), getTableBody(), getTableHeader(), loadColumns(), loadData() (+3 more)

### Community 14 - "Community 14"
Cohesion: 0.24
Nodes (9): ErrorCategory, ToFriendly(), FriendlyError, extractColumn(), extractFK(), extractUniqueKey(), extractValue(), isEmoji() (+1 more)

### Community 15 - "Community 15"
Cohesion: 0.26
Nodes (4): TestClosureAdvisorExpand(), TestClosureAdvisorTopologicalSort(), ClosureAdvisor, TableWithRole

### Community 16 - "Community 16"
Cohesion: 0.22
Nodes (7): checkDestDrift(), DriftItem, DriftReport, getSchema(), Preflight(), ToFriendlyDrift(), checkSourceDrift()

### Community 17 - "Community 17"
Cohesion: 0.2
Nodes (8): ColumnInfo, ColumnPairing, MappingProfile, ProfileMappings, SourceValueType, TableMapping, TableSchema, TableSelection

### Community 18 - "Community 18"
Cohesion: 0.31
Nodes (2): runTests(), TestRunner

### Community 19 - "Community 19"
Cohesion: 0.36
Nodes (4): Params, NewPassphraseKeyProvider(), NewPassphraseProvider(), PassphraseProvider

### Community 20 - "Community 20"
Cohesion: 0.36
Nodes (7): apiDelete(), ApiError, apiGet(), apiPost(), apiPut(), generateCorrelationId(), request()

### Community 23 - "Community 23"
Cohesion: 0.29
Nodes (6): CreateProfileRequest, MarkReadyRequest, PreviewRuleRequest, SchemaResponse, UpdatePairingsRequest, UpdatePairingsResponse

### Community 25 - "Community 25"
Cohesion: 0.33
Nodes (3): NewProfileForm(), deleteConnection(), useConnections()

### Community 26 - "Community 26"
Cohesion: 0.4
Nodes (4): Getter, KeyMode, KeyProvider, ProviderFactory

### Community 29 - "Community 29"
Cohesion: 0.7
Nodes (4): goToNext(), goToPrevious(), makeCurrent(), toggleClass()

### Community 30 - "Community 30"
Cohesion: 0.5
Nodes (1): AppSettingsRepo

### Community 31 - "Community 31"
Cohesion: 0.83
Nodes (3): isPK(), modelSchemaFromMaria(), modelSchemaMapFromMaria()

### Community 34 - "Community 34"
Cohesion: 0.5
Nodes (2): RemoteExposedBanner(), useSystemInfo()

### Community 35 - "Community 35"
Cohesion: 0.5
Nodes (2): StatusBadge(), getStatusConfig()

### Community 38 - "Community 38"
Cohesion: 0.67
Nodes (2): ErrorBody, ErrorEnvelope

### Community 39 - "Community 39"
Cohesion: 0.67
Nodes (2): ConnectionResponse, CreateConnectionRequest

### Community 40 - "Community 40"
Cohesion: 0.67
Nodes (2): BatchCreateRequest, BatchCreateResponse

### Community 41 - "Community 41"
Cohesion: 0.67
Nodes (2): AppSettings, Connection

### Community 42 - "Community 42"
Cohesion: 0.67
Nodes (1): RootLayout()

### Community 43 - "Community 43"
Cohesion: 0.67
Nodes (1): EditProfileContent()

### Community 45 - "Community 45"
Cohesion: 0.67
Nodes (1): cn()

### Community 47 - "Community 47"
Cohesion: 0.67
Nodes (1): handleMarkReady()

## Knowledge Gaps
- **63 isolated node(s):** `TableWithRole`, `Config`, `Result`, `UpsertFunc`, `ErrorCategory` (+58 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 18`** (9 nodes): `runTests()`, `TestRunner`, `.assert()`, `.constructor()`, `.generateMarkdown()`, `.request()`, `.saveResults()`, `.test()`, `test-settings-playbook.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (4 nodes): `app_settings.go`, `NewAppSettingsRepo()`, `AppSettingsRepo`, `.Get()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (4 nodes): `RemoteExposedBanner()`, `useSystemInfo()`, `RemoteExposedBanner.tsx`, `useSystemInfo.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (4 nodes): `StatusBadge()`, `getStatusConfig()`, `StatusBadge.tsx`, `domainStatus.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (3 nodes): `ErrorBody`, `ErrorEnvelope`, `errors.go`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (3 nodes): `ConnectionResponse`, `CreateConnectionRequest`, `connections_types.go`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (3 nodes): `BatchCreateRequest`, `BatchCreateResponse`, `connections_batch.go`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (3 nodes): `app.go`, `AppSettings`, `Connection`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (3 nodes): `RootLayout()`, `layout.tsx`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (3 nodes): `EditProfileContent()`, `EditProfilePage()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (3 nodes): `cn()`, `utils.ts`, `utils.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (3 nodes): `handleMarkReady()`, `handleStartSync()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `run()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 9`, `Community 15`, `Community 19`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **Why does `handleAPI()` connect `Community 0` to `Community 1`, `Community 2`, `Community 4`, `Community 7`, `Community 9`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Why does `collectAndSync()` connect `Community 10` to `Community 0`, `Community 1`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Are the 36 inferred relationships involving `run()` (e.g. with `runCommand()` and `Load()`) actually correct?**
  _`run()` has 36 INFERRED edges - model-reasoned connections that need verification._
- **Are the 37 inferred relationships involving `WriteError()` (e.g. with `.List()` and `.Get()`) actually correct?**
  _`WriteError()` has 37 INFERRED edges - model-reasoned connections that need verification._
- **Are the 32 inferred relationships involving `handleAPI()` (e.g. with `.Info()` and `.List()`) actually correct?**
  _`handleAPI()` has 32 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `New()` (e.g. with `.Acquire()` and `.Insert()`) actually correct?**
  _`New()` has 13 INFERRED edges - model-reasoned connections that need verification._