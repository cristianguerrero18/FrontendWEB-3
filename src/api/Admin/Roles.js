const API_URL = "http://localhost:4000"; // ajusta si cambia el puerto

// ======================
// ROLES
// ======================
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});
// Obtener todos los roles
export const getRoles = async () => {
  try {
    const res = await fetch(`${API_URL}/api/roles`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch (error) {
    console.error("Error en getRoles:", error.message);
    return [];
  }
};

// Obtener rol por ID
export const getRolPorId = async (id_rol) => {
  try {
    const res = await fetch(`${API_URL}/api/roles/${id_rol}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch (error) {
    console.error("Error en getRolPorId:", error.message);
    return null;
  }
};

// Crear rol (POST)
export const postRol = async (rol) => {
  try {
    const res = await fetch(`${API_URL}/api/roles`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(rol), // { nombre_rol, descripcion }
    });

    return res.json();
  } catch (error) {
    console.error("Error en postRol:", error.message);
    return { mensaje: "Error al crear rol" };
  }
};

// Actualizar rol (PUT)
export const putRol = async (rol) => {
  try {
    const res = await fetch(`${API_URL}/api/roles`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(rol), // { id_rol, nombre_rol, descripcion }
    });

    return res.json();
  } catch (error) {
    console.error("Error en putRol:", error.message);
    return { mensaje: "Error al actualizar rol" };
  }
};

// Eliminar rol (DELETE)
export const deleteRol = async (id_rol) => {
  try {
    const res = await fetch(`${API_URL}/api/roles/${id_rol}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    return res.json();
  } catch (error) {
    console.error("Error en deleteRol:", error.message);
    return { mensaje: "Error al eliminar rol" };
  }
};
