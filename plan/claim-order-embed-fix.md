# Urutan Pengerjaan Issue Fix Embed Web Build - Magic MariaDB Sync

Urutan topologis berdasarkan dependency graph (`bd show <id>`). Klaim dari atas ke bawah; satu issue baru bisa diklaim setelah semua blocker-nya `closed`.

Perintah klaim: `bd update <id> --claim` · Tutup: `bd close <id>`

## Track 3 — Fix Embed Web Build (epic `mariadb-magic-ew6`)

Bug ditemukan 2026-05-11: binary produksi pada port 8080 tampil tanpa CSS dan navigasi mati, sementara dev mode (`bun dev`) normal. Dua akar masalah: (1) handler `/` di `cmd/magicsync/main.go` selalu balas `out/index.html` untuk semua path non-`/api/`, sehingga request `/_next/static/*` (CSS/JS/font) dijawab dengan HTML dan browser menolaknya; (2) hanya `web/src/app/page.tsx` yang ada — route `/connections`, `/profiles/new`, `/sessions/new` yang di-link dashboard belum dibuat.

Epic: `mariadb-magic-ew6`.

### Urutan klaim

- [ ] 1. `mariadb-magic-ew6.1` **[P0 kritis]** — Serve static asset embed dari `out/_next` dengan MIME benar + SPA fallback _(no blocker)_
- [ ] 2. `mariadb-magic-ew6.2` — Buat halaman Next.js untuk route navigasi dashboard: `/connections`, `/profiles/new`, `/sessions/new` _(← ew6.1)_

## Catatan

**Wajib baca sebelum klaim**:
1. `AGENTS.md` section `[TOOLING_MANDATE]` + `[SESSION_CLOSE]` + `[CODE_RULES]`.
2. `plan/PRD-Rebuild-UI-FE.md` — TRUTH untuk scope tiap halaman tujuan navigasi.
3. Issue description sendiri (acceptance criteria + design notes).

**Tooling mandate**:
- `graphify query` SEBELUM grep / read mass file.
- `context7` mandatory untuk library API/syntax (Next.js App Router, Go `embed.FS`, `http.FileServerFS`, `fs.Sub`).
- File ≤120 baris; pecah komponen bila perlu.

**Verifikasi acceptance ew6.1**:
- `curl -I http://127.0.0.1:8080/_next/static/chunks/<hash>.css` → `Content-Type: text/css`.
- `curl -I http://127.0.0.1:8080/_next/static/chunks/<hash>.js` → `Content-Type: application/javascript`.
- Dashboard di browser identik dengan dev mode (Tailwind/shadcn ter-apply).
- Route SPA tanpa file fisik tetap fallback ke `index.html`.

**Verifikasi acceptance ew6.2**:
- `web/src/app/connections/page.tsx`, `profiles/new/page.tsx`, `sessions/new/page.tsx` ter-build oleh `bun build`.
- Klik tombol dashboard membuka halaman tujuan tanpa kembali ke dashboard.
- Tiap halaman minimal kerangka sesuai `PRD-Rebuild-UI-FE.md`.

**Status real-time**:
- `bd ready` — yang siap dikerjakan.
- `bd blocked` — yang masih ke-block.
- `bd show mariadb-magic-ew6` — status epic + child progress.
- `bd children mariadb-magic-ew6` — list child issues epic.

**Session close protocol** (per AGENTS.md):
1. `git pull --rebase`
2. `bd dolt push`
3. `git push`
4. Update checklist file ini.
