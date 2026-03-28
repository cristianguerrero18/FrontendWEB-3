const API_URL = "https://proyectoweb-2-ir8x.onrender.com";

const authHeaders = () => ({
  "Content-Type": "application/json",
});

const manejarRespuesta = async (res) => {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return {
      ok: false,
      error: true,
      mensaje: data?.mensaje || `Error HTTP ${res.status}`,
      data: null,
    };
  }

  return {
    ok: true,
    error: false,
    mensaje: data?.mensaje || "Operación exitosa",
    data: data?.data ?? data,
  };
};

// Obtener todas las notificaciones
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

// Obtener notificaciones por usuario
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

// Obtener cantidad de no leídas
export const getCantidadNoLeidas = async (id_usuario) => {
  try {
    const res = await fetch(`${API_URL}/api/notificaciones/usuario/${id_usuario}/no-leidas`, {
      method: "GET",
      headers: authHeaders(),
    });

    const resultado = await manejarRespuesta(res);

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

// Marcar una notificación como vista
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

// Marcar todas como vistas
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

// Eliminar una notificación
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