### INSTALACION
- Desde la carpeta base del proyecto (la misma donde esta este archivo si no lo han movido) ejecutar (requiere tener instalado docker):
```
  docker compose up --build
```
- Copiar en AMBAS carpetas backend y frontend el archivo .env con los secretos

Ejemplo de archivo .env con los secretos necesarios:
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://mongo:27017/expense_tracker
JWT_SECRET=jwt_secreto_secreto
JWT_REFRESH_SECRET=jwt_secreto_spooky_oooooh
CLOUDINARY_CLOUD_NAME=nuhUh
CLOUDINARY_API_KEY=123432123212322
CLOUDINARY_API_SECRET=secretoOOOOOOh
```
no se usan las credenciales reales por motivos de seguridad

- Después de esto ya funcionaria tanto en frontend como el backend, funcionan por separado pero el yml tiene la información para levantar ambos al mismo tiempo