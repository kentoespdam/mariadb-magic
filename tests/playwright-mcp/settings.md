# Settings & Health Playbook

## Pre-conditions
- Database containers running (`make test-e2e-up`)
- Binary built and running (`make test-e2e-bin`)
- Multiple sync sessions completed for retention testing

## Steps

### Happy Path
1. Navigate to Settings: `browser_navigate("/settings")`
2. Verify credential wizard lazy-prompt on first credential touch
3. Test passphrase rate limit behavior
4. Test re-key flow for credential mode change
5. Verify retention counters display
6. Test CSV bulk export functionality
7. Verify version display from `/api/system/info`
8. Verify remote banner if remote access enabled (Q59)
9. Verify timezone advisory display
10. Verify theme persistence across sessions
11. Run axe-core accessibility scan

### Assertions
- [ ] Credential wizard prompts on first credential touch
- [ ] Passphrase rate limiting enforces 3-attempt lockout
- [ ] Re-key flow completes successfully
- [ ] Retention counters show accurate session/log counts
- [ ] CSV bulk export generates valid files
- [ ] Version matches binary version
- [ ] Remote access banner shows when enabled
- [ ] Timezone advisory visible
- [ ] Theme preference persists across sessions
- [ ] Axe-core scan: zero critical violations