import { useState, useCallback, useRef } from "react";
import { 
  getNotificaciones,
  updateNotificacionVisto
} from "../api/Admin/Notificaciones.js";
import { useUser } from "../context/UserContext.jsx";

export const useNotificacionesSuperior = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  
  const { getUserId, userData, isAuthenticated } = useUser();
  
  // Ref para controlar si ya se cargaron las notificaciones
  const notificacionesCargadasRef = useRef(false);

  // Obtener ID del usuario actual
  const obtenerIdUsuario = useCallback(() => {
    if (!isAuthenticated) return null;
    
    // Priorizar userData.id_usuario
    const id = userData?.id_usuario || getUserId?.();
    return id || null;
  }, [isAuthenticated, userData?.id_usuario, getUserId]);

  // Cargar notificaciones (SOLO cuando se llama explícitamente)
  const cargarNotificaciones = useCallback(async () => {
    if (!isAuthenticated) {
      setNotificaciones([]);
      return;
    }

    const idUsuario = obtenerIdUsuario();
    if (!idUsuario) {
      setNotificaciones([]);
      return;
    }

    setCargando(true);
    
    try {
      const resultado = await getNotificaciones();
      
      if (!resultado?.error) {
        const notificacionesArray = Array.isArray(resultado) ? resultado : [];
        
        // Filtrar por usuario actual
        const notificacionesUsuario = notificacionesArray.filter(notif => {
          const notifUserId = notif.id_usuario || notif.userId || notif.usuario_id;
          return notifUserId == idUsuario;
        });
        
        // Formatear y ordenar notificaciones
        const formateadas = notificacionesUsuario
          .map(notif => ({
            id_notificacion: notif.id_notificacion || notif.id,
            mensaje: notif.mensaje || notif.message || 'Sin mensaje',
            estado: notif.estado || notif.status || 'no visto',
            tipo: notif.tipo || notif.type || 'info',
            fecha: notif.fecha || notif.fecha_creacion || notif.created_at || new Date().toISOString(),
            id_usuario: notif.id_usuario || null
          }))
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
          .slice(0, 10); // Limitar a 10 notificaciones
        
        setNotificaciones(formateadas);
        notificacionesCargadasRef.current = true;
      } else {
        setNotificaciones([]);
      }
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
      setNotificaciones([]);
    } finally {
      setCargando(false);
    }
  }, [isAuthenticated, obtenerIdUsuario]);

  // Marcar una notificación como vista
  const marcarComoVista = useCallback(async (idNotificacion) => {
    try {
      const resultado = await updateNotificacionVisto(idNotificacion);
      if (!resultado?.error) {
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
      const noVistas = notificaciones.filter(notif => 
        notif.estado?.toLowerCase() === 'no visto'
      );
      
      if (noVistas.length === 0) {
        setCargando(false);
        return;
      }
      
      // Marcar todas como vistas
      for (const notificacion of noVistas) {
        await updateNotificacionVisto(notificacion.id_notificacion);
      }
      
      // Actualizar estado local
      setNotificaciones(prev => prev.map(notif => ({
        ...notif,
        estado: 'visto'
      })));
      
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error);
    } finally {
      setCargando(false);
    }
  }, [notificaciones]);

  // Contar notificaciones no leídas
  const contarNoLeidas = useCallback(() => {
    return notificaciones.filter(notif => 
      notif.estado?.toLowerCase() === 'no visto'
    ).length;
  }, [notificaciones]);

  // Alternar visibilidad del dropdown
  const toggleDropdown = useCallback(async () => {
    const nuevoEstado = !mostrarDropdown;
    setMostrarDropdown(nuevoEstado);
    
    // Solo cargar notificaciones cuando se ABRE el dropdown
    if (nuevoEstado && !notificacionesCargadasRef.current) {
      await cargarNotificaciones();
    }
  }, [mostrarDropdown, cargarNotificaciones]);

  // Marcar como leída
  const marcarComoLeida = useCallback(async (idNotificacion) => {
    return await marcarComoVista(idNotificacion);
  }, [marcarComoVista]);

  // Recargar notificaciones manualmente
  const recargarNotificaciones = useCallback(async () => {
    await cargarNotificaciones();
  }, [cargarNotificaciones]);

  return {
    notificaciones,
    cargando,
    mostrarDropdown,
    toggleDropdown,
    marcarTodasComoLeidas,
    marcarComoLeida,
    contarNoLeidas,
    recargarNotificaciones
  };
};