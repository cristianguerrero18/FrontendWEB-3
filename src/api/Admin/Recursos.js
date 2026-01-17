const API_URL = "https://proyectoweb-2-ir8x.onrender.com";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getRecursos = async () => {
  try {
    const res = await fetch(`${API_URL}/api/recursos`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error(res.status);
    return res.json();
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

    if (!res.ok) throw new Error(res.status);
    return res.json();
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

    if (recurso.id_categoria == 4 && recurso.URL) {
      formData.append("URL", recurso.URL);
      console.log("Enviando link con URL:", recurso.URL);
    }

    if (archivo) {
      formData.append("archivo", archivo);
      console.log("Enviando archivo:", archivo.name);
    }

    console.log("Enviando FormData con:", {
      titulo: recurso.titulo,
      tema: recurso.tema,
      id_categoria: recurso.id_categoria,
      URL: recurso.URL,
      tieneArchivo: !!archivo
    });

    const res = await fetch(`${API_URL}/api/recursos`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const resultado = await res.json();
    console.log("Respuesta del servidor:", resultado);

    return resultado;
  } catch (error) {
    console.error("Error en postRecurso:", error.message);
    return { mensaje: "Error al crear recurso" };
  }
};

export const putRecurso = async (recurso) => {
  try {
    const res = await fetch(`${API_URL}/api/recursos`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(recurso),
    });

    return res.json();
  } catch (error) {
    console.error("Error en putRecurso:", error.message);
    return { mensaje: "Error al actualizar recurso" };
  }
};

export const deleteRecurso = async (id_recurso) => {
  try {
    const res = await fetch(`${API_URL}/api/recursos/${id_recurso}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    return res.json();
  } catch (error) {
    console.error("Error en deleteRecurso:", error.message);
    return { mensaje: "Error al eliminar recurso" };
  }
};

export const cambiarEstadoRecurso = async (id_recurso, activo) => {
  try {
    const res = await fetch(
      `${API_URL}/api/recursos/estado/${id_recurso}`,
      {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ activo })
      }
    );

    return res.json();
  } catch (error) {
    console.error("Error en cambiarEstadoRecurso:", error.message);
    return { mensaje: "Error al cambiar estado del recurso" };
  }
};

export const getAsignaturas = async () => {
  try {
    const res = await fetch(`${API_URL}/api/asignaturas`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error(res.status);
    return res.json();
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

    if (!res.ok) throw new Error(res.status);
    return res.json();
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

    if (!res.ok) throw new Error(res.status);
    return res.json();
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

    if (!res.ok) throw new Error(res.status);
    return res.json();
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

    if (!res.ok) throw new Error(res.status);
    return res.json();
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

    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch (error) {
    console.error("Error en getUsuarioPorId:", error.message);
    return null;
  }
};


export const getRecursosPorAsignatura = async (id_asignatura) => {
  try {
    const res = await fetch(
      `${API_URL}/api/recursos/asignatura/${id_asignatura}`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch (error) {
    console.error("Error en getRecursosPorAsignatura:", error.message);
    return [];
  }
};

export const getRecursosPorUsuario = async (id_usuario) => {
  try {
    const res = await fetch(
      `${API_URL}/api/recursos/usuario/${id_usuario}`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch (error) {
    console.error("Error en getRecursosPorUsuario:", error.message);
    return [];
  }
};

export const getRecursoDetalle = async (id_recurso) => {
  try {
    const res = await fetch(
      `${API_URL}/api/recursos/detalle/${id_recurso}`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch (error) {
    console.error("Error en getRecursoDetalle:", error.message);
    return null;
  }
};

