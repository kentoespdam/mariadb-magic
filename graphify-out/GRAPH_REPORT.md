# Graph Report - .  (2026-05-16)

## Corpus Check
- Incremental update - AST only

## Summary
- 674 nodes · 1082 edges · 27 communities detected
- Extraction: 61% EXTRACTED · 39% INFERRED · 0% AMBIGUOUS · INFERRED: 424 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]

## God Nodes (most connected - your core abstractions)
1. `run()` - 40 edges
2. `WriteError()` - 38 edges
3. `handleAPI()` - 30 edges
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
- `NewPassphraseKeyProvider()` --calls--> `run()`  [INFERRED]
  internal/crypto/passphrase.go → cmd/magicsync/main.go
- `ToFriendlyCollision()` --calls--> `TestToFriendlyCollisionSingle()`  [INFERRED]
  internal/repo/mapping_profiles.go → tests/repo/mapping_profiles_collision_test.go
- `ToFriendlyCollision()` --calls--> `TestToFriendlyCollisionEmpty()`  [INFERRED]
  internal/repo/mapping_profiles.go → tests/repo/mapping_profiles_collision_test.go

## Communities

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (29): BatchCreateRequest, BatchCreateResponse, ConnectionHandler, ConnectionResponse, getID(), toConnectionResponse(), CreateConnectionRequest, stubKey (+21 more)

### Community 1 - "Community 1"
Cohesion: 0.12
Nodes (12): ErrorBody, ErrorEnvelope, WriteError(), MaintHandler, getProfileID(), ProfilesHandler, getSessionID(), SessionsHandler (+4 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (33): NewConnectionHandler(), newTestDB(), TestHandleCreate(), TestHandlePostMethodOnIDRoute(), TestHandleRoutesTestPostSave(), TestHandleRoutesTestPreSave(), NewMaintHandler(), NewOnboardingHandler() (+25 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (18): SSERunner, Column, ForeignKey, NewIntrospector(), Introspector, Schema, TableSchema, checkDestDrift() (+10 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (9): Retention, scanConnectionRows(), stringPtr(), Connection, ConnectionsRepo, SyncSessionsRepo, connectMariaDB(), Runner (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (28): translateCast(), translateDate(), translateEnumMap(), fmtValue(), PreviewResult, translateRegex(), translateString(), ToFriendly() (+20 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (18): Config, getEnvOrDefault(), Load(), TestLoad_DefaultValues(), TestLoad_EnvOverride(), TestLoad_InvalidAppEnv(), TestLoad_InvalidLogLevel(), TestLoad_LoopbackAlways_Passes() (+10 more)

### Community 7 - "Community 7"
Cohesion: 0.13
Nodes (13): PassphraseProvider, Bootstrapper, cleanupZombieSessions(), EnsureDB(), HasDB(), Heal(), quarantineAndRebuild(), extractVersion() (+5 more)

### Community 8 - "Community 8"
Cohesion: 0.12
Nodes (9): Handler(), Broker, NewBroker(), Event, EventData, NewEvent(), EventType, Handler (+1 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (13): Conflict, TestToFriendlyCollisionEmpty(), TestToFriendlyCollisionMultiple(), TestToFriendlyCollisionSingle(), conflictStr(), scanMappingProfileRows(), strPtr(), TestValidateProfileForReady() (+5 more)

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
Cohesion: 0.26
Nodes (4): TestClosureAdvisorExpand(), TestClosureAdvisorTopologicalSort(), ClosureAdvisor, TableWithRole

### Community 14 - "Community 14"
Cohesion: 0.24
Nodes (9): ErrorCategory, ToFriendly(), FriendlyError, extractColumn(), extractFK(), extractUniqueKey(), extractValue(), isEmoji() (+1 more)

### Community 15 - "Community 15"
Cohesion: 0.24
Nodes (10): CreateProfileRequest, MarkReadyRequest, PreviewRuleRequest, isPK(), modelSchemaFromMaria(), modelSchemaMapFromMaria(), toModelTableSchemaMap(), SchemaResponse (+2 more)

### Community 16 - "Community 16"
Cohesion: 0.31
Nodes (2): runTests(), TestRunner

### Community 17 - "Community 17"
Cohesion: 0.31
Nodes (2): runTests(), TestRunner

### Community 18 - "Community 18"
Cohesion: 0.22
Nodes (8): ColumnInfo, ColumnPairing, MappingProfile, ProfileMappings, SourceValueType, TableMapping, TableSchema, TableSelection

### Community 19 - "Community 19"
Cohesion: 0.36
Nodes (7): apiDelete(), ApiError, apiGet(), apiPost(), apiPut(), generateCorrelationId(), request()

### Community 21 - "Community 21"
Cohesion: 0.25
Nodes (1): FormField()

### Community 23 - "Community 23"
Cohesion: 0.4
Nodes (4): Getter, KeyMode, KeyProvider, ProviderFactory

### Community 27 - "Community 27"
Cohesion: 0.5
Nodes (1): AppSettingsRepo

### Community 29 - "Community 29"
Cohesion: 0.5
Nodes (2): RemoteExposedBanner(), useSystemInfo()

### Community 32 - "Community 32"
Cohesion: 0.67
Nodes (2): AppSettings, Connection

### Community 33 - "Community 33"
Cohesion: 0.67
Nodes (1): RootLayout()

### Community 34 - "Community 34"
Cohesion: 0.67
Nodes (1): cn()

## Knowledge Gaps
- **64 isolated node(s):** `TableWithRole`, `Config`, `Result`, `UpsertFunc`, `ErrorCategory` (+59 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 16`** (9 nodes): `runTests()`, `TestRunner`, `.assert()`, `.constructor()`, `.generateMarkdown()`, `.request()`, `.saveResults()`, `.test()`, `test-settings-playbook.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (9 nodes): `runTests()`, `TestRunner`, `.assert()`, `.constructor()`, `.generateMarkdown()`, `.request()`, `.saveResults()`, `.test()`, `test-profiles-playbook.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (8 nodes): `Form()`, `FormControl()`, `FormField()`, `FormFieldProvider()`, `FormItem()`, `FormLabel()`, `FormMessage()`, `form.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (4 nodes): `app_settings.go`, `NewAppSettingsRepo()`, `AppSettingsRepo`, `.Get()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (4 nodes): `RemoteExposedBanner()`, `useSystemInfo()`, `RemoteExposedBanner.tsx`, `useSystemInfo.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (3 nodes): `app.go`, `AppSettings`, `Connection`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (3 nodes): `RootLayout()`, `layout.tsx`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (3 nodes): `cn()`, `utils.ts`, `utils.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.