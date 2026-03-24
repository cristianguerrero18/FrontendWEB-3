// hooks/usePerfil.js
import { useState, useEffect } from "react";
import { obtenerUsuarioPorId, actualizarUsuario, eliminarUsuario } from "../api/Admin/Perfil.js";

export const usePerfil = (idUsuario) => {
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);

  // Cargar perfil
  const cargarPerfil = async () => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await obtenerUsuarioPorId(idUsuario);
      if (resultado.error) {
        setMensaje(resultado.mensaje);
      } else {
        setPerfil(resultado);
      }
    } catch (error) {
      setMensaje("Error al cargar el perfil");
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  // Actualizar perfil
  const guardarPerfil = async (datos) => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await actualizarUsuario(datos);
      if (resultado.error) {
        setMensaje(resultado.mensaje);
      } else {
        setMensaje("Perfil actualizado correctamente");
        cargarPerfil();
      }
    } catch (error) {
      setMensaje("Error al actualizar el perfil");
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  // Eliminar perfil
  const eliminarPerfil = async () => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await eliminarUsuario(idUsuario);
      if (resultado.error) {
        setMensaje(resultado.mensaje);
      } else {
        setMensaje("Perfil eliminado correctamente");
        setPerfil(null);
        setMostrarModalEliminar(false);
        // Opcional: redirigir después de 2 segundos
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    } catch (error) {
      setMensaje("Error al eliminar el perfil");
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (idUsuario) cargarPerfil();
  }, [idUsuario]);

  return { 
    perfil, 
    cargando, 
    mensaje, 
    recargar: cargarPerfil, 
    guardarPerfil,
    eliminarPerfil,
    mostrarModalEliminar,
    setMostrarModalEliminar
  };
};