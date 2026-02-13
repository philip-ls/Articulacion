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

    nombre: {
        type:DataTypes.STRING(100),
        allowNull: false,
        unique: {
            msg: 'ya existe una categoria con ese nombre'
        },
        validate:{
            notEmpty: {
                msg: 'El nombre de la categoria no puede estar vacio'
            },
            len: {
                args: [2, 100],
                msg: 'El nombre debe tener entre 2 y 100 caracteres'
            }
        }
    },

    /**
     * Descripcion de la categoria
     */
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },

    /**
     * Activo estado de la categoria
     * si es false la categoria y todas sus
     * subcategorias y productos se ocultan
     */
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }

}, {
// Opciones del modelo

    tableName: 'categorias',
    timestamps: true, // Agrega campos de createdAt y updatedAt

    /**
     * Hooks Acciones automaticas
     */

    hooks: {
        /**
         * afterUpdate: se ejecuta despues de actualizar una categoria
         * Si se desactiva una categoria se desactivan todas sus subcategorias y profuctos 
         */
        afterupdate: async (categoria, options) => {
            //Verificar si el campo activo cambio
            if (categoria.changed('activo') && !categoria.activo) {
                console.log('Desactivando categoria ${categoria.nombre}');

                // Importar modelos (aqui para evitar dependencias circulares)
                const Subcategoria = require('./Subcategoria');
                const Producto = require('./Producto');

                try {
                    // Paso 1 desactivar las subcategorias de esta categoria
                    const subcategorias = await Subcategoria.findAll({
                        where: {categoriaId: categoria.id}
                    });

                    for (const subcategoria of subcategorias) {
                        await subcategoria.update({ activo: false }, { transaction: options.transaction });
                        console.log(' Subcategoria desactivada: {subcategoria.nombre}');
                    }

                    // Paso 2 desactivar los productos de esta categoria
                    const productos = await Producto.findAll({
                        where: {categoriaId: categoria.id}
                    });

                    for (const producto of productos) {
                        await producto.update({ activo: false }, { transaction: options.transaction });
                        console.log(' Subcategoria desactivada: {subcategoria.nombre}');
                    }

                console.log('categoria y elementos relacionados desactivados correctamente');
            } catch (error) {
                console.error('Error al desactivar elementos relacionados: ', error);
                throw error;
            }
        }
     } // si se activa una categoria no se activan automaticamente las subcategorias y productos
    }
});

// METODOS DE INSTANCIA
/**
 * Metodo para contar subcategorias de esta categoria
 * 
 * @return {Promise<number>} numero de subcategorias
 */
categoria.prototype.contarSubcategorias = async function() {
    const Subcategoria = require('./Subcategoria');
    return await Subcategoria.count({ where: {categoriaId: this.id}});
};

/**
 * Metodo para contar productos de esta categoria
 */
categoria.prototype.contarSubcategorias = async function() {
    const subcategoria = require('./Subcategoria');
    return await subcategoria.count({ where: {categoriaId: this.id}});
};

/**
 * Metodo para contar subcategorias de esta categoria
 * 
 * @return {Promise<number>} numero de subcategorias
 */
categoria.prototype.contarProductos = async function() {
    const Subcategoria = require('./Subcategoria');
    return await Producto.count({ where: {categoriaId: this.id}});
};

// Exportar modelo categoria
module.exports = categoria;