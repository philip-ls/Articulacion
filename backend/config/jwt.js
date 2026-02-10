/**
 * Configuracion de JWT
 * este archivo contiene funciones para generar y verificar tokens JWT
 * los JWT se usan para autenticas sin necesidad de sesiones
 */

// Importar jsonwebtoken para manejar los tokens
const jwt = require("jsonwebtoken");

// Importar dotenv para acceder a las variables de entorno
require("dotenv").config();

/**
 * Generar un token JWT para un usuario
 * 
 * @param {object} payload - Datos que se incluiran en el token (id, email, rol)
 * @returns {string} - Token JWT generado
 */

const generateToken = (payload) => {
  try {
    //jwt.sing() crea y firma un token
    //Parametros:
    //1. payload: datis a incluir en token
    //2. secret: clave secreta para firmar (desde .env)
    //3. options: opciones adicionales como tiempo de expiración
    const token = jwt.sign(
      payload, //Datos de usuario
      process.env.JWT_SECRET, //Clase secreta desde .env
      { expiresIn: process.env.JWT_EXPIRES_IN } // Tiempo de expiracion  
    ); 

    return token;
  } catch (error) {
    console.error(" Error al general token JWT:",error.message);
    throw new Error("Error al generar token de autenticación");
  };
};

/**
 * Verificar un token JWT
 * 
 * @param {string} token - Token JWT a verificar
 * @returns {object} - Datis decodificados del token si es valido
 * @throws {Error} - Si el token es valido o ha expirado
 */