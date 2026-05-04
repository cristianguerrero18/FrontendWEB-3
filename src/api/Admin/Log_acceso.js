// URL base del backend desplegado en Render.
// Si el dominio del backend cambia, solo se modifica esta constante.
const API_URL = "https://proyectoweb-2-ir8x.onrender.com";

// =====================================================
// SERVICIOS DE LOGS DE ACCESO
// =====================================================

/**
 * Obtiene todos los logs registrados en el sistema.
 * Retorna un arreglo vacío si ocurre un error o si la API no responde correctamente.
 */
export const getLogs = async () => {
  try {
    const res = await fetch(`${API_URL}/api/logs`, {
      method: "GET",

      // Indica que la solicitud trabaja con datos en formato JSON
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Valida si la respuesta HTTP fue exitosa
    if (!res.ok) {
      console.error(`HTTP Error: ${res.status}`);
      return [];
    }

    const data = await res.json();

    // Retorna únicamente la información útil si la API responde correctamente
    return data.ok ? data.data : [];
  } catch (error) {
    console.error("Error en getLogs:", error.message);
    return [];
  }
};

/**
 * Obtiene los logs con información detallada.
 * Puede incluir datos relacionados con usuario, correo, rol, fecha u otros campos.
 */
export const getLogsDetallados = async () => {
  try {
    const res = await fetch(`${API_URL}/api/logs/detallados`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error(`HTTP Error: ${res.status}`);
      return [];
    }

    const data = await res.json();

    return data.ok ? data.data : [];
  } catch (error) {
    console.error("Error en getLogsDetallados:", error.message);
    return [];
  }
};

/**
 * Obtiene los logs asociados a un usuario específico.
 * Recibe el ID del usuario como parámetro.
 */
export const getLogsPorUsuario = async (id_usuario) => {
  try {
    const res = await fetch(`${API_URL}/api/logs/usuario/${id_usuario}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error(`HTTP Error: ${res.status}`);
      return [];
    }

    const data = await res.json();

    return data.ok ? data.data : [];
  } catch (error) {
    console.error("Error en getLogsPorUsuario:", error.message);
    return [];
  }
};

/**
 * Registra un log simple en el sistema.
 * Recibe un objeto con la información básica del evento a guardar.
 */
export const postLog = async (log) => {
  try {
    const res = await fetch(`${API_URL}/api/logs`, {
      method: "POST",

      // Indica que se enviará información en formato JSON
      headers: {
        "Content-Type": "application/json",
      },

      // Convierte el objeto del log a JSON antes de enviarlo al backend
      body: JSON.stringify(log),
    });

    return res.json();
  } catch (error) {
    console.error("Error en postLog:", error.message);

    return {
      ok: false,
      message: "Error al registrar log",
      error: error.message,
    };
  }
};

/**
 * Registra un log completo con información adicional del usuario.
 * Se utiliza cuando se necesita guardar un evento con más contexto.
 */
export const postLogCompleto = async (userData) => {
  try {
    const res = await fetch(`${API_URL}/api/logs/completo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      // Envía los datos del usuario dentro de un objeto userData
      body: JSON.stringify({ userData }),
    });

    return res.json();
  } catch (error) {
    console.error("Error en postLogCompleto:", error.message);

    return {
      ok: false,
      message: "Error al registrar log completo",
      error: error.message,
    };
  }
};

/**
 * Elimina todos los logs existentes.
 * Esta acción normalmente debe limitarse a usuarios administradores.
 */
export const deleteAllLogs = async () => {
  try {
    const res = await fetch(`${API_URL}/api/logs/eliminar-todos`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return res.json();
  } catch (error) {
    console.error("Error en deleteAllLogs:", error.message);

    return {
      ok: false,
      message: "Error al eliminar todos los logs",
      error: error.message,
    };
  }
};

/**
 * Vacía completamente la tabla de logs.
 * A diferencia de una eliminación común, suele reiniciar la tabla según la lógica del backend.
 */
export const truncateLogs = async () => {
  try {
    const res = await fetch(`${API_URL}/api/logs/truncar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return res.json();
  } catch (error) {
    console.error("Error en truncateLogs:", error.message);

    return {
      ok: false,
      message: "Error al truncar la tabla de logs",
      error: error.message,
    };
  }
};

/**
 * Elimina logs dentro de un rango de fechas.
 * Recibe fechaInicio y fechaFin, que se envían al backend como fecha_inicio y fecha_fin.
 */
export const deleteLogsByDateRange = async (fechaInicio, fechaFin) => {
  try {
    const res = await fetch(`${API_URL}/api/logs/eliminar-por-fecha`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      // Envía el rango de fechas para filtrar los registros que se eliminarán
      body: JSON.stringify({
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      }),
    });

    return res.json();
  } catch (error) {
    console.error("Error en deleteLogsByDateRange:", error.message);

    return {
      ok: false,
      message: "Error al eliminar logs por fecha",
      error: error.message,
    };
  }
};

/**
 * Verifica si el módulo de logs está respondiendo correctamente.
 * Retorna true si la API responde con un estado exitoso.
 */
export const checkLogsConnection = async () => {
  try {
    const res = await fetch(`${API_URL}/api/logs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return res.ok;
  } catch (error) {
    console.error("Error de conexión:", error.message);
    return false;
  }
};

// =====================================================
// EXPORTACIÓN AGRUPADA
// =====================================================

/**
 * Agrupa todos los servicios de logs para facilitar su importación
 * desde los componentes o módulos del frontend.
 */
export default {
  getLogs,
  getLogsDetallados,
  getLogsPorUsuario,
  postLog,
  postLogCompleto,
  deleteAllLogs,
  truncateLogs,
  deleteLogsByDateRange,
  checkLogsConnection,
};