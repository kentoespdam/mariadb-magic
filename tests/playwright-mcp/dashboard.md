# Dashboard Playbook

## Overview
Complex onboarding state machine spanning 3 states (fresh: 3 cards → mid: 2 cards → active: 0 cards). Test happy path transitions and adversarial viewport/mobile gates.

## Test Setup

### Pre-conditions
```bash
cd /mnt/DATA/go/mariadb-magic
make test-e2e-up  # src:3307 dst:3308
cmp magicsync .key && echo "test-encryption-key-32-bytes-long" > .key
ENCRYPTION_KEY_PATH=.key ./magicsync &  # -> http://127.0.0.1:8080
```

### Global selectors
- **CTA button**: `getByRole('button', {name: 'Begin Setup'})`
- **Theme toggle**: `getByRole('button', {name: 'Toggle theme'})`
- **Command palette toggle**: `getByRole('button', {name: 'Open command menu'})`
- **Remote banner**: `getByRole('alert', {name: 'Remote access banner'})`

---

## S1 - Fresh State (0 connections)
**Goal**: Validate 3-card onboarding display and accessibility

### Fixtures
```bash
rm -f metadb.sqlite*  # ensure fresh DB
```

### Steps
1. `browser_navigate("/")` → expect 3 cards visible
2. `browser_snapshot()` → find card1: `getByRole('heading', {name: 'Connections'})`
3. Hover card1 → expect tooltip: `getByRole('tooltip', {name: 'Configure database connections'})`
4. `browser_click(ref=cta-connections)` → expect navigation to `/connections`
5. Back → `browser_navigate("/"))`
6. Assert 3 cards still present (no state change)

### Assertions
- `[ref=dashboard-cards]` count = 3
- cards[0] role = 'article' name = 'Connections'
- cards[1] role = 'article' name = 'Profiles'  
- cards[2] role = 'article' name = 'E2E Testing'
- no `[ref=session-list]` present

---

## S2 - Mid State (1 connection)
**Goal**: Unlocks profiles card after connection seed

### Steps
1. Create one connection via API (or manual):
   ```bash
   curl -X POST http://localhost:8080/api/connections \
     -H "Content-Type: application/json" \
     -d '{"name":"test","type":"mysql","host":"127.0.0.1","port":3307,"database":"magicsync","user":"testuser","password":"testpass"}'
   ```
2. `browser_navigate("/")` reload → expect 2 cards remaining
3. Find card2 unlocked: `getByRole('article', {name: 'Profiles'})` with `aria-disabled=false`
4. `browser_click(ref=cta-profiles)` → expect navigation to `/profiles`
5. Back → assert 2 cards still present

### Assertions
- `[ref=dashboard-cards]` count = 2
- profiles card no longer disabled
- `[ref=connections-cta]` no longer present

---

## S3 - Active State (profile + session)
**Goal**: Cards vanish when session active, show session list

### Steps
1. Via API: Create connection + profile + launch session
2. `browser_navigate("/")` → expect no onboarding cards
3. Find session list: `getByRole('table', {name: 'Active sessions'})`
4. Assert session row: `getByRole('row', {name: /test session.*/})`
5. Navigate to session via row click

### Assertions
- `[ref=dashboard-cards]` missing
- `[ref=session-list]` visible
- session row contains correct connection name

---

## S4 - Cross-cutting Features
**Goal**: Theme, cmdk, responsive, remote banner

### Steps
1. **Theme toggle**:
   - `browser_click(ref=theme-toggle)` → expect `data-theme="dark"`
   - Refresh → still dark
   - Toggle back → `data-theme="light"`

2. **Command palette**:
   - `browser_press_key("body", "Control+K")` → expect `getByRole('dialog', {name: 'Command menu'})`
   - Type "connections" → expect suggestion link to `/connections`
   - Press Escape → dialog hidden

3. **Viewport gates**:
   - `browser_viewport_resize({width: 375, height: 667})` → cards stack vertically
   - **Adversarial**: Force 240px width → expect scrollable container, no clipped text

4. **Remote banner**:
   - Run binary with `MAGIC_ALLOW_REMOTE=true` → expect banner visible
   - **Adversarial**: Dismiss banner → refresh → banner should remain dismissed

### Assertions
- Theme persisted in localStorage
- Cmdk shows correct suggestions
- Mobile layout functional
- Banner state persisted

---

## Error Boundaries
### Adversarial tests
- Malformed route: `/dashboard\invalid` → expect 404 page without `[ref=dashboard-cards]`
- Database unreachable → expect error boundary: `getByRole('alert', {name: 'Connection error'})`
- Empty state flash → no flickering between states