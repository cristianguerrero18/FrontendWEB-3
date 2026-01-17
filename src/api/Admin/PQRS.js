// src/api/Admin/PQRS.js - VERSIÓN COMPLETA CON DEBUG
const API_URL = "https://proyectoweb-2-ir8x.onrender.com";
const authHeaders = () => ({
  
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// Crear PQRS - VERSIÓN MEJORADA CON DEPURACIÓN
export const createPQRS = async ({ id_usuario, descripcion, id_tipo_pqrs }) => {
  try {
    console.log("🚀 === ENVIANDO DATOS PARA CREAR PQR ===");
    console.log("id_usuario:", id_usuario);
    console.log("descripcion:", descripcion);
    console.log("id_tipo_pqrs:", id_tipo_pqrs);
    
    const payload = {
      id_usuario: Number(id_usuario),
      descripcion: descripcion,
      id_tipo_pqrs: Number(id_tipo_pqrs) || 1
    };
    
    console.log("📦 Payload JSON:", JSON.stringify(payload));
    
    const res = await fetch(`${API_URL}/api/pqrs`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    console.log("📡 Estado de respuesta:", res.status, res.statusText);
    
    const data = await res.json();
    console.log("📨 Respuesta del servidor:", data);

    if (!res.ok) {
      console.error("❌ Error en la respuesta:", data);
      throw new Error(data.mensaje || data.error || `Error ${res.status}: ${res.statusText}`);
    }
    
    console.log("✅ PQR creado exitosamente");
    return data;
    
  } catch (error) {
    console.error("🔥 Error en createPQRS:", error.message);
    console.error("Stack trace:", error.stack);
    return { 
      error: true, 
      mensaje: error.message || "Error al crear el PQR",
      detalles: error.toString()
    };
  }
};

// Obtener PQRS por usuario - VERSIÓN MEJORADA
export const getPQRSPorUsuario = async (id_usuario) => {
  try {
    console.log("📡 Solicitando PQRS para usuario:", id_usuario);
    
    const res = await fetch(`${API_URL}/api/pqrs/usuario/${id_usuario}`, {
      method: "GET",
      headers: authHeaders(),
    });

    console.log("📡 Estado de respuesta:", res.status, res.statusText);
    
    if (!res.ok) {
      console.error("❌ Error en getPQRSPorUsuario:", res.status);
      return { error: true, mensaje: `Error ${res.status}: ${res.statusText}` };
    }
    
    const data = await res.json();
    console.log("📨 PQRS obtenidos:", Array.isArray(data) ? data.length : 0, "registros");
    return data;
    
  } catch (error) {
    console.error("🔥 Error en getPQRSPorUsuario:", error.message);
    return { error: true, mensaje: error.message || "Error al obtener PQRS" };
  }
};

// Obtener todos los PQRS
export const getPQRS = async () => {
  try {
    const res = await fetch(`${API_URL}/api/pqrs`, {
      method: "GET",
      headers: authHeaders(),
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
      headers: authHeaders(),
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
      headers: authHeaders(),
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
      headers: authHeaders(),
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
      headers: authHeaders(),
      body: JSON.stringify({
        id_pqr: Number(id_pqr),
        respuesta: respuesta,
        id_admin: Number(id_admin) || 1
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