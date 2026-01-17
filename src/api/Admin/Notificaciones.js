const API_URL = "https://proyectoweb-2-ir8x.onrender.com";

// Obtener todas las notificaciones
export const getNotificaciones = async () => {
  try {
    const res = await fetch(`${API_URL}/api/notificaciones`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error en getNotificaciones:", error.message);
    return { error: true, mensaje: "Error al cargar notificaciones" };
  }
};

// Obtener notificaciones por ID de usuario
export const getNotificacionesPorUsuario = async (id_usuario) => {
  try {
    const res = await fetch(`${API_URL}/api/notificaciones/${id_usuario}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Error en getNotificacionesPorUsuario:", error.message);
    return { error: true, mensaje: "Error al cargar notificaciones del usuario" };
  }
};

// Eliminar notificación
export const deleteNotificacion = async (id_notificacion) => {
  try {
    const res = await fetch(
      `${API_URL}/api/notificaciones/${id_notificacion}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );

    return await res.json();
  } catch (error) {
    console.error("Error en deleteNotificacion:", error.message);
    return { error: true, mensaje: "Error al eliminar notificación" };
  }
};

// Marcar notificación como vista
export const updateNotificacionVisto = async (id_notificacion) => {
  try {
    const res = await fetch(
      `${API_URL}/api/notificaciones/visto/${id_notificacion}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Error en updateNotificacionVisto:", error.message);
    return { error: true, mensaje: "Error al actualizar notificación" };
  }
};