import { useState, useEffect } from "react";
import { 
  getRoles, 
  getRolPorId, 
  postRol, 
  putRol, 
  deleteRol 
} from "../api/Admin/Roles.js";

export const useRoles = (idRol = null) => {
  const [roles, setRoles] = useState([]); // todos los roles
  const [rol, setRol] = useState(null);   // rol individual
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Cargar todos los roles
  const cargarRoles = async () => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await getRoles();
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al cargar roles");
        setRoles([]);
      } else {
        setRoles(resultado);
      }
    } catch (error) {
      setMensaje("Error al cargar roles");
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  // Cargar un rol por ID
  const cargarRol = async (id) => {
    if (!id) return;
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await getRolPorId(id);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al cargar el rol");
        setRol(null);
      } else {
        setRol(resultado);
      }
    } catch (error) {
      setMensaje("Error al cargar el rol");
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  // Crear nuevo rol
  const crearRol = async (nuevoRol) => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await postRol(nuevoRol);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al crear el rol");
        return { error: true, datos: resultado };
      } else {
        setMensaje("Rol creado exitosamente");
        await cargarRoles(); // Recargar la lista
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al crear el rol");
      return { error: true, datos: { mensaje: "Error al crear el rol" } };
    } finally {
      setCargando(false);
    }
  };

  // Actualizar rol existente
  const actualizarRol = async (rolActualizado) => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await putRol(rolActualizado);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al actualizar el rol");
        return { error: true, datos: resultado };
      } else {
        setMensaje("Rol actualizado exitosamente");
        await cargarRoles(); // Recargar la lista
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al actualizar el rol");
      return { error: true, datos: { mensaje: "Error al actualizar el rol" } };
    } finally {
      setCargando(false);
    }
  };

  // Eliminar rol
  const eliminarRol = async (idRol) => {
    setCargando(true);
    setMensaje("");
    try {
      const resultado = await deleteRol(idRol);
      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al eliminar el rol");
        return { error: true, datos: resultado };
      } else {
        setMensaje("Rol eliminado exitosamente");
        await cargarRoles(); // Recargar la lista
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al eliminar el rol");
      return { error: true, datos: { mensaje: "Error al eliminar el rol" } };
    } finally {
      setCargando(false);
    }
  };

  // Limpiar mensajes
  const limpiarMensaje = () => {
    setMensaje("");
  };

  useEffect(() => {
    if (idRol) {
      cargarRol(idRol);
    } else {
      cargarRoles();
    }
  }, [idRol]);

  return { 
    roles, 
    rol, 
    cargando, 
    mensaje, 
    recargarRoles: cargarRoles, 
    recargarRol: cargarRol,
    crearRol,
    actualizarRol,
    eliminarRol,
    limpiarMensaje
  };
};