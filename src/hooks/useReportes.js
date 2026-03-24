import { useState, useEffect, useCallback } from "react";
import { 
  getReportes, 
  getReportesPorRecurso,
  deleteReporte,
  getUsuarioPorId,
  getReporteCompleto
} from "../api/Admin/Reportes.js";

// Base URL para tu backend (ajusta esto según tu configuración)
const API_BASE_URL = "http://localhost:4000"; // O la URL de tu backend

// Función para crear un reporte
const postReporte = async (idRecurso, motivo) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return { error: true, mensaje: "No autenticado" };
    }

    console.log("Creando reporte para recurso:", idRecurso, "con motivo:", motivo);

    const response = await fetch(`${API_BASE_URL}/api/reportes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id_recurso: idRecurso,
        motivo: motivo
      })
    });

    console.log("Respuesta del servidor - Status:", response.status);

    // Si la respuesta no es OK
    if (!response.ok) {
      let errorMessage = "Error al crear el reporte";
      
      try {
        // Intentar leer el cuerpo de la respuesta como JSON
        const errorData = await response.json();
        errorMessage = errorData.mensaje || errorData.message || errorMessage;
      } catch (jsonError) {
        // Si no es JSON, leer como texto
        try {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        } catch (textError) {
          console.error("Error leyendo respuesta:", textError);
        }
      }
      
      return { error: true, mensaje: errorMessage };
    }

    // Si la respuesta es OK, intentar parsear como JSON
    try {
      const data = await response.json();
      console.log("Reporte creado exitosamente:", data);
      return { 
        error: false, 
        data, 
        mensaje: data.mensaje || "Reporte creado exitosamente" 
      };
    } catch (jsonError) {
      console.error("Error parseando respuesta JSON:", jsonError);
      return { 
        error: true, 
        mensaje: "Error procesando la respuesta del servidor" 
      };
    }

  } catch (err) {
    console.error("Error en postReporte:", err);
    return { 
      error: true, 
      mensaje: `Error de conexión: ${err.message}` 
    };
  }
};

export const useReportes = (idRecurso = null) => {
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [operacion, setOperacion] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [tipoMensaje, setTipoMensaje] = useState(null);

  // Función para mostrar mensajes
  const mostrarMensaje = useCallback((texto, tipo = 'exito') => {
    setMensaje(texto);
    setTipoMensaje(tipo);
  }, []);

  // Cargar reportes
  const cargarReportes = useCallback(async (idRecursoFiltro = null) => {
    setCargando(true);
    setError(null);
    setMensaje(null);
    
    try {
      let resultado;
      if (idRecursoFiltro) {
        resultado = await getReportesPorRecurso(idRecursoFiltro);
      } else {
        resultado = await getReportes();
      }
      
      if (resultado.error) {
        setError(resultado.mensaje || "Error al cargar reportes");
        mostrarMensaje(resultado.mensaje || "Error al cargar reportes", 'error');
        setReportes([]);
      } else {
        // Asegurarse de que resultado sea un array
        setReportes(Array.isArray(resultado) ? resultado : []);
      }
    } catch (err) {
      setError("Error al cargar reportes");
      mostrarMensaje("Error al cargar reportes", 'error');
      console.error("Error en cargarReportes:", err);
      setReportes([]);
    } finally {
      setCargando(false);
    }
  }, [mostrarMensaje]);

  // Recargar reportes (alias para consistencia)
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

  // Verificar si el usuario ya reportó este recurso
  const usuarioReportoRecurso = useCallback(async (idRecurso) => {
    if (!idRecurso) return false;
    
    setCargando(true);
    setOperacion({ cargando: true, idRecurso, accion: 'verificar' });
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Debes iniciar sesión para verificar reportes");
        return false;
      }
      
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
      const usuarioYaReporto = Array.isArray(resultado) && 
        resultado.some(reporte => reporte.id_usuario === idUsuario);
      
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
    if (!idRecurso || !motivo || !motivo.trim()) {
      setError("ID del recurso y motivo son requeridos");
      return { error: true, exito: false };
    }
    
    console.log("Iniciando reporte para recurso:", idRecurso, "motivo:", motivo);
    
    setCargando(true);
    setError(null);
    setExito(null);
    setOperacion({ cargando: true, idRecurso, accion: 'reportar' });
    
    try {
      const resultado = await postReporte(idRecurso, motivo.trim());
      
      console.log("Resultado de postReporte:", resultado);
      
      if (resultado.error) {
        setError(resultado.mensaje || "Error al reportar el recurso");
        mostrarMensaje(resultado.mensaje || "Error al reportar el recurso", 'error');
        return { error: true, exito: false, mensaje: resultado.mensaje };
      } else {
        setExito(resultado.mensaje || "Recurso reportado exitosamente");
        mostrarMensaje(resultado.mensaje || "Recurso reportado exitosamente", 'exito');
        
        // Recargar los reportes de este recurso
        await cargarReportes(idRecurso);
        return { error: false, exito: true, mensaje: resultado.mensaje };
      }
    } catch (err) {
      console.error("Error en reportarRecurso:", err);
      setError("Error al reportar el recurso");
      mostrarMensaje("Error al reportar el recurso", 'error');
      return { error: true, exito: false, mensaje: err.message };
    } finally {
      setCargando(false);
      setOperacion(null);
    }
  }, [cargarReportes, mostrarMensaje]);

  // Eliminar reporte
  const eliminarReporte = useCallback(async (idReporte) => {
    setCargando(true);
    setError(null);
    setExito(null);
    
    try {
      const resultado = await deleteReporte(idReporte);
      
      if (resultado.error) {
        setError(resultado.mensaje || "Error al eliminar el reporte");
        mostrarMensaje(resultado.mensaje || "Error al eliminar el reporte", 'error');
        return { error: true };
      } else {
        setExito("Reporte eliminado exitosamente");
        mostrarMensaje("Reporte eliminado exitosamente", 'exito');
        
        // Recargar la lista de reportes
        await cargarReportes(idRecurso);
        return { error: false };
      }
    } catch (err) {
      console.error("Error en eliminarReporte:", err);
      setError("Error al eliminar el reporte");
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

  // Limpiar mensajes generales
  const limpiarMensajes = useCallback(() => {
    setError(null);
    setExito(null);
    setMensaje(null);
    setTipoMensaje(null);
  }, []);

  // Limpiar mensajes de reporte (alias para consistencia)
  const limpiarMensajesReporte = useCallback(() => {
    setError(null);
    setExito(null);
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
    
    // Estados principales
    cargando,
    error,
    exito,
    operacion,
    
    // Estados para compatibilidad con versiones anteriores
    mensaje: mensaje ? { texto: mensaje, tipo: tipoMensaje } : null,
    
    // Acciones principales
    cargarReportes,
    recargarReportes,
    eliminarReporte,
    cargarReporteCompleto,
    cargarUsuario,
    
    // Acciones específicas para reportar
    usuarioReportoRecurso,
    reportarRecurso,
    
    // Funciones de limpieza
    limpiarMensajes,
    limpiarMensajesReporte
  };
};