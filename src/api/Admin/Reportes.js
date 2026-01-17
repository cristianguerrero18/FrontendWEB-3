const API_URL = "http://localhost:4000";

// ======================
// REPORTES
// ======================

// Obtener todos los reportes
export const getReportes = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/reportes`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error en getReportes:", errorText);
      throw new Error(`Error ${res.status}: ${errorText}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error en getReportes:", error.message);
    return { error: true, mensaje: error.message };
  }
};

// Obtener reportes por recurso
export const getReportesPorRecurso = async (id_recurso) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/reportes/recurso/${id_recurso}`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error en getReportesPorRecurso:", errorText);
      throw new Error(`Error ${res.status}: ${errorText}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error en getReportesPorRecurso:", error.message);
    return { error: true, mensaje: error.message };
  }
};

// Crear reporte (POST) - CORREGIDO: ahora acepta parámetros separados
export const postReporte = async (id_recurso, motivo) => {
  try {
    const token = localStorage.getItem("token");
    
    // Verificar que el token existe
    if (!token) {
      return { error: true, mensaje: "No hay token de autenticación" };
    }

    const res = await fetch(`${API_URL}/api/reportes`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ 
        id_recurso, 
        motivo,
        fecha_reporte: new Date().toISOString()
      }),
    });

    const data = await res.json();
    
    if (!res.ok) {
      console.error("Error en postReporte:", data);
      return { error: true, mensaje: data.mensaje || `Error ${res.status}` };
    }
    
    return data;
  } catch (error) {
    console.error("Error en postReporte:", error.message);
    return { error: true, mensaje: "Error de conexión" };
  }
};

// Eliminar reporte (DELETE)
export const deleteReporte = async (id_reporte) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/reportes/${id_reporte}`, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    const data = await res.json();
    
    if (!res.ok) {
      console.error("Error en deleteReporte:", data);
      return { error: true, mensaje: data.mensaje || `Error ${res.status}` };
    }
    
    return data;
  } catch (error) {
    console.error("Error en deleteReporte:", error.message);
    return { error: true, mensaje: "Error de conexión" };
  }
};

// Obtener usuario por ID
export const getUsuarioPorId = async (id_usuario) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/usuarios/${id_usuario}`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error en getUsuarioPorId:", errorText);
      throw new Error(`Error ${res.status}: ${errorText}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error en getUsuarioPorId:", error.message);
    return { error: true, mensaje: error.message };
  }
};