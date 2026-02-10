/**
 * Configuracion de subida de archivos
 *
 * Multer es un middleware para manejar la subida de archivos
 * Este archivo configura como y donde se guardan las imagenes
 */

// Importar multer para manejar archivos
const multer = require("multer");

// Importar path para trabajar rutas de archivos
const path = require("path");

// Importar fs para verificar /crear directorios
const fs = require("fs");

// importar dotenv para variables de entorno
require("dotenv").config();

// Obtener la ruta donde se guardan los archivos
const uploadPath = process.env.UPLOAD_PATH || "./uploads";

// Verificar si la carpeta uploads existe, si no, crearla
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log("Carpeta ${uploadPath} creada");
}

/**
 * Configuracion de almacenamiento de multer
 * Define donde y como se guardan los archivos
 */

const storage = multer.diskStorage({
  /**
   * Destination: define la carpeta destino donde se guardara el archivo
   *
   * @param {object} req - Objeto de peticion HTTP
   * @param {object} file - Archivo que esta subiendo
   * @param {function} cb - Callback que se llama con (error, destination)
   */

  destination: function (req, file, cb) {
    // cb(null, ruta) -> sin error, ruta = carpeta destino
    cb(null, uploadPath);
  },

  /**
   * filename: define el nombre con el que se guardara el archivo
   * formato: timestamp-nombreoriginal.ext
   *
   * @param {object} req - Objeto de peticion HTTP
   * @param {object} file - Archivo que esta subiendo
   * @param {function} cb - Callback que se llama con (error, filename)
   */

  filename: function (req, file, cb) {
    // Generar un nombre unico usandi timestamp + nombre original
    // Date.now() genera un timestamp unico
    // path.extname() extrae la extension del archivo (.jpg, .png, etc)
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

/**
 * filtro para validar el tipo de archivo
 * solo permite imagenes (jpg, jpeg, png, gif)
 *
 * @param {object} req - Objeto de peticion HTTP
 * @param {object} file - Archivo que esta subiendo
 * @param {function} cb - Callback que se llama con (error, acceptFile)
 */
