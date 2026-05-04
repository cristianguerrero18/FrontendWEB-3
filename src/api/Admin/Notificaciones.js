// URL base del backend desplegado en Render.
// Si el dominio del backend cambia, solo se modifica esta constante.
const API_URL = "https://proyectoweb-2-ir8x.onrender.com";

// =====================================================
// CONFIGURACIÓN GENERAL
// =====================================================

/**
 * Genera los encabezados básicos para consumir la API.
 * En este caso solo indica que la información se maneja en formato JSON.
 */
const authHeaders = () => ({
  "Content-Type": "application/json",
});

/**
 * Centraliza el manejo de respuestas HTTP de la API.
 * Convierte la respuesta a JSON y retorna una estructura uniforme.
 */
const manejarRespuesta = async (res) => {
  // Intenta leer la respuesta como JSON; si falla, devuelve un objeto vacío
  const data = await res.json().catch(() => ({}));

  // Si la respuesta HTTP no fue exitosa, retorna un objeto de error controlado
  if (!res.ok) {
    return {
      ok: false,
      error: true,
      mensaje: data?.mensaje || `Error HTTP ${res.status}`,
      data: null,
    };
  }

  // Si la respuesta fue exitosa, normaliza la información recibida
  return {
    ok: true,
    error: false,
    mensaje: data?.mensaje || "Operación exitosa",

    // Si la API envía data, se usa data; si no, se retorna toda la respuesta
    data: data?.data ?? data,
  };
};

// =====================================================
// SERVICIOS DE NOTIFICACIONES
// =====================================================

/**
 * Obtiene todas las notificaciones registradas en el sistema.
 */
export const getNotificaciones = async () => {
  try {
    const res = await fetch(`${API_URL}/api/notificaciones`, {
      method: "GET",
      headers: authHeaders(),
    });

    return await manejarRespuesta(res);
  } catch (error) {
    console.error("Error en getNotificaciones:", error.message);

    return {
      ok: false,
      error: true,
      mensaje: "Error al cargar notificaciones",
      data: [],
    };
  }
};

/**
 * Obtiene las notificaciones asociadas a un usuario específico.
 * Recibe el ID del usuario como parámetro.
 */
export const getNotificacionesPorUsuario = async (id_usuario) => {
  try {
    const res = await fetch(`${API_URL}/api/notificaciones/usuario/${id_usuario}`, {
      method: "GET",
      headers: authHeaders(),
    });

    return await manejarRespuesta(res);
  } catch (error) {
    console.error("Error en getNotificacionesPorUsuario:", error.message);

    return {
      ok: false,
      error: true,
      mensaje: "Error al cargar notificaciones del usuario",
      data: [],
    };
  }
};

/**
 * Obtiene la cantidad de notificaciones no leídas de un usuario.
 */
export const getCantidadNoLeidas = async (id_usuario) => {
  try {
    const res = await fetch(
      `${API_URL}/api/notificaciones/usuario/${id_usuario}/no-leidas`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    const resultado = await manejarRespuesta(res);

    // Normaliza la respuesta para retornar solo el número de notificaciones no leídas
    return {
      ...resultado,
      data: resultado?.data?.no_leidas ?? 0,
    };
  } catch (error) {
    console.error("Error en getCantidadNoLeidas:", error.message);

    return {
      ok: false,
      error: true,
      mensaje: "Error al obtener cantidad de notificaciones no leídas",
      data: 0,
    };
  }
};

/**
 * Marca una notificación específica como vista.
 */
export const updateNotificacionVisto = async (id_notificacion) => {
  try {
    const res = await fetch(`${API_URL}/api/notificaciones/${id_notificacion}/visto`, {
      method: "PUT",
      headers: authHeaders(),
    });

    return await manejarRespuesta(res);
  } catch (error) {
    console.error("Error en updateNotificacionVisto:", error.message);

    return {
      ok: false,
      error: true,
      mensaje: "Error al actualizar notificación",
      data: null,
    };
  }
};

/**
 * Marca todas las notificaciones de un usuario como vistas.
 */
export const marcarTodasComoVistas = async (id_usuario) => {
  try {
    const res = await fetch(`${API_URL}/api/notificaciones/usuario/${id_usuario}/vistas`, {
      method: "PUT",
      headers: authHeaders(),
    });

    return await manejarRespuesta(res);
  } catch (error) {
    console.error("Error en marcarTodasComoVistas:", error.message);

    return {
      ok: false,
      error: true,
      mensaje: "Error al marcar todas las notificaciones como vistas",
      data: null,
    };
  }
};

/**
 * Elimina una notificación mediante su identificador.
 */
export const deleteNotificacion = async (id_notificacion) => {
  try {
    const res = await fetch(`${API_URL}/api/notificaciones/${id_notificacion}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    return await manejarRespuesta(res);
  } catch (error) {
    console.error("Error en deleteNotificacion:", error.message);

    return {
      ok: false,
      error: true,
      mensaje: "Error al eliminar notificación",
      data: null,
    };
  }
};