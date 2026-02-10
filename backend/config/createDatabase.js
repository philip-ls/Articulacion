/**
 * script de inicialización de la base de datos
 * este script crea la base de datos si no existe
 * debe ejecutarse una sola vez al iniciar el servidor
 */

// Importar mysql2 para la conexión directa
const mysql = require("mysql2/promise");

// Importar dotenv para cargar las variables de entorno
require("dotenv").config();

// Funcion para crear la base de datos
const createDataBase = async () => {
  let connection;

  try {
    console.log(" Iniciando creación de la base de datos...\n");

    //Conectar a MySQL sin especificar la base de datos
    console.log(" Conectando a MySQL...");
    connection = await musql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    });

    console.log(" Conexión a MySQL establecida.\n");

    //Crear la base de datos si no existe
    const dbName = process.env.DB_NAME || "ecommerce_db";
    console.log(`creando base de datos: $(dbName)...`);
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` creada/veridicada exitosamente\n`,
    );

    //cerrar conexión
    await connection.end();

    console.log(
      " ¡Proceso completado! Ahora puedes iniciar el servidor con npm start\n",
    );
  } catch (error) {
    console.error("Error al crear la base de datos:", error.message);
    console.error("\n verifica que:");
    console.error("1. XAMPP esta corriendo");
    console.error("2. MySQL este iniciado en XAMPP");
    console.error("3. Las credenciales en .env sean correctas\n");

    if (connection) {
      await connection.end();
    }

    process.exit(1);
  }
};

//Ejecutar la funcion para crear la base de datos
createDataBase();
