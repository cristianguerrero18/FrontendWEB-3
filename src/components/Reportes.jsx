import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useReportes } from "../hooks/useReportes.js";
import "../css/Principal.css";
import "../css/Reportes.css";

const Reportes = ({ idRecursoFiltro = null }) => {
  const {
    reportes,
    cargando,
    mensaje,
    recargarReportes,
    eliminarReporte,
    cargarReporteCompleto,
    cargarUsuario,
    limpiarMensaje,
  } = useReportes(idRecursoFiltro);

  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(10);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] =
    useState(false);
  const [reporteAEliminar, setReporteAEliminar] = useState(null);
  const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);
  const [reporteDetallado, setReporteDetallado] = useState(null);
  const [cargandoDetalles, setCargandoDetalles] = useState(false);
  const [usuariosCache, setUsuariosCache] = useState({});
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);

  // Limpiar mensaje después de 5 segundos
  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => {
        limpiarMensaje();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje, limpiarMensaje]);

  // Cargar usuarios para los reportes visibles
  useEffect(() => {
    const cargarUsuarios = async () => {
      if (!reportes.length || cargandoUsuarios) return;

      setCargandoUsuarios(true);
      const nuevosUsuarios = { ...usuariosCache };
      let cambios = false;

      // Solo cargar usuarios para reportes que no tienen usuario en cache
      for (const reporte of reportes) {
        if (
          reporte.id_reporte &&
          reporte.id_usuario &&
          !usuariosCache[reporte.id_reporte]
        ) {
          try {
            // Si el reporte ya trae id_usuario, usarlo directamente
            if (reporte.id_usuario) {
              const usuario = await cargarUsuario(reporte.id_usuario);
              if (usuario) {
                nuevosUsuarios[reporte.id_reporte] = {
                  id_usuario: reporte.id_usuario,
                  nombres_usuario: usuario.nombres_usuario,
                  apellidos_usuario: usuario.apellidos_usuario,
                  nombreCompleto:
                    `${usuario.nombres_usuario || ""} ${
                      usuario.apellidos_usuario || ""
                    }`.trim() || `Usuario #${reporte.id_usuario}`,
                };
                cambios = true;
              }
            }
          } catch (error) {
            console.error(
              `Error cargando usuario para reporte ${reporte.id_reporte}:`,
              error
            );
            nuevosUsuarios[reporte.id_reporte] = {
              id_usuario: reporte.id_usuario,
              nombreCompleto: `Usuario #${reporte.id_usuario}`,
            };
            cambios = true;
          }
        }
      }

      if (cambios) {
        setUsuariosCache(nuevosUsuarios);
      }

      setCargandoUsuarios(false);
    };

    cargarUsuarios();
  }, [reportes]); // Solo se ejecuta cuando cambian los reportes

  // Filtrar reportes por búsqueda
  const reportesFiltrados = useMemo(() => {
    if (!reportes.length) return [];

    const textoBusqueda = busqueda.toLowerCase();

    return reportes.filter((reporte) => {
      if (!reporte) return false;

      const usuarioInfo = usuariosCache[reporte.id_reporte];
      const nombreUsuario = usuarioInfo?.nombreCompleto || "";

      return (
        (reporte.motivo &&
          reporte.motivo.toLowerCase().includes(textoBusqueda)) ||
        (reporte.id_recurso &&
          reporte.id_recurso.toString().includes(textoBusqueda)) ||
        (reporte.id_usuario &&
          reporte.id_usuario.toString().includes(textoBusqueda)) ||
        nombreUsuario.toLowerCase().includes(textoBusqueda)
      );
    });
  }, [reportes, busqueda, usuariosCache]);

  // Calcular elementos para la página actual
  const indiceUltimoElemento = paginaActual * elementosPorPagina;
  const indicePrimerElemento = indiceUltimoElemento - elementosPorPagina;
  const elementosActuales = reportesFiltrados.slice(
    indicePrimerElemento,
    indiceUltimoElemento
  );
  const totalPaginas = Math.ceil(reportesFiltrados.length / elementosPorPagina);

  // Función para ver detalles del reporte - CORREGIDA para traer fecha_reporte
  const handleVerDetalles = useCallback(
    async (id_reporte) => {
      if (!id_reporte) return;

      setCargandoDetalles(true);
      try {
        // Cargar el reporte completo
        const reporteCompleto = await cargarReporteCompleto(id_reporte);

        if (reporteCompleto) {
          // Si el reporte completo no tiene fecha_reporte, buscarla en los reportes normales
          if (!reporteCompleto.fecha_reporte) {
            const reporteOriginal = reportes.find(
              (r) => r.id_reporte === id_reporte
            );
            if (reporteOriginal && reporteOriginal.fecha_reporte) {
              reporteCompleto.fecha_reporte = reporteOriginal.fecha_reporte;
            }
          }

          setReporteDetallado(reporteCompleto);
          setMostrarModalDetalles(true);
        }
      } catch (error) {
        console.error("Error cargando detalles:", error);
      } finally {
        setCargandoDetalles(false);
      }
    },
    [cargarReporteCompleto, reportes]
  );

  // Función para eliminar reporte
  const handleEliminarReporte = useCallback((reporte) => {
    if (!reporte) return;
    setReporteAEliminar(reporte);
    setMostrarConfirmacionEliminar(true);
  }, []);

  const confirmarEliminarReporte = useCallback(async () => {
    if (reporteAEliminar && reporteAEliminar.id_reporte) {
      await eliminarReporte(reporteAEliminar.id_reporte);
      setMostrarConfirmacionEliminar(false);
      setReporteAEliminar(null);
    }
  }, [reporteAEliminar, eliminarReporte]);

  // Formatear fecha - MEJORADA
  const formatearFecha = useCallback((fechaString) => {
    if (!fechaString) return "Fecha no disponible";
    try {
      const fecha = new Date(fechaString);
      if (isNaN(fecha.getTime())) return "Fecha inválida";

      // Formato mejorado
      const opciones = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };

      return fecha.toLocaleDateString("es-ES", opciones);
    } catch (error) {
      console.error("Error formateando fecha:", fechaString, error);
      return "Fecha inválida";
    }
  }, []);

  // Resetear paginación cuando cambia la búsqueda
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  if (cargando && !reportes.length)
    return (
      <div className="estado-carga">
        <div className="spinner-grande"></div>
        <p>Cargando reportes...</p>
      </div>
    );

  if (!reportes.length && !cargando)
    return (
      <div className="estado-inicial">
        <h2>No hay reportes disponibles</h2>
        <p>
          {idRecursoFiltro
            ? "Este recurso no tiene reportes."
            : "No se encontraron reportes en el sistema."}
        </p>
      </div>
    );

  return (
    <div className="contenedor-reportes">
      {mensaje && (
        <div
          className={`mensaje-api ${
            mensaje.includes("Error") ? "error" : "exito"
          }`}
        >
          <p>{mensaje}</p>
          <button className="boton-cerrar-mensaje" onClick={limpiarMensaje}>
            ×
          </button>
        </div>
      )}

      <div className="cabecera-reportes">
        <div className="titulo-reportes-con-boton">
          <div>
            <h2>Gestión de Reportes</h2>
            <p className="subtitulo-reportes">
              {idRecursoFiltro
                ? `Reportes del recurso #${idRecursoFiltro}`
                : "Administra los reportes del sistema"}
            </p>
          </div>
          <button
            className="boton-nuevo-reporte"
            onClick={recargarReportes}
            disabled={cargando}
          >
            ↻ Actualizar
          </button>
        </div>

        <div className="controles-reportes">
          <div className="buscador-reportes">
            <input
              type="text"
              placeholder="Buscar por motivo, ID recurso o usuario..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-busqueda-reportes"
            />
          </div>

          <div className="controles-paginacion-superior">
            <div className="seleccion-elementos-reportes">
              <span>Mostrar:</span>
              <select
                value={elementosPorPagina}
                onChange={(e) => {
                  setElementosPorPagina(Number(e.target.value));
                  setPaginaActual(1);
                }}
                className="select-elementos-reportes"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>

            <div className="info-cantidad-reportes">
              {reportesFiltrados.length}{" "}
              {reportesFiltrados.length === 1
                ? "reporte encontrado"
                : "reportes encontrados"}
              {cargandoUsuarios && " (Cargando usuarios...)"}
            </div>
          </div>
        </div>
      </div>

      <div className="contenedor-tabla-reportes">
        <table className="tabla-reportes">
          <thead>
            <tr>
              <th className="columna-id-reporte">ID</th>
              <th className="columna-recurso-reporte">Recurso</th>
              <th className="columna-motivo-reporte">Motivo</th>
              <th className="columna-usuario-reporte">Reportado por</th>
              <th className="columna-fecha-reporte">Fecha</th>
              <th className="columna-acciones-reporte">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {elementosActuales.map((reporte) => {
              if (!reporte) return null;

              const usuarioInfo = usuariosCache[reporte.id_reporte];

              return (
                <tr key={reporte.id_reporte} className="fila-reporte">
                  <td className="celda-id-reporte">
                    <div className="badge-id-reporte">
                      #{reporte.id_reporte}
                    </div>
                  </td>
                  <td className="celda-recurso-reporte">
                    <div className="info-recurso">
                      <div className="id-recurso">
                        Recurso #{reporte.id_recurso}
                      </div>
                    </div>
                  </td>
                  <td className="celda-motivo-reporte">
                    <div className="motivo-reporte" title={reporte.motivo}>
                      {reporte.motivo.length > 50
                        ? reporte.motivo.substring(0, 50) + "..."
                        : reporte.motivo}
                    </div>
                  </td>
                  <td className="celda-usuario-reporte">
                    <div className="usuario-info">
                      <div className="nombre-usuario">
                        {usuarioInfo?.nombreCompleto ||
                          (reporte.id_usuario
                            ? `Usuario #${reporte.id_usuario}`
                            : "Cargando...")}
                      </div>
                      <div className="id-usuario">
                        {reporte.id_usuario
                          ? `(ID: ${reporte.id_usuario})`
                          : ""}
                      </div>
                    </div>
                  </td>
                  <td className="celda-fecha-reporte">
                    <div className="fecha-info">
                      {formatearFecha(reporte.fecha_reporte)}
                    </div>
                  </td>
                  <td className="celda-acciones-reporte">
                    <div className="botones-acciones-reporte">
                      <button
                        className="boton-ver-reporte"
                        onClick={() => handleVerDetalles(reporte.id_reporte)}
                        title="Ver detalles completos"
                        disabled={cargandoDetalles}
                      >
                        {cargandoDetalles ? "Cargando..." : "Ver"}
                      </button>
                      <button
                        className="boton-eliminar-reporte"
                        onClick={() => handleEliminarReporte(reporte)}
                        title="Eliminar reporte"
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

      {/* Modal de detalles del reporte - CORREGIDO */}
      {/* Modal de detalles del reporte */}
      {mostrarModalDetalles && reporteDetallado && (
        <div className="modal-fondo-reportes">
          <div className="modal-contenido-reportes modal-detalles">
            <div className="modal-cabecera-reportes">
              <h2>Detalles del Reporte #{reporteDetallado.id_reporte}</h2>
              <button
                className="modal-cerrar-reportes"
                onClick={() => {
                  setMostrarModalDetalles(false);
                  setReporteDetallado(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="modal-cuerpo-reportes">
              <div className="detalles-grid">
                <div className="detalle-seccion">
                  <h3>Información del Reporte</h3>
                  <div className="detalle-item">
                    <strong>ID Reporte:</strong>
                    <span>{reporteDetallado.id_reporte}</span>
                  </div>
                  <div className="detalle-item">
                    <strong>Motivo:</strong>
                    <span>{reporteDetallado.motivo || "No especificado"}</span>
                  </div>
                  <div className="detalle-item">
                    <strong>Fecha del Reporte:</strong>
                    <span>
                      {formatearFecha(reporteDetallado.fecha_reporte)}
                    </span>
                  </div>
                </div>

                <div className="detalle-seccion">
                  <h3>Información del Recurso</h3>
                  <div className="detalle-item">
                    <strong>ID Recurso:</strong>
                    <span>{reporteDetallado.id_recurso}</span>
                  </div>
                  <div className="detalle-item">
                    <strong>Título:</strong>
                    <span>{reporteDetallado.titulo || "No disponible"}</span>
                  </div>
                  <div className="detalle-item">
                    <strong>Tema:</strong>
                    <span>{reporteDetallado.tema || "No disponible"}</span>
                  </div>
                  <div className="detalle-item">
                    <strong>Asignatura ID:</strong>
                    <span>{reporteDetallado.id_asignatura || "N/A"}</span>
                  </div>
                  <div className="detalle-item">
                    <strong>Categoría ID:</strong>
                    <span>{reporteDetallado.id_categoria || "N/A"}</span>
                  </div>
                  <div className="detalle-item">
                    <strong>Fecha de Subida:</strong>
                    <span>{formatearFecha(reporteDetallado.fecha_subida)}</span>
                  </div>
                  <div className="detalle-item">
                    <strong>URL:</strong>
                    <span>
                      {reporteDetallado.URL ? (
                        <a
                          href={reporteDetallado.URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="enlace-recurso"
                        >
                          Ver recurso
                        </a>
                      ) : (
                        "No disponible"
                      )}
                    </span>
                  </div>
                  <div className="detalle-item">
                    <strong>Total de Reportes:</strong>
                    <span>{reporteDetallado.contador_reportes || 0}</span>
                  </div>
                </div>

                <div className="detalle-seccion">
                  <h3>Información del Usuario</h3>
                  <div className="detalle-item">
                    <strong>ID Usuario:</strong>
                    <span>{reporteDetallado.id_usuario || "N/A"}</span>
                  </div>
                  <div className="detalle-item">
                    <strong>Nombre:</strong>
                    <span>
                      {(reporteDetallado.nombres_usuario || "") +
                        " " +
                        (reporteDetallado.apellidos_usuario || "") ||
                        "No disponible"}
                    </span>
                  </div>
                  <div className="detalle-item">
                    <strong>Correo:</strong>
                    <span>{reporteDetallado.correo || "No disponible"}</span>
                  </div>
                  <div className="detalle-item">
                    <strong>Carrera ID:</strong>
                    <span>{reporteDetallado.id_carrera || "N/A"}</span>
                  </div>
                  <div className="detalle-item">
                    <strong>Rol ID:</strong>
                    <span>{reporteDetallado.id_rol || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-pie-reportes">
              <button
                className="boton-cerrar-detalles"
                onClick={() => {
                  setMostrarModalDetalles(false);
                  setReporteDetallado(null);
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {mostrarConfirmacionEliminar && (
        <div className="modal-fondo-reportes">
          <div className="modal-contenido-reportes modal-confirmacion">
            <div className="modal-cabecera-reportes">
              <h2>Confirmar Eliminación</h2>
              <button
                className="modal-cerrar-reportes"
                onClick={() => setMostrarConfirmacionEliminar(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-cuerpo-reportes">
              <p>¿Estás seguro de que deseas eliminar el reporte:</p>
              <div className="reporte-a-eliminar">
                Reporte #{reporteAEliminar?.id_reporte}
              </div>

              <div className="info-eliminar-detalle">
                <p>
                  <strong>Recurso:</strong> #{reporteAEliminar?.id_recurso}
                </p>
                <p>
                  <strong>Motivo:</strong>{" "}
                  {reporteAEliminar?.motivo?.substring(0, 100)}...
                </p>
                <p>
                  <strong>Fecha:</strong>{" "}
                  {formatearFecha(reporteAEliminar?.fecha_reporte)}
                </p>
              </div>

              <p className="advertencia-eliminar">
                ⚠️ Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="modal-pie-reportes">
              <button
                className="boton-cancelar-reportes"
                onClick={() => {
                  setMostrarConfirmacionEliminar(false);
                  setReporteAEliminar(null);
                }}
                disabled={cargando}
              >
                Cancelar
              </button>
              <button
                className="boton-eliminar-confirmar"
                onClick={confirmarEliminarReporte}
                disabled={cargando}
              >
                {cargando ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paginador */}
      {totalPaginas > 1 && (
        <div className="paginador-reportes">
          <div className="info-paginacion-reportes">
            Mostrando {indicePrimerElemento + 1} -{" "}
            {Math.min(indiceUltimoElemento, reportesFiltrados.length)} de{" "}
            {reportesFiltrados.length} reportes
          </div>

          <div className="controles-navegacion-reportes">
            <button
              onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
              disabled={paginaActual === 1}
              className="boton-paginador-reportes boton-anterior-reportes"
            >
              ← Anterior
            </button>

            <div className="numeros-pagina-reportes">
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
                    className={`numero-pagina-reportes ${
                      paginaActual === numeroPagina ? "activa" : ""
                    }`}
                  >
                    {numeroPagina}
                  </button>
                );
              })}

              {totalPaginas > 5 && paginaActual < totalPaginas - 2 && (
                <>
                  <span className="puntos-suspensivos-reportes">...</span>
                  <button
                    onClick={() => setPaginaActual(totalPaginas)}
                    className={`numero-pagina-reportes ${
                      paginaActual === totalPaginas ? "activa" : ""
                    }`}
                  >
                    {totalPaginas}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() =>
                setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))
              }
              disabled={paginaActual === totalPaginas}
              className="boton-paginador-reportes boton-siguiente-reportes"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reportes;
