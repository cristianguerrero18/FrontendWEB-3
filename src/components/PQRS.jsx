import React, { useState, useEffect, useCallback, useMemo } from "react";
import { usePQRS } from "../hooks/usePQRS.js";
import { getUsuarioPorId } from "../api/Admin/PQRS.js";
import "../css/Principal.css";
import "../css/PQRS.css";

const PQRS = () => {
  const { 
    pqrs, 
    cargando, 
    mensaje, 
    recargarPQRS,
    recargarPQRSporId,
    eliminarPQRS,
    responderPQR,
    limpiarMensaje 
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

  // Obtener ID del admin del localStorage (ajusta según tu autenticación)
  const idAdmin = localStorage.getItem("user_id") || 21; // Cambia esto según tu sistema

  // Mapeo de tipos de PQRS según el id_tipo_pqrs
  const tiposPQRS = {
    1: { nombre: "Petición", color: "#e3f2fd", texto: "#1976d2", border: "#bbdefb" },
    2: { nombre: "Queja", color: "#fff3e0", texto: "#f57c00", border: "#ffe0b2" },
    3: { nombre: "Reclamo", color: "#ffebee", texto: "#d32f2f", border: "#ffcdd2" },
    4: { nombre: "Sugerencia", color: "#e8f5e9", texto: "#388e3c", border: "#c8e6c9" }
  };

  useEffect(() => {
    recargarPQRS();
  }, []);

  // Cargar nombres de usuario
  useEffect(() => {
    const cargarNombresUsuarios = async () => {
      if (!pqrs.length) return;

      const nuevosNombres = { ...nombresUsuarios };
      let necesitaActualizacion = false;

      for (const pqr of pqrs) {
        if (pqr.id_usuario && !nuevosNombres[pqr.id_usuario]) {
          necesitaActualizacion = true;
          break;
        }
      }

      if (!necesitaActualizacion) return;

      for (const pqr of pqrs) {
        if (pqr.id_usuario && !nuevosNombres[pqr.id_usuario]) {
          try {
            const usuario = await getUsuarioPorId(pqr.id_usuario);
            if (usuario && usuario.nombres_usuario) {
              nuevosNombres[pqr.id_usuario] = usuario.nombres_usuario;
            } else {
              nuevosNombres[pqr.id_usuario] = `Usuario ${pqr.id_usuario}`;
            }
          } catch (error) {
            console.error(`Error al cargar usuario ${pqr.id_usuario}:`, error);
            nuevosNombres[pqr.id_usuario] = `Usuario ${pqr.id_usuario}`;
          }
        }
      }

      setNombresUsuarios(nuevosNombres);
    };

    if (pqrs.length > 0) {
      cargarNombresUsuarios();
    }
  }, [pqrs, nombresUsuarios]);

  // Limpiar mensaje después de 5 segundos
  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => {
        limpiarMensaje();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje, limpiarMensaje]);

  // Filtrar PQRS por búsqueda
  const pqrsFiltrados = useMemo(() => {
    if (!pqrs.length) return [];
    
    const textoBusqueda = busqueda.toLowerCase();
    
    return pqrs.filter(pqr => {
      if (!pqr) return false;
      
      const tipoNombre = tiposPQRS[pqr.id_tipo_pqrs]?.nombre || "General";
      const nombreUsuario = nombresUsuarios[pqr.id_usuario] || `Usuario ${pqr.id_usuario}`;
      const estado = pqr.estado || "Pendiente";
      
      return (
        (pqr.descripcion && pqr.descripcion.toLowerCase().includes(textoBusqueda)) ||
        (pqr.id_usuario && pqr.id_usuario.toString().includes(textoBusqueda)) ||
        (pqr.id_pqr && pqr.id_pqr.toString().includes(textoBusqueda)) ||
        (tipoNombre.toLowerCase().includes(textoBusqueda)) ||
        (nombreUsuario.toLowerCase().includes(textoBusqueda)) ||
        (estado.toLowerCase().includes(textoBusqueda)) ||
        (pqr.respuesta && pqr.respuesta.toLowerCase().includes(textoBusqueda))
      );
    });
  }, [pqrs, busqueda, tiposPQRS, nombresUsuarios]);

  // Calcular elementos para la página actual
  const indiceUltimoElemento = paginaActual * elementosPorPagina;
  const indicePrimerElemento = indiceUltimoElemento - elementosPorPagina;
  const elementosActuales = pqrsFiltrados.slice(indicePrimerElemento, indiceUltimoElemento);
  const totalPaginas = Math.ceil(pqrsFiltrados.length / elementosPorPagina);

  // Función para ver detalles del PQR
  const handleVerDetalles = useCallback(async (pqr) => {
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
            if (usuario && usuario.nombres_usuario) {
              setNombresUsuarios(prev => ({
                ...prev,
                [detalles.id_usuario]: usuario.nombres_usuario
              }));
            }
          } catch (error) {
            console.error(`Error al cargar usuario ${detalles.id_usuario}:`, error);
          }
        }
      }
    } catch (error) {
      console.error("Error al cargar detalles adicionales:", error);
    } finally {
      setCargandoDetalles(false);
    }
  }, [recargarPQRSporId, nombresUsuarios]);

  // Función para cerrar modal de detalles
  const cerrarModalDetalles = useCallback(() => {
    setMostrarModalDetalles(false);
    setPqrDetallado(null);
    setCargandoDetalles(false);
  }, []);

  // Función para responder PQR
  const handleResponderPQR = useCallback((pqr) => {
    if (!pqr) return;
    setPqrAResponder(pqr);
    setRespuesta(pqr.respuesta || "");
    setMostrarModalResponder(true);
  }, []);

  // Función para enviar respuesta
  const enviarRespuesta = useCallback(async () => {
    if (!pqrAResponder || !respuesta.trim()) {
      setMensaje("Por favor, escribe una respuesta");
      return;
    }

    setCargandoRespuesta(true);
    try {
      const resultado = await responderPQR({
        id_pqr: pqrAResponder.id_pqr,
        respuesta: respuesta.trim(),
        id_admin: idAdmin
      });

      if (!resultado.error) {
        setMostrarModalResponder(false);
        setPqrAResponder(null);
        setRespuesta("");
      }
    } catch (error) {
      console.error("Error al enviar respuesta:", error);
    } finally {
      setCargandoRespuesta(false);
    }
  }, [pqrAResponder, respuesta, responderPQR, idAdmin]);

  // Función para eliminar PQR
  const handleEliminarPQR = useCallback((pqr) => {
    if (!pqr) return;
    setPqrAEliminar(pqr);
    setMostrarConfirmacionEliminar(true);
  }, []);

  const confirmarEliminarPQR = useCallback(async () => {
    if (pqrAEliminar && pqrAEliminar.id_pqr) {
      await eliminarPQRS(pqrAEliminar.id_pqr);
      setMostrarConfirmacionEliminar(false);
      setPqrAEliminar(null);
    }
  }, [pqrAEliminar, eliminarPQRS]);

  // Formatear fecha
  const formatearFecha = useCallback((fechaString) => {
    if (!fechaString) return 'No aplica';
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

  // Obtener información del tipo de PQR
  const getInfoTipoPQR = useCallback((idTipo) => {
    const tipoInfo = tiposPQRS[idTipo];
    
    if (tipoInfo) {
      return {
        nombre: tipoInfo.nombre,
        bg: tipoInfo.color,
        color: tipoInfo.texto,
        border: tipoInfo.border
      };
    }
    
    return {
      nombre: "General",
      bg: "#f5f5f5",
      color: "#616161",
      border: "#e0e0e0"
    };
  }, [tiposPQRS]);

  // Obtener color según estado
  const getColorEstado = useCallback((estado) => {
    const estadoLower = estado?.toLowerCase() || 'pendiente';
    
    switch(estadoLower) {
      case 'respondido':
        return { bg: "#e8f5e9", color: "#388e3c", border: "#c8e6c9", texto: "Respondido" };
      case 'pendiente':
        return { bg: "#fff3e0", color: "#f57c00", border: "#ffe0b2", texto: "Pendiente" };
      default:
        return { bg: "#f5f5f5", color: "#616161", border: "#e0e0e0", texto: estado || "Pendiente" };
    }
  }, []);

  // Obtener nombre del usuario
  const obtenerNombreUsuario = useCallback((idUsuario) => {
    if (!idUsuario) return 'N/A';
    return nombresUsuarios[idUsuario] || `Cargando...`;
  }, [nombresUsuarios]);

  // Resetear paginación cuando cambia la búsqueda
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  if (cargando && !pqrs.length) return (
    <div className="estado-carga">
      <div className="spinner-grande"></div>
      <p>Cargando PQRS...</p>
    </div>
  );

  if (!pqrs.length && !cargando) return (
    <div className="estado-inicial">
      <h2>No hay PQRS disponibles</h2>
      <p>No se encontraron PQRS en el sistema.</p>
    </div>
  );

  return (
    <div className="contenedor-pqrs">
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

      <div className="cabecera-pqrs">
        <div className="titulo-pqrs-con-boton">
          <div>
            <h2>Gestión de PQRS</h2>
            <p className="subtitulo-pqrs">
              Administra las peticiones, quejas, reclamos y sugerencias
            </p>
          </div>
          <button 
            className="boton-nuevo-pqr"
            onClick={recargarPQRS}
            disabled={cargando}
          >
            ↻ Actualizar
          </button>
        </div>
        
        <div className="controles-pqrs">
          <div className="buscador-pqrs">
            <input
              type="text"
              placeholder="Buscar por descripción, tipo, usuario, estado..."
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
              {pqrsFiltrados.length} {pqrsFiltrados.length === 1 ? 'PQR encontrado' : 'PQRS encontrados'}
            </div>
          </div>
        </div>
      </div>

      <div className="contenedor-tabla-pqrs">
        <table className="tabla-pqrs">
          <thead>
            <tr>
              <th className="columna-id-pqr">ID</th>
              <th className="columna-tipo-pqr">Tipo</th>
              <th className="columna-descripcion-pqr">Descripción</th>
              <th className="columna-usuario-pqr">Usuario</th>
              <th className="columna-estado-pqr">Estado</th>
              <th className="columna-fecha-pqr">Fecha</th>
              <th className="columna-acciones-pqr">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {elementosActuales.map((pqr) => {
              const tipoInfo = getInfoTipoPQR(pqr.id_tipo_pqrs);
              const estadoInfo = getColorEstado(pqr.estado);
              
              return (
                <tr key={pqr.id_pqr} className="fila-pqr">
                  <td className="celda-id-pqr">
                    <div className="badge-id-pqr">
                      #{pqr.id_pqr}
                    </div>
                  </td>
                  <td className="celda-tipo-pqr">
                    <div className="tipo-pqr" style={{ 
                      backgroundColor: tipoInfo.bg,
                      color: tipoInfo.color,
                      borderColor: tipoInfo.border
                    }} title={`Tipo: ${tipoInfo.nombre}`}>
                      {tipoInfo.nombre}
                    </div>
                  </td>
                  <td className="celda-descripcion-pqr">
                    <div className="descripcion-pqr" title={pqr.descripcion}>
                      {pqr.descripcion && pqr.descripcion.length > 50 ? 
                        pqr.descripcion.substring(0, 50) + '...' : 
                        pqr.descripcion || 'Sin descripción'}
                    </div>
                  </td>
                  <td className="celda-usuario-pqr">
                    <div className="usuario-info-pqr">
                      <div className="nombre-usuario-pqr" title={obtenerNombreUsuario(pqr.id_usuario)}>
                        {obtenerNombreUsuario(pqr.id_usuario)}
                      </div>
                      <div className="id-usuario-pqr">
                        ID: {pqr.id_usuario || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="celda-estado-pqr">
                    <div className="estado-pqr" style={{ 
                      backgroundColor: estadoInfo.bg,
                      color: estadoInfo.color,
                      borderColor: estadoInfo.border
                    }}>
                      {estadoInfo.texto}
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
                        disabled={cargandoDetalles}
                      >
                        {cargandoDetalles ? 'Cargando...' : 'Ver'}
                      </button>
                      <button 
                        className="boton-responder-pqr"
                        onClick={() => handleResponderPQR(pqr)}
                        title="Responder PQR"
                        disabled={pqr.estado === 'Respondido' || cargando}
                      >
                        Responder
                      </button>
                      <button 
                        className="boton-eliminar-pqr"
                        onClick={() => handleEliminarPQR(pqr)}
                        title="Eliminar PQR"
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

      {/* Modal de detalles del PQR */}
      {mostrarModalDetalles && (
        <div className="modal-fondo-pqrs" onClick={cerrarModalDetalles}>
          <div className="modal-contenido-pqrs modal-detalles" onClick={(e) => e.stopPropagation()}>
            <div className="modal-cabecera-pqrs">
              <h2>
                Detalles del PQR #{pqrDetallado?.id_pqr}
              </h2>
              <button 
                className="modal-cerrar-pqrs"
                onClick={cerrarModalDetalles}
              >
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
                    <h3>Información Básica</h3>
                    <div className="detalle-fila-pqrs">
                      <span className="detalle-etiqueta">ID PQR:</span>
                      <span className="detalle-valor">#{pqrDetallado.id_pqr}</span>
                    </div>
                    <div className="detalle-fila-pqrs">
                      <span className="detalle-etiqueta">Usuario:</span>
                      <span className="detalle-valor">
                        <div className="usuario-detalle-pqrs">
                          <div className="nombre-usuario-detalle">
                            {obtenerNombreUsuario(pqrDetallado.id_usuario)}
                          </div>
                          <div className="id-usuario-detalle">
                            (ID: {pqrDetallado.id_usuario || 'N/A'})
                          </div>
                        </div>
                      </span>
                    </div>
                    <div className="detalle-fila-pqrs">
                      <span className="detalle-etiqueta">Fecha de creación:</span>
                      <span className="detalle-valor">{formatearFecha(pqrDetallado.fecha_pqrs)}</span>
                    </div>
                    <div className="detalle-fila-pqrs">
                      <span className="detalle-etiqueta">Tipo:</span>
                      <span className="detalle-valor">
                        <span className="badge-tipo-detalle" style={{ 
                          backgroundColor: getInfoTipoPQR(pqrDetallado.id_tipo_pqrs).bg,
                          color: getInfoTipoPQR(pqrDetallado.id_tipo_pqrs).color
                        }}>
                          {getInfoTipoPQR(pqrDetallado.id_tipo_pqrs).nombre}
                        </span>
                      </span>
                    </div>
                    <div className="detalle-fila-pqrs">
                      <span className="detalle-etiqueta">Estado:</span>
                      <span className="detalle-valor">
                        <span className="badge-estado-detalle" style={{ 
                          backgroundColor: getColorEstado(pqrDetallado.estado).bg,
                          color: getColorEstado(pqrDetallado.estado).color
                        }}>
                          {getColorEstado(pqrDetallado.estado).texto}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="detalle-grupo-pqrs">
                    <h3>Descripción Completa</h3>
                    <div className="detalle-descripcion-completa">
                      {pqrDetallado.descripcion || 'No hay descripción disponible'}
                    </div>
                  </div>

                  {pqrDetallado.respuesta && (
                    <div className="detalle-grupo-pqrs">
                      <h3>Respuesta del Administrador</h3>
                      <div className="detalle-respuesta-pqrs">
                        <div className="respuesta-contenido">
                          {pqrDetallado.respuesta}
                        </div>
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
                  <button 
                    className="boton-cerrar-detalles-pqrs"
                    onClick={cerrarModalDetalles}
                  >
                    Cerrar
                  </button>
                </div>
              )}
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

      {/* Modal de responder PQR */}
      {mostrarModalResponder && (
        <div className="modal-fondo-pqrs">
          <div className="modal-contenido-pqrs modal-responder" onClick={(e) => e.stopPropagation()}>
            <div className="modal-cabecera-pqrs">
              <h2>Responder PQR #{pqrAResponder?.id_pqr}</h2>
              <button 
                className="modal-cerrar-pqrs"
                onClick={() => {
                  setMostrarModalResponder(false);
                  setPqrAResponder(null);
                  setRespuesta("");
                }}
              >
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
                  <div className="descripcion-pqr-responder">
                    {pqrAResponder?.descripcion}
                  </div>
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
                <div className="contador-caracteres">
                  {respuesta.length} caracteres
                </div>
              </div>

              <div className="advertencia-responder-pqrs">
                <span className="icono-advertencia">ℹ️</span>
                <span>Una vez enviada la respuesta, el estado del PQR cambiará a "Respondido" y no podrá ser modificada.</span>
              </div>
            </div>
            
            <div className="modal-pie-pqrs">
              <button 
                className="boton-cancelar-pqrs"
                onClick={() => {
                  setMostrarModalResponder(false);
                  setPqrAResponder(null);
                  setRespuesta("");
                }}
                disabled={cargandoRespuesta}
              >
                Cancelar
              </button>
              <button 
                className="boton-responder-confirmar-pqrs"
                onClick={enviarRespuesta}
                disabled={cargandoRespuesta || !respuesta.trim()}
              >
                {cargandoRespuesta ? 'Enviando...' : 'Enviar Respuesta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {mostrarConfirmacionEliminar && (
        <div className="modal-fondo-pqrs">
          <div className="modal-contenido-pqrs modal-confirmacion">
            <div className="modal-cabecera-pqrs">
              <h2>Confirmar Eliminación</h2>
              <button 
                className="modal-cerrar-pqrs"
                onClick={() => setMostrarConfirmacionEliminar(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-cuerpo-pqrs">
              <p>¿Estás seguro de que deseas eliminar este PQR?</p>
              <div className="pqr-a-eliminar-detalle">
                <div className="pqr-eliminar-header">
                  <span className="pqr-id">PQR #{pqrAEliminar?.id_pqr}</span>
                  <span className="pqr-tipo" style={{ 
                    backgroundColor: pqrAEliminar?.id_tipo_pqrs ? getInfoTipoPQR(pqrAEliminar.id_tipo_pqrs).bg : '#f5f5f5',
                    color: pqrAEliminar?.id_tipo_pqrs ? getInfoTipoPQR(pqrAEliminar.id_tipo_pqrs).color : '#616161'
                  }}>
                    {pqrAEliminar?.id_tipo_pqrs ? getInfoTipoPQR(pqrAEliminar.id_tipo_pqrs).nombre : 'General'}
                  </span>
                  <span className="pqr-estado" style={{ 
                    backgroundColor: getColorEstado(pqrAEliminar?.estado).bg,
                    color: getColorEstado(pqrAEliminar?.estado).color
                  }}>
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
                      {pqrAEliminar?.descripcion?.substring(0, 150) || 'Sin descripción'}...
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
              <button 
                className="boton-cancelar-pqrs"
                onClick={() => {
                  setMostrarConfirmacionEliminar(false);
                  setPqrAEliminar(null);
                }}
                disabled={cargando}
              >
                Cancelar
              </button>
              <button 
                className="boton-eliminar-confirmar-pqrs"
                onClick={confirmarEliminarPQR}
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
        <div className="paginador-pqrs">
          <div className="info-paginacion-pqrs">
            Mostrando {indicePrimerElemento + 1} - {Math.min(indiceUltimoElemento, pqrsFiltrados.length)} de {pqrsFiltrados.length} PQRS
          </div>
          
          <div className="controles-navegacion-pqrs">
            <button 
              onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))} 
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
                    className={`numero-pagina-pqrs ${paginaActual === numeroPagina ? 'activa' : ''}`}
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
                    className={`numero-pagina-pqrs ${paginaActual === totalPaginas ? 'activa' : ''}`}
                  >
                    {totalPaginas}
                  </button>
                </>
              )}
            </div>

            <button 
              onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))} 
              disabled={paginaActual === totalPaginas}
              className="boton-paginador-pqrs boton-siguiente-pqrs"
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