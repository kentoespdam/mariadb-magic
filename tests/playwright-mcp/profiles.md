# Profile Builder Playbook

## Pre-conditions
- Two connections configured (source on 3307, destination on 3308)
- Database containers running (`make test-e2e-up`)
- Binary built and running (`make test-e2e-bin`)

## Steps

### Happy Path
1. Navigate to Profiles: `browser_navigate("/profiles")`
2. Click "New Profile" button
3. Fill profile name: "Test Sync Profile"
4. Select source connection
5. Select destination connection
6. Enter profile builder for mapping:
   - Navigate to `/profiles/new` or edit existing at `/profiles/{id}`
   - Use two-pane schema picker (Q40 keyboard navigation)
   - Map column pairings with accessibility selectors
   - Add rules via Rule dialog with live preview (300ms debounce)
7. Mark profile as ready (Q29)
8. Verify profile status transitions from draft → ready
9. Test profile downgrade when editing ready profile (T1#7)

### Adversarial Scenarios
1. Test PK/NOT NULL edge cases in validation
2. Test optimistic rename functionality (Q55)
3. Test prefetch off scenarios (Q56)
4. Verify no drag-drop functionality (as designed)
5. Test structural validation errors
6. Test cross-profile collision detection

### Assertions
- [ ] Profile builder loads with schema picker
- [ ] Two-pane keyboard navigation works (Q40)
- [ ] Column pairing validation enforces PK requirements
- [ ] Rule dialog opens with live preview
- [ ] Mark Ready button disabled until valid
- [ ] Profile status correctly transitions draft → ready
- [ ] Editing ready profile triggers downgrade confirmation
- [ ] Cross-profile collision properly detected and blocked
- [ ] Structural validation catches missing PK mappings
- [ ] Rule validation catches mapping errors