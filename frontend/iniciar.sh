
#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$script_dir"

mode="start"
do_install="0"

for arg in "${@:-}"; do
  case "$arg" in
    start)
      mode="start"
      ;;
    build)
      mode="build"
      ;;
    test)
      mode="test"
      ;;
    --install|-i)
      do_install="1"
      ;;
    -h|--help|help)
      printf '%s\n' "Uso: ./iniciar.sh [start|build|test] [--install]" \
        "" \
        "start      Ejecuta: npm start (default, servidor de desarrollo)" \
        "build      Ejecuta: npm run build (crea build/ para producción)" \
        "test       Ejecuta: npm test (corre tests)" \
        "--install  Ejecuta: npm ci (si hay package-lock) o npm install" \
        "" \
        "Ejemplos:" \
        "  ./iniciar.sh" \
        "  ./iniciar.sh build" \
        "  ./iniciar.sh test --install"
      exit 0
      ;;
    *)
      printf '%s\n' "Argumento no reconocido: $arg" "Usa: ./iniciar.sh --help" >&2
      exit 2
      ;;
  esac
done

pids=$(lsof -ti:3000 || true)
if [[ -n "$pids" ]]; then
  echo "Liberando puerto 3000: $pids"
  kill -9 $pids
fi

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

case "$mode" in
  start)
    npm start
    ;;
  build)
    npm run build
    ;;
  test)
    npm test
    ;;
esac