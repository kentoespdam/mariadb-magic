#!/bin/bash
# Helper script for managing MariaDB test databases

set -e

COMPOSE_FILE="docker-compose.yml"
COMPOSE_CMD="docker compose -f $COMPOSE_FILE"

show_help() {
    echo "MariaDB Test Database Manager"
    echo "Usage: ./manage-db.sh [command]"
    echo ""
    echo "Commands:"
    echo "  up        Start test databases"
    echo "  down      Stop and remove test databases"
    echo "  reset     Stop, remove, and restart databases"
    echo "  status    Show container status"
    echo "  logs      Show container logs"
    echo "  test      Test database connections"
    echo "  help      Show this help message"
    echo ""
    echo "Databases will be available at:"
    echo "  Source: mysql://testuser:testpass@localhost:3307/magicsync"
    echo "  Destination: mysql://testuser:testpass@localhost:3308/magicsync"
}

start_dbs() {
    echo "Starting MariaDB test databases..."
    $COMPOSE_CMD up -d --wait
    echo "✓ Databases started successfully"
    echo "  Source DB:     mysql://testuser:testpass@localhost:3307/magicsync"
    echo "  Destination DB: mysql://testuser:testpass@localhost:3308/magicsync"
}

stop_dbs() {
    echo "Stopping MariaDB test databases..."
    $COMPOSE_CMD down -v
    echo "✓ Databases stopped and removed"
}

reset_dbs() {
    echo "Resetting MariaDB test databases..."
    stop_dbs
    start_dbs
}

show_status() {
    echo "Database container status:"
    $COMPOSE_CMD ps
}

show_logs() {
    echo "Database container logs:"
    $COMPOSE_CMD logs
}

test_connections() {
    echo "Testing database connections..."
    
    # Test source database
    if mysql -h 127.0.0.1 -P 3307 -u testuser -ptestpass magicsync -e "SELECT '✓ Source DB connection OK' as status;" 2>/dev/null; then
        echo "Source database connection: OK"
    else
        echo "Source database connection: FAILED"
    fi
    
    # Test destination database
    if mysql -h 127.0.0.1 -P 3308 -u testuser -ptestpass magicsync -e "SELECT '✓ Destination DB connection OK' as status;" 2>/dev/null; then
        echo "Destination database connection: OK"
    else
        echo "Destination database connection: FAILED"
    fi
    
    # Show data counts
    echo -e "\nData Summary:"
    mysql -h 127.0.0.1 -P 3307 -u testuser -ptestpass magicsync -e "SELECT 'Source' as db, COUNT(*) as customers FROM customers UNION ALL SELECT 'Source', COUNT(*) as orders FROM orders;" 2>/dev/null || echo "Cannot connect to source"
    mysql -h 127.0.0.1 -P 3308 -u testuser -ptestpass magicsync -e "SELECT 'Destination' as db, COUNT(*) as customers FROM customers UNION ALL SELECT 'Destination', COUNT(*) as orders FROM orders;" 2>/dev/null || echo "Cannot connect to destination"
}

main() {
    cd "$(dirname "$0")"
    
    if [[ ! -f "$COMPOSE_FILE" ]]; then
        echo "Error: $COMPOSE_FILE not found!"
        exit 1
    fi
    
    case "${1:-help}" in
        up)
            start_dbs
            ;;
        down)
            stop_dbs
            ;;
        reset)
            reset_dbs
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs
            ;;
        test)
            test_connections
            ;;
        help|"")
            show_help
            ;;
        *)
            echo "Unknown command: $1"
            echo "Use 'help' for available commands"
            exit 1
            ;;
    esac
}

main "$@"