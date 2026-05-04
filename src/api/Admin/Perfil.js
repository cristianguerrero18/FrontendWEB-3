// URL base del backend desplegado en Render.
// Si el dominio del backend cambia, solo se modifica esta constante.
const API_URL = "https://proyectoweb-2-ir8x.onrender.com";

// =====================================================
// CONFIGURACIÓN GENERAL
// =====================================================

/**
 * Genera los encabezados necesarios para consumir rutas protegidas.
 * Obtiene el token JWT actualizado desde localStorage en cada petición.
 */
const authHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No hay token disponible");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// =====================================================
// SERVICIOS DE USUARIOS / PERFIL
// =====================================================

/**
 * Obtiene la información de un usuario específico mediante su ID.
 * Esta ruta requiere autenticación mediante token JWT.
 */
export const obtenerUsuarioPorId = async (idUsuario) => {
  try {
    const response = await fetch(`${API_URL}/api/usuarios/${idUsuario}`, {
      method: "GET",
      headers: authHeaders(),
    });

    return await response.json();
  } catch (error) {
    console.error("Error obteniendo usuario:", error);

    return {
      error: true,
      mensaje: "Error al obtener datos del usuario",
    };
  }
};

/**
 * Actualiza la información de un usuario.
 * Recibe un objeto con los datos que serán enviados al backend.
 */
export const actualizarUsuario = async (datos) => {
  try {
    const response = await fetch(`${API_URL}/api/usuarios`, {
      method: "PUT",

      // Ruta protegida: requiere token válido para modificar datos del usuario
      headers: authHeaders(),

      // Convierte los datos del usuario a formato JSON
      body: JSON.stringify(datos),
    });

    return await response.json();
  } catch (error) {
    console.error("Error actualizando usuario:", error);

    return {
      error: true,
      mensaje: "Error al actualizar usuario",
    };
  }
};

/**
 * Elimina un usuario específico mediante su ID.
 * Esta acción debe utilizarse únicamente desde vistas autorizadas.
 */
export const eliminarUsuario = async (idUsuario) => {
  try {
    const response = await fetch(`${API_URL}/api/usuarios/${idUsuario}`, {
      method: "DELETE",

      // Ruta protegida: requiere autenticación para eliminar usuarios
      headers: authHeaders(),
    });

    return await response.json();
  } catch (error) {
    console.error("Error eliminando usuario:", error);

    return {
      error: true,
      mensaje: "Error al eliminar usuario",
    };
  }
};