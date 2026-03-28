import React, { useState, useEffect, useCallback, useMemo } from "react";
import { usePQRSStudent } from "../../hooks/usePQRSStudent.js";
import { useUser } from "../../context/UserContext.jsx";
import "../../css/PQRS.css";
import "../../css/PQRSudent.css";
import {
  MessageCircle,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  RefreshCw,
  User,
} from "lucide-react";

const TIPOS_PQRS = {
  1: {
    nombre: "Petición",
    color: "#e3f2fd",
    texto: "#1976d2",
    border: "#bbdefb",
    icon: FileText,
  },
  2: {
    nombre: "Queja",
    color: "#fff3e0",
    texto: "#f57c00",
    border: "#ffe0b2",
    icon: AlertCircle,
  },
  3: {
    nombre: "Reclamo",
    color: "#ffebee",
    texto: "#d32f2f",
    border: "#ffcdd2",
    icon: AlertCircle,
  },
  4: {
    nombre: "Sugerencia",
    color: "#e8f5e9",
    texto: "#388e3c",
    border: "#c8e6c9",
    icon: MessageCircle,
  },
};

const PQRSStudent = () => {
  const { userData, loading: userLoading } = useUser();
  const {
    pqrs,
    cargando,
    cargandoCrear,
    mensaje,
    recargarPQRS,
    crearPQRS,
    limpiarMensaje,
    getIdUsuario,
  } = usePQRSStudent();

  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(10);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [descripcionNueva, setDescripcionNueva] = useState("");
  const [tipoNuevo, setTipoNuevo] = useState("1");
  const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);
  const [pqrDetallado, setPqrDetallado] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => {
        limpiarMensaje();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje, limpiarMensaje]);

  const pqrsFiltrados = useMemo(() => {
    if (!pqrs || !Array.isArray(pqrs)) return [];

    const textoBusqueda = busqueda.toLowerCase().trim();

    return pqrs.filter((pqr) => {
      if (!pqr) return false;

      const tipoNombre = TIPOS_PQRS[pqr.id_tipo_pqrs]?.nombre || "General";
      const estado = pqr.estado || "Pendiente";

      return (
        (pqr.descripcion &&
          pqr.descripcion.toLowerCase().includes(textoBusqueda)) ||
        (pqr.id_pqr && pqr.id_pqr.toString().includes(textoBusqueda)) ||
        tipoNombre.toLowerCase().includes(textoBusqueda) ||
        estado.toLowerCase().includes(textoBusqueda) ||
        (pqr.respuesta && pqr.respuesta.toLowerCase().includes(textoBusqueda))
      );
    });
  }, [pqrs, busqueda]);

  const indiceUltimoElemento = paginaActual * elementosPorPagina;
  const indicePrimerElemento = indiceUltimoElemento - elementosPorPagina;
  const elementosActuales = pqrsFiltrados.slice(
    indicePrimerElemento,
    indiceUltimoElemento
  );
  const totalPaginas = Math.ceil(pqrsFiltrados.length / elementosPorPagina);

  const totalPendientes = useMemo(() => {
    if (!Array.isArray(pqrs)) return 0;
    return pqrs.filter(
      (item) => (item?.estado || "").toLowerCase() !== "respondido"
    ).length;
  }, [pqrs]);

  const totalRespondidos = useMemo(() => {
    if (!Array.isArray(pqrs)) return 0;
    return pqrs.filter(
      (item) => (item?.estado || "").toLowerCase() === "respondido"
    ).length;
  }, [pqrs]);

  const handleVerDetalles = useCallback((pqr) => {
    if (!pqr) return;
    setPqrDetallado(pqr);
    setMostrarModalDetalles(true);
  }, []);

  const cerrarModalDetalles = useCallback(() => {
    setMostrarModalDetalles(false);
    setPqrDetallado(null);
  }, []);

  const cerrarModalCrear = useCallback(() => {
    setMostrarModalCrear(false);
    setDescripcionNueva("");
    setTipoNuevo("1");
  }, []);

  const handleCrearPQR = useCallback(async () => {
    if (!descripcionNueva.trim()) {
      console.error("❌ Descripción vacía");
      setDebugInfo((prev) => ({ ...prev, error: "Descripción vacía" }));
      return;
    }

    if (descripcionNueva.trim().length < 5) {
      console.error("❌ Descripción muy corta");
      setDebugInfo((prev) => ({ ...prev, error: "Descripción muy corta" }));
      return;
    }

    console.log("🔄 Iniciando creación de PQR...");
    console.log("Datos del usuario:", userData);

    setDebugInfo({
      accion: "creando",
      tiempo: new Date().toISOString(),
      usuario: userData,
      usuarioId: getIdUsuario(),
      descripcion: descripcionNueva,
      tipo: tipoNuevo,
    });

    const resultado = await crearPQRS(descripcionNueva, tipoNuevo);

    console.log("📊 Resultado de crearPQR:", resultado);

    if (!resultado.error) {
      console.log("✅ PQR creado exitosamente");
      cerrarModalCrear();
      setDebugInfo({
        accion: "creado",
        tiempo: new Date().toISOString(),
        resultado: resultado,
      });
    } else {
      console.error("❌ Error al crear PQR:", resultado.mensaje);
      setDebugInfo({
        accion: "error",
        tiempo: new Date().toISOString(),
        error: resultado,
      });
    }
  }, [
    descripcionNueva,
    tipoNuevo,
    crearPQRS,
    userData,
    getIdUsuario,
    cerrarModalCrear,
  ]);

  const formatearFecha = useCallback((fechaString) => {
    if (!fechaString) return "No aplica";
    try {
      const fecha = new Date(fechaString);
      if (isNaN(fecha.getTime())) return "Fecha inválida";

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

  const getInfoTipoPQR = useCallback((idTipo) => {
    const tipoInfo = TIPOS_PQRS[idTipo];

    if (tipoInfo) {
      return {
        nombre: tipoInfo.nombre,
        bg: tipoInfo.color,
        color: tipoInfo.texto,
        border: tipoInfo.border,
        icon: tipoInfo.icon,
      };
    }

    return {
      nombre: "General",
      bg: "#f5f5f5",
      color: "#616161",
      border: "#e0e0e0",
      icon: FileText,
    };
  }, []);

  const getColorEstado = useCallback((estado) => {
    const estadoLower = estado?.toLowerCase() || "pendiente";

    switch (estadoLower) {
      case "respondido":
        return {
          bg: "#e8f5e9",
          color: "#388e3c",
          border: "#c8e6c9",
          texto: "Respondido",
          icon: CheckCircle,
        };
      case "pendiente":
        return {
          bg: "#fff3e0",
          color: "#f57c00",
          border: "#ffe0b2",
          texto: "Pendiente",
          icon: Clock,
        };
      default:
        return {
          bg: "#f5f5f5",
          color: "#616161",
          border: "#e0e0e0",
          texto: estado || "Pendiente",
          icon: Clock,
        };
    }
  }, []);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, elementosPorPagina]);

  const handleDebug = () => {
    console.log("=== DEBUG INFO ===");
    console.log("Contexto User:", userData);
    console.log("User Loading:", userLoading);
    console.log("ID Usuario desde hook:", getIdUsuario());
    console.log("PQRS:", pqrs);
    console.log("Mensaje:", mensaje);
    console.log("Debug Info:", debugInfo);
    console.log("LocalStorage userData:", localStorage.getItem("userData"));
    console.log("LocalStorage token:", localStorage.getItem("token"));
    console.log("SessionStorage userData:", sessionStorage.getItem("userData"));
    console.log("==================");
  };

  if (userLoading) {
    return (
      <div className="estado-carga">
        <div className="spinner-grande"></div>
        <p>Cargando información del usuario...</p>
      </div>
    );
  }

  if (!userData && !userLoading) {
    return (
      <div className="estado-inicial-pqrs estado-estudiante">
        <div className="icono-estado-inicial">
          <User size={64} />
        </div>
        <h2>Usuario no identificado</h2>
        <p>Por favor, inicia sesión para acceder a tus PQRS.</p>
        <button
          className="boton-nuevo-pqr"
          onClick={() => {
            console.log("Redirigiendo a login...");
            window.location.href = "/login";
          }}
        >
          Ir al Login
        </button>

        <div className="contenedor-debug-inicial">
          <button className="boton-debug-pqrs" onClick={handleDebug}>
            Ver Info Debug
          </button>
        </div>
      </div>
    );
  }

  if (cargando && !pqrs) {
    return (
      <div className="estado-carga">
        <div className="spinner-grande"></div>
        <p>Cargando tus PQRS...</p>
        <small>
          Usuario: {userData?.nombres_usuario} {userData?.apellidos_usuario}
        </small>
      </div>
    );
  }

  return (
    <div className="contenedor-pqrs pqrs-student-panel">
      <button className="boton-debug-flotante-pqrs" onClick={handleDebug}>
        Debug
      </button>

      {mensaje && (
        <div
          className={`mensaje-api ${
            mensaje.includes("Error") ? "error" : "exito"
          }`}
        >
          <div className="mensaje-api-contenido">
            <div>
              <p className="mensaje-api-titulo">
                {mensaje.includes("Error") ? "⚠️ Advertencia" : "✅ Éxito"}
              </p>
              <p className="mensaje-api-texto">{mensaje}</p>
            </div>
            <button className="boton-cerrar-mensaje" onClick={limpiarMensaje}>
              ×
            </button>
          </div>
        </div>
      )}

      <div className="cabecera-pqrs cabecera-pqrs-student">
        <div className="encabezado-student-pqrs">
          <div>
            <p className="subtitulo-student-pqrs">
              Consulta el estado de tus solicitudes y registra nuevas peticiones,
              quejas, reclamos o sugerencias.
            </p>
          </div>

          <div className="botones-acciones-superiores">
            <button
              className="boton-nuevo-pqr"
              onClick={() => setMostrarModalCrear(true)}
              disabled={cargandoCrear}
            >
              <Plus size={20} />
              Crear PQR
            </button>
            <button
              className="boton-actualizar-pqr"
              onClick={recargarPQRS}
              disabled={cargando}
            >
              <RefreshCw size={20} />
              Actualizar
            </button>
          </div>
        </div>

        <div className="resumen-pqrs-student">
          <div className="tarjeta-resumen-student">
            <span>Total</span>
            <strong>{Array.isArray(pqrs) ? pqrs.length : 0}</strong>
          </div>
          <div className="tarjeta-resumen-student pendientes">
            <span>Pendientes</span>
            <strong>{totalPendientes}</strong>
          </div>
          <div className="tarjeta-resumen-student respondidos">
            <span>Respondidos</span>
            <strong>{totalRespondidos}</strong>
          </div>
        </div>

        <div className="controles-pqrs">
          <div className="buscador-pqrs">
            <input
              type="text"
              placeholder="Buscar por descripción, tipo, estado..."
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
              {pqrsFiltrados.length}{" "}
              {pqrsFiltrados.length === 1 ? "PQR encontrado" : "PQRS encontrados"}
            </div>
          </div>
        </div>
      </div>

      {!cargando && (!pqrs || pqrs.length === 0) ? (
        <div className="estado-inicial-pqrs estado-vacio-student">
          <div className="icono-estado-inicial">
            <MessageCircle size={64} />
          </div>
          <h2>No tienes PQRS registrados</h2>
          <p>
            Cuando registres una petición, queja, reclamo o sugerencia, aparecerá aquí.
          </p>
          <button
            className="boton-nuevo-pqr"
            onClick={() => setMostrarModalCrear(true)}
          >
            <Plus size={18} />
            Crear mi primer PQR
          </button>
        </div>
      ) : (
        <>
          <div className="contenedor-tabla-pqrs">
            <table className="tabla-pqrs">
              <thead>
                <tr>
                  <th className="columna-id-pqr">ID</th>
                  <th className="columna-tipo-pqr">Tipo</th>
                  <th className="columna-descripcion-pqr">Descripción</th>
                  <th className="columna-estado-pqr">Estado</th>
                  <th className="columna-fecha-pqr">Fecha</th>
                  <th className="columna-acciones-pqr">Acción</th>
                </tr>
              </thead>
              <tbody>
                {elementosActuales.map((pqr) => {
                  const tipoInfo = getInfoTipoPQR(pqr.id_tipo_pqrs);
                  const estadoInfo = getColorEstado(pqr.estado);
                  const TipoIcon = tipoInfo.icon;
                  const EstadoIcon = estadoInfo.icon;

                  return (
                    <tr key={pqr.id_pqr} className="fila-pqr">
                      <td className="celda-id-pqr">
                        <div className="badge-id-pqr">#{pqr.id_pqr}</div>
                      </td>

                      <td className="celda-tipo-pqr">
                        <div className="tipo-pqr-con-icono">
                          <TipoIcon size={16} className="icono-tipo" />
                          <span className="nombre-tipo">{tipoInfo.nombre}</span>
                        </div>
                      </td>

                      <td className="celda-descripcion-pqr">
                        <div className="descripcion-pqr" title={pqr.descripcion}>
                          {pqr.descripcion && pqr.descripcion.length > 50
                            ? `${pqr.descripcion.substring(0, 50)}...`
                            : pqr.descripcion || "Sin descripción"}
                        </div>
                      </td>

                      <td className="celda-estado-pqr">
                        <div
                          className="estado-pqr-con-icono"
                          style={{
                            backgroundColor: estadoInfo.bg,
                            color: estadoInfo.color,
                            borderColor: estadoInfo.border,
                          }}
                        >
                          <EstadoIcon size={16} className="icono-estado" />
                          <span>{estadoInfo.texto}</span>
                        </div>
                      </td>

                      <td className="celda-fecha-pqr">
                        <div className="fecha-info-pqr">
                          {formatearFecha(pqr.fecha_pqrs)}
                        </div>
                      </td>

                      <td className="celda-acciones-pqr">
                        <div className="botones-acciones-pqr">
                          <button
                            className="boton-ver-pqr"
                            onClick={() => handleVerDetalles(pqr)}
                            title="Ver detalles completos"
                          >
                            Ver Detalles
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
            <div className="paginador-pqrs">
              <div className="info-paginacion-pqrs">
                Mostrando {indicePrimerElemento + 1} -{" "}
                {Math.min(indiceUltimoElemento, pqrsFiltrados.length)} de{" "}
                {pqrsFiltrados.length} PQRS
              </div>

              <div className="controles-navegacion-pqrs">
                <button
                  onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
                  disabled={paginaActual === 1}
                  className="boton-paginador-pqrs boton-anterior-pqrs"
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
                        className={`numero-pagina-pqrs ${
                          paginaActual === numeroPagina ? "activa" : ""
                        }`}
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
                        className={`numero-pagina-pqrs ${
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
                  className="boton-paginador-pqrs boton-siguiente-pqrs"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {mostrarModalCrear && (
        <div className="modal-fondo-pqrs" onClick={cerrarModalCrear}>
          <div
            className="modal-contenido-pqrs modal-crear"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-cabecera-pqrs">
              <h2>Crear Nuevo PQR</h2>
              <button className="modal-cerrar-pqrs" onClick={cerrarModalCrear}>
                ×
              </button>
            </div>

            <div className="modal-cuerpo-pqrs">
              <div className="formulario-crear-pqr">

                <div className="grupo-formulario">
                  <label htmlFor="tipo-pqr">Tipo de PQR:</label>
                  <select
                    id="tipo-pqr"
                    value={tipoNuevo}
                    onChange={(e) => setTipoNuevo(e.target.value)}
                    className="select-tipo-pqr"
                  >
                    <option value="1">Petición</option>
                    <option value="2">Queja</option>
                    <option value="3">Reclamo</option>
                    <option value="4">Sugerencia</option>
                  </select>
                </div>

                <div className="grupo-formulario">
                  <label htmlFor="descripcion-pqr">Descripción:</label>
                  <textarea
                    id="descripcion-pqr"
                    value={descripcionNueva}
                    onChange={(e) => setDescripcionNueva(e.target.value)}
                    placeholder="Describe detalladamente tu petición, queja, reclamo o sugerencia..."
                    rows={8}
                    className="textarea-descripcion-pqr"
                    disabled={cargandoCrear}
                  />
                  <div className="contador-caracteres">
                    {descripcionNueva.length} caracteres (mínimo 5)
                  </div>
                </div>

                <div className="instrucciones-crear-pqr instrucciones-student">
                  <h4>📝 Instrucciones:</h4>
                  <ul>
                    <li>Sé claro y específico en tu descripción</li>
                    <li>Proporciona todos los detalles relevantes</li>
                    <li>Mantén un tono respetuoso</li>
                    <li>Se responderá en un plazo máximo de 5 días hábiles</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="modal-pie-pqrs">
              <button
                className="boton-cancelar-pqrs"
                onClick={cerrarModalCrear}
                disabled={cargandoCrear}
              >
                Cancelar
              </button>
              <button
                className="boton-crear-confirmar-pqrs"
                onClick={handleCrearPQR}
                disabled={
                  cargandoCrear ||
                  !descripcionNueva.trim() ||
                  descripcionNueva.trim().length < 5
                }
              >
                {cargandoCrear ? "Creando..." : "Crear PQR"}
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalDetalles && pqrDetallado && (
        <div className="modal-fondo-pqrs" onClick={cerrarModalDetalles}>
          <div
            className="modal-contenido-pqrs modal-detalles"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-cabecera-pqrs">
              <h2>Detalles del PQR #{pqrDetallado.id_pqr}</h2>
              <button className="modal-cerrar-pqrs" onClick={cerrarModalDetalles}>
                ×
              </button>
            </div>

            <div className="modal-cuerpo-pqrs">
              <div className="detalles-simple-pqrs">
                <div className="detalle-grupo-pqrs">
                  <h3>Información del PQR</h3>
                  <div className="detalle-fila-pqrs">
                    <span className="detalle-etiqueta">ID PQR:</span>
                    <span className="detalle-valor">#{pqrDetallado.id_pqr}</span>
                  </div>
                  <div className="detalle-fila-pqrs">
                    <span className="detalle-etiqueta">Fecha de creación:</span>
                    <span className="detalle-valor">
                      {formatearFecha(pqrDetallado.fecha_pqrs)}
                    </span>
                  </div>
                  <div className="detalle-fila-pqrs">
                    <span className="detalle-etiqueta">Tipo:</span>
                    <span className="detalle-valor">
                      <span
                        className="badge-tipo-detalle"
                        style={{
                          backgroundColor: getInfoTipoPQR(pqrDetallado.id_tipo_pqrs).bg,
                          color: getInfoTipoPQR(pqrDetallado.id_tipo_pqrs).color,
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
                  <h3>Tu Mensaje</h3>
                  <div className="detalle-descripcion-completa">
                    {pqrDetallado.descripcion || "No hay descripción disponible"}
                  </div>
                </div>

                {pqrDetallado.respuesta ? (
                  <div className="detalle-grupo-pqrs">
                    <h3>Respuesta de la Administración</h3>
                    <div className="detalle-respuesta-pqrs">
                      <div className="respuesta-contenido">
                        {pqrDetallado.respuesta}
                      </div>
                      {pqrDetallado.fecha_respuesta && (
                        <div className="respuesta-fecha">
                          <strong>Fecha de respuesta:</strong>{" "}
                          {formatearFecha(pqrDetallado.fecha_respuesta)}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="detalle-grupo-pqrs">
                    <div className="advertencia-pendiente">
                      <span className="icono-advertencia">⏳</span>
                      <span>
                        Tu PQR está siendo revisado por la administración. Te
                        notificaremos cuando haya una respuesta.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-pie-pqrs">
              <button
                className="boton-cerrar-detalles-pqrs"
                onClick={cerrarModalDetalles}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PQRSStudent;