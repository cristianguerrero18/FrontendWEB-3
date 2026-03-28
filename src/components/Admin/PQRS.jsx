import React, { useState, useEffect, useCallback, useMemo } from "react";
import { usePQRS } from "../../hooks/usePQRS.js";
import { getUsuarioPorId } from "../../api/Admin/PQRS.js";
import "../../css/Principal.css";
import "../../css/PQRS.css";

const TIPOS_PQRS = {
  1: { nombre: "Petición", color: "#e3f2fd", texto: "#1976d2", border: "#bbdefb" },
  2: { nombre: "Queja", color: "#fff3e0", texto: "#f57c00", border: "#ffe0b2" },
  3: { nombre: "Reclamo", color: "#ffebee", texto: "#d32f2f", border: "#ffcdd2" },
  4: { nombre: "Sugerencia", color: "#e8f5e9", texto: "#388e3c", border: "#c8e6c9" },
};

const PQRS = () => {
  const {
    pqrs,
    cargando,
    mensaje,
    recargarPQRS,
    recargarPQRSporId,
    eliminarPQRS,
    responderPQR,
    limpiarMensaje,
  } = usePQRS();

  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(10);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
  const [pqrAEliminar, setPqrAEliminar] = useState(null);
  const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);
  const [pqrDetallado, setPqrDetallado] = useState(null);
  const [cargandoDetalles, setCargandoDetalles] = useState(false);
  const [mostrarModalResponder, setMostrarModalResponder] = useState(false);
  const [pqrAResponder, setPqrAResponder] = useState(null);
  const [respuesta, setRespuesta] = useState("");
  const [cargandoRespuesta, setCargandoRespuesta] = useState(false);
  const [nombresUsuarios, setNombresUsuarios] = useState({});
  const [mensajeLocal, setMensajeLocal] = useState("");

  const idAdmin = Number(localStorage.getItem("user_id")) || 21;

  useEffect(() => {
    recargarPQRS();
  }, [recargarPQRS]);

  useEffect(() => {
    if (!pqrs.length) return;

    const cargarNombresUsuarios = async () => {
      const idsFaltantes = [
        ...new Set(
          pqrs
            .map((pqr) => pqr?.id_usuario)
            .filter((id) => id && !nombresUsuarios[id])
        ),
      ];

      if (!idsFaltantes.length) return;

      try {
        const resultados = await Promise.all(
          idsFaltantes.map(async (idUsuario) => {
            try {
              const usuario = await getUsuarioPorId(idUsuario);
              return {
                id: idUsuario,
                nombre: usuario?.nombres_usuario || `Usuario ${idUsuario}`,
              };
            } catch {
              return {
                id: idUsuario,
                nombre: `Usuario ${idUsuario}`,
              };
            }
          })
        );

        setNombresUsuarios((prev) => {
          const actualizado = { ...prev };
          resultados.forEach(({ id, nombre }) => {
            actualizado[id] = nombre;
          });
          return actualizado;
        });
      } catch (error) {
        console.error("Error al cargar nombres de usuarios:", error);
      }
    };

    cargarNombresUsuarios();
  }, [pqrs, nombresUsuarios]);

  useEffect(() => {
    if (!mensaje && !mensajeLocal) return;

    const timer = setTimeout(() => {
      limpiarMensaje();
      setMensajeLocal("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [mensaje, mensajeLocal, limpiarMensaje]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, elementosPorPagina]);

  const mensajeMostrado = mensajeLocal || mensaje;

  const getInfoTipoPQR = useCallback((idTipo) => {
    return (
      TIPOS_PQRS[idTipo] || {
        nombre: "General",
        bg: "#f5f5f5",
        color: "#616161",
        border: "#e0e0e0",
      }
    );
  }, []);

  const getColorEstado = useCallback((estado) => {
    const estadoLower = (estado || "pendiente").toLowerCase();

    switch (estadoLower) {
      case "respondido":
        return {
          bg: "#e8f5e9",
          color: "#388e3c",
          border: "#c8e6c9",
          texto: "Respondido",
        };
      case "pendiente":
        return {
          bg: "#fff3e0",
          color: "#f57c00",
          border: "#ffe0b2",
          texto: "Pendiente",
        };
      default:
        return {
          bg: "#f5f5f5",
          color: "#616161",
          border: "#e0e0e0",
          texto: estado || "Pendiente",
        };
    }
  }, []);

  const obtenerNombreUsuario = useCallback(
    (idUsuario) => {
      if (!idUsuario) return "N/A";
      return nombresUsuarios[idUsuario] || `Usuario ${idUsuario}`;
    },
    [nombresUsuarios]
  );

  const formatearFecha = useCallback((fechaString) => {
    if (!fechaString) return "No aplica";
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

  const pqrsFiltrados = useMemo(() => {
    const textoBusqueda = busqueda.toLowerCase().trim();
    if (!textoBusqueda) return pqrs;

    return pqrs.filter((pqr) => {
      const tipoNombre = getInfoTipoPQR(pqr.id_tipo_pqrs).nombre.toLowerCase();
      const nombreUsuario = obtenerNombreUsuario(pqr.id_usuario).toLowerCase();
      const estado = (pqr.estado || "pendiente").toLowerCase();

      return (
        String(pqr.id_pqr || "").includes(textoBusqueda) ||
        String(pqr.id_usuario || "").includes(textoBusqueda) ||
        String(pqr.descripcion || "").toLowerCase().includes(textoBusqueda) ||
        String(pqr.respuesta || "").toLowerCase().includes(textoBusqueda) ||
        tipoNombre.includes(textoBusqueda) ||
        nombreUsuario.includes(textoBusqueda) ||
        estado.includes(textoBusqueda)
      );
    });
  }, [pqrs, busqueda, getInfoTipoPQR, obtenerNombreUsuario]);

  const totalPendientes = useMemo(
    () => pqrs.filter((item) => (item.estado || "").toLowerCase() !== "respondido").length,
    [pqrs]
  );

  const totalRespondidos = useMemo(
    () => pqrs.filter((item) => (item.estado || "").toLowerCase() === "respondido").length,
    [pqrs]
  );

  const indiceUltimoElemento = paginaActual * elementosPorPagina;
  const indicePrimerElemento = indiceUltimoElemento - elementosPorPagina;
  const elementosActuales = pqrsFiltrados.slice(indicePrimerElemento, indiceUltimoElemento);
  const totalPaginas = Math.ceil(pqrsFiltrados.length / elementosPorPagina);

  const cerrarModalDetalles = useCallback(() => {
    setMostrarModalDetalles(false);
    setPqrDetallado(null);
    setCargandoDetalles(false);
  }, []);

  const cerrarModalResponder = useCallback(() => {
    setMostrarModalResponder(false);
    setPqrAResponder(null);
    setRespuesta("");
    setCargandoRespuesta(false);
  }, []);

  const cerrarModalEliminar = useCallback(() => {
    setMostrarConfirmacionEliminar(false);
    setPqrAEliminar(null);
  }, []);

  const handleVerDetalles = useCallback(
    async (pqr) => {
      if (!pqr) return;

      setPqrDetallado(pqr);
      setMostrarModalDetalles(true);
      setCargandoDetalles(true);

      try {
        const detalles = await recargarPQRSporId(pqr.id_pqr);

        if (detalles && !detalles.error) {
          setPqrDetallado(detalles);

          if (detalles.id_usuario && !nombresUsuarios[detalles.id_usuario]) {
            try {
              const usuario = await getUsuarioPorId(detalles.id_usuario);
              setNombresUsuarios((prev) => ({
                ...prev,
                [detalles.id_usuario]:
                  usuario?.nombres_usuario || `Usuario ${detalles.id_usuario}`,
              }));
            } catch (error) {
              console.error("Error al cargar nombre del usuario:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error al cargar detalles del PQR:", error);
      } finally {
        setCargandoDetalles(false);
      }
    },
    [recargarPQRSporId, nombresUsuarios]
  );

  const handleResponderPQR = useCallback((pqr) => {
    if (!pqr) return;
    setPqrAResponder(pqr);
    setRespuesta(pqr.respuesta || "");
    setMostrarModalResponder(true);
  }, []);

  const enviarRespuesta = useCallback(async () => {
    if (!pqrAResponder) return;

    if (!respuesta.trim()) {
      setMensajeLocal("Por favor, escribe una respuesta antes de enviar.");
      return;
    }

    setCargandoRespuesta(true);

    try {
      const resultado = await responderPQR({
        id_pqr: pqrAResponder.id_pqr,
        respuesta: respuesta.trim(),
        id_admin: idAdmin,
      });

      if (!resultado?.error) {
        cerrarModalResponder();
        recargarPQRS();
      }
    } catch (error) {
      console.error("Error al responder PQR:", error);
      setMensajeLocal("Ocurrió un error al enviar la respuesta.");
    } finally {
      setCargandoRespuesta(false);
    }
  }, [pqrAResponder, respuesta, responderPQR, idAdmin, cerrarModalResponder, recargarPQRS]);

  const handleEliminarPQR = useCallback((pqr) => {
    if (!pqr) return;
    setPqrAEliminar(pqr);
    setMostrarConfirmacionEliminar(true);
  }, []);

  const confirmarEliminarPQR = useCallback(async () => {
    if (!pqrAEliminar?.id_pqr) return;

    await eliminarPQRS(pqrAEliminar.id_pqr);
    cerrarModalEliminar();
  }, [pqrAEliminar, eliminarPQRS, cerrarModalEliminar]);

  if (cargando && !pqrs.length) {
    return (
      <div className="estado-carga">
        <div className="spinner-grande"></div>
        <p>Cargando PQRS...</p>
      </div>
    );
  }

  if (!pqrs.length && !cargando) {
    return (
      <div className="estado-inicial estado-vacio-pqrs">
        <div className="estado-icono-pqrs">📨</div>
        <h2>No hay PQRS disponibles</h2>
        <p>No se encontraron peticiones, quejas, reclamos o sugerencias en el sistema.</p>
        <button className="boton-nuevo-pqr" onClick={recargarPQRS}>
          ↻ Actualizar
        </button>
      </div>
    );
  }

  return (
    <div className="contenedor-pqrs">
      {mensajeMostrado && (
        <div className={`mensaje-api ${mensajeMostrado.toLowerCase().includes("error") ? "error" : "exito"}`}>
          <p>{mensajeMostrado}</p>
          <button
            className="boton-cerrar-mensaje"
            onClick={() => {
              limpiarMensaje();
              setMensajeLocal("");
            }}
          >
            ×
          </button>
        </div>
      )}

      <div className="cabecera-pqrs">
        <div className="titulo-pqrs-con-boton">
          <div>
            <p className="subtitulo-pqrs">
              Administra las peticiones, quejas, reclamos y sugerencias registradas en la plataforma.
            </p>
          </div>

          <button className="boton-nuevo-pqr" onClick={recargarPQRS} disabled={cargando}>
            ↻ Actualizar
          </button>
        </div>

        <div className="resumen-pqrs">
          <div className="tarjeta-resumen-pqrs">
            <span>Total</span>
            <strong>{pqrs.length}</strong>
          </div>
          <div className="tarjeta-resumen-pqrs resumen-pendientes">
            <span>Pendientes</span>
            <strong>{totalPendientes}</strong>
          </div>
          <div className="tarjeta-resumen-pqrs resumen-respondidos">
            <span>Respondidos</span>
            <strong>{totalRespondidos}</strong>
          </div>
        </div>

        <div className="controles-pqrs">
          <div className="buscador-pqrs">
            <input
              type="text"
              placeholder="Buscar por descripción, usuario, tipo, estado o respuesta..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-busqueda-pqrs"
            />
          </div>

          <div className="controles-paginacion-superior">
            <div className="seleccion-elementos-pqrs">
              <span>Mostrar:</span>
              <select
                value={elementosPorPagina}
                onChange={(e) => {
                  setElementosPorPagina(Number(e.target.value));
                  setPaginaActual(1);
                }}
                className="select-elementos-pqrs"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>

            <div className="info-cantidad-pqrs">
              {pqrsFiltrados.length} {pqrsFiltrados.length === 1 ? "registro encontrado" : "registros encontrados"}
            </div>
          </div>
        </div>
      </div>

      <div className="contenedor-tabla-pqrs">
        <table className="tabla-pqrs">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Usuario</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {elementosActuales.map((pqr) => {
              const tipoInfo = getInfoTipoPQR(pqr.id_tipo_pqrs);
              const estadoInfo = getColorEstado(pqr.estado);

              return (
                <tr key={pqr.id_pqr} className="fila-pqr">
                  <td>
                    <div className="badge-id-pqr">#{pqr.id_pqr}</div>
                  </td>

                  <td>
                    <div
                      className="tipo-pqr"
                      style={{
                        backgroundColor: tipoInfo.color || tipoInfo.bg,
                        color: tipoInfo.texto || tipoInfo.color,
                        borderColor: tipoInfo.border,
                      }}
                      title={`Tipo: ${tipoInfo.nombre}`}
                    >
                      {tipoInfo.nombre}
                    </div>
                  </td>

                  <td>
                    <div className="descripcion-pqr" title={pqr.descripcion}>
                      {pqr.descripcion?.length > 85
                        ? `${pqr.descripcion.substring(0, 85)}...`
                        : pqr.descripcion || "Sin descripción"}
                    </div>
                  </td>

                  <td>
                    <div className="usuario-info-pqr">
                      <div className="nombre-usuario-pqr" title={obtenerNombreUsuario(pqr.id_usuario)}>
                        {obtenerNombreUsuario(pqr.id_usuario)}
                      </div>
                      <div className="id-usuario-pqr">ID: {pqr.id_usuario || "N/A"}</div>
                    </div>
                  </td>

                  <td>
                    <div
                      className="estado-pqr"
                      style={{
                        backgroundColor: estadoInfo.bg,
                        color: estadoInfo.color,
                        borderColor: estadoInfo.border,
                      }}
                    >
                      {estadoInfo.texto}
                    </div>
                  </td>

                  <td>
                    <div className="fecha-info-pqr">{formatearFecha(pqr.fecha_pqrs)}</div>
                  </td>

                  <td>
                    <div className="botones-acciones-pqr">
                      <button
                        className="boton-ver-pqr"
                        onClick={() => handleVerDetalles(pqr)}
                        disabled={cargandoDetalles}
                      >
                        Ver
                      </button>

                      <button
                        className="boton-responder-pqr"
                        onClick={() => handleResponderPQR(pqr)}
                        disabled={(pqr.estado || "").toLowerCase() === "respondido" || cargando}
                      >
                        Responder
                      </button>

                      <button
                        className="boton-eliminar-pqr"
                        onClick={() => handleEliminarPQR(pqr)}
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

      {mostrarModalDetalles && (
        <div className="modal-fondo-pqrs" onClick={cerrarModalDetalles}>
          <div className="modal-contenido-pqrs modal-detalles" onClick={(e) => e.stopPropagation()}>
            <div className="modal-cabecera-pqrs">
              <h2>Detalles del PQR #{pqrDetallado?.id_pqr}</h2>
              <button className="modal-cerrar-pqrs" onClick={cerrarModalDetalles}>
                ×
              </button>
            </div>

            <div className="modal-cuerpo-pqrs">
              {cargandoDetalles ? (
                <div className="estado-carga">
                  <div className="spinner"></div>
                  <p>Cargando detalles del PQR...</p>
                </div>
              ) : pqrDetallado ? (
                <div className="detalles-simple-pqrs">
                  <div className="detalle-grupo-pqrs">
                    <h3>Información básica</h3>

                    <div className="detalle-fila-pqrs">
                      <span className="detalle-etiqueta">ID PQR:</span>
                      <span className="detalle-valor">#{pqrDetallado.id_pqr}</span>
                    </div>

                    <div className="detalle-fila-pqrs">
                      <span className="detalle-etiqueta">Usuario:</span>
                      <span className="detalle-valor">
                        {obtenerNombreUsuario(pqrDetallado.id_usuario)} (ID: {pqrDetallado.id_usuario || "N/A"})
                      </span>
                    </div>

                    <div className="detalle-fila-pqrs">
                      <span className="detalle-etiqueta">Fecha:</span>
                      <span className="detalle-valor">{formatearFecha(pqrDetallado.fecha_pqrs)}</span>
                    </div>

                    <div className="detalle-fila-pqrs">
                      <span className="detalle-etiqueta">Tipo:</span>
                      <span className="detalle-valor">
                        <span
                          className="badge-tipo-detalle"
                          style={{
                            backgroundColor: getInfoTipoPQR(pqrDetallado.id_tipo_pqrs).color,
                            color: getInfoTipoPQR(pqrDetallado.id_tipo_pqrs).texto,
                          }}
                        >
                          {getInfoTipoPQR(pqrDetallado.id_tipo_pqrs).nombre}
                        </span>
                      </span>
                    </div>

                    <div className="detalle-fila-pqrs">
                      <span className="detalle-etiqueta">Estado:</span>
                      <span className="detalle-valor">
                        <span
                          className="badge-estado-detalle"
                          style={{
                            backgroundColor: getColorEstado(pqrDetallado.estado).bg,
                            color: getColorEstado(pqrDetallado.estado).color,
                          }}
                        >
                          {getColorEstado(pqrDetallado.estado).texto}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="detalle-grupo-pqrs">
                    <h3>Descripción completa</h3>
                    <div className="detalle-descripcion-completa">
                      {pqrDetallado.descripcion || "No hay descripción disponible"}
                    </div>
                  </div>

                  {pqrDetallado.respuesta && (
                    <div className="detalle-grupo-pqrs">
                      <h3>Respuesta del administrador</h3>
                      <div className="detalle-respuesta-pqrs">
                        <div className="respuesta-contenido">{pqrDetallado.respuesta}</div>
                        {pqrDetallado.fecha_respuesta && (
                          <div className="respuesta-fecha">
                            <strong>Fecha de respuesta:</strong> {formatearFecha(pqrDetallado.fecha_respuesta)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="estado-error">
                  <p>No se pudieron cargar los detalles del PQR.</p>
                </div>
              )}
            </div>

            <div className="modal-pie-pqrs">
              <button className="boton-cerrar-detalles-pqrs" onClick={cerrarModalDetalles}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalResponder && (
        <div className="modal-fondo-pqrs">
          <div className="modal-contenido-pqrs modal-responder" onClick={(e) => e.stopPropagation()}>
            <div className="modal-cabecera-pqrs">
              <h2>Responder PQR #{pqrAResponder?.id_pqr}</h2>
              <button className="modal-cerrar-pqrs" onClick={cerrarModalResponder}>
                ×
              </button>
            </div>

            <div className="modal-cuerpo-pqrs">
              <div className="info-pqr-responder">
                <div className="info-linea-responder">
                  <strong>Tipo:</strong> {getInfoTipoPQR(pqrAResponder?.id_tipo_pqrs).nombre}
                </div>
                <div className="info-linea-responder">
                  <strong>Usuario:</strong> {obtenerNombreUsuario(pqrAResponder?.id_usuario)} (ID: {pqrAResponder?.id_usuario})
                </div>
                <div className="info-linea-responder">
                  <strong>Fecha de creación:</strong> {formatearFecha(pqrAResponder?.fecha_pqrs)}
                </div>
                <div className="info-linea-responder">
                  <strong>Descripción:</strong>
                  <div className="descripcion-pqr-responder">{pqrAResponder?.descripcion}</div>
                </div>
              </div>

              <div className="formulario-respuesta-pqrs">
                <label htmlFor="respuesta-pqr">Respuesta:</label>
                <textarea
                  id="respuesta-pqr"
                  value={respuesta}
                  onChange={(e) => setRespuesta(e.target.value)}
                  placeholder="Escribe tu respuesta aquí..."
                  rows={8}
                  className="textarea-respuesta-pqrs"
                  disabled={cargandoRespuesta}
                />
                <div className="contador-caracteres">{respuesta.length} caracteres</div>
              </div>

              <div className="advertencia-responder-pqrs">
                <span className="icono-advertencia">ℹ️</span>
                <span>
                  Una vez enviada la respuesta, el estado del PQR cambiará a “Respondido”.
                </span>
              </div>
            </div>

            <div className="modal-pie-pqrs">
              <button className="boton-cancelar-pqrs" onClick={cerrarModalResponder} disabled={cargandoRespuesta}>
                Cancelar
              </button>
              <button
                className="boton-responder-confirmar-pqrs"
                onClick={enviarRespuesta}
                disabled={cargandoRespuesta || !respuesta.trim()}
              >
                {cargandoRespuesta ? "Enviando..." : "Enviar respuesta"}
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarConfirmacionEliminar && (
        <div className="modal-fondo-pqrs">
          <div className="modal-contenido-pqrs modal-confirmacion">
            <div className="modal-cabecera-pqrs">
              <h2>Confirmar eliminación</h2>
              <button className="modal-cerrar-pqrs" onClick={cerrarModalEliminar}>
                ×
              </button>
            </div>

            <div className="modal-cuerpo-pqrs">
              <p>¿Estás seguro de que deseas eliminar este PQR?</p>

              <div className="pqr-a-eliminar-detalle">
                <div className="pqr-eliminar-header">
                  <span className="pqr-id">PQR #{pqrAEliminar?.id_pqr}</span>
                  <span
                    className="pqr-tipo"
                    style={{
                      backgroundColor: pqrAEliminar?.id_tipo_pqrs
                        ? getInfoTipoPQR(pqrAEliminar.id_tipo_pqrs).color
                        : "#f5f5f5",
                      color: pqrAEliminar?.id_tipo_pqrs
                        ? getInfoTipoPQR(pqrAEliminar.id_tipo_pqrs).texto
                        : "#616161",
                    }}
                  >
                    {pqrAEliminar?.id_tipo_pqrs
                      ? getInfoTipoPQR(pqrAEliminar.id_tipo_pqrs).nombre
                      : "General"}
                  </span>

                  <span
                    className="pqr-estado"
                    style={{
                      backgroundColor: getColorEstado(pqrAEliminar?.estado).bg,
                      color: getColorEstado(pqrAEliminar?.estado).color,
                    }}
                  >
                    {getColorEstado(pqrAEliminar?.estado).texto}
                  </span>
                </div>

                <div className="pqr-eliminar-info">
                  <div className="info-linea">
                    <strong>Usuario:</strong> {obtenerNombreUsuario(pqrAEliminar?.id_usuario)}
                  </div>
                  <div className="info-linea">
                    <strong>ID Usuario:</strong> {pqrAEliminar?.id_usuario}
                  </div>
                  <div className="info-linea">
                    <strong>Fecha:</strong> {formatearFecha(pqrAEliminar?.fecha_pqrs)}
                  </div>
                  <div className="info-linea descripcion-resumen">
                    <strong>Descripción:</strong>
                    <div className="descripcion-texto">
                      {pqrAEliminar?.descripcion?.substring(0, 150) || "Sin descripción"}
                      {pqrAEliminar?.descripcion?.length > 150 ? "..." : ""}
                    </div>
                  </div>
                </div>
              </div>

              <div className="advertencia-eliminar-pqrs">
                <span className="icono-advertencia">⚠️</span>
                <span>Esta acción no se puede deshacer.</span>
              </div>
            </div>

            <div className="modal-pie-pqrs">
              <button className="boton-cancelar-pqrs" onClick={cerrarModalEliminar} disabled={cargando}>
                Cancelar
              </button>
              <button
                className="boton-eliminar-confirmar-pqrs"
                onClick={confirmarEliminarPQR}
                disabled={cargando}
              >
                {cargando ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {totalPaginas > 1 && (
        <div className="paginador-pqrs">
          <div className="info-paginacion-pqrs">
            Mostrando {indicePrimerElemento + 1} - {Math.min(indiceUltimoElemento, pqrsFiltrados.length)} de {pqrsFiltrados.length} PQRS
          </div>

          <div className="controles-navegacion-pqrs">
            <button
              onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
              disabled={paginaActual === 1}
              className="boton-paginador-pqrs"
            >
              ← Anterior
            </button>

            <div className="numeros-pagina-pqrs">
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
                    className={`numero-pagina-pqrs ${paginaActual === numeroPagina ? "activa" : ""}`}
                  >
                    {numeroPagina}
                  </button>
                );
              })}

              {totalPaginas > 5 && paginaActual < totalPaginas - 2 && (
                <>
                  <span className="puntos-suspensivos-pqrs">...</span>
                  <button
                    onClick={() => setPaginaActual(totalPaginas)}
                    className={`numero-pagina-pqrs ${paginaActual === totalPaginas ? "activa" : ""}`}
                  >
                    {totalPaginas}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}
              disabled={paginaActual === totalPaginas}
              className="boton-paginador-pqrs"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PQRS;