# Urutan Pengerjaan Issue UI Rebuild - Magic MariaDB Sync

Urutan topologis berdasarkan dependency graph (`bd show <id>`). Klaim dari atas ke bawah; satu issue baru bisa diklaim setelah semua blocker-nya `closed`.

Perintah klaim: `bd update <id> --claim` · Tutup: `bd close <id>`

## Track 1 — Setup & Konfigurasi Dasar (lama)

- [x] 1. `mariadb-magic-0ll` — Setup Project Structure and Configuration _(no blockers)_
- [x] 2. `mariadb-magic-nb7` — Implement Design System Integration _(← 0ll)_
- [x] 3. `mariadb-magic-b5b` — Implement Routing System _(← 0ll)_
- [x] 4. `mariadb-magic-x8a` — Implement UI Components for Core Features _(← 0ll)_
- [x] 5. `mariadb-magic-4pf` — Implement State Management with SWR _(← 0ll)_
- [x] 6. `mariadb-magic-75o` — Implement Tooling with Biome _(← 0ll)_
- [ ] 7. `mariadb-magic-jxt` — Implement Testing Framework _(← 0ll)_ — **DEPRECATED, di-supersede oleh T1#16**

## Fitur Utama - Level 1 (lama)

- [x] 8. `mariadb-magic-hl4` — Implement Mapping Profile Builder _(← 0ll, 4pf, x8a)_
- [x] 9. `mariadb-magic-7z4` — Implement Accessibility Features _(← 0ll, nb7)_

## Fitur Utama - Level 2 (lama)

- [x] 10. `mariadb-magic-cwl` — Implement Session Monitoring _(← 0ll, 4pf, x8a, nb7, b5b)_

---

## Track 2 — Q1-Q60 Grilling (epic `mariadb-magic-7x4`)

Hasil session `/grill-with-docs` lock 60 keputusan + 22 amendment. Truth: `plan/DECISIONS-Q1-Q60.md`. Epic: `mariadb-magic-7x4`.

### Ready paralel (no blocker antar grup)

- [x] T1#1 `mariadb-magic-7x4.1` — Pindahkan SSE endpoint ke `/api/sse/{id}` _(no blocker)_
- [x] T1#2 `mariadb-magic-7x4.2` — Drift surfaces via Preflight endpoint _(no blocker)_
- [x] T1#3 `mariadb-magic-7x4.3` — Connection Update skip password jika empty _(no blocker)_
- [x] T1#4 `mariadb-magic-7x4.4` — Connection GET omit PasswordCiphertext _(no blocker)_
- [x] T1#5 `mariadb-magic-7x4.5` — Connection Delete cascade + running-session guard _(← T1#9)_
- [x] T1#6 `mariadb-magic-7x4.6` — Session logs paginated endpoint _(← T1#9)_
- [x] T1#7 `mariadb-magic-7x4.7` — UpdatePairings auto-set status draft _(← T1#9)_
- [x] T1#8 `mariadb-magic-7x4.8` — WEB_RULES.md viewport policy section _(docs only)_
- [x] T1#9 `mariadb-magic-7x4.9` — `internal/api/errors.go` + envelope refactor + correlation middleware **[P1 kritis]** _(no blocker)_
- [x] T1#10 `mariadb-magic-7x4.10` — FE error surface layering _(← T1#17)_
- [x] T1#11 `mariadb-magic-7x4.11` — LoadingBoundary wrapper 6 variants _(no blocker)_
- [x] T1#12 `mariadb-magic-7x4.12` — next-themes + dual CSS + DESIGN.md dark palette _(no blocker)_
- [x] T1#13 `mariadb-magic-7x4.13` — Command palette cmdk _(← T1#17)_
- [x] T1#14 `mariadb-magic-7x4.14` — Forms RHF + Zod via shadcn Form _(← T1#10)_
- [x] T1#15 `mariadb-magic-7x4.15` — axe-core dev + a11y docs _(no blocker)_
- [x] T1#16 `mariadb-magic-7x4.16` — Vitest setup _(no blocker)_
- [x] T1#17 `mariadb-magic-7x4.17` — `lib/apiClient` + services **[P1 kritis]** _(← T1#9, T1#4)_
- [x] T1#18 `mariadb-magic-7x4.18` — Makefile + embed-check _(no blocker)_
- [x] T1#19 `mariadb-magic-7x4.19` — config loader + godotenv **[P1 kritis]** _(no blocker)_
- [x] T1#20 `mariadb-magic-7x4.20` — SWR optimistic mutations _(← T1#17)_
- [x] T1#21 `mariadb-magic-7x4.21` — `<Link prefetch={false}>` di heavy routes _(no blocker)_
- [x] T1#22 `mariadb-magic-7x4.22` — Prometheus metrics + system info _(← T1#9, T1#17, T1#19)_

## Catatan

**Wajib baca sebelum klaim**:
1. `plan/DECISIONS-Q1-Q60.md` — minimal section Q yang di-reference issue.
2. `AGENTS.md` section `[TOOLING_MANDATE]` + `[SESSION_CLOSE]`.
3. Issue description sendiri (acceptance criteria + langkah).

**Tooling mandate**:
- `graphify query` SEBELUM grep / read mass file.
- `context7` mandatory untuk library API/syntax (Next.js, Tailwind v4, shadcn, RHF, zod, cmdk, next-themes, SWR, Vitest, Prometheus, godotenv).
- New module → skill `tdd`.

**Status real-time**:
- `bd ready` — yang siap dikerjakan.
- `bd blocked` — yang masih ke-block.
- `bd show mariadb-magic-7x4` — status epic + child progress.
- `bd children mariadb-magic-7x4` — list child issues epic.

**Session close protocol** (per AGENTS.md):
1. `git pull --rebase`
2. `bd dolt push`
3. `git push`
4. Update checklist file ini.
