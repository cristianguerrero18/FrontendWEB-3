const API_URL = "https://proyectoweb-3.onrender.com"; // ajusta si cambia el puerto

// ======================
// RECURSO LIKES
// ======================
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// Obtener likes de un recurso
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
    return { total_likes: 0, likes: [] };
  }
};

// Obtener likes de un usuario
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

// Verificar si usuario ya dio like a un recurso
export const getLikeStatus = async (id_recurso, id_usuario) => {
  try {
    const res = await fetch(`${API_URL}/api/recurso-likes/status/${id_recurso}/${id_usuario}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch (error) {
    console.error("Error en getLikeStatus:", error.message);
    return { existe: false, tipo: null };
  }
};

// Obtener estadísticas completas de un recurso
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
      usuarios: [] 
    };
  }
};

// Dar like/dislike a un recurso (toggle/update)
export const postLike = async (likeData) => {
  try {
    const res = await fetch(`${API_URL}/api/recurso-likes`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(likeData), // { id_recurso, id_usuario, tipo: 'like'|'dislike' }
    });

    return res.json();
  } catch (error) {
    console.error("Error en postLike:", error.message);
    return { mensaje: "Error al procesar el like/dislike" };
  }
};

// Eliminar like específico
export const deleteLike = async (id_recurso, id_usuario) => {
  try {
    const res = await fetch(`${API_URL}/api/recurso-likes/${id_recurso}/${id_usuario}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    return res.json();
  } catch (error) {
    console.error("Error en deleteLike:", error.message);
    return { mensaje: "Error al eliminar el like" };
  }
};

// Función helper para manejar like/dislike con toggle
export const toggleLikeRecurso = async (id_recurso, id_usuario, tipo = 'like') => {
  try {
    const resultado = await postLike({
      id_recurso,
      id_usuario,
      tipo
    });
    
    return resultado;
  } catch (error) {
    console.error("Error en toggleLikeRecurso:", error.message);
    return { mensaje: "Error al alternar like/dislike" };
  }
};

// Contar likes de un recurso (versión simplificada)
export const contarLikesRecurso = async (id_recurso) => {
  try {
    const estadisticas = await getEstadisticasRecurso(id_recurso);
    return {
      likes: estadisticas.likes,
      dislikes: estadisticas.dislikes,
      total: estadisticas.total_reacciones
    };
  } catch (error) {
    console.error("Error en contarLikesRecurso:", error.message);
    return { likes: 0, dislikes: 0, total: 0 };
  }
};

// Verificar si el usuario actual dio like (usando token)
export const verificarMiLike = async (id_recurso) => {
  try {
    // Obtener ID del usuario desde el token (depende de tu implementación)
    // Esta es una implementación básica - ajusta según tu sistema
    const token = localStorage.getItem("token");
    if (!token) return { existe: false, tipo: null };
    
    // Decodificar token para obtener id_usuario
    // Asumiendo que tienes una función para obtener el ID del usuario
    const id_usuario = obtenerIdUsuarioDesdeToken(); // Implementa esta función
    
    if (!id_usuario) return { existe: false, tipo: null };
    
    return await getLikeStatus(id_recurso, id_usuario);
  } catch (error) {
    console.error("Error en verificarMiLike:", error.message);
    return { existe: false, tipo: null };
  }
};

// Función helper para obtener ID del usuario (debes implementarla según tu sistema)
const obtenerIdUsuarioDesdeToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    
    // Decodificar el token JWT (si estás usando JWT)
    // Esto es un ejemplo - ajusta según tu implementación real
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id_usuario || payload.sub || payload.userId;
  } catch (error) {
    console.error("Error al obtener ID del usuario:", error);
    return null;
  }
};

// Versión mejorada con manejo de errores más detallado
export const gestionarReaccion = async (id_recurso, tipoReaccion) => {
  try {
    const id_usuario = obtenerIdUsuarioDesdeToken();
    if (!id_usuario) {
      return { 
        success: false, 
        mensaje: "Usuario no autenticado", 
        action: "redirect" 
      };
    }

    // Verificar estado actual
    const estadoActual = await getLikeStatus(id_recurso, id_usuario);
    
    // Determinar acción
    let resultado;
    if (estadoActual.existe && estadoActual.tipo === tipoReaccion) {
      // Si ya tiene la misma reacción, eliminar (toggle)
      resultado = await deleteLike(id_recurso, id_usuario);
      return { 
        ...resultado, 
        nuevaAccion: 'eliminado', 
        tipoAnterior: tipoReaccion 
      };
    } else {
      // Si no existe o es diferente tipo, crear/actualizar
      resultado = await postLike({
        id_recurso,
        id_usuario,
        tipo: tipoReaccion
      });
      return { 
        ...resultado, 
        nuevaAccion: estadoActual.existe ? 'actualizado' : 'creado' 
      };
    }
  } catch (error) {
    console.error("Error en gestionarReaccion:", error);
    return { 
      success: false, 
      mensaje: "Error al gestionar reacción" 
    };
  }
};

// Exportar todas las funciones
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
  gestionarReaccion
};