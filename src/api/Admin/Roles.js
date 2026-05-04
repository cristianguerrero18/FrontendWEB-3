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
// SERVICIOS DE ROLES
// =====================================================

/**
 * Obtiene todos los roles registrados en el sistema.
 * Ejemplo: administrador, docente y estudiante.
 */
export const getRoles = async () => {
  try {
    const res = await fetch(`${API_URL}/api/roles`, {
      method: "GET",

      // Ruta protegida: requiere token JWT válido
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error(res.status);

    return res.json();
  } catch (error) {
    console.error("Error en getRoles:", error.message);

    return [];
  }
};

/**
 * Consulta un rol específico mediante su ID.
 */
export const getRolPorId = async (id_rol) => {
  try {
    const res = await fetch(`${API_URL}/api/roles/${id_rol}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error(res.status);

    return res.json();
  } catch (error) {
    console.error("Error en getRolPorId:", error.message);

    return null;
  }
};

/**
 * Crea un nuevo rol en el sistema.
 * Recibe un objeto con:
 * { nombre_rol, descripcion }
 */
export const postRol = async (rol) => {
  try {
    const res = await fetch(`${API_URL}/api/roles`, {
      method: "POST",

      // Ruta protegida: requiere autenticación para crear roles
      headers: authHeaders(),

      // Convierte los datos del rol a formato JSON
      body: JSON.stringify(rol),
    });

    return res.json();
  } catch (error) {
    console.error("Error en postRol:", error.message);

    return {
      mensaje: "Error al crear rol",
    };
  }
};

/**
 * Actualiza la información de un rol existente.
 * Recibe un objeto con:
 * { id_rol, nombre_rol, descripcion }
 */
export const putRol = async (rol) => {
  try {
    const res = await fetch(`${API_URL}/api/roles`, {
      method: "PUT",

      // Ruta protegida: requiere token JWT para modificar roles
      headers: authHeaders(),

      body: JSON.stringify(rol),
    });

    return res.json();
  } catch (error) {
    console.error("Error en putRol:", error.message);

    return {
      mensaje: "Error al actualizar rol",
    };
  }
};

/**
 * Elimina un rol mediante su identificador.
 */
export const deleteRol = async (id_rol) => {
  try {
    const res = await fetch(`${API_URL}/api/roles/${id_rol}`, {
      method: "DELETE",

      // Ruta protegida: requiere autenticación para eliminar roles
      headers: authHeaders(),
    });

    return res.json();
  } catch (error) {
    console.error("Error en deleteRol:", error.message);

    return {
      mensaje: "Error al eliminar rol",
    };
  }
};