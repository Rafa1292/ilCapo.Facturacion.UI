
# Usar una imagen base más ligera para el despliegue final
FROM nginx:alpine

# Copia el archivo de configuración personalizado de Nginx al contenedor
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia los archivos estáticos de la carpeta "build" a la ubicación de Nginx en el contenedor
COPY ./build /usr/share/nginx/html

# Expone el puerto 80 para acceder a la aplicación
EXPOSE 3001

# Inicia el servidor Nginx para servir la aplicación React
CMD ["nginx", "-g", "daemon off;"]