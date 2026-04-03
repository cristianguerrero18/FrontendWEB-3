import { useState, useEffect, useCallback } from "react";
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
  getRecursoDetalle,
  getRecursoArchivoMeta,
  verRecursoArchivo,
  descargarRecursoArchivo,
  getRecursoVerUrl,
  getRecursoDescargarUrl
} from "../api/Admin/Recursos.js";

export const useRecursos = (idRecurso = null) => {
  const [recursos, setRecursos] = useState([]);
  const [recurso, setRecurso] = useState(null);
  const [recursoDetalle, setRecursoDetalle] = useState(null);
  const [recursoArchivoMeta, setRecursoArchivoMeta] = useState(null);

  const [asignaturas, setAsignaturas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [cargando, setCargando] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [cargandoArchivo, setCargandoArchivo] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [archivo, setArchivo] = useState(null);

  const enriquecerRecurso = useCallback((item) => {
    if (!item) return null;

    return {
      ...item,
      verUrl: getRecursoVerUrl(item.id_recurso),
      descargarUrl: getRecursoDescargarUrl(item.id_recurso),
    };
  }, []);

  const enriquecerListaRecursos = useCallback((lista = []) => {
    return Array.isArray(lista) ? lista.map(enriquecerRecurso) : [];
  }, [enriquecerRecurso]);

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

      if (!Array.isArray(resultado)) {
        setMensaje("Error al cargar recursos");
        setRecursos([]);
      } else {
        setRecursos(enriquecerListaRecursos(resultado));
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al cargar recursos");
      setRecursos([]);
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

      if (!resultado) {
        setMensaje("Error al cargar el recurso");
        setRecurso(null);
      } else {
        setRecurso(enriquecerRecurso(resultado));
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al cargar el recurso");
      setRecurso(null);
    } finally {
      setCargando(false);
    }
  };

  const cargarRecursoDetalle = async (id) => {
    if (!id) return { error: true, datos: null };

    setCargandoDetalle(true);
    setMensaje("");

    try {
      const resultado = await getRecursoDetalle(id);

      if (!resultado) {
        setMensaje("Error al cargar el detalle del recurso");
        setRecursoDetalle(null);
        return {
          error: true,
          datos: { mensaje: "Error al cargar el detalle del recurso" }
        };
      }

      const detalleEnriquecido = enriquecerRecurso(resultado);
      setRecursoDetalle(detalleEnriquecido);

      return { error: false, datos: detalleEnriquecido };
    } catch (error) {
      console.error(error);
      setMensaje("Error al cargar el detalle del recurso");
      setRecursoDetalle(null);

      return {
        error: true,
        datos: { mensaje: "Error al cargar el detalle del recurso" }
      };
    } finally {
      setCargandoDetalle(false);
    }
  };

  const cargarRecursoArchivoMeta = async (id) => {
    if (!id) return { error: true, datos: null };

    setCargandoArchivo(true);
    setMensaje("");

    try {
      const resultado = await getRecursoArchivoMeta(id);

      if (resultado?.error) {
        setMensaje(resultado.mensaje || "Error al cargar metadata del archivo");
        setRecursoArchivoMeta(null);
        return { error: true, datos: resultado };
      }

      setRecursoArchivoMeta(resultado);
      return { error: false, datos: resultado };
    } catch (error) {
      console.error(error);
      setMensaje("Error al cargar metadata del archivo");
      setRecursoArchivoMeta(null);

      return {
        error: true,
        datos: { mensaje: "Error al cargar metadata del archivo" }
      };
    } finally {
      setCargandoArchivo(false);
    }
  };

  const abrirRecurso = async (id_recurso) => {
    setMensaje("");

    const resultado = await verRecursoArchivo(id_recurso);

    if (resultado?.error) {
      setMensaje(resultado.mensaje || "Error al abrir el archivo");
      return { error: true, datos: resultado };
    }

    return { error: false, datos: resultado };
  };

  const descargarRecurso = async (id_recurso) => {
    setCargandoArchivo(true);
    setMensaje("");

    try {
      const resultado = await descargarRecursoArchivo(id_recurso);

      if (resultado?.error) {
        setMensaje(resultado.mensaje || "Error al descargar el archivo");
        return { error: true, datos: resultado };
      }

      setMensaje("Archivo descargado correctamente");
      return { error: false, datos: resultado };
    } catch (error) {
      console.error(error);
      setMensaje("Error al descargar el archivo");
      return {
        error: true,
        datos: { mensaje: "Error al descargar el archivo" }
      };
    } finally {
      setCargandoArchivo(false);
    }
  };

  const crearRecurso = async (nuevoRecurso, archivoAdjunto = null) => {
    setCargando(true);
    setMensaje("");

    try {
      const resultado = await postRecurso(nuevoRecurso, archivoAdjunto);

      if (resultado?.error) {
        setMensaje(resultado.mensaje || "Error al crear el recurso");
        return { error: true, datos: resultado };
      }

      setMensaje("Recurso creado exitosamente");
      await cargarRecursos();
      setArchivo(null);

      return { error: false, datos: resultado };
    } catch (error) {
      console.error(error);
      setMensaje("Error al crear el recurso");

      return {
        error: true,
        datos: { mensaje: "Error al crear el recurso" }
      };
    } finally {
      setCargando(false);
    }
  };

  const actualizarRecurso = async (recursoActualizado) => {
    setCargando(true);
    setMensaje("");

    try {
      const resultado = await putRecurso(recursoActualizado);

      if (resultado?.error) {
        setMensaje(resultado.mensaje || "Error al actualizar el recurso");
        return { error: true, datos: resultado };
      }

      setMensaje("Recurso actualizado exitosamente");
      await cargarRecursos();

      if (recursoDetalle?.id_recurso === recursoActualizado.id_recurso) {
        await cargarRecursoDetalle(recursoActualizado.id_recurso);
      }

      if (recurso?.id_recurso === recursoActualizado.id_recurso) {
        await cargarRecurso(recursoActualizado.id_recurso);
      }

      return { error: false, datos: resultado };
    } catch (error) {
      console.error(error);
      setMensaje("Error al actualizar el recurso");

      return {
        error: true,
        datos: { mensaje: "Error al actualizar el recurso" }
      };
    } finally {
      setCargando(false);
    }
  };

  const eliminarRecurso = async (idRecursoEliminar) => {
    setCargando(true);
    setMensaje("");

    try {
      const resultado = await deleteRecurso(idRecursoEliminar);

      if (resultado?.error) {
        setMensaje(resultado.mensaje || "Error al eliminar el recurso");
        return { error: true, datos: resultado };
      }

      setMensaje("Recurso eliminado exitosamente");
      await cargarRecursos();

      if (recursoDetalle?.id_recurso === idRecursoEliminar) {
        setRecursoDetalle(null);
      }

      if (recurso?.id_recurso === idRecursoEliminar) {
        setRecurso(null);
      }

      if (recursoArchivoMeta?.id_recurso === idRecursoEliminar) {
        setRecursoArchivoMeta(null);
      }

      return { error: false, datos: resultado };
    } catch (error) {
      console.error(error);
      setMensaje("Error al eliminar el recurso");

      return {
        error: true,
        datos: { mensaje: "Error al eliminar el recurso" }
      };
    } finally {
      setCargando(false);
    }
  };

  const toggleEstadoRecurso = async (idRecursoToggle, estadoActual) => {
    setCargando(true);
    setMensaje("");

    try {
      const nuevoEstado = Number(estadoActual) === 1 ? 0 : 1;
      const resultado = await cambiarEstadoRecurso(idRecursoToggle, nuevoEstado);

      if (resultado?.error) {
        setMensaje(resultado.mensaje || "Error al cambiar estado del recurso");
        return { error: true, datos: resultado };
      }

      setMensaje(`Recurso ${nuevoEstado === 1 ? "activado" : "desactivado"} exitosamente`);
      await cargarRecursos();

      if (recursoDetalle?.id_recurso === idRecursoToggle) {
        await cargarRecursoDetalle(idRecursoToggle);
      }

      if (recurso?.id_recurso === idRecursoToggle) {
        await cargarRecurso(idRecursoToggle);
      }

      return { error: false, datos: resultado };
    } catch (error) {
      console.error(error);
      setMensaje("Error al cambiar estado del recurso");

      return {
        error: true,
        datos: { mensaje: "Error al cambiar estado del recurso" }
      };
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

  const limpiarDetalle = () => {
    setRecursoDetalle(null);
  };

  const limpiarArchivoMeta = () => {
    setRecursoArchivoMeta(null);
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
    recursoDetalle,
    recursoArchivoMeta,
    asignaturas,
    categorias,
    usuarios,
    cargando,
    cargandoDetalle,
    cargandoArchivo,
    mensaje,
    archivo,

    // Cargas
    recargarRecursos: cargarRecursos,
    recargarRecurso: cargarRecurso,
    cargarRecursoDetalle,
    cargarRecursoArchivoMeta,

    // Archivo
    abrirRecurso,
    descargarRecurso,
    getRecursoVerUrl,
    getRecursoDescargarUrl,

    // CRUD
    crearRecurso,
    actualizarRecurso,
    eliminarRecurso,
    toggleEstadoRecurso,

    // Auxiliares
    manejarArchivo,
    limpiarArchivo,
    limpiarMensaje,
    limpiarDetalle,
    limpiarArchivoMeta,
  };
};