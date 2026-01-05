import { useState, useEffect, useCallback } from "react";
import { 
  getLikesPorRecurso, 
  getEstadisticasRecurso, 
  verificarMiLike, 
  gestionarReaccion,
  contarLikesRecurso
} from "../api/Admin/recursoLikesAPI.js";

export const useRecursoLikes = (idRecurso = null) => {
  const [likesData, setLikesData] = useState({
    likes: 0,
    dislikes: 0,
    total: 0
  });
  const [miReaccion, setMiReaccion] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [operacion, setOperacion] = useState(null);

  // Cargar datos básicos de likes
  const cargarLikesRecurso = useCallback(async (recursoId) => {
    if (!recursoId) return;
    
    setCargando(true);
    setError(null);
    setOperacion({ tipo: 'cargando', idRecurso: recursoId });
    
    try {
      const resultado = await contarLikesRecurso(recursoId);
      if (resultado.error) {
        setError(resultado.mensaje || "Error al cargar likes del recurso");
        setLikesData({ likes: 0, dislikes: 0, total: 0 });
      } else {
        setLikesData({
          likes: resultado.likes || 0,
          dislikes: resultado.dislikes || 0,
          total: resultado.total || 0
        });
      }
    } catch (err) {
      console.error("Error en cargarLikesRecurso:", err);
      setError("Error al cargar likes del recurso");
    } finally {
      setCargando(false);
      setOperacion(null);
    }
  }, []);

  // Cargar estadísticas completas
  const cargarEstadisticasCompletas = useCallback(async (recursoId) => {
    if (!recursoId) return;
    
    setCargando(true);
    setError(null);
    setOperacion({ tipo: 'cargando-estadisticas', idRecurso: recursoId });
    
    try {
      const resultado = await getEstadisticasRecurso(recursoId);
      if (resultado.error) {
        setError(resultado.mensaje || "Error al cargar estadísticas");
        setEstadisticas(null);
      } else {
        setEstadisticas(resultado);
      }
    } catch (err) {
      console.error("Error en cargarEstadisticasCompletas:", err);
      setError("Error al cargar estadísticas");
    } finally {
      setCargando(false);
      setOperacion(null);
    }
  }, []);

  // Verificar mi reacción actual
  const cargarMiReaccion = useCallback(async (recursoId) => {
    if (!recursoId) return;
    
    setOperacion({ tipo: 'verificando', idRecurso: recursoId });
    
    try {
      const resultado = await verificarMiLike(recursoId);
      if (resultado.error) {
        setMiReaccion(null);
      } else {
        setMiReaccion(resultado.tipo || null);
      }
    } catch (err) {
      console.error("Error en cargarMiReaccion:", err);
      setMiReaccion(null);
    } finally {
      setOperacion(null);
    }
  }, []);

  // Dar like/dislike (toggle)
  const manejarReaccion = useCallback(async (recursoId, tipoReaccion) => {
    if (!recursoId || !tipoReaccion) {
      setError("Faltan datos para procesar la reacción");
      return { error: true, mensaje: "Faltan datos" };
    }
    
    setCargando(true);
    setMensaje("");
    setError(null);
    setOperacion({ 
      tipo: 'reaccionando', 
      idRecurso: recursoId, 
      cargando: true 
    });
    
    try {
      const resultado = await gestionarReaccion(recursoId, tipoReaccion);
      
      if (resultado.error || resultado.mensaje?.includes("Error")) {
        setError(resultado.mensaje || "Error al procesar la reacción");
        setOperacion({ tipo: 'error', idRecurso: recursoId });
        return { 
          error: true, 
          datos: resultado,
          mensaje: resultado.mensaje || "Error al procesar la reacción"
        };
      } else {
        // Actualizar estado local inmediatamente para feedback visual
        const nuevaAccion = resultado.nuevaAccion;
        const tipoAnterior = resultado.tipoAnterior;
        const nuevoTipo = tipoReaccion;
        
        if (nuevaAccion === 'eliminado') {
          // Se eliminó la reacción (toggle)
          setMiReaccion(null);
          // Ajustar contadores
          if (tipoAnterior === 'like') {
            setLikesData(prev => ({
              ...prev,
              likes: Math.max(0, prev.likes - 1),
              total: Math.max(0, prev.total - 1)
            }));
          } else if (tipoAnterior === 'dislike') {
            setLikesData(prev => ({
              ...prev,
              dislikes: Math.max(0, prev.dislikes - 1),
              total: Math.max(0, prev.total - 1)
            }));
          }
          setMensaje("Reacción eliminada");
        } else if (nuevaAccion === 'actualizado') {
          // Se cambió de tipo (like ↔ dislike)
          setMiReaccion(nuevoTipo);
          // Ajustar contadores
          if (tipoAnterior === 'like' && nuevoTipo === 'dislike') {
            setLikesData(prev => ({
              ...prev,
              likes: Math.max(0, prev.likes - 1),
              dislikes: prev.dislikes + 1
            }));
          } else if (tipoAnterior === 'dislike' && nuevoTipo === 'like') {
            setLikesData(prev => ({
              ...prev,
              likes: prev.likes + 1,
              dislikes: Math.max(0, prev.dislikes - 1)
            }));
          }
          setMensaje(`Cambiado a ${nuevoTipo === 'like' ? '👍 Like' : '👎 Dislike'}`);
        } else if (nuevaAccion === 'creado') {
          // Nueva reacción
          setMiReaccion(nuevoTipo);
          // Aumentar contadores
          if (nuevoTipo === 'like') {
            setLikesData(prev => ({
              ...prev,
              likes: prev.likes + 1,
              total: prev.total + 1
            }));
          } else if (nuevoTipo === 'dislike') {
            setLikesData(prev => ({
              ...prev,
              dislikes: prev.dislikes + 1,
              total: prev.total + 1
            }));
          }
          setMensaje(`${nuevoTipo === 'like' ? '👍 Like' : '👎 Dislike'} agregado`);
        }
        
        // Recargar datos del servidor para asegurar consistencia
        await cargarLikesRecurso(recursoId);
        await cargarMiReaccion(recursoId);
        
        setOperacion({ tipo: 'completado', idRecurso: recursoId });
        
        return { 
          error: false, 
          datos: resultado,
          mensaje: resultado.mensaje || "Reacción procesada correctamente"
        };
      }
    } catch (err) {
      console.error("Error en manejarReaccion:", err);
      setError("Error al procesar la reacción");
      setOperacion({ tipo: 'error', idRecurso: recursoId });
      return { 
        error: true, 
        datos: { mensaje: "Error al procesar la reacción" }
      };
    } finally {
      setCargando(false);
      setTimeout(() => {
        setMensaje("");
        setOperacion(null);
      }, 3000);
    }
  }, [cargarLikesRecurso, cargarMiReaccion]);

  // Dar like
  const darLike = useCallback(async (recursoId) => {
    return await manejarReaccion(recursoId, 'like');
  }, [manejarReaccion]);

  // Dar dislike
  const darDislike = useCallback(async (recursoId) => {
    return await manejarReaccion(recursoId, 'dislike');
  }, [manejarReaccion]);

  // Recargar todos los datos
  const recargarDatos = useCallback(async (recursoId) => {
    if (!recursoId) return;
    
    setCargando(true);
    try {
      await Promise.all([
        cargarLikesRecurso(recursoId),
        cargarMiReaccion(recursoId)
      ]);
    } catch (err) {
      console.error("Error en recargarDatos:", err);
    } finally {
      setCargando(false);
    }
  }, [cargarLikesRecurso, cargarMiReaccion]);

  // Limpiar mensajes
  const limpiarMensajes = useCallback(() => {
    setMensaje("");
    setError(null);
  }, []);

  // Efecto para cargar datos cuando cambia el idRecurso
  useEffect(() => {
    if (idRecurso) {
      recargarDatos(idRecurso);
    } else {
      // Resetear estado si no hay recurso
      setLikesData({ likes: 0, dislikes: 0, total: 0 });
      setMiReaccion(null);
      setEstadisticas(null);
      setMensaje("");
      setError(null);
    }
  }, [idRecurso, recargarDatos]);

  return {
    // Datos
    likesData,
    miReaccion,
    estadisticas,
    
    // Estados
    cargando,
    error,
    mensaje,
    operacion,
    
    // Acciones
    cargarLikesRecurso,
    cargarEstadisticasCompletas,
    cargarMiReaccion,
    darLike,
    darDislike,
    manejarReaccion,
    recargarDatos,
    limpiarMensajes
  };
};