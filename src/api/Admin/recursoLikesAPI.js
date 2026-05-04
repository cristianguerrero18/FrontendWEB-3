// URL base del backend desplegado en Render.
// Si el dominio del backend cambia, solo se modifica esta constante.
const API_URL = "https://proyectoweb-2-ir8x.onrender.com";

// =====================================================
// CONFIGURACIÓN GENERAL
// =====================================================

/**
 * Genera los encabezados necesarios para consumir rutas protegidas.
 * Incluye el tipo de contenido JSON y el token JWT almacenado en localStorage.
 */
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// =====================================================
// SERVICIOS DE LIKES / DISLIKES DE RECURSOS
// =====================================================

/**
 * Obtiene todos los likes asociados a un recurso específico.
 * Retorna el total de likes y el listado de usuarios o registros relacionados.
 */
export const getLikesPorRecurso = async (id_recurso) => {
  try {
    const res = await fetch(`${API_URL}/api/recurso-likes/recurso/${id_recurso}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error(res.status);

    return res.json();
  } catch (error) {
    console.error("Error en getLikesPorRecurso:", error.message);

    return {
      total_likes: 0,
      likes: [],
    };
  }
};

/**
 * Obtiene todos los likes o reacciones realizadas por un usuario específico.
 */
export const getLikesPorUsuario = async (id_usuario) => {
  try {
    const res = await fetch(`${API_URL}/api/recurso-likes/usuario/${id_usuario}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error(res.status);

    return res.json();
  } catch (error) {
    console.error("Error en getLikesPorUsuario:", error.message);

    return [];
  }
};

/**
 * Verifica si un usuario ya reaccionó a un recurso.
 * Permite saber si existe una reacción y si fue like o dislike.
 */
export const getLikeStatus = async (id_recurso, id_usuario) => {
  try {
    const res = await fetch(
      `${API_URL}/api/recurso-likes/status/${id_recurso}/${id_usuario}`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    if (!res.ok) throw new Error(res.status);

    return res.json();
  } catch (error) {
    console.error("Error en getLikeStatus:", error.message);

    return {
      existe: false,
      tipo: null,
    };
  }
};

/**
 * Obtiene las estadísticas completas de reacciones de un recurso.
 * Incluye total de reacciones, likes, dislikes y usuarios relacionados.
 */
export const getEstadisticasRecurso = async (id_recurso) => {
  try {
    const res = await fetch(`${API_URL}/api/recurso-likes/estadisticas/${id_recurso}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error(res.status);

    return res.json();
  } catch (error) {
    console.error("Error en getEstadisticasRecurso:", error.message);

    return {
      id_recurso,
      total_reacciones: 0,
      likes: 0,
      dislikes: 0,
      usuarios: [],
    };
  }
};

/**
 * Crea o actualiza una reacción sobre un recurso.
 * Recibe un objeto con:
 * { id_recurso, id_usuario, tipo: "like" | "dislike" }
 */
export const postLike = async (likeData) => {
  try {
    const res = await fetch(`${API_URL}/api/recurso-likes`, {
      method: "POST",

      // Ruta protegida: requiere token JWT válido
      headers: authHeaders(),

      // Convierte la reacción a formato JSON para enviarla al backend
      body: JSON.stringify(likeData),
    });

    return res.json();
  } catch (error) {
    console.error("Error en postLike:", error.message);

    return {
      mensaje: "Error al procesar el like/dislike",
    };
  }
};

/**
 * Elimina la reacción de un usuario sobre un recurso.
 */
export const deleteLike = async (id_recurso, id_usuario) => {
  try {
    const res = await fetch(`${API_URL}/api/recurso-likes/${id_recurso}/${id_usuario}`, {
      method: "DELETE",

      // Ruta protegida: requiere autenticación para eliminar la reacción
      headers: authHeaders(),
    });

    return res.json();
  } catch (error) {
    console.error("Error en deleteLike:", error.message);

    return {
      mensaje: "Error al eliminar el like",
    };
  }
};

// =====================================================
// FUNCIONES AUXILIARES DE REACCIONES
// =====================================================

/**
 * Función auxiliar para enviar rápidamente una reacción tipo like o dislike.
 */
export const toggleLikeRecurso = async (id_recurso, id_usuario, tipo = "like") => {
  try {
    return await postLike({
      id_recurso,
      id_usuario,
      tipo,
    });
  } catch (error) {
    console.error("Error en toggleLikeRecurso:", error.message);

    return {
      mensaje: "Error al alternar like/dislike",
    };
  }
};

/**
 * Retorna un resumen numérico de las reacciones de un recurso.
 */
export const contarLikesRecurso = async (id_recurso) => {
  try {
    const estadisticas = await getEstadisticasRecurso(id_recurso);

    return {
      likes: estadisticas.likes,
      dislikes: estadisticas.dislikes,
      total: estadisticas.total_reacciones,
    };
  } catch (error) {
    console.error("Error en contarLikesRecurso:", error.message);

    return {
      likes: 0,
      dislikes: 0,
      total: 0,
    };
  }
};

/**
 * Verifica si el usuario autenticado ya reaccionó al recurso.
 * El ID del usuario se obtiene desde el token JWT almacenado.
 */
export const verificarMiLike = async (id_recurso) => {
  try {
    const id_usuario = obtenerIdUsuarioDesdeToken();

    if (!id_usuario) {
      return {
        existe: false,
        tipo: null,
      };
    }

    return await getLikeStatus(id_recurso, id_usuario);
  } catch (error) {
    console.error("Error en verificarMiLike:", error.message);

    return {
      existe: false,
      tipo: null,
    };
  }
};

/**
 * Extrae el ID del usuario desde el payload del token JWT.
 * Se usa para asociar reacciones al usuario autenticado.
 */
const obtenerIdUsuarioDesdeToken = () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) return null;

    // Decodifica la segunda parte del JWT, donde se encuentra el payload
    const payload = JSON.parse(atob(token.split(".")[1]));

    // Retorna el ID según el nombre utilizado en el backend
    return payload.id_usuario || payload.sub || payload.userId;
  } catch (error) {
    console.error("Error al obtener ID del usuario:", error);
    return null;
  }
};

/**
 * Gestiona la reacción del usuario autenticado sobre un recurso.
 * Si ya existe la misma reacción, la elimina; si es diferente, la actualiza.
 */
export const gestionarReaccion = async (id_recurso, tipoReaccion) => {
  try {
    const id_usuario = obtenerIdUsuarioDesdeToken();

    if (!id_usuario) {
      return {
        success: false,
        mensaje: "Usuario no autenticado",
        action: "redirect",
      };
    }

    // Consulta la reacción actual del usuario sobre el recurso
    const estadoActual = await getLikeStatus(id_recurso, id_usuario);

    // Si el usuario presiona la misma reacción, se elimina como comportamiento tipo toggle
    if (estadoActual.existe && estadoActual.tipo === tipoReaccion) {
      const resultado = await deleteLike(id_recurso, id_usuario);

      return {
        ...resultado,
        nuevaAccion: "eliminado",
        tipoAnterior: tipoReaccion,
      };
    }

    // Si no existe reacción o es diferente, se crea o actualiza
    const resultado = await postLike({
      id_recurso,
      id_usuario,
      tipo: tipoReaccion,
    });

    return {
      ...resultado,
      nuevaAccion: estadoActual.existe ? "actualizado" : "creado",
    };
  } catch (error) {
    console.error("Error en gestionarReaccion:", error);

    return {
      success: false,
      mensaje: "Error al gestionar reacción",
    };
  }
};

// =====================================================
// EXPORTACIÓN AGRUPADA
// =====================================================

/**
 * Agrupa todos los servicios y funciones auxiliares de reacciones
 * para facilitar su importación desde componentes de React.
 */
export const RecursoLikesAPI = {
  getLikesPorRecurso,
  getLikesPorUsuario,
  getLikeStatus,
  getEstadisticasRecurso,
  postLike,
  deleteLike,
  toggleLikeRecurso,
  contarLikesRecurso,
  verificarMiLike,
  gestionarReaccion,
};