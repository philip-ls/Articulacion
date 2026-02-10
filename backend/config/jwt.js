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
 * @param {string} tokenHeader - Token JWT a verificar
 * @returns {object} - Datis decodificados del token si es valido
 * @throws {Error} - Si el token es valido o ha expirado
 */

const verifyToken = (tokenHeader) => {
  try {
    //jwt.verify() verifica la firma del token y lo decodifica
    //Parametros:
    //1. token: el token JTW a verificat
    //2. secret: la misma clave secreta usada para firmarlo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return decoded;
  } catch (error) {
    //Diferentes tipos de errores 
    if (error.name === "TokenExpiredError") {
      throw new Error("Token Expirado");
    } else if (error.name === "JsonWebTokenerror"){
      throw new Error("Token Invalido");
    } else {
      throw new error("Error al verificar token");
    }
  }
};

/**
 * Extraer el token del header autorization
 * El token viene en formato "Bearer <token>"
 * 
 * @param {string} authHeader - Header Autorization de la petición
 * @returns {string|null} - Token extraido o null si no existe
 */

const extractToken  = (authHeader) => {
  // verifica que el header existe y empieza con "Bearer "
  if (authHeader && authHeader.startsWith("Bearer")) {
   //Extraer solo el token (Quitar "Bearer")
  return authHeader.substring(7);
  } 

  return null; // Si no hay token o formato incorrecto
};

// Exportar las funciones para usarlas en otros archivos
module.exports = {
  generateToken,
  verifyToken,
  extractToken,
};