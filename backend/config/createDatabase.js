/**
 * script de inicialización de la base de datos
 * este script crea la base de datos si no existe
 * debe ejecutarse una sola vez al iniciar el servidor
 */

// Importar mysql2 para la conexión directa
const mysql = require("mysql2/promise");

// Importar dotenv para cargar las variables de entorno
require("dotenv").config();

