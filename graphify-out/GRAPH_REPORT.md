# Graph Report - mariadb-magic  (2026-05-19)

## Corpus Check
- 204 files · ~172,703 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 779 nodes · 1257 edges · 39 communities detected
- Extraction: 56% EXTRACTED · 44% INFERRED · 0% AMBIGUOUS · INFERRED: 552 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 45|Community 45]]

## God Nodes (most connected - your core abstractions)
1. `run()` - 44 edges
2. `Close()` - 34 edges
3. `handleAPI()` - 34 edges
4. `WriteError()` - 33 edges
5. `ProfilesHandler` - 21 edges
6. `New()` - 15 edges
7. `TranslateToFunc()` - 14 edges
8. `runProfilesPlaybook()` - 13 edges
9. `SyncSessionsRepo` - 13 edges
10. `TestRun_SilentFailRepro()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `NewSystemHandler()` --calls--> `run()`  [INFERRED]
  internal/api/system.go → cmd/magicsync/main.go
- `NewBroker()` --calls--> `run()`  [INFERRED]
  internal/sse/broker.go → cmd/magicsync/main.go
- `NewHandler()` --calls--> `run()`  [INFERRED]
  internal/sse/handler.go → cmd/magicsync/main.go
- `createConnection()` --calls--> `Close()`  [INFERRED]
  full-test-profiles.go → internal/mariadb/pool.go
- `testProfileCreation()` --calls--> `Close()`  [INFERRED]
  full-test-profiles.go → internal/mariadb/pool.go

## Communities

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (25): ConnectionHandler, getID(), toConnectionResponse(), WriteError(), MaintHandler, getProfileID(), ProfilesHandler, handleSaveRule() (+17 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (43): NewConnectionHandler(), newTestDB(), TestHandleCreate(), TestHandlePostMethodOnIDRoute(), TestHandleRoutesTestPostSave(), TestHandleRoutesTestPreSave(), NewMaintHandler(), NewOnboardingHandler() (+35 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (34): toFriendly(), translateCast(), translateDate(), translateEnumMap(), fmtValue(), PreviewResult, translateRegex(), translateString() (+26 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (12): Handler(), ProgressPublisher, Runner, SessionError, Broker, NewBroker(), Event, EventData (+4 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (11): detectWSL(), OpenURL(), Retention, Stats, scanConnectionRows(), stringPtr(), Connection, NewConnectionsRepo() (+3 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (17): Column, ForeignKey, NewIntrospector(), Introspector, Schema, TableSchema, checkDestDrift(), DriftItem (+9 more)

### Community 6 - "Community 6"
Cohesion: 0.1
Nodes (12): stubKey, DecryptStoredCredential(), TestDecryptStoredCredential(), KeystoreProvider, mockKeyProvider, Params, NewPassphraseKeyProvider(), NewPassphraseProvider() (+4 more)

### Community 7 - "Community 7"
Cohesion: 0.09
Nodes (18): Config, getEnvOrDefault(), Load(), TestLoad_DefaultValues(), TestLoad_EnvOverride(), TestLoad_InvalidAppEnv(), TestLoad_InvalidLogLevel(), TestLoad_LoopbackAlways_Passes() (+10 more)

### Community 8 - "Community 8"
Cohesion: 0.1
Nodes (13): Conflict, TestToFriendlyCollisionEmpty(), TestToFriendlyCollisionMultiple(), TestToFriendlyCollisionSingle(), conflictStr(), scanMappingProfileRows(), strPtr(), TestValidateProfileForReady() (+5 more)

### Community 9 - "Community 9"
Cohesion: 0.17
Nodes (12): a(), B(), D(), g(), i(), k(), o(), Q() (+4 more)

### Community 10 - "Community 10"
Cohesion: 0.24
Nodes (15): createConnection(), createTestConnections(), main(), runProfilesPlaybook(), testAdversarial(), testAutoDowngrade(), testCrossProfileCollision(), testKeyboardNavigation() (+7 more)

### Community 11 - "Community 11"
Cohesion: 0.14
Nodes (12): CastRule, CastTargetType, DateParseErrorMode, DateRule, EnumMapRule, FallbackStrategy, RegexRule, Rule (+4 more)

### Community 12 - "Community 12"
Cohesion: 0.22
Nodes (11): Config, collectAndSync(), execute(), findMapping(), findPKCols(), New(), processTable(), ProgressCallback (+3 more)

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
Cohesion: 0.2
Nodes (8): ColumnInfo, ColumnPairing, MappingProfile, ProfileMappings, SourceValueType, TableMapping, TableSchema, TableSelection

### Community 17 - "Community 17"
Cohesion: 0.31
Nodes (2): runTests(), TestRunner

### Community 18 - "Community 18"
Cohesion: 0.36
Nodes (7): apiDelete(), ApiError, apiGet(), apiPost(), apiPut(), generateCorrelationId(), request()

### Community 19 - "Community 19"
Cohesion: 0.25
Nodes (4): EditProfileDialog(), useProfiles(), useRenameProfile(), NewSessionContent()

### Community 22 - "Community 22"
Cohesion: 0.29
Nodes (6): CreateProfileRequest, MarkReadyRequest, PreviewRuleRequest, SchemaResponse, UpdatePairingsRequest, UpdatePairingsResponse

### Community 23 - "Community 23"
Cohesion: 0.29
Nodes (3): SessionErrorList(), TableBreakdown(), useSessionLogs()

### Community 25 - "Community 25"
Cohesion: 0.33
Nodes (1): mockPublisher

### Community 26 - "Community 26"
Cohesion: 0.4
Nodes (4): Getter, KeyMode, KeyProvider, ProviderFactory

### Community 27 - "Community 27"
Cohesion: 0.5
Nodes (3): isRemoteExposed(), NewSystemHandler(), SystemHandler

### Community 28 - "Community 28"
Cohesion: 0.4
Nodes (3): ConnectionListTable(), NewProfileForm(), useConnections()

### Community 29 - "Community 29"
Cohesion: 0.5
Nodes (2): findOrCreateTableMapping(), generateDefaultMapping()

### Community 32 - "Community 32"
Cohesion: 0.7
Nodes (4): goToNext(), goToPrevious(), makeCurrent(), toggleClass()

### Community 33 - "Community 33"
Cohesion: 0.5
Nodes (1): AppSettingsRepo

### Community 34 - "Community 34"
Cohesion: 0.83
Nodes (3): isPK(), modelSchemaFromMaria(), modelSchemaMapFromMaria()

### Community 35 - "Community 35"
Cohesion: 0.5
Nodes (2): SessionDetail(), useSseSession()

### Community 36 - "Community 36"
Cohesion: 0.5
Nodes (2): StatusBadge(), getStatusConfig()

### Community 37 - "Community 37"
Cohesion: 0.5
Nodes (2): RemoteExposedBanner(), useSystemInfo()

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

### Community 43 - "Community 43"
Cohesion: 0.67
Nodes (1): EditProfileContent()

### Community 45 - "Community 45"
Cohesion: 0.67
Nodes (1): SessionPageContent()

## Knowledge Gaps
- **65 isolated node(s):** `TableWithRole`, `Config`, `Result`, `ProgressCallback`, `UpsertFunc` (+60 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 17`** (9 nodes): `runTests()`, `TestRunner`, `.assert()`, `.constructor()`, `.generateMarkdown()`, `.request()`, `.saveResults()`, `.test()`, `test-settings-playbook.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (6 nodes): `mockPublisher`, `.PublishCancelled()`, `.PublishDone()`, `.PublishError()`, `.PublishProgress()`, `.PublishRowFailed()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (5 nodes): `findOrCreateTableMapping()`, `generateDefaultMapping()`, `parseMappings()`, `parseRules()`, `utils.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (4 nodes): `app_settings.go`, `NewAppSettingsRepo()`, `AppSettingsRepo`, `.Get()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (4 nodes): `SessionDetail()`, `useSseSession()`, `SessionDetail.tsx`, `useSseSession.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (4 nodes): `StatusBadge()`, `getStatusConfig()`, `StatusBadge.tsx`, `domainStatus.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (4 nodes): `RemoteExposedBanner()`, `useSystemInfo()`, `RemoteExposedBanner.tsx`, `useSystemInfo.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (3 nodes): `ErrorBody`, `ErrorEnvelope`, `errors.go`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (3 nodes): `ConnectionResponse`, `CreateConnectionRequest`, `connections_types.go`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (3 nodes): `BatchCreateRequest`, `BatchCreateResponse`, `connections_batch.go`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (3 nodes): `app.go`, `AppSettings`, `Connection`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (3 nodes): `EditProfileContent()`, `EditProfilePage()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (3 nodes): `SessionPageContent()`, `SessionsPage()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `run()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 6`, `Community 7`, `Community 8`, `Community 15`, `Community 27`?**
  _High betweenness centrality (0.117) - this node is a cross-community bridge._
- **Why does `Close()` connect `Community 1` to `Community 0`, `Community 3`, `Community 4`, `Community 5`, `Community 7`, `Community 8`, `Community 10`, `Community 12`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `handleAPI()` connect `Community 0` to `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 27`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Are the 39 inferred relationships involving `run()` (e.g. with `TestRun_SilentFailRepro()` and `TestRun_MultipleTables_OneFatal()`) actually correct?**
  _`run()` has 39 INFERRED edges - model-reasoned connections that need verification._
- **Are the 33 inferred relationships involving `Close()` (e.g. with `createConnection()` and `testProfileCreation()`) actually correct?**
  _`Close()` has 33 INFERRED edges - model-reasoned connections that need verification._
- **Are the 32 inferred relationships involving `handleAPI()` (e.g. with `.Info()` and `.List()`) actually correct?**
  _`handleAPI()` has 32 INFERRED edges - model-reasoned connections that need verification._
- **Are the 32 inferred relationships involving `WriteError()` (e.g. with `.ExportSessionLogsCSV()` and `.ListSessions()`) actually correct?**
  _`WriteError()` has 32 INFERRED edges - model-reasoned connections that need verification._