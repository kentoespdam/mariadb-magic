package main

import (
	"context"
	"embed"
	"fmt"
	"io"

	// "io/fs"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"

	"magic-mariadb/internal/api"
	"magic-mariadb/internal/crypto"
	"magic-mariadb/internal/db"
	"magic-mariadb/internal/maint"
	"magic-mariadb/internal/repo"
	"magic-mariadb/internal/sse"
	"magic-mariadb/pkg/browser"
)

//go:embed web/out
var staticFS embed.FS

var version = "v0.1.0-dev"

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

	dbPath := filepath.Join(binDir, "magicsync.db")
	bs := db.NewBootstrapper(dbPath)
	if err := bs.Ensure(); err != nil {
		return fmt.Errorf("bootstrap failed: %w", err)
	}

	sqliteDB, err := bs.Connect()
	if err != nil {
		return fmt.Errorf("connect failed: %w", err)
	}
	defer sqliteDB.Close()

	keyProvider := crypto.NewPassphraseKeyProvider("magicsync-local-key")
	profilesHandler := api.NewProfilesHandler(sqliteDB, keyProvider)
	connectionsHandler := api.NewConnectionHandler(sqliteDB, keyProvider)
	onboardingHandler := api.NewOnboardingHandler(sqliteDB)

	sseBroker := sse.NewBroker()
	sessionsRepo := repo.NewSyncSessionsRepo(sqliteDB)
	logsRepo := repo.NewSyncLogsRepo(sqliteDB)
	sseHandler := sse.NewHandler(sseBroker, sessionsRepo, logsRepo)

	retention := maint.NewRetention(sqliteDB)
	retention.Start(context.Background())
	maintHandler := api.NewMaintHandler(retention)

	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return fmt.Errorf("failed to listen: %w", err)
	}
	defer ln.Close()

	addr := fmt.Sprintf("http://%s", ln.Addr().String())
	log.Printf("Magic MariaDB Sync running at %s", addr)

	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/api/") {
			handleAPI(w, r, profilesHandler, connectionsHandler, sseHandler, onboardingHandler, maintHandler)
			return
		}
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		f, err := staticFS.Open("web/out/index.html")
		if err != nil {
			http.Error(w, "page not found", http.StatusNotFound)
			return
		}
		defer f.Close()
		io.Copy(w, f)
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

func handleAPI(w http.ResponseWriter, r *http.Request, profiles *api.ProfilesHandler, connections *api.ConnectionHandler, sseHandler *sse.Handler, onboarding *api.OnboardingHandler, maint *api.MaintHandler) {
	path := r.URL.Path

	switch {
	case strings.HasPrefix(path, "/api/profiles/"):
		id := strings.TrimPrefix(path, "/api/profiles/")
		if id == "" {
			switch r.Method {
			case "GET":
				profiles.List(w, r)
			case "POST":
				profiles.Create(w, r)
			default:
				http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			}
			return
		}
		if strings.HasSuffix(id, "/schema") {
			id = strings.TrimSuffix(id, "/schema")
			r.URL.Path = "/api/profiles/" + id
			profiles.GetSchema(w, r)
			return
		}
		if strings.HasSuffix(id, "/mark-ready") {
			id = strings.TrimSuffix(id, "/mark-ready")
			r.URL.Path = "/api/profiles/" + id
			profiles.MarkReady(w, r)
			return
		}
		if strings.HasSuffix(id, "/downgrade") {
			id = strings.TrimSuffix(id, "/downgrade")
			r.URL.Path = "/api/profiles/" + id
			profiles.DowngradeToDraft(w, r)
			return
		}
		if strings.HasSuffix(id, "/pairings") {
			id = strings.TrimSuffix(id, "/pairings")
			r.URL.Path = "/api/profiles/" + id
			profiles.UpdatePairings(w, r)
			return
		}
		if strings.HasSuffix(id, "/preflight") && r.Method == "GET" {
			id = strings.TrimSuffix(id, "/preflight")
			r.URL.Path = "/api/profiles/" + id
			profiles.Preflight(w, r)
			return
		}
		switch r.Method {
		case "GET":
			profiles.Get(w, r)
		case "PUT":
			profiles.Update(w, r)
		case "DELETE":
			profiles.Delete(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	case strings.HasPrefix(path, "/api/connections/"):
		switch r.Method {
		case "GET", "POST", "PUT", "DELETE":
			connections.Handle(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	case strings.HasPrefix(path, "/api/sessions/"):
		id := strings.TrimPrefix(path, "/api/sessions/")
		if id == "" {
			switch r.Method {
			case "GET":
				profiles.ListSessions(w, r)
			case "POST":
				profiles.StartSession(w, r)
			default:
				http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			}
			return
		}
		if strings.HasSuffix(id, "/cancel") && r.Method == "POST" {
			id = strings.TrimSuffix(id, "/cancel")
			profiles.CancelSession(w, r, id)
			return
		}
		switch r.Method {
		case "GET":
			profiles.GetSession(w, r, id)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	case strings.HasPrefix(path, "/api/sse/"):
		sessionID := strings.TrimPrefix(path, "/api/sse/")
		sseHandler.StreamEvents(w, r, sessionID)
	case path == "/api/onboarding/state" && r.Method == "GET":
		onboarding.GetState(w, r)
	case path == "/api/sessions" && r.Method == "GET":
		profiles.ListSessions(w, r)
	case strings.HasPrefix(path, "/api/sessions/") && strings.HasSuffix(path, "/logs/groups") && r.Method == "GET":
		sessionID := strings.TrimSuffix(strings.TrimPrefix(path, "/api/sessions/"), "/logs/groups")
		profiles.GetSessionLogGroups(w, r, sessionID)
	case strings.HasPrefix(path, "/api/sessions/") && strings.HasSuffix(path, "/logs") && r.Method == "GET":
		sessionID := strings.TrimSuffix(strings.TrimPrefix(path, "/api/sessions/"), "/logs")
		profiles.GetSessionLogs(w, r, sessionID)
	case strings.HasPrefix(path, "/api/sessions/") && strings.HasSuffix(path, "/logs.csv") && r.Method == "GET":
		sessionID := strings.TrimSuffix(strings.TrimPrefix(path, "/api/sessions/"), "/logs.csv")
		profiles.ExportSessionLogsCSV(w, r, sessionID)
	case path == "/api/preview/rule" && r.Method == "POST":
		profiles.PreviewRule(w, r)
	case path == "/api/maint/stats" && r.Method == "GET":
		maint.GetStats(w, r)
	case path == "/api/maint/evict" && r.Method == "POST":
		maint.TriggerEvict(w, r)
	case strings.HasPrefix(path, "/settings/") || path == "/settings":
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		f, err := staticFS.Open("web/out/index.html")
		if err != nil {
			http.Error(w, "page not found", http.StatusNotFound)
			return
		}
		defer f.Close()
		io.Copy(w, f)
	case path == "/api/version" && r.Method == "GET":
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"version":"` + version + `"}`))
	default:
		http.Error(w, "not found", http.StatusNotFound)
	}
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
