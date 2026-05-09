# Distribusi V1: Linux + Windows unsigned, macOS ditunda V2

V1 di-distribusi sebagai **binary unsigned** untuk **linux/amd64 + linux/arm64 + windows/amd64**. **macOS skip** di V1 — Apple Developer Program ($99/tahun) prematur sebelum produk punya revenue/validasi. Cross-compile dilakukan **manual di mesin dev** via `scripts/release.sh` (~10 baris loop `GOOS`/`GOARCH`), upload artifact ke GitHub Release pakai `gh release create`. Tidak ada GitHub Actions di V1 — solo dev, repo public (Actions tetap gratis kalau V2 butuh otomasi). Tujuan: minimalkan biaya + infra untuk launch awal, jaga path open-source friendly, terima trade-off SmartScreen friction (Windows unsigned) yang persona target masih bisa lewati dengan dokumentasi screenshot.

## Considered Options

- **(A) Linux + Windows unsigned, macOS skip V1, manual cross-compile** *(dipilih)*. Skrip `release.sh` lokal: `GOOS=linux GOARCH=amd64`, `GOOS=linux GOARCH=arm64`, `GOOS=windows GOARCH=amd64` → 3 binary di `dist/`. `gh release create v1.0.0 dist/* --notes-file CHANGELOG.md`. Total biaya: $0. Friction user: Linux nihil (chmod +x), Windows SmartScreen "More info → Run anyway" (1 ekstra klik, screenshot di README). macOS user: download Linux build via Lima/Colima, atau tunggu V2.
- **(B) Linux + Windows + macOS unsigned**. Ditolak: macOS unsigned punya friction Gatekeeper yang **tinggi** untuk persona UMKM — "App is damaged and can't be opened" (default), workaround = Right-click → Open atau Privacy & Security panel "Open Anyway", + permission prompt per file akses. Lebih buruk dari Windows SmartScreen ("More info" linknya kelihatan; macOS "App is damaged" tampak terminal/destructive). Persona target tidak akan menyelesaikan flow ini tanpa support call. Lebih baik tidak ada build macOS daripada build yang gagal di tangan user.
- **(C) Bayar Apple Developer Program ($99/tahun) + Windows EV cert ($300–400/tahun)**. Ditolak V1: pre-revenue, validasi market belum, biaya $400–500/tahun signifikan untuk solo dev tanpa monetisasi rencana V1. Notarization Apple juga punya overhead (xcrun altool, staple, retry kalau Apple servers slow). Tepat untuk V2 saat produk punya bukti adoption.
- **(D) Tunda V1 sampai dana signing siap untuk parity tiga-OS**. Ditolak: PRD parity claim "lintas OS" lebih tepat ditangani lewat staged release (Linux + Windows V1, macOS V2) daripada blocking release. Persona target dominan Windows (UMKM Indonesia), Linux user kecil-tapi-nyata, macOS minoritas — skip macOS V1 mempengaruhi <20% calon user. Block V1 = 0% reach, jelas lebih buruk.
- **(E) GitHub Actions matrix build otomatis**. Tidak dipilih untuk V1 (operational, bukan arsitektural). Public repo Actions gratis unlimited Linux/Windows minutes — bukan masalah biaya. Alasan skip V1: (a) solo dev, YAML matrix overhead tidak sebanding dengan rilis cadence rendah (kemungkinan <5 release V1); (b) `release.sh` lokal lebih debuggable (terminal langsung, tidak perlu push-to-trigger); (c) reversible — V2 bisa migrate ke Actions kalau cadence naik. Bukan penolakan, hanya delayed. Kalau V2 butuh, switch tanpa ADR baru.

## Consequences

### Skrip release (`scripts/release.sh`)

```sh
#!/bin/sh
set -e
VERSION=${1:?usage: release.sh vX.Y.Z}
cd web && bun build && cd ..

mkdir -p dist
build() {
    GOOS=$1 GOARCH=$2 go build \
        -ldflags "-s -w -X main.version=$VERSION" \
        -o "dist/magicsync-$1-$2$3" ./cmd/magicsync
}

build linux   amd64 ""
build linux   arm64 ""
build windows amd64 ".exe"

echo "Build selesai. Upload manual:"
echo "  gh release create $VERSION dist/* --notes-file CHANGELOG.md"
```

- Skrip ~15 baris, dijalankan di mesin dev Linux (cross-compile ke target lain via toolchain Go bawaan).
- Frontend `web/out/` di-build dulu; `go:embed` ambil hasil saat `go build`.
- Tidak ada strip per-OS atau UPX — `-ldflags "-s -w"` cukup, hindari binary opacity yang trigger AV false positive (UPX terkenal flagged oleh Windows Defender heuristic).

### CI matrix (M8 deferred)

V1 tidak punya CI release pipeline. CI test (`go test -race`) bisa tetap di GitHub Actions untuk PR — itu beda concern dari distribusi. Kalau V2 perlu otomasi rilis:

- Public repo → Actions free unlimited Linux/Windows minutes
- Matrix sederhana: `runs-on: ubuntu-latest` + `goos: [linux, windows]`, `goarch: [amd64, arm64]` (skip windows/arm64 — minoritas)
- Trigger: push tag `v*`, otomatis upload ke Release via `softprops/action-gh-release`

Tidak perlu refactor `release.sh` — Actions YAML bisa call skrip yang sama.

### Dokumentasi user-facing (Windows SmartScreen workaround)

README.md (atau landing page) section "Cara menjalankan di Windows":

> Saat pertama kali membuka `magicsync.exe`, Windows mungkin menampilkan dialog biru "Windows protected your PC".
> 1. Klik **More info** (link kecil di tengah dialog).
> 2. Tombol **Run anyway** akan muncul. Klik tombol itu.
> 3. Aplikasi akan terbuka. Setelah ini Windows tidak akan tanya lagi untuk file yang sama.
>
> Dialog ini muncul karena aplikasi belum memiliki sertifikat berbayar (kami akan menambahkannya di versi mendatang). Aplikasi tidak mengandung malware.

- Disertai screenshot 2 langkah (More info klikable + tombol Run anyway).
- Bahasa Indonesia, bahasa awam, tidak menyebut "code signing" / "EV certificate".

### Landing page disclaimer macOS

Halaman download wajib tampilkan badge platform yang **didukung** + catatan ramah:

> **Tersedia untuk:** Linux (amd64, arm64), Windows (64-bit)
> macOS akan didukung di versi mendatang. Pengguna Mac saat ini bisa menggunakan versi Linux melalui Docker Desktop atau Lima.

- Tidak janji tanggal (avoid commitment yang merembet).
- Workaround Linux-via-Docker untuk Mac user yang teknis enough (bukan persona target utama, tapi nice-to-have).

### Pengaruh ke ADR sebelumnya

- **ADR-0011 (credential mode)**: mode OS keystore probe untuk macOS Keychain di-skip dari test M1 karena tidak ada build macOS. Kode `internal/crypto/keystore_darwin.go` tetap ada (go-keyring cross-platform native), hanya tidak di-CI tested. V2 macOS launch = re-aktifkan smoke test Keychain.
- **ADR-0017 (DB lokasi same-dir-as-binary)**: cross-OS test M8 di-narrow ke Linux + Windows. macOS `Library/Application Support/` edge case skip — `os.Executable()` + `EvalSymlinks` semantik sama lintas OS, low risk.
- **PRD §2 "lintas OS"**: footnote ditambah "V1: Linux + Windows. macOS direncanakan V2 setelah Apple Developer Program tersedia."

### Reversibility

- Pindah ke GitHub Actions: tambah `.github/workflows/release.yml` yang call `scripts/release.sh`. Tidak ada lock-in di pendekatan manual.
- Tambah signing: beli cert → tambah step `signtool sign` (Windows) / `codesign + notarize` (macOS) di skrip. Tidak ada arsitektur yang berubah.
- Tambah macOS build: tambah `build darwin amd64 ""` + `build darwin arm64 ""` di `release.sh` setelah Apple Developer setup. Cross-compile darwin dari Linux dev machine works (Go toolchain native).

### Test M8

- **Smoke build matrix**: jalankan `release.sh v0.1.0-test` di mesin dev Linux, verify 3 file di `dist/` (linux-amd64, linux-arm64, windows-amd64.exe), check ukuran wajar (~20–40 MB tergantung embed asset).
- **Linux smoke**: drop binary di folder kosong, run, confirm `magicsync.db` lahir, UI terbuka di `localhost:PORT`.
- **Windows smoke**: copy `.exe` ke Windows VM bersih, double-click → SmartScreen muncul → ikuti workaround README → confirm UI terbuka, DB lahir di folder `.exe`.
- **GitHub Release dry-run**: `gh release create v0.1.0-test dist/* --draft --notes "test"` → verify draft release, hapus draft setelah verify.
- **macOS skip evidence**: tidak ada darwin di matrix, README + landing page sebut explicit. Bukan bug yang bisa di-test, tapi sanity check absence.

### V2 candidate

- **macOS support**: Apple Developer Program $99/tahun + notarization. Setup: xcode CLI tools di mesin dev (atau Mac VM via Tart/Lima), `codesign --deep --options runtime`, `xcrun notarytool submit`, `xcrun stapler staple`. Perlu Mac fisik atau cloud Mac (MacStadium, mac.softether.cc) — minimal ad-hoc untuk notarize.
- **Windows EV code signing**: $300–400/tahun (Sectigo, DigiCert) untuk hilangkan SmartScreen warning sepenuhnya. Standard cert ($100–200) lebih murah tapi tetap trigger SmartScreen sampai reputation built up — ROI rendah.
- **GitHub Actions release pipeline**: matrix build + auto-upload ke Release on tag push. Migrate kalau cadence > 1 release/bulan.
- **Auto-update mekanisme**: V1 user manual download new release. V2 bisa tambah in-app "Versi baru tersedia, klik untuk download" (cek GitHub API `/releases/latest`). Implikasi: signature verification post-download (kalau tidak signed, hash check minimal).
- **ARM64 Windows**: `GOARCH=arm64 GOOS=windows` build cheap untuk Surface Pro X / WoA users — minoritas, tapi build cost ~0 di skrip. Tunda kalau ada permintaan konkret.
