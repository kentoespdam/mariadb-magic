# Urutan Claim Issues — Selection ⇄ Pairings Invariant

Epic: **`mariadb-magic-8fl`** · GH: **#19**

Tujuan: tegakkan invariant bahwa **Selection Set adalah scope authoritative** — pairings & rules WAJIB ⊆ selection. Profile tidak boleh naik ke `ready` dengan selection kosong atau pairings orphan.

Untuk **agen lokal**: ikuti urutan ini step-by-step. Jangan loncat. Setiap issue dieksekusi dengan **TDD** (Red → Green → Refactor). Test ditulis DULUAN.

---

## Aturan main (WAJIB baca sebelum klaim)

1. **Sumber kebenaran** (truth order, AGENTS.md): ADR > kode > `CONTEXT.md` > `plan/DECISIONS-Q1-Q60.md` > dokumen ini.
2. **Setiap issue WAJIB TDD**: tulis test gagal dulu, baru implementasi.
3. **JANGAN refactor di luar scope**. Ubah hanya file yang disebut di issue.
4. **JANGAN tambah dependency baru** (Go module / npm).
5. **File cap**: ≤100 baris (cap absolut 120). Cek `wc -l <file>` setelah edit.
6. **Pesan error ke user**: Bahasa Indonesia. Identifier kode: English.
7. **Envelope error API**: WAJIB `WriteError` (Q44), bukan `http.Error`.
8. **Kalau ragu tentang library/syntax**: STOP, jalankan `context7-mcp`. Jangan improvisasi.
9. **Kalau temukan bug lain**: buka issue baru, jangan fix in-place.
10. **Session close**: `git pull --rebase` → `bd dolt push` → `git push`. Update checklist di file ini.

---

## Sequence

Status legend: `[ ]` belum mulai · `[~]` in progress · `[x]` selesai · `[!]` blocked

### Tahap 1 — Gate akhir (paling kritis)

- [x] **L1** — `mariadb-magic-8fl.1` / **gh-20** — BE validator guard
  - File: `internal/repo/mapping_profiles.go`, `tests/repo/mapping_profiles_test.go`
  - Estimasi: 45 menit
  - Tidak ada blocker

### Tahap 2 — Tutup jalur UI (paralel dengan L3)

- [x] **L2** — `mariadb-magic-8fl.2` / **gh-21** — FE sidebar pakai selection
  - File: `web/src/app/profiles/_components/builder/ProfileDetailClient.tsx`
  - Estimasi: 30 menit
  - Blocked by: **L1 selesai** (supaya regression di BE sudah aman lebih dulu)

- [x] **L3** — `mariadb-magic-8fl.3` / **gh-22** — BE UpdatePairings defense-in-depth
  - File: `internal/api/profiles_extra.go`, `tests/api/profiles_pairings_test.go`
  - Estimasi: 45 menit
  - Related to L1 (file BE berbeda — aman paralel)

### Paralelisasi

- Kalau hanya 1 agen: **L1 → L2 → L3** (urut).
- Kalau 2 agen setelah L1 selesai: L2 (FE) dan L3 (BE) **paralel**, file beda.

---

## Per-issue checklist agen

Sebelum klaim issue **apa pun**, agen WAJIB:

```bash
# 1. Pull bead terbaru
bd dolt pull   # atau: bd sync

# 2. Cek issue ready
bd ready

# 3. Klaim issue
bd update <id> --claim

# 4. Baca detail
bd show <id>

# 5. Baca dokumen referensi yang disebut di issue
```

Sesudah implementasi:

```bash
# Test (sesuai bahasa file)
go test -race ./...           # untuk L1, L3
cd web && bun run lint && bun run test   # untuk L2

# Verifikasi file size
wc -l <file-yang-diedit>      # WAJIB ≤120

# Update graphify (kalau ada perubahan struktur)
graphify update .

# Tutup issue
bd close <id>

# Sync & push
git add -A
git commit -m "fix(selection): <ringkasan>"
git pull --rebase
bd dolt push
git push

# Update checklist di file ini → mark [x]
```

---

## Quick refs

| Konsep | File / Endpoint | Catatan |
|---|---|---|
| Validator gate akhir | `internal/repo/mapping_profiles.go:157` `ValidateProfileForReady` | L1 |
| MarkReady handler | `internal/api/profiles_extra.go:55` `MarkReady` | JANGAN ubah; cukup validator-nya |
| UpdatePairings handler | `internal/api/profiles_extra.go:17` `UpdatePairings` | L3 |
| Sidebar builder | `web/src/app/profiles/_components/builder/ProfileDetailClient.tsx:77` | L2 |
| Selection shape | `internal/models/mapping_profile.go` `TableSelection` | `{tables: []string}` |
| Pairings shape | `internal/models/mapping_profile.go` `ProfileMappings` | `tables: [{table_name, column_pairs}]` |
| Closure output | `internal/sync/closure.go` `TableWithRole` | `{Name, Role}` Role ∈ `user_selected`\|`advisor_added` |
| Envelope error | `internal/api/errors.go` `WriteError` | Q44 |
| Loading variants | `web/src/components/LoadingBoundary.tsx` | Q46 |

---

## Reproduksi bug (sebelum & sesudah fix)

```bash
# 1. Setup DB dengan profile bug
sqlite3 ~/.../magicsync.db <<SQL
UPDATE mapping_profiles
SET selection_json='{"tables":[]}',
    column_pairings_json='{"tables":[{"table_name":"customers","column_pairs":[...]}]}',
    status='draft'
WHERE id='<some-id>';
SQL

# 2. Trigger MarkReady
curl -X POST http://127.0.0.1:8080/api/profiles/<some-id>/mark-ready \
  -H 'Content-Type: application/json' -d '{}'

# SEBELUM fix: 200, profile naik ke 'ready'  ← BUG
# SESUDAH L1:  400, envelope error "Selection kosong: ..."
```

---

## Selesai-criteria epic

Epic `mariadb-magic-8fl` boleh ditutup ketika:

- [x] L1, L2, L3 semua `closed`
- [x] `go test -race ./...` hijau (full suite)
- [x] `cd web && bun run lint && bun run test` hijau
- [x] Manual repro bug → 400 di MarkReady (L1) dan 400 di UpdatePairings (L3)
- [x] UI: tidak ada cara buka PairingEditor untuk tabel di luar selection (L2)
- [x] `CONTEXT.md` di-update di section `## Recent fixes` (1-2 baris ringkas)

---

## Cek status real-time

```bash
bd show mariadb-magic-8fl      # detail epic
bd dep tree mariadb-magic-8fl  # visualisasi tree
bd ready                       # apa yang siap dikerjakan
gh issue view 19               # GH epic
```
