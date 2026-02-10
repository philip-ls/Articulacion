/**CONFIGURACION DE LA BASE DE DATOS */

// Importar sequelize
const { Sequelize } = require("sequelize");

//Importar dotenv para variables| de entorno
require("dotenv").config();

//Crear una instancia de Sequelize
const sequelize = new Sequelize(
  Process.env.DB_NAME,
  Process.env.DB_USER,
  Process.env.DB_PASSWORD,
  {
    host: Process.env.DB_HOST,
    port: Process.env.DB_PORT,
    dialect: "mysql",

    //configuración de pool de conexiones
    //mantiene las conexiones abiertas para mejorar el rendimiento
    pool: {
      max: 5, //Número máximo de conexiones en el pool
      min: 0, //Número mínimo de conexiones en el pool
      acquire: 30000, //Tiempo máximo (en ms) que sequelize intentará obtener una conexión antes de lanzar un error
      idle: 10000, //Tiempo máximo (en ms) que una conexión puede estar inactiva antes de ser liberada
    },
    //configuración de logging
    //Permite ver las consultas mySQL por consola
    logging: process.env.NODE_ENV === "development" ? console.log : false, //Habilita el logging solo en desarrollo


    //zona horaria
    timezone: "-05:00", //Zona horaria de colombia

    //opciones adicionales
    define: {
      //timestamps: true crea automaticamente los campos createdAt y updatedAt en las tablas.
      timestamps: true, 
      //underscored: true usa snake_case para los nombres de columnas en lugar de camelCase.
      underscored: true, 
      //freezeTableName: true usa el nombre del modelo tal cual para la tabla
      freezeTableName: true, 
    },
  },
);
/*Funcion para probar la conexión de la base de datos
esta funcion se llamara al iniciar el servidor*/
const testConnection = async () => {
  try {
    //intentar autenticar con la base de datos
    await sequelize.authenticate();
    console.log("Conexión a MySQL establecida correctamente.");
    return true;
  } catch (error) {
    console.error("X Error al conectar con MySQL:", error.message);
    console.error(" Verifica que XAMPP este corriendo y las credenciales en .env sean correctas.");
    return false;
  }
};

//*
/**Funcion para sincronizar los modelos con la base de datos 
 * esta función creara las tablas automaticamente basandose en los modelos

@param {boolean} force - Si es true, elimina y recrea todas las tablas
@param {boolean} alter - Si es true, modifica las tablas existentes para que coincidan con los modelos

*/


const syncDataBase = async (force = false, alter = false) => {
  try {
    //sincronizar todos los modelos con la base de datos
    await sequelize.sync({ force, alter });

    if (force) {
      console.log("Base de datos sincronizada: todas las tablas recreadas");
    } else if (alter) {
      console.log("Base de datos sincronizada (tablas alteradas segun los modelos)");
    } else {
      console.log("Base de datos sincronizada correctamente");
    }


    return true;
  } catch (error) {
    console.error("X Error al sincronizar la base de datos:", error.message);
    return false;
  }
};

// Exportar la instancia de sequelize y las funciones
module.exports = {
    sequelize,
    testConnection,
    syncDatabase,
};