// URL base del backend desplegado en Render.
// Si el dominio del backend cambia, solo se modifica esta constante.
const API_URL = "https://proyectoweb-2-ir8x.onrender.com";

// =====================================================
// CONFIGURACIÓN GENERAL
// =====================================================

/**
 * Genera los encabezados necesarios para consumir rutas protegidas.
 * Incluye el tipo de contenido JSON y el token JWT almacenado en localStorage.
 */
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// =====================================================
// SERVICIOS DE CATEGORÍAS
// =====================================================

/**
 * Obtiene todas las categorías registradas en el sistema.
 */
export const getCategorias = async () => {
  try {
    const res = await fetch(`${API_URL}/api/categorias`, {
      method: "GET",

      // Se envía el token por si la ruta requiere autenticación en el backend
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error(res.status);

    return res.json();
  } catch (error) {
    console.error("Error en getCategorias:", error.message);
    return [];
  }
};

/**
 * Consulta una categoría específica mediante su ID.
 */
export const getCategoriaPorId = async (id_categoria) => {
  try {
    const res = await fetch(`${API_URL}/api/categorias/${id_categoria}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error(res.status);

    return res.json();
  } catch (error) {
    console.error("Error en getCategoriaPorId:", error.message);
    return null;
  }
};

/**
 * Crea una categoría o varias categorías.
 * Puede recibir un objeto individual o un arreglo de objetos,
 * según la lógica definida en el backend.
 *
 * Ejemplo individual:
 * { nombre_categoria: "Guías" }
 *
 * Ejemplo múltiple:
 * [{ nombre_categoria: "PDF" }, { nombre_categoria: "Videos" }]
 */
export const postCategoria = async (categoria) => {
  try {
    const res = await fetch(`${API_URL}/api/categorias`, {
      method: "POST",

      // Ruta protegida: requiere token JWT válido
      headers: authHeaders(),

      // Convierte los datos de JavaScript a JSON para enviarlos al backend
      body: JSON.stringify(categoria),
    });

    return res.json();
  } catch (error) {
    console.error("Error en postCategoria:", error.message);

    return {
      mensaje: "Error al crear categoría",
    };
  }
};

/**
 * Crea múltiples categorías.
 * Esta función se conserva para mayor claridad cuando desde el frontend
 * se envía directamente un arreglo de categorías.
 */
export const postCategoriasMultiple = async (categorias) => {
  try {
    const res = await fetch(`${API_URL}/api/categorias`, {
      method: "POST",

      // Ruta protegida: requiere autenticación mediante token
      headers: authHeaders(),

      // Envía un arreglo de categorías al backend
      body: JSON.stringify(categorias),
    });

    return res.json();
  } catch (error) {
    console.error("Error en postCategoriasMultiple:", error.message);

    return {
      mensaje: "Error al crear categorías",
    };
  }
};

/**
 * Actualiza una categoría existente.
 * Recibe un objeto con:
 * { id_categoria, nombre_categoria }
 */
export const putCategoria = async (categoria) => {
  try {
    const res = await fetch(`${API_URL}/api/categorias`, {
      method: "PUT",

      // Ruta protegida: se envía el token JWT junto con el contenido JSON
      headers: authHeaders(),

      body: JSON.stringify(categoria),
    });

    return res.json();
  } catch (error) {
    console.error("Error en putCategoria:", error.message);

    return {
      mensaje: "Error al actualizar categoría",
    };
  }
};

/**
 * Elimina una categoría según su ID.
 */
export const deleteCategoria = async (id_categoria) => {
  try {
    const res = await fetch(`${API_URL}/api/categorias/${id_categoria}`, {
      method: "DELETE",

      // Ruta protegida: requiere un token válido para eliminar registros
      headers: authHeaders(),
    });

    return res.json();
  } catch (error) {
    console.error("Error en deleteCategoria:", error.message);

    return {
      mensaje: "Error al eliminar categoría",
    };
  }
};