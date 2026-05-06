#!/usr/bin/env bash
# Wrapper script that runs a command.
# context7 is available as a built‑in skill/plugin — no separate binary needed.
# Usage: run-with-context7.sh "command"

set -euo pipefail

if [[ $# -eq 0 ]]; then
  echo "Usage: $0 \"command\"" >&2
  exit 1
fi

exec "$@"
