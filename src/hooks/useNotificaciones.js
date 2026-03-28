import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getNotificacionesPorUsuario,
  deleteNotificacion,
  updateNotificacionVisto,
  marcarTodasComoVistas,
  getCantidadNoLeidas,
} from "../api/Admin/Notificaciones.js";
import { useUser } from "../context/UserContext.jsx";

export const useNotificaciones = (idUsuarioParam = null) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [noLeidas, setNoLeidas] = useState(0);

  const { getUserId, userData, isAuthenticated } = useUser();

  const idUsuario = useMemo(() => {
    if (idUsuarioParam) return Number(idUsuarioParam);
    if (userData?.id_usuario) return Number(userData.id_usuario);
    if (getUserId) return Number(getUserId());
    return null;
  }, [idUsuarioParam, userData, getUserId]);

  const limpiarMensaje = useCallback(() => {
    setMensaje("");
  }, []);

  const cargarNoLeidas = useCallback(async () => {
    if (!idUsuario || !isAuthenticated) {
      setNoLeidas(0);
      return 0;
    }

    const resultado = await getCantidadNoLeidas(idUsuario);

    if (!resultado.error) {
      setNoLeidas(Number(resultado.data || 0));
      return Number(resultado.data || 0);
    }

    return 0;
  }, [idUsuario, isAuthenticated]);

  const cargarNotificacionesPorUsuario = useCallback(async () => {
    if (!idUsuario || !isAuthenticated) {
      setNotificaciones([]);
      setNoLeidas(0);
      return [];
    }

    setCargando(true);
    setMensaje("");

    try {
      const resultado = await getNotificacionesPorUsuario(idUsuario);

      if (resultado.error) {
        setNotificaciones([]);
        setMensaje(resultado.mensaje || "Error al cargar notificaciones");
        return [];
      }

      const lista = Array.isArray(resultado.data) ? resultado.data : [];
      setNotificaciones(lista);

      const cantidadNoLeidas = lista.filter(
        (n) => (n?.estado || "").toLowerCase() !== "visto"
      ).length;
      setNoLeidas(cantidadNoLeidas);

      return lista;
    } catch (error) {
      console.error("Error en cargarNotificacionesPorUsuario:", error);
      setNotificaciones([]);
      setMensaje("Error al cargar notificaciones");
      return [];
    } finally {
      setCargando(false);
    }
  }, [idUsuario, isAuthenticated]);

  const marcarComoVista = useCallback(async (idNotificacion) => {
    const resultado = await updateNotificacionVisto(idNotificacion);

    if (resultado.error) {
      setMensaje(resultado.mensaje || "No se pudo marcar como vista");
      return { error: true, datos: resultado };
    }

    setNotificaciones((prev) =>
      prev.map((notif) =>
        notif.id_notificacion === idNotificacion
          ? { ...notif, estado: "visto" }
          : notif
      )
    );

    setNoLeidas((prev) => Math.max(0, prev - 1));

    return { error: false, datos: resultado };
  }, []);

  const marcarTodoComoVista = useCallback(async () => {
    if (!idUsuario) {
      return { error: true, datos: { mensaje: "Usuario no identificado" } };
    }

    setCargando(true);
    setMensaje("");

    try {
      const resultado = await marcarTodasComoVistas(idUsuario);

      if (resultado.error) {
        setMensaje(resultado.mensaje || "No se pudieron marcar todas como vistas");
        return { error: true, datos: resultado };
      }

      setNotificaciones((prev) =>
        prev.map((notif) => ({ ...notif, estado: "visto" }))
      );
      setNoLeidas(0);
      setMensaje("Todas las notificaciones fueron marcadas como vistas");

      return { error: false, datos: resultado };
    } catch (error) {
      console.error("Error en marcarTodoComoVista:", error);
      setMensaje("Error al marcar todas como vistas");
      return { error: true, datos: { mensaje: "Error al marcar todas como vistas" } };
    } finally {
      setCargando(false);
    }
  }, [idUsuario]);

  const eliminarNotificacion = useCallback(async (idNotificacion) => {
    setCargando(true);
    setMensaje("");

    try {
      const notificacionObjetivo = notificaciones.find(
        (n) => n.id_notificacion === idNotificacion
      );

      const resultado = await deleteNotificacion(idNotificacion);

      if (resultado.error) {
        setMensaje(resultado.mensaje || "Error al eliminar la notificación");
        return { error: true, datos: resultado };
      }

      setNotificaciones((prev) =>
        prev.filter((n) => n.id_notificacion !== idNotificacion)
      );

      if (
        notificacionObjetivo &&
        (notificacionObjetivo.estado || "").toLowerCase() !== "visto"
      ) {
        setNoLeidas((prev) => Math.max(0, prev - 1));
      }

      setMensaje("Notificación eliminada correctamente");
      return { error: false, datos: resultado };
    } catch (error) {
      console.error("Error en eliminarNotificacion:", error);
      setMensaje("Error al eliminar la notificación");
      return { error: true, datos: { mensaje: "Error al eliminar la notificación" } };
    } finally {
      setCargando(false);
    }
  }, [notificaciones]);

  const eliminarTodasNotificacionesUsuario = useCallback(async () => {
    if (!notificaciones.length) {
      setMensaje("No hay notificaciones para eliminar");
      return { error: false, datos: [] };
    }

    setCargando(true);
    setMensaje("");

    try {
      const resultados = await Promise.all(
        notificaciones.map((n) => deleteNotificacion(n.id_notificacion))
      );

      const huboError = resultados.some((r) => r.error);

      if (huboError) {
        setMensaje("Algunas notificaciones no pudieron eliminarse");
      } else {
        setMensaje("Todas las notificaciones fueron eliminadas");
      }

      setNotificaciones([]);
      setNoLeidas(0);

      return { error: huboError, datos: resultados };
    } catch (error) {
      console.error("Error en eliminarTodasNotificacionesUsuario:", error);
      setMensaje("Error al eliminar notificaciones");
      return { error: true, datos: { mensaje: "Error al eliminar notificaciones" } };
    } finally {
      setCargando(false);
    }
  }, [notificaciones]);

  useEffect(() => {
    if (isAuthenticated && idUsuario) {
      cargarNotificacionesPorUsuario();
    } else {
      setNotificaciones([]);
      setNoLeidas(0);
    }
  }, [isAuthenticated, idUsuario, cargarNotificacionesPorUsuario]);

  return {
    notificaciones,
    cargando,
    mensaje,
    noLeidas,
    idUsuario,
    recargarNotificaciones: cargarNotificacionesPorUsuario,
    eliminarNotificacion,
    eliminarTodasNotificacionesUsuario,
    marcarComoVista,
    marcarTodoComoVista,
    limpiarMensaje,
    cargarNoLeidas,
  };
};