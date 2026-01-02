import { useState, useEffect } from "react";
import { 
  getAsignaturas, 
  getAsignaturaPorId, 
  postAsignaturas, 
  putAsignatura, 
  deleteAsignatura 
} from "../api/Admin/Asignaturas.js";

export const useAsignaturas = (idAsignatura = null) => {
  const [asignaturas, setAsignaturas] = useState([]); // todas las asignaturas
  const [asignatura, setAsignatura] = useState(null);   // asignatura individual
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Cargar todas las asignaturas
  const cargarAsignaturas = async () => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await getAsignaturas();
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al cargar asignaturas");
        setAsignaturas([]);
      } else {
        setAsignaturas(resultado);
      }
    } catch (error) {
      setMensaje("Error al cargar asignaturas");
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  // Cargar una asignatura por ID
  const cargarAsignatura = async (id) => {
    if (!id) return;
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await getAsignaturaPorId(id);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al cargar la asignatura");
        setAsignatura(null);
      } else {
        setAsignatura(resultado);
      }
    } catch (error) {
      setMensaje("Error al cargar la asignatura");
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  // Crear nueva(s) asignatura(s)
  const crearAsignaturas = async (nuevasAsignaturas) => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await postAsignaturas(nuevasAsignaturas);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al crear las asignaturas");
        return { error: true, datos: resultado };
      } else {
        setMensaje("Asignatura(s) creada(s) exitosamente");
        await cargarAsignaturas(); // Recargar la lista
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al crear las asignaturas");
      return { error: true, datos: { mensaje: "Error al crear las asignaturas" } };
    } finally {
      setCargando(false);
    }
  };

  // Actualizar asignatura existente
  const actualizarAsignatura = async (asignaturaActualizada) => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await putAsignatura(asignaturaActualizada);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al actualizar la asignatura");
        return { error: true, datos: resultado };
      } else {
        setMensaje("Asignatura actualizada exitosamente");
        await cargarAsignaturas(); // Recargar la lista
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al actualizar la asignatura");
      return { error: true, datos: { mensaje: "Error al actualizar la asignatura" } };
    } finally {
      setCargando(false);
    }
  };

  // Eliminar asignatura
  const eliminarAsignatura = async (idAsignatura) => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await deleteAsignatura(idAsignatura);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al eliminar la asignatura");
        return { error: true, datos: resultado };
      } else {
        setMensaje("Asignatura eliminada exitosamente");
        await cargarAsignaturas(); // Recargar la lista
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al eliminar la asignatura");
      return { error: true, datos: { mensaje: "Error al eliminar la asignatura" } };
    } finally {
      setCargando(false);
    }
  };

  // Limpiar mensajes
  const limpiarMensaje = () => {
    setMensaje("");
  };

  useEffect(() => {
    if (idAsignatura) {
      cargarAsignatura(idAsignatura);
    } else {
      cargarAsignaturas();
    }
  }, [idAsignatura]);

  return { 
    asignaturas, 
    asignatura, 
    cargando, 
    mensaje, 
    recargarAsignaturas: cargarAsignaturas, 
    recargarAsignatura: cargarAsignatura,
    crearAsignaturas,
    actualizarAsignatura,
    eliminarAsignatura,
    limpiarMensaje
  };
};