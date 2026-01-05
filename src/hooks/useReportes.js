import { useState, useEffect, useCallback, useRef } from "react";
import { 
  getReportes, 
  getReportesPorRecurso,
  postReporte,
  deleteReporte,
  getUsuarioPorId
} from "../api/Admin/Reportes.js";

export const useReportes = (idRecurso = null) => {
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [operacion, setOperacion] = useState(null);

  // Cargar reportes
  const cargarReportes = useCallback(async (idRecursoFiltro = null) => {
    setCargando(true);
    setError(null);
    
    try {
      let resultado;
      if (idRecursoFiltro) {
        resultado = await getReportesPorRecurso(idRecursoFiltro);
      } else {
        resultado = await getReportes();
      }
      
      if (resultado.error) {
        setError(resultado.mensaje || "Error al cargar reportes");
        setReportes([]);
      } else {
        setReportes(resultado);
      }
    } catch (err) {
      setError("Error al cargar reportes");
      console.error("Error en cargarReportes:", err);
    } finally {
      setCargando(false);
    }
  }, []);

  // Verificar si el usuario ya reportó este recurso
  const usuarioReportoRecurso = useCallback(async (idRecurso) => {
    if (!idRecurso) return false;
    
    setCargando(true);
    setOperacion({ tipo: 'verificando', idRecurso });
    
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      
      // Decodificar el token
      const payload = JSON.parse(atob(token.split('.')[1]));
      const idUsuario = payload.id_usuario;
      
      // Obtener reportes del recurso
      const resultado = await getReportesPorRecurso(idRecurso);
      
      if (resultado.error) {
        setError(resultado.mensaje || "Error al verificar reportes");
        return false;
      }
      
      // Verificar si el usuario ya reportó
      const usuarioYaReporto = resultado.some(reporte => 
        reporte.id_usuario === idUsuario
      );
      
      return usuarioYaReporto;
    } catch (err) {
      console.error("Error en usuarioReportoRecurso:", err);
      setError("Error al verificar reportes");
      return false;
    } finally {
      setCargando(false);
      setOperacion(null);
    }
  }, []);

  // Reportar un recurso
  const reportarRecurso = useCallback(async (idRecurso, motivo) => {
    if (!idRecurso || !motivo.trim()) {
      setError("ID del recurso y motivo son requeridos");
      return { error: true, exito: false };
    }
    
    setCargando(true);
    setError(null);
    setExito(null);
    setOperacion({ tipo: 'reportando', idRecurso });
    
    try {
      const resultado = await postReporte(idRecurso, motivo);
      
      if (resultado.error) {
        setError(resultado.mensaje || "Error al reportar el recurso");
        return { error: true, exito: false };
      } else {
        setExito(resultado.mensaje || "Recurso reportado exitosamente");
        // Recargar los reportes de este recurso
        await cargarReportes(idRecurso);
        return { error: false, exito: true };
      }
    } catch (err) {
      console.error("Error en reportarRecurso:", err);
      setError("Error al reportar el recurso");
      return { error: true, exito: false };
    } finally {
      setCargando(false);
      setOperacion(null);
    }
  }, [cargarReportes]);

  // Eliminar reporte
  const eliminarReporte = useCallback(async (idReporte) => {
    setCargando(true);
    setError(null);
    setExito(null);
    
    try {
      const resultado = await deleteReporte(idReporte);
      
      if (resultado.error) {
        setError(resultado.mensaje || "Error al eliminar el reporte");
        return { error: true };
      } else {
        setExito("Reporte eliminado exitosamente");
        await cargarReportes(idRecurso);
        return { error: false };
      }
    } catch (err) {
      console.error("Error en eliminarReporte:", err);
      setError("Error al eliminar el reporte");
      return { error: true };
    } finally {
      setCargando(false);
    }
  }, [cargarReportes, idRecurso]);

  // Limpiar mensajes
  const limpiarMensajes = useCallback(() => {
    setError(null);
    setExito(null);
    setOperacion(null);
  }, []);

  // Obtener usuario
  const cargarUsuario = useCallback(async (id_usuario) => {
    if (!id_usuario) return null;
    
    try {
      const resultado = await getUsuarioPorId(id_usuario);
      return resultado.error ? null : resultado;
    } catch (err) {
      console.error("Error en cargarUsuario:", err);
      return null;
    }
  }, []);

  // Cargar reportes inicialmente
  useEffect(() => {
    if (idRecurso) {
      cargarReportes(idRecurso);
    }
  }, [cargarReportes, idRecurso]);

  return {
    // Datos
    reportes,
    
    // Estados
    cargando,
    error,
    exito,
    operacion,
    
    // Acciones
    cargarReportes,
    usuarioReportoRecurso,
    reportarRecurso,
    eliminarReporte,
    cargarUsuario,
    limpiarMensajes
  };
};