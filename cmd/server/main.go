package main

import (
    "log"
    "net/http"
    "io/fs"
    embedPkg "mariadb-magic/internal/embed"
)

func main() {
    // Serve embedded static files located in internal/embed/static.
    subFS, err := fs.Sub(embedPkg.StaticFS, "static")
    if err != nil {
        log.Fatalf("failed to get sub FS: %v", err)
    }
    handler := http.FileServer(http.FS(subFS))

    http.Handle("/", handler)

    log.Println("Starting server on :8080")
    if err := http.ListenAndServe(":8080", nil); err != nil {
        log.Fatalf("Server failed: %v", err)
    }
}
