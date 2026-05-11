# Connections Playbook

## Overview
Test+Save split workflow with pre-save handshake validation and post-save test. Critical path for all other features (profiles, sessions) - failure here blocks entire app.

## Test Setup

### Pre-conditions
```bash
cd /mnt/DATA/go/mariadb-magic
make test-e2e-up  # src:3307 dst:3308
cmp magicsync .key && echo "test-encryption-key-32-bytes-long" > .key
ENCRYPTION_KEY_PATH=.key ./magicsync &
```

### Global selectors
- **Test button**: `getByRole('button', {name: 'Test Connection'})`
- **Save button**: `getByRole('button', {name: 'Save Connection'})`
- **Form fields**: `getByRole('textbox', {name: /Name|Host|Username|Password/i})`
- **Port field**: `getByRole('spinbutton', {name: 'Port'})`
- **Error banner**: `getByRole('alert', {name: 'Error'})`
- **Success toast**: `getByRole('status', {name: 'Success'})`
- **Connection list**: `getByRole('list', {name: 'Connections'})`

---

## S1 - Happy Path: Create + Test Source Connection
**Goal**: Validate full create workflow for source DB

### Steps
1. `browser_navigate("/connections")` → expect connection list visible
2. Click "Add Connection" → expect form panel
3. Fill: name=`test-src`, host=`localhost`, port=`3307`, user=`testuser`, password=`testpass`
4. Click "Test Connection" → expect success
5. Click "Save Connection" → expect redirect to list
6. Assert connection appears in list

### Assertions
- Form fields accept input without error
- Test button triggers `/api/connections/test` POST
- Save triggers `/api/connections/` POST → 201
- Connection visible in list with correct name/host/port

---

## S2 - Happy Path: Create Destination Connection
**Goal**: Validate destination connection creation

### Steps
1. `browser_navigate("/connections")`
2. Click "Add Connection"
3. Fill: name=`test-dst`, host=`localhost`, port=`3308`, user=`testuser`, password=`testpass`
4. Test → Save → Verify in list

### Assertions
- Both connections persist independently
- List shows 2 connections total

---

## S3 - Handshake Fail: ECONNREFUSED (2002/2003)
**Goal**: Validate connection refused errors are user-friendly

### Steps
1. `browser_navigate("/connections")` → click "Add Connection"
2. Fill: name=`bad-host`, host=`localhost`, port=`9999`, user=`testuser`, password=`testpass`
3. Click "Test Connection"
4. Wait for response → capture error message

### Assertions
- [ ] Error message: "Connection failed: connect ECONNREFUSED 127.0.0.1:9999"
- [ ] Error shown in alert role (not just text)
- [ ] Form remains editable, no page crash
- [ ] Correlation ID present in error detail (Q52)

---

## S4 - Handshake Fail: Access Denied (1045)
**Goal**: Validate authentication failure shows friendly message

### Steps
1. `browser_navigate("/connections")` → "Add Connection"
2. Fill: name=`bad-auth`, host=`localhost`, port=`3307`, user=`testuser`, password=`wrongpass`
3. Click "Test Connection"
4. Capture error

### Assertions
- [ ] Error includes MariaDB code 1045
- [ ] Friendly message: "Access denied for user 'testuser'@'localhost'"
- [ ] No password visible in logs/error surface

---

## S5 - Handshake Fail: Unknown Database (1049)
**Goal**: Validate bad database name error

### Steps
1. `browser_navigate("/connections")` → "Add Connection"
2. Fill: name=`bad-db`, host=`localhost`, port=`3307`, user=`testuser`, password=`testpass`, database=`nonexistent`
3. Click "Test Connection"
4. Capture error

### Assertions
- [ ] Error includes MariaDB code 1049
- [ ] Message: "Unknown database 'nonexistent'"

---

## S6 - T1#3: Skip-Password on Edit
**Goal**: Edit preserves existing password when password field left blank

### Fixtures
```bash
curl -X POST http://localhost:8080/api/connections/ \
  -H "Content-Type: application/json" \
  -d '{"name":"existing","host":"localhost","port":3307,"user":"testuser","password":"testpass"}'
```

### Steps
1. `browser_navigate("/connections")` → click connection "existing"
2. Edit form: change name to "existing-renamed"
3. Clear password field → leave blank
4. Click "Save Connection"
5. Assert name changed, password unchanged (no re-test required)

### Assertions
- [ ] Password field optional on edit (T1#3)
- [ ] Saving without password does NOT trigger test
- [ ] Existing password preserved in DB

---

## S7 - T1#5: Delete Cascade
**Goal**: Validate delete with/without cascade flag

### Fixtures
```bash
# Create connection + profile
curl -X POST http://localhost:8080/api/connections/ \
  -H "Content-Type: application/json" \
  -d '{"name":"cascade-test","host":"localhost","port":3307,"user":"testuser","password":"testpass"}'
```

### Steps
1. Create profile referencing `cascade-test` connection
2. `browser_navigate("/connections")` → click "cascade-test"
3. Click "Delete" → expect 409 Conflict
4. Confirm deletion with cascade → expect success

### Assertions
- [ ] Delete blocked when profiles reference connection (T1#5)
- [ ] Error shows `active_sessions` or `profiles` in response
- [ ] Cascade=true successfully deletes connection + profiles

---

## S8 - Q49: Form Validation
**Goal**: Validate Zod schema constraints

### Steps
1. `browser_navigate("/connections")` → "Add Connection"
2. Submit empty form → expect validation errors
3. Fill name only → expect remaining field errors
4. Enter port=`0` → expect port validation error
5. Enter port=`70000` → expect port validation error
6. Enter name > 100 chars → expect max length error

### Assertions
- [ ] Name required (min 1)
- [ ] Host required (min 1, max 255)
- [ ] Port 1-65535 (Q49)
- [ ] Username required (max 100)
- [ ] Password max 500 chars

---

## S9 - LoadingBoundary States
**Goal**: Validate loading states during test/save operations

### Steps
1. `browser_navigate("/connections")` → "Add Connection"
2. Fill valid credentials → click "Test Connection"
3. Expect loading state: `getByRole('progressbar')` or button disabled
4. Wait for response → loading clears
5. Click "Save" → expect loading state during save

### Assertions
- [ ] LoadingBoundary shown during async operations
- [ ] No duplicate submissions (button disabled while loading)
- [ ] Timeout handling for slow connections

---

## Error Boundaries
### Adversarial tests
- Network timeout: close src:3307 container during test → expect timeout error
- Rapid test clicks: spam test button → expect debounce/throttle
- Large name: paste 10KB string into name field → expect max length enforcement
- Unicode in fields: inject SQL chars → expect sanitized error, not injection
- Concurrent saves: save same connection twice → expect idempotent or conflict error