const API_URL = "https://proyectoweb-2-ir8x.onrender.com"; // ajusta si cambia el puerto

// ======================
// DERECHOS AUTOR
// ======================
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// Obtener todas las declaraciones de derechos de autor (admin)
export const getDerechosAutor = async () => {
  try {
    const res = await fetch(`${API_URL}/api/derechos-autor`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch (error) {
    console.error("Error en getDerechosAutor:", error.message);
    return [];
  }
};

// Obtener declaración por ID
export const getDerechosAutorPorId = async (id_derechos_autor) => {
  try {
    const res = await fetch(`${API_URL}/api/derechos-autor/${id_derechos_autor}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch (error) {
    console.error("Error en getDerechosAutorPorId:", error.message);
    return null;
  }
};

// Crear declaración de derechos de autor (POST)
export const postDerechosAutor = async (derechosAutor) => {
  try {
    const res = await fetch(`${API_URL}/api/derechos-autor`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(derechosAutor), // { id_recurso, compromiso }
    });

    return res.json();
  } catch (error) {
    console.error("Error en postDerechosAutor:", error.message);
    return { mensaje: "Error al crear declaración" };
  }
};

// Eliminar declaración de derechos de autor (DELETE)
export const deleteDerechosAutor = async (id_derechos_autor) => {
  try {
    const res = await fetch(`${API_URL}/api/derechos-autor/${id_derechos_autor}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    return res.json();
  } catch (error) {
    console.error("Error en deleteDerechosAutor:", error.message);
    return { mensaje: "Error al eliminar declaración" };
  }
};