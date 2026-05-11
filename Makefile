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

build:

# E2E test harness

test-e2e-up:
	docker compose -f tests/fixtures/docker-compose.yml up -d --wait
	@echo "Waiting for databases to be ready..."
	@timeout 30 bash -c 'until docker compose -f tests/fixtures/docker-compose.yml exec -T magicsync-src mariadb -u testuser -ptestpass -e "SELECT 1" >/dev/null 2>&1; do sleep 1; done'
	@timeout 30 bash -c 'until docker compose -f tests/fixtures/docker-compose.yml exec -T magicsync-dst mariadb -u testuser -ptestpass -e "SELECT 1" >/dev/null 2>&1; do sleep 1; done'
	@echo "Database containers ready"

test-e2e-down:
	docker compose -f tests/fixtures/docker-compose.yml down -v
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

test-e2e:
	$(MAKE) test-e2e-up
	$(MAKE) test-e2e-bin
	@cat .test-url

.PHONY: test-e2e-up test-e2e-down test-e2e-bin test-e2e test-e2e-kill

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