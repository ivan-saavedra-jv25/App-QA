# App-QA con Docker

Configuración completa para ejecutar App-QA en contenedores Docker con MySQL, backend Node.js y frontend React.

## 🐳 Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MySQL DB     │    │  Node.js API   │    │ React + Nginx │
│   (Port 3306)  │◄──►│  (Port 4000)  │◄──►│  (Port 80)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Inicio Rápido

### Prerrequisitos
- Docker Desktop
- Docker Compose

### Ejecutar todo el stack
```bash
# Clonar el repositorio
git clone <repository-url>
cd apptest

# Iniciar todos los servicios
docker-compose up --build
```

### Acceder a las aplicaciones
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:4000
- **Base de datos**: localhost:3306 (usuario: ivan.dev, password: root)

## 📋 Servicios

### 1. MySQL
- **Imagen**: mysql:8.0
- **Base de datos**: DBQA
- **Usuario**: ivan.dev
- **Password**: root
- **Persistencia**: Volume `mysql_data`

### 2. Backend Node.js
- **Node**: 18-alpine
- **Puerto**: 4000
- **Logs**: Montados en `./backend/logs`
- **Variables de entorno**: Configuradas para conectar a MySQL

### 3. Frontend React + Nginx
- **Build**: Multi-stage (Node.js build + Nginx serve)
- **Puerto**: 80
- **Proxy**: `/api/*` → `http://backend:4000`
- **Static files**: Cache de 1 año

## 🛠️ Comandos Útiles

### Iniciar servicios
```bash
# Iniciar en background
docker-compose up -d --build

# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### Detener servicios
```bash
docker-compose down
```

### Reconstruir y reiniciar
```bash
docker-compose down
docker-compose up --build
```

### Acceder a contenedores
```bash
# Backend
docker-compose exec backend sh

# MySQL
docker-compose exec mysql mysql -u ivan.dev -proot DBQA

# Frontend (nginx logs)
docker-compose exec frontend nginx -s reload
```

## 📁 Estructura de Archivos

```
apptest/
├── docker-compose.yml          # Configuración principal
├── backend/
│   ├── Dockerfile           # Build del backend
│   └── logs/              # Logs montados
├── frontend/
│   ├── Dockerfile           # Build del frontend
│   └── nginx.conf           # Configuración de nginx
├── mysql-init/
│   └── 01-init.sql        # Script de inicialización BD
└── .dockerignore           # Archivos ignorados
```

## 🔧 Variables de Entorno

Las variables de entorno se configuran en `docker-compose.yml`:

```yaml
backend:
  environment:
    DB_HOST: mysql          # Host del contenedor MySQL
    DB_PORT: 3306          # Puerto MySQL
    DB_USER: ivan.dev       # Usuario BD
    DB_PASSWORD: root        # Password BD
    DB_NAME: DBQA          # Nombre BD
    DB_DIALECT: mysql       # Dialecto Sequelize
    PORT: 4000             # Puerto backend
    NODE_ENV: development    # Entorno Node
```

## 🐛 Troubleshooting

### Problemas comunes

**1. Puerto en uso**
```bash
# Ver qué usa el puerto
lsof -i :4000
lsof -i :80
lsof -i :3306

# Limpiar
docker-compose down
docker system prune -f
```

**2. Base de datos no conecta**
```bash
# Ver logs de MySQL
docker-compose logs mysql

# Reiniciar solo MySQL
docker-compose restart mysql
```

**3. Frontend no carga**
```bash
# Ver logs de frontend
docker-compose logs frontend

# Reconstruir frontend
docker-compose up --build frontend
```

## 📊 Monitorización

### Ver estado de los servicios
```bash
# Estado general
docker-compose ps

# Recursos usados
docker stats

# Logs en tiempo real
docker-compose logs -f
```

## 🔄 Desarrollo vs Producción

### Desarrollo (actual)
- Variables de entorno: `NODE_ENV=development`
- Logs: Verbosos y en archivo
- Hot reload: Funciona en backend

### Producción
Cambiar en `docker-compose.yml`:
```yaml
backend:
  environment:
    NODE_ENV: production
```

## 🚀 Deploy en Producción

Para deploy en producción:
1. Cambiar variables de entorno sensibles
2. Usar secrets de Docker
3. Configurar HTTPS con certificados
4. Ajustar recursos (memory/CPU limits)
5. Configurar backup de base de datos

---

**Con esta configuración puedes ejecutar toda la App-QA en contenedores Docker con un solo comando!**
