# Urutan Claim Issues — Magic MariaDB Sync V1

Urutan topologis berdasarkan dependency graph (`bd show <id>`). Klaim dari atas ke bawah; satu issue baru bisa diklaim setelah semua blocker-nya `closed`.

Perintah klaim: `bd update <id> --claim` · Tutup: `bd close <id>`

## Fondasi (M1)

- [x] 1. `mariadb-magic-bzg` — Bootstrap binary + embedded UI shell _(no blockers)_
- [x] 2. `mariadb-magic-bot` — SQLite migrations + self-heal _(← bzg)_
- [x] 3. `mariadb-magic-58b` — Single-instance lock per data directory _(← bzg)_

## Koneksi & Introspeksi (M2)

- [x] 4. `mariadb-magic-n2x` — Credential mode wizard + AES-GCM key provider _(← bot)_ ✓
- [x] 5. `mariadb-magic-wr1` — Connection CRUD + Test+Save split UI _(← n2x)_ ✓
- [x] 6. `mariadb-magic-czf` — Schema introspection endpoint _(← wr1)_ ✓

## Mapping & Rules (M3)

- [x] 7. `mariadb-magic-vj0` — Mapping Profile CRUD with draft status _(← czf)_ ✓
- [x] 8. `mariadb-magic-bz3` — Closure Advisor (compile-time FK closure) _(← vj0)_ ✓
- [x] 9. `mariadb-magic-mf4` — Column Pairing builder (per-table tabs UI) _(← bz3)_ ✓
- [x] 10. `mariadb-magic-e76` — Rule editor + 5 rule types + Sample Preview _(← mf4)_ ✓
- [x] 11. `mariadb-magic-4jr` — Cross-profile collision check on save _(← mf4)_ ✓
- [x] 12. `mariadb-magic-5xh` — Preflight (schema drift) _(← e76, 4jr)_ ✓

## Sync Engine (M4)

- [x] 13. `mariadb-magic-1qv` — Whole-table chunked Source-wins UPSERT _(← 5xh)_ ✓
- [ ] 14. `mariadb-magic-k1a` — Sync runner + session lifecycle + global lock _(← 1qv)_
- [ ] 15. `mariadb-magic-4xf` — Cooperative Cancel (chunk-boundary) _(← k1a)_
- [ ] 16. `mariadb-magic-x73` — Per-row error → ToFriendly + sync_logs _(← k1a)_
- [ ] 17. `mariadb-magic-f5r` — SSE broker + events _(← k1a, x73, 4xf)_

## UI Sync & Observability (M5)

- [ ] 18. `mariadb-magic-sxo` — Sync Run UI page (start/progress/cancel) _(← f5r, mf4)_
- [ ] 19. `mariadb-magic-j1d` — Sync Log UI accordion _(← x73, sxo)_
- [ ] 20. `mariadb-magic-9ip` — CSV export per-session + per-group _(← j1d)_
- [ ] 21. `mariadb-magic-n60` — First-run dashboard (three-card) _(← sxo)_
- [ ] 22. `mariadb-magic-qoh` — Retention + Settings/Health page _(← x73, 9ip)_

## Distribusi (M8)

- [ ] 23. `mariadb-magic-7tj` — Distribution build pipeline _(← n60, qoh)_

---

**Catatan paralelisasi:** Setelah `bzg` close, `bot` & `58b` bisa jalan paralel. Setelah `mf4` close, `e76` & `4jr` paralel. Setelah `k1a` close, `4xf` & `x73` paralel. Sisanya rantai linier.

**Cek status real-time:** `bd ready` (yang siap dikerjakan) · `bd blocked` (yang masih ke-block).
