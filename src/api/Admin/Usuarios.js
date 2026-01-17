const API_URL = "https://proyectoweb-2-ir8x.onrender.com"; // ajusta si cambia el puerto

// ======================
// USUARIOS
// ======================

// Obtener todos los usuarios
export const getUsuarios = async () => {
  try {
    const res = await fetch(`${API_URL}/api/usuarios`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch (error) {
    console.error("Error en getUsuarios:", error.message);
    return [];
  }
};

// Obtener usuario por ID
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

// Registrar usuario (POST)
export const postUsuario = async (usuario) => {
  try {
    const res = await fetch(`${API_URL}/api/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuario),
      /*
        {
          nombres_usuario,
          apellidos_usuario,
          correo,
          contrasena,
          id_carrera,
          id_rol
        }
      */
    });

    return res.json();
  } catch (error) {
    console.error("Error en postUsuario:", error.message);
    return { mensaje: "Error al registrar usuario" };
  }
};

// Login
export const loginUsuario = async (credenciales) => {
  try {
    const res = await fetch(`${API_URL}/api/usuarios/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credenciales),
      // { correo, contrasena }
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

// Actualizar usuario (PUT)
export const putUsuario = async (usuario) => {
  try {
    const res = await fetch(`${API_URL}/api/usuarios`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuario),
      /*
        {
          id_usuario,
          nombres_usuario,
          apellidos_usuario,
          correo,
          contrasena,
          id_carrera,
          id_rol
        }
      */
    });

    return res.json();
  } catch (error) {
    console.error("Error en putUsuario:", error.message);
    return { mensaje: "Error al actualizar usuario" };
  }
};

// Recuperar contraseña
export const recuperarClave = async (correo) => {
  try {
    const res = await fetch(`${API_URL}/api/usuarios/recuperar-clave`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo }),
    });

    return res.json();
  } catch (error) {
    console.error("Error en recuperarClave:", error.message);
    return { mensaje: "Error al recuperar contraseña" };
  }
};

// Eliminar usuario (requiere token)
export const deleteUsuario = async (id_usuario, token) => {
  try {
    const res = await fetch(`${API_URL}/api/usuarios/${id_usuario}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // middleware verificarToken
      },
    });

    return res.json();
  } catch (error) {
    console.error("Error en deleteUsuario:", error.message);
    return { mensaje: "Error al eliminar usuario" };
  }
};

// ======================
// NUEVOS ENDPOINTS
// ======================

// Obtener carrera por ID
export const getCarreraPorId = async (id_carrera) => {
  try {
    const res = await fetch(
      `${API_URL}/api/usuarios/carrera/${id_carrera}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch (error) {
    console.error("Error en getCarreraPorId:", error.message);
    return null;
  }
};

// Obtener rol por ID
export const getRolPorId = async (id_rol) => {
  try {
    const res = await fetch(
      `${API_URL}/api/usuarios/rol/${id_rol}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch (error) {
    console.error("Error en getRolPorId:", error.message);
    return null;
  }
};


// ======================
// VALIDAR SI CORREO EXISTE
// ======================
export const existeCorreo = async (correo) => {
  try {
    const res = await fetch(
      `${API_URL}/api/usuarios/existe-correo/${encodeURIComponent(correo)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!res.ok) throw new Error(res.status);
    return res.json(); // { existe: true | false }
  } catch (error) {
    console.error("Error en existeCorreo:", error.message);
    return { existe: false };
  }
};

// ======================
// VALIDAR SI CORREO ESTÁ VERIFICADO
// ======================
export const correoVerificado = async (correo) => {
  try {
    const res = await fetch(
      `${API_URL}/api/usuarios/correo-verificado/${encodeURIComponent(correo)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!res.ok) throw new Error(res.status);
    return res.json(); // { verificado: true | false }
  } catch (error) {
    console.error("Error en correoVerificado:", error.message);
    return { verificado: false };
  }
};

