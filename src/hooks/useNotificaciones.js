import { useState, useEffect, useCallback, useRef } from "react";
import { 
  getNotificacionesPorUsuario,
  deleteNotificacion,
  updateNotificacionVisto 
} from "../api/Admin/Notificaciones.js";
import { useUser } from "../context/UserContext.jsx";

export const useNotificaciones = (idUsuarioParam = null) => {
  console.log("🚀 [useNotificaciones] Iniciando hook...");
  
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  
  const { getUserId, userData, isAuthenticated, logout } = useUser();
  const idUsuarioRef = useRef(null);
  
  console.log("📋 [useNotificaciones] Estado del usuario:");
  console.log("   - userData:", userData);
  console.log("   - isAuthenticated:", isAuthenticated);
  console.log("   - userData?.id_usuario:", userData?.id_usuario);

  // Obtener el ID del usuario actual del contexto con limpieza
  const obtenerIdUsuario = useCallback(() => {
    console.log("🆔 [obtenerIdUsuario] Ejecutándose...");
    
    // Si se pasa un idUsuario como parámetro, usarlo
    if (idUsuarioParam) {
      console.log("🆔 [obtenerIdUsuario] Usando idUsuarioParam:", idUsuarioParam);
      return idUsuarioParam;
    }
    
    // Verificar primero si hay un usuario autenticado
    if (!isAuthenticated) {
      console.log("🆔 [obtenerIdUsuario] No hay usuario autenticado");
      // Limpiar notificaciones si no hay usuario autenticado
      setNotificaciones([]);
      return null;
    }
    
    // Intentar obtener del contexto
    try {
      // Usar userData actual
      if (userData && userData.id_usuario) {
        const newId = userData.id_usuario;
        console.log("🆔 [obtenerIdUsuario] Usando userData.id_usuario:", newId);
        
        // Verificar si el ID ha cambiado
        if (idUsuarioRef.current !== newId) {
          console.log("🔄 [obtenerIdUsuario] ID de usuario ha cambiado:", idUsuarioRef.current, "→", newId);
          idUsuarioRef.current = newId;
          // Limpiar notificaciones anteriores
          setNotificaciones([]);
        }
        return newId;
      }
      
      // Si no hay userData pero hay autenticación, intentar con getUserId
      if (getUserId) {
        const userIdFromContext = getUserId();
        console.log("🆔 [obtenerIdUsuario] getUserId() devolvió:", userIdFromContext);
        if (userIdFromContext) {
          if (idUsuarioRef.current !== userIdFromContext) {
            console.log("🔄 [obtenerIdUsuario] ID de usuario ha cambiado:", idUsuarioRef.current, "→", userIdFromContext);
            idUsuarioRef.current = userIdFromContext;
            setNotificaciones([]);
          }
          return userIdFromContext;
        }
      }
      
      console.log("🆔 [obtenerIdUsuario] No se pudo obtener ID de usuario");
      setNotificaciones([]);
      return null;
    } catch (error) {
      console.error("❌ [obtenerIdUsuario] Error obteniendo ID de usuario:", error);
      return null;
    }
  }, [idUsuarioParam, getUserId, userData, isAuthenticated]);

  // Cargar notificaciones del usuario específico
  const cargarNotificacionesPorUsuario = useCallback(async () => {
    console.log("📥 [cargarNotificacionesPorUsuario] Ejecutándose...");
    
    // Verificar autenticación primero
    if (!isAuthenticated) {
      console.warn("⚠️ [cargarNotificacionesPorUsuario] Usuario no autenticado");
      setNotificaciones([]);
      setMensaje("Usuario no autenticado");
      return [];
    }
    
    const idUsuario = obtenerIdUsuario();
    console.log("📥 ID de usuario obtenido:", idUsuario);
    
    if (!idUsuario) {
      console.warn("⚠️ [cargarNotificacionesPorUsuario] No se pudo obtener el ID del usuario");
      setMensaje("No se pudo identificar al usuario");
      setNotificaciones([]);
      return [];
    }
    
    setCargando(true);
    setMensaje("");
    console.log("🔄 [cargarNotificacionesPorUsuario] Cargando notificaciones para usuario:", idUsuario);
    
    try {
      const resultado = await getNotificacionesPorUsuario(idUsuario);
      console.log("✅ [cargarNotificacionesPorUsuario] Resultado de API:", resultado);
      
      if (resultado.error) {
        console.error("❌ [cargarNotificacionesPorUsuario] Error en resultado:", resultado.mensaje);
        
        // Si hay error de autenticación, cerrar sesión
        if (resultado.mensaje && resultado.mensaje.includes("autenticación")) {
          setMensaje("Sesión expirada. Por favor, inicie sesión nuevamente.");
          logout();
        } else {
          setMensaje(resultado.mensaje || "Error al cargar notificaciones del usuario");
        }
        
        setNotificaciones([]);
      } else {
        // Asegurarnos de que sea un array
        const notificacionesArray = Array.isArray(resultado) ? resultado : [];
        console.log(`📊 [cargarNotificacionesPorUsuario] ${notificacionesArray.length} notificaciones cargadas`);
        
        // Verificar que las notificaciones correspondan al usuario actual
        const notificacionesFiltradas = notificacionesArray.filter(
          notif => notif.id_usuario == idUsuario
        );
        
        console.log("📊 Notificaciones filtradas por usuario:", notificacionesFiltradas);
        setNotificaciones(notificacionesFiltradas);
      }
      return resultado;
    } catch (error) {
      console.error("❌ [cargarNotificacionesPorUsuario] Error en catch:", error);
      setMensaje("Error al cargar notificaciones del usuario");
      return [];
    } finally {
      console.log("🏁 [cargarNotificacionesPorUsuario] Finalizando carga");
      setCargando(false);
    }
  }, [obtenerIdUsuario, isAuthenticated, logout]);

  // Marcar notificación como vista
  const marcarComoVista = useCallback(async (idNotificacion) => {
    console.log("👁️ [marcarComoVista] Marcando notificación:", idNotificacion);
    try {
      const resultado = await updateNotificacionVisto(idNotificacion);
      if (resultado.error) {
        console.error("❌ [marcarComoVista] Error:", resultado.mensaje);
        return { error: true, datos: resultado };
      } else {
        console.log("✅ [marcarComoVista] Notificación marcada como vista");
        // Actualizar el estado local
        setNotificaciones(prev => prev.map(notif => 
          notif.id_notificacion === idNotificacion 
            ? { ...notif, estado: 'visto' } 
            : notif
        ));
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error("❌ [marcarComoVista] Error en catch:", error);
      return { error: true, datos: { mensaje: "Error al marcar como vista" } };
    }
  }, []);

  // Eliminar notificación del usuario
  const eliminarNotificacion = useCallback(async (idNotificacion) => {
    console.log("🗑️ [eliminarNotificacion] Eliminando notificación:", idNotificacion);
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await deleteNotificacion(idNotificacion);
      if (resultado.error) {
        console.error("❌ [eliminarNotificacion] Error:", resultado.mensaje);
        setMensaje(resultado.mensaje || "Error al eliminar la notificación");
        return { error: true, datos: resultado };
      } else {
        console.log("✅ [eliminarNotificacion] Notificación eliminada exitosamente");
        setMensaje("Notificación eliminada exitosamente");
        await cargarNotificacionesPorUsuario(); // Recargar la lista del usuario
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error("❌ [eliminarNotificacion] Error en catch:", error);
      setMensaje("Error al eliminar la notificación");
      return { error: true, datos: { mensaje: "Error al eliminar la notificación" } };
    } finally {
      setCargando(false);
    }
  }, [cargarNotificacionesPorUsuario]);

  // Eliminar todas las notificaciones del usuario
  const eliminarTodasNotificacionesUsuario = useCallback(async () => {
    console.log("🗑️🗑️ [eliminarTodasNotificacionesUsuario] Eliminando todas las notificaciones");
    const idUsuario = obtenerIdUsuario();
    
    if (!idUsuario) {
      console.error("❌ [eliminarTodasNotificacionesUsuario] No hay ID de usuario");
      setMensaje("No se pudo identificar al usuario");
      return { error: true, datos: { mensaje: "No se pudo identificar al usuario" } };
    }
    
    setCargando(true);
    setMensaje("");
    try {
      const notificacionesUsuario = [...notificaciones];
      console.log(`📊 [eliminarTodasNotificacionesUsuario] ${notificacionesUsuario.length} notificaciones a eliminar`);
      
      if (notificacionesUsuario.length === 0) {
        console.log("ℹ️ [eliminarTodasNotificacionesUsuario] No hay notificaciones para eliminar");
        setMensaje("No hay notificaciones para eliminar");
        return { error: false, datos: [] };
      }

      const resultados = [];
      for (const notificacion of notificacionesUsuario) {
        if (notificacion.id_usuario == idUsuario) {
          console.log(`🗑️ Eliminando notificación ${notificacion.id_notificacion}`);
          const resultado = await deleteNotificacion(notificacion.id_notificacion);
          resultados.push(resultado);
        }
      }

      await cargarNotificacionesPorUsuario();
      console.log("✅ [eliminarTodasNotificacionesUsuario] Todas las notificaciones eliminadas");
      setMensaje("Todas las notificaciones han sido eliminadas");
      
      return { error: false, datos: resultados };
    } catch (error) {
      console.error("❌ [eliminarTodasNotificacionesUsuario] Error:", error);
      setMensaje("Error al eliminar notificaciones");
      return { error: true, datos: { mensaje: "Error al eliminar notificaciones" } };
    } finally {
      setCargando(false);
    }
  }, [notificaciones, cargarNotificacionesPorUsuario, obtenerIdUsuario]);

  // Limpiar mensajes
  const limpiarMensaje = useCallback(() => {
    console.log("🧹 [limpiarMensaje] Limpiando mensaje");
    setMensaje("");
  }, []);

  // Efecto para limpiar notificaciones cuando el usuario cambia
  useEffect(() => {
    console.log("🔄 [useEffect] Verificando cambio de usuario");
    
    // Si no hay usuario autenticado, limpiar notificaciones
    if (!isAuthenticated) {
      console.log("🧹 [useEffect] Limpiando notificaciones - usuario no autenticado");
      setNotificaciones([]);
      return;
    }
    
    // Obtener el ID actual
    const currentId = obtenerIdUsuario();
    console.log("📊 [useEffect] ID actual:", currentId);
    
    // Si el ID es diferente al anterior, limpiar notificaciones
    if (idUsuarioRef.current !== currentId) {
      console.log("🧹 [useEffect] Limpiando notificaciones - ID de usuario ha cambiado");
      setNotificaciones([]);
    }
    
    idUsuarioRef.current = currentId;
  }, [isAuthenticated, obtenerIdUsuario, userData?.id_usuario]);

  // Cargar notificaciones solo cuando haya un usuario válido
  useEffect(() => {
    console.log("🎯 [useEffect-carga] Iniciando carga de notificaciones");
    
    // No cargar si no hay usuario autenticado
    if (!isAuthenticated) {
      console.log("⏸️ [useEffect-carga] No hay usuario autenticado, no cargar");
      return;
    }
    
    const idUsuario = obtenerIdUsuario();
    if (idUsuario) {
      console.log("🔄 [useEffect-carga] Cargando notificaciones para usuario:", idUsuario);
      cargarNotificacionesPorUsuario();
    } else {
      console.log("⏸️ [useEffect-carga] No hay ID de usuario, no cargar");
    }
  }, [isAuthenticated, obtenerIdUsuario, cargarNotificacionesPorUsuario]);

  console.log("📊 [useNotificaciones] Estado final:");
  console.log("   - notificaciones:", notificaciones.length);
  console.log("   - cargando:", cargando);
  console.log("   - mensaje:", mensaje);
  console.log("   - usuario actual:", obtenerIdUsuario());

  return { 
    notificaciones, 
    cargando, 
    mensaje, 
    recargarNotificaciones: cargarNotificacionesPorUsuario,
    eliminarNotificacion,
    eliminarTodasNotificacionesUsuario,
    marcarComoVista,
    limpiarMensaje
  };
};