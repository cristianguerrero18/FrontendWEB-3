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
// SERVICIOS DE ASIGNATURAS
// =====================================================

/**
 * Obtiene todas las asignaturas registradas en el sistema.
 */
export const getAsignaturas = async () => {
  try {
    const res = await fetch(`${API_URL}/api/asignaturas`, {
      method: "GET",

      // Se envía el token por si la ruta requiere autenticación en el backend
      headers: authHeaders(),
    });

    // Si la respuesta no es exitosa, se lanza un error controlado
    if (!res.ok) throw new Error(res.status);

    return res.json();
  } catch (error) {
    // En caso de error, se registra en consola y se retorna un arreglo vacío
    console.error("Error en getAsignaturas:", error.message);
    return [];
  }
};

/**
 * Consulta una asignatura específica mediante su ID.
 */
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

/**
 * Crea una o varias asignaturas.
 * Puede recibir un arreglo de objetos:
 * [{ nombre_asignatura: "Matemáticas" }]
 */
export const postAsignaturas = async (asignaturas) => {
  try {
    const res = await fetch(`${API_URL}/api/asignaturas`, {
      method: "POST",

      // Ruta protegida: requiere token JWT válido
      headers: authHeaders(),

      // Convierte los datos de JavaScript a formato JSON para enviarlos al backend
      body: JSON.stringify(asignaturas),
    });

    return res.json();
  } catch (error) {
    console.error("Error en postAsignaturas:", error.message);

    return {
      mensaje: "Error al crear asignaturas",
    };
  }
};

/**
 * Actualiza una asignatura existente.
 * Recibe un objeto con:
 * { id_asignatura, nombre_asignatura }
 */
export const putAsignatura = async (asignatura) => {
  try {
    const res = await fetch(`${API_URL}/api/asignaturas`, {
      method: "PUT",

      // Ruta protegida: se envía el token JWT junto con el contenido JSON
      headers: authHeaders(),

      body: JSON.stringify(asignatura),
    });

    return res.json();
  } catch (error) {
    console.error("Error en putAsignatura:", error.message);

    return {
      mensaje: "Error al actualizar asignatura",
    };
  }
};

/**
 * Elimina una asignatura según su ID.
 */
export const deleteAsignatura = async (id_asignatura) => {
  try {
    const res = await fetch(`${API_URL}/api/asignaturas/${id_asignatura}`, {
      method: "DELETE",

      // Ruta protegida: requiere autenticación mediante token
      headers: authHeaders(),
    });

    return res.json();
  } catch (error) {
    console.error("Error en deleteAsignatura:", error.message);

    return {
      mensaje: "Error al eliminar asignatura",
    };
  }
};