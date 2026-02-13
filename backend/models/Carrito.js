/**
 * MODELO CARRITO
 * Define la tabla Carrito en la base de datos 
 * Almacena los productos que cada usuario ha agregado a su carrito
 */

//Importar DataTypes de sequelize
const { DataTypes } = require('sequelize');

//Importar instancia de sequelize
const { sequelize } = require('../config/database');
const { table } = require('console');

/**
 * Definir el modelo de carrito
 */
const carrito = sequelize.define('Carrito', {
    // Campos de la tabla
    // Id Identificador unico  (PRIMARY KEY)
    ID: {
        TYPE:DataTypes.INTEGER,
        primarykey: true,
        autoIncrement: true,
        allowNull: false
    },
    

    // UsuarioId - ID del usuario dueño del carrito (FOREIGN KEY)
    UsuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Usuarios', // nombre de la tabla Usuario
          key: 'ID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // si se elimina el usuario, se elimina su carrito
        validate:{
          notnull: {
            msg: 'Debe especificar un usuario'
          }
        }
      },
       
      // ProductoId - ID del producto en el carrito (FOREIGN KEY)
    ProductoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Productos', // nombre de la tabla Producto
          key: 'ID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // se elimina el producto del carrito
        validate:{
          notnull: {
            msg: 'Debe especificar un producto'
          }
        }
      },

      // Cantidad de este producto en el carrito
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate:{
          isInt: {
            msg: 'La cantidad debe ser un número entero'
          },
          min: {
            args: [1],
            msg: 'La cantidad debe ser al menos 1'
          }
        }
      },

      /**
       * Precio Unitario del producto al momento de agregarlo al carrito
       * se guarda para mantener el precio aunque el producto cambie de precio
       */
      preciounitario: {
        Type: DataTypes.DECIMAL(10,2),
        allowNull: false,
        validate:{
          isDecimal: {
            msg: 'El precio debe ser un numero decimal valido'
          },
          min: {
            args: [0],
            msg: 'El precio no puede ser negativo'
          }
        }
      },
  }, {
    //opciones del modelo

    tableName: 'carritos', // nombre de la tabla en la base de datos
    timestamps: true, // agrega campos createdAt y updatedAt
    //indices para mejorar las busquedas
    indexes: [
      {
      //indice para buscar carrito por usuario
      fields: ['UsuarioId']
      },
      
      {
      //indice compuesto: un usuario no puede tener el mismo producto duplicado
      unique: true,
      fields: ['UsuarioId', 'ProductoId'],
      name:'usuario_producto_unique'
      },
    ],
    /**
* Hooks Acciones automaticas
*/

    hooks: {
        /**
         * beforeCreate: se ejecuta antes de crear una subcategoria
         * verifica que la categoria padre este activa
         */
        beforeCreate: async (subcategoria) => {
            const categoria = require('./Categoria');

            //buscar categoria padre
            const categoria = await categoria.findByPk(subcategoria.categoriaId);

            if (!categoria) {
                throw new Error('La categoria seleccionada no existe');
            }

            if (!categoria.activo) {
                throw new Error('No se puede crear una subcategoria en una categoria inactiva')
            }
        },
        /**
         * afterUpdate: se ejecuta despues de actualizar una subcategoria
         * Si se desactiva una subcategoria se desactivan todas sus productos
         */
        afterUpdate: async (subcategoria, options) => {
            //Verificar si el campo activo cambio
            if (subcategoria.changed('activo') && !subcategoria.activo) {
                console.log(`Desactivando subcategoria ${subcategoria.nombre}`);

                // Importar modelos (aqui para evitar dependencias circulares)
                const Producto = require('./Producto');

                try {
                    // Paso 1 desactivar los productos de esta subcategoria
                    const productos = await Producto.findAll({
                        where: {subcategoriaId: subcategoria.id}
                    });

                    for (const producto of productos) {
                        await producto.update({ activo: false }, { transaction: options.transaction });
                        console.log(` Producto desactivado: ${producto.nombre}`);
                    }
                    console.log('Subcategoria y productos relacionados desactivados correctamente');
                } catch (error) {
                    console.error('Error al desactivar productos relacionados', error.message);
                    throw error;
                }
            }

        } // si se activa una categoria no se activan automaticamente las subcategorias y productos
    }
});

// METODOS DE INSTANCIA
/**
 * Metodo para contar productos de esta subcategoria
 *
 * @return {Promise<number>} numero de productos
 */
Subcategoria.prototype.contarProductos = async function() {
    const Producto = require('./Producto');
    return await Producto.count({ where: {subcategoriaId: this.id}});
};
  

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
