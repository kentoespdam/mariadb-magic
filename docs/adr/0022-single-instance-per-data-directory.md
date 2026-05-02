# Single-instance lock: per data directory, bukan global

V1 mengizinkan **N instance `magicsync` jalan paralel selama setiap instance memakai data directory berbeda**, tetapi membatasi maksimal **satu instance per folder data** (= folder yang berisi `magicsync.db`). Implementasi: file advisory lock `magicsync.lock` di folder data via `github.com/gofrs/flock`. Instance kedua yang menunjuk ke folder yang sama tidak start server baru — ia membaca URL instance pertama dari lock file, panggil `pkg/browser.OpenURL`, lalu exit 0. Instance yang menunjuk folder berbeda jalan independen tanpa interaksi. Tujuan: hindari korupsi SQLite WAL akibat dua writer di file yang sama, sambil tetap mendukung skenario portable (USB stick di slot A, mode passphrase; folder lain di disk lokal, mode keystore — keduanya valid bersamaan).

## Considered Options

- **(A) Per data directory lock** *(dipilih)*. Lock file `magicsync.lock` co-located dengan `magicsync.db` di folder yang resolved oleh `internal/db/path.go` (per ADR-0017). Instance kedua di folder yang sama gagal acquire lock → baca URL dari lock file body (instance pertama menulis `port=<N>` saat startup, update `mtime`), `OpenURL`, exit 0. Folder berbeda = file lock berbeda = tidak ada interaksi. Cocok dengan janji portable (USB stick di mesin lain bisa jalan paralel dengan instance lokal di disk).
- **(B) Global single-instance**: lock di lokasi well-known per OS (`%TEMP%\magicsync.lock` Windows, `/tmp/magicsync.lock` Linux, `~/Library/Application Support/...` macOS). Ditolak: melanggar janji portable — user pasang USB stick mode passphrase + jalankan dari sana, sementara mesin tuan rumah punya instance lokal di Desktop dengan mode keystore → dua instance valid yang harus jalan bersamaan, tetapi global lock akan blokir yang kedua. Selain itu lokasi well-known menambah surface bug (`/tmp` di Linux di-clear saat boot tapi proses sebelumnya mungkin masih hidup dari resume; `%TEMP%` di Windows beda per user; macOS sandbox jika notarized di V2). Lebih buruk lagi: global lock tidak melindungi dari skenario nyata yang harus dilindungi (dua writer ke `magicsync.db` yang sama) — yang dilindungi adalah kebetulan, bukan invariant.
- **(C) No lock — biarkan dua instance jalan bersamaan**. Ditolak: SQLite WAL mode + dua writer process = race di `-wal` dan `-shm` file. `modernc.org/sqlite` (per CLAUDE.md, pure-Go SQLite) mengandalkan locking POSIX yang baik di sebagian besar kasus tetapi **tidak imun** terhadap two-process scenario, terutama di Windows network share (lock byte semantics berbeda) dan Linux dengan filesystem yang locking POSIX-nya buggy (NFS klasik, beberapa setup FUSE). Selain itu, dua HTTP server di port ephemeral berbeda → user bingung "URL mana yang saya buka tadi"; SSE broker tiap instance independen → progress event muncul di tab yang salah. Tidak ada upside untuk persona target.
- **(D) Lock di SQLite row** (tabel `app_lock` dengan TTL): instance pertama insert row dengan `expires_at = now+30s`, refresh tiap 10s; instance kedua check row → kalau valid lewatkan, kalau expired claim. Ditolak: solusi over-engineered untuk single-process problem. Race window selalu ada (refresh terlewat karena GC pause / OS sleep → row expire → instance kedua claim → instance pertama wake-up → dua writer). Advisory file lock (flock/LockFileEx) lebih sederhana dan native ke OS. Selain itu, locking lewat SQLite row mengasumsikan SQLite **sudah** bisa dibuka dual-writer-aman, yang justru masalah yang ingin dihindari (chicken-and-egg).

## Consequences

### Implementasi (`internal/app/lock.go` + startup di `cmd/magicsync/main.go`)

```go
// internal/app/lock.go
package app

import (
    "fmt"
    "os"
    "path/filepath"

    "github.com/gofrs/flock"
)

type InstanceLock struct {
    fl   *flock.Flock
    path string
}

// Acquire returns (lock, "", nil) on success, or (nil, existingURL, ErrAlreadyRunning).
func Acquire(dataDir string) (*InstanceLock, string, error) {
    p := filepath.Join(dataDir, "magicsync.lock")
    fl := flock.New(p)
    locked, err := fl.TryLock()
    if err != nil {
        return nil, "", fmt.Errorf("flock %s: %w", p, err)
    }
    if !locked {
        url, _ := os.ReadFile(p) // body berisi "http://127.0.0.1:PORT"
        return nil, string(url), ErrAlreadyRunning
    }
    return &InstanceLock{fl: fl, path: p}, "", nil
}

func (l *InstanceLock) WriteURL(url string) error {
    return os.WriteFile(l.path, []byte(url), 0o600)
}

func (l *InstanceLock) Release() {
    _ = l.fl.Unlock()
    _ = os.Remove(l.path) // best-effort cleanup
}
```

- `flock.TryLock()` non-blocking — instance kedua tidak hang menunggu instance pertama exit.
- Urutan startup di `main.go`: (1) resolve data dir → (2) bootstrap SQLite → (3) `Acquire(dataDir)` → kalau `ErrAlreadyRunning` → `pkg/browser.OpenURL(existingURL)` + exit 0 → (4) `net.Listen("127.0.0.1:0")` → (5) `lock.WriteURL(actualURL)` → (6) start server.
- `defer lock.Release()` di main; OS auto-release flock saat process exit (termasuk crash/SIGKILL) — file `magicsync.lock` mungkin tertinggal tapi flock byte-range tidak ter-hold, instance berikutnya bisa acquire normal. Stale URL di body file tidak masalah — instance baru overwrite saat WriteURL.
- **Body lock file**: berisi URL plaintext (`http://127.0.0.1:PORT`). Tidak ada lock format versioning V1 — sederhana, satu baris. V2 yang menambah field (PID, started_at, version) bisa pakai JSON dengan fallback "kalau bukan JSON valid, anggap V1 plain URL".

### UX instance kedua

```
$ ./magicsync
Magic MariaDB Sync sudah berjalan di folder ini.
Membuka tab baru ke http://127.0.0.1:54871 ...
$ # exit 0
```

- Tidak ada error code merah, tidak ada panic. Persona target double-click binary kedua kali (lupa instance pertama) → dapat browser tab, bukan dialog teknis.
- Auto-open browser gagal (headless, no DISPLAY): print URL ke stderr, exit 0. User salin-paste manual.
- README section "Menjalankan dua instance bersamaan": dokumentasikan pola **valid** (USB stick + lokal disk = dua folder data berbeda) vs **tidak valid** (double-click binary yang sama dua kali — instance kedua hanya buka tab).

### Interaksi dengan ADR sebelumnya

- **ADR-0017 (DB lokasi same-dir-as-binary)**: lock file `magicsync.lock` di folder yang sama dengan `magicsync.db`. Resolution path identik (`os.Executable()` + `EvalSymlinks` + `Dir`). Implikasi: dua kopi binary di folder berbeda = dua data dir berbeda = dua instance valid (sesuai janji portable: bawa folder utuh = bawa state utuh).
- **ADR-0020 (single-session global concurrency)**: berlaku **dalam satu instance**. Single-instance per data dir + single-session per instance = satu Sync Session per folder data, lintas waktu. Dua instance di folder berbeda **bisa** punya session running paralel masing-masing — sah karena Source/Destination pool koneksi independen, SQLite file independen, tidak ada shared state.
- **ADR-0011 (credential mode wizard)**: re-key flow yang mengubah ciphertext semua connection di SQLite tetap aman karena single-instance lock memastikan tidak ada writer kedua di tengah transaksi.
- **ADR-0021 (distribusi V1)**: tidak ada implikasi cross-compile; `gofrs/flock` mendukung Linux + Windows native (advisory `flock(2)` Linux, `LockFileEx` Windows). macOS skip V1 — tidak relevan.

### Skenario edge

- **"Saya double-click binary, lalu sebelum browser kebuka, double-click lagi cepat-cepat"** → instance kedua acquire gagal, baca lock file body. Race window: instance pertama mungkin belum tulis URL (antara `Acquire()` dan `WriteURL()`). Mitigasi: instance kedua baca, kalau body kosong → retry 200ms × 5 (= 1 detik total) → kalau tetap kosong, print "Instance lain sedang startup, coba lagi sebentar" ke stderr, exit 1. Race window pendek (<100ms tipikal), retry sederhana cukup.
- **"App crash hard, lock file tertinggal"** → OS melepas flock byte-range otomatis saat process exit. File `magicsync.lock` masih ada di disk dengan stale URL, tapi flock-nya bebas → instance baru `TryLock()` sukses → overwrite body. Tidak perlu cleanup eksplisit di startup ("delete stale lock file").
- **"Saya copy folder magicsync ke lokasi baru saat instance pertama masih jalan"** → folder baru = data dir baru = lock terpisah. Instance kedua di folder baru jalan paralel sah. Skenario portable: edit copy lokal sambil sync produksi jalan di USB stick.
- **"User menjalankan binary lewat `wine` di Linux"** → `gofrs/flock` di Wine memetakan ke Linux flock. Tetap berlaku per data dir (Wine tidak shadow folder Windows secara unik untuk locking purpose). Bukan target persona, sanity check saja.

### Test M1/M8

- **Acquire/Release roundtrip**: `internal/app/lock_test.go` — temp dir, `Acquire` sukses, `WriteURL("http://x")`, `Release`, `Acquire` sukses lagi.
- **Two-instance same dir**: dua goroutine paralel `Acquire(tmp)` → satu sukses, satu return `ErrAlreadyRunning` dengan body URL yang sama dengan yang ditulis instance pertama.
- **Two-instance different dir**: `Acquire(tmpA)` + `Acquire(tmpB)` paralel → keduanya sukses, body file independen.
- **Crash recovery**: simulasi crash dengan kill goroutine pemegang lock (drop reference tanpa Release) → di test sulit, mock dengan `flock.Unlock()` tanpa `os.Remove(path)` → instance baru `Acquire` tetap sukses (file ada tapi byte-range bebas). Smoke test: di linux, jalankan `magicsync &`, `kill -9 $!`, jalankan lagi, confirm startup normal.
- **Smoke (Windows + Linux)**: M8 — drop binary di folder kosong, double-click 2× cepat, confirm tab kedua dibuka di browser ke URL yang sama, instance kedua exit 0 di terminal.

### V2 candidate

- **Idle timeout** (auto-shutdown setelah N menit tanpa request) → mengurangi proses zombie kalau user lupa Ctrl+C. Implikasi: SSE long-poll harus di-exempt; in-flight Sync Session mencegah timeout. Default 30 menit, configurable di Settings.
- **Tray icon**: setelah V2 macOS support live, tray icon lintas OS (`fyne.io/systray`) supaya user tutup via right-click tray, bukan kill terminal. CGO dependency + per-OS testing matrix bertambah.
- **Lock file format JSON** (versi, PID, started_at) → memungkinkan instance kedua lihat "instance pertama jalan sejak T, sudah X menit" sebelum redirect. Kosmetik kecuali ada use case konkret.
- **Auth token untuk remote access**: V2 flag `--bind 0.0.0.0 --auth token=secret` untuk skenario "saya jalankan di server lokal kantor, akses dari laptop". Implikasi besar (CSRF, HTTPS, session management) — bukan ekstensi sederhana.
- **Multi-process via SQLite WAL shared**: alternatif ke single-instance lock — biarkan N instance jalan, semua tulis ke SQLite WAL mode dengan locking SQLite-native. Lebih kompleks (SSE broker per-process tidak share, runner mutex ADR-0020 perlu jadi row-level claim). Skip kecuali V3 introduce CLI/headless mode paralel dengan UI.
