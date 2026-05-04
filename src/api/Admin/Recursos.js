// URL base del backend desplegado en Render.
// Si el dominio del backend cambia, solo se modifica esta constante.
const API_URL = "https://proyectoweb-2-ir8x.onrender.com";

// =====================================================
// CONFIGURACIÓN GENERAL
// =====================================================

/**
 * Obtiene el token JWT almacenado en localStorage.
 * Se usa para consumir rutas protegidas del backend.
 */
const getToken = () => localStorage.getItem("token");

/**
 * Genera encabezados para peticiones JSON protegidas.
 * Se utiliza en solicitudes GET, PUT, DELETE y POST con datos JSON.
 */
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

/**
 * Genera encabezados únicamente con autorización.
 * Se usa especialmente cuando se envían archivos con FormData,
 * ya que el navegador define automáticamente el Content-Type.
 */
const authOnlyHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

/**
 * Centraliza el manejo de respuestas JSON del backend.
 * Si la respuesta falla, retorna una estructura controlada de error.
 */
const manejarRespuestaJSON = async (res) => {
  let data = null;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    return {
      error: true,
      mensaje: data?.mensaje || `Error HTTP ${res.status}`,
      status: res.status,
      data,
    };
  }

  return data;
};

// =====================================================
// FUNCIONES AUXILIARES PARA ARCHIVOS
// =====================================================

/**
 * Obtiene la extensión de un archivo a partir de su tipo MIME.
 * Se usa cuando el backend no envía un nombre de archivo definido.
 */
const obtenerExtensionDesdeMime = (mime = "") => {
  const map = {
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
    "text/plain": "txt",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "video/mp4": "mp4",
  };

  return map[mime.toLowerCase()] || "";
};

/**
 * Extrae el nombre del archivo desde el encabezado Content-Disposition.
 * Soporta nombres codificados en UTF-8 y nombres simples.
 */
const obtenerNombreDesdeContentDisposition = (contentDisposition = "") => {
  if (!contentDisposition) return null;

  const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);

  if (utfMatch?.[1]) {
    return decodeURIComponent(utfMatch[1]);
  }

  const asciiMatch = contentDisposition.match(/filename="?([^"]+)"?/i);

  if (asciiMatch?.[1]) {
    return asciiMatch[1];
  }

  return null;
};

/**
 * Descarga un archivo Blob creando temporalmente un enlace invisible.
 * Después de iniciar la descarga, libera la URL temporal del navegador.
 */
const descargarBlob = (blob, nombreArchivo = "archivo") => {
  const blobUrl = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = nombreArchivo;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(blobUrl);
};

// =====================================================
// SERVICIOS DE RECURSOS
// =====================================================

/**
 * Obtiene todos los recursos registrados en el sistema.
 */
export const getRecursos = async () => {
  try {
    const res = await fetch(`${API_URL}/api/recursos`, {
      method: "GET",
      headers: authHeaders(),
    });

    const resultado = await manejarRespuestaJSON(res);

    return resultado.error ? [] : resultado;
  } catch (error) {
    console.error("Error en getRecursos:", error.message);
    return [];
  }
};

/**
 * Consulta un recurso específico mediante su ID.
 */
export const getRecursoPorId = async (id_recurso) => {
  try {
    const res = await fetch(`${API_URL}/api/recursos/${id_recurso}`, {
      method: "GET",
      headers: authHeaders(),
    });

    const resultado = await manejarRespuestaJSON(res);

    return resultado.error ? null : resultado;
  } catch (error) {
    console.error("Error en getRecursoPorId:", error.message);
    return null;
  }
};

/**
 * Crea un nuevo recurso académico.
 * Permite enviar datos del recurso y, opcionalmente, un archivo mediante FormData.
 */
export const postRecurso = async (recurso, archivo = null) => {
  try {
    const formData = new FormData();

    // Datos principales del recurso
    formData.append("titulo", recurso.titulo);
    formData.append("tema", recurso.tema);
    formData.append("contador_reportes", recurso.contador_reportes || 0);
    formData.append("id_asignatura", recurso.id_asignatura);
    formData.append("id_categoria", recurso.id_categoria || 1);
    formData.append("id_usuario", recurso.id_usuario || 22);

    // Si la categoría corresponde a enlace externo, se envía la URL
    if (Number(recurso.id_categoria) === 4 && recurso.URL) {
      formData.append("URL", recurso.URL);
    }

    // Si se seleccionó un archivo, se adjunta al formulario
    if (archivo) {
      formData.append("archivo", archivo);
    }

    const res = await fetch(`${API_URL}/api/recursos`, {
      method: "POST",

      // No se envía Content-Type porque FormData lo define automáticamente
      headers: authOnlyHeaders(),

      body: formData,
    });

    return await manejarRespuestaJSON(res);
  } catch (error) {
    console.error("Error en postRecurso:", error.message);

    return {
      error: true,
      mensaje: "Error al crear recurso",
    };
  }
};

/**
 * Actualiza la información de un recurso existente.
 */
export const putRecurso = async (recurso) => {
  try {
    const res = await fetch(`${API_URL}/api/recursos`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(recurso),
    });

    return await manejarRespuestaJSON(res);
  } catch (error) {
    console.error("Error en putRecurso:", error.message);

    return {
      error: true,
      mensaje: "Error al actualizar recurso",
    };
  }
};

/**
 * Elimina un recurso académico mediante su ID.
 */
export const deleteRecurso = async (id_recurso) => {
  try {
    const res = await fetch(`${API_URL}/api/recursos/${id_recurso}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    return await manejarRespuestaJSON(res);
  } catch (error) {
    console.error("Error en deleteRecurso:", error.message);

    return {
      error: true,
      mensaje: "Error al eliminar recurso",
    };
  }
};

/**
 * Cambia el estado activo/inactivo de un recurso.
 * Se usa para ocultar o habilitar recursos sin eliminarlos definitivamente.
 */
export const cambiarEstadoRecurso = async (id_recurso, activo) => {
  try {
    const res = await fetch(`${API_URL}/api/recursos/estado/${id_recurso}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ activo }),
    });

    return await manejarRespuestaJSON(res);
  } catch (error) {
    console.error("Error en cambiarEstadoRecurso:", error.message);

    return {
      error: true,
      mensaje: "Error al cambiar estado del recurso",
    };
  }
};

// =====================================================
// SERVICIOS AUXILIARES: ASIGNATURAS, CATEGORÍAS Y USUARIOS
// =====================================================

/**
 * Obtiene todas las asignaturas disponibles.
 */
export const getAsignaturas = async () => {
  try {
    const res = await fetch(`${API_URL}/api/asignaturas`, {
      method: "GET",
      headers: authHeaders(),
    });

    const resultado = await manejarRespuestaJSON(res);

    return resultado.error ? [] : resultado;
  } catch (error) {
    console.error("Error en getAsignaturas:", error.message);
    return [];
  }
};

/**
 * Consulta una asignatura específica mediante su ID.
 */
export const getAsignaturaPorId = async (id_asignatura) => {
  try {
    const res = await fetch(`${API_URL}/api/asignaturas/${id_asignatura}`, {
      method: "GET",
      headers: authHeaders(),
    });

    const resultado = await manejarRespuestaJSON(res);

    return resultado.error ? null : resultado;
  } catch (error) {
    console.error("Error en getAsignaturaPorId:", error.message);
    return null;
  }
};

/**
 * Obtiene todas las categorías de recursos.
 */
export const getCategorias = async () => {
  try {
    const res = await fetch(`${API_URL}/api/categorias`, {
      method: "GET",
      headers: authHeaders(),
    });

    const resultado = await manejarRespuestaJSON(res);

    return resultado.error ? [] : resultado;
  } catch (error) {
    console.error("Error en getCategorias:", error.message);
    return [];
  }
};

/**
 * Consulta una categoría específica mediante su ID.
 */
export const getCategoriaPorId = async (id_categoria) => {
  try {
    const res = await fetch(`${API_URL}/api/categorias/${id_categoria}`, {
      method: "GET",
      headers: authHeaders(),
    });

    const resultado = await manejarRespuestaJSON(res);

    return resultado.error ? null : resultado;
  } catch (error) {
    console.error("Error en getCategoriaPorId:", error.message);
    return null;
  }
};

/**
 * Obtiene todos los usuarios registrados.
 */
export const getUsuarios = async () => {
  try {
    const res = await fetch(`${API_URL}/api/usuarios`, {
      method: "GET",
      headers: authHeaders(),
    });

    const resultado = await manejarRespuestaJSON(res);

    return resultado.error ? [] : resultado;
  } catch (error) {
    console.error("Error en getUsuarios:", error.message);
    return [];
  }
};

/**
 * Consulta un usuario específico mediante su ID.
 */
export const getUsuarioPorId = async (id_usuario) => {
  try {
    const res = await fetch(`${API_URL}/api/usuarios/${id_usuario}`, {
      method: "GET",
      headers: authHeaders(),
    });

    const resultado = await manejarRespuestaJSON(res);

    return resultado.error ? null : resultado;
  } catch (error) {
    console.error("Error en getUsuarioPorId:", error.message);
    return null;
  }
};

// =====================================================
// CONSULTAS ESPECÍFICAS DE RECURSOS
// =====================================================

/**
 * Obtiene los recursos asociados a una asignatura específica.
 */
export const getRecursosPorAsignatura = async (id_asignatura) => {
  try {
    const res = await fetch(`${API_URL}/api/recursos/asignatura/${id_asignatura}`, {
      method: "GET",
      headers: authHeaders(),
    });

    const resultado = await manejarRespuestaJSON(res);

    return resultado.error ? [] : resultado;
  } catch (error) {
    console.error("Error en getRecursosPorAsignatura:", error.message);
    return [];
  }
};

/**
 * Obtiene los recursos publicados por un usuario específico.
 */
export const getRecursosPorUsuario = async (id_usuario) => {
  try {
    const res = await fetch(`${API_URL}/api/recursos/usuario/${id_usuario}`, {
      method: "GET",
      headers: authHeaders(),
    });

    const resultado = await manejarRespuestaJSON(res);

    return resultado.error ? [] : resultado;
  } catch (error) {
    console.error("Error en getRecursosPorUsuario:", error.message);
    return [];
  }
};

/**
 * Obtiene el detalle completo de un recurso.
 * Generalmente incluye información relacionada como usuario, asignatura y categoría.
 */
export const getRecursoDetalle = async (id_recurso) => {
  try {
    const res = await fetch(`${API_URL}/api/recursos/detalle/${id_recurso}`, {
      method: "GET",
      headers: authHeaders(),
    });

    const resultado = await manejarRespuestaJSON(res);

    return resultado.error ? null : resultado;
  } catch (error) {
    console.error("Error en getRecursoDetalle:", error.message);
    return null;
  }
};

// =====================================================
// SERVICIOS DE ARCHIVOS DE RECURSOS
// =====================================================

/**
 * Obtiene la metadata del archivo asociado a un recurso.
 * Puede incluir nombre, tipo MIME, tamaño o información necesaria para descarga.
 */
export const getRecursoArchivoMeta = async (id_recurso) => {
  try {
    const res = await fetch(`${API_URL}/api/recursos/${id_recurso}/meta-archivo`, {
      method: "GET",
      headers: authHeaders(),
    });

    return await manejarRespuestaJSON(res);
  } catch (error) {
    console.error("Error en getRecursoArchivoMeta:", error.message);

    return {
      error: true,
      mensaje: "Error al obtener metadata del archivo",
    };
  }
};

/**
 * Construye la URL para visualizar el archivo de un recurso.
 */
export const getRecursoVerUrl = (id_recurso) =>
  `${API_URL}/api/recursos/${id_recurso}/ver`;

/**
 * Construye la URL para descargar el archivo de un recurso.
 */
export const getRecursoDescargarUrl = (id_recurso) =>
  `${API_URL}/api/recursos/${id_recurso}/descargar`;

/**
 * Abre el archivo de un recurso en una nueva pestaña usando un Blob.
 * Esto evita problemas de acceso directo a URLs externas o protegidas.
 */
export const verRecursoArchivo = async (id_recurso) => {
  try {
    const res = await fetch(getRecursoVerUrl(id_recurso), {
      method: "GET",

      // Solo se envía Authorization porque la respuesta será un Blob
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!res.ok) {
      let mensaje = `Error HTTP ${res.status}`;

      try {
        const data = await res.json();
        mensaje = data?.mensaje || mensaje;
      } catch {
        // Si la respuesta no es JSON, se conserva el mensaje HTTP
      }

      return {
        error: true,
        mensaje,
      };
    }

    // Convierte la respuesta del backend en archivo temporal
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    // Abre el archivo en una nueva pestaña del navegador
    window.open(blobUrl, "_blank", "noopener,noreferrer");

    // Libera la URL temporal después de un tiempo prudente
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 60000);

    return {
      error: false,
      mensaje: "Archivo abierto correctamente",
    };
  } catch (error) {
    console.error("Error en verRecursoArchivo:", error.message);

    return {
      error: true,
      mensaje: "Error al abrir el archivo",
    };
  }
};

/**
 * Descarga el archivo asociado a un recurso.
 * Obtiene el nombre desde Content-Disposition o genera uno según el tipo MIME.
 */
export const descargarRecursoArchivo = async (id_recurso) => {
  try {
    const res = await fetch(getRecursoDescargarUrl(id_recurso), {
      method: "GET",

      // Solo se envía Authorization porque la respuesta será un archivo
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!res.ok) {
      let mensaje = `Error HTTP ${res.status}`;

      try {
        const data = await res.json();
        mensaje = data?.mensaje || mensaje;
      } catch {
        // Si el backend no responde JSON, se mantiene el mensaje HTTP
      }

      return {
        error: true,
        mensaje,
      };
    }

    // Convierte la respuesta en Blob para descargarla desde el navegador
    const blob = await res.blob();

    // Obtiene encabezados enviados por el backend para identificar el archivo
    const contentDisposition = res.headers.get("Content-Disposition") || "";
    const contentType = res.headers.get("Content-Type") || "application/octet-stream";

    // Define el nombre final del archivo
    const nombreHeader = obtenerNombreDesdeContentDisposition(contentDisposition);
    const extMime = obtenerExtensionDesdeMime(contentType);
    const nombreFinal = nombreHeader || `archivo.${extMime || "bin"}`;

    // Ejecuta la descarga del archivo
    descargarBlob(blob, nombreFinal);

    return {
      error: false,
      mensaje: "Archivo descargado correctamente",
      nombreArchivo: nombreFinal,
    };
  } catch (error) {
    console.error("Error en descargarRecursoArchivo:", error.message);

    return {
      error: true,
      mensaje: "Error al descargar el archivo",
    };
  }
};