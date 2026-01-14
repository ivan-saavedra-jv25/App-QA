#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$script_dir"

mode="dev"
do_install="0"

for arg in "${@:-}"; do
  case "$arg" in
    dev)
      mode="dev"
      ;;
    prod|start)
      mode="start"
      ;;
    --install|-i)
      do_install="1"
      ;;
    -h|--help|help)
      printf '%s\n' "Uso: ./iniciar.sh [dev|prod] [--install]" \
        "" \
        "dev        Ejecuta: npm run dev (default)" \
        "prod       Ejecuta: npm start" \
        "--install  Ejecuta: npm ci (si hay package-lock) o npm install" \
        "" \
        "Ejemplos:" \
        "  ./iniciar.sh" \
        "  ./iniciar.sh dev" \
        "  ./iniciar.sh prod --install"
      exit 0
      ;;
    *)
      printf '%s\n' "Argumento no reconocido: $arg" "Usa: ./iniciar.sh --help" >&2
      exit 2
      ;;
  esac
done

if ! command -v npm >/dev/null 2>&1; then
  printf '%s\n' "No se encontró 'npm' en PATH. Instalá Node.js/npm e intentá de nuevo." >&2
  exit 127
fi

if [[ "$do_install" == "1" ]]; then
  if [[ -f "package-lock.json" ]]; then
    npm ci
  else
    npm install
  fi
fi

if [[ "$mode" == "dev" ]]; then
  npm run dev
else
  npm start
fi