# Frontend Pages Required

| Page | Description | API Endpoints Used |
|------|-------------|--------------------|
| Dashboard / Onboarding | Show onboarding cards and latest sessions | `GET /api/onboarding/state` (used in UI), `GET /api/sessions` |
| Connections | List, add, edit, test, and delete connections | `GET /api/connections/`, `POST /api/connections/`, `PUT /api/connections/`, `DELETE /api/connections/`, `POST /api/connections/test` |
| Mapping Profiles | List, create, edit, delete, view schema, set ready, downgrade, edit pairings | `GET /api/profiles/`, `POST /api/profiles/`, `GET /api/profiles/{id}`, `PUT /api/profiles/{id}`, `DELETE /api/profiles/{id}`, `GET /api/profiles/{id}/schema`, `POST /api/profiles/{id}/mark-ready`, `POST /api/profiles/{id}/downgrade`, `PUT /api/profiles/{id}/pairings` |
| Profile Preflight | Show preflight validation before starting a sync | `GET /api/profiles/{id}/preflight` |
| Session List | List running, completed, and cancelled sync sessions | `GET /api/sessions/` |
| Session Detail | View session status, logs, SSE events, cancel action | `GET /api/sessions/{id}`, `POST /api/sessions/{id}/cancel`, `GET /api/sessions/{id}/logs/groups`, `GET /api/sessions/{id}/logs`, `GET /api/sessions/{id}/logs.csv` |
| Rule Preview | Edit a rule and preview its effect | `POST /api/preview/rule` |
| Maintenance | View stats and trigger eviction | `GET /api/maint/stats`, `POST /api/maint/evict` |
| About | Show app version | `GET /api/version` |

These pages collectively cover the public-facing functionality referenced in the contract and documentation.