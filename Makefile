.PHONY: help dev-web dev-go dev build-web build-go build embed-check test clean \
        db-up db-down db-reset db-status db-logs \
        test-e2e-up test-e2e-down test-e2e-bin test-e2e test-e2e-kill

# ── Help ──

help:
	@echo "Magic MariaDB Sync - Available targets:"
	@echo ""
	@echo "── Dev ──"
	@echo "  dev         - Run both web and backend (separate terminals)"
	@echo "  dev-web     - Run Next.js dev server (cd web && bun dev)"
	@echo "  dev-go      - Run Go backend (go run ./cmd/magicsync)"
	@echo ""
	@echo "── Build ──"
	@echo "  build       - Build web + Go binary"
	@echo "  build-web   - Build Next.js frontend only"
	@echo "  build-go    - Build Go binary only"
	@echo ""
	@echo "── Database (Docker) ──"
	@echo "  db-up       - Start MariaDB test containers"
	@echo "  db-down     - Stop & remove MariaDB test containers"
	@echo "  db-reset    - Restart MariaDB test containers (fresh seed)"
	@echo "  db-status   - Show container status"
	@echo "  db-logs     - Show container logs"
	@echo ""
	@echo "── E2E ──"
	@echo "  test-e2e    - Full E2E: up + bin + show URL"
	@echo ""
	@echo "── Other ──"
	@echo "  test        - Run Go + JS tests"
	@echo "  embed-check - Check if FE bundle is stale"
	@echo "  clean       - Remove build artifacts"

# ── Dev ──

dev-web:
	cd web && bun dev

dev-go:
	go run ./cmd/magicsync

dev:
	@echo "Run 'make dev-web' and 'make dev-go' in separate terminals"

# ── Build ──

build-web:
	cd web && bun run build

build-go:
	go build -ldflags "-s -w" -o magicsync ./cmd/magicsync

build: build-web build-go

# ── Database (Docker) ──

COMPOSE_FILE := tests/fixtures/docker-compose.yml

db-up:
	docker compose -f $(COMPOSE_FILE) up -d --wait
	@echo "✓ Databases ready"
	@echo "  Source:      mysql://testuser:testpass@localhost:3307/magicsync"
	@echo "  Destination: mysql://testuser:testpass@localhost:3308/magicsync"

db-down:
	docker compose -f $(COMPOSE_FILE) down -v

db-reset: db-down db-up

db-status:
	docker compose -f $(COMPOSE_FILE) ps

db-logs:
	docker compose -f $(COMPOSE_FILE) logs

# ── E2E test harness ──

test-e2e-up: db-up

test-e2e-down:
	docker compose -f $(COMPOSE_FILE) down -v
	@rm -rf /tmp/magicsync-e2e-*
	@rm -f .test-url

test-e2e-bin:
	@make build
	@TESTDIR=/tmp/magicsync-e2e-$$(date +%s); \
	mkdir -p $$TESTDIR && \
	cp magicsync $$TESTDIR/ && \
	echo "test-encryption-key-32-bytes-long" > $$TESTDIR/.key && \
	cd $$TESTDIR && \
	ENCRYPTION_KEY_PATH="$$TESTDIR/.key" nohup ./magicsync > magicsync.log 2>&1 & echo $$! > magicsync.pid && \
	sleep 3 && \
	PORT=$$(lsof -i -P -n | grep magicsync | grep LISTEN | awk '{print $$9}' | sed 's/.*://' | head -1); \
	if [ -n "$$PORT" ]; then \
	  echo "http://127.0.0.1:$$PORT" | tee $(CURDIR)/.test-url; \
	  echo "Binary running at $$TESTDIR on port $$PORT"; \
	else \
	  echo "Failed to start binary. Log:"; cat $$TESTDIR/magicsync.log; exit 1; \
	fi

test-e2e-kill:
	@PID=$$(cat /tmp/magicsync-e2e-*/magicsync.pid 2>/dev/null || echo ""); \
	   if [ -n "$$PID" ]; then kill $$PID 2>/dev/null || true; fi
	@rm -rf /tmp/magicsync-e2e-*

test-e2e:
	$(MAKE) db-up
	$(MAKE) test-e2e-bin
	@cat .test-url

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