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
// SERVICIOS DE DERECHOS DE AUTOR
// =====================================================

/**
 * Obtiene todas las declaraciones de derechos de autor registradas.
 * Generalmente es utilizado desde el panel administrativo.
 */
export const getDerechosAutor = async () => {
  try {
    const res = await fetch(`${API_URL}/api/derechos-autor`, {
      method: "GET",

      // Ruta protegida: requiere token JWT válido
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error(res.status);

    return res.json();
  } catch (error) {
    console.error("Error en getDerechosAutor:", error.message);

    return [];
  }
};

/**
 * Consulta una declaración de derechos de autor específica mediante su ID.
 */
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

/**
 * Registra una nueva declaración de derechos de autor.
 * Recibe un objeto con la información requerida por el backend.
 *
 * Ejemplo:
 * { id_recurso, compromiso }
 */
export const postDerechosAutor = async (derechosAutor) => {
  try {
    const res = await fetch(`${API_URL}/api/derechos-autor`, {
      method: "POST",

      // Ruta protegida: solo usuarios autenticados pueden registrar la declaración
      headers: authHeaders(),

      // Convierte los datos de JavaScript a JSON para enviarlos al backend
      body: JSON.stringify(derechosAutor),
    });

    return res.json();
  } catch (error) {
    console.error("Error en postDerechosAutor:", error.message);

    return {
      mensaje: "Error al crear declaración",
    };
  }
};

/**
 * Elimina una declaración de derechos de autor mediante su identificador.
 */
export const deleteDerechosAutor = async (id_derechos_autor) => {
  try {
    const res = await fetch(`${API_URL}/api/derechos-autor/${id_derechos_autor}`, {
      method: "DELETE",

      // Ruta protegida: requiere autenticación mediante token
      headers: authHeaders(),
    });

    return res.json();
  } catch (error) {
    console.error("Error en deleteDerechosAutor:", error.message);

    return {
      mensaje: "Error al eliminar declaración",
    };
  }
};