const API_URL = "http://localhost:4000";

// ======================
// LOGS DE ACCESO
// ======================

// Obtener todos los logs
export const getLogs = async () => {
  try {
    const res = await fetch(`${API_URL}/api/logs`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const data = await res.json();
    return data.ok ? data.data : []; // Retorna data si ok es true, sino array vacío
  } catch (error) {
    console.error("Error en getLogs:", error.message);
    return [];
  }
};

// Obtener logs detallados
export const getLogsDetallados = async () => {
  try {
    const res = await fetch(`${API_URL}/api/logs/detallados`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const data = await res.json();
    return data.ok ? data.data : [];
  } catch (error) {
    console.error("Error en getLogsDetallados:", error.message);
    return [];
  }
};

// Obtener logs por usuario
export const getLogsPorUsuario = async (id_usuario) => {
  try {
    const res = await fetch(`${API_URL}/api/logs/usuario/${id_usuario}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const data = await res.json();
    return data.ok ? data.data : [];
  } catch (error) {
    console.error("Error en getLogsPorUsuario:", error.message);
    return [];
  }
};

// Registrar log simple
export const postLog = async (log) => {
  try {
    const res = await fetch(`${API_URL}/api/logs`, {
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
      mensaje: "Error al registrar log",
      error: error.message 
    };
  }
};

// Registrar log completo
export const postLogCompleto = async (userData) => {
  try {
    const res = await fetch(`${API_URL}/api/logs/completo`, {
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
      mensaje: "Error al registrar log completo",
      error: error.message 
    };
  }
};