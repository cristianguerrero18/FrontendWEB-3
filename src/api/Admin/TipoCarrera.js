const API_URL = "https://proyectoweb-2-ir8x.onrender.com";

// ======================
// TIPO DE CARRERA
// ======================

// Obtener todos

const authHeaders = () => ({
  "Content-Type": "application/json",
});

export const getTipoCarreras = async () => {
  try {
    const res = await fetch(`${API_URL}/api/tipo_carrera`, {
      method: "GET",
      headers : authHeaders(),
    });

    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch (error) {
    console.error("Error en getTipoCarreras:", error.message);
    return [];
  }
};

// Crear tipo de carrera
export const postTipoCarrera = async (tipo) => {
  try {
    const res = await fetch(`${API_URL}/api/tipo_carrera`, {
      method: "POST",
      headers : authHeaders(),
      body: JSON.stringify(tipo), // { nombre_tipo_carrera }
    });

    return res.json();
  } catch (error) {
    console.error("Error en postTipoCarrera:", error.message);
    return { mensaje: "Error al crear tipo de carrera" };
  }
};

// Actualizar tipo de carrera
export const putTipoCarrera = async (tipo) => {
  try {
    const res = await fetch(`${API_URL}/api/tipo_carrera`, {
      method: "PUT",
      headers : authHeaders(),
      body: JSON.stringify(tipo), // { id_tipo_carrera, nombre_tipo_carrera }
    });

    return res.json();
  } catch (error) {
    console.error("Error en putTipoCarrera:", error.message);
    return { mensaje: "Error al actualizar tipo de carrera" };
  }
};

// Eliminar tipo de carrera
export const deleteTipoCarrera = async (id_tipo_carrera) => {
  try {
    const res = await fetch(`${API_URL}/api/tipo_carrera/${id_tipo_carrera}`, {
      method: "DELETE",
      headers : authHeaders(),
    });

    return res.json();
  } catch (error) {
    console.error("Error en deleteTipoCarrera:", error.message);
    return { mensaje: "Error al eliminar tipo de carrera" };
  }
};
