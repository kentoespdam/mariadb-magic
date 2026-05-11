# Cross-cutting Playbook

## Overview
Viewport Q43, envelope Q44, surface Q45 (field/form/page/background/blocking), LoadingBoundary Q46 variants, dark contrast Q47, cmdk Q48, keyboard a11y Q50 (Tab/Arrow/Enter/Esc), correlation ID Q52, optimistic rollback Q55, prefetch Q56, Prometheus Q57, ListenAddr guard Q59.

## Test Setup

### Pre-conditions
```bash
cd /mnt/DATA/go/mariadb-magic
make test-e2e-up  # src:3307 dst:3308
cmp magicsync .key && echo "test-encryption-key-32-bytes-long" > .key
ENCRYPTION_KEY_PATH=.key ./magicsync &  # -> http://127.0.0.1:8080
```

---

## S1 - Q43: Viewport Gate
**Goal**: Validate responsive breakpoints

### Steps
1. `browser_navigate("/")` → desktop (≥1024px)
2. Resize to tablet (768-1024px) → expect sidebar → hamburger
3. Resize to phone (<768px) → expect gate message

### Assertions
- [ ] Q43 desktop: full layout visible
- [ ] Q43 tablet: hamburger menu, drill-down nav
- [ ] Q43 phone: gate message blocks access

---

## S2 - Q44: Error Envelope
**Goal**: Validate API error response format

### Steps
1. Trigger API error (e.g., invalid connection test)
2. Capture response → expect `{"error": {"code", "message", "details"}}`
3. Validate X-Correlation-ID header present

### Assertions
- [ ] Q44 envelope format consistent
- [ ] Correlation ID in response header
- [ ] Error code machine-readable

---

## S3 - Q45: Error Surface Layering
**Goal**: Validate 5 error surface types

### Steps
1. **Field-level**: Invalid port → inline error
2. **Form-level**: Missing required fields → banner
3. **Page-level**: Empty state → retry button
4. **Background**: Toast notification for async errors
5. **Blocking**: Modal dialog for critical errors

### Assertions
- [ ] Q45 field: inline validation errors
- [ ] Q45 form: banner at top of form
- [ ] Q45 page: empty state with retry
- [ ] Q45 background: toast dismissible
- [ ] Q45 blocking: modal requires action

---

## S4 - Q46: LoadingBoundary Variants
**Goal**: Validate 6 loading state variants

### Steps
1. **list-skeleton**: Navigate to `/connections` → expect skeleton
2. **form-spinner**: Submit form → expect spinner
3. **two-pane-split**: Profile builder → expect split skeleton
4. **report-skeleton**: Drift report → expect skeleton
5. **sse-empty**: Session start → expect empty state
6. **button-inline**: Test connection → expect inline spinner

### Assertions
- [ ] Q46 list-skeleton: shows placeholder rows
- [ ] Q46 form-spinner: centered spinner
- [ ] Q46 two-pane-split: left/right skeletons
- [ ] Q46 report-skeleton: table skeleton
- [ ] Q46 sse-empty: "Waiting for events..."
- [ ] Q46 button-inline: spinner inside button

---

## S5 - Q47: Dark Contrast
**Goal**: Validate theme contrast ratios

### Steps
1. Toggle to dark mode
2. Capture contrast ratios for text/background
3. Validate WCAG AA compliance (4.5:1 for normal text)

### Assertions
- [ ] Q47 dark mode: contrast ≥4.5:1
- [ ] Light mode: contrast ≥4.5:1
- [ ] Theme toggle persists across sessions

---

## S6 - Q48: Command Palette (cmdk)
**Goal**: Validate keyboard shortcut and navigation

### Steps
1. `browser_press_key("body", "Control+K")` → expect palette
2. Type "connections" → expect filtered results
3. Press Arrow keys → navigate results
4. Press Enter → navigate to selected
5. Press Escape → close palette

### Assertions
- [ ] Q48 Ctrl+K opens palette
- [ ] Search filters actions
- [ ] Arrow keys navigate
- [ ] Enter executes action
- [ ] Escape closes palette

---

## S7 - Q50: Keyboard Accessibility
**Goal**: Validate full keyboard navigation

### Steps
1. `browser_navigate("/")` → Tab through all elements
2. Validate focus-visible styles on all interactive elements
3. Test Arrow keys in lists/menus
4. Test Enter/Space on buttons
5. Test Escape closes dialogs

### Assertions
- [ ] Q50 Tab reaches all interactive elements
- [ ] Focus-visible styles present
- [ ] Arrow keys work in lists
- [ ] Enter/Space activate buttons
- [ ] Escape closes modals

---

## S8 - Q52: Correlation ID
**Goal**: Validate correlation ID in logs and responses

### Steps
1. Trigger API call → capture X-Correlation-ID header
2. Check server logs → expect correlation ID present
3. Validate ID format (UUID or similar)

### Assertions
- [ ] Q52 correlation ID in response headers
- [ ] Correlation ID in server logs
- [ ] ID consistent across request/response

---

## S9 - Q55: Optimistic Rollback
**Goal**: Validate optimistic UI updates and rollback

### Steps
1. Rename profile → expect immediate UI update
2. Simulate server error → expect rollback
3. Validate UI reverts to previous state

### Assertions
- [ ] Q55 optimistic update shows immediately
- [ ] Server error triggers rollback
- [ ] UI reverts without flicker

---

## S10 - Q56: Prefetch Off
**Goal**: Validate prefetch disabled for specific routes

### Steps
1. Navigate to `/sessions/{id}` → expect no prefetch
2. Navigate to `/profiles/{id}` → expect no prefetch
3. Navigate to `/connections` → expect auto-prefetch

### Assertions
- [ ] Q56 session detail: no prefetch
- [ ] Q56 profile detail: no prefetch
- [ ] Other routes: auto-prefetch enabled

---

## S11 - Q57: Prometheus Metrics
**Goal**: Validate metrics endpoint

### Steps
1. `browser_navigate("/metrics")` → expect Prometheus format
2. Validate metrics include: request count, duration, errors
3. Check correlation ID in logs

### Assertions
- [ ] Q57 `/metrics` returns Prometheus format
- [ ] Metrics include standard labels
- [ ] JSON logging format used

---

## S12 - Q59: ListenAddr Guard
**Goal**: Validate remote access banner

### Steps
1. Start binary with `MAGIC_ALLOW_REMOTE=true`
2. `browser_navigate("/")` → expect remote banner
3. Validate banner shows security warning

### Assertions
- [ ] Q59 remote banner visible when enabled
- [ ] Banner shows warning message
- [ ] Banner dismissible but persists

---

## Axe-Core Scan (Q50)
**Goal**: Zero critical violations across all pages

### Steps
1. Run axe-core on each page: `/`, `/connections`, `/profiles`, `/sessions`, `/settings`
2. Capture violations → expect zero critical
3. Attach report to test results

### Assertions
- [ ] Zero critical violations per page
- [ ] Zero serious violations (target)
- [ ] Report attached

---

## Console Error Assertion
**Goal**: Zero console errors in golden path

### Steps
1. Navigate through golden path: create connection → profile → session
2. Monitor console for errors
3. Assert error count = 0

### Assertions
- [ ] No console errors in golden path
- [ ] No unhandled promise rejections
- [ ] No React/Svelte warnings