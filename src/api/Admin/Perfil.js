const API_URL = "https://proyectoweb-3.onrender.com/"; // cambia si tu backend usa otro puerto
// CARRERAS

const token = localStorage.getItem("token");
// Función para obtener usuario por ID (protegida con token)
export const obtenerUsuarioPorId = async (idUsuario) => {
    try {
    
      
      if (!token) {
        throw new Error("No hay token disponible");
      }
  
      const response = await fetch(`${API_URL}/api/usuarios/${idUsuario}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
  
      return await response.json();
    } catch (error) {
      console.error("Error obteniendo usuario:", error);
      return { error: true, mensaje: "Error al obtener datos del usuario" };
    }
  };

  // Actualizar usuario por ID
export const actualizarUsuario = async (datos) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) throw new Error("No hay token disponible");

    const response = await fetch(`${API_URL}/api/usuarios`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(datos),
    });

    return await response.json();
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    return { error: true, mensaje: "Error al actualizar usuario" };
  }
};

