import { useState, useEffect } from "react";
import { 
  getUsuarios, 
  getUsuarioPorId, 
  postUsuario, 
  putUsuario, 
  deleteUsuario,
  loginUsuario,
  recuperarClave,
  existeCorreo,
  correoVerificado  
} from "../api/Admin/Usuarios.js";

export const useUsuarios = (idUsuario = null) => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  
  // Estados para listas de carreras y roles
  const [carreras, setCarreras] = useState([]);
  const [roles, setRoles] = useState([]);
  
  // Cargar todas las carreras
  const cargarCarreras = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/carreras', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!data.error && Array.isArray(data)) {
        setCarreras(data);
      } else {
        setCarreras([]);
      }
    } catch (error) {
      console.error('Error al cargar carreras:', error);
      setCarreras([]);
    }
  };
  
  // Cargar todos los roles
  const cargarRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/roles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!data.error && Array.isArray(data)) {
        setRoles(data);
      } else {
        setRoles([]);
      }
    } catch (error) {
      console.error('Error al cargar roles:', error);
      setRoles([]);
    }
  };
  
  // Función para obtener nombre de carrera por ID
  const getNombreCarrera = (idCarrera) => {
    if (!idCarrera) return "No asignada";
    const carrera = carreras.find(c => c.id_carrera === idCarrera);
    return carrera ? carrera.nombre_carrera : `Carrera ${idCarrera}`;
  };

  // Función para obtener nombre de rol por ID
  const getNombreRol = (idRol) => {
    if (!idRol) return "No asignado";
    const rol = roles.find(r => r.id_rol === idRol);
    return rol ? rol.nombre_rol : `Rol ${idRol}`;
  };

  // Cargar todos los usuarios
  const cargarUsuarios = async () => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await getUsuarios();
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al cargar usuarios");
        setUsuarios([]);
      } else {
        // IMPORTANTE: Las contraseñas vienen del backend
        // Agregamos estado para controlar visibilidad
        const usuariosConVisibilidad = resultado.map(usuario => ({
          ...usuario,
          mostrarContrasena: false, // Por defecto ocultas
          contrasena_oculta: "••••••••", // Placeholder para contraseña oculta
          contrasena_original: usuario.contrasena // Guardamos la contraseña original
        }));
        setUsuarios(usuariosConVisibilidad);
      }
    } catch (error) {
      setMensaje("Error al cargar usuarios");
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  // Cargar un usuario por ID
  const cargarUsuario = async (id) => {
    if (!id) return;
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await getUsuarioPorId(id);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al cargar el usuario");
        setUsuario(null);
      } else {
        setUsuario({
          ...resultado,
          mostrarPassword: false // Para controlar si se muestra la contraseña en formulario
        });
      }
    } catch (error) {
      setMensaje("Error al cargar el usuario");
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  // Función para alternar visibilidad de contraseña en la lista
  const toggleVerContrasena = (idUsuario) => {
    setUsuarios(prevUsuarios => 
      prevUsuarios.map(usuario => {
        if (usuario.id_usuario === idUsuario) {
          return {
            ...usuario,
            mostrarContrasena: !usuario.mostrarContrasena
          };
        }
        return usuario;
      })
    );
  };

  // Función para obtener la contraseña a mostrar (visible u oculta)
  const getContrasenaAMostrar = (usuario) => {
    if (usuario.mostrarContrasena) {
      return usuario.contrasena_original || usuario.contrasena || "";
    }
    return usuario.contrasena_oculta || "••••••••";
  };

  // Crear nuevo usuario
  const crearUsuario = async (nuevoUsuario) => {
    setCargando(true);
    setMensaje("");
    try {
      // Validar que tenga contraseña para creación
      if (!nuevoUsuario.contrasena || nuevoUsuario.contrasena.trim() === "") {
        setMensaje("La contraseña es obligatoria para nuevos usuarios");
        return { error: true, datos: { mensaje: "La contraseña es obligatoria" } };
      }
      
      const resultado = await postUsuario(nuevoUsuario);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al crear el usuario");
        return { error: true, datos: resultado };
      } else {
        setMensaje("Usuario creado exitosamente");
        await cargarUsuarios(); // Recargar la lista
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al crear el usuario");
      return { error: true, datos: { mensaje: "Error al crear el usuario" } };
    } finally {
      setCargando(false);
    }
  };

  // Actualizar usuario existente
  const actualizarUsuario = async (usuarioActualizado) => {
    setCargando(true);
    setMensaje("");
    try {
      // IMPORTANTE: Si la contraseña está vacía, usamos la original
      const usuarioParaEnviar = { ...usuarioActualizado };
      
      // Si la contraseña está vacía en el formulario, usamos la original
      if ((!usuarioParaEnviar.contrasena || 
          usuarioParaEnviar.contrasena.trim() === "") && 
          usuarioParaEnviar.contrasena_original) {
        usuarioParaEnviar.contrasena = usuarioParaEnviar.contrasena_original;
      }
      
      // Eliminamos campos extra que no deben ir al backend
      delete usuarioParaEnviar.mostrarPassword;
      delete usuarioParaEnviar.contrasena_oculta;
      delete usuarioParaEnviar.mostrarContrasena;
      
      const resultado = await putUsuario(usuarioParaEnviar);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al actualizar el usuario");
        return { error: true, datos: resultado };
      } else {
        setMensaje("Usuario actualizado exitosamente");
        await cargarUsuarios(); // Recargar la lista
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al actualizar el usuario");
      return { error: true, datos: { mensaje: "Error al actualizar el usuario" } };
    } finally {
      setCargando(false);
    }
  };

  // Eliminar usuario
  const eliminarUsuario = async (idUsuario) => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await deleteUsuario(idUsuario, token);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al eliminar el usuario");
        return { error: true, datos: resultado };
      } else {
        setMensaje("Usuario eliminado exitosamente");
        await cargarUsuarios(); // Recargar la lista
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al eliminar el usuario");
      return { error: true, datos: { mensaje: "Error al eliminar el usuario" } };
    } finally {
      setCargando(false);
    }
  };

  // Login de usuario
  const login = async (credenciales) => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await loginUsuario(credenciales);
      if (resultado.error || !resultado.success) {
        setMensaje(resultado.mensaje || "Error al iniciar sesión");
        return { error: true, datos: resultado };
      } else {
        setMensaje("Inicio de sesión exitoso");
        setUsuarioAutenticado(resultado.usuario);
        if (resultado.token) {
          setToken(resultado.token);
          localStorage.setItem('token', resultado.token);
        }
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al iniciar sesión");
      return { error: true, datos: { mensaje: "Error al iniciar sesión" } };
    } finally {
      setCargando(false);
    }
  };

  // Recuperar contraseña
  const recuperarContrasena = async (correo) => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await recuperarClave(correo);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al recuperar contraseña");
        return { error: true, datos: resultado };
      } else {
        setMensaje(resultado.mensaje || "Se ha enviado un correo de recuperación");
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al recuperar contraseña");
      return { error: true, datos: { mensaje: "Error al recuperar contraseña" } };
    } finally {
      setCargando(false);
    }
  };

  // Validar si el correo ya existe
const validarCorreo = async (correo) => {
  if (!correo) return false;

  try {
    const resultado = await existeCorreo(correo);
    return resultado.existe === true;
  } catch (error) {
    console.error("Error al validar correo:", error);
    return false;
  }
};

  // Logout
  const logout = () => {
    setUsuarioAutenticado(null);
    setToken(null);
    localStorage.removeItem('token');
    setMensaje("Sesión cerrada exitosamente");
  };

  // Limpiar mensajes
  const limpiarMensaje = () => {
    setMensaje("");
  };

  useEffect(() => {
    // Cargar listas de carreras y roles
    cargarCarreras();
    cargarRoles();
    
    if (idUsuario) {
      cargarUsuario(idUsuario);
    } else {
      cargarUsuarios();
    }
  }, [idUsuario]);

  return { 
    usuarios, 
    usuario, 
    cargando, 
    mensaje,
    usuarioAutenticado,
    token,
    carreras,
    roles,
    recargarUsuarios: cargarUsuarios, 
    recargarUsuario: cargarUsuario,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    getNombreCarrera,
    getNombreRol,
    toggleVerContrasena,
    getContrasenaAMostrar,
    login,
    logout,
    validarCorreo, 
    recuperarContrasena,
    limpiarMensaje,
    setToken
  };
};