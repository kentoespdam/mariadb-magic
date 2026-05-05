#!/bin/bash
set -eo pipefail

# Extract build step into reusable function
build_binary() {
  echo "Building binary..."
  make build-linux-amd64
  if [ $? -ne 0 ]; then
    echo "Build failed"
    exit 1
  fi
  if [ ! -f ./build/magicsync ]; then
    echo "Binary not found after build"
    exit 1
  fi
  echo "Binary built successfully"
}

# Create temporary directory for testing
TEMP_DIR=$(mktemp -d)
echo "Using temporary directory: $TEMP_DIR"

cd "$TEMP_DIR"

# Build the binary
build_binary

# Start server in background
echo "Starting server..."
./build/magicsync &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"

# Wait for server to start
echo "Waiting for server to start..."
sleep 3

# Check if SQLite database is created
echo "Checking for SQLite database..."
if [ ! -f "magic.db" ]; then
  echo "ERROR: magic.db not created"
  kill $SERVER_PID 2>/dev/null || true
  wait $SERVER_PID 2>/dev/null || true
  exit 1
fi
echo "SQLite database created successfully"

# Send HTTP request to server
echo "Sending HTTP request to localhost:8080..."
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080)

if [ "$HTTP_RESPONSE" != "200" ]; then
  echo "ERROR: HTTP request failed with status $HTTP_RESPONSE"
  kill $SERVER_PID 2>/dev/null || true
  wait $SERVER_PID 2>/dev/null || true
  exit 1
fi
echo "HTTP request successful (status: $HTTP_RESPONSE)"

# Clean up
echo "Cleaning up..."
kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true

# Return to original directory
cd - > /dev/null

# Remove temporary directory
rm -rf "$TEMP_DIR"

echo "Smoke test completed successfully"
exit 0