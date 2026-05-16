# MariaDB Test Database Setup

This directory contains Docker Compose configuration and seed data for testing MariaDB databases.

## Quick Start

```bash
# Start test databases
docker compose up -d --wait

# Test connections
mysql -h 127.0.0.1 -P 3307 -u testuser -ptestpass magicsync -e "SELECT 'Source OK' as status;"
mysql -h 127.0.0.1 -P 3308 -u testuser -ptestpass magicsync -e "SELECT 'Destination OK' as status;"

# Stop and clean up
docker compose down -v
```

## Database Details

- **Source Database**: `mysql://testuser:testpass@localhost:3307/magicsync`
- **Destination Database**: `mysql://testuser:testpass@localhost:3308/magicsync`

Both databases have the same schema with sample e-commerce data (customers, orders, order_items), but the destination database includes an additional `notes` column in the `customers` table to test schema differences.

## Files

- `docker-compose.yml`: Docker Compose configuration
- `src-seed.sql`: Source database seed data
- `dst-seed.sql`: Destination database seed data (includes notes column)
- `src-schema.sql`: Source database schema
- `dst-schema.sql`: Destination database schema (includes notes column)
- `manage-db.sh`: Helper script for managing databases

## Using the Helper Script

```bash
# Make script executable
chmod +x manage-db.sh

# Available commands:
./manage-db.sh up      # Start databases
./manage-db.sh down    # Stop databases
./manage-db.sh reset    # Reset databases
./manage-db.sh status   # Show status
./manage-db.sh logs     # Show logs
./manage-db.sh test     # Test connections
```