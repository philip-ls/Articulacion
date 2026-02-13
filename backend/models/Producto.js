/**
 * MODELO PRODUCTO
 *
 *Define la tabla Categoria en la base de datos
 *Almacena la tabla productos en la base de datos
 *Almacena los productos
 */

//Importar DataTypes de sequelize
const { DataTypes } = require("sequelize");

//Importar instancia de sequelize
const { sequelize } = require("../config/database");
const { before } = require("node:test");
const Categoria = require("./Categoria");

/**
 * Definir el modelo de Producto
 */
const Producto = sequelize.define(
  "Producto",
  {
    //Campos de la tabla
    //Id Identificador unico (PRIMARY KEY)
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    nombre: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El nombre del producto no puede estar vacio",
        },
        len: {
          args: [3, 200],
          msg: "El nombre debe tener entre 3 y 200",
        },
      },
    },

/**
* Descripcion detallada del producto
*/
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    //Precio del producto
    precio: {
      type: DataTypes.DECIMAL(10, 2), //hasta 99,999,999.99
      allowNull: false,
      validate: {
        isDecimal: {
          msg: "El precio debe ser un numero decimal valido",
        },
        min: {
          args: [0],
          msg: "El precio no puede ser negativo",
        },
      },
    },

    // Stock del producto cantidad disponible en inventario
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: {
          msg: "El stock debe ser un numero entero",
        },
        min: {
          args: [0],
          msg: "El stock no puede ser negativo",
        },
      },
    },

    /**
     *imagen Nombre del archivo de imagen
     * se guarda solo el nombre ejemplo: coca-cola-producto.jpg
     * La ruta seria uploads/coca-cola-producto.jpg
     */

    imagen: {
      type: DataTypes.STRING(255),
      allowNull: true, // la imagen puede ser opcional
      validate: {
        is: {
          args: /^[\w,\s-]+\.(jpg|jpeg|png|gif)$/i, // Validar formato de imagen
          msg: "La imagen debe ser un archivo jpg, jpeg, png o gif",
        },
      },
    },

    /**
     * subcategoriaId - ID de la subcategoria a la que pertenece (FOREIGN KEY)
     * Esta es la relacion con la tabla subcategoria
     */
    subcategoriaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "subcategorias", // nombre de la tabla subcategoria
        key: "id", // campo de la tabla relacionada
      },
      onUpdate: "CASCADE", // Si se actualiza el ID, se actualizar aca tambien
      onDelete: "CASCADE", // Si se elimina la subcategoria eliminar los productos relacionados
      validate: {
        notNull: {
          msg: "Debe seleccionar una subcategoria",
        },
      },
    },

    /**
     * categoriaId - ID de la categoria a la que pertenece (FOREIGN KEY)
     * Esta es la relacion con la tabla categoria
     */
    categoriaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "categorias", // nombre de la tabla categoria
        key: "id", // campo de la tabla relacionada
      },
      onUpdate: "CASCADE", // Si se actualiza el ID, se actualizar aca tambien
      onDelete: "CASCADE", // Si se elimina la categoria eliminar las subcategorias relacionadas
      validate: {
        notNull: {
          msg: "Debe seleccionar una categoria",
        },
      },
    },

    /**
     * Activo estado de la subcategoria
     * si es false la subcategoria y todas sus productos se ocultan
     */
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    // Opciones del modelo

    tableName: "productos",
    timestamps: true, // Agrega campos de createdAt y updatedAt

    /**
     * indices compuestos para optimizar busquedas
     */
    indexes: [
      {
        //Indice para buscar productos por subcategoria
        fields: ["subcategoriaId"],
      },
      {
        //Indice para buscar productos por categoria
        fields: ["categoriaId"],
      },
      {
        //Indice para buscar productos activos
        fields: ["activo"],
      },
      {
        //Indice para buscar producto por nombre
        fields: ["nombre"],
      },
    ],

/**
* Hooks Acciones automaticas
*/

    hooks: {
      /**
       * beforeCreate: se ejecuta antes de crear un producto
       * valida que la subcategoria y categoria esten activas
       */
      beforeCreate: async (producto) => {
        const categoria = require("./Subcategoria");
        const Subcategoria = require("./Categoria");

        //buscar subcategoria padre
        const subcategoria = await Subcategoria.findByPk(producto.subcategoriaId);

        if (!subcategoria) { throw new Error("La subcategoria seleccionada no existe");}

        if (!subcategoria.activo) {
          throw new Error(
            "No se puede crear un producto en una subcategoria inactiva",
          );
        }

                 //buscar categoria padre
        const categoria = await categoria.findByPk(producto.categoriaId);

        if (!categoria) {
          throw new Error("La categoria seleccionada no existe");
        }

        if (!categoria.activo) {
          throw new Error(
            "No se puede crear un producto en una categoria inactiva",
          );
        }

        // validar que la subcategoria pertenezca a una categoria 
        if (subcategoria.categoriaId !== producto.categoriaId) {
          throw new Error('La subcategoria no pertenece a la categoria seleccionada');
      }
    },

      /**
       *BeforeUpdate: se ejecuta antes de eliminar un producto 
       * Elimina la imagen del producto(servidor) si se elimina el producto o se cambia la imagen
       */

       beforeDestroy: async (producto) => {
        if (producto.imagen){
          const {deleteFile} = require("../config/multer");
          // intente eliminar la imagen del servidor
          const eliminado = await require("../config/multer");

          if (eliminado) {
            console.log(`Imagen eliminada: ${producto.imagen}`);
          }
        }
      },
  }
});

// METODOS DE INSTANCIA
/**
 * Metodo para obtener la url completa de la imagen
 *
 * @returns {string|null} - url de la imagen
 */
Producto.prototype.obtenerUrlImagen = async function () {
  if (this.imagen) {
    return null;
  }

  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads/${this.imagen}`;
};

/**
 * metodo para verificar si hay stock disponible
 * 
 * @param {number} cantidad - cantidad deseada
 * @returns {boolean} - true si hay stock suficiente, false si no
 */
Producto.prototype.hayStock = function (cantidad = 3) {
  return
}

/**
 * metodo para reducir el stock
 * util para despues de una venta
 * @param {number} cantidad - cantidad a reducir 
 * @returns {Promise<productos>} producto actualizado
 */
producto.prototype.reducirStock = async function (cantidad) {
  if (this.hayStock(cantidad)) {
    throw new Error('Stock insuficiente');
  }
  this.stock -= cantidad;
  return await this.save();
};

/**
 * Metodo para aumentar el stock
 * util al cancelar una venta o recibir i+ventario
 * @param {number} cantidad - cantidad a aumentar
 * @returns {Promise<Producto>} producto actualizado
 */
producto.prototype.aumentarStock = async function (cantidad) {
  this.stock += cantidad;
  return await this.save();
};

// Exportar modelo Producto
module.exports = Producto;
