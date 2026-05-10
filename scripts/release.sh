#!/bin/bash
set -e
VERSION=${1:-v0.1.0}
OUTPUT=dist
rm -rf $OUTPUT
mkdir -p $OUTPUT

echo "Building Magic MariaDB Sync $VERSION"

for TARGET in linux/amd64 linux/arm64 windows/amd64; do
  OS=$(echo $TARGET | cut -d/ -f1)
  ARCH=$(echo $TARGET | cut -d/ -f2)
  EXT=""
  if [ "$OS" = "windows" ]; then
    EXT=".exe"
  fi
  OUT="$OUTPUT/magicsync-${OS}-${ARCH}${EXT}"
  echo "Building $TARGET -> $OUT"
  GOOS=$OS GOARCH=$ARCH go build -ldflags "-s -w -X main.version=$VERSION" -o $OUT ./cmd/magicsync
done

echo "Done. Binaries in $OUTPUT/"
ls -la $OUTPUT/