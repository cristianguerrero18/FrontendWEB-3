// URL base del backend desplegado en Render.
// Si el dominio del backend cambia, solo se modifica esta constante.
const API_URL = "https://proyectoweb-2-ir8x.onrender.com";

// =====================================================
// CONFIGURACIÓN GENERAL
// =====================================================

/**
 * Obtiene el token JWT almacenado en localStorage.
 * Se usa para consumir rutas protegidas del backend.
 */
const getToken = () => localStorage.getItem("token");

/**
 * Genera los encabezados necesarios para consumir rutas protegidas.
 * Incluye el tipo de contenido JSON y el token JWT del usuario autenticado.
 */
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

/**
 * Maneja respuestas del backend que pueden venir como JSON o texto.
 * Retorna una estructura controlada cuando ocurre un error.
 */
const manejarRespuesta = async (res) => {
  let data = null;

  try {
    data = await res.json();
  } catch {
    data = await res.text().catch(() => null);
  }

  if (!res.ok) {
    return {
      error: true,
      mensaje:
        data?.mensaje ||
        data?.error ||
        data ||
        `Error HTTP ${res.status}`,
      status: res.status,
    };
  }

  return data;
};

// =====================================================
// SERVICIOS DE REPORTES
// =====================================================

/**
 * Obtiene todos los reportes registrados en el sistema.
 * Generalmente se usa desde el panel administrativo.
 */
export const getReportes = async () => {
  try {
    const res = await fetch(`${API_URL}/api/reportes`, {
      method: "GET",

      // Ruta protegida: requiere token JWT válido
      headers: authHeaders(),
    });

    return await manejarRespuesta(res);
  } catch (error) {
    console.error("Error en getReportes:", error.message);

    return {
      error: true,
      mensaje: error.message,
    };
  }
};

/**
 * Obtiene los reportes asociados a un recurso específico.
 */
export const getReportesPorRecurso = async (id_recurso) => {
  try {
    const res = await fetch(`${API_URL}/api/reportes/recurso/${id_recurso}`, {
      method: "GET",
      headers: authHeaders(),
    });

    return await manejarRespuesta(res);
  } catch (error) {
    console.error("Error en getReportesPorRecurso:", error.message);

    return {
      error: true,
      mensaje: error.message,
    };
  }
};

/**
 * Crea un nuevo reporte sobre un recurso.
 * Recibe el ID del recurso y el motivo del reporte.
 */
export const postReporte = async (id_recurso, motivo) => {
  try {
    const token = getToken();

    // Valida que exista un token antes de enviar el reporte
    if (!token) {
      return {
        error: true,
        mensaje: "No hay token de autenticación",
      };
    }

    const res = await fetch(`${API_URL}/api/reportes`, {
      method: "POST",

      // Ruta protegida: requiere autenticación para registrar reportes
      headers: authHeaders(),

      // Envía los datos principales del reporte al backend
      body: JSON.stringify({
        id_recurso,
        motivo,
        fecha_reporte: new Date().toISOString(),
      }),
    });

    return await manejarRespuesta(res);
  } catch (error) {
    console.error("Error en postReporte:", error.message);

    return {
      error: true,
      mensaje: "Error de conexión",
    };
  }
};

/**
 * Elimina un reporte mediante su identificador.
 */
export const deleteReporte = async (id_reporte) => {
  try {
    const res = await fetch(`${API_URL}/api/reportes/${id_reporte}`, {
      method: "DELETE",

      // Ruta protegida: requiere token válido para eliminar reportes
      headers: authHeaders(),
    });

    return await manejarRespuesta(res);
  } catch (error) {
    console.error("Error en deleteReporte:", error.message);

    return {
      error: true,
      mensaje: "Error de conexión",
    };
  }
};

/**
 * Obtiene la información de un usuario mediante su ID.
 * Se usa como apoyo para mostrar datos del usuario que realizó el reporte.
 */
export const getUsuarioPorId = async (id_usuario) => {
  try {
    const res = await fetch(`${API_URL}/api/usuarios/${id_usuario}`, {
      method: "GET",
      headers: authHeaders(),
    });

    return await manejarRespuesta(res);
  } catch (error) {
    console.error("Error en getUsuarioPorId:", error.message);

    return {
      error: true,
      mensaje: error.message,
    };
  }
};

/**
 * Obtiene el detalle completo de un reporte.
 * Generalmente incluye información del reporte, recurso asociado y usuario.
 */
export const getReporteCompleto = async (id_reporte) => {
  try {
    const res = await fetch(`${API_URL}/api/reportes/completo/${id_reporte}`, {
      method: "GET",
      headers: authHeaders(),
    });

    return await manejarRespuesta(res);
  } catch (error) {
    console.error("Error en getReporteCompleto:", error.message);

    return {
      error: true,
      mensaje: error.message,
    };
  }
};