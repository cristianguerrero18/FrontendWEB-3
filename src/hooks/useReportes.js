import { useState, useEffect, useCallback, useRef } from "react";
import { 
  getReportes, 
  getReportePorId, 
  getReportesPorRecurso,
  postReporte, 
  deleteReporte,
  getUsuarioPorId,
  getReporteCompleto
} from "../api/Admin/Reportes.js";

export const useReportes = (idRecurso = null) => {
  const [reportes, setReportes] = useState([]);
  const [reporte, setReporte] = useState(null);
  const [reporteCompleto, setReporteCompleto] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  
  // Usar useRef para evitar bucles
  const cargandoRef = useRef(false);

  // Cargar reportes - useCallback para evitar recreaciones
  const cargarReportes = useCallback(async (idRecursoFiltro = null) => {
    if (cargandoRef.current) return;
    
    cargandoRef.current = true;
    setCargando(true);
    setMensaje("");
    try {
      let resultado;
      if (idRecursoFiltro) {
        resultado = await getReportesPorRecurso(idRecursoFiltro);
      } else {
        resultado = await getReportes();
      }
      
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al cargar reportes");
        setReportes([]);
      } else {
        setReportes(resultado);
      }
    } catch (error) {
      setMensaje("Error al cargar reportes");
      console.error(error);
    } finally {
      setCargando(false);
      cargandoRef.current = false;
    }
  }, []);

  // Cargar reporte completo
  const cargarReporteCompleto = useCallback(async (id) => {
    if (!id) return null;
    
    setCargando(true);
    try {
      const resultado = await getReporteCompleto(id);
      console.log("Reporte completo recibido:", resultado); // Para debug
      
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al cargar el reporte completo");
        setReporteCompleto(null);
        return null;
      } else {
        setReporteCompleto(resultado);
        return resultado;
      }
    } catch (error) {
      setMensaje("Error al cargar el reporte completo");
      console.error(error);
      return null;
    } finally {
      setCargando(false);
    }
  }, []);

  // Cargar usuario por ID
  const cargarUsuario = useCallback(async (id_usuario) => {
    if (!id_usuario) return null;
    try {
      const resultado = await getUsuarioPorId(id_usuario);
      return resultado;
    } catch (error) {
      console.error("Error cargando usuario:", error);
      return null;
    }
  }, []);

  // Eliminar reporte
  const eliminarReporte = useCallback(async (idReporte) => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await deleteReporte(idReporte);
      if (resultado.mensaje?.includes("Error")) {
        setMensaje(resultado.mensaje || "Error al eliminar el reporte");
        return { error: true, datos: resultado };
      } else {
        setMensaje("Reporte eliminado exitosamente");
        await cargarReportes(idRecurso);
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al eliminar el reporte");
      return { error: true, datos: { mensaje: "Error al eliminar el reporte" } };
    } finally {
      setCargando(false);
    }
  }, [cargarReportes, idRecurso]);

  // Limpiar mensajes
  const limpiarMensaje = useCallback(() => {
    setMensaje("");
  }, []);

  // Cargar reportes inicialmente
  useEffect(() => {
    cargarReportes(idRecurso);
  }, [cargarReportes, idRecurso]);

  return { 
    reportes, 
    reporte,
    reporteCompleto,
    cargando, 
    mensaje, 
    recargarReportes: cargarReportes, 
    cargarUsuario,
    cargarReporteCompleto,
    eliminarReporte,
    limpiarMensaje,
  };
};