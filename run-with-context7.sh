#!/usr/bin/env bash
# Wrapper script that runs a command with context7 library lookup
# Usage: run-with-context7.sh "command"

set -euo pipefail

if [[ $# -eq 0 ]]; then
  echo "Usage: $0 \"command\"" >&2
  exit 1
fi

CMD="$1"

# Try to run context7 if available. If not, just exec.
if command -v context7 >/dev/null 2>&1; then
  context7 "$CMD"
  exec "$CMD"
else
  exec "$CMD"
fi
