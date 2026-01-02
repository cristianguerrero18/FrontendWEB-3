import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext.jsx";
import {
  getRecursosPorUsuario,
  getAsignaturas,
  getCategorias,
  getUsuarios,
  postRecurso,
  putRecurso,
  deleteRecurso,
  cambiarEstadoRecurso
} from "../api/Admin/Recursos.js";

export const useRecursosUsuario = () => {
  const { userData } = useUser();
  const [recursos, setRecursos] = useState([]);
  const [recursosOriginales, setRecursosOriginales] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [filtros, setFiltros] = useState({
    asignatura: "",
    categoria: "",
    busqueda: ""
  });

  const idUsuario = userData?.id_usuario || 0;

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

  const cargarRecursosUsuario = async () => {
    if (!idUsuario) return;
    
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await getRecursosPorUsuario(idUsuario);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al cargar tus recursos");
        setRecursos([]);
        setRecursosOriginales([]);
      } else {
        setRecursos(resultado);
        setRecursosOriginales(resultado);
      }
    } catch (error) {
      setMensaje("Error al cargar tus recursos");
      console.error(error);
      setRecursos([]);
      setRecursosOriginales([]);
    } finally {
      setCargando(false);
    }
  };

  const aplicarFiltros = () => {
    let recursosFiltrados = [...recursosOriginales];

    // Filtro por asignatura
    if (filtros.asignatura) {
      recursosFiltrados = recursosFiltrados.filter(
        recurso => recurso.id_asignatura === parseInt(filtros.asignatura)
      );
    }

    // Filtro por categoría
    if (filtros.categoria) {
      recursosFiltrados = recursosFiltrados.filter(
        recurso => recurso.id_categoria === parseInt(filtros.categoria)
      );
    }

    // Filtro por búsqueda
    if (filtros.busqueda) {
      const busquedaLower = filtros.busqueda.toLowerCase();
      recursosFiltrados = recursosFiltrados.filter(recurso =>
        recurso.titulo.toLowerCase().includes(busquedaLower) ||
        recurso.tema.toLowerCase().includes(busquedaLower) ||
        (recurso.URL && recurso.URL.toLowerCase().includes(busquedaLower))
      );
    }

    setRecursos(recursosFiltrados);
  };

  const crearRecurso = async (nuevoRecurso, archivoAdjunto = null) => {
    if (!idUsuario) {
      setMensaje("No se pudo identificar tu usuario");
      return { error: true, datos: { mensaje: "Usuario no identificado" } };
    }

    setCargando(true);
    setMensaje("");
    try {
      const recursoConUsuario = {
        ...nuevoRecurso,
        id_usuario: idUsuario
      };

      const resultado = await postRecurso(recursoConUsuario, archivoAdjunto);
      if (resultado.mensaje?.includes("Error")) {
        setMensaje(resultado.mensaje || "Error al crear el recurso");
        return { error: true, datos: resultado };
      } else {
        setMensaje("Recurso creado exitosamente");
        await cargarRecursosUsuario();
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
        await cargarRecursosUsuario();
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
        await cargarRecursosUsuario();
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
        await cargarRecursosUsuario();
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

  const limpiarFiltros = () => {
    setFiltros({
      asignatura: "",
      categoria: "",
      busqueda: ""
    });
    setRecursos(recursosOriginales);
  };

  useEffect(() => {
    cargarDatosRelacionados();
    cargarRecursosUsuario();
  }, [idUsuario]);

  useEffect(() => {
    aplicarFiltros();
  }, [filtros, recursosOriginales]);

  return {
    recursos,
    recursosOriginales,
    asignaturas,
    categorias,
    usuarios,
    cargando,
    mensaje,
    archivo,
    filtros,
    idUsuario,
    userData,
    recargarRecursos: cargarRecursosUsuario,
    crearRecurso,
    actualizarRecurso,
    eliminarRecurso,
    toggleEstadoRecurso,
    manejarArchivo,
    limpiarArchivo,
    limpiarMensaje,
    setFiltros,
    limpiarFiltros
  };
};