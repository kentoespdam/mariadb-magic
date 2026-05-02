# HTTP Router: chi

## Considered Options

- **(A) chi** — lightweight, idiomatic, composable router for building Go HTTP services. Uses standard `net/http`, minimal dependencies, strong context control, modular middleware. Benchmark score 78.8, source reputation medium. Aligns with project's architectural rules: small files, clear separation of handlers, no unnecessary abstraction.
- **(B) echo** — high‑performance minimalist web framework with built‑in middleware, routing, and template rendering. Benchmark score 88.8‑95.3, high source reputation. More features than needed for a desktop app's internal API; slightly larger dependency footprint.

## Decision

**Choose chi** for the HTTP router in `internal/api/`. Reasons:
- Fits the project's philosophy of minimal dependencies and idiomatic Go (standard library `net/http`).
- Composable middleware aligns with the one‑resource‑per‑file handler structure (each handler can be a separate router group).
- No need for the extra features echo provides (template rendering, built‑in binding) because the frontend is a separate Next.js static export.
- Easier to keep each handler file ≤100 lines with a simple router.

## Consequences

- All `internal/api/` handlers will be mounted on a `chi.Mux`.
- Middleware (logging, CORS, SSE) will be added via `chi.Use(...)`.
- No dependency on echo’s context type; use standard `context.Context`.
- The decision is locked for the lifetime of the project; `go.mod` will include `github.com/go-chi/chi/v5`.
