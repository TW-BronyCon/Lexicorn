#!/usr/bin/env bash
# =============================================================================
# TWBC Storyteller — Local Dev Server Script
# =============================================================================
# Usage:
#   chmod +x dev.sh
#   ./dev.sh            → Install deps (if needed) then start the dev server
#   ./dev.sh --install  → Force re-install deps then start
#   ./dev.sh --help     → Show this help
# =============================================================================

set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

print_banner() {
  echo -e ""
  echo -e "${CYAN}╔══════════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║       🎭  TWBC Storyteller  —  Local Dev Mode       ║${NC}"
  echo -e "${CYAN}╚══════════════════════════════════════════════════════╝${NC}"
  echo -e ""
}

print_step() {
  echo -e "${CYAN}▶  $1${NC}"
}

print_ok() {
  echo -e "${GREEN}✔  $1${NC}"
}

print_warn() {
  echo -e "${YELLOW}⚠  $1${NC}"
}

print_error() {
  echo -e "${RED}✖  $1${NC}"
}

show_help() {
  print_banner
  echo "  A Nuxt 4 + Cloudflare Workers-style interactive story game."
  echo ""
  echo "  The dev server uses a local file-based KV store at .data/kv/"
  echo "  instead of Cloudflare KV, so no cloud credentials are needed."
  echo ""
  echo -e "  ${CYAN}Options:${NC}"
  echo "    (no args)   Install deps if missing, then start dev server"
  echo "    --install   Force re-install node_modules, then start"
  echo "    --help      Show this help message"
  echo ""
  echo -e "  ${CYAN}URLs (once running):${NC}"
  echo "    App        →  http://localhost:3000"
  echo "    Host Panel →  http://localhost:3000/host"
  echo "    Nuxt Dev   →  http://localhost:3000/__nuxt_devtools__/"
  echo ""
}

check_node() {
  if ! command -v node &>/dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
    exit 1
  fi

  NODE_VER=$(node -e "process.stdout.write(process.version)")
  NODE_MAJOR=$(echo "$NODE_VER" | tr -d 'v' | cut -d. -f1)

  if [ "$NODE_MAJOR" -lt 18 ]; then
    print_error "Node.js ${NODE_VER} detected. Version 18+ is required."
    exit 1
  fi

  print_ok "Node.js ${NODE_VER} detected"
}

check_npm() {
  if ! command -v npm &>/dev/null; then
    print_error "npm is not found. Please install Node.js from https://nodejs.org"
    exit 1
  fi
  print_ok "npm $(npm --version) detected"
}

install_deps() {
  print_step "Installing dependencies (npm install)..."
  cd "$SCRIPT_DIR"
  npm install
  print_ok "Dependencies installed"
}

ensure_deps() {
  if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
    print_warn "node_modules not found"
    install_deps
  else
    print_ok "node_modules found — skipping install (use --install to force)"
  fi
}

ensure_data_dir() {
  local kv_dir="$SCRIPT_DIR/.data/kv"
  if [ ! -d "$kv_dir" ]; then
    print_step "Creating local KV data directory at .data/kv/ ..."
    mkdir -p "$kv_dir"
    print_ok ".data/kv/ created"
  else
    print_ok "Local KV store at .data/kv/ is ready"
  fi
}

start_dev() {
  echo ""
  echo -e "${GREEN}══════════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}  Dev server starting...                              ${NC}"
  echo -e "${GREEN}  App        →  http://localhost:3000                 ${NC}"
  echo -e "${GREEN}  Host Panel →  http://localhost:3000/host            ${NC}"
  echo -e "${GREEN}  Press Ctrl+C to stop                                ${NC}"
  echo -e "${GREEN}══════════════════════════════════════════════════════${NC}"
  echo ""

  cd "$SCRIPT_DIR"
  npm run dev
}

# ─── Entrypoint ───────────────────────────────────────────────────────────────

FORCE_INSTALL=false

for arg in "$@"; do
  case "$arg" in
    --help|-h)
      show_help
      exit 0
      ;;
    --install|-i)
      FORCE_INSTALL=true
      ;;
    *)
      print_error "Unknown argument: $arg (use --help for usage)"
      exit 1
      ;;
  esac
done

print_banner

check_node
check_npm

if [ "$FORCE_INSTALL" = true ]; then
  install_deps
else
  ensure_deps
fi

ensure_data_dir
start_dev
