# Profile Builder Playbook

## Overview
Two-pane profile builder with Q40 keyboard nav, Mapping Builder `<Tabs>` + grouped `<Select>`, structural validation (PK/NOT NULL/DEFAULT), Rule dialog + live preview debounce 300ms, MarkReady Q29 + DriftReport T1#2, T1#7 auto-downgrade, cross-profile collision, Q55 optimistic rename, Q56 prefetch off, no drag-drop.

## Test Setup

### Pre-conditions
```bash
cd /mnt/DATA/go/mariadb-magic
make test-e2e-up  # src:3307 dst:3308
cmp magicsync .key && echo "test-encryption-key-32-bytes-long" > .key
ENCRYPTION_KEY_PATH=.key ./magicsync &  # -> http://127.0.0.1:8080
```

### Global selectors
- **Profile form**: `getByRole('form', {name: 'Profile Builder'})`
- **Table selector**: `getByRole('combobox', {name: 'Select Tables'})`
- **Mapping tab**: `getByRole('tab', {name: 'Mapping'})`
- **Rules tab**: `getByRole('tab', {name: 'Rules'})`
- **Mark Ready button**: `getByRole('button', {name: 'Mark Ready'})`
- **Validation error**: `getByRole('alert', {name: 'Validation Error'})`

---

## S1 - Happy Path: New Profile Creation
**Goal**: Validate profile creation workflow

### Steps
1. `browser_navigate("/profiles/new")` → expect profile form
2. Fill: name=`test-profile`, source=`test-src`, dest=`test-dst`
3. Select tables from schema picker
4. Click "Save Profile" → expect success

### Assertions
- [ ] Form accepts connection selection
- [ ] Table list populates from DB schema
- [ ] Save creates profile record with draft status

---

## S2 - Q40: Two-Pane Keyboard Navigation
**Goal**: Validate keyboard navigation between panes

### Steps
1. `browser_navigate("/profiles/new")`
2. Focus first input → `browser_press_key("Tab")` through form
3. Navigate with Tab/Shift+Tab
4. Assert focus moves predictably

### Assertions
- [ ] Tab moves focus through form elements in order
- [ ] Shift+Tab moves focus backward
- [ ] No focus trapped in hidden elements

---

## S3 - Mapping Builder Tabs + Column Pairing
**Goal**: Validate tabbed interface and column mapping

### Steps
1. `browser_navigate("/profiles/new")` → create profile
2. Click "Mapping" tab → expect schema picker
3. Select source table → expect dest table options
4. Map columns: source.id → dest.id
5. Validate PK constraint enforced

### Assertions
- [ ] Tab switching works without reload
- [ ] Active tab highlighted
- [ ] Column pairing shows source/dest side-by-side
- [ ] PK fields required for mapping

---

## S4 - Structural Validation: PK/NOT NULL/DEFAULT
**Goal**: Validate form validation for schema constraints

### Steps
1. `browser_navigate("/profiles/new")` → create profile
2. Try to MarkReady without mapping PK
3. Assert validation error shown

### Assertions
- [ ] PK fields required for sync
- [ ] NOT NULL constraints enforced
- [ ] DEFAULT value handling validated
- [ ] Error messages shown per field

---

## S5 - Rule Dialog + Live Preview (300ms debounce)
**Goal**: Validate rule creation with live preview

### Steps
1. `browser_navigate("/profiles/{id}")` → existing profile
2. Click "Rules" tab → open rule dialog
3. Create rule → expect live preview update after 300ms
4. Save rule → expect persistence

### Assertions
- [ ] Rule dialog opens with valid fields
- [ ] Live preview updates on rule change (debounced 300ms)
- [ ] Saved rules persist and apply

---

## S6 - MarkReady Q29 + DriftReport T1#2
**Goal**: Validate profile readiness with drift detection

### Steps
1. Create profile with valid connections
2. Map all required fields
3. Click "Mark Ready" → expect DriftReport T1#2
4. If drift found → expect conflict resolution

### Assertions
- [ ] DriftReport T1#2 shows schema differences
- [ ] MarkReady Q29 validates completeness
- [ ] Conflicts show specific table/column mismatches

---

## S7 - T1#7: Auto-Downgrade on Schema Change
**Goal**: Validate profile downgrade on schema drift

### Steps
1. Create ready profile
2. Change DB schema (add column to table)
3. Load profile → expect auto-downgrade to draft
4. Validate T1#7 downgrade trigger

### Assertions
- [ ] Schema change triggers T1#7 downgrade
- [ ] Profile status changes to draft automatically
- [ ] User notified of downgrade reason

---

## S8 - Cross-Profile Collision Detection
**Goal**: Validate collision detection between profiles

### Steps
1. Create profile A with table `customers`
2. Create profile B with same table `customers`
3. Try to MarkReady both → expect collision error

### Assertions
- [ ] Collision detected on same-table profiles
- [ ] Error prevents conflicting profile activation
- [ ] User shown conflicting profile details

---

## S9 - Q55: Optimistic Rename
**Goal**: Validate optimistic UI updates

### Steps
1. `browser_navigate("/profiles")` → load profile list
2. Rename profile in UI → expect immediate name change
3. Navigate away → return to see if name persisted

### Assertions
- [ ] Q55 rename shows immediate UI update
- [ ] Optimistic update persists on refresh
- [ ] No flicker or state mismatch

---

## S10 - Q56: Prefetch Off
**Goal**: Validate prefetch disabled behavior

### Steps
1. `browser_navigate("/profiles")` → load list
2. Disable prefetch via Q56 flag
3. Navigate profiles → expect no auto-fetch
4. Manual refresh required

### Assertions
- [ ] Q56 prefetch flag disables auto-load
- [ ] Manual refresh still works
- [ ] No background fetches when Q56=off

---

## Error Boundaries
### Adversarial tests
- Empty form submission → expect validation per field
- Invalid connection IDs → expect specific error codes
- Large profile name (255+ chars) → expect truncation/validation
- Concurrent MarkReady calls → expect locking/idempotency
- Network drop during save → expect retry/cancel handling
- SQL injection in form fields → expect sanitization