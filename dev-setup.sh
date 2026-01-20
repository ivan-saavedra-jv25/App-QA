#!/bin/bash

# Script para configurar entorno de desarrollo con hot reload
set -e

echo "🔥 Configurando entorno de desarrollo con Hot Reload..."

# Limpiar contenedores existentes
echo "🧹 Limpiando contenedores existentes..."
docker-compose down
docker-compose -f docker-compose.dev.yml down

# Construir e iniciar con hot reload
echo "🚀 Iniciando contenedores con Hot Reload..."
docker-compose -f docker-compose.dev.yml up --build

echo ""
echo "🎉 Entorno de desarrollo listo!"
echo ""
echo "🌐 URLs de desarrollo:"
echo "   Frontend (React Dev): http://localhost:3000"
echo "   Backend (Nodemon):    http://localhost:4001"
echo ""
echo "⚡ Hot Reload activo:"
echo "   ✅ Backend: Nodemon detecta cambios en .js"
echo "   ✅ Frontend: React detecta cambios en .js/.jsx/.css"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "   Detener:   docker-compose -f docker-compose.dev.yml down"
echo "   Reconstruir: docker-compose -f docker-compose.dev.yml up --build"
echo ""
echo "💡 Los cambios se reflejarán instantáneamente!"
