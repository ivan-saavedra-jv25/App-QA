FROM node:20-alpine as build

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Pasar variables de entorno al build
ARG REACT_APP_API_URL
ARG REACT_APP_ENV

# Construir aplicación
RUN npm run build

# Producción
FROM nginx:alpine

# Copiar build al nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer puerto
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
