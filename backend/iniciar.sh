#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$script_dir"

mode="dev"
do_install="0"

for arg in "$@"; do
  case "$arg" in
    dev)
      mode="dev"
      ;;
    prod|start)
      mode="prod"
      ;;
    --install|-i)
      do_install="1"
      ;;
    -h|--help|help)
      printf '%s\n' "Uso: ./iniciar.sh [dev|prod] [--install]" \
        "" \
        "dev        Ejecuta: npm run dev (default)" \
        "prod       Ejecuta: npm start" \
        "--install  Ejecuta: npm ci (si hay package-lock) o npm install"
      exit 0
      ;;
    *)
      printf '%s\n' "Argumento no reconocido: $arg" >&2
      exit 2
      ;;
  esac
done

pids=$(lsof -ti:4000 || true)
if [[ -n "$pids" ]]; then
  echo "Liberando puerto 4000: $pids"
  kill -9 $pids
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm no encontrado en PATH" >&2
  exit 127
fi

if [[ "$do_install" == "1" ]]; then
  [[ -f package-lock.json ]] && npm ci || npm install
fi

if [[ "$mode" == "dev" ]]; then
  npm run dev
else
  npm start
fi
