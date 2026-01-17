// ======================
// PENSUM
// ======================
const API_URL = "https://proyectoweb-2-ir8x.onrender.com"; 
// Obtener todo el pensum

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getPensum = async () => {
    try {
      const res = await fetch(`${API_URL}/api/pensum`, {
        method: "GET",
        headers: authHeaders(),
      });
  
      if (!res.ok) throw new Error(res.status);
      return res.json();
    } catch (error) {
      console.error("Error en getPensum:", error.message);
      return [];
    }
  };
  
  // Obtener pensum por ID
  export const getPensumPorId = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/pensum/${id}`, {
        method: "GET",
        headers: authHeaders(),
      });
  
      if (!res.ok) throw new Error(res.status);
      return res.json();
    } catch (error) {
      console.error("Error en getPensumPorId:", error.message);
      return null;
    }
  };
  
  // Crear registros del pensum (POST múltiple)
  export const postPensum = async (pensum) => {
    try {
      const res = await fetch(`${API_URL}/api/pensum`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(pensum),
        /*
          [
            {
              id_carrera,
              numero_semestre,
              id_asignatura
            }
          ]
        */
      });
  
      return res.json();
    } catch (error) {
      console.error("Error en postPensum:", error.message);
      return { mensaje: "Error al crear pensum" };
    }
  };
  
  // Actualizar registro del pensum
  export const putPensum = async (pensum) => {
    try {
      const res = await fetch(`${API_URL}/api/pensum`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(pensum),
        /*
          {
            id_pensum,
            id_carrera,
            numero_semestre,
            id_asignatura
          }
        */
      });
  
      return res.json();
    } catch (error) {
      console.error("Error en putPensum:", error.message);
      return { mensaje: "Error al actualizar pensum" };
    }
  };
  
  // Eliminar registro del pensum
  export const deletePensum = async (id, token = null) => {
    try {
  
      const res = await fetch(`${API_URL}/api/pensum/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
  
      return res.json();
    } catch (error) {
      console.error("Error en deletePensum:", error.message);
      return { mensaje: "Error al eliminar pensum" };
    }
  };
  
  // Obtener asignaturas por carrera
export const getAsignaturasPorCarrera = async (id_carrera) => {
  try {
    const res = await fetch(
      `${API_URL}/api/pensum/carrera/${id_carrera}`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch (error) {
    console.error("Error en getAsignaturasPorCarrera:", error.message);
    return [];
  }
};

// Obtener SOLO nombres de asignaturas por carrera
export const getNombresAsignaturasPorCarrera = async (id_carrera) => {
  try {
    const res = await fetch(
      `${API_URL}/api/pensum/carrera/${id_carrera}/nombres`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch (error) {
    console.error("Error en getNombresAsignaturasPorCarrera:", error.message);
    return [];
  }
};
