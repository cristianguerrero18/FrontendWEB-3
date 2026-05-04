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
// SERVICIOS DE COMENTARIOS
// =====================================================

/**
 * Obtiene todos los comentarios asociados a un recurso específico.
 * Retorna también el total de comentarios.
 */
export const getComentariosPorRecurso = async (id_recurso) => {
  try {
    const res = await fetch(`${API_URL}/api/comentarios/recurso/${id_recurso}`, {
      method: "GET",
      headers: authHeaders(),
    });

    // Si la respuesta no es exitosa, intenta obtener el mensaje enviado por el backend
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.mensaje || `Error ${res.status}: ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error("Error en getComentariosPorRecurso:", error.message);

    // Retorno seguro para evitar que la interfaz falle si ocurre un error
    return {
      total_comentarios: 0,
      comentarios: [],
    };
  }
};

/**
 * Obtiene los comentarios realizados por un usuario específico.
 */
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

/**
 * Consulta un comentario específico mediante su ID.
 */
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

/**
 * Crea un nuevo comentario asociado a un recurso.
 * Recibe un objeto con:
 * { id_usuario, id_recurso, comentario }
 */
export const postComentario = async (comentarioData) => {
  try {
    const res = await fetch(`${API_URL}/api/comentarios`, {
      method: "POST",

      // Ruta protegida: requiere token JWT válido
      headers: authHeaders(),

      // Convierte los datos del comentario a formato JSON
      body: JSON.stringify(comentarioData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.mensaje || `Error ${res.status}: ${res.statusText}`);
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error en postComentario:", error.message);

    return {
      success: false,
      mensaje: error.message || "Error al crear el comentario",
    };
  }
};

/**
 * Actualiza el contenido de un comentario existente.
 * Recibe un objeto con:
 * { id_comentario, comentario }
 */
export const putComentario = async (comentarioData) => {
  try {
    const res = await fetch(`${API_URL}/api/comentarios`, {
      method: "PUT",

      // Ruta protegida: requiere autenticación para modificar comentarios
      headers: authHeaders(),

      body: JSON.stringify(comentarioData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.mensaje || `Error ${res.status}: ${res.statusText}`);
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error en putComentario:", error.message);

    return {
      success: false,
      mensaje: error.message || "Error al actualizar el comentario",
    };
  }
};

/**
 * Elimina un comentario mediante su identificador.
 */
export const deleteComentario = async (id_comentario) => {
  try {
    const res = await fetch(`${API_URL}/api/comentarios/${id_comentario}`, {
      method: "DELETE",

      // Ruta protegida: solo usuarios autorizados pueden eliminar comentarios
      headers: authHeaders(),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.mensaje || `Error ${res.status}: ${res.statusText}`);
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error en deleteComentario:", error.message);

    return {
      success: false,
      mensaje: error.message || "Error al eliminar el comentario",
    };
  }
};

/**
 * Busca comentarios según una palabra o frase ingresada.
 * encodeURIComponent evita errores si el texto contiene espacios o caracteres especiales.
 */
export const buscarComentarios = async (query) => {
  try {
    const res = await fetch(
      `${API_URL}/api/comentarios/buscar?q=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.mensaje || `Error ${res.status}: ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error("Error en buscarComentarios:", error.message);

    return {
      total: 0,
      resultados: [],
    };
  }
};

/**
 * Obtiene los comentarios más recientes.
 * El parámetro límite define cuántos comentarios se desean consultar.
 */
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

/**
 * Verifica si el usuario autenticado puede editar o eliminar un comentario.
 */
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
      es_autor: false,
    };
  }
};

// =====================================================
// FUNCIONES AUXILIARES DE COMENTARIOS
// =====================================================

/**
 * Cuenta cuántos comentarios tiene un recurso.
 */
export const contarComentariosRecurso = async (id_recurso) => {
  try {
    const data = await getComentariosPorRecurso(id_recurso);
    return data.total_comentarios || 0;
  } catch (error) {
    console.error("Error en contarComentariosRecurso:", error.message);
    return 0;
  }
};

/**
 * Crea un comentario usando automáticamente el ID del usuario autenticado.
 */
export const crearComentario = async (id_recurso, textoComentario) => {
  try {
    // Obtiene el ID del usuario desde el token almacenado
    const id_usuario = obtenerIdUsuarioDesdeToken();

    // Si no existe usuario autenticado, se detiene el proceso
    if (!id_usuario) {
      return {
        success: false,
        mensaje: "Usuario no autenticado",
      };
    }

    // Valida que el comentario no esté vacío
    if (!textoComentario || textoComentario.trim().length === 0) {
      return {
        success: false,
        mensaje: "El comentario no puede estar vacío",
      };
    }

    // Envía el comentario limpio al backend
    return await postComentario({
      id_usuario,
      id_recurso,
      comentario: textoComentario.trim(),
    });
  } catch (error) {
    console.error("Error en crearComentario:", error.message);

    return {
      success: false,
      mensaje: "Error al crear comentario",
    };
  }
};

/**
 * Edita un comentario validando que el nuevo texto no esté vacío.
 */
export const editarComentario = async (id_comentario, nuevoTexto) => {
  try {
    if (!nuevoTexto || nuevoTexto.trim().length === 0) {
      return {
        success: false,
        mensaje: "El comentario no puede estar vacío",
      };
    }

    return await putComentario({
      id_comentario,
      comentario: nuevoTexto.trim(),
    });
  } catch (error) {
    console.error("Error en editarComentario:", error.message);

    return {
      success: false,
      mensaje: "Error al editar comentario",
    };
  }
};

/**
 * Extrae el ID del usuario desde el token JWT almacenado en localStorage.
 * Se usa para asociar comentarios al usuario autenticado.
 */
const obtenerIdUsuarioDesdeToken = () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) return null;

    // Decodifica la segunda parte del JWT, donde se encuentra el payload
    const payload = JSON.parse(atob(token.split(".")[1]));

    // Retorna el ID según el nombre utilizado en el backend
    return payload.id_usuario || payload.userId || payload.sub;
  } catch (error) {
    console.error("Error al obtener ID del usuario:", error);
    return null;
  }
};

/**
 * Formatea la fecha del comentario en un formato amigable para el usuario.
 * Ejemplo: "Ahora mismo", "Hace 5 minutos", "Hace 2 días".
 */
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
    }

    if (diferenciaMinutos < 60) {
      return `Hace ${diferenciaMinutos} minuto${diferenciaMinutos !== 1 ? "s" : ""}`;
    }

    if (diferenciaHoras < 24) {
      return `Hace ${diferenciaHoras} hora${diferenciaHoras !== 1 ? "s" : ""}`;
    }

    if (diferenciaDias < 7) {
      return `Hace ${diferenciaDias} día${diferenciaDias !== 1 ? "s" : ""}`;
    }

    return fecha.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (error) {
    console.error("Error formateando fecha:", error);
    return fechaString;
  }
};

/**
 * Verifica si el usuario actual es el autor de un comentario.
 */
export const esAutorComentario = async (id_comentario) => {
  try {
    const permisos = await verificarPermisosComentario(id_comentario);
    return permisos.es_autor || false;
  } catch (error) {
    console.error("Error en esAutorComentario:", error.message);
    return false;
  }
};

/**
 * Carga comentarios de un recurso y aplica paginación desde el frontend.
 */
export const cargarComentariosRecurso = async (
  id_recurso,
  pagina = 1,
  porPagina = 10
) => {
  try {
    const data = await getComentariosPorRecurso(id_recurso);

    // Calcula los datos generales de la paginación
    const totalComentarios = data.total_comentarios || 0;
    const totalPaginas = Math.ceil(totalComentarios / porPagina);

    // Define el rango de comentarios que se mostrará en la página actual
    const inicio = (pagina - 1) * porPagina;
    const fin = inicio + porPagina;

    const comentariosPagina = data.comentarios.slice(inicio, fin);

    return {
      comentarios: comentariosPagina,
      paginacion: {
        paginaActual: pagina,
        porPagina,
        totalComentarios,
        totalPaginas,
        tieneSiguiente: pagina < totalPaginas,
        tieneAnterior: pagina > 1,
      },
    };
  } catch (error) {
    console.error("Error en cargarComentariosRecurso:", error.message);

    return {
      comentarios: [],
      paginacion: {
        paginaActual: 1,
        porPagina,
        totalComentarios: 0,
        totalPaginas: 0,
        tieneSiguiente: false,
        tieneAnterior: false,
      },
    };
  }
};

/**
 * Obtiene las iniciales del usuario para mostrarlas como avatar textual.
 */
export const obtenerAvatarUsuario = (usuario) => {
  if (!usuario) return "U";

  const { nombres_usuario, apellidos_usuario } = usuario;

  if (nombres_usuario && apellidos_usuario) {
    return `${nombres_usuario.charAt(0)}${apellidos_usuario.charAt(0)}`.toUpperCase();
  }

  if (nombres_usuario) {
    return nombres_usuario.charAt(0).toUpperCase();
  }

  if (usuario.correo) {
    return usuario.correo.charAt(0).toUpperCase();
  }

  return "U";
};

/**
 * Construye el nombre visible del usuario para mostrarlo en la interfaz.
 */
export const obtenerNombreCompleto = (usuario) => {
  if (!usuario) return "Usuario";

  const { nombres_usuario, apellidos_usuario } = usuario;

  if (nombres_usuario && apellidos_usuario) {
    return `${nombres_usuario} ${apellidos_usuario}`;
  }

  if (nombres_usuario) {
    return nombres_usuario;
  }

  if (usuario.correo) {
    return usuario.correo.split("@")[0];
  }

  return "Usuario";
};

// =====================================================
// EXPORTACIÓN AGRUPADA
// =====================================================

/**
 * Agrupa todos los servicios y funciones auxiliares de comentarios
 * para facilitar su importación desde componentes de React.
 */
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
  obtenerNombreCompleto,
};