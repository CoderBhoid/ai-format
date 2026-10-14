#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN_PATH="$SCRIPT_DIR/target/release/aif"

if [ ! -f "$BIN_PATH" ]; then
    echo "[*] Compiling AIF V4 release binary..."
    cargo build --release --manifest-path "$SCRIPT_DIR/Cargo.toml"
fi

exec "$BIN_PATH" "$@"
