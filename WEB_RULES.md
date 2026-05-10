# WEB_RULES.md

Aturan FE Magic MariaDB Sync. **Domain-anchored** ke `CONTEXT.md`, **token-anchored** ke `DESIGN.md`. Generic Next.js cheatsheet sengaja di-skip — pakai docs Next.js + React resmi.

## Pemisahan Interface, Tampilan, Logic

Tetap berlaku, ringkas:
- **Interface (`types/`)**: types/interfaces TS. Nama type = nama konsep di `CONTEXT.md` (`MappingProfile`, `SyncSession`, `ColumnPairing`, `Rule` — bukan `Profile`/`Session`/`Mapping`).
- **Tampilan (`_components/` atau `components/`)**: JSX + Tailwind via token `DESIGN.md`. **No hardcoded warna/spacing** — pakai class util Tailwind yang men-resolve ke token DS.
- **Logic (`hooks/`, `lib/`)**: API call, SSE subscription, derive state. Custom hook per domain concept.

## Struktur folder (web/src) — selaras ARCHITECTURE.md

`ARCHITECTURE.md` mendefinisikan FE = Next.js App Router static export. Struktur diharapkan:

```
web/src/
  app/
    layout.tsx                    # root layout, providers, font
    page.tsx                      # dashboard / first-run 3-card (CONTEXT.md L101)
    connections/
      page.tsx                    # daftar koneksi + Test/Save split (ADR-0016)
      [id]/page.tsx               # edit koneksi
      _components/                # ConnectionForm, ConnectionStatusBadge, TestButton
    profiles/
      page.tsx                    # daftar Mapping Profile + status draft/ready
      new/page.tsx                # buat profile (Source+Destination picker)
      [id]/
        page.tsx                  # profile overview + Closure preview
        builder/page.tsx          # Mapping Builder (Tabs sidebar, ADR/CONTEXT.md L89)
        _components/
          MappingBuilderTabs.tsx
          ColumnPairingRow.tsx
          SourcePicker.tsx        # shadcn Select grouped (Kolom Source / Konstanta / Kosongkan / Default DB / Lewati)
          RuleEditorDialog.tsx    # 5 Rule whitelist + live Sample Preview
          ClosureAdvisorDialog.tsx
    sessions/
      page.tsx                    # daftar Sync Session
      [id]/
        page.tsx                  # detail + SSE progress + Sync Log accordion
        _components/
          SessionProgressBar.tsx
          SyncLogAccordion.tsx    # group-by mariadb_code (CONTEXT.md L99)
          CsvExportButton.tsx
    settings/
      page.tsx                    # Health, retention, key_mode wizard (ADR-0011)
      _components/
        ReKeyDialog.tsx
        RetentionPanel.tsx
  components/
    ui/                           # shadcn/ui generated (button, input, dialog, dst.)
    StatusBadge.tsx               # render badge sesuai DESIGN.md domain-status mapping
    EmptyState.tsx
    PageHeader.tsx
  hooks/
    useConnections.ts             # CRUD + last_test_status
    useMappingProfile.ts          # load/save + draft/ready transition
    useClosureAdvisor.ts          # call save->closure expansion
    useSseSession.ts              # SSE subscription /api/sessions/{id}/events
    useToast.ts
  lib/
    api.ts                        # fetch wrapper + error -> toast
    friendlyError.ts              # mirror BE ToFriendly untuk client-side validation
    domainStatus.ts               # status -> badge token mapping
  types/
    Connection.ts
    MappingProfile.ts             # Selection Set, Column Pairing, Rule
    SyncSession.ts                # status enum 5 nilai
    SyncLog.ts
    Rule.ts                       # 5 type whitelist
```

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

## State management

- **Local UI state**: `useState`/`useReducer`. Form, dialog open, expanded accordion.
- **Server state**: SWR atau TanStack Query untuk fetch/cache `connections`, `mapping_profiles`, `sync_sessions`. **No Redux/Zustand V1** — server state = source of truth, tidak ada domain global yang lintas-route butuh kompleks state machine FE.
- **SSE state**: custom `useSseSession(sessionId)` -> kembalikan `{snapshot, lastEvent, status}`. Reconnect logic di hook (browser auto-reconnect EventSource), tapi tetap log per-reconnect snapshot baru per ADR-0005.

## A11y MUST (non-negotiable)

Sama list AGENTS lama; canonical di sini sekarang:
- **Skeleton** untuk loading >300ms — bukan spinner full-screen.
- **Toast error** untuk fail call API — pesan dari `friendlyError.ts` (mirror `ToFriendly` BE).
- **Keyboard navigation** seluruh interaktif: Tab order logis, Esc tutup dialog/dropdown, Enter submit form, Space toggle accordion/checkbox.
- **Focus ring** wajib visible (token `DESIGN.md`: `outline 2px #2563EB offset 2px`). Tidak boleh `outline: none` tanpa replacement.
- **ARIA**: shadcn/ui sudah handle Radix primitives. Custom widget wajib `aria-label`/`aria-describedby`.
- **Responsive**: 1280px max-content, breakpoint Tailwind default. Mapping Builder boleh horizontal scroll di <1024px (data-dense, tidak dipaksa stack).

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
