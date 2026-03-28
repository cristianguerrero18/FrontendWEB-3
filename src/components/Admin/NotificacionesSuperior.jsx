import React, { useRef, useEffect, useCallback } from "react";
import {
  Bell,
  Check,
  AlertCircle,
  Info,
  RefreshCw,
  AlertTriangle,
  Clock,
  Star,
  CheckCheck,
} from "lucide-react";
import { useNotificacionesSuperior } from "../../hooks/useNotificacionesSuperior.js";
import "../../css/NotificacionesSuperior.css";

const NotificacionesSuperior = ({ onVerTodas }) => {
  const {
    notificaciones,
    cargando,
    mostrarDropdown,
    toggleDropdown,
    cerrarDropdown,
    marcarTodasComoLeidas,
    marcarComoLeida,
    contarNoLeidas,
    recargarNotificaciones,
  } = useNotificacionesSuperior();

  const dropdownRef = useRef(null);
  const totalNoLeidas = contarNoLeidas();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        cerrarDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [cerrarDropdown]);

  const getIcono = useCallback((tipo) => {
    switch ((tipo || "").toLowerCase()) {
      case "alerta":
      case "warning":
        return <AlertCircle size={18} />;
      case "error":
      case "danger":
        return <AlertTriangle size={18} />;
      case "importante":
      case "important":
        return <Star size={18} />;
      case "success":
      case "exito":
        return <Check size={18} />;
      case "info":
      default:
        return <Info size={18} />;
    }
  }, []);

  const getClaseTipo = useCallback((tipo) => {
    switch ((tipo || "").toLowerCase()) {
      case "alerta":
      case "warning":
        return "tipo-alerta";
      case "error":
      case "danger":
        return "tipo-error";
      case "importante":
      case "important":
        return "tipo-importante";
      case "success":
      case "exito":
        return "tipo-exito";
      case "info":
      default:
        return "tipo-info";
    }
  }, []);

  const formatearFechaRelativa = useCallback((fechaString) => {
    if (!fechaString) return "Reciente";

    try {
      const fecha = new Date(fechaString);
      if (isNaN(fecha.getTime())) return "Fecha inválida";

      const ahora = new Date();
      const diffMs = ahora - fecha;
      const diffMin = Math.floor(diffMs / 60000);
      const diffHoras = Math.floor(diffMs / 3600000);
      const diffDias = Math.floor(diffMs / 86400000);

      if (diffMin < 1) return "Ahora mismo";
      if (diffMin < 60) return `Hace ${diffMin} min`;
      if (diffHoras < 24) return `Hace ${diffHoras} h`;
      if (diffDias < 7) return `Hace ${diffDias} d`;

      return fecha.toLocaleDateString("es-CO", {
        day: "numeric",
        month: "short",
        year: diffDias > 365 ? "numeric" : undefined,
      });
    } catch {
      return "Reciente";
    }
  }, []);

  const esNoLeida = useCallback((estado) => {
    const valor = String(estado || "").toLowerCase().trim();
    return valor === "no_visto" || valor === "no visto" || valor === "pendiente";
  }, []);

  const handleClickNotificacion = useCallback(
    async (notificacion) => {
      if (esNoLeida(notificacion.estado)) {
        await marcarComoLeida(notificacion.id_notificacion);
      }
    },
    [marcarComoLeida, esNoLeida]
  );

  const handleVerTodas = useCallback(() => {
    cerrarDropdown();
    if (onVerTodas) onVerTodas();
  }, [cerrarDropdown, onVerTodas]);

  return (
    <div className="contenedor-notificaciones-superior" ref={dropdownRef}>
      <button
        className={`boton-notificaciones-superior ${
          mostrarDropdown ? "activo" : ""
        }`}
        onClick={toggleDropdown}
        title="Notificaciones"
        aria-label={
          totalNoLeidas > 0
            ? `Notificaciones, ${totalNoLeidas} no leídas`
            : "Notificaciones"
        }
      >
        <Bell size={20} />
        {totalNoLeidas > 0 && (
          <span className="badge-notificaciones-superior">
            {totalNoLeidas > 99 ? "99+" : totalNoLeidas}
          </span>
        )}
      </button>

      {mostrarDropdown && (
        <div className="dropdown-notificaciones-superior">
          <div className="cabecera-dropdown-notificaciones">
            <div className="titulo-dropdown-notificaciones">
              <div>
                <h3>Notificaciones</h3>
                <p className="subtitulo-dropdown-notificaciones">
                  Tus novedades más recientes
                </p>
              </div>

              {totalNoLeidas > 0 ? (
                <span className="badge-no-leidas">
                  {totalNoLeidas} no leídas
                </span>
              ) : (
                <span className="badge-todas-leidas">
                  <CheckCheck size={12} />
                  Todo al día
                </span>
              )}
            </div>

            <div className="acciones-dropdown-notificaciones">
              <button
                className="boton-refrescar-notificaciones"
                onClick={recargarNotificaciones}
                disabled={cargando}
                title="Actualizar"
                aria-label="Actualizar notificaciones"
              >
                <RefreshCw size={14} className={cargando ? "girando" : ""} />
              </button>

              {notificaciones.length > 0 && totalNoLeidas > 0 && (
                <button
                  className="boton-marcar-todas"
                  onClick={marcarTodasComoLeidas}
                  disabled={cargando}
                  title="Marcar todas como leídas"
                  aria-label="Marcar todas como leídas"
                >
                  <Check size={14} />
                  <span>Marcar todas</span>
                </button>
              )}
            </div>
          </div>

          <div className="cuerpo-dropdown-notificaciones">
            {cargando ? (
              <div className="cargando-notificaciones">
                <div className="spinner-notificaciones"></div>
                <p>Cargando notificaciones...</p>
              </div>
            ) : notificaciones.length > 0 ? (
              <div className="lista-notificaciones-superior">
                {notificaciones.map((notificacion) => {
                  const noLeida = esNoLeida(notificacion.estado);

                  return (
                    <button
                      key={notificacion.id_notificacion}
                      type="button"
                      className={`item-notificacion-superior ${getClaseTipo(
                        notificacion.tipo
                      )} ${noLeida ? "no-leida" : "leida"}`}
                      onClick={() => handleClickNotificacion(notificacion)}
                      aria-label={`Notificación ${notificacion.tipo || "info"}: ${
                        notificacion.mensaje
                      }`}
                    >
                      <div className="icono-item-notificacion">
                        {getIcono(notificacion.tipo)}
                      </div>

                      <div className="contenido-item-notificacion">
                        <div className="mensaje-item-notificacion">
                          {notificacion.mensaje}
                        </div>

                        <div className="meta-item-notificacion">
                          <div className="fecha-contenedor">
                            <Clock size={12} />
                            <span className="fecha-item-notificacion">
                              {formatearFechaRelativa(notificacion.fecha)}
                            </span>
                          </div>

                          {noLeida && (
                            <div className="indicador-contenedor">
                              <span
                                className="indicador-no-leida"
                                title="No leída"
                              ></span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="sin-notificaciones">
                <Bell size={32} strokeWidth={1.5} />
                <p>No hay notificaciones</p>
                <span className="texto-ayuda">Todo está al día</span>
              </div>
            )}
          </div>

          {notificaciones.length > 0 && (
            <div className="pie-dropdown-notificaciones">
              <button
                className="boton-ver-todas"
                onClick={handleVerTodas}
                title="Ver todas las notificaciones"
                aria-label="Ver todas las notificaciones"
              >
                Ver todas las notificaciones →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificacionesSuperior;