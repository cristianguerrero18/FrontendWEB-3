const API_URL = "https://proyectoweb-2-ir8x.onrender.com";

// ======================
// LOGS DE ACCESO
// ======================

/**
 * Obtener todos los logs
 */
export const getLogs = async () => {
  try {
    const res = await fetch(`${API_URL}/api/logs`, { // Cambiado de logs-acceso a logs
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.error(`HTTP Error: ${res.status}`);
      return [];
    }
    
    const data = await res.json();
    return data.ok ? data.data : [];
  } catch (error) {
    console.error("Error en getLogs:", error.message);
    return [];
  }
};

/**
 * Obtener logs detallados
 */
export const getLogsDetallados = async () => {
  try {
    const res = await fetch(`${API_URL}/api/logs/detallados`, { // Cambiado
      method: "GET",
      headers: { "Content-Type": "application/json" },
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
 * Obtener logs por usuario
 */
export const getLogsPorUsuario = async (id_usuario) => {
  try {
    const res = await fetch(`${API_URL}/api/logs/usuario/${id_usuario}`, { // Cambiado
      method: "GET",
      headers: { "Content-Type": "application/json" },
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
 * Registrar log simple
 */
export const postLog = async (log) => {
  try {
    const res = await fetch(`${API_URL}/api/logs`, { // Cambiado
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(log),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error en postLog:", error.message);
    return { 
      ok: false, 
      message: "Error al registrar log",
      error: error.message 
    };
  }
};

/**
 * Registrar log completo
 */
export const postLogCompleto = async (userData) => {
  try {
    const res = await fetch(`${API_URL}/api/logs/completo`, { // Cambiado
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userData }),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error en postLogCompleto:", error.message);
    return { 
      ok: false, 
      message: "Error al registrar log completo",
      error: error.message 
    };
  }
};

/**
 * Eliminar todos los logs
 */
export const deleteAllLogs = async () => {
  try {
    const res = await fetch(`${API_URL}/api/logs/eliminar-todos`, { // Cambiado
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error en deleteAllLogs:", error.message);
    return { 
      ok: false, 
      message: "Error al eliminar todos los logs",
      error: error.message 
    };
  }
};

/**
 * Truncar tabla de logs
 */
export const truncateLogs = async () => {
  try {
    const res = await fetch(`${API_URL}/api/logs/truncar`, { // Cambiado
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error en truncateLogs:", error.message);
    return { 
      ok: false, 
      message: "Error al truncar la tabla de logs",
      error: error.message 
    };
  }
};

/**
 * Eliminar logs por rango de fechas
 */
export const deleteLogsByDateRange = async (fechaInicio, fechaFin) => {
  try {
    const res = await fetch(`${API_URL}/api/logs/eliminar-por-fecha`, { // Cambiado
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        fecha_inicio: fechaInicio, 
        fecha_fin: fechaFin 
      }),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error en deleteLogsByDateRange:", error.message);
    return { 
      ok: false, 
      message: "Error al eliminar logs por fecha",
      error: error.message 
    };
  }
};

/**
 * Verificar conexión
 */
export const checkLogsConnection = async () => {
  try {
    const res = await fetch(`${API_URL}/api/logs`, { // Cambiado
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return res.ok;
  } catch (error) {
    console.error("Error de conexión:", error.message);
    return false;
  }
};

export default {
  getLogs,
  getLogsDetallados,
  getLogsPorUsuario,
  postLog,
  postLogCompleto,
  deleteAllLogs,
  truncateLogs,
  deleteLogsByDateRange,
  checkLogsConnection
};