# Connections Management Playbook

## Pre-conditions
- Database containers running (`make test-e2e-up`)
- Binary built and running (`make test-e2e-bin`)

## Steps

### Happy Path
1. Navigate to Connections: `browser_navigate("/connections")`
2. Click "Add Connection" button with accessibility role
3. Fill form test source database:
   - Host: `localhost`
   - Port: `3307`
   - User: `testuser`
   - Password: `testpass`
   - Test connection before saving
4. Fill form test destination database:
   - Host: `localhost`
   - Port: `3308`
   - User: `testuser`
   - Password: `testpass`
   - Test connection before saving
5. Verify connection list shows 2 connections
6. Verify Edit functionality with connection reset state
7. Verify Delete cascade functionality

### Connection Validation
1. Test invalid host/port combinations
2. Test invalid credentials
3. Test network timeout scenarios
4. Verify correlation ID in error messages
5. Verify LoadingBoundary states

### Assertions
- [ ] Connection dialog opens with form validation
- [ ] Invalid host shows appropriate error surface
- [ ] Invalid credentials show appropriate error surface
- [ ] Connection test updates status appropriately
- [ ] Delete cascade prompts user confirmation
- [ ] Correlation ID visible in error toasts
- [ ] Required field validation (NOT NULL, etc.)