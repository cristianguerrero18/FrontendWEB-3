const API_URL = "https://proyectoweb-3.onrender.com"; // ajusta si cambia el puerto

// ======================
// COMENTARIOS
// ======================
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// Obtener comentarios de un recurso
export const getComentariosPorRecurso = async (id_recurso) => {
  try {
    const res = await fetch(`${API_URL}/api/comentarios/recurso/${id_recurso}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.mensaje || `Error ${res.status}: ${res.statusText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error("Error en getComentariosPorRecurso:", error.message);
    return { 
      total_comentarios: 0, 
      comentarios: [] 
    };
  }
};

// Obtener comentarios de un usuario
export const getComentariosPorUsuario = async (id_usuario) => {
  try {
    const res = await fetch(`${API_URL}/api/comentarios/usuario/${id_usuario}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.mensaje || `Error ${res.status}: ${res.statusText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error("Error en getComentariosPorUsuario:", error.message);
    return [];
  }
};

// Obtener comentario por ID
export const getComentarioPorId = async (id_comentario) => {
  try {
    const res = await fetch(`${API_URL}/api/comentarios/${id_comentario}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.mensaje || `Error ${res.status}: ${res.statusText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error("Error en getComentarioPorId:", error.message);
    return null;
  }
};

// Crear comentario
export const postComentario = async (comentarioData) => {
  try {
    const res = await fetch(`${API_URL}/api/comentarios`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(comentarioData), // { id_usuario, id_recurso, comentario }
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.mensaje || `Error ${res.status}: ${res.statusText}`);
    }
    
    return { 
      success: true, 
      data 
    };
  } catch (error) {
    console.error("Error en postComentario:", error.message);
    return { 
      success: false, 
      mensaje: error.message || "Error al crear el comentario" 
    };
  }
};

// Actualizar comentario
export const putComentario = async (comentarioData) => {
  try {
    const res = await fetch(`${API_URL}/api/comentarios`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(comentarioData), // { id_comentario, comentario }
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.mensaje || `Error ${res.status}: ${res.statusText}`);
    }
    
    return { 
      success: true, 
      data 
    };
  } catch (error) {
    console.error("Error en putComentario:", error.message);
    return { 
      success: false, 
      mensaje: error.message || "Error al actualizar el comentario" 
    };
  }
};

// Eliminar comentario
export const deleteComentario = async (id_comentario) => {
  try {
    const res = await fetch(`${API_URL}/api/comentarios/${id_comentario}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.mensaje || `Error ${res.status}: ${res.statusText}`);
    }
    
    return { 
      success: true, 
      data 
    };
  } catch (error) {
    console.error("Error en deleteComentario:", error.message);
    return { 
      success: false, 
      mensaje: error.message || "Error al eliminar el comentario" 
    };
  }
};

// Buscar comentarios
export const buscarComentarios = async (query) => {
  try {
    const res = await fetch(`${API_URL}/api/comentarios/buscar?q=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.mensaje || `Error ${res.status}: ${res.statusText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error("Error en buscarComentarios:", error.message);
    return { 
      total: 0, 
      resultados: [] 
    };
  }
};

// Obtener comentarios recientes
export const getComentariosRecientes = async (limite = 10) => {
  try {
    const res = await fetch(`${API_URL}/api/comentarios?limite=${limite}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.mensaje || `Error ${res.status}: ${res.statusText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error("Error en getComentariosRecientes:", error.message);
    return [];
  }
};

// Verificar permisos sobre un comentario
export const verificarPermisosComentario = async (id_comentario) => {
  try {
    const res = await fetch(`${API_URL}/api/comentarios/permisos/${id_comentario}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.mensaje || `Error ${res.status}: ${res.statusText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error("Error en verificarPermisosComentario:", error.message);
    return { 
      puede_editar: false, 
      puede_eliminar: false, 
      es_autor: false 
    };
  }
};

// Contar comentarios de un recurso
export const contarComentariosRecurso = async (id_recurso) => {
  try {
    const data = await getComentariosPorRecurso(id_recurso);
    return data.total_comentarios || 0;
  } catch (error) {
    console.error("Error en contarComentariosRecurso:", error.message);
    return 0;
  }
};

// Función para crear comentario con información del usuario actual
export const crearComentario = async (id_recurso, textoComentario) => {
  try {
    // Obtener ID del usuario desde el token
    const id_usuario = obtenerIdUsuarioDesdeToken();
    
    if (!id_usuario) {
      return { 
        success: false, 
        mensaje: "Usuario no autenticado" 
      };
    }

    if (!textoComentario || textoComentario.trim().length === 0) {
      return { 
        success: false, 
        mensaje: "El comentario no puede estar vacío" 
      };
    }

    return await postComentario({
      id_usuario,
      id_recurso,
      comentario: textoComentario.trim()
    });
  } catch (error) {
    console.error("Error en crearComentario:", error.message);
    return { 
      success: false, 
      mensaje: "Error al crear comentario" 
    };
  }
};

// Función para editar comentario
export const editarComentario = async (id_comentario, nuevoTexto) => {
  try {
    if (!nuevoTexto || nuevoTexto.trim().length === 0) {
      return { 
        success: false, 
        mensaje: "El comentario no puede estar vacío" 
      };
    }

    return await putComentario({
      id_comentario,
      comentario: nuevoTexto.trim()
    });
  } catch (error) {
    console.error("Error en editarComentario:", error.message);
    return { 
      success: false, 
      mensaje: "Error al editar comentario" 
    };
  }
};

// Función para obtener datos del usuario desde el token
const obtenerIdUsuarioDesdeToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    
    // Decodificar el token JWT (asumiendo formato estándar)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id_usuario || payload.userId || payload.sub;
  } catch (error) {
    console.error("Error al obtener ID del usuario:", error);
    return null;
  }
};

// Función para formatear fecha de comentario
export const formatearFechaComentario = (fechaString) => {
  try {
    const fecha = new Date(fechaString);
    const ahora = new Date();
    const diferenciaMs = ahora - fecha;
    const diferenciaMinutos = Math.floor(diferenciaMs / (1000 * 60));
    const diferenciaHoras = Math.floor(diferenciaMs / (1000 * 60 * 60));
    const diferenciaDias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));

    if (diferenciaMinutos < 1) {
      return "Ahora mismo";
    } else if (diferenciaMinutos < 60) {
      return `Hace ${diferenciaMinutos} minuto${diferenciaMinutos !== 1 ? 's' : ''}`;
    } else if (diferenciaHoras < 24) {
      return `Hace ${diferenciaHoras} hora${diferenciaHoras !== 1 ? 's' : ''}`;
    } else if (diferenciaDias < 7) {
      return `Hace ${diferenciaDias} día${diferenciaDias !== 1 ? 's' : ''}`;
    } else {
      return fecha.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  } catch (error) {
    console.error("Error formateando fecha:", error);
    return fechaString;
  }
};

// Verificar si el usuario actual es el autor de un comentario
export const esAutorComentario = async (id_comentario) => {
  try {
    const permisos = await verificarPermisosComentario(id_comentario);
    return permisos.es_autor || false;
  } catch (error) {
    console.error("Error en esAutorComentario:", error.message);
    return false;
  }
};

// Cargar todos los comentarios de un recurso con manejo de paginación
export const cargarComentariosRecurso = async (id_recurso, pagina = 1, porPagina = 10) => {
  try {
    const data = await getComentariosPorRecurso(id_recurso);
    
    // Calcular paginación
    const totalComentarios = data.total_comentarios || 0;
    const totalPaginas = Math.ceil(totalComentarios / porPagina);
    
    // Aplicar paginación a los comentarios
    const inicio = (pagina - 1) * porPagina;
    const fin = inicio + porPagina;
    const comentariosPagina = data.comentarios.slice(inicio, fin);
    
    return {
      comentarios: comentariosPagina,
      paginacion: {
        paginaActual: pagina,
        porPagina: porPagina,
        totalComentarios: totalComentarios,
        totalPaginas: totalPaginas,
        tieneSiguiente: pagina < totalPaginas,
        tieneAnterior: pagina > 1
      }
    };
  } catch (error) {
    console.error("Error en cargarComentariosRecurso:", error.message);
    return {
      comentarios: [],
      paginacion: {
        paginaActual: 1,
        porPagina: porPagina,
        totalComentarios: 0,
        totalPaginas: 0,
        tieneSiguiente: false,
        tieneAnterior: false
      }
    };
  }
};

// Función para obtener avatar o iniciales del usuario
export const obtenerAvatarUsuario = (usuario) => {
  if (!usuario) return "U";
  
  const { nombres_usuario, apellidos_usuario } = usuario;
  
  if (nombres_usuario && apellidos_usuario) {
    return `${nombres_usuario.charAt(0)}${apellidos_usuario.charAt(0)}`.toUpperCase();
  } else if (nombres_usuario) {
    return nombres_usuario.charAt(0).toUpperCase();
  } else if (usuario.correo) {
    return usuario.correo.charAt(0).toUpperCase();
  }
  
  return "U";
};

// Función para obtener nombre completo del usuario
export const obtenerNombreCompleto = (usuario) => {
  if (!usuario) return "Usuario";
  
  const { nombres_usuario, apellidos_usuario } = usuario;
  
  if (nombres_usuario && apellidos_usuario) {
    return `${nombres_usuario} ${apellidos_usuario}`;
  } else if (nombres_usuario) {
    return nombres_usuario;
  } else if (usuario.correo) {
    return usuario.correo.split('@')[0];
  }
  
  return "Usuario";
};

// Exportar todas las funciones
export const ComentariosAPI = {
  getComentariosPorRecurso,
  getComentariosPorUsuario,
  getComentarioPorId,
  postComentario,
  putComentario,
  deleteComentario,
  buscarComentarios,
  getComentariosRecientes,
  verificarPermisosComentario,
  contarComentariosRecurso,
  crearComentario,
  editarComentario,
  esAutorComentario,
  cargarComentariosRecurso,
  formatearFechaComentario,
  obtenerAvatarUsuario,
  obtenerNombreCompleto
};