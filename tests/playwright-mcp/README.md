# Playwright MCP E2E Testing Guide

This directory contains E2E tests using Playwright MCP server for Magic MariaDB Sync.

## Prerequisites

- Docker & Docker Compose
- Make
- Go 1.21+ (for building binary)

## Quick Start

```bash
# Start test environment (MariaDB containers + build & run binary)
make test-e2e

# Or step by step:
make test-e2e-up    # Start MariaDB containers
make test-e2e-bin   # Build & run binary in temp dir
# Then use the URL from .test-url file with your MCP client
make test-e2e-down  # Clean up everything
```

## Test Environment

### Database Fixtures
- **Source DB**: `magicsync-src:3307`
- **Destination DB**: `magicsync-dst:3308`
- **Tables**: customers, orders, order_items
- **Data**: ~200 rows per table, deterministic seed
- **Schema difference**: Destination has `customers.notes` column (not in Source)

### Binary Testing
The binary is built and run in a temporary directory to avoid polluting workspace:
- Temp dir: `/tmp/magicsync-e2e-<timestamp>/`
- Database: `magicsync.db` (same-dir-as-binary per ADR-0022)
- Port: ephemeral (auto-assigned)

## Playbook Format

Each test playbook is a markdown file in this directory with:

1. **Preconditions**: Database state, binary running
2. **Steps**: Numbered actions using MCP tools
3. **Assertions**: Accessibility-based verification

### MCP Tool Usage

```markdown
1. Navigate to page: `browser_navigate(url)`
2. Click button: `browser_click(element)` using accessibility role/name
3. Type text: `browser_type(element, text)`
4. Press key: `browser_press_key(element, key)`
5. Evaluate: `browser_evaluate(code)`
6. Snapshot: `browser_snapshot()` for accessibility tree
```

### Selector Convention

**MANDATORY**: Use accessibility role/name selectors only. Never use raw text or nth-child.

```javascript
// ✅ GOOD - accessibility based
getByRole('button', { name: 'Connect to database' })
getByRole('textbox', { name: 'Host' })
getByRole('checkbox', { name: 'Skip password' })

// ❌ BAD - avoid these
getByText('Connect')
getByTestId('connect-btn')
getByRole('button').first()
```

## Directory Structure

```
tests/playwright-mcp/
├── README.md                 # This guide
├── results/                  # Test results (gitignored)
│   └── .gitkeep
├── dashboard.md              # Dashboard onboarding tests
├── connections.md            # Connection management tests
├── profiles.md               # Profile builder tests
├── sessions.md               # Session management tests
├── settings.md               # Settings & health tests
└── cross-cutting.md          # Cross-cutting concerns
```

## Running Tests

1. **Start environment**: `make test-e2e-up`
2. **Get binary URL**: Check `.test-url` file after `make test-e2e-bin`
3. **Run playbook**: Use MCP client with the URL
4. **Clean up**: `make test-e2e-down`

## Debugging

- **Failed tests**: Check `tests/playwright-mcp/results/<timestamp>/` for accessibility tree diffs
- **Database state**: Connect to MariaDB containers for inspection
- **Binary logs**: Check temp directory stdout/stderr

## Environment Variables

- `MAGICSYNC_DATA_DIR`: Not used in V1 (binary uses same-dir-as-binary)
- Test binary runs in temp dir to isolate state