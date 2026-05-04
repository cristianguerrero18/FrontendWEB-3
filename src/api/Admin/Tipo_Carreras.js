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
export const getTipo_carrera = async () => {
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
    console.error("Error en getTipo_carrera:", error.message);

    // Retorno seguro para evitar errores en la interfaz
    return [];
  }
};