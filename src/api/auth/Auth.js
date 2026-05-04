// URL base del backend desplegado en Render.
// Si el dominio del backend cambia, solo se modifica esta constante.
const API_URL = "https://proyectoweb-2-ir8x.onrender.com";

// =====================================================
// CONFIGURACIÓN GENERAL
// =====================================================

/**
 * Genera encabezados básicos para solicitudes en formato JSON.
 * Se usa en rutas públicas como registro, verificación, login y recuperación de contraseña.
 */
const jsonHeaders = () => ({
  "Content-Type": "application/json",
});

// =====================================================
// SERVICIOS DE AUTENTICACIÓN
// =====================================================

/**
 * Registra un nuevo usuario en el sistema.
 * Envía al backend los datos capturados desde el formulario de registro.
 */
export const registrarUsuario = async (datos) => {
  try {
    const res = await fetch(`${API_URL}/api/usuarios`, {
      method: "POST",
      headers: jsonHeaders(),

      // Convierte los datos del usuario a formato JSON
      body: JSON.stringify(datos),
    });

    return res.json();
  } catch (error) {
    console.error("Error en registrarUsuario:", error.message);

    return {
      error: true,
      mensaje: "Error al registrar usuario",
    };
  }
};

/**
 * Valida el código enviado al correo electrónico del usuario.
 * Recibe el email y el código ingresado desde la interfaz.
 */
export const verificarCodigo = async (email, codigoIngresado) => {
  try {
    const res = await fetch(`${API_URL}/api/validar-codigo`, {
      method: "POST",
      headers: jsonHeaders(),

      // Envía el correo y el código para confirmar la cuenta
      body: JSON.stringify({
        email,
        codigoIngresado,
      }),
    });

    return res.json();
  } catch (error) {
    console.error("Error en verificarCodigo:", error.message);

    return {
      error: true,
      mensaje: "Error al verificar el código",
    };
  }
};

/**
 * Inicia sesión en el sistema.
 * Envía las credenciales del usuario al backend para validar el acceso.
 */
export const loginUsuario = async (datos) => {
  try {
    const res = await fetch(`${API_URL}/api/usuarios/login`, {
      method: "POST",
      headers: jsonHeaders(),

      // Datos esperados: { correo, contrasena }
      body: JSON.stringify(datos),
    });

    return res.json();
  } catch (error) {
    console.error("Error en loginUsuario:", error.message);

    return {
      error: true,
      mensaje: "Error al iniciar sesión",
    };
  }
};

/**
 * Solicita el proceso de recuperación de contraseña.
 * Envía el correo del usuario para que el backend gestione el envío del mensaje.
 */
export const recuperarClave = async (correo) => {
  try {
    const res = await fetch(`${API_URL}/api/usuarios/recuperar-clave`, {
      method: "POST",
      headers: jsonHeaders(),

      // Correo asociado a la cuenta que desea recuperar la contraseña
      body: JSON.stringify({ correo }),
    });

    return res.json();
  } catch (error) {
    console.error("Error en recuperarClave:", error.message);

    return {
      error: true,
      mensaje: "Error al recuperar contraseña",
    };
  }
};