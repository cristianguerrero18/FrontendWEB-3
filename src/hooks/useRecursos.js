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
  cambiarEstadoRecurso
} from "../api/Admin/Recursos.js";

export const useRecursos = (idRecurso = null) => {
  const [recursos, setRecursos] = useState([]);
  const [recurso, setRecurso] = useState(null);
  const [asignaturas, setAsignaturas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(false);
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

  useEffect(() => {
    cargarDatosRelacionados();
    if (idRecurso) {
      cargarRecurso(idRecurso);
    } else {
      cargarRecursos();
    }
  }, [idRecurso]);

  return {
    recursos,
    recurso,
    asignaturas,
    categorias,
    usuarios,
    cargando,
    mensaje,
    archivo,
    recargarRecursos: cargarRecursos,
    recargarRecurso: cargarRecurso,
    crearRecurso,
    actualizarRecurso,
    eliminarRecurso,
    toggleEstadoRecurso,
    manejarArchivo,
    limpiarArchivo,
    limpiarMensaje
  };
};
