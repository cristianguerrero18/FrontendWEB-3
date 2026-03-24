import { useState, useEffect, useCallback } from "react";
import { 
  getLogs, 
  getLogsDetallados, 
  getLogsPorUsuario,
  postLog,
  postLogCompleto,
  deleteAllLogs,
  truncateLogs,
  deleteLogsByDateRange
} from "../api/Admin/Log_acceso.js";

export const useLogs = (tipo = "todos", idUsuario = null) => {
  const [logs, setLogs] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    hoy: 0,
    usuariosUnicos: 0
  });

  const calcularEstadisticas = useCallback((datos) => {
    if (!Array.isArray(datos) || datos.length === 0) {
      return {
        total: 0,
        hoy: 0,
        usuariosUnicos: 0
      };
    }

    const hoy = new Date().toISOString().split('T')[0];
    const logsHoy = datos.filter(log => {
      const fechaLog = log.fecha_acceso || log.fecha;
      return fechaLog && fechaLog.includes(hoy);
    });
    
    const usuariosUnicos = [...new Set(
      datos
        .map(log => log.id_usuario)
        .filter(id => id != null)
    )].length;
    
    return {
      total: datos.length,
      hoy: logsHoy.length,
      usuariosUnicos
    };
  }, []);

  const cargarLogs = useCallback(async () => {
    setCargando(true);
    setMensaje("");
    setError(null);
    
    try {
      let resultado;
      
      switch(tipo) {
        case "detallados":
          resultado = await getLogsDetallados();
          break;
        case "porUsuario":
          if (!idUsuario) {
            setMensaje("Se requiere ID de usuario");
            setCargando(false);
            return;
          }
          resultado = await getLogsPorUsuario(idUsuario);
          break;
        case "todos":
        default:
          resultado = await getLogs();
      }

      if (resultado && resultado.data && Array.isArray(resultado.data)) {
        // Si la respuesta tiene estructura { data: [...] }
        const logsOrdenados = resultado.data.sort((a, b) => 
          new Date(b.fecha_acceso || b.fecha) - new Date(a.fecha_acceso || a.fecha)
        );
        
        setLogs(logsOrdenados);
        setEstadisticas(calcularEstadisticas(logsOrdenados));
      } else if (Array.isArray(resultado)) {
        // Si la respuesta es directamente un array
        const logsOrdenados = resultado.sort((a, b) => 
          new Date(b.fecha_acceso || b.fecha) - new Date(a.fecha_acceso || a.fecha)
        );
        
        setLogs(logsOrdenados);
        setEstadisticas(calcularEstadisticas(logsOrdenados));
      } else if (resultado?.mensaje) {
        setMensaje(resultado.mensaje);
        setError(resultado.mensaje);
        setLogs([]);
      } else {
        setMensaje("Formato de datos inesperado");
        setError("Formato de datos inesperado");
        setLogs([]);
      }
    } catch (error) {
      console.error("Error en cargarLogs:", error);
      setMensaje("Error de conexión al servidor");
      setError(error.message);
      setLogs([]);
    } finally {
      setCargando(false);
    }
  }, [tipo, idUsuario, calcularEstadisticas]);

  const registrarLog = async (logData) => {
    try {
      setMensaje("");
      const resultado = await postLog(logData);
      
      if (resultado?.error) {
        setMensaje(resultado.mensaje || "Error al registrar log");
        return { error: true, datos: resultado };
      }
      
      setMensaje("Log registrado exitosamente");
      await cargarLogs();
      return { error: false, datos: resultado };
    } catch (error) {
      setMensaje("Error al registrar log");
      return { error: true, datos: { mensaje: "Error al registrar log", error: error.message } };
    }
  };

  const registrarLogCompleto = async (userData) => {
    try {
      setMensaje("");
      const resultado = await postLogCompleto(userData);
      
      if (resultado?.error) {
        setMensaje(resultado.mensaje || "Error al registrar log completo");
        return { error: true, datos: resultado };
      }
      
      setMensaje("Log completo registrado exitosamente");
      await cargarLogs();
      return { error: false, datos: resultado };
    } catch (error) {
      setMensaje("Error al registrar log completo");
      return { error: true, datos: { mensaje: "Error al registrar log completo", error: error.message } };
    }
  };

  // Eliminar todos los logs
  const eliminarTodosLosLogs = async () => {
    try {
      setCargando(true);
      setMensaje("");
      setError(null);
      
      const resultado = await deleteAllLogs();
      
      if (resultado?.error) {
        setMensaje(resultado.mensaje || "Error al eliminar logs");
        setError(resultado.mensaje);
        return { error: true, datos: resultado };
      }
      
      setMensaje(resultado?.mensaje || "Logs eliminados exitosamente");
      await cargarLogs(); // Recargar después de eliminar
      return { error: false, datos: resultado };
    } catch (error) {
      console.error("Error en eliminarTodosLosLogs:", error);
      setMensaje("Error al eliminar logs");
      setError(error.message);
      return { error: true, datos: { mensaje: "Error al eliminar logs", error: error.message } };
    } finally {
      setCargando(false);
    }
  };

  // Truncar tabla de logs
  const truncarLogs = async () => {
    try {
      setCargando(true);
      setMensaje("");
      setError(null);
      
      const resultado = await truncateLogs();
      
      if (resultado?.error) {
        setMensaje(resultado.mensaje || "Error al truncar logs");
        setError(resultado.mensaje);
        return { error: true, datos: resultado };
      }
      
      setMensaje(resultado?.mensaje || "Logs truncados exitosamente");
      await cargarLogs(); // Recargar después de truncar
      return { error: false, datos: resultado };
    } catch (error) {
      console.error("Error en truncarLogs:", error);
      setMensaje("Error al truncar logs");
      setError(error.message);
      return { error: true, datos: { mensaje: "Error al truncar logs", error: error.message } };
    } finally {
      setCargando(false);
    }
  };

  // Eliminar logs por rango de fechas
  const eliminarLogsPorFecha = async (fechaInicio, fechaFin) => {
    try {
      setCargando(true);
      setMensaje("");
      setError(null);
      
      const resultado = await deleteLogsByDateRange(fechaInicio, fechaFin);
      
      if (resultado?.error) {
        setMensaje(resultado.mensaje || "Error al eliminar logs por fecha");
        setError(resultado.mensaje);
        return { error: true, datos: resultado };
      }
      
      setMensaje(resultado?.mensaje || "Logs eliminados por fecha exitosamente");
      await cargarLogs(); // Recargar después de eliminar
      return { error: false, datos: resultado };
    } catch (error) {
      console.error("Error en eliminarLogsPorFecha:", error);
      setMensaje("Error al eliminar logs por fecha");
      setError(error.message);
      return { error: true, datos: { mensaje: "Error al eliminar logs por fecha", error: error.message } };
    } finally {
      setCargando(false);
    }
  };

  const limpiarMensaje = useCallback(() => {
    setMensaje("");
  }, []);

  const limpiarError = useCallback(() => {
    setError(null);
    setMensaje("");
  }, []);

  useEffect(() => {
    cargarLogs();
  }, [cargarLogs]);

  return {
    logs,
    cargando,
    mensaje,
    error,
    estadisticas,
    recargarLogs: cargarLogs,
    registrarLog,
    registrarLogCompleto,
    eliminarTodosLosLogs,
    truncarLogs,
    eliminarLogsPorFecha,
    limpiarMensaje,
    limpiarError
  };
};