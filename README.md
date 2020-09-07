# orbittas-iot

Se debe generar un archivo .env para correr el servidor y llenar las variables APP_KEY, SECRET, asi como las variables correspondientes a base de datos y servidor SMTP como se observa en el archivo .env.example, SECRET debe ser una cadena aleatoria de letras y numeros de 63 caracteres, APP_KEY se genera usando

adonis key:generate

Se debe correr las migraciones para acondicionar la base de datos con las tablas necesarias usando

adonis migration:run

Para iniciar el servidor usar

adonis serve

Para iniciar el servidor y chequear cambios en el codigo

adonis serve --dev
