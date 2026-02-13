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
       * beforeCreate: se ejecuta antes de crear una subcategoria
       * verifica que la categoria padre este activa
       */
      beforeCreate: async (subcategoria) => {
        const categoria = require("./Categoria");

        //buscar categoria padre
        const categoria = await categoria.findByPk(subcategoria.categoriaId);

        if (!categoria) {
          throw new Error("La categoria seleccionada no existe");
        }

        if (!categoria.activo) {
          throw new Error(
            "No se puede crear una subcategoria en una categoria inactiva",
          );
        }
      },
      /**
       * afterUpdate: se ejecuta despues de actualizar una subcategoria
       * Si se desactiva una subcategoria se desactivan todas sus productos
       */
      afterUpdate: async (subcategoria, options) => {
        //Verificar si el campo activo cambio
        if (subcategoria.changed("activo") && !subcategoria.activo) {
          console.log(`Desactivando subcategoria ${subcategoria.nombre}`);

          // Importar modelos (aqui para evitar dependencias circulares)
          const Producto = require("./Producto");

          try {
            // Paso 1 desactivar los productos de esta subcategoria
            const productos = await Producto.findAll({
              where: { subcategoriaId: subcategoria.id },
            });

            for (const producto of productos) {
              await producto.update(
                { activo: false },
                { transaction: options.transaction },
              );
              console.log(` Producto desactivado: ${producto.nombre}`);
            }
            console.log(
              "Subcategoria y productos relacionados desactivados correctamente",
            );
          } catch (error) {
            console.error(
              "Error al desactivar productos relacionados",
              error.message,
            );
            throw error;
          }
        }
      }, // si se activa una categoria no se activan automaticamente las subcategorias y productos
    },
  },
);

// METODOS DE INSTANCIA
/**
 * Metodo para contar productos de esta subcategoria
 *
 * @return {Promise<number>} numero de productos
 */
Subcategoria.prototype.contarProductos = async function () {
  const Producto = require("./Producto");
  return await Producto.count({ where: { subcategoriaId: this.id } });
};

/**
 * Metodo para contar productos de esta categoria
 */
categoria.prototype.contarSubcategorias = async function () {
  const subcategoria = require("./Producto");
  return await subcategoria.count({ where: { categoriaId: this.id } });
};

/**
 * Metodo para obtener la categoria padre
 *
 * @returns {Promise<Categoria>} - categoria padre
 */
subcategoria.prototype.obtenerCategoria = async function () {
  const categoria = require("./Categoria");
  return await categoria.findByPk(this.categoriaId);
};

// Exportar modelo subcategoria
module.exports = Subcategoria;
