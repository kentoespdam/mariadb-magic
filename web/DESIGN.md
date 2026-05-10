# MagicSync DS

Calm, dense, trustworthy. Tool ops untuk pindah data MariaDB tanpa drama.

## Overview

Magic MariaDB Sync adalah aplikasi desktop portable untuk persona ops/non-IT yang memindahkan data produksi ke salinan lokal. Persona membuka app **episodic** — pasang koneksi, buat profile, klik Sync, tunggu, tutup. Bukan dashboard yang dipelototi seharian.

DS ini mengoptimalkan: (1) **density** — data tabel banyak kolom muat di layar tanpa scroll panjang; (2) **status legibility** — badge `Draft`/`Siap`/`OK`/`Gagal` terbaca sekilas; (3) **trust signals** — angka, hash, timestamp, error code MariaDB ditampilkan eksplisit (bukan diabstraksi); (4) **calm aesthetic** — tidak ada gradient, animasi gemerlap, atau ilustrasi maskot. Persona sedang memindahkan data produksi — instrumen, bukan mainan.

Inspirasi visual: Linear, Vercel dashboard, GitHub data tables, phpMyAdmin (versi modern). Sans-serif throughout, palette neutral + biru aksen, border-driven (no shadow), table-first layouts.

## Colors

Skema **slate + blue accent**, light mode default (terminal/IDE persona biasa light atau auto). Dark mode V2.

- **Primary** (#2563EB): CTA utama (Mulai Sync, Simpan), link aktif, focus accent.
- **Primary Hover** (#1D4ED8): hover state CTA.
- **Primary Active** (#1E40AF): pressed state.
- **Secondary** (#475569): tombol sekunder, ikon non-aktif, label.
- **Background** (#FFFFFF): page background, card surface.
- **Surface Subtle** (#F8FAFC): zebra striping tabel, hover row, sidebar bg.
- **Border** (#E2E8F0): default border, divider.
- **Border Strong** (#CBD5E1): emphasis border (focused card, selected tab).
- **Text Primary** (#0F172A): heading, body utama.
- **Text Secondary** (#475569): meta, helper, label.
- **Text Muted** (#94A3B8): timestamp, count caption.
- **Success** (#16A34A): status `done`, `OK`, `Siap` badge.
- **Warning** (#D97706): `Draft`, `untested >24h`, drift advisory.
- **Error** (#DC2626): `failed`, schema drift blocking, validation error.
- **Info** (#0891B2): `running`, `interrupted`, `cancelled` (neutral).

**Domain-status mapping** (gunakan literal, jangan invent warna baru):
| Status | Warna | Background badge | Text badge |
|---|---|---|---|
| `running` | Info | #ECFEFF | #0E7490 |
| `done` | Success | #DCFCE7 | #15803D |
| `interrupted` | Warning | #FEF3C7 | #92400E |
| `failed` | Error | #FEE2E2 | #991B1B |
| `cancelled` | Muted | #F1F5F9 | #475569 |
| Profile `draft` | Warning | #FEF3C7 | #92400E |
| Profile `ready` | Success | #DCFCE7 | #15803D |
| Connection `untested` | Muted | #F1F5F9 | #475569 |
| Connection `ok` | Success | #DCFCE7 | #15803D |
| Connection `failed` | Error | #FEE2E2 | #991B1B |

## Typography

Sans-serif satu keluarga, mono untuk angka/identifier. Tidak ada serif (pertimbangkan: Lora bukan untuk laporan ops).

- **Sans Font**: Inter (variabel, fallback `system-ui, -apple-system, "Segoe UI", sans-serif`).
- **Mono Font**: JetBrains Mono (fallback `ui-monospace, SFMono-Regular, "Menlo", monospace`). Untuk: PK, error code MariaDB, timestamp ISO, JSON snippet, nama tabel/kolom.

Skala (rem; root 16px):
- **Display**: 28px / 1.2 / 600 — hanya halaman sambutan first-run + judul Session detail.
- **H1**: 22px / 1.3 / 600 — judul halaman.
- **H2**: 18px / 1.35 / 600 — section header (mis. "Koneksi", "Sync Sessions").
- **H3**: 15px / 1.4 / 600 — sub-section, card title.
- **Body**: 14px / 1.55 / 400 — default.
- **Body Strong**: 14px / 1.55 / 500 — label form, kolom tabel header.
- **Small**: 13px / 1.5 / 400 — helper, meta.
- **Caption**: 12px / 1.4 / 500 — badge, timestamp, count.
- **Mono**: 13px / 1.5 / 400 — kode/identifier inline; **12px** dalam tabel padat.

## Spacing

Base unit **4px**, skala: 2, 4, 8, 12, 16, 20, 24, 32, 48.
- **Component padding**: 8px (compact), 12px (default), 16px (large).
- **Section gap**: 24px (mobile), 32px (tablet), 40px (desktop).
- **Table cell padding**: 8px 12px (default), 6px 10px (dense — Mapping Builder, Sync Log).

## Border Radius

- **Sharp** (0px): table cell, divider.
- **Small** (4px): badge, chip, input, button — **default**.
- **Medium** (6px): card, dropdown menu, dialog.
- **Large** (8px): hanya modal besar (Rule editor).
- **Full** (9999px): avatar (V2), dot indicator status (8px).

## Elevation

Flat. Border-driven seperti `WEB_RULES.md` philosophy.
- **Subtle**: `border: 1px #E2E8F0`.
- **Emphasis**: `border: 1px #CBD5E1` + `bg: #F8FAFC`.
- **Overlay** (dialog/popover only): `box-shadow: 0 8px 24px rgba(15,23,42,0.08), 0 2px 4px rgba(15,23,42,0.04)` + `border: 1px #E2E8F0`.
- **Focus ring**: `outline: 2px solid #2563EB; outline-offset: 2px;` — wajib pada semua interaktif (button, input, select, tab, accordion trigger).

## Components

Semua komponen berbasis **shadcn/ui** (Radix primitives + Tailwind). Token di sini = override theme; jangan tambah komponen baru bila shadcn punya.

### Button
- **Primary**: `bg #2563EB`, `text #FFFFFF`, `font 14px/500`, `padding 8px 16px`, `radius 4px`, `hover #1D4ED8`, `active #1E40AF`, `disabled opacity 50%`.
- **Secondary**: `bg transparent`, `text #0F172A`, `border 1px #CBD5E1`, `hover bg #F8FAFC`.
- **Ghost**: `bg transparent`, `text #475569`, `hover bg #F1F5F9`. Untuk ikon-only di toolbar.
- **Destructive**: `bg #DC2626`, `text #FFFFFF`, `hover #B91C1C`. **Wajib confirm dialog** (mis. "Bersihkan log lama", "Hapus koneksi").
- **Sizes**: `sm 28px/12px h-pad`, `md 36px/16px h-pad` (default), `lg 40px/20px h-pad`.

### Input / Select
- `bg #FFFFFF`, `border 1px #CBD5E1`, `text #0F172A`, `placeholder #94A3B8`, `radius 4px`, `padding 0 10px`, `height 36px`, `font 14px/400`.
- `focus`: `border #2563EB` + focus ring.
- `error`: `border #DC2626`, helper text `#991B1B`.
- `disabled`: `bg #F1F5F9`, opacity 60%.
- **Label**: `font 13px/500`, `color #0F172A`, top, gap 6px.
- **Helper**: `font 12px/400`, `color #475569`. Error variant: `#991B1B`.

### Badge / Status Chip
- `font 12px/500`, `padding 2px 8px`, `radius 4px`, `letter-spacing 0.01em`.
- Warna: lihat tabel **Domain-status mapping** di section Colors.
- Dot variant: dot 8px + label inline (untuk daftar Session ringkas).

### Table (data-dense)
Komponen ter-banyak dipakai. Optimasi readability vertikal.
- Header: `bg #F8FAFC`, `text #475569`, `font 12px/600 uppercase tracking-wide`, `border-bottom 1px #E2E8F0`, sortable indicator pakai chevron 12px.
- Row: `border-bottom 1px #F1F5F9`, `hover bg #F8FAFC`, `selected bg #EFF6FF`.
- Cell: `padding 8px 12px`, `font 14px/1.5`. Mono cells (PK, error code, timestamp): `font-family JetBrains Mono`, `font 13px`.
- Zebra: opsional via `even:bg-#F8FAFC` — gunakan untuk tabel ≥10 row.
- Empty state: pesan ramah Bahasa Indonesia + ikon 24px (lucide), jangan tampilkan tabel header tanpa data.

### Tabs (Mapping Builder)
- Sidebar layout (vertical tabs) untuk Mapping Builder per ADR/CONTEXT — `width 240px`, `bg #F8FAFC`, item `padding 8px 12px`, `radius 4px`, active: `bg #FFFFFF` + `border-left 2px #2563EB`.
- Top tabs (untuk Settings dll): underline-style. `border-bottom 2px transparent`, active `border-bottom 2px #2563EB`, hover `text #2563EB`.

### Accordion (Sync Log group-by)
- Trigger: `padding 12px 16px`, `bg #F8FAFC`, hover `bg #F1F5F9`, expanded `bg #FFFFFF` + `border-bottom 1px #E2E8F0`.
- Count chevron: monospace count di kanan (`8.231 baris`), chevron rotate 180° saat expanded.

### Dialog
- Overlay: `bg rgba(15,23,42,0.5)`.
- Container: `bg #FFFFFF`, `radius 8px`, `max-width 560px` (default) / `720px` (Rule editor), `padding 20px 24px`.
- Header: H2, divider 1px bottom, close icon 16px ghost button.
- Footer: justify-end, gap 8px, primary action kanan.

### Toast (error/success notification)
- Position: top-right, max 3 visible, auto-dismiss 5dtk (success) / 8dtk (error) / sticky (destructive).
- Body: 14px/1.5, ikon 16px kiri, close × 12px kanan.
- Variant warna ikuti **Domain-status mapping**.

### Skeleton
Wajib untuk loading state >300ms (WEB_RULES a11y MUST). Bg `#E2E8F0` + shimmer `linear-gradient(90deg, transparent, #F1F5F9, transparent)` 1.5s linear infinite. Match shape komponen aslinya (table row skeleton, card skeleton).

### Progress (SSE)
- Determinate bar: height 8px, `bg #E2E8F0`, fill `bg #2563EB`, `radius 4px`.
- Numeric label: `{processed} / {total} baris ({percentage}%)` mono inline.
- Per-tabel breakdown (Sync Session detail): list dengan dot status + bar mini per tabel.

## Iconography

**lucide-react** sudah di `package.json`. Ukuran: 14px (inline mono), 16px (default button/input), 20px (toolbar), 24px (empty state). Stroke 1.5px. Warna inherit dari context (`currentColor`).

Padanan domain ↔ icon:
- Source/Destination koneksi: `database`
- Mapping Profile: `git-branch` (DAG closure visual metaphor)
- Sync Session: `play-circle` (running), `check-circle-2` (done), `pause-circle` (interrupted/cancelled), `alert-triangle` (failed)
- Closure Advisor dialog: `git-fork`
- Rule editor: `wand-2`
- CSV export: `download`
- Settings: `settings-2`

## Layout patterns

- **Page width**: max 1280px (`mx-auto px-6`). App utility, bukan marketing.
- **Sidebar nav**: 200–240px fixed. Tidak collapsible V1.
- **Content area**: 1 kolom default; 2 kolom (sidebar tabs + body) untuk Mapping Builder per CONTEXT.md L89.
- **Empty state**: card-style `border 1px #E2E8F0 + bg #F8FAFC`, ikon 24px, judul H3, body 14px Bahasa Indonesia, primary CTA. First-run dashboard pakai pola 3-card progress per CONTEXT.md L101.

## Do's and Don'ts

- **Do** tampilkan error code MariaDB asli (`1452`, `1062`) di Sync Log — persona ops sering ngegoogle code itu langsung.
- **Do** pakai mono font untuk identifier (table.column, PK value, timestamp). Membantu copy-paste presisi.
- **Do** group status semantik: `done` selalu hijau, `failed` selalu merah, `running`/`interrupted`/`cancelled` neutral biru/abu-abu (bukan kuning panik).
- **Do** munculkan timestamp absolut + relatif (`2026-05-10 14:32 UTC · 3 jam lalu`) — persona kerja lintas-zone.
- **Do** keep total color count low: max 6 chip warna distinct di 1 layar. Kalau >6, ada drift terminologi.
- **Don't** pakai gradient/glow/animation lib (Framer Motion overkill di V1; transition 150ms ease cukup).
- **Don't** pakai serif font untuk apa pun — tool ops bukan editorial.
- **Don't** tampilkan loading spinner full-screen >500ms; pakai skeleton match shape.
- **Don't** sembunyikan technical detail di balik layer "user-friendly" tanpa toggle. Persona ops butuh akses ke pesan MariaDB asli + nama tabel/kolom asli untuk troubleshoot — friendly message **menambah** konteks, tidak **menggantikan**.
- **Don't** invent warna baru di luar tabel **Domain-status mapping**. Kalau butuh status baru, tambah di tabel ini dulu, bukan inline `bg-purple-200` di komponen.
- **Don't** pakai countdown / urgency tactics — sync session berjalan di waktu sendiri, biarkan progress bar bicara.

## Ringkasan token (untuk Tailwind config)

```ts
// tailwind.config.ts (excerpt)
theme: {
  extend: {
    colors: {
      primary: { DEFAULT: '#2563EB', hover: '#1D4ED8', active: '#1E40AF' },
      surface: { DEFAULT: '#FFFFFF', subtle: '#F8FAFC' },
      border: { DEFAULT: '#E2E8F0', strong: '#CBD5E1' },
      text: { DEFAULT: '#0F172A', secondary: '#475569', muted: '#94A3B8' },
      success: '#16A34A',
      warning: '#D97706',
      error: '#DC2626',
      info: '#0891B2',
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
    },
    borderRadius: { sm: '4px', md: '6px', lg: '8px' },
  },
}
```
