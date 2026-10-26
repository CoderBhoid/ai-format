#!/usr/bin/env sh
set -e

INSTALL_DIR="${AIF_INSTALL_DIR:-$HOME/.local/bin}"
REPO="CoderBhoid/ai-format"
VERSION="v4.0.0"

echo "[*] Installing AIF V4: Deterministic Version Control & State Checkpoints for LLMs and Agents..."

mkdir -p "$INSTALL_DIR"

OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

case "$ARCH" in
    x86_64|amd64) TARGET_ARCH="x86_64" ;;
    aarch64|arm64) TARGET_ARCH="aarch64" ;;
    *) echo "[-] Unsupported architecture: $ARCH"; exit 1 ;;
esac

case "$OS" in
    linux) TARGET_OS="unknown-linux-gnu" ;;
    darwin) TARGET_OS="apple-darwin" ;;
    *) echo "[-] Unsupported OS: $OS"; exit 1 ;;
esac

TARGET="${TARGET_ARCH}-${TARGET_OS}"
DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${VERSION}/aif-${TARGET}.tar.gz"

INSTALLED=0
if command -v curl >/dev/null 2>&1; then
    TEMP_DIR="$(mktemp -d 2>/dev/null || mktemp -d -t 'aif')"
    if curl -sSfL "$DOWNLOAD_URL" -o "$TEMP_DIR/aif.tar.gz" 2>/dev/null; then
        tar -xzf "$TEMP_DIR/aif.tar.gz" -C "$INSTALL_DIR"
        chmod +x "$INSTALL_DIR/aif"
        rm -rf "$TEMP_DIR"
        INSTALLED=1
    fi
fi

if [ "$INSTALLED" -eq 0 ]; then
    echo "[*] Pre-built release binary not found online, compiling from source..."
    if command -v cargo >/dev/null 2>&1; then
        cargo install --git "https://github.com/${REPO}.git" --root "$HOME/.local"
        INSTALLED=1
    else
        echo "[-] Error: Neither prebuilt binary nor cargo was available."
        echo "[*] Install Rust via: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
        exit 1
    fi
fi

echo "[+] Successfully installed 'aif' to $INSTALL_DIR/aif"

case ":$PATH:" in
    *":$INSTALL_DIR:"*) ;;
    *) echo "[*] Note: Add $INSTALL_DIR to your PATH: export PATH=\"\$PATH:$INSTALL_DIR\"" ;;
esac

"$INSTALL_DIR/aif" init --project "default" --model "default"
echo "[+] AIF V4 initialization complete."
