// URL base del backend desplegado en Render.
// Si el dominio del backend cambia, solo se modifica esta constante.
const API_URL = "https://proyectoweb-2-ir8x.onrender.com";

// =====================================================
// CONFIGURACIÓN GENERAL
// =====================================================

/**
 * Genera los encabezados necesarios para consumir rutas protegidas.
 * Incluye el tipo de contenido JSON y el token JWT almacenado en localStorage.
 */
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// =====================================================
// SERVICIOS DE PQRS
// =====================================================

/**
 * Crea una nueva PQRS en el sistema.
 * Recibe el usuario, la descripción y el tipo de PQRS.
 */
export const createPQRS = async ({ id_usuario, descripcion, id_tipo_pqrs }) => {
  try {
    const payload = {
      id_usuario: Number(id_usuario),
      descripcion: descripcion?.trim(),
      id_tipo_pqrs: Number(id_tipo_pqrs) || 1,
    };

    const res = await fetch(`${API_URL}/api/pqrs`, {
      method: "POST",

      // Ruta protegida: requiere token JWT válido
      headers: authHeaders(),

      // Envía los datos de la PQRS en formato JSON
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.mensaje || data.error || `Error ${res.status}: ${res.statusText}`
      );
    }

    return data;
  } catch (error) {
    console.error("Error en createPQRS:", error.message);

    return {
      error: true,
      mensaje: error.message || "Error al crear el PQR",
    };
  }
};

/**
 * Obtiene las PQRS asociadas a un usuario específico.
 */
export const getPQRSPorUsuario = async (id_usuario) => {
  try {
    const res = await fetch(`${API_URL}/api/pqrs/usuario/${id_usuario}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error("Error en getPQRSPorUsuario:", error.message);

    return {
      error: true,
      mensaje: error.message || "Error al obtener PQRS",
    };
  }
};

/**
 * Obtiene todas las PQRS registradas.
 * Generalmente se usa desde el panel administrativo.
 */
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

/**
 * Consulta una PQRS específica mediante su ID.
 */
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

/**
 * Elimina una PQRS mediante su identificador.
 */
export const deletePQRS = async (id_pqr) => {
  try {
    const res = await fetch(`${API_URL}/api/pqrs/${id_pqr}`, {
      method: "DELETE",

      // Ruta protegida: requiere autenticación para eliminar registros
      headers: authHeaders(),
    });

    return res.json();
  } catch (error) {
    console.error("Error en deletePQRS:", error.message);

    return {
      mensaje: "Error al eliminar PQR",
    };
  }
};

/**
 * Obtiene la información de un usuario mediante su ID.
 * Se utiliza como apoyo para mostrar datos del solicitante de la PQRS.
 */
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

/**
 * Registra la respuesta administrativa a una PQRS.
 * Recibe el ID de la PQRS, la respuesta y el ID del administrador.
 */
export const responderPQRS = async ({ id_pqr, respuesta, id_admin }) => {
  try {
    const res = await fetch(`${API_URL}/api/pqrs/responder`, {
      method: "PUT",

      // Ruta protegida: solo usuarios autorizados deben responder PQRS
      headers: authHeaders(),

      body: JSON.stringify({
        id_pqr: Number(id_pqr),
        respuesta: respuesta?.trim(),
        id_admin: Number(id_admin) || 1,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.mensaje || `Error ${res.status}`);
    }

    return data;
  } catch (error) {
    console.error("Error en responderPQRS:", error.message);

    return {
      error: true,
      mensaje: error.message || "Error al responder el PQR",
    };
  }
};