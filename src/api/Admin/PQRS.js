const API_URL = "http://localhost:4000"; // ajusta si cambia el puerto

// ======================
// PQRS
// ======================

// Obtener todos los PQRS
export const getPQRS = async () => {
  try {
    const res = await fetch(`${API_URL}/api/pqrs`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch (error) {
    console.error("Error en getPQRS:", error.message);
    return [];
  }
};

// Obtener PQR por ID
export const getPQRSPorId = async (id_pqr) => {
  try {
    const res = await fetch(`${API_URL}/api/pqrs/${id_pqr}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch (error) {
    console.error("Error en getPQRSPorId:", error.message);
    return null;
  }
};

// Eliminar PQR (DELETE)
export const deletePQRS = async (id_pqr) => {
  try {
    const res = await fetch(`${API_URL}/api/pqrs/${id_pqr}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    return res.json();
  } catch (error) {
    console.error("Error en deletePQRS:", error.message);
    return { mensaje: "Error al eliminar PQR" };
  }
};

export const getUsuarioPorId = async (id_usuario) => {
  try {
    const res = await fetch(`${API_URL}/api/usuarios/${id_usuario}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch (error) {
    console.error("Error en getUsuarioPorId:", error.message);
    return null;
  }
};

// Responder PQR (PUT) - CORREGIDO
export const responderPQRS = async ({ id_pqr, respuesta, id_admin }) => {
  try {
    console.log("Enviando respuesta a PQR:", { id_pqr, respuesta, id_admin });
    
    const res = await fetch(`${API_URL}/api/pqrs/responder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_pqr: Number(id_pqr),
        respuesta: respuesta,
        id_admin: Number(id_admin) || 1 // Asegurar que sea número
      }),
    });

    const data = await res.json();
    console.log("Respuesta del servidor:", data);
    
    if (!res.ok) {
      throw new Error(data.mensaje || `Error ${res.status}`);
    }
    
    return data;
  } catch (error) {
    console.error("Error en responderPQRS:", error.message);
    return { error: true, mensaje: error.message || "Error al responder el PQR" };
  }
};