# Dashboard / Onboarding Playbook

## Pre-conditions
- Fresh start with no existing connections or profiles
- Database containers running (`make test-e2e-up`)
- Binary built and running (`make test-e2e-bin`)

## Steps

1. Navigate to Dashboard page: `browser_navigate("/")`
2. Verify 3-card state machine (fresh/mid/active)
3. Verify theme toggle functionality
4. Verify command palette access: `browser_press_key("body", "Control+K")`
5. Verify remote banner visibility (if applicable)

## Assertions

### Happy Path
- [ ] Dashboard loads with 3 onboarding cards visible
- [ ] Theme toggle switches between light/dark mode
- [ ] Command palette opens with keyboard shortcut
- [ ] No console errors in browser

### Adversarial Scenarios
- [ ] Viewport resize handling (mobile/tablet/desktop)
- [ ] Accessibility tree structure validation
- [ ] Keyboard navigation through cards
- [ ] Error boundary handling for malformed URLs