// URL base del backend.
// Debe reemplazarse por el dominio real donde está desplegada la API.
const API_URL = "https://proyectoweb-2-ir8x.onrender.com";

// =====================================================
// SERVICIOS DEL DASHBOARD
// =====================================================

/**
 * Obtiene los datos generales del dashboard.
 * Normalmente retorna totales como usuarios, recursos, carreras,
 * asignaturas, reportes u otros indicadores administrativos.
 */
export const getDashboardTotales = async () => {
  try {
    const res = await fetch(`${API_URL}/api/dashboard`, {
      method: "GET",

      // Indica que la petición espera trabajar con datos en formato JSON
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Si la respuesta del servidor no es exitosa, lanza un error controlado
    if (!res.ok) throw new Error(res.status);

    // Retorna la información del dashboard enviada por el backend
    return res.json();
  } catch (error) {
    // Registra el error en consola para facilitar la depuración
    console.error("Error en getDashboardTotales:", error.message);

    // Retorno seguro para evitar que el dashboard falle si la API no responde
    return {
      ok: false,
      data: {},
    };
  }
};