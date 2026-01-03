const API_URL = "https://proyectoweb-3.onrender.com"; // cambia si tu backend usa otro puerto

// Registrar usuario
export const registrarUsuario = async (datos) => {
  const res = await fetch(`${API_URL}/api/usuarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  return res.json();
};

// Verificar código
export const verificarCodigo = async (email, codigoIngresado) => {
  const res = await fetch(`${API_URL}/api/validar-codigo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, codigoIngresado }),
  });

  return res.json();
};

// Login
export const loginUsuario = async (datos) => {
  const res = await fetch(`${API_URL}/api/usuarios/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  return res.json();
};


export const recuperarClave = async (correo) => {
  const res = await fetch(`${API_URL}/api/usuarios/recuperar-clave`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo }),
  });

  return res.json();
};



