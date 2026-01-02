import React, { useRef, useEffect } from "react";
import { Bell, Check, AlertCircle, Info, X, RefreshCw, AlertTriangle, Clock, Star } from "lucide-react";
import { useNotificacionesSuperior } from "../hooks/useNotificacionesSuperior.js";
import "../css/NotificacionesSuperior.css";

const NotificacionesSuperior = ({ onVerTodas }) => { // <-- Agrega prop
  const {
    notificaciones,
    cargando,
    mostrarDropdown,
    toggleDropdown,
    marcarTodasComoLeidas,
    marcarComoLeida,
    contarNoLeidas,
    recargarNotificaciones
  } = useNotificacionesSuperior();

  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (mostrarDropdown) {
          toggleDropdown();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mostrarDropdown, toggleDropdown]);

  // Obtener icono según tipo de notificación
  const getIcono = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'alerta':
      case 'warning':
        return <AlertCircle size={18} />;
      case 'error':
      case 'danger':
        return <AlertTriangle size={18} />;
      case 'importante':
      case 'important':
        return <Star size={18} />;
      case 'success':
      case 'exito':
        return <Check size={18} />;
      case 'info':
      default:
        return <Info size={18} />;
    }
  };

  // Obtener color según tipo de notificación (usando la paleta de la plataforma)
  const getColor = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'alerta':
      case 'warning':
        return { 
          bg: 'rgba(243, 156, 18, 0.08)', 
          border: '#f39c12', 
          icon: '#f39c12',
          text: '#e67e22'
        };
      case 'error':
      case 'danger':
        return { 
          bg: 'rgba(231, 76, 60, 0.08)', 
          border: '#e74c3c', 
          icon: '#e74c3c',
          text: '#c0392b'
        };
      case 'importante':
      case 'important':
        return { 
          bg: 'rgba(46, 204, 113, 0.08)', 
          border: '#2ecc71', 
          icon: '#2ecc71',
          text: '#27ae60'
        };
      case 'success':
      case 'exito':
        return { 
          bg: 'rgba(39, 174, 96, 0.08)', 
          border: '#27ae60', 
          icon: '#27ae60',
          text: '#229954'
        };
      case 'info':
      default:
        return { 
          bg: 'rgba(52, 152, 219, 0.08)', 
          border: '#3498db', 
          icon: '#3498db',
          text: '#2980b9'
        };
    }
  };

  // Formatear fecha relativa mejorado
  const formatearFechaRelativa = (fechaString) => {
    if (!fechaString) return 'Reciente';
    
    try {
      const fecha = new Date(fechaString);
      if (isNaN(fecha.getTime())) return 'Fecha inválida';
      
      const ahora = new Date();
      const diffMs = ahora - fecha;
      const diffSeg = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffMs / 60000);
      const diffHoras = Math.floor(diffMs / 3600000);
      const diffDias = Math.floor(diffMs / 86400000);

      if (diffSeg < 60) return 'Ahora mismo';
      if (diffMin < 60) return `Hace ${diffMin} min`;
      if (diffHoras < 24) return `Hace ${diffHoras} h`;
      if (diffDias < 7) return `Hace ${diffDias} d`;
      if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} sem`;
      
      return fecha.toLocaleDateString('es-ES', { 
        day: 'numeric',
        month: 'short',
        year: diffDias > 365 ? 'numeric' : undefined
      });
    } catch (error) {
      console.error("Error formateando fecha:", fechaString, error);
      return 'Reciente';
    }
  };

  // Manejar clic en una notificación
  const handleClickNotificacion = async (notificacion) => {
    const esNoLeida = notificacion.estado?.toLowerCase() === 'no visto';
    
    if (esNoLeida) {
      await marcarComoLeida(notificacion.id_notificacion);
    }
    
    // Agregar feedback visual
    const elemento = document.querySelector(`[data-id="${notificacion.id_notificacion}"]`);
    if (elemento) {
      elemento.style.transform = 'scale(0.98)';
      setTimeout(() => {
        elemento.style.transform = '';
      }, 150);
    }
    
    console.log("Notificación clickeada:", notificacion);
  };

  // Calcular altura máxima del dropdown basado en la cantidad de notificaciones
  const getMaxHeight = () => {
    const itemHeight = 70; // Altura aproximada por item
    const maxItems = 5; // Máximo de items visibles
    return Math.min(notificaciones.length, maxItems) * itemHeight + 200;
  };

  // Manejar clic en "Ver todas"
  const handleVerTodas = () => {
    if (onVerTodas) {
      onVerTodas(); // Llama a la función proporcionada por el padre
    }
    toggleDropdown(); // Cierra el dropdown
  };

  return (
    <div className="contenedor-notificaciones-superior" ref={dropdownRef}>
      <button 
        className="boton-notificaciones-superior"
        onClick={toggleDropdown}
        title="Notificaciones"
        aria-label={`Notificaciones ${contarNoLeidas() > 0 ? `(${contarNoLeidas()} no leídas)` : ''}`}
      >
        <Bell size={20} />
        {contarNoLeidas() > 0 && (
          <span className="badge-notificaciones-superior">
            {contarNoLeidas() > 99 ? '99+' : contarNoLeidas()}
          </span>
        )}
      </button>

      {mostrarDropdown && (
        <div 
          className="dropdown-notificaciones-superior"
          style={{ maxHeight: `${getMaxHeight()}px` }}
        >
          <div className="cabecera-dropdown-notificaciones">
            <div className="titulo-dropdown-notificaciones">
              <h3>Notificaciones</h3>
              <div className="contador-dropdown-notificaciones">
                {contarNoLeidas() > 0 ? (
                  <span className="badge-no-leidas">
                    {contarNoLeidas()} no leídas
                  </span>
                ) : notificaciones.length > 0 ? (
                  <span className="badge-todas-leidas">
                    <Check size={12} /> Todas leídas
                  </span>
                ) : null}
              </div>
            </div>
            <div className="acciones-dropdown-notificaciones">
              <button 
                className="boton-refrescar-notificaciones"
                onClick={recargarNotificaciones}
                disabled={cargando}
                title="Refrescar notificaciones"
                aria-label="Refrescar"
              >
                <RefreshCw size={14} className={cargando ? "girando" : ""} />
              </button>
              {notificaciones.length > 0 && contarNoLeidas() > 0 && (
                <button 
                  className="boton-marcar-todas"
                  onClick={marcarTodasComoLeidas}
                  disabled={cargando}
                  title="Marcar todas las notificaciones como leídas"
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
                  const color = getColor(notificacion.tipo);
                  const esNoLeida = notificacion.estado?.toLowerCase() === 'no visto';
                  
                  return (
                    <div 
                      key={notificacion.id_notificacion}
                      data-id={notificacion.id_notificacion}
                      className={`item-notificacion-superior ${esNoLeida ? 'no-leida' : ''}`}
                      style={{
                        backgroundColor: color.bg,
                        borderLeft: `3px solid ${color.border}`
                      }}
                      onClick={() => handleClickNotificacion(notificacion)}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => e.key === 'Enter' && handleClickNotificacion(notificacion)}
                      aria-label={`Notificación ${notificacion.tipo}: ${notificacion.mensaje}`}
                    >
                      <div className="icono-item-notificacion" style={{ color: color.icon }}>
                        {getIcono(notificacion.tipo)}
                      </div>
                      <div className="contenido-item-notificacion">
                        <div 
                          className="mensaje-item-notificacion"
                          style={{ color: color.text }}
                        >
                          {notificacion.mensaje}
                        </div>
                        <div className="meta-item-notificacion">
                          <div className="fecha-contenedor">
                            <Clock size={12} />
                            <span className="fecha-item-notificacion">
                              {formatearFechaRelativa(notificacion.fecha)}
                            </span>
                          </div>
                          {esNoLeida && (
                            <div className="indicador-contenedor">
                              <span className="indicador-no-leida" title="No leída"></span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
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
                onClick={handleVerTodas} // <-- Usa la nueva función
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