const API_URL = "http://localhost:4000"; // ajusta si cambia el puerto

// ======================
// REPORTES
// ======================

// Obtener todos los reportes
export const getReportes = async () => {
  try {
    const res = await fetch(`${API_URL}/api/reportes`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch (error) {
    console.error("Error en getReportes:", error.message);
    return [];
  }
};

// Obtener reporte por ID
export const getReportePorId = async (id_reporte) => {
  try {
    const res = await fetch(`${API_URL}/api/reportes/${id_reporte}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch (error) {
    console.error("Error en getReportePorId:", error.message);
    return null;
  }
};

// Obtener reportes por recurso
export const getReportesPorRecurso = async (id_recurso) => {
  try {
    const res = await fetch(`${API_URL}/api/reportes/recurso/${id_recurso}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch (error) {
    console.error("Error en getReportesPorRecurso:", error.message);
    return [];
  }
};

// Crear reporte (POST)
export const postReporte = async (reporte) => {
  try {
    const res = await fetch(`${API_URL}/api/reportes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reporte), // { id_recurso, motivo }
    });

    return res.json();
  } catch (error) {
    console.error("Error en postReporte:", error.message);
    return { mensaje: "Error al crear reporte" };
  }
};

// Eliminar reporte (DELETE)
export const deleteReporte = async (id_reporte) => {
  try {
    const res = await fetch(`${API_URL}/api/reportes/${id_reporte}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    return res.json();
  } catch (error) {
    console.error("Error en deleteReporte:", error.message);
    return { mensaje: "Error al eliminar reporte" };
  }
};


export const getUsuarioPorId = async (id_usuario) => {
  try {
    const res = await fetch(`${API_URL}/api/usuarios/${id_usuario}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch (error) {
    console.error("Error en getUsuarioPorId:", error.message);
    return null;
  }
};

export const getReporteCompleto = async (id) => {
  const res = await fetch(`${API_URL}/api/reportes/completo/${id}`);
  return await res.json();
};
