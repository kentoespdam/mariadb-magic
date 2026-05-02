# Lokasi internal SQLite: same-dir-as-binary via `os.Executable()`

File internal SQLite (`magicsync.db` + `.bak` self-heal) disimpan di **direktori yang sama dengan binary**, di-resolve via `os.Executable()` + `filepath.Dir()` saat startup. Bukan working directory (CWD), bukan OS-standard location (`%APPDATA%`, `~/.local/share/`, `~/Library/Application Support/`), bukan user-pilih saat first-run wizard. Tujuan: memenuhi janji "single-binary portable" dari PRD — user pindahkan folder berisi `magicsync` + `magicsync.db` lintas mesin/USB stick, semua state (koneksi terenkripsi, mapping profile, sync logs) ikut tanpa perlu config path.

## Considered Options

- **(A) DB di working directory** (`./magicsync.db`). Ditolak: rapuh terhadap cara user meluncurkan binary. Double-click di Windows Explorer set CWD ke folder home / System32 (tergantung shell), shortcut dengan "Start in" kosong tidak prediktabel, `cd` ke folder lain lalu `./magicsync` membuat DB lahir di tempat random. Konsekuensi: user "kehilangan" data padahal cuma berubah cara start binary. Persona non-IT tidak akan bisa diagnose.
- **(B) DB same-dir-as-binary via `os.Executable()`** *(dipilih)*. Predictable lintas OS tanpa OS-specific code path: lokasi DB selalu = lokasi binary, tidak peduli CWD atau cara launch. Kompatibel dengan janji portable + ADR-0011 mode passphrase (binary + DB pindah barengan tetap valid). Tidak menambah onboarding step. Trade-off: kalau user simpan binary di folder read-only (mis. `/usr/local/bin/` di Linux dengan binary di-copy oleh root), startup akan gagal saat write DB — tangani dengan error message ramah yang menyarankan pindah ke folder writable.
- **(C) DB di OS-standard location** (`%APPDATA%/MagicSync/` di Windows, `~/.local/share/magicsync/` di Linux via XDG, `~/Library/Application Support/MagicSync/` di macOS). Ditolak: melepas janji portable (binary di USB stick, DB di `%APPDATA%` mesin host = state tertinggal saat USB dicabut). Memerlukan code path per OS + handling XDG override + edge case Windows roaming profile. Cocok untuk aplikasi installed via installer, tidak cocok untuk single-binary "drop & run".
- **(D) User pilih lokasi DB di first-run wizard**. Ditolak: menambah onboarding step yang tidak dibutuhkan persona target ("Pilih folder data" = friction sebelum value pertama). Wizard ADR-0011 sudah ada untuk credential mode; menumpuk pertanyaan kedua (lokasi DB) untuk problem yang punya default sehat = over-engineering. Power user yang mau lokasi custom bisa pakai env var override (V2 candidate) atau pindahkan binary+DB barengan.

## Consequences

### Resolusi path saat startup (`internal/db/path.go`)

```go
package db

import (
    "fmt"
    "os"
    "path/filepath"
)

// Resolve returns the absolute path to the internal SQLite file,
// always co-located with the running binary.
func Resolve() (string, error) {
    exe, err := os.Executable()
    if err != nil {
        return "", fmt.Errorf("tidak bisa menentukan lokasi aplikasi: %w", err)
    }
    // Follow symlinks so a symlinked launcher still co-locates with the real binary.
    real, err := filepath.EvalSymlinks(exe)
    if err != nil {
        real = exe // best-effort; fallback ke path mentah
    }
    return filepath.Join(filepath.Dir(real), "magicsync.db"), nil
}
```

- `EvalSymlinks` penting karena di Linux user kadang `ln -s /opt/magicsync/magicsync ~/bin/magicsync` — tanpa eval, DB lahir di `~/bin/` (folder symlink), pindah binary tidak bawa DB. Eval = DB lahir di `/opt/magicsync/` bersebelahan dengan target nyata.
- `os.Executable()` reliable di linux/windows/darwin (tiga target di milestone M8). Tidak perlu fallback ke `os.Args[0]` (rapuh terhadap cara launch).

### Error handling untuk folder read-only

Saat `internal/db/bootstrap.go` mencoba `sql.Open` + create file, kalau `os.OpenFile` mengembalikan permission denied:

```go
// internal/db/bootstrap.go
if err := tryOpen(path); errors.Is(err, fs.ErrPermission) {
    return fmt.Errorf(
        "Aplikasi tidak bisa menulis di folder %q. "+
        "Pindahkan magicsync.exe (dan file pendamping) ke folder yang bisa ditulis "+
        "seperti Desktop atau Documents, lalu jalankan kembali.",
        filepath.Dir(path))
}
```

- Pesan ramah Bahasa Indonesia, menunjuk solusi konkret (pindah folder), tidak menyebut "permission" / "chmod".
- Stderr only — UI belum bisa tampil karena server HTTP belum start. Single-binary tidak bisa pop dialog tanpa native UI dependency. CLI message + non-zero exit cukup untuk first-run. (V2: small native dialog via webview kalau persona feedback menunjukkan butuh.)

### Self-heal interaksi (`internal/db/heal.go`)

- `magicsync.db.bak` dibuat di folder yang sama dengan `magicsync.db` saat `PRAGMA integrity_check` fail. Sama-sisi-binary konsisten — kalau folder read-only, heal juga gagal dengan error yang sama (folder tidak writable berarti aplikasi tidak bisa jalan, bukan masalah baru).
- Folder write-test bisa ditambah di pre-bootstrap step (probe `os.WriteFile` ke file temp) supaya error muncul *sebelum* SQLite mencoba create file (pesan SQLite generik kurang ramah daripada pesan custom).

### Interaksi dengan ADR sebelumnya

- **ADR-0011 (credential mode)**: mode passphrase memerlukan `app_settings.salt` + ciphertext koneksi pindah barengan dengan binary; same-dir-as-binary memenuhi ini secara natural. Mode OS keystore tetap terikat ke OS asal — banner "credential terikat ke OS asal" di ADR-0011 berlaku terlepas dari lokasi DB. Pindah folder lintas mesin mode keystore = ciphertext masih ada di file, tapi key di keystore mesin lama tidak ikut → user re-input via dialog yang sudah ada.
- **ADR-0010 (capacity retention)**: ukuran DB capacity-bound; kalau user simpan di folder dengan free space terbatas (mis. USB stick 4 GB hampir penuh), VACUUM gagal akan masuk error log normal. Tidak ada early warning "disk almost full" di V1 (V2 candidate).

### Distribusi binary M8

- Release artifact: zip/tar berisi satu file binary `magicsync` (atau `magicsync.exe`) plus `README.txt` ringkas. Tidak ada folder data pre-baked — DB lahir saat first-run.
- Dokumentasi user-facing: "Letakkan file magicsync di folder yang bisa ditulis (Desktop, Documents, atau folder dedicated). File magicsync.db akan dibuat otomatis bersebelahan saat pertama kali dijalankan. Untuk pindah komputer, copy folder ini secara utuh."
- Cross-OS test (M8): build linux/amd64 + windows/amd64 + darwin/amd64 + darwin/arm64; smoke test "drop binary di folder kosong, run, confirm `magicsync.db` lahir, run lagi confirm DB ter-load tanpa kehilangan data".

### Override via env var (tidak di V1)

- V2 candidate: `MAGICSYNC_DATA_DIR=/path/to/dir` env var override, untuk skenario power user (CI testing, multiple instances). V1 sengaja tidak expose — menambah surface tanpa kasus pengguna konkret di persona target. Kalau ditambah di V2, default tetap same-dir-as-binary; env var hanya escape hatch.

### Test M1

- **Resolve smoke**: build binary di `/tmp/test/magicsync`, run, assert `magicsync.db` lahir di `/tmp/test/`. Run lagi dari CWD berbeda (`cd /tmp && /tmp/test/magicsync`) — DB tetap di `/tmp/test/`, bukan `/tmp/`.
- **Symlink resolve**: `ln -s /tmp/test/magicsync /tmp/link/magicsync`, run via symlink, assert DB di `/tmp/test/` (folder real binary), bukan `/tmp/link/`.
- **Read-only folder**: chmod folder ke 555, run binary di folder itu — assert exit code non-zero + stderr berisi pesan ramah "tidak bisa menulis di folder ... pindahkan ke folder yang bisa ditulis".
- **Windows double-click semantics**: build binary `.exe`, double-click dari Explorer (CWD = home / System32), assert DB lahir di folder binary (bukan home).

### V2 candidate

- `MAGICSYNC_DATA_DIR` env var override.
- Migration tooling kalau V2 mengubah default ke OS-convention (dialog "Pindahkan data ke lokasi standar?").
- Disk space pre-check + warning sebelum VACUUM gagal.
- Native error dialog (webview-based) untuk first-run permission issue di OS dengan UI default.
