const API_URL = "https://proyectoweb-3.onrender.com"; // ajusta si cambia el puerto

// ======================
// CATEGORÍAS
// ======================
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});
// Obtener todas las categorías
export const getCategorias = async () => {
  try {
    const res = await fetch(`${API_URL}/api/categorias`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch (error) {
    console.error("Error en getCategorias:", error.message);
    return [];
  }
};

// Obtener categoría por ID
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

// Crear categoría (POST) - soporta array o objeto individual
export const postCategoria = async (categoria) => {
  try {
    const res = await fetch(`${API_URL}/api/categorias`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(categoria), // { id_categoria, nombre_categoria } o array de objetos
    });

    return res.json();
  } catch (error) {
    console.error("Error en postCategoria:", error.message);
    return { mensaje: "Error al crear categoría" };
  }
};

// Crear múltiples categorías
export const postCategoriasMultiple = async (categorias) => {
  try {
    const res = await fetch(`${API_URL}/api/categorias`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(categorias), // array de objetos de categorías
    });

    return res.json();
  } catch (error) {
    console.error("Error en postCategoriasMultiple:", error.message);
    return { mensaje: "Error al crear categorías" };
  }
};

// Actualizar categoría (PUT)
export const putCategoria = async (categoria) => {
  try {
    const res = await fetch(`${API_URL}/api/categorias`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(categoria), // { id_categoria, nombre_categoria }
    });

    return res.json();
  } catch (error) {
    console.error("Error en putCategoria:", error.message);
    return { mensaje: "Error al actualizar categoría" };
  }
};

// Eliminar categoría (DELETE)
export const deleteCategoria = async (id_categoria) => {
  try {
    const res = await fetch(`${API_URL}/api/categorias/${id_categoria}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    return res.json();
  } catch (error) {
    console.error("Error en deleteCategoria:", error.message);
    return { mensaje: "Error al eliminar categoría" };
  }
};