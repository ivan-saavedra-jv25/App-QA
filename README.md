# App-QA

Una aplicación web completa para la gestión de planes de pruebas y casos de prueba, diseñada para equipos de QA y desarrollo que necesitan un control eficiente sobre sus procesos de testing.

## 🚀 Descripción General

App-QA es una plataforma integral que permite crear, gestionar y dar seguimiento a planes de pruebas y sus casos de prueba asociados. La aplicación facilita la organización del trabajo de testing, proporcionando visibilidad clara sobre el progreso de las pruebas y el estado de cada componente del sistema.

## ✨ Características Principales

### 📋 Gestión de Planes de Pruebas
- **Creación de Planes**: Define planes de pruebas con nombre, descripción y estado
- **Seguimiento de Progreso**: Visualización en tiempo real del avance de cada plan
- **Estados Dinámicos**: Los planes cambian automáticamente de estado según el progreso de los casos de prueba

### 🧪 Gestión de Casos de Prueba
- **Casos Detallados**: Cada caso de prueba incluye:
  - Nombre único y descriptivo
  - Descripción detallada de lo que valida
  - Tipo de validación (ej: funcional, integración, rendimiento)
  - Prioridad (P1: Alta, P2: Media, P3: Baja)
  - Estado (PENDING, PASSED, FAILED, NA)

### 📊 Visualización y Control
- **Interfaz Intuitiva**: Diseño responsive que funciona en desktop y móvil
- **Colapsado Inteligente**: Los casos de prueba con estado PASSED se colapsan automáticamente para reducir el desorden visual
- **Resaltado Interactivo**: Click en casos de prueba para resaltarlos y facilitar el seguimiento
- **Indicadores Visuales**: Badges de colores para prioridades y estados

### 🔄 Estados y Flujos
- **Estados de Plan**: PENDING → IN_PROGRESS → COMPLETED
- **Estados de Caso**: PENDING → PASSED/FAILED/NA
- **Actualización Automática**: El progreso se recalcula automáticamente al cambiar estados

### 🛠️ Funcionalidades Adicionales
- **Limpieza de Base de Datos**: Endpoint para resetear todos los datos y empezar desde cero
- **API RESTful**: Endpoints completos para integración con otros sistemas
- **Validaciones Robustas**: Validación de datos en frontend y backend
- **Manejo de Errores**: Mensajes claros y manejo elegante de errores

## 🏗️ Arquitectura Técnica

### Backend
- **Node.js + Express**: Servidor robusto y escalable
- **Sequelize ORM**: Gestión de base de datos con MySQL
- **MySQL**: Base de datos relacional para persistencia de datos
- **Arquitectura MVC**: Separación clara de responsabilidades

### Frontend
- **React**: Biblioteca moderna para interfaces de usuario
- **Bootstrap 5**: Framework CSS para diseño responsive
- **Componentes Modulares**: Código reutilizable y mantenible
- **Estado Reactivo**: Gestión eficiente del estado de la aplicación

### Base de Datos
- **Modelos Relacionales**: Planes y Casos de Prueba con relaciones claras
- **Migraciones**: Control de versiones del esquema de base de datos
- **Transacciones**: Integridad de datos en operaciones críticas

## 💡 Beneficios Clave

### 🎯 Para Equipos de QA
1. **Organización Centralizada**: Todos los casos de prueba en un solo lugar
2. **Visibilidad Total**: Saber exactamente qué está probado y qué falta
3. **Priorización Clara**: Identificar rápidamente los casos críticos (P1)
4. **Historial Completo**: Registro de todos los cambios y estados

### 🚀 Para Equipos de Desarrollo
1. **Integración Fluida**: API RESTful para integración con CI/CD
2. **Automatización**: Estados que se actualizan automáticamente
3. **Reportes en Tiempo Real**: Progreso visible sin necesidad de reportes manuales
4. **Colaboración Eficiente**: Todos los equipos ven la misma información

### 📈 Para la Organización
1. **Calidad Mejorada**: Seguimiento sistemático de las pruebas
2. **Tiempo Reducido**: Menos tiempo en administración, más en testing
3. **Decisiones Informadas**: Datos concretos sobre el estado de calidad
4. **Escalabilidad**: Sistema que crece con las necesidades del equipo

## 🎯 Casos de Uso Típicos

### 1. Proyectos de Desarrollo de Software
- Equipos ágiles que necesitan gestionar pruebas sprint a sprint
- Proyectos grandes con múltiples módulos y componentes
- Integración continua con pipelines de CI/CD

### 2. Equipos de QA Independientes
- Consultoras de testing que gestionan múltiples clientes
- Equipos internos de calidad de software
- Proyectos de migración y actualización de sistemas

### 3. Organizaciones Reguladas
- Empresas que necesitan auditorías de calidad
- Proyectos con requisitos de cumplimiento normativo
- Sistemas críticos que requieren documentación completa

## 🚀 Empezando

### Prerrequisitos
- Node.js 16+ 
- MySQL 8.0+
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd apptest

# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install

# Configurar base de datos
# Crear base de datos MySQL
# Configurar conexión en backend/config/config.js

# Ejecutar migraciones
cd backend
npx sequelize-cli db:migrate

# Iniciar servidor backend
npm start

# Iniciar aplicación frontend
cd ../frontend
npm start
```

### Configuración
1. Configurar la conexión a la base de datos en `backend/config/config.js`
2. Ajustar la URL del API en `frontend/src/api.js` si es necesario
3. Ejecutar las migraciones para crear las tablas

## 📚 Documentación de la API

### Endpoints Principales
- `GET /api/plans` - Listar todos los planes
- `POST /api/plans` - Crear nuevo plan
- `GET /api/plans/:id` - Obtener detalles de un plan
- `PUT /api/plans/:id` - Actualizar plan
- `DELETE /api/plans/:id` - Eliminar plan

### Endpoints de Casos de Prueba
- `GET /api/test-cases/plan/:planId` - Listar casos de un plan
- `POST /api/test-cases/plan/:planId` - Crear caso de prueba
- `PUT /api/test-cases/:id` - Actualizar caso de prueba
- `PATCH /api/test-cases/:id/status` - Actualizar estado
- `DELETE /api/test-cases/:id` - Eliminar caso de prueba

### Endpoint de Utilidad
- `DELETE /api/cleanup` - Limpiar todas las tablas

## 🤝 Contribución

Este proyecto está diseñado para ser extensible y mejorado continuamente. Las áreas de mejora incluyen:

- Integración con herramientas de test automation
- Reportes avanzados y analytics
- Notificaciones y alertas
- Integración con sistemas de gestión de proyectos
- Soporte para múltiples tipos de pruebas

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

**App-QA** - Transformando la gestión de pruebas de software en una experiencia eficiente y colaborativa.
