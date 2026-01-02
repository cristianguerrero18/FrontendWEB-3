import { useState, useEffect } from "react";
import { 
  getCarreras, 
  postCarreras, 
  putCarrera, 
  deleteCarrera 
} from "../api/Admin/Carreras.js";
import { getTipoCarreras } from "../api/Admin/TipoCarrera.js";

export const useCarreras = () => {
  const [carreras, setCarreras] = useState([]);
  const [tiposCarrera, setTiposCarrera] = useState([]); // ✅ Nuevo estado para tipos
  const [cargando, setCargando] = useState(false);
  const [cargandoTipos, setCargandoTipos] = useState(false); // ✅ Estado para carga de tipos
  const [mensaje, setMensaje] = useState("");

  // Cargar tipos de carrera desde el backend
  const cargarTiposCarrera = async () => {
    setCargandoTipos(true);
    try {
      const resultado = await getTipoCarreras();
      if (Array.isArray(resultado)) {
        setTiposCarrera(resultado);
      } else {
        console.error("Error: tipos de carrera no es un array", resultado);
        setTiposCarrera([]);
      }
    } catch (error) {
      console.error("Error al cargar tipos de carrera:", error);
      setTiposCarrera([]);
    } finally {
      setCargandoTipos(false);
    }
  };

  const cargarCarreras = async () => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await getCarreras();
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al cargar las carreras");
        setCarreras([]);
      } else {
        setCarreras(resultado);
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al cargar las carreras");
    } finally {
      setCargando(false);
    }
  };

  // Crear nueva(s) carrera(s)
  const crearCarreras = async (nuevasCarreras) => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await postCarreras(nuevasCarreras);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al crear las carreras");
        return { error: true, datos: resultado };
      } else {
        setMensaje("Carrera(s) creada(s) exitosamente");
        await cargarCarreras(); // Recargar la lista
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al crear las carreras");
      return { error: true, datos: { mensaje: "Error al crear las carreras" } };
    } finally {
      setCargando(false);
    }
  };

  // Actualizar carrera existente
  const actualizarCarrera = async (carreraActualizada) => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await putCarrera(carreraActualizada);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al actualizar la carrera");
        return { error: true, datos: resultado };
      } else {
        setMensaje("Carrera actualizada exitosamente");
        await cargarCarreras(); // Recargar la lista
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al actualizar la carrera");
      return { error: true, datos: { mensaje: "Error al actualizar la carrera" } };
    } finally {
      setCargando(false);
    }
  };

  // Eliminar carrera
  const eliminarCarrera = async (idCarrera) => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await deleteCarrera(idCarrera);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al eliminar la carrera");
        return { error: true, datos: resultado };
      } else {
        setMensaje("Carrera eliminada exitosamente");
        await cargarCarreras(); // Recargar la lista
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al eliminar la carrera");
      return { error: true, datos: { mensaje: "Error al eliminar la carrera" } };
    } finally {
      setCargando(false);
    }
  };

  // Función para obtener nombre de tipo de carrera por ID
  const getNombreTipoCarrera = (idTipo) => {
    if (!idTipo) return "Sin tipo";
    const tipo = tiposCarrera.find(t => t.id_tipo_carrera === idTipo);
    return tipo ? tipo.nombre_tipo_carrera : `Tipo ${idTipo}`;
  };

  // Limpiar mensajes
  const limpiarMensaje = () => {
    setMensaje("");
  };

  useEffect(() => {
    cargarTiposCarrera(); // ✅ Cargar tipos primero
    cargarCarreras();
  }, []);

  return {
    carreras,
    tiposCarrera,      // ✅ Exportar array de tipos
    cargando,
    cargandoTipos,     // ✅ Exportar estado de carga de tipos
    mensaje,
    recargarCarreras: cargarCarreras,
    crearCarreras,
    actualizarCarrera,
    eliminarCarrera,
    getNombreTipoCarrera, // ✅ Exportar función para obtener nombre
    limpiarMensaje
  };
};