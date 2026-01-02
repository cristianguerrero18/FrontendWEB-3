import { useState, useEffect } from "react";
import { 
  getTipoCarreras, 
  postTipoCarrera, 
  putTipoCarrera, 
  deleteTipoCarrera 
} from "../api/Admin/TipoCarrera.js";

export const useTipoCarreras = () => {
  const [tiposCarrera, setTiposCarrera] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Cargar todos los tipos de carrera
  const cargarTiposCarrera = async () => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await getTipoCarreras();
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al cargar tipos de carrera");
        setTiposCarrera([]);
      } else {
        setTiposCarrera(resultado);
      }
    } catch (error) {
      setMensaje("Error al cargar tipos de carrera");
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  // Crear nuevo tipo de carrera
  const crearTipoCarrera = async (nuevoTipo) => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await postTipoCarrera(nuevoTipo);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al crear el tipo de carrera");
        return { error: true, datos: resultado };
      } else {
        setMensaje("Tipo de carrera creado exitosamente");
        await cargarTiposCarrera(); // Recargar la lista
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al crear el tipo de carrera");
      return { error: true, datos: { mensaje: "Error al crear el tipo de carrera" } };
    } finally {
      setCargando(false);
    }
  };

  // Actualizar tipo de carrera existente
  const actualizarTipoCarrera = async (tipoActualizado) => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await putTipoCarrera(tipoActualizado);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al actualizar el tipo de carrera");
        return { error: true, datos: resultado };
      } else {
        setMensaje("Tipo de carrera actualizado exitosamente");
        await cargarTiposCarrera(); // Recargar la lista
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al actualizar el tipo de carrera");
      return { error: true, datos: { mensaje: "Error al actualizar el tipo de carrera" } };
    } finally {
      setCargando(false);
    }
  };

  // Eliminar tipo de carrera
  const eliminarTipoCarrera = async (idTipoCarrera) => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await deleteTipoCarrera(idTipoCarrera);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al eliminar el tipo de carrera");
        return { error: true, datos: resultado };
      } else {
        setMensaje("Tipo de carrera eliminado exitosamente");
        await cargarTiposCarrera(); // Recargar la lista
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al eliminar el tipo de carrera");
      return { error: true, datos: { mensaje: "Error al eliminar el tipo de carrera" } };
    } finally {
      setCargando(false);
    }
  };

  // Limpiar mensajes
  const limpiarMensaje = () => {
    setMensaje("");
  };

  useEffect(() => {
    cargarTiposCarrera();
  }, []);

  return { 
    tiposCarrera, 
    cargando, 
    mensaje, 
    recargarTiposCarrera: cargarTiposCarrera,
    crearTipoCarrera,
    actualizarTipoCarrera,
    eliminarTipoCarrera,
    limpiarMensaje
  };
};