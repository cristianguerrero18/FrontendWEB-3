import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNotificaciones } from "../hooks/useNotificaciones.js";
import "../css/Principal.css";
import "../css/Notificaciones.css";

const Notificaciones = () => {
  const { 
    notificaciones, 
    cargando, 
    mensaje, 
    recargarNotificaciones,
    eliminarNotificacion,
    marcarComoVista,
    limpiarMensaje 
  } = useNotificaciones();
  
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(10);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
  const [notificacionAEliminar, setNotificacionAEliminar] = useState(null);
  const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);
  const [notificacionDetallada, setNotificacionDetallada] = useState(null);

  useEffect(() => {
    recargarNotificaciones();
  }, [recargarNotificaciones]);

  // Limpiar mensaje después de 5 segundos
  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => {
        limpiarMensaje();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje, limpiarMensaje]);

  // Filtrar notificaciones por búsqueda
  const notificacionesFiltradas = useMemo(() => {
    if (!notificaciones.length) return [];
    
    const textoBusqueda = busqueda.toLowerCase();
    
    return notificaciones.filter(notificacion => {
      if (!notificacion) return false;
      
      return (
        (notificacion.mensaje && notificacion.mensaje.toLowerCase().includes(textoBusqueda)) ||
        (notificacion.id_usuario && notificacion.id_usuario.toString().includes(textoBusqueda)) ||
        (notificacion.id_notificacion && notificacion.id_notificacion.toString().includes(textoBusqueda)) ||
        (notificacion.estado && notificacion.estado.toLowerCase().includes(textoBusqueda))
      );
    });
  }, [notificaciones, busqueda]);

  // Calcular elementos para la página actual
  const indiceUltimoElemento = paginaActual * elementosPorPagina;
  const indicePrimerElemento = indiceUltimoElemento - elementosPorPagina;
  const elementosActuales = notificacionesFiltradas.slice(indicePrimerElemento, indiceUltimoElemento);
  const totalPaginas = Math.ceil(notificacionesFiltradas.length / elementosPorPagina);

  // Función para ver detalles de la notificación
  const handleVerDetalles = useCallback(async (notificacion) => {
    if (!notificacion) return;
    
    // Marcar como vista solo si está en estado "no visto"
    if (notificacion.estado === "no visto") {
      await marcarComoVista(notificacion.id_notificacion);
    }
    
    setNotificacionDetallada(notificacion);
    setMostrarModalDetalles(true);
  }, [marcarComoVista]);

  // Función para cerrar modal de detalles
  const cerrarModalDetalles = useCallback(() => {
    setMostrarModalDetalles(false);
    setNotificacionDetallada(null);
  }, []);

  // Función para eliminar notificación
  const handleEliminarNotificacion = useCallback((notificacion) => {
    if (!notificacion) return;
    setNotificacionAEliminar(notificacion);
    setMostrarConfirmacionEliminar(true);
  }, []);

  const confirmarEliminarNotificacion = useCallback(async () => {
    if (notificacionAEliminar && notificacionAEliminar.id_notificacion) {
      await eliminarNotificacion(notificacionAEliminar.id_notificacion);
      setMostrarConfirmacionEliminar(false);
      setNotificacionAEliminar(null);
    }
  }, [notificacionAEliminar, eliminarNotificacion]);

  // Formatear fecha - CORREGIDO para usar la propiedad correcta
  const formatearFecha = useCallback((fechaString) => {
    if (!fechaString) return 'Fecha no disponible';
    try {
      const fecha = new Date(fechaString);
      if (isNaN(fecha.getTime())) return 'Fecha inválida';
      
      const opciones = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      
      return fecha.toLocaleDateString('es-ES', opciones);
    } catch (error) {
      console.error("Error formateando fecha:", fechaString, error);
      return 'Fecha inválida';
    }
  }, []);

  // Obtener color según estado de la notificación
  const getColorEstado = useCallback((estado) => {
    const estadoLower = estado?.toLowerCase() || 'no visto';
    
    switch(estadoLower) {
      case 'visto':
        return { bg: "#e8f5e9", color: "#388e3c", border: "#c8e6c9", texto: "Visto" };
      case 'no visto':
        return { bg: "#ffebee", color: "#d32f2f", border: "#ffcdd2", texto: "No visto" };
      default:
        return { bg: "#f5f5f5", color: "#616161", border: "#e0e0e0", texto: estado || "No visto" };
    }
  }, []);

  // Resetear paginación cuando cambia la búsqueda
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  if (cargando && !notificaciones.length) return (
    <div className="estado-carga">
      <div className="spinner-grande"></div>
      <p>Cargando notificaciones...</p>
    </div>
  );

  if (!notificaciones.length && !cargando) return (
    <div className="estado-inicial">
      <h2>No hay notificaciones disponibles</h2>
      <p>No se encontraron notificaciones en el sistema.</p>
    </div>
  );

  return (
    <div className="contenedor-notificaciones">
      {mensaje && (
        <div className={`mensaje-api ${mensaje.includes("Error") ? "error" : "exito"}`}>
          <p>{mensaje}</p>
          <button 
            className="boton-cerrar-mensaje"
            onClick={limpiarMensaje}
          >
            ×
          </button>
        </div>
      )}

      <div className="cabecera-notificaciones">
        <div className="titulo-notificaciones-con-boton">
          <div>
            <h2>Gestión de Notificaciones</h2>
            <p className="subtitulo-notificaciones">
              Administra las notificaciones del sistema
            </p>
          </div>
          <button 
            className="boton-nuevo-notificacion"
            onClick={recargarNotificaciones}
            disabled={cargando}
          >
            ↻ Actualizar
          </button>
        </div>
        
        <div className="controles-notificaciones">
          <div className="buscador-notificaciones">
            <input
              type="text"
              placeholder="Buscar por mensaje, usuario, estado..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-busqueda-notificaciones"
            />
          </div>
          
          <div className="controles-paginacion-superior">
            <div className="seleccion-elementos-notificaciones">
              <span>Mostrar:</span>
              <select 
                value={elementosPorPagina} 
                onChange={(e) => {
                  setElementosPorPagina(Number(e.target.value));
                  setPaginaActual(1);
                }}
                className="select-elementos-notificaciones"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            
            <div className="info-cantidad-notificaciones">
              {notificacionesFiltradas.length} {notificacionesFiltradas.length === 1 ? 'notificación encontrada' : 'notificaciones encontradas'}
            </div>
          </div>
        </div>
      </div>

      <div className="contenedor-tabla-notificaciones">
        <table className="tabla-notificaciones">
          <thead>
            <tr>
              <th className="columna-id-notificacion">ID</th>
              <th className="columna-usuario-notificacion">Usuario ID</th>
              <th className="columna-mensaje-notificacion">Mensaje</th>
              <th className="columna-estado-notificacion">Estado</th>
              <th className="columna-fecha-notificacion">Fecha</th>
              <th className="columna-acciones-notificacion">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {elementosActuales.map((notificacion) => {
              const estadoInfo = getColorEstado(notificacion.estado);
              
              return (
                <tr key={notificacion.id_notificacion} className="fila-notificacion">
                  <td className="celda-id-notificacion">
                    <div className="badge-id-notificacion">
                      #{notificacion.id_notificacion}
                    </div>
                  </td>
                  <td className="celda-usuario-notificacion">
                    <div className="id-usuario-notificacion">
                      {notificacion.id_usuario || 'N/A'}
                    </div>
                  </td>
                  <td className="celda-mensaje-notificacion">
                    <div className="mensaje-notificacion" title={notificacion.mensaje}>
                      {notificacion.mensaje && notificacion.mensaje.length > 60 ? 
                        notificacion.mensaje.substring(0, 60) + '...' : 
                        notificacion.mensaje || 'Sin mensaje'}
                    </div>
                  </td>
                  <td className="celda-estado-notificacion">
                    <div className="estado-notificacion" style={{ 
                      backgroundColor: estadoInfo.bg,
                      color: estadoInfo.color,
                      borderColor: estadoInfo.border
                    }}>
                      {estadoInfo.texto}
                    </div>
                  </td>
                  <td className="celda-fecha-notificacion">
                    <div className="fecha-info-notificacion">
                      {formatearFecha(notificacion.fecha)} {/* Cambiado de fecha_creacion a fecha */}
                    </div>
                  </td>
                  <td className="celda-acciones-notificacion">
                    <div className="botones-acciones-notificacion">
                      <button 
                        className="boton-ver-notificacion"
                        onClick={() => handleVerDetalles(notificacion)}
                        title="Ver detalles completos"
                        disabled={cargando}
                      >
                        Ver
                      </button>
                      <button 
                        className="boton-eliminar-notificacion"
                        onClick={() => handleEliminarNotificacion(notificacion)}
                        title="Eliminar notificación"
                        disabled={cargando}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de detalles de la notificación */}
      {mostrarModalDetalles && (
        <div className="modal-fondo-notificaciones" onClick={cerrarModalDetalles}>
          <div className="modal-contenido-notificaciones modal-detalles" onClick={(e) => e.stopPropagation()}>
            <div className="modal-cabecera-notificaciones">
              <h2>
                Detalles de la Notificación #{notificacionDetallada?.id_notificacion}
              </h2>
              <button 
                className="modal-cerrar-notificaciones"
                onClick={cerrarModalDetalles}
              >
                ×
              </button>
            </div>
            
            <div className="modal-cuerpo-notificaciones">
              {notificacionDetallada ? (
                <div className="detalles-simple-notificaciones">
                  <div className="detalle-grupo-notificaciones">
                    <h3>Información Básica</h3>
                    <div className="detalle-fila-notificaciones">
                      <span className="detalle-etiqueta">ID Notificación:</span>
                      <span className="detalle-valor">#{notificacionDetallada.id_notificacion}</span>
                    </div>
                    <div className="detalle-fila-notificaciones">
                      <span className="detalle-etiqueta">ID Usuario:</span>
                      <span className="detalle-valor">{notificacionDetallada.id_usuario || 'N/A'}</span>
                    </div>
                    <div className="detalle-fila-notificaciones">
                      <span className="detalle-etiqueta">Estado:</span>
                      <span className="detalle-valor">
                        <span className="badge-estado-detalle" style={{ 
                          backgroundColor: getColorEstado(notificacionDetallada.estado).bg,
                          color: getColorEstado(notificacionDetallada.estado).color
                        }}>
                          {getColorEstado(notificacionDetallada.estado).texto}
                        </span>
                      </span>
                    </div>
                    <div className="detalle-fila-notificaciones">
                      <span className="detalle-etiqueta">Fecha:</span>
                      <span className="detalle-valor">{formatearFecha(notificacionDetallada.fecha)}</span>
                    </div>
                  </div>

                  <div className="detalle-grupo-notificaciones">
                    <h3>Mensaje Completo</h3>
                    <div className="detalle-mensaje-completo">
                      {notificacionDetallada.mensaje || 'No hay mensaje disponible'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="estado-error">
                  <p>No se pudieron cargar los detalles de la notificación.</p>
                  <button 
                    className="boton-cerrar-detalles-notificaciones"
                    onClick={cerrarModalDetalles}
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </div>
            
            <div className="modal-pie-notificaciones">
              <button 
                className="boton-cerrar-detalles-notificaciones"
                onClick={cerrarModalDetalles}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar notificación */}
      {mostrarConfirmacionEliminar && (
        <div className="modal-fondo-notificaciones">
          <div className="modal-contenido-notificaciones modal-confirmacion">
            <div className="modal-cabecera-notificaciones">
              <h2>Confirmar Eliminación</h2>
              <button 
                className="modal-cerrar-notificaciones"
                onClick={() => setMostrarConfirmacionEliminar(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-cuerpo-notificaciones">
              <p>¿Estás seguro de que deseas eliminar esta notificación?</p>
              <div className="notificacion-a-eliminar-detalle">
                <div className="notificacion-eliminar-header">
                  <span className="notificacion-id">Notificación #{notificacionAEliminar?.id_notificacion}</span>
                  <span className="notificacion-estado" style={{ 
                    backgroundColor: getColorEstado(notificacionAEliminar?.estado).bg,
                    color: getColorEstado(notificacionAEliminar?.estado).color
                  }}>
                    {getColorEstado(notificacionAEliminar?.estado).texto}
                  </span>
                </div>
                
                <div className="notificacion-eliminar-info">
                  <div className="info-linea">
                    <strong>Usuario ID:</strong> {notificacionAEliminar?.id_usuario}
                  </div>
                  <div className="info-linea">
                    <strong>Estado:</strong> {notificacionAEliminar?.estado || 'No visto'}
                  </div>
                  <div className="info-linea">
                    <strong>Fecha:</strong> {formatearFecha(notificacionAEliminar?.fecha)}
                  </div>
                  <div className="info-linea mensaje-resumen">
                    <strong>Mensaje:</strong> 
                    <div className="mensaje-texto">
                      {notificacionAEliminar?.mensaje?.substring(0, 150) || 'Sin mensaje'}...
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="advertencia-eliminar-notificaciones">
                <span className="icono-advertencia">⚠️</span>
                <span>Esta acción no se puede deshacer.</span>
              </div>
            </div>
            
            <div className="modal-pie-notificaciones">
              <button 
                className="boton-cancelar-notificaciones"
                onClick={() => {
                  setMostrarConfirmacionEliminar(false);
                  setNotificacionAEliminar(null);
                }}
                disabled={cargando}
              >
                Cancelar
              </button>
              <button 
                className="boton-eliminar-confirmar-notificaciones"
                onClick={confirmarEliminarNotificacion}
                disabled={cargando}
              >
                {cargando ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paginador */}
      {totalPaginas > 1 && (
        <div className="paginador-notificaciones">
          <div className="info-paginacion-notificaciones">
            Mostrando {indicePrimerElemento + 1} - {Math.min(indiceUltimoElemento, notificacionesFiltradas.length)} de {notificacionesFiltradas.length} notificaciones
          </div>
          
          <div className="controles-navegacion-notificaciones">
            <button 
              onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))} 
              disabled={paginaActual === 1}
              className="boton-paginador-notificaciones boton-anterior-notificaciones"
            >
              ← Anterior
            </button>

            <div className="numeros-pagina-notificaciones">
              {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                let numeroPagina;
                if (totalPaginas <= 5) {
                  numeroPagina = i + 1;
                } else if (paginaActual <= 3) {
                  numeroPagina = i + 1;
                } else if (paginaActual >= totalPaginas - 2) {
                  numeroPagina = totalPaginas - 4 + i;
                } else {
                  numeroPagina = paginaActual - 2 + i;
                }

                return (
                  <button
                    key={numeroPagina}
                    onClick={() => setPaginaActual(numeroPagina)}
                    className={`numero-pagina-notificaciones ${paginaActual === numeroPagina ? 'activa' : ''}`}
                  >
                    {numeroPagina}
                  </button>
                );
              })}
              
              {totalPaginas > 5 && paginaActual < totalPaginas - 2 && (
                <>
                  <span className="puntos-suspensivos-notificaciones">...</span>
                  <button
                    onClick={() => setPaginaActual(totalPaginas)}
                    className={`numero-pagina-notificaciones ${paginaActual === totalPaginas ? 'activa' : ''}`}
                  >
                    {totalPaginas}
                  </button>
                </>
              )}
            </div>

            <button 
              onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))} 
              disabled={paginaActual === totalPaginas}
              className="boton-paginador-notificaciones boton-siguiente-notificaciones"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notificaciones;