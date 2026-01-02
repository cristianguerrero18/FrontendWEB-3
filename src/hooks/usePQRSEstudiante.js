// src/hooks/usePQRSEstudiante.js
import { useState, useEffect, useCallback } from "react";
import { 
  getPQRSEstudiante, 
  crearPQRS,
  getTiposPQRS,
  getPQRSPorId
} from "../api/Admin/PQRS.js";

export const usePQRSEstudiante = (userId) => {
  const [pqrsLista, setPqrsLista] = useState([]);
  const [tiposPQRS, setTiposPQRS] = useState([]);
  const [pqrDetallado, setPqrDetallado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [cargandoCrear, setCargandoCrear] = useState(false);
  const [cargandoDetalles, setCargandoDetalles] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Cargar PQRS del estudiante
  const cargarPQRS = useCallback(async () => {
    if (!userId) return;
    
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await getPQRSEstudiante(userId);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al cargar tus PQRS");
        setPqrsLista([]);
      } else {
        setPqrsLista(resultado);
      }
      return resultado;
    } catch (error) {
      setMensaje("Error al cargar tus PQRS");
      console.error(error);
      return [];
    } finally {
      setCargando(false);
    }
  }, [userId]);

  // Cargar tipos de PQRS
  const cargarTiposPQRS = useCallback(async () => {
    setCargando(true);
    try {
      const resultado = await getTiposPQRS();
      if (!resultado.error) {
        setTiposPQRS(resultado);
      }
      return resultado;
    } catch (error) {
      console.error("Error cargando tipos de PQRS:", error);
      return [];
    } finally {
      setCargando(false);
    }
  }, []);

  // Crear nuevo PQR
  const crearNuevoPQRS = useCallback(async (pqrData) => {
    setCargandoCrear(true);
    setMensaje("");
    try {
      const resultado = await crearPQRS(pqrData);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al crear el PQR");
        return { error: true, datos: resultado };
      } else {
        setMensaje("PQR creado exitosamente");
        await cargarPQRS(); // Recargar la lista
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al crear el PQR");
      return { error: true, datos: { mensaje: "Error al crear el PQR" } };
    } finally {
      setCargandoCrear(false);
    }
  }, [cargarPQRS]);

  // Ver detalles de un PQR
  const verDetallesPQR = useCallback(async (idPQR) => {
    if (!idPQR) return null;
    
    setCargandoDetalles(true);
    setMensaje("");
    
    try {
      const resultado = await getPQRSPorId(idPQR);
      
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al cargar el PQR");
        setPqrDetallado(null);
        return null;
      } else {
        setPqrDetallado(resultado);
        return resultado;
      }
    } catch (error) {
      const mensajeError = "Error al cargar el PQR";
      setMensaje(mensajeError);
      console.error(error);
      return { error: true, mensaje: mensajeError };
    } finally {
      setCargandoDetalles(false);
    }
  }, []);

  // Limpiar mensajes
  const limpiarMensaje = useCallback(() => {
    setMensaje("");
  }, []);

  // Limpiar PQR detallado
  const limpiarDetalles = useCallback(() => {
    setPqrDetallado(null);
  }, []);

  // Cargar datos inicialmente
  useEffect(() => {
    if (userId) {
      cargarPQRS();
      cargarTiposPQRS();
    }
  }, [userId, cargarPQRS, cargarTiposPQRS]);

  return { 
    pqrs: pqrsLista, 
    tipos: tiposPQRS,
    pqrDetallado,
    cargando, 
    cargandoCrear,
    cargandoDetalles,
    mensaje, 
    recargarPQRS: cargarPQRS,
    crearNuevoPQRS,
    verDetallesPQR,
    limpiarDetalles,
    limpiarMensaje
  };
};