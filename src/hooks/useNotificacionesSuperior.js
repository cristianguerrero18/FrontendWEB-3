import { useState, useEffect, useCallback } from "react";
import { 
  getNotificaciones, // ✅ Usar getNotificaciones en lugar de getNotificacionesPorUsuario
  updateNotificacionVisto
} from "../api/Admin/Notificaciones.js";

export const useNotificacionesSuperior = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);

  // Cargar todas las notificaciones (no solo por usuario)
  const cargarNotificaciones = useCallback(async () => {
    setCargando(true);
    try {
      const resultado = await getNotificaciones();
      console.log("Resultado de getNotificaciones:", resultado); // Para debugging
      
      if (!resultado.error) {
        // Asegurarse de que sea un array
        const notificacionesArray = Array.isArray(resultado) ? resultado : [];
        
        // Ordenar por fecha (más reciente primero) y limitar a 10
        const ordenadas = notificacionesArray
          .map(notif => ({
            id_notificacion: notif.id_notificacion || notif.id,
            mensaje: notif.mensaje || notif.message || 'Sin mensaje',
            estado: notif.estado || notif.status || 'no visto',
            tipo: notif.tipo || notif.type || 'info',
            fecha: notif.fecha || notif.fecha_creacion || notif.created_at || new Date().toISOString(),
            id_usuario: notif.id_usuario || null
          }))
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
          .slice(0, 10);
        
        console.log("Notificaciones procesadas para superior:", ordenadas);
        setNotificaciones(ordenadas);
      } else {
        console.error("Error en getNotificaciones:", resultado.mensaje);
        setNotificaciones([]);
      }
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
      setNotificaciones([]);
    } finally {
      setCargando(false);
    }
  }, []);

  // Marcar una notificación como vista
  const marcarComoVista = useCallback(async (idNotificacion) => {
    try {
      const resultado = await updateNotificacionVisto(idNotificacion);
      if (!resultado.error) {
        // Actualizar el estado local
        setNotificaciones(prev => prev.map(notif => 
          notif.id_notificacion === idNotificacion 
            ? { ...notif, estado: 'visto' } 
            : notif
        ));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error al marcar como vista:", error);
      return false;
    }
  }, []);

  // Marcar todas como leídas
  const marcarTodasComoLeidas = useCallback(async () => {
    setCargando(true);
    try {
      // Obtener todas las notificaciones no vistas
      const noVistas = notificaciones.filter(notif => 
        notif.estado?.toLowerCase() === 'no visto'
      );
      
      // Marcar cada una como vista
      for (const notificacion of noVistas) {
        await updateNotificacionVisto(notificacion.id_notificacion);
      }
      
      // Actualizar el estado local
      setNotificaciones(prev => prev.map(notif => ({
        ...notif,
        estado: 'visto'
      })));
      
      console.log(`Marcadas ${noVistas.length} notificaciones como leídas`);
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error);
    } finally {
      setCargando(false);
      // Recargar para sincronizar
      await cargarNotificaciones();
    }
  }, [notificaciones, cargarNotificaciones]);

  // Marcar una notificación específica como vista al hacer clic
  const marcarComoLeida = useCallback(async (idNotificacion) => {
    const resultado = await marcarComoVista(idNotificacion);
    if (resultado) {
      // Si se marcó exitosamente, actualizar el estado
      setNotificaciones(prev => prev.map(notif => 
        notif.id_notificacion === idNotificacion 
          ? { ...notif, estado: 'visto' } 
          : notif
      ));
    }
    return resultado;
  }, [marcarComoVista]);

  // Alternar visibilidad del dropdown
  const toggleDropdown = useCallback(() => {
    setMostrarDropdown(prev => !prev);
    // Si se abre el dropdown, cargar notificaciones
    if (!mostrarDropdown) {
      cargarNotificaciones();
    }
  }, [mostrarDropdown, cargarNotificaciones]);

  // Contar notificaciones no leídas
  const contarNoLeidas = useCallback(() => {
    return notificaciones.filter(notif => 
      notif.estado?.toLowerCase() === 'no visto'
    ).length;
  }, [notificaciones]);

  // Cargar notificaciones al montar
  useEffect(() => {
    cargarNotificaciones();
    
    // Recargar cada 30 segundos
    const intervalo = setInterval(() => {
      cargarNotificaciones();
    }, 30000);
    
    return () => clearInterval(intervalo);
  }, [cargarNotificaciones]);

  return {
    notificaciones,
    cargando,
    mostrarDropdown,
    toggleDropdown,
    marcarTodasComoLeidas,
    marcarComoLeida,
    contarNoLeidas,
    recargarNotificaciones: cargarNotificaciones
  };
};