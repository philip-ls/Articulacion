/**
 * MODELO CATEGORIA
 * Define la tabla Categoria en la base de datos 
 * Almacena las categorias principales de los productos
 */

//Importar DataTypes de sequelize
const { DataTypes } = require('sequelize');

//Importar instancia de sequelize
const { sequelize } = require('../config/database');

/**
 * Definir el modelo de categoria
 */
const categoria = sequelize.define('Categoria', {
    // Campos de la tabla
    // Id Identificador unico  (PRIMARY KEY)
    ID: {
        TYPE:DataTypes.INTEGER,
        primarykey: true,
        autoIncrement: true,
        allowNull: false
    },
});