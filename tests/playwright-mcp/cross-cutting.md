# Cross-cutting Concerns Playbook

## Pre-conditions
- All pages functional with representative data
- Binary built and running with test database

## Viewport Testing (Q43)
1. Test desktop ≥1024px: full layout
2. Test tablet 768-1024px: sidebar → hamburger, drill-down navigation
3. Test phone <768px: gate message displayed

## Error Envelope Testing (Q44)
1. Test API error response format: `{"error": {"code", "message", "details"}}`
2. Test correlation ID injection and display
3. Test X-Correlation-ID header in responses

## Error Surface Testing (Q45)
1. Test field-level inline errors
2. Test form-level banner errors
3. Test page-level empty states with retry
4. Test background toast notifications
5. Test blocking modal dialogs

## Loading States Testing (Q46)
1. Test list-skeleton variant
2. Test form-spinner variant
3. Test two-pane-split variant
4. Test report-skeleton variant
5. Test sse-empty variant
6. Test button-inline variant

## Theme Testing (Q47)
1. Test light mode rendering
2. Test dark mode rendering
3. Test system default behavior
4. Test theme toggle persistence
5. Test contrast ratios (WCAG AA)

## Command Palette Testing (Q48)
1. Test Cmd/Ctrl+K shortcut opens palette
2. Test action navigation
3. Test keyboard navigation (Arrow, Enter, Esc)
4. Test search/filter functionality

## Accessibility Testing (Q50)
1. Test keyboard navigation coverage
2. Test focus-visible styles
3. Test axe-core scan for critical violations
4. Test console error count = 0

## Optimistic UI Testing (Q55)
1. Test optimistic profile rename
2. Test optimistic rule toggle
3. Test optimistic pairing updates
4. Test rollback on server error

## Prefetch Testing (Q56)
1. Test session detail prefetch disabled
2. Test profile detail prefetch disabled
3. Test other routes auto-prefetch

## Metrics Testing (Q57)
1. Test Prometheus `/metrics` endpoint
2. Test correlation ID in logs
3. Test JSON logging format

## Assertions
- [ ] All 12 cross-cutting checks pass
- [ ] Zero critical axe-core violations
- [ ] Console error count = 0 in golden path
- [ ] All LoadingBoundary variants render correctly
- [ ] All error surfaces function as designed