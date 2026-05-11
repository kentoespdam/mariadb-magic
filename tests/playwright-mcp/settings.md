# Settings / Health Playbook

## Overview
Credential wizard lazy-prompt, passphrase rate limit, re-key flow, retention counters + CSV bulk export, version, Q59 remote banner, timezone advisory, theme persistence, axe-core Q50 scan.

## Test Setup

### Pre-conditions
```bash
cd /mnt/DATA/go/mariadb-magic
make test-e2e-up  # src:3307 dst:3308
cmp magicsync .key && echo "test-encryption-key-32-bytes-long" > .key
ENCRYPTION_KEY_PATH=.key ./magicsync &  # -> http://127.0.0.1:8080
```

### Global selectors
- **Settings page**: `getByRole('main', {name: 'Settings'})`
- **Credential wizard**: `getByRole('dialog', {name: 'Credential Setup'})`
- **Theme toggle**: `getByRole('button', {name: 'Toggle theme'})`
- **Version display**: `getByRole('text', {name: /Version/i})`
- **Remote banner**: `getByRole('alert', {name: 'Remote Access'})`

---

## S1 - Credential Wizard Lazy-Prompt
**Goal**: Validate wizard only appears on first credential touch

### Steps
1. `browser_navigate("/settings")` → expect no wizard
2. Click "Add Credential" → expect wizard dialog
3. Complete wizard → dismiss
4. Reload page → expect no wizard (already configured)

### Assertions
- [ ] Wizard lazy-loads on first credential action
- [ ] Wizard does not appear on subsequent visits
- [ ] Wizard dismissible without completing

---

## S2 - Passphrase Rate Limit
**Goal**: Validate 3-attempt lockout on passphrase entry

### Steps
1. `browser_navigate("/settings")` → credential section
2. Enter wrong passphrase → attempt 1
3. Enter wrong passphrase → attempt 2
4. Enter wrong passphrase → attempt 3
5. Expect lockout message after 3 failures

### Assertions
- [ ] Rate limit enforces 3-attempt max
- [ ] Lockout message shown after 3 failures
- [ ] Lockout duration enforced (e.g., 5 minutes)

---

## S3 - Re-Key Flow
**Goal**: Validate credential re-keying process

### Steps
1. `browser_navigate("/settings")` → credential section
2. Click "Re-Key Credentials" → expect confirmation dialog
3. Confirm re-key → expect success message
4. Validate existing credentials still work

### Assertions
- [ ] Re-key flow prompts for confirmation
- [ ] Re-key completes without data loss
- [ ] Existing credentials remain valid

---

## S4 - Retention Counters + CSV Bulk Export
**Goal**: Validate retention display and bulk export

### Steps
1. `browser_navigate("/settings")` → retention section
2. Expect counters: sessions count, logs count
3. Click "Export All Logs" → expect CSV download
4. Validate CSV format (UTF-8 BOM, 8 columns)

### Assertions
- [ ] Retention counters show accurate counts
- [ ] CSV bulk export generates valid file
- [ ] CSV includes all sessions/logs
- [ ] UTF-8 BOM encoding present

---

## S5 - Version Display
**Goal**: Validate version info from `/api/system/info`

### Steps
1. `browser_navigate("/settings")` → system info section
2. Expect version display: `getByRole('text', {name: /Version/i})`
3. Validate version matches binary build

### Assertions
- [ ] Version displayed correctly
- [ ] Version matches binary metadata
- [ ] Build date/commit hash shown (if available)

---

## S6 - Q59: Remote Banner
**Goal**: Validate remote access banner visibility

### Steps
1. Start binary with `MAGIC_ALLOW_REMOTE=true`
2. `browser_navigate("/settings")` → expect remote banner
3. Validate Q59 banner shows warning

### Assertions
- [ ] Q59 remote banner visible when enabled
- [ ] Banner shows security warning
- [ ] Banner dismissible but persists on reload

---

## S7 - Timezone Advisory
**Goal**: Validate timezone display and advisory

### Steps
1. `browser_navigate("/settings")` → system info section
2. Expect timezone advisory: `getByRole('text', {name: /Timezone/i})`
3. Validate timezone matches system

### Assertions
- [ ] Timezone advisory displayed
- [ ] Timezone matches server/client
- [ ] Advisory warns if mismatch detected

---

## S8 - Theme Persistence
**Goal**: Validate theme preference persists across sessions

### Steps
1. `browser_navigate("/settings")` → theme section
2. Toggle theme to dark → reload page
3. Expect dark theme persists
4. Toggle to light → reload → expect light theme

### Assertions
- [ ] Theme preference saved to localStorage
- [ ] Theme persists across page reloads
- [ ] Theme applies immediately on toggle

---

## S9 - Axe-Core Q50 Scan
**Goal**: Validate accessibility compliance

### Steps
1. `browser_navigate("/settings")`
2. Run axe-core scan via `browser_evaluate`
3. Capture violations → expect zero critical

### Assertions
- [ ] Q50 axe-core scan passes
- [ ] Zero critical violations
- [ ] Zero serious violations (target)
- [ ] Report attached to test results

---

## Error Boundaries
### Adversarial tests
- Invalid passphrase → expect rate limit enforcement
- Network drop during re-key → expect rollback
- Large CSV export (10k+ logs) → expect streaming/chunking
- Timezone mismatch → expect advisory warning
- Console errors → validate none in golden path