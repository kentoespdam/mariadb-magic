# mariadb-magic

Magic MariaDB Sync is a lightweight daemon that watches a local MariaDB schema and automatically generates a compatible Go representation and a Next.js frontend.

## Quick Start

```bash
make build-linux-amd64
./magicsync --config config.yaml
```

Or run via Docker: `docker run ghcr.io/baguspdam/mariadb-magic:latest`.

## Links

- [ADR Summary](docs/adr/SUMMARY.md) – All architectural decisions.
- [Documentation](docs/adr/) – Individual ADRs.

# End of README