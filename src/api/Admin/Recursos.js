const API_URL = "https://proyectoweb-2-ir8x.onrender.com";

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const authOnlyHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

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
      data
    };
  }

  return data;
};

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
    "video/mp4": "mp4"
  };

  return map[mime.toLowerCase()] || "";
};

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

export const postRecurso = async (recurso, archivo = null) => {
  try {
    const formData = new FormData();

    formData.append("titulo", recurso.titulo);
    formData.append("tema", recurso.tema);
    formData.append("contador_reportes", recurso.contador_reportes || 0);
    formData.append("id_asignatura", recurso.id_asignatura);
    formData.append("id_categoria", recurso.id_categoria || 1);
    formData.append("id_usuario", recurso.id_usuario || 22);

    if (Number(recurso.id_categoria) === 4 && recurso.URL) {
      formData.append("URL", recurso.URL);
    }

    if (archivo) {
      formData.append("archivo", archivo);
    }

    const res = await fetch(`${API_URL}/api/recursos`, {
      method: "POST",
      body: formData,
      headers: authOnlyHeaders(),
    });

    return await manejarRespuestaJSON(res);
  } catch (error) {
    console.error("Error en postRecurso:", error.message);
    return { error: true, mensaje: "Error al crear recurso" };
  }
};

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
    return { error: true, mensaje: "Error al actualizar recurso" };
  }
};

export const deleteRecurso = async (id_recurso) => {
  try {
    const res = await fetch(`${API_URL}/api/recursos/${id_recurso}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    return await manejarRespuestaJSON(res);
  } catch (error) {
    console.error("Error en deleteRecurso:", error.message);
    return { error: true, mensaje: "Error al eliminar recurso" };
  }
};

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
    return { error: true, mensaje: "Error al cambiar estado del recurso" };
  }
};

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

// =========================
// NUEVAS FUNCIONES DE ARCHIVO
// =========================

export const getRecursoArchivoMeta = async (id_recurso) => {
  try {
    const res = await fetch(`${API_URL}/api/recursos/${id_recurso}/meta-archivo`, {
      method: "GET",
      headers: authHeaders(),
    });

    return await manejarRespuestaJSON(res);
  } catch (error) {
    console.error("Error en getRecursoArchivoMeta:", error.message);
    return { error: true, mensaje: "Error al obtener metadata del archivo" };
  }
};

export const getRecursoVerUrl = (id_recurso) =>
  `${API_URL}/api/recursos/${id_recurso}/ver`;

export const getRecursoDescargarUrl = (id_recurso) =>
  `${API_URL}/api/recursos/${id_recurso}/descargar`;

export const verRecursoArchivo = async (id_recurso) => {
  try {
    const res = await fetch(getRecursoVerUrl(id_recurso), {
      method: "GET",
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
        // nada
      }
      return { error: true, mensaje };
    }

    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    window.open(blobUrl, "_blank", "noopener,noreferrer");

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 60000);

    return {
      error: false,
      mensaje: "Archivo abierto correctamente"
    };
  } catch (error) {
    console.error("Error en verRecursoArchivo:", error.message);
    return { error: true, mensaje: "Error al abrir el archivo" };
  }
};

export const descargarRecursoArchivo = async (id_recurso) => {
  try {
    const res = await fetch(getRecursoDescargarUrl(id_recurso), {
      method: "GET",
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
        // nada
      }
      return { error: true, mensaje };
    }

    const blob = await res.blob();
    const contentDisposition = res.headers.get("Content-Disposition") || "";
    const contentType = res.headers.get("Content-Type") || "application/octet-stream";

    const nombreHeader = obtenerNombreDesdeContentDisposition(contentDisposition);
    const extMime = obtenerExtensionDesdeMime(contentType);
    const nombreFinal = nombreHeader || `archivo.${extMime || "bin"}`;

    descargarBlob(blob, nombreFinal);

    return {
      error: false,
      mensaje: "Archivo descargado correctamente",
      nombreArchivo: nombreFinal
    };
  } catch (error) {
    console.error("Error en descargarRecursoArchivo:", error.message);
    return { error: true, mensaje: "Error al descargar el archivo" };
  }
};