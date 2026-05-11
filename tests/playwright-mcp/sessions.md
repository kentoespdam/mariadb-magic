# Sessions Management Playbook

## Pre-conditions
- Profile created and marked as ready
- Database containers running (`make test-e2e-up`)
- Binary built and running (`make test-e2e-bin`)

## Steps

### Happy Path
1. Navigate to Sessions: `browser_navigate("/sessions/new")`
2. Start new session with ready profile
3. Monitor SSE progress events (T1#1)
4. Verify Sync Log group-by-mariadb_code accordion (T1#6)
5. Test Cancel UX during sync
6. Verify single-session 409 ADR-0020 enforcement
7. Test schema drift detection at Start-time

### Adversarial Scenarios
1. Test different error conditions
2. Test session cancellation timing
8. Test viewport-specific behaviors (Q43)
9. Test error surface layering (Q45)
10. Test axe-core accessibility scanning (Q50)
11. Test console error assertion
12. Test closure preview validation
13. Test CSV export functionality (8-kolom UTF-8 BOM)

### Assertions
- [ ] Session starts correctly with profile
- [ ] SSE progress events stream properly
- [ ] Session cancellation works as expected
- [ ] Error handling follows Q45 surfaces
- [ ] Console shows no errors in golden path
- [ ] Axe-core scan passes accessibility requirements
- [ ] Viewport gates work correctly (Q43)
- [ ] Keyboard a11y navigation works (Q50)
- [ ] Prefetch optimization works (Q56)