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
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4001
- **Base de datos**: localhost:3307 (usuario: ivan.dev, password: root)

## 📋 Servicios

### 1. MySQL
- **Imagen**: mysql:8.0
- **Base de datos**: DBQA
- **Usuario**: ivan.dev
- **Password**: ***
- **Persistencia**: Volume `mysql_data`


### 2. Backend Node.js
- **Node**: 18-alpine
- **Puerto**: 4001
- **Logs**: Montados en `./backend/logs`
- **Variables**: `.env.backend`

### 3. Frontend React + Nginx
- **Build**: Multi-stage (Node.js build + Nginx serve)
- **Puerto**: 3000
- **Proxy**: `/api/*` → `http://backend:4000`
- **Static files**: Cache de 1 año
- **Variables**: `.env.frontend`

## 📁 Archivos de Entorno

### Estructura de archivos .env
```
apptest/
├── .env.mysql          # Variables MySQL
├── .env.backend        # Variables Backend
├── .env.frontend       # Variables Frontend
└── docker-compose.yml  # Orquestación
```

### .env.mysql
```env
# MySQL Configuration
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=DBQA
MYSQL_USER=ivan.dev
MYSQL_PASSWORD=root
```

### .env.backend
```env
# Backend Configuration
DB_HOST=mysql
DB_PORT=3306
DB_USER=ivan.dev
DB_PASSWORD=root
DB_NAME=DBQA
DB_DIALECT=mysql
PORT=4000
NODE_ENV=development
```

### .env.frontend
```env
# Frontend Configuration
REACT_APP_API_URL=http://localhost:4001
REACT_APP_ENV=development
```

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

## 🔧 Variables de Entorno

Las variables de entorno se cargan desde archivos separados:

```yaml
services:
  mysql:
    env_file:
      - .env.mysql
  
  backend:
    env_file:
      - .env.backend
  
  frontend:
    env_file:
      - .env.frontend
    build:
      args:
        - REACT_APP_API_URL=${REACT_APP_API_URL:-http://localhost:4001}
        - REACT_APP_ENV=${REACT_APP_ENV:-development}
```

## 🌐 Configuración para Producción

### Crear archivos de entorno para producción
```bash
# Copiar y modificar para producción
cp .env.mysql .env.mysql.prod
cp .env.backend .env.backend.prod
cp .env.frontend .env.frontend.prod

# Modificar valores para producción
# .env.mysql.prod: Cambiar contraseñas
# .env.backend.prod: NODE_ENV=production
# .env.frontend.prod: REACT_APP_ENV=production
```

### Usar archivos de producción
```bash
# Usar archivos específicos
docker-compose --env-file .env.mysql.prod \
             --env-file .env.backend.prod \
             --env-file .env.frontend.prod \
             up --build
```

## 🐛 Troubleshooting

### Problemas comunes

**1. Variables de entorno no cargan**
```bash
# Verificar archivos .env
ls -la .env.*

# Verificar permisos
cat .env.mysql
cat .env.backend
cat .env.frontend
```

**2. Puerto en uso**
```bash
# Ver qué usa el puerto
lsof -i :4000
lsof -i :80
lsof -i :3306

# Limpiar
docker-compose down
docker system prune -f
```

**3. Base de datos no conecta**
```bash
# Ver logs de MySQL
docker-compose logs mysql

# Verificar variables de entorno
docker-compose exec backend env | grep DB_

# Reiniciar solo MySQL
docker-compose restart mysql
```

**4. Frontend no carga**
```bash
# Ver logs de frontend
docker-compose logs frontend

# Verificar variables de entorno
docker-compose exec frontend env | grep REACT_APP_

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

### Ver variables de entorno en contenedores
```bash
# MySQL
docker-compose exec mysql env

# Backend
docker-compose exec backend env

# Frontend
docker-compose exec frontend env
```

## 🔄 Desarrollo vs Producción

### Desarrollo (actual)
```env
# .env.backend
NODE_ENV=development
PORT=4000

# .env.frontend
REACT_APP_API_URL=http://localhost:4000
REACT_APP_ENV=development
```

### Producción
```env
# .env.backend
NODE_ENV=production
PORT=4000

# .env.frontend
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_ENV=production
```

## 🚀 Deploy en Producción

### Para deploy en producción:
1. **Crear archivos .env.prod** con valores de producción
2. **Cambiar contraseñas** en `.env.mysql.prod`
3. **Configurar HTTPS** con certificados
4. **Ajustar recursos** (memory/CPU limits)
5. **Configurar backup** de base de datos
6. **Usar secrets de Docker** para datos sensibles

### Ejemplo para producción:
```bash
# Crear docker-compose.prod.yml
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

---

**Con esta configuración puedes ejecutar toda la App-QA en contenedores Docker con variables de entorno separadas para cada servicio!**
