import { useState, useCallback, useRef, useMemo } from "react";
import {
  getNotificacionesPorUsuario,
  updateNotificacionVisto,
  marcarTodasComoVistas,
} from "../api/Admin/Notificaciones.js";
import { useUser } from "../context/UserContext.jsx";

export const useNotificacionesSuperior = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);

  const { getUserId, userData, isAuthenticated } = useUser();
  const notificacionesCargadasRef = useRef(false);

  const idUsuario = useMemo(() => {
    if (!isAuthenticated) return null;
    return userData?.id_usuario || getUserId?.() || null;
  }, [isAuthenticated, userData?.id_usuario, getUserId]);

  const normalizarEstado = useCallback((estado) => {
    const valor = String(estado || "").toLowerCase().trim();
    if (valor === "no visto" || valor === "no_visto" || valor === "pendiente") {
      return "no_visto";
    }
    return "visto";
  }, []);

  const normalizarTipo = useCallback((tipo) => {
    return String(tipo || "info").toLowerCase().trim();
  }, []);

  const cargarNotificaciones = useCallback(async () => {
    if (!isAuthenticated || !idUsuario) {
      setNotificaciones([]);
      return;
    }

    setCargando(true);

    try {
      const resultado = await getNotificacionesPorUsuario(idUsuario);

      if (resultado?.error) {
        setNotificaciones([]);
        return;
      }

      const lista = Array.isArray(resultado?.data) ? resultado.data : [];

      const formateadas = lista
        .map((notif) => ({
          id_notificacion: notif.id_notificacion || notif.id,
          mensaje: notif.mensaje || "Sin mensaje",
          estado: normalizarEstado(notif.estado),
          tipo: normalizarTipo(notif.tipo),
          fecha:
            notif.fecha ||
            notif.fecha_creacion ||
            notif.created_at ||
            new Date().toISOString(),
          id_usuario: notif.id_usuario || idUsuario,
        }))
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 8);

      setNotificaciones(formateadas);
      notificacionesCargadasRef.current = true;
    } catch (error) {
      console.error("Error al cargar notificaciones superiores:", error);
      setNotificaciones([]);
    } finally {
      setCargando(false);
    }
  }, [isAuthenticated, idUsuario, normalizarEstado, normalizarTipo]);

  const marcarComoVista = useCallback(async (idNotificacion) => {
    try {
      const resultado = await updateNotificacionVisto(idNotificacion);

      if (resultado?.error) return false;

      setNotificaciones((prev) =>
        prev.map((notif) =>
          notif.id_notificacion === idNotificacion
            ? { ...notif, estado: "visto" }
            : notif
        )
      );

      return true;
    } catch (error) {
      console.error("Error al marcar notificación como vista:", error);
      return false;
    }
  }, []);

  const marcarTodasComoLeidas = useCallback(async () => {
    if (!idUsuario) return false;

    const existenPendientes = notificaciones.some(
      (notif) => normalizarEstado(notif.estado) === "no_visto"
    );

    if (!existenPendientes) return true;

    setCargando(true);

    try {
      const resultado = await marcarTodasComoVistas(idUsuario);

      if (resultado?.error) return false;

      setNotificaciones((prev) =>
        prev.map((notif) => ({ ...notif, estado: "visto" }))
      );

      return true;
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error);
      return false;
    } finally {
      setCargando(false);
    }
  }, [idUsuario, notificaciones, normalizarEstado]);

  const contarNoLeidas = useCallback(() => {
    return notificaciones.filter(
      (notif) => normalizarEstado(notif.estado) === "no_visto"
    ).length;
  }, [notificaciones, normalizarEstado]);

  const toggleDropdown = useCallback(async () => {
    const nuevoEstado = !mostrarDropdown;
    setMostrarDropdown(nuevoEstado);

    if (nuevoEstado && !notificacionesCargadasRef.current) {
      await cargarNotificaciones();
    }
  }, [mostrarDropdown, cargarNotificaciones]);

  const cerrarDropdown = useCallback(() => {
    setMostrarDropdown(false);
  }, []);

  const marcarComoLeida = useCallback(
    async (idNotificacion) => {
      return await marcarComoVista(idNotificacion);
    },
    [marcarComoVista]
  );

  const recargarNotificaciones = useCallback(async () => {
    notificacionesCargadasRef.current = false;
    await cargarNotificaciones();
  }, [cargarNotificaciones]);

  return {
    notificaciones,
    cargando,
    mostrarDropdown,
    toggleDropdown,
    cerrarDropdown,
    marcarTodasComoLeidas,
    marcarComoLeida,
    contarNoLeidas,
    recargarNotificaciones,
  };
};