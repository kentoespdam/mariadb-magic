# Architecture Decision Records

Dokumen status & navigasi untuk semua ADR. Format kompatibel dengan [adr-tools](https://github.com/npryce/adr-tools) (markdown link list — `adr generate toc` bisa regenerate isi tabel di bawah).

**Status legend:**
- ✅ **Accepted** — keputusan aktif, mengikat implementasi
- 🔁 **Superseded by ADR-NNNN** — digantikan keputusan lebih baru
- 📝 **Proposed** — sedang dibahas (belum ada di V1)

**Truth ranking** (`AGENTS.md [TRUTH]`): ADR > `ARCHITECTURE.md` > `CONTEXT.md` > `plan/prd.md`. ADR override semua.

---

## Index

| ID | Judul | Status | Kategori |
|---|---|---|---|
| [0001](0001-jit-as-compile-time-closure-advisor.md) | JIT Parent Sync sebagai Closure Advisor compile-time, bukan rekursi runtime | 🔁 Superseded by [0015](0015-closure-advisor-dual-side-fk-runtime-1452-fallback.md) | Closure Advisor |
| [0002](0002-self-ref-fk-via-disabled-checks.md) | Self-ref FK didukung via `FOREIGN_KEY_CHECKS=0` per-tabel; cycle antar-tabel ditolak | ✅ Accepted | Closure Advisor |
| [0003](0003-chunk-transaction-with-per-row-fallback.md) | Chunk-level transaction dengan fallback per-row + klasifikasi error infra/data | ✅ Accepted | Sync runtime |
| [0004](0004-credential-encryption-hybrid-key-provider.md) | Credential encryption: hybrid KeyProvider (OS keystore default, passphrase opt-in) | ✅ Accepted | Crypto / credential |
| [0005](0005-sse-snapshot-on-connect-no-replay.md) | SSE reconnect: snapshot-on-connect, tanpa event replay | ✅ Accepted | SSE / progress |
| [0006](0006-schema-drift-hybrid-preflight.md) | Schema drift detection: hybrid pre-flight struktural + runtime type | ✅ Accepted | Preflight / drift |
| [0007](0007-cross-profile-collision-hard-fail.md) | Cross-profile collision: hard-fail saat save Mapping Profile | ✅ Accepted | Mapping Profile |
| [0008](0008-profile-snapshot-on-session-start.md) | Mapping Profile mutable + snapshot beku di Sync Session | ✅ Accepted | Mapping Profile / Session |
| [0009](0009-cancel-as-cancelled-no-rollback.md) | Cancel = status `cancelled` baru, tanpa rollback | ✅ Accepted | Sync Session lifecycle |
| [0010](0010-capacity-based-eviction-with-export.md) | Retention SQLite: capacity-based eviction + export log wajib | ✅ Accepted | Retention / SQLite |
| [0011](0011-credential-mode-lazy-prompt.md) | Credential mode wizard: lazy-prompt, no auto-detection, loud passphrase warning | ✅ Accepted | Crypto / credential |
| [0012](0012-rule-dsl-whitelisted-single-unconditional.md) | Rule DSL: 5 tipe whitelisted, single-rule-per-pairing, unconditional, flat JSON | ✅ Accepted | Rule engine |
| [0013](0013-auto-increment-no-counter-intervention.md) | Destination AUTO_INCREMENT divergence: log error 1062, no counter intervention | ✅ Accepted | Sync runtime |
| [0014](0014-mapping-profile-draft-ready-layered-validation.md) | Mapping Profile lifecycle: `draft`/`ready` states with layered validation | ✅ Accepted | Mapping Profile |
| [0015](0015-closure-advisor-dual-side-fk-runtime-1452-fallback.md) | Closure Advisor: dual-side FK introspection (Source ∪ Destination) + runtime 1452 row-level fallback | ✅ Accepted | Closure Advisor |
| [0016](0016-connection-test-flow-explicit-split.md) | Connection test: explicit "Test Koneksi" + "Save" split, persisted last-test status | ✅ Accepted | Connection / UX |
| [0017](0017-db-location-same-dir-as-binary.md) | Lokasi internal SQLite: same-dir-as-binary via `os.Executable()` | ✅ Accepted | Distribusi / SQLite |
| [0018](0018-selection-set-table-level-only.md) | Selection Set granularitas tabel-level only di V1 | ✅ Accepted | Mapping Profile |
| [0019](0019-sync-session-fresh-run-only.md) | Sync Session retry: selalu fresh run, tidak ada resume dari checkpoint di V1 | ✅ Accepted | Sync Session lifecycle |
| [0020](0020-single-session-global-concurrency.md) | Concurrent Sync Sessions: single-session global di V1 | ✅ Accepted | Sync Session lifecycle |
| [0021](0021-distribusi-v1-linux-windows-skip-macos.md) | Distribusi V1: Linux + Windows unsigned, macOS ditunda V2 | ✅ Accepted | Distribusi |
| [0022](0022-single-instance-per-data-directory.md) | Single-instance lock: per data directory, bukan global | ✅ Accepted | Distribusi / SQLite |
| [0023](0023-column-pairing-non-source-options-distinct-upsert-semantics.md) | Column Pairing opsi non-Source: tiga semantik UPSERT distinct (`Kosongkan/NULL` vs `Default DB` vs `Lewati`) | ✅ Accepted | Mapping Profile |
| [0024](0024-pairing-editor-explicit-commit-per-table.md) | Pairing editor: explicit commit per tabel (bukan auto-save per kolom) — fix race yang menghilangkan entri tabel | ✅ Accepted | Mapping Profile / UX |

---

## Group by kategori

### Closure Advisor
ADR-0001 (superseded) → ADR-0015 (current). ADR-0002 menambah dukungan self-ref FK.

### Mapping Profile
ADR-0007 (cross-profile collision), ADR-0008 (snapshot beku), ADR-0014 (`draft`/`ready` lifecycle), ADR-0018 (table-level only), ADR-0023 (3 opsi non-Source), ADR-0024 (commit per tabel di Pairing editor).

### Sync runtime
ADR-0003 (chunk + per-row fallback), ADR-0013 (AUTO_INCREMENT no-intervention).

### Sync Session lifecycle
ADR-0009 (`cancelled` status), ADR-0019 (fresh run only), ADR-0020 (single-session global).

### Preflight / drift
ADR-0006 (hybrid struktural + runtime type).

### Rule engine
ADR-0012 (5 whitelist, single-per-pairing, unconditional).

### Crypto / credential
ADR-0004 (hybrid KeyProvider), ADR-0011 (lazy-prompt wizard).

### SSE / progress
ADR-0005 (snapshot-on-connect, no replay).

### Connection / UX
ADR-0016 (Test+Save split).

### Distribusi / SQLite
ADR-0010 (retention via capacity), ADR-0017 (DB same-dir-as-binary), ADR-0021 (Linux+Windows V1, macOS skip), ADR-0022 (single-instance per data dir).

---

## Tooling

ADR ditulis manual sebagai markdown. Untuk regenerate index ini di masa depan dengan otomasi:

```bash
# install adr-tools (Linux)
sudo apt install adr-tools         # atau brew install adr-tools (macOS)

# regenerate TOC dari folder ini
adr generate toc > README.toc.md
```

Tooling otomatis hanya menambah **table of contents standar**. Section "Group by kategori" + "Status legend" + tabel kategori ditulis manual — kategori = judgment call domain.

## ADR baru

Buat file `NNNN-kebab-case-title.md` dengan struktur:

```markdown
# {Judul ringkas}

{1 paragraf: konteks + keputusan}

## Considered Options

- **(A) ...** — alasan terima/tolak
- **(B) ...** *(dipilih bila relevan)*
- **(C) ...**

## Consequences

{Implikasi positif & negatif. Jangan sembunyikan trade-off.}
```

Lalu update tabel index di file ini.
