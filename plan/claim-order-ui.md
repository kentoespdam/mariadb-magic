# Urutan Pengerjaan Issue UI Rebuild - Magic MariaDB Sync

Urutan topologis berdasarkan dependency graph (`bd show <id>`). Klaim dari atas ke bawah; satu issue baru bisa diklaim setelah semua blocker-nya `closed`.

Perintah klaim: `bd update <id> --claim` · Tutup: `bd close <id>`

## Setup & Konfigurasi Dasar

- [ ] 1. `mariadb-magic-0ll` — Setup Project Structure and Configuration _(no blockers)_
- [ ] 2. `mariadb-magic-nb7` — Implement Design System Integration _(← 0ll)_
- [ ] 3. `mariadb-magic-b5b` — Implement Routing System _(← 0ll)_
- [ ] 4. `mariadb-magic-x8a` — Implement UI Components for Core Features _(← 0ll)_
- [ ] 5. `mariadb-magic-4pf` — Implement State Management with SWR _(← 0ll)_
- [ ] 6. `mariadb-magic-75o` — Implement Tooling with Biome _(← 0ll)_
- [ ] 7. `mariadb-magic-jxt` — Implement Testing Framework _(← 0ll)_

## Fitur Utama - Level 1

- [ ] 8. `mariadb-magic-hl4` — Implement Mapping Profile Builder _(← 0ll, 4pf, x8a)_
- [ ] 9. `mariadb-magic-7z4` — Implement Accessibility Features _(← 0ll, nb7)_

## Fitur Utama - Level 2

- [ ] 10. `mariadb-magic-cwl` — Implement Session Monitoring _(← 0ll, 4pf, x8a, nb7, b5b)_

## Catatan

**Ketergantungan:**
- Semua issue level 1 bergantung pada issue setup dasar (0ll)
- Issue Mapping Profile Builder (hl4) memerlukan setup dasar + state management + UI components
- Issue Accessibility Features (7z4) memerlukan setup dasar + design system
- Issue Session Monitoring (cwl) memerlukan hampir semua komponen dasar

**Paralelisasi:**
Setelah `0ll` selesai, issue 2-7 dapat dikerjakan secara paralel karena saling independen.
Issue 8-10 harus menunggu issue level sebelumnya selesai terlebih dahulu.

**Status Real-time:**
`bd ready` (yang siap dikerjakan) · `bd blocked` (yang masih ke-block).