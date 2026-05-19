# WEB_RULES.md

Aturan FE Magic MariaDB Sync. **Domain-anchored** ke `CONTEXT.md`, **token-anchored** ke `DESIGN.md`. Generic Next.js cheatsheet sengaja di-skip — pakai docs Next.js + React resmi.

## Pemisahan Interface, Tampilan, Logic

Tetap berlaku, ringkas:
- **Interface (`types/`)**: types/interfaces TS. Nama type = nama konsep di `CONTEXT.md` (`MappingProfile`, `SyncSession`, `ColumnPairing`, `Rule` — bukan `Profile`/`Session`/`Mapping`).
- **Tampilan (`_components/` atau `components/`)**: JSX + Tailwind via token `DESIGN.md`. **No hardcoded warna/spacing** — pakai class util Tailwind yang men-resolve ke token DS.
- **Logic (`hooks/`, `lib/`)**: API call, SSE subscription, derive state. Custom hook per domain concept.

**Aturan rigid**:
- 1 komponen / file. File name = `PascalCase.tsx`.
- Hook 1 file per concept (`useX.ts`).
- Type 1 file per domain entity (`Connection.ts` = interface + sub-types Connection saja).
- `_components/` (private per route) untuk komponen yang tidak di-reuse lintas route. Pindah ke `components/` saat dipakai ≥2 route.
- File ≤100 baris (cap 120, sama AGENTS.md `[CODE_RULES]`).

## Domain ↔ Komponen mapping

Bila menambah komponen, anchor ke konsep `CONTEXT.md`. Tidak ada `<UserCard>` (tidak ada User di domain); tidak ada `<ProductTile>` (tidak jualan apa-apa).

| CONTEXT.md term | Komponen primer | Lokasi |
|---|---|---|
| Connection | `ConnectionForm`, `ConnectionStatusBadge` | `app/connections/_components/` |
| Mapping Profile | `MappingProfileCard`, `ProfileStatusBadge` | `app/profiles/_components/` |
| Selection Set | `SelectionTablePicker` | `app/profiles/[id]/builder/_components/` |
| Column Pairing | `ColumnPairingRow`, `SourcePicker` | `app/profiles/[id]/builder/_components/` |
| Rule | `RuleEditorDialog`, `SamplePreviewPanel` | `app/profiles/[id]/builder/_components/` |
| Closure Advisor | `ClosureAdvisorDialog` (expand confirm) | `app/profiles/[id]/_components/` |
| Sync Session | `SessionProgressBar`, `SessionStatusBadge` | `app/sessions/_components/` |
| Sync Log (row failure) | `SyncLogAccordion`, `LogGroupRow` | `app/sessions/[id]/_components/` |
| Friendly error | `lib/friendlyError.ts` + `useToast` | `lib/`, `hooks/` |
| Schema drift banner | `DriftBanner` | `app/profiles/[id]/_components/` |
| Credential mode wizard | `KeyModeWizard` | `app/settings/_components/` |
| Viewport gate (phone) | `ViewportGate` | `components/ViewportGate.tsx` |
| Sidebar sheet (tablet) | `SidebarSheet` | `components/SidebarSheet.tsx` |

## State management

- **Local UI state**: `useState`/`useReducer`. Form, dialog open, expanded accordion.
- **Server state**: SWR atau TanStack Query untuk fetch/cache `connections`, `mapping_profiles`, `sync_sessions`. **No Redux/Zustand V1** — server state = source of truth, tidak ada domain global yang lintas-route butuh kompleks state machine FE.
- **SSE state**: custom `useSseSession(sessionId)` -> kembalikan `{snapshot, lastEvent, status}`. Reconnect logic di hook (browser auto-reconnect EventSource), tapi tetap log per-reconnect snapshot baru per ADR-0005.

## Route prefetch policy

Sesuai Q56, Next.js auto-prefetch on viewport adalah default. Opt-out dengan `<Link prefetch={false}>` untuk:

| Route pattern | Alasan opt-out |
|---|---|
| `/sessions/[id]` | Payload log + drift besar (>50KB). SSE running di-background, prefetch wasteful. |
| `/profiles/[id]/builder` | Schema tree revalidates on mount. Static payload estimation sulit, opt-out conservative. |

**Heuristic**: opt-out jika estimated static payload >50KB ATAU route revalidates on mount (prefetch wasted). Tidak ada custom hover-prefetch — breaks keyboard a11y (Q50).

## A11y MUST (non-negotiable)

Sama list AGENTS lama; canonical di sini sekarang:
- **Skeleton** untuk loading >300ms — bukan spinner full-screen.
- **Toast error** untuk fail call API — pesan dari `friendlyError.ts` (mirror `ToFriendly` BE).
- **Keyboard navigation** seluruh interaktif: Tab order logis, Esc tutup dialog/dropdown, Enter submit form, Space toggle accordion/checkbox.
- **Focus ring** wajib visible (token `DESIGN.md`: `outline 2px #2563EB offset 2px`). Tidak boleh `outline: none` tanpa replacement.
- **ARIA**: shadcn/ui sudah handle Radix primitives. Custom widget wajib `aria-label`/`aria-describedby`.
- **Responsive**: 1280px max-content, breakpoint Tailwind default. Mapping Builder boleh horizontal scroll di <1024px (data-dense, tidak dipaksa stack).

## Keyboard navigation coverage

Sesuai Q50, coverage wajib untuk komponen stateful berikut:

| Komponen | Interaksi keyboard wajib |
|---|---|
| Schema picker (Q40) | Tab antar pane, Arrow up/down di list, Enter pilih, Esc tutup |
| Log viewer (Q38) | Tab antar log entries, Space toggle accordion |
| Sidebar (Q42) | Tab + Enter expand/collapse, Esc tutup (tablet) |
| Command palette (Q48) | Cmd/Ctrl+K buka, Arrow up/down, Enter execute, Esc tutup |

## Accessibility dev tooling

- **`@axe-core/react` dev only**: auto-run di development build. Dinonaktifkan di production.
- **Kontras audit**: minimum 4.5:1 text, 3:1 UI components untuk light + dark theme. Verifikasi manual saat tambah warna baru.
- **Tidak ada CI gate** axe automated, tidak ada screen-reader test mandate di V1.

## Viewport policy

Pola Q43: adaptive viewport — desktop full, tablet collapse, phone gate.

**Breakpoint definition**:
- **Phone** (<768px): layar sempit,UX tidak memadai untuk tool kompleks.
- **Tablet** (768-1024px): cukup untuk navigasi, tapi space terbatas.
- **Desktop** (≥1024px): pengalaman penuh.

**Aturan per breakpoint**:

1. **Phone — gate full-screen**. Semua route redirect ke halaman gate dengan pesan: "Magic MariaDB Sync membutuhkan layar lebih lebar. Gunakan tablet atau desktop." Komponen `<ViewportGate>` di-embed di root `app/layout.tsx`, menggunakan CSS media query (`lg:hidden` reverse pattern) plus JS untuk mencegah infinite redirect loop.

2. **Tablet — collapse sidebar**. Sidebar (Q42) berubah menjadi hamburger menu via shadcn `Sheet`. Two-pane layout (Q40) di-drill-down: master list tetap visible, detail membuka sebagai layar baru dengan tombol back.

3. **Desktop — full layout**. Semua pane dan sidebar visible tanpa collapse.

**Catatan**: App ini bukan mobile-first tool. Desain desktop-first, phone adalah edge case yang di-gate daripada di-optimasi.

## DRY policy

- Ekstrak hook saat 2 component butuh logic sama (mis. `useDebouncedValue` untuk Sample Preview 300ms debounce per CONTEXT.md L108).
- Ekstrak komponen saat 2 instance pakai shape sama. Single instance = inline, jangan abstraksi prematur (sama AGENTS `[CODE_RULES]`).
- **Status badge wajib via `<StatusBadge type="session" status="running" />`** — domain-status mapping di-resolve di 1 tempat (`lib/domainStatus.ts`), jangan inline class warna per komponen.

## Tooling

- **shadcn/ui** untuk komponen primitif. Generate ke `components/ui/`. Override theme via Tailwind config (token `DESIGN.md`).
- **lucide-react** untuk icon (sesuai padanan domain di `DESIGN.md`).
- **Tailwind**: pakai class util resolve ke token DS. **Tidak boleh** `bg-[#2563EB]` arbitrary — pakai `bg-primary`.
- **No CSS-in-JS** (styled-components, emotion). Tailwind cukup untuk static export + go:embed bundle ramping.

## Testing

- **Unit (logic)**: hook + lib via Vitest atau Jest. Wajib untuk `friendlyError.ts`, `domainStatus.ts`, mapping profile validator client-side.
- **Component (interaksi)**: Testing Library — fokus skenario kritis: ColumnPairing resolve flow, RuleEditor live preview, ClosureAdvisorDialog expand confirmation.
- **E2E (V2)**: Playwright. V1 manual smoke 3-OS per ADR-0021.
