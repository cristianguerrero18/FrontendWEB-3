import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNotificaciones } from "../../hooks/useNotificaciones.js";
import "../../css/Principal.css";
import "../../css/Notificaciones.css";

const Notificaciones = () => {
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(10);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
  const [notificacionAEliminar, setNotificacionAEliminar] = useState(null);
  const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);
  const [notificacionDetallada, setNotificacionDetallada] = useState(null);
  const [mostrarConfirmacionEliminarTodas, setMostrarConfirmacionEliminarTodas] = useState(false);

  const {
    notificaciones,
    cargando,
    mensaje,
    noLeidas,
    idUsuario,
    recargarNotificaciones,
    eliminarNotificacion,
    marcarComoVista,
    marcarTodoComoVista,
    eliminarTodasNotificacionesUsuario,
    limpiarMensaje,
  } = useNotificaciones();

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => {
        limpiarMensaje();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [mensaje, limpiarMensaje]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, elementosPorPagina]);

  const normalizarEstado = useCallback((estado) => {
    return (estado || "").toLowerCase().trim();
  }, []);

  const formatearFecha = useCallback((fechaString) => {
    if (!fechaString) return "Fecha no disponible";

    try {
      const fecha = new Date(fechaString);
      if (isNaN(fecha.getTime())) return "Fecha inválida";

      return fecha.toLocaleString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Fecha inválida";
    }
  }, []);

  const getColorEstado = useCallback((estado) => {
    const estadoLower = normalizarEstado(estado);

    switch (estadoLower) {
      case "visto":
        return {
          bg: "#e8f5e9",
          color: "#2e7d32",
          border: "#c8e6c9",
          texto: "Vista",
        };
      default:
        return {
          bg: "#fff3e0",
          color: "#ef6c00",
          border: "#ffcc80",
          texto: "No vista",
        };
    }
  }, [normalizarEstado]);

  const getClaseTipo = useCallback((tipo) => {
    const valor = (tipo || "general").toLowerCase();

    if (valor.includes("pqrs")) return "tipo-pqrs";
    if (valor.includes("recurso")) return "tipo-recurso";
    if (valor.includes("admin")) return "tipo-admin";
    if (valor.includes("sistema")) return "tipo-sistema";

    return "tipo-general";
  }, []);

  const notificacionesFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    if (!texto) return notificaciones;

    return notificaciones.filter((notificacion) => {
      const id = String(notificacion?.id_notificacion || "");
      const tipo = String(notificacion?.tipo || "").toLowerCase();
      const estado = String(notificacion?.estado || "").toLowerCase();
      const mensajeTexto = String(notificacion?.mensaje || "").toLowerCase();

      return (
        id.includes(texto) ||
        tipo.includes(texto) ||
        estado.includes(texto) ||
        mensajeTexto.includes(texto)
      );
    });
  }, [notificaciones, busqueda]);

  const totalNotificaciones = notificaciones.length;
  const totalVistas = notificaciones.filter(
    (n) => normalizarEstado(n.estado) === "visto"
  ).length;

  const indiceUltimoElemento = paginaActual * elementosPorPagina;
  const indicePrimerElemento = indiceUltimoElemento - elementosPorPagina;
  const elementosActuales = notificacionesFiltradas.slice(
    indicePrimerElemento,
    indiceUltimoElemento
  );
  const totalPaginas = Math.ceil(
    notificacionesFiltradas.length / elementosPorPagina
  );

  const handleVerDetalles = useCallback(async (notificacion) => {
    if (!notificacion) return;

    if (normalizarEstado(notificacion.estado) !== "visto") {
      await marcarComoVista(notificacion.id_notificacion);
      notificacion = { ...notificacion, estado: "visto" };
    }

    setNotificacionDetallada(notificacion);
    setMostrarModalDetalles(true);
  }, [marcarComoVista, normalizarEstado]);

  const cerrarModalDetalles = useCallback(() => {
    setMostrarModalDetalles(false);
    setNotificacionDetallada(null);
  }, []);

  const handleEliminarNotificacion = useCallback((notificacion) => {
    setNotificacionAEliminar(notificacion);
    setMostrarConfirmacionEliminar(true);
  }, []);

  const confirmarEliminarNotificacion = useCallback(async () => {
    if (!notificacionAEliminar?.id_notificacion) return;

    await eliminarNotificacion(notificacionAEliminar.id_notificacion);
    setMostrarConfirmacionEliminar(false);
    setNotificacionAEliminar(null);
  }, [notificacionAEliminar, eliminarNotificacion]);

  const confirmarEliminarTodas = useCallback(async () => {
    await eliminarTodasNotificacionesUsuario();
    setMostrarConfirmacionEliminarTodas(false);
  }, [eliminarTodasNotificacionesUsuario]);

  if (!idUsuario && !cargando) {
    return (
      <div className="estado-inicial">
        <div className="estado-icono">🔒</div>
        <h2>Usuario no identificado</h2>
        <p>No se pudo obtener la información del usuario. Inicia sesión nuevamente.</p>
      </div>
    );
  }

  if (cargando && !notificaciones.length) {
    return (
      <div className="estado-carga">
        <div className="spinner-grande"></div>
        <p>Cargando notificaciones...</p>
      </div>
    );
  }

  return (
    <div className="contenedor-notificaciones">
      {mensaje && (
        <div className={`mensaje-api ${mensaje.toLowerCase().includes("error") ? "error" : "exito"}`}>
          <p>{mensaje}</p>
          <button className="boton-cerrar-mensaje" onClick={limpiarMensaje}>
            ×
          </button>
        </div>
      )}

      <div className="cabecera-notificaciones">
        <div className="titulo-notificaciones-con-boton">
          <div>
            <h2>Centro de Notificaciones</h2>
            <p className="subtitulo-notificaciones">
              Consulta, filtra y administra tus alertas del sistema.
            </p>
          </div>

          <div className="botones-superiores">
            <button
              className="boton-nuevo-notificacion boton-secundario"
              onClick={recargarNotificaciones}
              disabled={cargando}
            >
              ↻ Actualizar
            </button>

          

            {!!notificaciones.length && (
              <button
                className="boton-nuevo-notificacion boton-peligro"
                onClick={() => setMostrarConfirmacionEliminarTodas(true)}
                disabled={cargando}
              >
                🗑 Eliminar todas
              </button>
            )}
          </div>
        </div>

        <div className="resumen-notificaciones">
          <div className="tarjeta-resumen-notificacion">
            <span className="resumen-etiqueta">Total</span>
            <strong>{totalNotificaciones}</strong>
          </div>
          <div className="tarjeta-resumen-notificacion tarjeta-pendientes">
            <span className="resumen-etiqueta">No vistas</span>
            <strong>{noLeidas}</strong>
          </div>
          <div className="tarjeta-resumen-notificacion tarjeta-vistas">
            <span className="resumen-etiqueta">Vistas</span>
            <strong>{totalVistas}</strong>
          </div>
        </div>

        <div className="controles-notificaciones">
          <div className="buscador-notificaciones">
            <input
              type="text"
              placeholder="Buscar por mensaje, tipo, estado o ID..."
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
                onChange={(e) => setElementosPorPagina(Number(e.target.value))}
                className="select-elementos-notificaciones"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>

            <div className="info-cantidad-notificaciones">
              {notificacionesFiltradas.length}{" "}
              {notificacionesFiltradas.length === 1
                ? "notificación encontrada"
                : "notificaciones encontradas"}
            </div>
          </div>
        </div>
      </div>

      {!notificaciones.length && !cargando ? (
        <div className="estado-inicial estado-vacio-profesional">
          <div className="estado-icono">🔔</div>
          <h2>No tienes notificaciones</h2>
          <p>Cuando ocurra alguna acción importante en el sistema, aparecerá aquí.</p>
          <button className="boton-nuevo-notificacion" onClick={recargarNotificaciones}>
            ↻ Recargar
          </button>
        </div>
      ) : (
        <>
          <div className="contenedor-tabla-notificaciones">
            <table className="tabla-notificaciones">
              <thead>
                <tr>
                  <th className="columna-id-notificacion">ID</th>
                  <th className="columna-tipo-notificacion">Tipo</th>
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
                    <tr
                      key={notificacion.id_notificacion}
                      className={`fila-notificacion ${
                        normalizarEstado(notificacion.estado) !== "visto"
                          ? "fila-no-vista"
                          : ""
                      }`}
                    >
                      <td className="celda-id-notificacion">
                        <div className="badge-id-notificacion">
                          #{notificacion.id_notificacion}
                        </div>
                      </td>

                      <td className="celda-tipo-notificacion">
                        <span className={`tipo-notificacion ${getClaseTipo(notificacion.tipo)}`}>
                          {notificacion.tipo || "general"}
                        </span>
                      </td>

                      <td className="celda-mensaje-notificacion">
                        <div className="mensaje-notificacion" title={notificacion.mensaje}>
                          {notificacion.mensaje?.length > 85
                            ? `${notificacion.mensaje.substring(0, 85)}...`
                            : notificacion.mensaje || "Sin mensaje"}
                        </div>
                      </td>

                      <td className="celda-estado-notificacion">
                        <div
                          className="estado-notificacion"
                          style={{
                            backgroundColor: estadoInfo.bg,
                            color: estadoInfo.color,
                            borderColor: estadoInfo.border,
                          }}
                        >
                          {estadoInfo.texto}
                        </div>
                      </td>

                      <td className="celda-fecha-notificacion">
                        <div className="fecha-info-notificacion">
                          {formatearFecha(notificacion.fecha)}
                        </div>
                      </td>

                      <td className="celda-acciones-notificacion">
                        <div className="botones-acciones-notificacion">
                          <button
                            className="boton-ver-notificacion"
                            onClick={() => handleVerDetalles(notificacion)}
                            disabled={cargando}
                          >
                            Ver
                          </button>
                          <button
                            className="boton-eliminar-notificacion"
                            onClick={() => handleEliminarNotificacion(notificacion)}
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

          {totalPaginas > 1 && (
            <div className="paginador-notificaciones">
              <div className="info-paginacion-notificaciones">
                Mostrando {indicePrimerElemento + 1} -{" "}
                {Math.min(indiceUltimoElemento, notificacionesFiltradas.length)} de{" "}
                {notificacionesFiltradas.length} notificaciones
              </div>

              <div className="controles-navegacion-notificaciones">
                <button
                  onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
                  disabled={paginaActual === 1}
                  className="boton-paginador-notificaciones"
                >
                  ← Anterior
                </button>

                <div className="numeros-pagina-notificaciones">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                    .slice(
                      Math.max(0, paginaActual - 3),
                      Math.max(0, paginaActual - 3) + 5
                    )
                    .map((numeroPagina) => (
                      <button
                        key={numeroPagina}
                        onClick={() => setPaginaActual(numeroPagina)}
                        className={`numero-pagina-notificaciones ${
                          paginaActual === numeroPagina ? "activa" : ""
                        }`}
                      >
                        {numeroPagina}
                      </button>
                    ))}
                </div>

                <button
                  onClick={() =>
                    setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))
                  }
                  disabled={paginaActual === totalPaginas}
                  className="boton-paginador-notificaciones"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {mostrarModalDetalles && (
        <div className="modal-fondo-notificaciones" onClick={cerrarModalDetalles}>
          <div
            className="modal-contenido-notificaciones modal-detalles"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-cabecera-notificaciones">
              <h2>Detalle de notificación</h2>
              <button className="modal-cerrar-notificaciones" onClick={cerrarModalDetalles}>
                ×
              </button>
            </div>

            <div className="modal-cuerpo-notificaciones">
              {notificacionDetallada && (
                <div className="detalles-simple-notificaciones">
                  <div className="detalle-grupo-notificaciones">
                    <h3>Información general</h3>

                    <div className="detalle-fila-notificaciones">
                      <span className="detalle-etiqueta">ID:</span>
                      <span className="detalle-valor">
                        #{notificacionDetallada.id_notificacion}
                      </span>
                    </div>

                    <div className="detalle-fila-notificaciones">
                      <span className="detalle-etiqueta">Usuario:</span>
                      <span className="detalle-valor">
                        {notificacionDetallada.id_usuario || "N/A"}
                      </span>
                    </div>

                    <div className="detalle-fila-notificaciones">
                      <span className="detalle-etiqueta">Tipo:</span>
                      <span className="detalle-valor">
                        <span
                          className={`tipo-notificacion ${getClaseTipo(
                            notificacionDetallada.tipo
                          )}`}
                        >
                          {notificacionDetallada.tipo || "general"}
                        </span>
                      </span>
                    </div>

                    <div className="detalle-fila-notificaciones">
                      <span className="detalle-etiqueta">Estado:</span>
                      <span className="detalle-valor">
                        <span
                          className="badge-estado-detalle"
                          style={{
                            backgroundColor: getColorEstado(notificacionDetallada.estado).bg,
                            color: getColorEstado(notificacionDetallada.estado).color,
                          }}
                        >
                          {getColorEstado(notificacionDetallada.estado).texto}
                        </span>
                      </span>
                    </div>

                    <div className="detalle-fila-notificaciones">
                      <span className="detalle-etiqueta">Fecha:</span>
                      <span className="detalle-valor">
                        {formatearFecha(notificacionDetallada.fecha)}
                      </span>
                    </div>
                  </div>

                  <div className="detalle-grupo-notificaciones">
                    <h3>Mensaje completo</h3>
                    <div className="detalle-mensaje-completo">
                      {notificacionDetallada.mensaje || "No hay mensaje disponible"}
                    </div>
                  </div>
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

      {mostrarConfirmacionEliminar && (
        <div className="modal-fondo-notificaciones">
          <div className="modal-contenido-notificaciones modal-confirmacion">
            <div className="modal-cabecera-notificaciones">
              <h2>Confirmar eliminación</h2>
              <button
                className="modal-cerrar-notificaciones"
                onClick={() => {
                  setMostrarConfirmacionEliminar(false);
                  setNotificacionAEliminar(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="modal-cuerpo-notificaciones">
              <p>¿Deseas eliminar esta notificación?</p>

              <div className="notificacion-a-eliminar-detalle">
                <div className="notificacion-eliminar-header">
                  <span className="notificacion-id">
                    Notificación #{notificacionAEliminar?.id_notificacion}
                  </span>
                  <span
                    className="notificacion-estado"
                    style={{
                      backgroundColor: getColorEstado(notificacionAEliminar?.estado).bg,
                      color: getColorEstado(notificacionAEliminar?.estado).color,
                    }}
                  >
                    {getColorEstado(notificacionAEliminar?.estado).texto}
                  </span>
                </div>

                <div className="notificacion-eliminar-info">
                  <div className="info-linea">
                    <strong>Tipo:</strong> {notificacionAEliminar?.tipo || "general"}
                  </div>
                  <div className="info-linea mensaje-resumen">
                    <strong>Mensaje:</strong>
                    <div className="mensaje-texto">
                      {notificacionAEliminar?.mensaje || "Sin mensaje"}
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
                {cargando ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarConfirmacionEliminarTodas && (
        <div className="modal-fondo-notificaciones">
          <div className="modal-contenido-notificaciones modal-confirmacion">
            <div className="modal-cabecera-notificaciones">
              <h2>Eliminar todas las notificaciones</h2>
              <button
                className="modal-cerrar-notificaciones"
                onClick={() => setMostrarConfirmacionEliminarTodas(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-cuerpo-notificaciones">
              <p>¿Deseas eliminar todas tus notificaciones?</p>

              <div className="info-eliminar-todas">
                <div className="estadisticas-eliminar-todas">
                  <div className="estadistica-item">
                    <span className="estadistica-numero">{totalNotificaciones}</span>
                    <span className="estadistica-label">Totales</span>
                  </div>
                  <div className="estadistica-item">
                    <span className="estadistica-numero" style={{ color: "#ef6c00" }}>
                      {noLeidas}
                    </span>
                    <span className="estadistica-label">No vistas</span>
                  </div>
                  <div className="estadistica-item">
                    <span className="estadistica-numero" style={{ color: "#2e7d32" }}>
                      {totalVistas}
                    </span>
                    <span className="estadistica-label">Vistas</span>
                  </div>
                </div>
              </div>

              <div className="advertencia-eliminar-notificaciones advertencia-grande">
                <span className="icono-advertencia">⚠️</span>
                <div>
                  <p><strong>Esta acción eliminará permanentemente todos los registros.</strong></p>
                  <p>No podrá deshacerse después.</p>
                </div>
              </div>
            </div>

            <div className="modal-pie-notificaciones">
              <button
                className="boton-cancelar-notificaciones"
                onClick={() => setMostrarConfirmacionEliminarTodas(false)}
                disabled={cargando}
              >
                Cancelar
              </button>
              <button
                className="boton-eliminar-confirmar-notificaciones boton-peligro-grande"
                onClick={confirmarEliminarTodas}
                disabled={cargando}
              >
                {cargando ? "Eliminando..." : "Eliminar todas"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notificaciones;