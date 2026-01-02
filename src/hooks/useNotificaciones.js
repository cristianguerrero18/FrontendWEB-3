import { useState, useEffect, useCallback } from "react";
import { 
  getNotificaciones, 
  getNotificacionesPorUsuario,
  deleteNotificacion,
  updateNotificacionVisto 
} from "../api/Admin/Notificaciones.js";

export const useNotificaciones = (idUsuario = null) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Cargar todas las notificaciones
  const cargarNotificaciones = useCallback(async () => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await getNotificaciones();
      
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al cargar notificaciones");
        setNotificaciones([]);
      } else {
        // Asegurarnos de que sea un array
        setNotificaciones(Array.isArray(resultado) ? resultado : []);
      }
      return resultado;
    } catch (error) {
      setMensaje("Error al cargar notificaciones");
      console.error(error);
      return [];
    } finally {
      setCargando(false);
    }
  }, []);

  // Marcar notificación como vista
  const marcarComoVista = useCallback(async (idNotificacion) => {
    try {
      const resultado = await updateNotificacionVisto(idNotificacion);
      if (resultado.error) {
        console.error("Error al marcar como vista:", resultado.mensaje);
        return { error: true, datos: resultado };
      } else {
        // Actualizar el estado local
        setNotificaciones(prev => prev.map(notif => 
          notif.id_notificacion === idNotificacion 
            ? { ...notif, estado: 'visto' } 
            : notif
        ));
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error("Error al marcar como vista:", error);
      return { error: true, datos: { mensaje: "Error al marcar como vista" } };
    }
  }, []);

  // Cargar notificaciones por usuario
  const cargarNotificacionesPorUsuario = useCallback(async (id_usuario) => {
    if (!id_usuario) return null;
    
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await getNotificacionesPorUsuario(id_usuario);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al cargar notificaciones del usuario");
        return null;
      } else {
        return resultado;
      }
    } catch (error) {
      const mensajeError = "Error al cargar notificaciones del usuario";
      setMensaje(mensajeError);
      console.error(error);
      return { error: true, mensaje: mensajeError };
    } finally {
      setCargando(false);
    }
  }, []);

  // Eliminar notificación
  const eliminarNotificacion = useCallback(async (idNotificacion) => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await deleteNotificacion(idNotificacion);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al eliminar la notificación");
        return { error: true, datos: resultado };
      } else {
        setMensaje("Notificación eliminada exitosamente");
        await cargarNotificaciones(); // Recargar la lista
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al eliminar la notificación");
      return { error: true, datos: { mensaje: "Error al eliminar la notificación" } };
    } finally {
      setCargando(false);
    }
  }, [cargarNotificaciones]);

  // Eliminar todas las notificaciones de un usuario
  const eliminarTodasNotificacionesUsuario = useCallback(async (id_usuario) => {
    setCargando(true);
    setMensaje("");
    try {
      // Primero obtenemos las notificaciones del usuario
      const notificacionesUsuario = await getNotificacionesPorUsuario(id_usuario);
      
      if (!notificacionesUsuario || notificacionesUsuario.error) {
        setMensaje("Error al obtener notificaciones del usuario");
        return { error: true, datos: notificacionesUsuario };
      }

      // Eliminamos cada notificación
      const resultados = [];
      for (const notificacion of notificacionesUsuario) {
        const resultado = await deleteNotificacion(notificacion.id_notificacion);
        resultados.push(resultado);
      }

      // Recargamos la lista completa
      await cargarNotificaciones();
      setMensaje("Todas las notificaciones del usuario han sido eliminadas");
      
      return { error: false, datos: resultados };
    } catch (error) {
      console.error(error);
      setMensaje("Error al eliminar notificaciones del usuario");
      return { error: true, datos: { mensaje: "Error al eliminar notificaciones del usuario" } };
    } finally {
      setCargando(false);
    }
  }, [cargarNotificaciones]);

  // Limpiar mensajes
  const limpiarMensaje = useCallback(() => {
    setMensaje("");
  }, []);

  // Cargar notificaciones inicialmente
  useEffect(() => {
    if (idUsuario) {
      cargarNotificacionesPorUsuario(idUsuario);
    } else {
      cargarNotificaciones();
    }
  }, [cargarNotificaciones, cargarNotificacionesPorUsuario, idUsuario]);

  return { 
    notificaciones, 
    cargando, 
    mensaje, 
    recargarNotificaciones: cargarNotificaciones, 
    recargarNotificacionesPorUsuario: cargarNotificacionesPorUsuario,
    eliminarNotificacion,
    eliminarTodasNotificacionesUsuario,
    marcarComoVista, // Agregada
    limpiarMensaje
  };
};