.PHONY: help dev-web dev-go dev build-web build-go build embed-check test clean

help:
	@echo "Magic MariaDB Sync - Available targets:"
	@echo "  dev         - Run both web and backend (in separate terminals)"
	@echo "  dev-web     - Run Next.js dev server (cd web && bun dev)"
	@echo "  dev-go      - Run Go backend (go run ./cmd/magicsync)"
	@echo "  build       - Build web and backend binary"
	@echo "  build-web   - Build Next.js frontend"
	@echo "  build-go    - Build Go binary"
	@echo "  embed-check - Check if FE bundle is stale"
	@echo "  test        - Run Go + JS tests"
	@echo "  clean       - Remove build artifacts"

dev-web:
	cd web && bun dev

dev-go:
	go run ./cmd/magicsync

dev:
	@echo "Run 'make dev-web' and 'make dev-go' in separate terminals"

build-web:
	cd web && bun run build

build-go:
	go build -ldflags "-s -w" -o magicsync ./cmd/magicsync

build: build-web build-go

embed-check:
	@echo "Checking if FE bundle is up to date..."
	@newest_src=$$(find web/src -type f -printf '%T@\n' | sort -nr | head -1); \
	out_mtime=$$(stat -c '%Y' web/out/index.html 2>/dev/null || echo 0); \
	if [ "$$newest_src" != "" ] && [ "$$out_mtime" != "0" ]; then \
		newest_ts=$$(echo "$$newest_src" | cut -d. -f1); \
		if [ "$$newest_ts" -gt "$$out_mtime" ]; then \
			echo "FE bundle stale. Run 'make build-web' first."; \
			exit 1; \
		fi; \
	fi
	@echo "FE bundle is up to date"

test:
	go test -race ./...
	cd web && bun run test

clean:
	rm -rf web/out web/.next magicsync