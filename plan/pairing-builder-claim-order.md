# Urutan Claim Issues — Pairing Builder UI

Epic: **`mariadb-magic-5vq`** — Pairing Builder UI lengkap (`/profiles/[id]`).

Backend untuk pairing antar database **sudah final** (`internal/api/profiles.go` + `internal/rules/` + `internal/sync/preflight/`). Pekerjaan di epic ini **FE-only**: bangun halaman builder di `web/src/app/profiles/[id]/` yang konsumsi endpoint existing.

Urutan topologis berdasarkan `bd show <id>`. Klaim dari atas; satu issue baru bisa diklaim setelah semua blocker-nya `closed`.

Perintah klaim: `bd update <id> --claim` · Tutup: `bd close <id>`

## Aturan main (WAJIB baca sebelum klaim)

1. **JANGAN ubah backend.** Endpoint, model, repo, rules, preflight — semua final.
2. **JANGAN ubah service signature existing** di `web/src/lib/services/profiles.ts`. Hanya tambah method baru bila benar-benar perlu (Issue 4).
3. **JANGAN port `web/src.old/` wholesale.** Itu legacy. Bangun fresh mengikuti pattern `web/src/app/connections/` & `web/src/app/sessions/`.
4. **JANGAN tambah library baru** (state mgmt, date picker, drag-drop, virtualizer). Datasets kecil, native DOM cukup.
5. **JANGAN generalize early.** DRY at 2nd duplicate (CODE_RULES). ≤100 lines/file (cap 120).
6. Kalau temukan bug BE saat integrasi → **buka issue terpisah**, jangan fix in-place.
7. Test reuse Playwright MCP fixtures di `tests/` (lihat playbook `mariadb-magic-muu.4` yang sudah close).

## Sequence

- [ ] 1. `mariadb-magic-5vq.1` — Route shell `/profiles/[id]` + `ProfileHeader` + 404 _(no blockers)_
- [ ] 2. `mariadb-magic-5vq.2` — `TablePicker` — Selection Set editor _(← 5vq.1)_
- [ ] 3. `mariadb-magic-5vq.3` — `PairingEditor` — column pairing per tabel _(← 5vq.2)_
- [ ] 4. `mariadb-magic-5vq.4` — `RuleEditor` — 5 tipe rule + preview live _(← 5vq.3)_
- [ ] 5. `mariadb-magic-5vq.5` — `MarkReadyButton` + `ValidationErrorPanel` + `CollisionPanel` _(← 5vq.3)_
- [ ] 6. `mariadb-magic-5vq.6` — `PreflightPanel` — drift report read-only _(← 5vq.3)_
- [ ] 7. `mariadb-magic-5vq.7` — `/profiles` list route + `ProfileListTable` _(← 5vq.1)_

## Catatan paralelisasi

- Setelah `5vq.1` close: `5vq.2` & `5vq.7` bisa jalan paralel (list page independen dari builder).
- Setelah `5vq.3` close: `5vq.4`, `5vq.5`, `5vq.6` bisa jalan paralel (3 fitur orthogonal yang attach ke detail page).
- `5vq.4` (rule) & `5vq.6` (preflight) tidak saling blocking, tapi `5vq.5` (mark-ready) idealnya last karena dia yang verifikasi end-to-end flow.

## Quick refs

| Konsep | File / Endpoint | Catatan |
|---|---|---|
| Schema fetch | `GET /api/profiles/{id}/schema` → `SchemaResponse` | Sudah pakai `ClosureAdvisor` |
| Save pairing | `POST /api/profiles/{id}/pairings` | Auto-downgrade `ready`→`draft` |
| Mark ready | `POST /api/profiles/{id}/mark-ready` | Validate + collision (ADR-0007) |
| Drift | `GET /api/profiles/{id}/preflight` | ADR-0006 |
| Rule preview | `POST /api/preview/rule` | 5 tipe whitelist final |
| Service FE | `web/src/lib/services/profiles.ts` | `getSchema`, `updatePairings`, `markReady`, `preflight` siap |
| Model JSON | `internal/models/mapping_profile.go` | Shape `ProfileMappings`, `ColumnPairing` |

## Cek status real-time

```
bd show mariadb-magic-5vq      # detail epic
bd dep tree mariadb-magic-5vq  # visualisasi tree
bd ready                       # apa yang siap dikerjakan
```

## Sumber kebenaran (truth order, dari AGENTS.md)

ADR > kode > `CONTEXT.md` > dokumen ini > `plan/PRD-Rebuild-UI-FE.md`. Kalau ada konflik dengan ADR/kode, ADR/kode menang — update issue note lewat `bd update <id> --append-notes "..."`.
