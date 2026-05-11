# DECISIONS Q1-Q60 — FE Rebuild Magic MariaDB Sync

**Status**: locked. Hasil grilling session `/grill-with-docs` (Q1-Q60).
**Audience**: agen downstream yang akan eksekusi scaffolding + implementasi.
**Rule**: dokumen ini = source of truth keputusan desain UI rebuild. Konflik dengan dokumen lain → patuh ke file ini sampai dokumen lain di-update agar selaras.

## Cara baca

- Setiap Q = satu keputusan terkunci. Format: pertanyaan → pilihan yang dipilih → alasan singkat.
- Q1-Q42 mengunci **stack & domain shape**. Banyak sudah tercermin di `web/WEB_RULES.md`, `DESIGN.md`, `ARCHITECTURE.md`, `CONTEXT.md`. Bagian ringkasan di bawah konfirmasi posisi final.
- Q43-Q60 mengunci **policy lintas-cutting** yang belum tercatat di dokumen lain. Ini bagian yang paling penting dibaca agen downstream.
- Daftar **T1 Amendment** (22 item) di bagian akhir = side-effects konkret yang HARUS dieksekusi.

---

## Q1-Q42 — Stack & Domain (ringkasan)

Detail lengkap di `web/WEB_RULES.md` + `DESIGN.md`. Sintesis singkat:

- **Framework**: Next.js 16.x App Router, output `'export'` (static), dynamic routes pakai SPA-mode (`generateStaticParams: () => []` + `'use client'`).
- **Bundle**: di-`go:embed` (`all:out`) ke binary Go. SPA fallback handler di Go.
- **Package manager**: `bun`.
- **Styling**: Tailwind CSS v4 zero-config CSS-first (`@theme`, `@variant dark`), tidak ada `tailwind.config.ts` runtime-driven.
- **Komponen**: shadcn/ui (Radix primitives) + `lucide-react` + `cmdk` + `sonner` (toast).
- **State**:
  - Local UI: `useState`/`useReducer`.
  - Server: SWR (pilihan vs TanStack Query — SWR dimenangkan).
  - SSE: custom `useSseSession(sessionId)`, hybrid dengan paginated REST log.
- **Forms**: react-hook-form + zod + `@hookform/resolvers` via shadcn `<Form>` block.
- **Themes**: `next-themes` (light/dark, system default, manual toggle).
- **Linting/format**: Biome.
- **Tests**: Vitest.
- **Domain entities** (anchor `CONTEXT.md`): Connection, MappingProfile (state machine `draft → ready → active`), SelectionSet, ColumnPairing, Rule (5 whitelist), ClosureAdvisor, SyncSession, SyncLog, DriftReport.
- **Profile editor**: view-mode vs edit-mode dengan downgrade confirm saat mutasi di `ready/active`.
- **Schema picker**: two-pane master-detail (Q40).
- **Log viewer**: hybrid SSE running + REST paginated history (Q38).
- **Sidebar nav**: kolaps responsif (Q42).
- **MarkReady**: blocking modal dengan preflight result (Q29).
- **SSE endpoint path**: `/api/sse/{id}` (koreksi T1#1).

---

## Q43-Q60 — Policy & Cross-cutting (lock detail)

### Q43 — Viewport policy: **Adaptive**

- Desktop ≥1024px: full layout.
- Tablet 768-1024px: sidebar → hamburger, two-pane Q40 → drill-down (master list → detail back button).
- Phone <768px: tampilkan halaman gate "Magic MariaDB Sync requires a wider screen. Please use a tablet or desktop."
- **Bukan** mobile-first responsive. App = desktop-first tool.

### Q44 — Backend error envelope: **JSON everywhere**

- Helper `internal/api/errors.go` ekspor `WriteError(w http.ResponseWriter, code string, msg string, details any, status int)`.
- Format response error semua endpoint:
  ```
  {"error": {"code": "...", "message": "...", "details": ...}}
  ```
- `code` = machine-readable enum (mis. `VALIDATION_FAILED`, `NOT_FOUND`, `CONFLICT_RUNNING_SESSION`).
- `message` = human-readable Indonesian + English mixed (per AGENTS `[CODE_RULES]`).
- `details` opsional — field-level errors untuk form validation.
- Semua `http.Error(...)` di seluruh `internal/api/*.go` di-refactor ke `WriteError`.
- Middleware tambahkan **correlation ID** (`X-Correlation-ID`) per request, log via `slog` + di-echo ke response header.

### Q45 — FE error surface: **Layered by error type**

- 5 layer:
  - **field** — inline di bawah input (form validation).
  - **form** — banner merah di atas form (server rejected submit).
  - **page** — empty-state full-page dengan tombol Retry (load failure).
  - **background** — toast `sonner` (mutation async, non-blocking).
  - **blocking** — modal dialog (critical, butuh user decision).
- Centralized: `web/src/lib/errorSurface.ts` + hooks `useFormError`, `usePageError`.
- ApiError dari `apiClient` mapping ke surface berdasar `error.code` + context call site.
- Correlation ID dari Q44 di-tampilkan di toast/banner (tombol "Copy ID") untuk debugging.

### Q46 — FE loading state: **Tiered by region type**

- Wrapper `<LoadingBoundary variant="...">` sebagai single entrypoint. Variants:
  - `list-skeleton` — 3-5 baris skeleton shadcn `<Skeleton>`.
  - `form-spinner` — overlay spinner di atas form saat submit.
  - `two-pane-split` — skeleton di pane kiri + spinner di pane kanan (Q40).
  - `report-skeleton` — section-based skeleton (header + table + chart).
  - `sse-empty` — placeholder "Waiting for events…" + subtle pulse.
  - `button-inline` — spinner di dalam tombol selama mutation.
- Tidak ada spinner full-screen. SWR `isLoading` → variant; SWR `isValidating` (refetch) → silent atau toast saja.

### Q47 — Theme: **Light + Dark**

- `next-themes` provider di `app/layout.tsx`, attribute `class`, default `system`.
- Tailwind v4: `@variant dark (&:where(.dark, .dark *))` + dua set CSS variables di `@theme` (light default, dark via `.dark` class).
- Tombol toggle sun/moon di header (lucide `Sun`/`Moon`). Persist via localStorage (handled by next-themes).
- DESIGN.md di-update: dark palette tokens (background, foreground, muted, border, primary, destructive, dst.) — kontras WCAG AA per Q50.

### Q48 — Command palette: **cmdk only**

- shadcn block `command` (`bunx shadcn add command`).
- Shortcut global: `Cmd/Ctrl+K`.
- Tombol di header (kbd hint).
- Action registry: `web/src/lib/commands.ts` ekspor array `Command[]` dengan shape `{id, label, icon, run: () => void, keywords?: string[], group?: string}`.
- Actions wajib: navigate ke setiap route utama (connections, profiles, sessions, settings), MarkReady aktif profile, StartSync, toggle theme.
- **Tidak ada** global search dokumen/data (hanya actions).

### Q49 — Forms: **react-hook-form + zod via shadcn Form**

- Deps: `react-hook-form`, `zod`, `@hookform/resolvers`.
- shadcn block `form` di-add.
- Pattern: schema zod per form di-colocate dengan komponen form (`*.schema.ts` neighbour).
- Server error mapping: `error.details.fields[]` dari Q44 di-map ke `form.setError(fieldName, {message})`.
- Backend Go validation tetap source of truth. Zod schema FE = mirror untuk UX cepat, BUKAN spec. Tidak ada OpenAPI codegen di V1.

### Q50 — Accessibility: **WCAG AA target + axe-core dev**

- Dev dep: `@axe-core/react`. Auto-run di dev mode (development build only).
- Keyboard navigation coverage wajib di-test manual:
  - Q40 schema picker two-pane (Tab antar pane, Arrow di list, Enter pilih).
  - Q38 log viewer (Tab antar log entries, Space toggle accordion).
  - Q42 sidebar (Tab + Enter expand collapse).
  - Q48 cmdk (Cmd+K, Arrow, Enter, Esc).
- Focus-visible style wajib (token `--ring`). `:focus { outline: none }` tanpa replacement = banned.
- Kontras audit untuk both light/dark (Q47) — minimum 4.5:1 text, 3:1 UI.
- **Tidak ada** CI gate axe, **tidak ada** manual screen-reader test mandate di V1.

### Q51 — Test scope V1: **Unit + hooks only** (USER DIVERGED dari rekomendasi)

- Vitest setup.
- Target test:
  - `lib/` utilities (domainStatus, errorSurface, commands, validation schemas, apiClient envelope unwrap).
  - Custom hooks (useProfile, useSession, useConnection, useSseSession, useFormError, usePageError).
- Mock SWR + global `fetch`.
- **Defer ke V2**: component test (Testing Library) + e2e (Playwright).
- **Risk acknowledged**: Q40 two-pane picker + Q29 MarkReady modal stateful, no component test = bug-prone. Mitigasi: pisahkan state logic ke hook (testable) dari render (untested) sebanyak mungkin.

### Q52 — API client architecture: **Per-entity service layer di atas apiClient**

- `web/src/lib/apiClient.ts`:
  - Export `apiGet`, `apiPost`, `apiPut`, `apiDelete`, typed generics.
  - Parse Q44 envelope. Sukses → return `data`. Gagal → throw `ApiError` class dengan `{code, message, details, status, correlationId}`.
  - Inject `X-Correlation-ID` request header (UUID v4 client-side untuk inisiasi).
- `web/src/lib/services/{profiles,connections,sessions,preflight,maint,system}.ts`:
  - Setiap file ekspor object `profileService = {list(), get(id), create(input), markReady(id), ...}` dengan typed args + return.
  - URL construction terpusat di service (tidak ada string `/api/...` di hooks).
- Hooks (`web/src/hooks/use*.ts`) consume service, BUKAN raw URL.
- SWR fetcher = service method (mis. `useSWR('profiles/list', profileService.list)`).

### Q53 — Build & embed pipeline: **Makefile + embed-check**

- `Makefile` di root repo. Targets:
  - `make dev` — concurrent: `cd web && bun dev` + `air` (Go hot reload). Tools: `make` foreground bisa pakai `&` + `wait` atau dep `mprocs`/`tmux`. **Default**: dua-terminal manual diizinkan, target Makefile `dev-web` + `dev-go` terpisah + `dev` chain pakai `&`.
  - `make build` — `cd web && bun run build` → `go build -ldflags "-s -w" -o magicsync ./cmd/magicsync`.
  - `make embed-check` — bandingkan mtime `web/out/index.html` vs newest file di `web/src/`. Jika `web/src/` ada lebih baru → exit 1 dengan pesan "FE bundle stale. Run 'make build' first."
  - `make test` — `go test -race ./...` + `cd web && bun run test`.
  - `make clean` — hapus `web/out/`, `web/.next/`, binary.
- CI run: `make embed-check && make build && make test`.
- **Tidak pakai** `go:generate` (mudah lupa `go generate` sebelum `go build`).

### Q54 — Env config strategy: **Lightweight struct loader**

- `internal/config/config.go`:
  - Struct `Config` dengan field (~6-8): `ListenAddr`, `MetaDBPath`, `EncryptionKeyPath`, `LogLevel`, `AppEnv` (`dev`/`prod`), `MetricsEnabled`, `AllowRemote`.
  - `Load()` baca `os.Getenv`, default eksplisit per field, validate required (mis. `EncryptionKeyPath` wajib).
  - Fail fast: panic / `log.Fatal` saat startup jika invalid.
  - Dev mode (`APP_ENV=dev`): load `.env` via `github.com/joho/godotenv` BEFORE validation. Prod: skip godotenv.
- `.env.example` committed (template, no real values).
- `.env` di-gitignore.
- FE: **zero runtime config**. Semua path relative `/api/...`. Tidak ada `NEXT_PUBLIC_*` var.

### Q55 — Optimistic UI: **Safe mutations only**

- Optimistic via SWR `mutate(key, optimisticData, {rollbackOnError: true, revalidate: true})`:
  - `useRenameProfile` — rename in-place.
  - `useToggleRule` — Rule whitelist toggle (boolean flip).
  - `useUpdatePairings` — column pairing edit di Q40 builder.
- Server-confirmed (button spinner via Q46 `button-inline`):
  - `useDeleteConnection`.
  - `useMarkReady` (state transition).
  - `useStartSync`.
  - `useApplyRule` (rule create/update beyond toggle).
- Rollback path: toast (Q45 background) "Update gagal, dibatalkan" + revert UI.

### Q56 — Route prefetch: **Default + opt-out heavy**

- Default: Next.js auto-prefetch on viewport.
- Opt-out (`<Link prefetch={false}>`) untuk:
  - Session detail route (Q38 log + drift payload besar).
  - Profile detail/builder route (Q40 schema tree).
- Heuristik dokumentasi: opt-out jika static payload >50KB ATAU route revalidates on mount (prefetch wasted).
- Tidak ada custom hover-prefetch (breaks Q50 keyboard a11y).

### Q57 — Telemetry: **Logs + Prometheus metrics**

- `internal/observability/metrics.go`:
  - Counters: `sync_started_total`, `sync_failed_total`, `sse_clients_active` (gauge), `http_requests_total`.
  - Histograms: `sync_duration_seconds`, `http_request_duration_seconds`.
  - Dep: `github.com/prometheus/client_golang`.
- `/metrics` endpoint:
  - Default: bind `127.0.0.1` only (sama Q59).
  - Aktivasi: env `METRICS_ENABLED=true` (Q54 config).
- `slog` middleware:
  - Setiap request log `correlation_id`, `method`, `path`, `status`, `duration_ms`.
  - Format JSON di prod, text di dev.
- FE:
  - `console.error` untuk unhandled errors.
  - Correlation ID dari header response di-attach ke ApiError (Q52).
  - **Tidak ada** FE telemetry SDK (privacy + simplicity).

### Q58 — i18n: **English only, no scaffolding**

- Hardcoded English strings inline di JSX.
- Domain terms (Mark Ready, Drift, Closure) tetap English.
- Error messages backend boleh mixed Indonesian + English (per AGENTS `[CODE_RULES]`), tapi FE display as-is.
- Jika multi-language dibutuhkan di V2 → refactor scope-driven saat itu, BUKAN preemptive `t()` helper sekarang.

### Q59 — Auth & access: **Localhost-only + opt-in remote**

- `internal/config/config.go` validate `ListenAddr`:
  - Default `127.0.0.1:8080`.
  - Tolak non-loopback bind kecuali `MAGIC_ALLOW_REMOTE=true` env var explicit.
  - Saat opt-in: `slog.Warn` startup banner "REMOTE ACCESS ENABLED — credentials NOT auth-protected".
- Endpoint baru `GET /api/system/info` return `{"remote_exposed": bool, "version": "...", "app_env": "..."}`.
- FE `usePageError` (Q45) cek `system.info.remote_exposed`. Jika true → persistent red banner top-of-page "Remote access enabled. API not authenticated. Bind to 127.0.0.1 untuk keamanan."
- **Tidak ada** auth header / cookie / login flow di V1.

### Q60 — Session close: **Stop grilling, hand off to agents via beads**

- 60 keputusan + 22 amendment sudah cover semua axis arsitektural.
- Agent downstream eksekusi via beads issues (lihat `plan/claim-order-ui.md` versi update).
- Open items yang ditunda mid-build (resolved just-in-time): perf budgets, conflict-resolution UX, drift report export format, favicon/logo asset, browser support matrix.

---

## T1 Amendment list (22 items — wajib eksekusi)

Setiap amendment = perubahan konkret dari design grilling. Agent downstream pick up via beads child issues.

### Backend

1. **SSE endpoint path**: `/api/sse/{id}` (bukan `/api/sessions/{id}/events`). Update router + WEB_RULES.md note.
2. **Drift surfaces via Preflight endpoint**: `GET /api/profiles/{id}/preflight` return `DriftReport` (existing struct `internal/sync/preflight/preflight.go`). FE konsumsi sebelum MarkReady (Q29) dan render via `DriftBanner`.
3. **Connection Update — skip password if empty**: `internal/api/connections.go` `Update` (line 122-149) — jika `req.Password == ""`, JANGAN encrypt + JANGAN overwrite `PasswordCiphertext` di repo. Tambah helper repo `UpdateWithoutPassword`.
4. **Connection GET — omit PasswordCiphertext**: response shape jadi `{id, name, host, port, user, has_password: bool, last_test_status, last_test_error}`. Update `repo.Connection` JSON tag / DTO terpisah.
5. **Connection Delete — cascade + ref check**:
   - Query `mapping_profiles` referencing connection.
   - Query `sync_sessions` running pakai connection.
   - Jika ada running session → return 409 `{error: {code: "CONFLICT_RUNNING_SESSION", details: {active_sessions: [...]}}}` (Q44 envelope).
   - Jika hanya profile reference (no running session) → require `?cascade=true` query param, hapus profiles + connection atomic.
6. **Session logs paginated endpoint**: `GET /api/sessions/{id}/logs?limit=N&cursor=X` return `{items: [...], next_cursor: "..."}`. SSE tetap di `/api/sse/{id}` untuk session running. Hybrid: log viewer Q38 mulai dari paginated history → switch ke SSE saat status `running`.
7. **Profile UpdatePairings auto-draft**: `internal/api/profiles.go` `UpdatePairings` — saat status `ready`/`active`, mutate `column_pairings_json`/`rules_json` → set status `draft` (downgrade) + return warning di response. Frontend Q-prior locked: downgrade confirm modal sebelum POST.
8. **WEB_RULES.md viewport policy section** (Q43) — tambah section setelah "Responsive" yang sudah ada. Lihat Q43 detail di atas.
9. **`internal/api/errors.go` WriteError helper + envelope refactor** (Q44) — semua `http.Error(...)` di `internal/api/*.go` di-ganti `WriteError`. Tambah middleware correlation ID.
22. **`/api/system/info` endpoint + ListenAddr guard** (Q59) — lihat Q59 detail.

### Frontend

10. **`lib/errorSurface.ts` + `useFormError`/`usePageError`** (Q45) — central error→surface mapping.
11. **`<LoadingBoundary variant>` wrapper** (Q46) — 6 variants di atas.
12. **`next-themes` + dual CSS vars + DESIGN.md dark palette** (Q47) — kontras WCAG AA per Q50.
13. **`cmdk` + `lib/commands.ts` action registry** (Q48) — Cmd+K, actions only.
14. **`react-hook-form` + `zod` + `@hookform/resolvers` via shadcn Form** (Q49).
15. **`@axe-core/react` dev + keyboard nav coverage** (Q50).
16. **Vitest setup untuk `lib/` + custom hooks** (Q51).
17. **`lib/apiClient.ts` + `lib/services/*.ts`** (Q52).
20. **SWR optimistic di safe mutations** (Q55) — list di Q55.
21. **`<Link prefetch={false}>` di heavy routes** (Q56).

### Build & ops

18. **Makefile orchestration + `embed-check` target** (Q53).
19. **`internal/config/config.go` + `godotenv` dev** (Q54).
22. **Prometheus `/metrics` + slog correlation ID + `/api/system/info`** (Q57 + Q59).

(Numbering tidak strictly continuous karena Q58 = no amendment.)

---

## Tooling protocol untuk agent downstream

Setiap agent yang pick bead WAJIB:

1. **Baca dulu**:
   - Bead description + acceptance criteria.
   - File ini (`plan/DECISIONS-Q1-Q60.md`) — section yang di-reference.
   - `AGENTS.md` (operations, tooling, session close).
   - `CONTEXT.md` (domain terms) jika menyentuh domain.
   - `web/WEB_RULES.md` jika FE.
   - `DESIGN.md` jika styling.
2. **Tool order**:
   - Code search: `graphify query "..."` (lihat `graphify-out/GRAPH_REPORT.md`). Fallback grep, never `ls -R`.
   - Library docs / API / syntax: **`context7` mandatory**. Resolve library ID → query docs → answer dari docs. JANGAN guess versi atau API shape.
   - New module → skill `tdd`.
3. **Anti-halucination rule**: kalau ragu tentang library API, syntax flag, atau migration → STOP, run context7. Jangan improvisasi.
4. **Output rule**: tulis kode hanya yang di-spec issue. Jangan refactor luar scope. ≤100 baris/file (cap 120) per AGENTS `[CODE_RULES]`.
5. **Session close**: `git pull --rebase` → `bd dolt push` → `git push` → update `plan/claim-order-ui.md` checklist. Tidak boleh skip.

---

## Glossary cepat

- **T1 Amendment** = perubahan konkret dari grilling round, eksekusi via beads.
- **Q44 envelope** = `{"error": {"code", "message", "details"}}` JSON shape.
- **Correlation ID** = UUID v4 per HTTP request, di-log + di-echo di response header `X-Correlation-ID`.
- **Service layer** = `web/src/lib/services/*.ts`, typed methods per entity di atas `apiClient`.
- **LoadingBoundary variant** = 6 string enum di Q46.
- **Surface layer** = 5 enum di Q45 (field/form/page/background/blocking).
