package api

import (
    "strings"
    "net/http"
)

func getProfileID(r *http.Request) string {
    path := strings.TrimPrefix(r.URL.Path, "/api/profiles/")
    return strings.Split(path, "/")[0]
}