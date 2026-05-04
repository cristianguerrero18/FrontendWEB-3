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
// SERVICIOS DE CARRERAS
// =====================================================

/**
 * Obtiene todas las carreras registradas en el sistema.
 */
export const getCarreras = async () => {
  try {
    const res = await fetch(`${API_URL}/api/carreras`, {
      method: "GET",

      // Se envía el token por si la ruta requiere autenticación en el backend
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error(res.status);

    return res.json();
  } catch (error) {
    console.error("Error en getCarreras:", error.message);
    return [];
  }
};

/**
 * Obtiene las carreras asociadas a un tipo de carrera específico.
 * Recibe el ID del tipo de carrera como parámetro.
 */
export const getCarrerasPortipo = async (id_tipo_carrera) => {
  try {
    const res = await fetch(`${API_URL}/api/carreras/tipo/${id_tipo_carrera}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error(res.status);

    return res.json();
  } catch (error) {
    console.error("Error en getCarrerasPortipo:", error.message);
    return [];
  }
};

/**
 * Crea una o varias carreras.
 * Puede recibir un arreglo de objetos o un objeto individual,
 * según la lógica definida en el backend.
 */
export const postCarreras = async (carreras) => {
  try {
    const res = await fetch(`${API_URL}/api/carreras`, {
      method: "POST",

      // Ruta protegida: requiere token JWT válido
      headers: authHeaders(),

      // Convierte los datos de JavaScript a formato JSON para enviarlos al backend
      body: JSON.stringify(carreras),
    });

    return res.json();
  } catch (error) {
    console.error("Error en postCarreras:", error.message);

    return {
      mensaje: "Error al crear carreras",
    };
  }
};

/**
 * Actualiza la información de una carrera existente.
 * Recibe un objeto con los datos requeridos por el backend.
 */
export const putCarrera = async (carrera) => {
  try {
    const res = await fetch(`${API_URL}/api/carreras`, {
      method: "PUT",

      // Ruta protegida: se envía el token JWT junto con el contenido JSON
      headers: authHeaders(),

      body: JSON.stringify(carrera),
    });

    return res.json();
  } catch (error) {
    console.error("Error en putCarrera:", error.message);

    return {
      mensaje: "Error al actualizar carrera",
    };
  }
};

/**
 * Elimina una carrera mediante su identificador.
 */
export const deleteCarrera = async (id) => {
  try {
    const res = await fetch(`${API_URL}/api/carreras/${id}`, {
      method: "DELETE",

      // Ruta protegida: requiere autenticación mediante token
      headers: authHeaders(),
    });

    return res.json();
  } catch (error) {
    console.error("Error en deleteCarrera:", error.message);

    return {
      mensaje: "Error al eliminar carrera",
    };
  }
};