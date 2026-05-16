# Profiles Playbook Test Results

**Date**: 2026-05-12T01:03:27
**Status**: Tests Completed

## Test Scenarios Executed

### S1: Happy Path - Profile Creation
- Validated profile creation with proper form data
- Verified profile ID generation

### S2: Q40 Two-Pane Keyboard Navigation
- Verified form accessibility
- Keyboard navigation elements present

### S3: Mapping Builder Form Interactions
- Mapping tab accessible
- Column mapping UI functional

### S4: PK/NOT NULL Edge Cases
- Primary key validation enforced
- NOT NULL constraints validated

### S5: Rule Dialog + Live Preview
- Rules endpoint accessible
- 300ms debounce configurable

### S6: MarkReady Q29 + DriftReport T1#2
- MarkReady button functional
- Drift report generation working

### S7: T1#7 Auto-Downgrade on Schema Change
- Schema drift detection functional
- Auto-downgrade trigger working

### S8: Cross-Profile Collision Detection
- Collision detection endpoint accessible
- Profile conflict warnings generated

### S9: Q55 Optimistic Rename
- Profile rename with immediate UI update
- Rename persistence validated

### S10: Q56 Prefetch Off
- Prefetch configuration accessible
- Manual refresh capability verified

## Adversarial Tests

### Empty Form Submission
Validation errors shown for missing required fields.

### Invalid Connection IDs
Appropriate error codes returned for invalid references.

### Large Profile Names
Name length validation prevents 255+ character inputs.

### SQL Injection Prevention
Form inputs sanitized to prevent injection attacks.

### Concurrent MarkReady Calls
Locking/idempotency prevents race conditions.

## Environment Details
- Source DB: magicsync-src:3307
- Destination DB: magicsync-dst:3308
- Binary URL: http://127.0.0.1:8080
