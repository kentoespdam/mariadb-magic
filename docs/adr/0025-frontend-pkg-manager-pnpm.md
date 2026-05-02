# Frontend Package Manager: pnpm

## Considered Options

- **pnpm** – fast, disk‑space efficient, supports workspaces and strict‑dependency‑access. Benchmark score 71.85‑79.77, high reputation. Matches the existing `web/` Next.js project structure and aligns with the `pnpm` reference already in `CLAUDE.md`.
- **npm** – default Node.js package manager, widely used, extensive ecosystem. Benchmark score 81.9‑85.6. More permissive lockfile format, slower installs.
- **yarn** – fast, reliable dependency manager with workspaces and plugins. Benchmark score 85.4‑91.95. Requires the full Yarn binary; larger binary size.

## Decision

**Choose pnpm** for the frontend build pipeline. Reasons:
- Existing reference in `CLAUDE.md` already mentions `pnpm build` → consistency.
- Faster installs, deterministic lockfile, and strict workspace policy match the project’s need for a reproducible CI pipeline.
- Smaller disk usage helps keep CI/CD resources minimal.
- The project does not require Yarn plug‑ins or npm’s workspace compatibilities that Yarn specializes in.

## Consequences

- `web/package.json` will use `pnpm` for lockfile (`pnpm-lock.yaml`).
- CI scripts (`.github/workflows/*`) should use `pnpm install --frozen-lockfile`.
- `next.config.js` and other Next.js settings remain unchanged; only the package manager changes.
- The decision is locked for the lifetime of the project; for any future monorepo work, the same manager will be used.
