import { useState, useEffect, useCallback } from "react";
import { 
  getReportes, 
  getReportesPorRecurso,
  deleteReporte,
  getUsuarioPorId,
  getReporteCompleto
} from "../api/Admin/Reportes.js";

export const useReportes = (idRecurso = null) => {
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const [tipoMensaje, setTipoMensaje] = useState(null); // 'exito' o 'error'

  // Función para mostrar mensajes
  const mostrarMensaje = useCallback((texto, tipo = 'exito') => {
    setMensaje(texto);
    setTipoMensaje(tipo);
  }, []);

  // Cargar reportes
  const cargarReportes = useCallback(async (idRecursoFiltro = null) => {
    setCargando(true);
    setMensaje(null);
    
    try {
      let resultado;
      if (idRecursoFiltro) {
        resultado = await getReportesPorRecurso(idRecursoFiltro);
      } else {
        resultado = await getReportes();
      }
      
      if (resultado.error) {
        mostrarMensaje(resultado.mensaje || "Error al cargar reportes", 'error');
        setReportes([]);
      } else {
        // Asegurarse de que resultado sea un array
        setReportes(Array.isArray(resultado) ? resultado : []);
      }
    } catch (err) {
      console.error("Error en cargarReportes:", err);
      mostrarMensaje("Error al cargar reportes", 'error');
      setReportes([]);
    } finally {
      setCargando(false);
    }
  }, [mostrarMensaje]);

  // Recargar reportes
  const recargarReportes = useCallback(async () => {
    await cargarReportes(idRecurso);
  }, [cargarReportes, idRecurso]);

  // Cargar reporte completo
  const cargarReporteCompleto = useCallback(async (id_reporte) => {
    try {
      const resultado = await getReporteCompleto(id_reporte);
      
      if (resultado.error) {
        mostrarMensaje(resultado.mensaje || "Error al cargar detalles del reporte", 'error');
        return null;
      }
      
      return resultado;
    } catch (err) {
      console.error("Error en cargarReporteCompleto:", err);
      mostrarMensaje("Error al cargar detalles del reporte", 'error');
      return null;
    }
  }, [mostrarMensaje]);

  // Eliminar reporte
  const eliminarReporte = useCallback(async (idReporte) => {
    setCargando(true);
    
    try {
      const resultado = await deleteReporte(idReporte);
      
      if (resultado.error) {
        mostrarMensaje(resultado.mensaje || "Error al eliminar el reporte", 'error');
        return { error: true };
      } else {
        mostrarMensaje("Reporte eliminado exitosamente", 'exito');
        // Recargar la lista de reportes
        await cargarReportes(idRecurso);
        return { error: false };
      }
    } catch (err) {
      console.error("Error en eliminarReporte:", err);
      mostrarMensaje("Error al eliminar el reporte", 'error');
      return { error: true };
    } finally {
      setCargando(false);
    }
  }, [cargarReportes, idRecurso, mostrarMensaje]);

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

  // Limpiar mensaje
  const limpiarMensajesReporte = useCallback(() => {
    setMensaje(null);
    setTipoMensaje(null);
  }, []);

  // Cargar reportes inicialmente
  useEffect(() => {
    cargarReportes(idRecurso);
  }, [cargarReportes, idRecurso]);

  return {
    // Datos
    reportes,
    
    // Estados
    cargando,
    mensaje: mensaje ? { texto: mensaje, tipo: tipoMensaje } : null,
    
    // Acciones
    recargarReportes,
    eliminarReporte,
    cargarReporteCompleto,
    cargarUsuario,
    limpiarMensajesReporte
  };
};