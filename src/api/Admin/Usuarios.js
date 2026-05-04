// URL base del backend desplegado en Render.
// Si el dominio del backend cambia, solo se modifica esta constante.
const API_URL = "https://proyectoweb-2-ir8x.onrender.com";

// =====================================================
// CONFIGURACIÓN GENERAL
// =====================================================

/**
 * Genera encabezados básicos para solicitudes JSON.
 * Se usa en rutas públicas como registro, login y consultas generales.
 */
const jsonHeaders = () => ({
  "Content-Type": "application/json",
});

/**
 * Genera encabezados con autenticación JWT.
 * Se usa en rutas protegidas que requieren usuario autenticado.
 */
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// =====================================================
// SERVICIOS DE USUARIOS
// =====================================================

/**
 * Obtiene todos los usuarios registrados en el sistema.
 */
export const getUsuarios = async () => {
  try {
    const res = await fetch(`${API_URL}/api/usuarios`, {
      method: "GET",
      headers: jsonHeaders(),
    });

    if (!res.ok) throw new Error(res.status);

    return res.json();
  } catch (error) {
    console.error("Error en getUsuarios:", error.message);
    return [];
  }
};

/**
 * Consulta un usuario específico mediante su ID.
 */
export const getUsuarioPorId = async (id_usuario) => {
  try {
    const res = await fetch(`${API_URL}/api/usuarios/${id_usuario}`, {
      method: "GET",
      headers: jsonHeaders(),
    });

    if (!res.ok) throw new Error(res.status);

    return res.json();
  } catch (error) {
    console.error("Error en getUsuarioPorId:", error.message);
    return null;
  }
};

/**
 * Registra un nuevo usuario en el sistema.
 *
 * Estructura esperada:
 * {
 *   nombres_usuario,
 *   apellidos_usuario,
 *   correo,
 *   contrasena,
 *   id_carrera,
 *   id_rol
 * }
 */
export const postUsuario = async (usuario) => {
  try {
    const res = await fetch(`${API_URL}/api/usuarios`, {
      method: "POST",
      headers: jsonHeaders(),

      // Convierte la información del usuario a formato JSON
      body: JSON.stringify(usuario),
    });

    return res.json();
  } catch (error) {
    console.error("Error en postUsuario:", error.message);

    return {
      mensaje: "Error al registrar usuario",
    };
  }
};

/**
 * Inicia sesión con las credenciales del usuario.
 *
 * Estructura esperada:
 * { correo, contrasena }
 */
export const loginUsuario = async (credenciales) => {
  try {
    const res = await fetch(`${API_URL}/api/usuarios/login`, {
      method: "POST",
      headers: jsonHeaders(),

      // Envía correo y contraseña al backend para validar autenticación
      body: JSON.stringify(credenciales),
    });

    return res.json();
  } catch (error) {
    console.error("Error en loginUsuario:", error.message);

    return {
      success: false,
      mensaje: "Error al iniciar sesión",
    };
  }
};

/**
 * Actualiza la información de un usuario existente.
 *
 * Estructura esperada:
 * {
 *   id_usuario,
 *   nombres_usuario,
 *   apellidos_usuario,
 *   correo,
 *   contrasena,
 *   id_carrera,
 *   id_rol
 * }
 */
export const putUsuario = async (usuario) => {
  try {
    const res = await fetch(`${API_URL}/api/usuarios`, {
      method: "PUT",
      headers: jsonHeaders(),
      body: JSON.stringify(usuario),
    });

    return res.json();
  } catch (error) {
    console.error("Error en putUsuario:", error.message);

    return {
      mensaje: "Error al actualizar usuario",
    };
  }
};

/**
 * Envía una solicitud de recuperación de contraseña.
 * Recibe el correo del usuario como parámetro.
 */
export const recuperarClave = async (correo) => {
  try {
    const res = await fetch(`${API_URL}/api/usuarios/recuperar-clave`, {
      method: "POST",
      headers: jsonHeaders(),

      // Se envía el correo al backend para iniciar el proceso de recuperación
      body: JSON.stringify({ correo }),
    });

    return res.json();
  } catch (error) {
    console.error("Error en recuperarClave:", error.message);

    return {
      mensaje: "Error al recuperar contraseña",
    };
  }
};

/**
 * Elimina un usuario mediante su ID.
 * Esta operación requiere autenticación mediante token JWT.
 */
export const deleteUsuario = async (id_usuario) => {
  try {
    const res = await fetch(`${API_URL}/api/usuarios/${id_usuario}`, {
      method: "DELETE",

      // Ruta protegida por el middleware verificarToken
      headers: authHeaders(),
    });

    return res.json();
  } catch (error) {
    console.error("Error en deleteUsuario:", error.message);

    return {
      mensaje: "Error al eliminar usuario",
    };
  }
};

// =====================================================
// CONSULTAS AUXILIARES
// =====================================================

/**
 * Obtiene la información de una carrera mediante su ID.
 * Se usa como apoyo para mostrar datos relacionados con el usuario.
 */
export const getCarreraPorId = async (id_carrera) => {
  try {
    const res = await fetch(`${API_URL}/api/usuarios/carrera/${id_carrera}`, {
      method: "GET",
      headers: jsonHeaders(),
    });

    if (!res.ok) throw new Error(res.status);

    return res.json();
  } catch (error) {
    console.error("Error en getCarreraPorId:", error.message);
    return null;
  }
};

/**
 * Obtiene la información de un rol mediante su ID.
 * Se usa para mostrar o validar el tipo de usuario.
 */
export const getRolPorId = async (id_rol) => {
  try {
    const res = await fetch(`${API_URL}/api/usuarios/rol/${id_rol}`, {
      method: "GET",
      headers: jsonHeaders(),
    });

    if (!res.ok) throw new Error(res.status);

    return res.json();
  } catch (error) {
    console.error("Error en getRolPorId:", error.message);
    return null;
  }
};

// =====================================================
// VALIDACIONES DE CORREO
// =====================================================

/**
 * Verifica si un correo ya se encuentra registrado en el sistema.
 * encodeURIComponent evita errores si el correo contiene caracteres especiales.
 */
export const existeCorreo = async (correo) => {
  try {
    const res = await fetch(
      `${API_URL}/api/usuarios/existe-correo/${encodeURIComponent(correo)}`,
      {
        method: "GET",
        headers: jsonHeaders(),
      }
    );

    if (!res.ok) throw new Error(res.status);

    // Respuesta esperada: { existe: true | false }
    return res.json();
  } catch (error) {
    console.error("Error en existeCorreo:", error.message);

    return {
      existe: false,
    };
  }
};

/**
 * Verifica si un correo registrado ya fue confirmado por el usuario.
 * Se usa durante el inicio de sesión o procesos de validación de cuenta.
 */
export const correoVerificado = async (correo) => {
  try {
    const res = await fetch(
      `${API_URL}/api/usuarios/correo-verificado/${encodeURIComponent(correo)}`,
      {
        method: "GET",
        headers: jsonHeaders(),
      }
    );

    if (!res.ok) throw new Error(res.status);

    // Respuesta esperada: { verificado: true | false }
    return res.json();
  } catch (error) {
    console.error("Error en correoVerificado:", error.message);

    return {
      verificado: false,
    };
  }
};