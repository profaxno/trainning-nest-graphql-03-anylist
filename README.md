<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Ejecutar en desarrollo
1. Tener Nest CLI instalado ```npm i -g @nestjs/cli```
2. Clonar el proyecto
3. Clonar el archivo __.env.template__ y renombrar la copia a ```.env```
4. LLenar las variables de entornos definidas en el ```.env```
5. Ejecutar ```npm install```
6. Levantar db ```docker-compose up -d```
7. Ejecutar la app en dev: ```npm run start:dev```
8. Reconstruir la base de datos ```localhost:3000/api/seed```