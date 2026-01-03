const API_URL = "https://proyectoweb-3.onrender.com"; // ajusta si cambia el puerto

// ======================
// ASIGNATURAS
// ======================

// Obtener todas las asignaturas

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

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

// Obtener asignatura por ID
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

// Crear asignaturas (POST) → recibe ARRAY
export const postAsignaturas = async (asignaturas) => {
  try {
    const res = await fetch(`${API_URL}/api/asignaturas`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(asignaturas),
      // ejemplo: [{ nombre_asignatura: "Matemáticas" }]
    });

    return res.json();
  } catch (error) {
    console.error("Error en postAsignaturas:", error.message);
    return { mensaje: "Error al crear asignaturas" };
  }
};

// Actualizar asignatura (PUT)
export const putAsignatura = async (asignatura) => {
  try {
    const res = await fetch(`${API_URL}/api/asignaturas`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(asignatura),
      // { id_asignatura, nombre_asignatura }
    });

    return res.json();
  } catch (error) {
    console.error("Error en putAsignatura:", error.message);
    return { mensaje: "Error al actualizar asignatura" };
  }
};

// Eliminar asignatura (DELETE)
export const deleteAsignatura = async (id_asignatura) => {
  try {
    const res = await fetch(`${API_URL}/api/asignaturas/${id_asignatura}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    return res.json();
  } catch (error) {
    console.error("Error en deleteAsignatura:", error.message);
    return { mensaje: "Error al eliminar asignatura" };
  }
};
