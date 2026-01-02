import { useState, useEffect, useCallback } from "react";
import { 
  getPQRS, 
  getPQRSPorId,
  deletePQRS,
  responderPQRS
} from "../api/Admin/PQRS.js";

export const usePQRS = (idPQR = null) => {
  const [pqrsLista, setPqrsLista] = useState([]);
  const [pqrsIndividual, setPqrsIndividual] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [cargandoIndividual, setCargandoIndividual] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Cargar todos los PQRS
  const cargarPQRS = useCallback(async () => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await getPQRS();
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al cargar PQRS");
        setPqrsLista([]);
      } else {
        setPqrsLista(resultado);
      }
      return resultado;
    } catch (error) {
      setMensaje("Error al cargar PQRS");
      console.error(error);
      return [];
    } finally {
      setCargando(false);
    }
  }, []);

  // Cargar un PQR por ID - MODIFICADO para devolver datos
  const cargarPQRSporId = useCallback(async (id) => {
    if (!id) return null;
    
    setCargandoIndividual(true);
    setMensaje("");
    
    try {
      const resultado = await getPQRSPorId(id);
      console.log("Datos recibidos de API (PQR individual):", resultado);
      
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al cargar el PQR");
        setPqrsIndividual(null);
        return null;
      } else {
        setPqrsIndividual(resultado);
        return resultado;
      }
    } catch (error) {
      const mensajeError = "Error al cargar el PQR";
      setMensaje(mensajeError);
      console.error(error);
      return { error: true, mensaje: mensajeError };
    } finally {
      setCargandoIndividual(false);
    }
  }, []);

  // Eliminar PQR
  const eliminarPQRS = useCallback(async (idPQR) => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await deletePQRS(idPQR);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al eliminar el PQR");
        return { error: true, datos: resultado };
      } else {
        setMensaje("PQR eliminado exitosamente");
        await cargarPQRS(); // Recargar la lista
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al eliminar el PQR");
      return { error: true, datos: { mensaje: "Error al eliminar el PQR" } };
    } finally {
      setCargando(false);
    }
  }, [cargarPQRS]);

  // Responder PQR
  const responderPQR = useCallback(async ({ id_pqr, respuesta, id_admin }) => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await responderPQRS({ id_pqr, respuesta, id_admin });
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al responder el PQR");
        return { error: true, datos: resultado };
      } else {
        setMensaje("Respuesta enviada exitosamente");
        // Recargar la lista y el PQR individual
        await cargarPQRS();
        if (pqrsIndividual?.id_pqr === id_pqr) {
          await cargarPQRSporId(id_pqr);
        }
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al responder el PQR");
      return { error: true, datos: { mensaje: "Error al responder el PQR" } };
    } finally {
      setCargando(false);
    }
  }, [cargarPQRS, cargarPQRSporId, pqrsIndividual]);

  // Limpiar mensajes
  const limpiarMensaje = useCallback(() => {
    setMensaje("");
  }, []);

  // Cargar PQRS inicialmente
  useEffect(() => {
    if (idPQR) {
      cargarPQRSporId(idPQR);
    } else {
      cargarPQRS();
    }
  }, [cargarPQRS, cargarPQRSporId, idPQR]);

  return { 
    pqrs: pqrsLista, 
    pqr: pqrsIndividual,
    cargando, 
    cargandoIndividual,
    mensaje, 
    recargarPQRS: cargarPQRS, 
    recargarPQRSporId: cargarPQRSporId,
    eliminarPQRS,
    responderPQR,
    limpiarMensaje
  };
};