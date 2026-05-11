# Sessions Playbook

## Overview
Start happy path + Closure preview, SSE `/api/sse/{id}` live progress (T1#1), Cancel UX, Sync Log group-by-mariadb_code accordion (T1#6 paginated), CSV export 8-kolom UTF-8 BOM, retry fresh-run, single-session 409 ADR-0020, schema drift Start-time, profile snapshot badge.

## Test Setup

### Pre-conditions
```bash
cd /mnt/DATA/go/mariadb-magic
make test-e2e-up  # src:3307 dst:3308
cmp magicsync .key && echo "test-encryption-key-32-bytes-long" > .key
ENCRYPTION_KEY_PATH=.key ./magicsync &  # -> http://127.0.0.1:8080
```

### Global selectors
- **Start button**: `getByRole('button', {name: 'Start Session'})`
- **Cancel button**: `getByRole('button', {name: 'Cancel'})`
- **Session list**: `getByRole('list', {name: 'Sessions'})`
- **Progress bar**: `getByRole('progressbar')`
- **Error banner**: `getByRole('alert', {name: 'Session Error'})`

---

## S1 - Happy Path: Session Start + Monitor
**Goal**: Validate full session lifecycle

### Steps
1. `browser_navigate("/sessions/new")` → expect session form
2. Select ready profile → click "Start Session"
3. Expect SSE live updates via T1#1
4. Monitor progress until completion

### Assertions
- [ ] Session starts with 202 Accepted
- [ ] SSE `/api/sse/{id}` streams progress events
- [ ] T1#1 live progress updates in real-time
- [ ] Session list shows active session

---

## S2 - SSE Live Progress (T1#1)
**Goal**: Validate SSE event streaming

### Steps
1. Start session → capture SSE stream
2. Monitor for `data: {type: "progress", ...}` events
3. Validate events stream every 500ms
4. Assert progress values increment

### Assertions
- [ ] T1#1 SSE streams `text/event-stream` content-type
- [ ] Events include `processed`, `failed` counts
- [ ] Stream continues until `done` or `error`

---

## S3 - Cancel UX Validation
**Goal**: Validate session cancellation flow

### Steps
1. Start session → navigate to session detail
2. Click "Cancel" button during sync
3. Expect 409 ADR-0020 single-session lock
4. Assert cancellation confirmed

### Assertions
- [ ] Cancel button triggers `POST /api/sessions/{id}/cancel`
- [ ] ADR-0020 prevents concurrent sessions
- [ ] Cancellation confirmed with user prompt
- [ ] Session state transitions to `cancelled`

---

## S4 - Sync Log Grouping (T1#6)
**Goal**: Validate log grouping by MariaDB error codes

### Steps
1. Start session with known failures
2. Navigate to session logs
3. Expect group-by-mariadb_code accordion
4. Validate T1#6 paginated log display

### Assertions
- [ ] T1#6 accordion groups logs by error code
- [ ] Pagination handles >50 log entries
- [ ] Log groups expandable/collapsible
- [ ] 8-kolom UTF-8 BOM CSV export works

---

## S5 - Schema Drift Detection
**Goal**: Validate drift detection at start-time

### Steps
1. Create profile with table schema A
2. Modify DB schema → create drift
3. Attempt session start → expect drift warning
4. Validate Start-time schema check

### Assertions
- [ ] Schema drift detected at session start
- [ ] Profile snapshot badge shows drift status
- [ ] Start-time validation prevents stale sync

---

## S6 - CSV Export (8-kolom UTF-8 BOM)
**Goal**: Validate log export functionality

### Steps
1. Start session → generate sync logs
2. Navigate to session logs
3. Click "Export CSV" button
4. Validate CSV format and encoding

### Assertions
- [ ] `logs.csv` endpoint returns valid CSV
- [ ] UTF-8 BOM encoding present
- [ ] 8 columns: timestamp, table, column, value, code, message, etc.
- [ ] Export includes all session logs

---

## S7 - Single-Session Lock (ADR-0020)
**Goal**: Validate session concurrency protection

### Steps
1. Start session A → running
2. Attempt to start session B → expect 409
3. Validate ADR-0020 single-session enforcement

### Assertions
- [ ] ADR-0020 prevents concurrent sessions
- [ ] 409 Conflict returned for duplicate
- [ ] User notified of active session

---

## S8 - Retry Fresh-Run
**Goal**: Validate session retry mechanism

### Steps
1. Start session → fail mid-sync
2. Click "Retry" or restart session
3. Validate fresh-run behavior

### Assertions
- [ ] Retry triggers new session start
- [ ] Fresh-run clears previous state
- [ ] User confirms retry action

---

## Error Boundaries
### Adversarial tests
- Invalid profile ID → expect 404
- Network disconnect during session → expect reconnect
- Large log volume → expect pagination
- Unicode in log messages → expect UTF-8 handling
- Console errors → validate none in golden path
- Accessibility scan → axe-core pass (Q50)