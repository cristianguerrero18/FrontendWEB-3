// URL base del backend desplegado en Render.
// Si el dominio del backend cambia, solo se modifica esta constante.
const API_URL = "https://proyectoweb-2-ir8x.onrender.com";

// =====================================================
// CONFIGURACIÓN GENERAL
// =====================================================

/**
 * Genera los encabezados básicos para consumir la API.
 * En este caso solo se indica que la información se maneja en formato JSON.
 */
const authHeaders = () => ({
  "Content-Type": "application/json",
});

// =====================================================
// SERVICIOS DE TIPO DE CARRERA
// =====================================================

/**
 * Obtiene todos los tipos de carrera registrados en el sistema.
 * Ejemplo: técnica, tecnológica, profesional u otros tipos definidos.
 */
export const getTipoCarreras = async () => {
  try {
    const res = await fetch(`${API_URL}/api/tipo_carrera`, {
      method: "GET",
      headers: authHeaders(),
    });

    // Valida que la respuesta del backend sea exitosa
    if (!res.ok) throw new Error(res.status);

    // Retorna la lista de tipos de carrera en formato JSON
    return res.json();
  } catch (error) {
    console.error("Error en getTipoCarreras:", error.message);

    // Retorno seguro para evitar errores en la interfaz
    return [];
  }
};

/**
 * Crea un nuevo tipo de carrera.
 * Recibe un objeto con:
 * { nombre_tipo_carrera }
 */
export const postTipoCarrera = async (tipo) => {
  try {
    const res = await fetch(`${API_URL}/api/tipo_carrera`, {
      method: "POST",

      // Envía los encabezados necesarios para datos JSON
      headers: authHeaders(),

      // Convierte los datos del tipo de carrera a formato JSON
      body: JSON.stringify(tipo),
    });

    return res.json();
  } catch (error) {
    console.error("Error en postTipoCarrera:", error.message);

    return {
      mensaje: "Error al crear tipo de carrera",
    };
  }
};

/**
 * Actualiza un tipo de carrera existente.
 * Recibe un objeto con:
 * { id_tipo_carrera, nombre_tipo_carrera }
 */
export const putTipoCarrera = async (tipo) => {
  try {
    const res = await fetch(`${API_URL}/api/tipo_carrera`, {
      method: "PUT",
      headers: authHeaders(),

      // Envía los datos actualizados al backend
      body: JSON.stringify(tipo),
    });

    return res.json();
  } catch (error) {
    console.error("Error en putTipoCarrera:", error.message);

    return {
      mensaje: "Error al actualizar tipo de carrera",
    };
  }
};

/**
 * Elimina un tipo de carrera mediante su identificador.
 */
export const deleteTipoCarrera = async (id_tipo_carrera) => {
  try {
    const res = await fetch(`${API_URL}/api/tipo_carrera/${id_tipo_carrera}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    return res.json();
  } catch (error) {
    console.error("Error en deleteTipoCarrera:", error.message);

    return {
      mensaje: "Error al eliminar tipo de carrera",
    };
  }
};