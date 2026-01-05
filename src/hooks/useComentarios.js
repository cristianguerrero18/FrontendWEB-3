import { useState, useEffect, useCallback } from "react";
import { 
  getComentariosPorRecurso,
  crearComentario,
  editarComentario,
  deleteComentario,
  verificarPermisosComentario,
  contarComentariosRecurso,
  formatearFechaComentario,
  obtenerAvatarUsuario,
  obtenerNombreCompleto
} from "../api/Admin/ComentariosAPI.js";

export const useComentarios = (idRecurso = null) => {
  const [comentarios, setComentarios] = useState([]);
  const [totalComentarios, setTotalComentarios] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [operacion, setOperacion] = useState(null);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [editandoComentario, setEditandoComentario] = useState(null);
  const [textoEditando, setTextoEditando] = useState("");
  const [permisosCache, setPermisosCache] = useState({});

  // Cargar comentarios del recurso
  const cargarComentariosRecurso = useCallback(async (recursoId) => {
    if (!recursoId) return;
    
    setCargando(true);
    setError(null);
    setOperacion({ tipo: 'cargando', idRecurso: recursoId });
    
    try {
      const resultado = await getComentariosPorRecurso(recursoId);
      if (resultado.error) {
        setError(resultado.mensaje || "Error al cargar comentarios del recurso");
        setComentarios([]);
        setTotalComentarios(0);
      } else {
        setComentarios(resultado.comentarios || []);
        setTotalComentarios(resultado.total_comentarios || 0);
      }
    } catch (err) {
      console.error("Error en cargarComentariosRecurso:", err);
      setError("Error al cargar comentarios del recurso");
      setComentarios([]);
      setTotalComentarios(0);
    } finally {
      setCargando(false);
      setOperacion(null);
    }
  }, []);

  // Contar comentarios del recurso
  const contarComentarios = useCallback(async (recursoId) => {
    if (!recursoId) return 0;
    
    try {
      const total = await contarComentariosRecurso(recursoId);
      return total;
    } catch (err) {
      console.error("Error en contarComentarios:", err);
      return 0;
    }
  }, []);

  // Verificar permisos para un comentario
  const verificarPermisos = useCallback(async (idComentario) => {
    if (!idComentario) return { puede_editar: false, puede_eliminar: false, es_autor: false };
    
    // Verificar cache primero
    if (permisosCache[idComentario]) {
      return permisosCache[idComentario];
    }
    
    setOperacion({ tipo: 'verificando-permisos', idComentario });
    
    try {
      const resultado = await verificarPermisosComentario(idComentario);
      
      // Actualizar cache
      setPermisosCache(prev => ({
        ...prev,
        [idComentario]: resultado
      }));
      
      return resultado;
    } catch (err) {
      console.error("Error en verificarPermisos:", err);
      return { puede_editar: false, puede_eliminar: false, es_autor: false };
    } finally {
      setOperacion(null);
    }
  }, [permisosCache]);

  // Crear nuevo comentario
  const crearNuevoComentario = useCallback(async () => {
    if (!idRecurso || !nuevoComentario.trim()) {
      setError("El comentario no puede estar vacío");
      return { error: true, mensaje: "El comentario no puede estar vacío" };
    }
    
    setCargando(true);
    setMensaje("");
    setError(null);
    setOperacion({ 
      tipo: 'creando', 
      idRecurso, 
      cargando: true 
    });
    
    try {
      const resultado = await crearComentario(idRecurso, nuevoComentario);
      
      if (!resultado.success || resultado.error) {
        setError(resultado.mensaje || "Error al crear el comentario");
        setOperacion({ tipo: 'error', idRecurso });
        return { 
          error: true, 
          datos: resultado,
          mensaje: resultado.mensaje || "Error al crear el comentario"
        };
      } else {
        // Actualizar estado local inmediatamente para feedback visual
        const nuevoComentarioData = resultado.data?.comentario;
        if (nuevoComentarioData) {
          setComentarios(prev => [nuevoComentarioData, ...prev]);
          setTotalComentarios(prev => prev + 1);
        }
        
        setNuevoComentario("");
        setMensaje("Comentario agregado correctamente");
        
        // Recargar datos del servidor para asegurar consistencia
        await cargarComentariosRecurso(idRecurso);
        
        setOperacion({ tipo: 'completado', idRecurso });
        
        return { 
          error: false, 
          datos: resultado,
          mensaje: resultado.mensaje || "Comentario creado correctamente"
        };
      }
    } catch (err) {
      console.error("Error en crearNuevoComentario:", err);
      setError("Error al crear el comentario");
      setOperacion({ tipo: 'error', idRecurso });
      return { 
        error: true, 
        datos: { mensaje: "Error al crear el comentario" }
      };
    } finally {
      setCargando(false);
      setTimeout(() => {
        setMensaje("");
        setOperacion(null);
      }, 3000);
    }
  }, [idRecurso, nuevoComentario, cargarComentariosRecurso]);

  // Iniciar edición de comentario
  const iniciarEdicion = useCallback((comentario) => {
    setEditandoComentario(comentario.id_comentario);
    setTextoEditando(comentario.comentario);
  }, []);

  // Cancelar edición
  const cancelarEdicion = useCallback(() => {
    setEditandoComentario(null);
    setTextoEditando("");
  }, []);

  // Guardar comentario editado
  const guardarEdicion = useCallback(async () => {
    if (!editandoComentario || !textoEditando.trim()) {
      setError("El comentario no puede estar vacío");
      return { error: true, mensaje: "El comentario no puede estar vacío" };
    }
    
    setCargando(true);
    setMensaje("");
    setError(null);
    setOperacion({ 
      tipo: 'editando', 
      idComentario: editandoComentario, 
      cargando: true 
    });
    
    try {
      const resultado = await editarComentario(editandoComentario, textoEditando);
      
      if (!resultado.success || resultado.error) {
        setError(resultado.mensaje || "Error al actualizar el comentario");
        setOperacion({ tipo: 'error', idComentario: editandoComentario });
        return { 
          error: true, 
          datos: resultado,
          mensaje: resultado.mensaje || "Error al actualizar el comentario"
        };
      } else {
        // Actualizar estado local inmediatamente
        const comentarioActualizado = resultado.data?.comentario;
        if (comentarioActualizado) {
          setComentarios(prev => prev.map(com => 
            com.id_comentario === editandoComentario 
              ? { ...com, ...comentarioActualizado } 
              : com
          ));
        }
        
        setMensaje("Comentario actualizado correctamente");
        setEditandoComentario(null);
        setTextoEditando("");
        
        // Recargar datos del servidor para asegurar consistencia
        await cargarComentariosRecurso(idRecurso);
        
        setOperacion({ tipo: 'completado', idComentario: editandoComentario });
        
        return { 
          error: false, 
          datos: resultado,
          mensaje: resultado.mensaje || "Comentario actualizado correctamente"
        };
      }
    } catch (err) {
      console.error("Error en guardarEdicion:", err);
      setError("Error al actualizar el comentario");
      setOperacion({ tipo: 'error', idComentario: editandoComentario });
      return { 
        error: true, 
        datos: { mensaje: "Error al actualizar el comentario" }
      };
    } finally {
      setCargando(false);
      setTimeout(() => {
        setMensaje("");
        setOperacion(null);
      }, 3000);
    }
  }, [editandoComentario, textoEditando, idRecurso, cargarComentariosRecurso]);

  // Eliminar comentario
  const eliminarComentario = useCallback(async (idComentario) => {
    if (!idComentario) {
      return { error: true, mensaje: "ID de comentario no proporcionado" };
    }
    
    setCargando(true);
    setMensaje("");
    setError(null);
    setOperacion({ 
      tipo: 'eliminando', 
      idComentario, 
      cargando: true 
    });
    
    try {
      const resultado = await deleteComentario(idComentario);
      
      if (!resultado.success || resultado.error) {
        setError(resultado.mensaje || "Error al eliminar el comentario");
        setOperacion({ tipo: 'error', idComentario });
        return { 
          error: true, 
          datos: resultado,
          mensaje: resultado.mensaje || "Error al eliminar el comentario"
        };
      } else {
        // Actualizar estado local inmediatamente
        setComentarios(prev => prev.filter(com => com.id_comentario !== idComentario));
        setTotalComentarios(prev => Math.max(0, prev - 1));
        
        // Limpiar cache de permisos
        setPermisosCache(prev => {
          const newCache = { ...prev };
          delete newCache[idComentario];
          return newCache;
        });
        
        setMensaje("Comentario eliminado correctamente");
        
        // Recargar datos del servidor para asegurar consistencia
        if (idRecurso) {
          await cargarComentariosRecurso(idRecurso);
        }
        
        setOperacion({ tipo: 'completado', idComentario });
        
        return { 
          error: false, 
          datos: resultado,
          mensaje: resultado.mensaje || "Comentario eliminado correctamente"
        };
      }
    } catch (err) {
      console.error("Error en eliminarComentario:", err);
      setError("Error al eliminar el comentario");
      setOperacion({ tipo: 'error', idComentario });
      return { 
        error: true, 
        datos: { mensaje: "Error al eliminar el comentario" }
      };
    } finally {
      setCargando(false);
      setTimeout(() => {
        setMensaje("");
        setOperacion(null);
      }, 3000);
    }
  }, [idRecurso, cargarComentariosRecurso]);

  // Recargar todos los datos
  const recargarDatos = useCallback(async (recursoId) => {
    if (!recursoId) return;
    
    setCargando(true);
    try {
      await cargarComentariosRecurso(recursoId);
    } catch (err) {
      console.error("Error en recargarDatos:", err);
    } finally {
      setCargando(false);
    }
  }, [cargarComentariosRecurso]);

  // Limpiar mensajes
  const limpiarMensajes = useCallback(() => {
    setMensaje("");
    setError(null);
  }, []);

  // Formatear fecha del comentario
  const formatearFecha = useCallback((fechaString) => {
    return formatearFechaComentario(fechaString);
  }, []);

  // Obtener avatar del usuario
  const obtenerAvatar = useCallback((usuario) => {
    return obtenerAvatarUsuario(usuario);
  }, []);

  // Obtener nombre completo del usuario
  const obtenerNombre = useCallback((usuario) => {
    return obtenerNombreCompleto(usuario);
  }, []);

  // Verificar si el comentario está siendo editado
  const estaEditando = useCallback((idComentario) => {
    return editandoComentario === idComentario;
  }, [editandoComentario]);

  // Obtener comentario por ID
  const getComentarioById = useCallback((idComentario) => {
    return comentarios.find(com => com.id_comentario === idComentario) || null;
  }, [comentarios]);

  // Efecto para cargar comentarios cuando cambia el idRecurso
  useEffect(() => {
    if (idRecurso) {
      recargarDatos(idRecurso);
    } else {
      // Resetear estado si no hay recurso
      setComentarios([]);
      setTotalComentarios(0);
      setNuevoComentario("");
      setEditandoComentario(null);
      setTextoEditando("");
      setPermisosCache({});
      setMensaje("");
      setError(null);
    }
  }, [idRecurso, recargarDatos]);

  return {
    // Datos
    comentarios,
    totalComentarios,
    nuevoComentario,
    editandoComentario,
    textoEditando,
    
    // Estados
    cargando,
    error,
    mensaje,
    operacion,
    
    // Acciones
    cargarComentariosRecurso,
    contarComentarios,
    verificarPermisos,
    setNuevoComentario,
    crearNuevoComentario,
    iniciarEdicion,
    cancelarEdicion,
    setTextoEditando,
    guardarEdicion,
    eliminarComentario,
    recargarDatos,
    limpiarMensajes,
    
    // Utilidades
    formatearFecha,
    obtenerAvatar,
    obtenerNombre,
    estaEditando,
    getComentarioById
  };
};