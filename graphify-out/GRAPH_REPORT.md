# Graph Report - mariadb-magic  (2026-05-19)

## Corpus Check
- 194 files · ~169,955 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 755 nodes · 1232 edges · 37 communities detected
- Extraction: 56% EXTRACTED · 44% INFERRED · 0% AMBIGUOUS · INFERRED: 545 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 24|Community 24]]
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
- [[_COMMUNITY_Community 42|Community 42]]

## God Nodes (most connected - your core abstractions)
1. `run()` - 44 edges
2. `Close()` - 34 edges
3. `handleAPI()` - 34 edges
4. `WriteError()` - 33 edges
5. `ProfilesHandler` - 21 edges
6. `New()` - 15 edges
7. `runProfilesPlaybook()` - 13 edges
8. `SyncSessionsRepo` - 13 edges
9. `TranslateToFunc()` - 13 edges
10. `TestRun_SilentFailRepro()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `NewBroker()` --calls--> `run()`  [INFERRED]
  internal/sse/broker.go → cmd/magicsync/main.go
- `NewHandler()` --calls--> `run()`  [INFERRED]
  internal/sse/handler.go → cmd/magicsync/main.go
- `createConnection()` --calls--> `Close()`  [INFERRED]
  full-test-profiles.go → internal/mariadb/pool.go
- `testProfileCreation()` --calls--> `Close()`  [INFERRED]
  full-test-profiles.go → internal/mariadb/pool.go
- `TestRun_SilentFailRepro()` --calls--> `run()`  [INFERRED]
  internal/sync/runner/runner_test.go → cmd/magicsync/main.go

## Communities

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (27): ConnectionHandler, getID(), toConnectionResponse(), WriteError(), MaintHandler, TestDeleteProfileSafetyChecks(), getProfileID(), ProfilesHandler (+19 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (27): NewBootstrapper(), Bootstrapper, cleanupZombieSessions(), EnsureDB(), HasDB(), Heal(), quarantineAndRebuild(), extractVersion() (+19 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (39): NewMaintHandler(), isRemoteExposed(), NewSystemHandler(), SystemHandler, runCommand(), toFriendly(), binaryDir(), main() (+31 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (21): Column, ForeignKey, NewIntrospector(), Schema, TableSchema, Handler(), connectMariaDB(), getDestSchema() (+13 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (10): detectWSL(), OpenURL(), Retention, NewRetention(), Stats, scanConnectionRows(), stringPtr(), Connection (+2 more)

### Community 5 - "Community 5"
Cohesion: 0.1
Nodes (13): Conflict, TestToFriendlyCollisionEmpty(), TestToFriendlyCollisionMultiple(), TestToFriendlyCollisionSingle(), conflictStr(), scanMappingProfileRows(), strPtr(), TestValidateProfileForReady() (+5 more)

### Community 6 - "Community 6"
Cohesion: 0.17
Nodes (12): a(), B(), D(), g(), i(), k(), o(), Q() (+4 more)

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (9): stubKey, KeystoreProvider, Params, NewPassphraseKeyProvider(), NewPassphraseProvider(), TestPassphraseEncryptDecrypt(), TestPassphraseRekey(), TestPassphraseWrongKey() (+1 more)

### Community 8 - "Community 8"
Cohesion: 0.15
Nodes (15): NewConnectionHandler(), newTestDB(), TestHandleCreate(), TestHandlePostMethodOnIDRoute(), TestHandleRoutesTestPostSave(), TestHandleRoutesTestPreSave(), NewOnboardingHandler(), OnboardingHandler (+7 more)

### Community 9 - "Community 9"
Cohesion: 0.16
Nodes (13): Config, execChunk(), collectAndSync(), execute(), findMapping(), findPKCols(), New(), processTable() (+5 more)

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
Cohesion: 0.28
Nodes (3): openBrowser(), Instance, OpenURL()

### Community 20 - "Community 20"
Cohesion: 0.36
Nodes (7): apiDelete(), ApiError, apiGet(), apiPost(), apiPut(), generateCorrelationId(), request()

### Community 21 - "Community 21"
Cohesion: 0.25
Nodes (4): EditProfileDialog(), useProfiles(), useRenameProfile(), NewSessionContent()

### Community 24 - "Community 24"
Cohesion: 0.29
Nodes (6): CreateProfileRequest, MarkReadyRequest, PreviewRuleRequest, SchemaResponse, UpdatePairingsRequest, UpdatePairingsResponse

### Community 26 - "Community 26"
Cohesion: 0.33
Nodes (2): TestDecryptStoredCredential(), mockKeyProvider

### Community 27 - "Community 27"
Cohesion: 0.33
Nodes (2): useSseSession(), SessionDetailContent()

### Community 28 - "Community 28"
Cohesion: 0.4
Nodes (4): Getter, KeyMode, KeyProvider, ProviderFactory

### Community 29 - "Community 29"
Cohesion: 0.4
Nodes (3): ConnectionListTable(), NewProfileForm(), useConnections()

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
Nodes (2): RemoteExposedBanner(), useSystemInfo()

### Community 36 - "Community 36"
Cohesion: 0.5
Nodes (2): StatusBadge(), getStatusConfig()

### Community 37 - "Community 37"
Cohesion: 0.67
Nodes (2): ErrorBody, ErrorEnvelope

### Community 38 - "Community 38"
Cohesion: 0.67
Nodes (2): ConnectionResponse, CreateConnectionRequest

### Community 39 - "Community 39"
Cohesion: 0.67
Nodes (2): BatchCreateRequest, BatchCreateResponse

### Community 40 - "Community 40"
Cohesion: 0.67
Nodes (2): AppSettings, Connection

### Community 42 - "Community 42"
Cohesion: 0.67
Nodes (1): EditProfileContent()

## Knowledge Gaps
- **64 isolated node(s):** `TableWithRole`, `Config`, `Result`, `UpsertFunc`, `ProgressPublisher` (+59 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 18`** (9 nodes): `runTests()`, `TestRunner`, `.assert()`, `.constructor()`, `.generateMarkdown()`, `.request()`, `.saveResults()`, `.test()`, `test-settings-playbook.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (6 nodes): `TestDecryptStoredCredential()`, `mockKeyProvider`, `.Decrypt()`, `.Encrypt()`, `.Rekey()`, `decrypt_test.go`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (6 nodes): `useSseSession()`, `SessionDetailContent()`, `StatusIconSmall()`, `TableBreakdown()`, `page.tsx`, `useSseSession.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (4 nodes): `app_settings.go`, `NewAppSettingsRepo()`, `AppSettingsRepo`, `.Get()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (4 nodes): `RemoteExposedBanner()`, `useSystemInfo()`, `RemoteExposedBanner.tsx`, `useSystemInfo.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (4 nodes): `StatusBadge()`, `getStatusConfig()`, `StatusBadge.tsx`, `domainStatus.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (3 nodes): `ErrorBody`, `ErrorEnvelope`, `errors.go`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (3 nodes): `ConnectionResponse`, `CreateConnectionRequest`, `connections_types.go`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (3 nodes): `BatchCreateRequest`, `BatchCreateResponse`, `connections_batch.go`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (3 nodes): `app.go`, `AppSettings`, `Connection`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (3 nodes): `EditProfileContent()`, `EditProfilePage()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `run()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 7`, `Community 8`, `Community 12`, `Community 15`, `Community 26`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **Why does `Close()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 8`, `Community 9`, `Community 10`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Why does `handleAPI()` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 4`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Are the 39 inferred relationships involving `run()` (e.g. with `TestRun_SilentFailRepro()` and `TestRun_MultipleTables_OneFatal()`) actually correct?**
  _`run()` has 39 INFERRED edges - model-reasoned connections that need verification._
- **Are the 33 inferred relationships involving `Close()` (e.g. with `createConnection()` and `testProfileCreation()`) actually correct?**
  _`Close()` has 33 INFERRED edges - model-reasoned connections that need verification._
- **Are the 32 inferred relationships involving `handleAPI()` (e.g. with `.Info()` and `.List()`) actually correct?**
  _`handleAPI()` has 32 INFERRED edges - model-reasoned connections that need verification._
- **Are the 32 inferred relationships involving `WriteError()` (e.g. with `.ExportSessionLogsCSV()` and `.ListSessions()`) actually correct?**
  _`WriteError()` has 32 INFERRED edges - model-reasoned connections that need verification._