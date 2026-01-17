const API_URL = "https://proyectoweb-2-ir8x.onrender.com"; // ajusta si cambia el puerto

// ======================
// FAVORITOS
// ======================
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// Obtener todos los favoritos
export const getFavoritos = async () => {
  try {
    const res = await fetch(`${API_URL}/api/favoritos`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch (error) {
    console.error("Error en getFavoritos:", error.message);
    return [];
  }
};

// Obtener favoritos por usuario
export const getFavoritosPorUsuario = async (id_usuario) => {
  try {
    const res = await fetch(
      `${API_URL}/api/favoritos/usuario/${id_usuario}`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch (error) {
    console.error("Error en getFavoritosPorUsuario:", error.message);
    return [];
  }
};

// Agregar a favoritos
export const postFavorito = async (favorito) => {
  try {
    const res = await fetch(`${API_URL}/api/favoritos`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(favorito), // { id_usuario, id_recurso }
    });

    return res.json();
  } catch (error) {
    console.error("Error en postFavorito:", error.message);
    return { mensaje: "Error al agregar a favoritos" };
  }
};

// Eliminar de favoritos
export const deleteFavorito = async (id_usuario, id_recurso) => {
  try {
    const res = await fetch(
      `${API_URL}/api/favoritos/${id_usuario}/${id_recurso}`,
      {
        method: "DELETE",
        headers: authHeaders(),
      }
    );

    return res.json();
  } catch (error) {
    console.error("Error en deleteFavorito:", error.message);
    return { mensaje: "Error al eliminar de favoritos" };
  }
};
