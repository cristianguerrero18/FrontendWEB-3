import { useState, useEffect } from "react";
import { 
  getPensum, 
  getPensumPorId, 
  postPensum, 
  putPensum, 
  deletePensum 
} from "../api/Admin/Pensum.js";

export const usePensum = (idPensum = null) => {
  const [pensum, setPensum] = useState([]); // todos los registros del pensum
  const [pensumItem, setPensumItem] = useState(null);   // registro individual
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Estados para listas de carreras y asignaturas
  const [carreras, setCarreras] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);

  // Cargar todas las carreras
  const cargarCarreras = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/carreras', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!data.error && Array.isArray(data)) {
        setCarreras(data);
      } else {
        setCarreras([]);
      }
    } catch (error) {
      console.error('Error al cargar carreras:', error);
      setCarreras([]);
    }
  };

  // Cargar todas las asignaturas
  const cargarAsignaturas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/asignaturas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!data.error && Array.isArray(data)) {
        setAsignaturas(data);
      } else {
        setAsignaturas([]);
      }
    } catch (error) {
      console.error('Error al cargar asignaturas:', error);
      setAsignaturas([]);
    }
  };

  // Función para obtener nombre de carrera por ID
  const getNombreCarrera = (idCarrera) => {
    if (!idCarrera) return "No asignada";
    const carrera = carreras.find(c => c.id_carrera === idCarrera);
    return carrera ? carrera.nombre_carrera : `Carrera ${idCarrera}`;
  };

  // Función para obtener nombre de asignatura por ID
  const getNombreAsignatura = (idAsignatura) => {
    if (!idAsignatura) return "No asignada";
    const asignatura = asignaturas.find(a => a.id_asignatura === idAsignatura);
    return asignatura ? asignatura.nombre_asignatura : `Asignatura ${idAsignatura}`;
  };

  // Función para obtener código de asignatura por ID
  const getCodigoAsignatura = (idAsignatura) => {
    if (!idAsignatura) return "";
    const asignatura = asignaturas.find(a => a.id_asignatura === idAsignatura);
    return asignatura ? asignatura.codigo_asignatura : "";
  };

  // Cargar todo el pensum
  const cargarPensum = async () => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await getPensum();
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al cargar pensum");
        setPensum([]);
      } else {
        setPensum(resultado);
      }
    } catch (error) {
      setMensaje("Error al cargar pensum");
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  // Cargar un registro del pensum por ID
  const cargarPensumItem = async (id) => {
    if (!id) return;
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await getPensumPorId(id);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al cargar el registro del pensum");
        setPensumItem(null);
      } else {
        setPensumItem(resultado);
      }
    } catch (error) {
      setMensaje("Error al cargar el registro del pensum");
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  // Crear nuevos registros del pensum (múltiples)
  const crearPensum = async (nuevoPensum) => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await postPensum(nuevoPensum);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al crear registros del pensum");
        return { error: true, datos: resultado };
      } else {
        setMensaje("Registros del pensum creados exitosamente");
        await cargarPensum(); // Recargar la lista
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al crear registros del pensum");
      return { error: true, datos: { mensaje: "Error al crear registros del pensum" } };
    } finally {
      setCargando(false);
    }
  };

  // Crear un solo registro del pensum
  const crearPensumItem = async (pensumItem) => {
    return await crearPensum([pensumItem]);
  };

  // Actualizar registro del pensum existente
  const actualizarPensum = async (pensumActualizado) => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await putPensum(pensumActualizado);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al actualizar el registro del pensum");
        return { error: true, datos: resultado };
      } else {
        setMensaje("Registro del pensum actualizado exitosamente");
        await cargarPensum(); // Recargar la lista
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al actualizar el registro del pensum");
      return { error: true, datos: { mensaje: "Error al actualizar el registro del pensum" } };
    } finally {
      setCargando(false);
    }
  };

  // Eliminar registro del pensum
  const eliminarPensum = async (idPensum) => {
    setCargando(true);
    setMensaje("");
    try {
      const token = localStorage.getItem('token');
      const resultado = await deletePensum(idPensum, token);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al eliminar el registro del pensum");
        return { error: true, datos: resultado };
      } else {
        setMensaje("Registro del pensum eliminado exitosamente");
        await cargarPensum(); // Recargar la lista
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al eliminar el registro del pensum");
      return { error: true, datos: { mensaje: "Error al eliminar el registro del pensum" } };
    } finally {
      setCargando(false);
    }
  };

  // Limpiar mensajes
  const limpiarMensaje = () => {
    setMensaje("");
  };

  useEffect(() => {
    // Cargar listas de carreras y asignaturas
    cargarCarreras();
    cargarAsignaturas();
    
    if (idPensum) {
      cargarPensumItem(idPensum);
    } else {
      cargarPensum();
    }
  }, [idPensum]);

  return { 
    pensum, 
    pensumItem, 
    cargando, 
    mensaje,
    carreras,
    asignaturas,
    getNombreCarrera,
    getNombreAsignatura,
    getCodigoAsignatura,
    recargarPensum: cargarPensum, 
    recargarPensumItem: cargarPensumItem,
    crearPensum,
    crearPensumItem,
    actualizarPensum,
    eliminarPensum,
    limpiarMensaje
  };
};