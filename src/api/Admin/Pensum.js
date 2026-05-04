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
// SERVICIOS DE PENSUM
// =====================================================

/**
 * Obtiene todos los registros del pensum académico.
 */
export const getPensum = async () => {
  try {
    const res = await fetch(`${API_URL}/api/pensum`, {
      method: "GET",

      // Se envía el token por si la ruta requiere autenticación en el backend
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error(res.status);

    return res.json();
  } catch (error) {
    console.error("Error en getPensum:", error.message);

    return [];
  }
};

/**
 * Consulta un registro específico del pensum mediante su ID.
 */
export const getPensumPorId = async (id) => {
  try {
    const res = await fetch(`${API_URL}/api/pensum/${id}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error(res.status);

    return res.json();
  } catch (error) {
    console.error("Error en getPensumPorId:", error.message);

    return null;
  }
};

/**
 * Crea uno o varios registros del pensum.
 *
 * Ejemplo de estructura esperada:
 * [
 *   {
 *     id_carrera,
 *     numero_semestre,
 *     id_asignatura
 *   }
 * ]
 */
export const postPensum = async (pensum) => {
  try {
    const res = await fetch(`${API_URL}/api/pensum`, {
      method: "POST",

      // Ruta protegida: requiere autenticación mediante token JWT
      headers: authHeaders(),

      // Convierte los registros del pensum a formato JSON para enviarlos al backend
      body: JSON.stringify(pensum),
    });

    return res.json();
  } catch (error) {
    console.error("Error en postPensum:", error.message);

    return {
      mensaje: "Error al crear pensum",
    };
  }
};

/**
 * Actualiza un registro existente del pensum.
 *
 * Ejemplo de estructura esperada:
 * {
 *   id_pensum,
 *   id_carrera,
 *   numero_semestre,
 *   id_asignatura
 * }
 */
export const putPensum = async (pensum) => {
  try {
    const res = await fetch(`${API_URL}/api/pensum`, {
      method: "PUT",

      // Ruta protegida: requiere token para modificar registros académicos
      headers: authHeaders(),

      body: JSON.stringify(pensum),
    });

    return res.json();
  } catch (error) {
    console.error("Error en putPensum:", error.message);

    return {
      mensaje: "Error al actualizar pensum",
    };
  }
};

/**
 * Elimina un registro del pensum mediante su identificador.
 */
export const deletePensum = async (id) => {
  try {
    const res = await fetch(`${API_URL}/api/pensum/${id}`, {
      method: "DELETE",

      // Ruta protegida: requiere token válido para eliminar registros
      headers: authHeaders(),
    });

    return res.json();
  } catch (error) {
    console.error("Error en deletePensum:", error.message);

    return {
      mensaje: "Error al eliminar pensum",
    };
  }
};

/**
 * Obtiene las asignaturas asociadas a una carrera específica.
 * Recibe el ID de la carrera como parámetro.
 */
export const getAsignaturasPorCarrera = async (id_carrera) => {
  try {
    const res = await fetch(`${API_URL}/api/pensum/carrera/${id_carrera}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error(res.status);

    return res.json();
  } catch (error) {
    console.error("Error en getAsignaturasPorCarrera:", error.message);

    return [];
  }
};

/**
 * Obtiene únicamente los nombres de las asignaturas asociadas a una carrera.
 * Es útil cuando la interfaz solo necesita mostrar nombres y no toda la información del pensum.
 */
export const getNombresAsignaturasPorCarrera = async (id_carrera) => {
  try {
    const res = await fetch(`${API_URL}/api/pensum/carrera/${id_carrera}/nombres`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error(res.status);

    return res.json();
  } catch (error) {
    console.error("Error en getNombresAsignaturasPorCarrera:", error.message);

    return [];
  }
};