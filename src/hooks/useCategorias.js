import { useState, useEffect } from "react";
import { 
  getCategorias, 
  getCategoriaPorId, 
  postCategoria, 
  putCategoria, 
  deleteCategoria 
} from "../api/Admin/Categorias.js";

export const useCategorias = (idCategoria = null) => {
  const [categorias, setCategorias] = useState([]);
  const [categoria, setCategoria] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Cargar todas las categorías
  const cargarCategorias = async () => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await getCategorias();
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al cargar categorías");
        setCategorias([]);
      } else {
        setCategorias(resultado);
      }
    } catch (error) {
      setMensaje("Error al cargar categorías");
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  // Cargar una categoría por ID
  const cargarCategoria = async (id) => {
    if (!id) return;
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await getCategoriaPorId(id);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al cargar la categoría");
        setCategoria(null);
      } else {
        setCategoria(resultado);
      }
    } catch (error) {
      setMensaje("Error al cargar la categoría");
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  // Crear nueva categoría
  const crearCategoria = async (nuevaCategoria) => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await postCategoria(nuevaCategoria);
      if (resultado.mensaje?.includes("Error")) {
        setMensaje(resultado.mensaje || "Error al crear la categoría");
        return { error: true, datos: resultado };
      } else {
        setMensaje("Categoría creada exitosamente");
        await cargarCategorias(); // Recargar la lista
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al crear la categoría");
      return { error: true, datos: { mensaje: "Error al crear la categoría" } };
    } finally {
      setCargando(false);
    }
  };

  // Actualizar categoría existente
  const actualizarCategoria = async (categoriaActualizada) => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await putCategoria(categoriaActualizada);
      if (resultado.mensaje?.includes("Error")) {
        setMensaje(resultado.mensaje || "Error al actualizar la categoría");
        return { error: true, datos: resultado };
      } else {
        setMensaje("Categoría actualizada exitosamente");
        await cargarCategorias(); // Recargar la lista
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al actualizar la categoría");
      return { error: true, datos: { mensaje: "Error al actualizar la categoría" } };
    } finally {
      setCargando(false);
    }
  };

  // Eliminar categoría
  const eliminarCategoria = async (idCategoria) => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await deleteCategoria(idCategoria);
      if (resultado.mensaje?.includes("Error")) {
        setMensaje(resultado.mensaje || "Error al eliminar la categoría");
        return { error: true, datos: resultado };
      } else {
        setMensaje("Categoría eliminada exitosamente");
        await cargarCategorias(); // Recargar la lista
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al eliminar la categoría");
      return { error: true, datos: { mensaje: "Error al eliminar la categoría" } };
    } finally {
      setCargando(false);
    }
  };

  // Limpiar mensajes
  const limpiarMensaje = () => {
    setMensaje("");
  };

  useEffect(() => {
    if (idCategoria) {
      cargarCategoria(idCategoria);
    } else {
      cargarCategorias();
    }
  }, [idCategoria]);

  return { 
    categorias, 
    categoria, 
    cargando, 
    mensaje, 
    recargarCategorias: cargarCategorias, 
    recargarCategoria: cargarCategoria,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
    limpiarMensaje
  };
};