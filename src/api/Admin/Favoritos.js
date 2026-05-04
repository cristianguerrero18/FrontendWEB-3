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
// SERVICIOS DE FAVORITOS
// =====================================================

/**
 * Obtiene todos los recursos marcados como favoritos.
 * Generalmente se usa desde vistas administrativas o de consulta general.
 */
export const getFavoritos = async () => {
  try {
    const res = await fetch(`${API_URL}/api/favoritos`, {
      method: "GET",

      // Ruta protegida: requiere token JWT válido
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error(res.status);

    return res.json();
  } catch (error) {
    console.error("Error en getFavoritos:", error.message);

    return [];
  }
};

/**
 * Obtiene los favoritos asociados a un usuario específico.
 * Recibe el ID del usuario como parámetro.
 */
export const getFavoritosPorUsuario = async (id_usuario) => {
  try {
    const res = await fetch(`${API_URL}/api/favoritos/usuario/${id_usuario}`, {
      method: "GET",

      // Permite consultar únicamente los favoritos del usuario indicado
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error(res.status);

    return res.json();
  } catch (error) {
    console.error("Error en getFavoritosPorUsuario:", error.message);

    return [];
  }
};

/**
 * Agrega un recurso a la lista de favoritos de un usuario.
 * Recibe un objeto con:
 * { id_usuario, id_recurso }
 */
export const postFavorito = async (favorito) => {
  try {
    const res = await fetch(`${API_URL}/api/favoritos`, {
      method: "POST",

      // Ruta protegida: requiere autenticación para guardar favoritos
      headers: authHeaders(),

      // Convierte los datos del favorito a formato JSON para enviarlos al backend
      body: JSON.stringify(favorito),
    });

    return res.json();
  } catch (error) {
    console.error("Error en postFavorito:", error.message);

    return {
      mensaje: "Error al agregar a favoritos",
    };
  }
};

/**
 * Elimina un recurso de la lista de favoritos de un usuario.
 * Recibe el ID del usuario y el ID del recurso.
 */
export const deleteFavorito = async (id_usuario, id_recurso) => {
  try {
    const res = await fetch(
      `${API_URL}/api/favoritos/${id_usuario}/${id_recurso}`,
      {
        method: "DELETE",

        // Ruta protegida: requiere token para modificar los favoritos del usuario
        headers: authHeaders(),
      }
    );

    return res.json();
  } catch (error) {
    console.error("Error en deleteFavorito:", error.message);

    return {
      mensaje: "Error al eliminar de favoritos",
    };
  }
};