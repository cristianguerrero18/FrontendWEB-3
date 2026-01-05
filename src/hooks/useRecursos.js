import { useState, useEffect } from "react";
import {
  getRecursos,
  getRecursoPorId,
  postRecurso,
  putRecurso,
  deleteRecurso,
  getAsignaturas,
  getCategorias,
  getUsuarios,
  cambiarEstadoRecurso,
  getRecursoDetalle // Nueva función añadida
} from "../api/Admin/Recursos.js";

export const useRecursos = (idRecurso = null) => {
  const [recursos, setRecursos] = useState([]);
  const [recurso, setRecurso] = useState(null);
  const [recursoDetalle, setRecursoDetalle] = useState(null); // Nuevo estado para el detalle
  const [asignaturas, setAsignaturas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false); // Estado de carga para el detalle
  const [mensaje, setMensaje] = useState("");
  const [archivo, setArchivo] = useState(null);

  const cargarDatosRelacionados = async () => {
    try {
      const [asignaturasData, categoriasData, usuariosData] = await Promise.all([
        getAsignaturas(),
        getCategorias(),
        getUsuarios()
      ]);

      setAsignaturas(asignaturasData);
      setCategorias(categoriasData);
      setUsuarios(usuariosData);
    } catch (error) {
      console.error("Error cargando datos relacionados:", error);
    }
  };

  const cargarRecursos = async () => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await getRecursos();
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al cargar recursos");
        setRecursos([]);
      } else {
        setRecursos(resultado);
      }
    } catch (error) {
      setMensaje("Error al cargar recursos");
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const cargarRecurso = async (id) => {
    if (!id) return;
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await getRecursoPorId(id);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al cargar el recurso");
        setRecurso(null);
      } else {
        setRecurso(resultado);
      }
    } catch (error) {
      setMensaje("Error al cargar el recurso");
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  // Nueva función para cargar el detalle del recurso
  const cargarRecursoDetalle = async (id) => {
    if (!id) return;
    setCargandoDetalle(true);
    setMensaje("");
    try {
      const resultado = await getRecursoDetalle(id);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al cargar el detalle del recurso");
        setRecursoDetalle(null);
        return { error: true, datos: resultado };
      } else {
        setRecursoDetalle(resultado);
        return { error: false, datos: resultado };
      }
    } catch (error) {
      setMensaje("Error al cargar el detalle del recurso");
      console.error(error);
      return { error: true, datos: { mensaje: "Error al cargar el detalle del recurso" } };
    } finally {
      setCargandoDetalle(false);
    }
  };

  const crearRecurso = async (nuevoRecurso, archivoAdjunto = null) => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await postRecurso(nuevoRecurso, archivoAdjunto);
      if (resultado.mensaje?.includes("Error")) {
        setMensaje(resultado.mensaje || "Error al crear el recurso");
        return { error: true, datos: resultado };
      } else {
        setMensaje("Recurso creado exitosamente");
        await cargarRecursos();
        setArchivo(null);
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al crear el recurso");
      return { error: true, datos: { mensaje: "Error al crear el recurso" } };
    } finally {
      setCargando(false);
    }
  };

  const actualizarRecurso = async (recursoActualizado) => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await putRecurso(recursoActualizado);
      if (resultado.mensaje?.includes("Error")) {
        setMensaje(resultado.mensaje || "Error al actualizar el recurso");
        return { error: true, datos: resultado };
      } else {
        setMensaje("Recurso actualizado exitosamente");
        await cargarRecursos();
        // Si estamos viendo el detalle, recargarlo también
        if (recursoDetalle?.id_recurso === recursoActualizado.id_recurso) {
          await cargarRecursoDetalle(recursoActualizado.id_recurso);
        }
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al actualizar el recurso");
      return { error: true, datos: { mensaje: "Error al actualizar el recurso" } };
    } finally {
      setCargando(false);
    }
  };

  const eliminarRecurso = async (idRecurso) => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await deleteRecurso(idRecurso);
      if (resultado.mensaje?.includes("Error")) {
        setMensaje(resultado.mensaje || "Error al eliminar el recurso");
        return { error: true, datos: resultado };
      } else {
        setMensaje("Recurso eliminado exitosamente");
        await cargarRecursos();
        // Limpiar el detalle si estaba viendo el recurso eliminado
        if (recursoDetalle?.id_recurso === idRecurso) {
          setRecursoDetalle(null);
        }
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al eliminar el recurso");
      return { error: true, datos: { mensaje: "Error al eliminar el recurso" } };
    } finally {
      setCargando(false);
    }
  };

  const toggleEstadoRecurso = async (idRecurso, estadoActual) => {
    setCargando(true);
    setMensaje("");
    try {
      const nuevoEstado = estadoActual === 1 ? 0 : 1;
      const resultado = await cambiarEstadoRecurso(idRecurso, nuevoEstado);

      if (resultado.mensaje?.includes("Error")) {
        setMensaje(resultado.mensaje || "Error al cambiar estado del recurso");
        return { error: true, datos: resultado };
      } else {
        setMensaje(`Recurso ${nuevoEstado === 1 ? 'activado' : 'desactivado'} exitosamente`);
        await cargarRecursos();
        // Actualizar el detalle si está cargado
        if (recursoDetalle?.id_recurso === idRecurso) {
          await cargarRecursoDetalle(idRecurso);
        }
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al cambiar estado del recurso");
      return { error: true, datos: { mensaje: "Error al cambiar estado del recurso" } };
    } finally {
      setCargando(false);
    }
  };

  const manejarArchivo = (archivoSeleccionado) => {
    if (archivoSeleccionado) {
      setArchivo(archivoSeleccionado);
    }
  };

  const limpiarArchivo = () => {
    setArchivo(null);
  };

  const limpiarMensaje = () => {
    setMensaje("");
  };

  // Función para limpiar el detalle del recurso
  const limpiarDetalle = () => {
    setRecursoDetalle(null);
  };

  useEffect(() => {
    cargarDatosRelacionados();
    if (idRecurso) {
      cargarRecurso(idRecurso);
    } else {
      cargarRecursos();
    }
  }, [idRecurso]);

  return {
    // Estados
    recursos,
    recurso,
    recursoDetalle, // Nuevo estado exportado
    asignaturas,
    categorias,
    usuarios,
    cargando,
    cargandoDetalle, // Nuevo estado de carga
    mensaje,
    archivo,
    
    // Funciones de carga
    recargarRecursos: cargarRecursos,
    recargarRecurso: cargarRecurso,
    cargarRecursoDetalle, // Nueva función exportada
    
    // Funciones CRUD
    crearRecurso,
    actualizarRecurso,
    eliminarRecurso,
    toggleEstadoRecurso,
    
    // Funciones auxiliares
    manejarArchivo,
    limpiarArchivo,
    limpiarMensaje,
    limpiarDetalle // Nueva función exportada
  };
};