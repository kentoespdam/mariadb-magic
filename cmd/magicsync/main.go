package main

import (
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"

	"magic-mariadb/pkg/browser"

	_ "embed"
)

//go:embed index.html
var placeholderHTML []byte

func main() {
	if err := run(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}

func run() error {
	binDir, err := binaryDir()
	if err != nil {
		return err
	}
	if err := os.MkdirAll(binDir, 0o755); err != nil {
		return fmt.Errorf("cannot create data directory %q: %w", binDir, err)
	}
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return fmt.Errorf("failed to listen: %w", err)
	}
	defer ln.Close()

	addr := fmt.Sprintf("http://%s", ln.Addr().String())
	log.Printf("Magic MariaDB Sync running at %s", addr)

	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Write(placeholderHTML)
	})

	if err := browser.OpenURL(addr); err != nil {
		fmt.Fprintf(os.Stderr, "Open URL failed (no DISPLAY?): %v\n", err)
		fmt.Fprintf(os.Stderr, "Open manually: %s\n", addr)
	}

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	go http.Serve(ln, mux)
	<-sigCh
	return nil
}

func binaryDir() (string, error) {
	ex, err := os.Executable()
	if err != nil {
		return "", fmt.Errorf("cannot determine executable path: %w", err)
	}
	ex, err = filepath.EvalSymlinks(ex)
	if err != nil {
		return "", fmt.Errorf("cannot resolve symlinks: %w", err)
	}
	return filepath.Dir(ex), nil
}
