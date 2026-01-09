import React, { useState, useEffect, useMemo } from "react";
import { useLogs } from "../../hooks/useLogs.js";
import "../../css/Logs.css";

const Logs = () => {
  const {
    logs,
    cargando,
    mensaje,
    estadisticas,
    recargarLogs,
    limpiarMensaje
  } = useLogs("detallados");

  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(10);
  const [busqueda, setBusqueda] = useState("");
  const [filtroUsuario, setFiltroUsuario] = useState("");
  const [ordenarPor, setOrdenarPor] = useState("fecha_desc");
  const [mostrarDetalles, setMostrarDetalles] = useState(null);

  // Obtener lista única de usuarios para filtro
  const usuariosUnicos = useMemo(() => {
    return [...new Set(logs.map(log => log.id_usuario))]
      .filter(id => id != null && id !== "")
      .slice(0, 10);
  }, [logs]);

  // Filtrar y ordenar logs
  const logsFiltrados = useMemo(() => {
    return logs
      .filter(log => {
        const textoBusqueda = busqueda.toLowerCase();
        const coincideBusqueda = 
          (log.correo_usuario?.toLowerCase() || '').includes(textoBusqueda) ||
          (log.nombres_usuario?.toLowerCase() || '').includes(textoBusqueda) ||
          (log.apellidos_usuario?.toLowerCase() || '').includes(textoBusqueda) ||
          (log.descripcion?.toLowerCase() || '').includes(textoBusqueda) ||
          (log.correo?.toLowerCase() || '').includes(textoBusqueda);

        const coincideUsuario = filtroUsuario === "" || 
          log.id_usuario?.toString() === filtroUsuario;

        return coincideBusqueda && coincideUsuario;
      })
      .sort((a, b) => {
        const fechaA = new Date(a.fecha_acceso || a.fecha || 0);
        const fechaB = new Date(b.fecha_acceso || b.fecha || 0);
        
        switch(ordenarPor) {
          case "fecha_asc":
            return fechaA - fechaB;
          case "fecha_desc":
            return fechaB - fechaA;
          case "usuario_asc":
            return (a.correo_usuario || a.correo || '').localeCompare(b.correo_usuario || b.correo || '');
          case "usuario_desc":
            return (b.correo_usuario || b.correo || '').localeCompare(a.correo_usuario || a.correo || '');
          default:
            return fechaB - fechaA;
        }
      });
  }, [logs, busqueda, filtroUsuario, ordenarPor]);

  // Calcular paginación
  const { elementosActuales, totalPaginas } = useMemo(() => {
    const indiceUltimoElemento = paginaActual * elementosPorPagina;
    const indicePrimerElemento = indiceUltimoElemento - elementosPorPagina;
    const elementosActuales = logsFiltrados.slice(indicePrimerElemento, indiceUltimoElemento);
    const totalPaginas = Math.max(1, Math.ceil(logsFiltrados.length / elementosPorPagina));
    
    return { elementosActuales, totalPaginas };
  }, [logsFiltrados, paginaActual, elementosPorPagina]);

  // Funciones de paginación
  const cambiarPagina = (numeroPagina) => {
    if (numeroPagina >= 1 && numeroPagina <= totalPaginas) {
      setPaginaActual(numeroPagina);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const paginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const paginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      setPaginaActual(paginaActual + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Formatear fecha
  const formatearFecha = (fechaString) => {
    if (!fechaString) return "Sin fecha";
    
    try {
      const fecha = new Date(fechaString);
      if (isNaN(fecha.getTime())) return "Fecha inválida";
      
      return fecha.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  // Resetear página cuando se filtran resultados
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroUsuario, elementosPorPagina]);

  // Limpiar mensaje automáticamente
  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => {
        limpiarMensaje();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje, limpiarMensaje]);

  if (cargando) return (
    <div className="estado-carga">
      <div className="spinner-grande"></div>
      <p>Cargando logs de acceso...</p>
    </div>
  );

  return (
    <div className="contenedor-logs">
      {mensaje && (
        <div className={`mensaje-api ${mensaje.includes("Error") ? "error" : "exito"}`}>
          <p>{mensaje}</p>
          <button 
            className="boton-cerrar-mensaje"
            onClick={limpiarMensaje}
            aria-label="Cerrar mensaje"
          >
            ×
          </button>
        </div>
      )}

      {/* Estadísticas */}
      <div className="tarjetas-estadisticas">
        <div className="tarjeta-estadistica">
          <div className="icono-estadistica">📊</div>
          <div className="contenido-estadistica">
            <h3>Total Logs</h3>
            <p className="valor-estadistica">{estadisticas.total}</p>
          </div>
        </div>
        
        <div className="tarjeta-estadistica">
          <div className="icono-estadistica">👥</div>
          <div className="contenido-estadistica">
            <h3>Usuarios Únicos</h3>
            <p className="valor-estadistica">{estadisticas.usuariosUnicos}</p>
          </div>
        </div>
      </div>

      <div className="cabecera-logs">
        <div className="titulo-logs-con-boton">
          <div>
            <h2>Logs de Acceso</h2>
            <p className="subtitulo-logs">Registro detallado de accesos al sistema</p>
          </div>
          <button 
            className="boton-recargar"
            onClick={recargarLogs}
            disabled={cargando}
          >
            ↻ {cargando ? 'Cargando...' : 'Recargar Logs'}
          </button>
        </div>
        
        <div className="controles-logs">
          <div className="buscador-logs">
            <input
              type="text"
              placeholder="Buscar por usuario, correo o descripción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-busqueda-logs"
              aria-label="Buscar logs"
            />
          </div>
          
          <div className="filtros-logs">
            <div className="filtro-grupo">
              <span>Filtrar por usuario:</span>
              <select 
                value={filtroUsuario} 
                onChange={(e) => setFiltroUsuario(e.target.value)}
                className="select-filtro-logs"
                aria-label="Filtrar por usuario"
              >
                <option value="">Todos los usuarios</option>
                {usuariosUnicos.map(id => (
                  <option key={id} value={id}>
                    Usuario ID: {id}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filtro-grupo">
              <span>Ordenar por:</span>
              <select 
                value={ordenarPor} 
                onChange={(e) => setOrdenarPor(e.target.value)}
                className="select-filtro-logs"
                aria-label="Ordenar logs"
              >
                <option value="fecha_desc">Fecha (más reciente)</option>
                <option value="fecha_asc">Fecha (más antiguo)</option>
                <option value="usuario_asc">Usuario (A-Z)</option>
                <option value="usuario_desc">Usuario (Z-A)</option>
              </select>
            </div>
          </div>
          
          <div className="controles-paginacion-superior">
            <div className="seleccion-elementos-logs">
              <span>Mostrar:</span>
              <select 
                value={elementosPorPagina} 
                onChange={(e) => setElementosPorPagina(Number(e.target.value))}
                className="select-elementos-logs"
                aria-label="Elementos por página"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            
            <div className="info-cantidad-logs">
              {logsFiltrados.length} {logsFiltrados.length === 1 ? 'registro encontrado' : 'registros encontrados'}
            </div>
          </div>
        </div>
      </div>

      {logsFiltrados.length === 0 && !cargando ? (
        <div className="estado-inicial">
          <h2>No se encontraron logs</h2>
          <p>No hay registros que coincidan con los filtros aplicados.</p>
          <button 
            className="boton-recargar"
            onClick={recargarLogs}
          >
            ↻ Recargar logs
          </button>
        </div>
      ) : (
        <>
          <div className="contenedor-tabla-logs">
            <table className="tabla-logs">
              <thead>
                <tr>
                  <th className="columna-id-log">ID</th>
                  <th className="columna-usuario-log">Usuario</th>
                  <th className="columna-fecha-log">Fecha y Hora</th>
                  <th className="columna-descripcion-log">Descripción</th>
                  <th className="columna-acciones-log">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {elementosActuales.map((log) => (
                  <tr key={log.id_log || log.id} className="fila-log">
                    <td className="celda-id-log">
                      <div className="badge-id-log">
                        #{log.id_log || log.id || 'N/A'}
                      </div>
                    </td>
                    <td className="celda-usuario-log">
                      <div className="usuario-info">
                        <div className="nombre-usuario">
                          {log.nombres_usuario || 'Nombre'} {log.apellidos_usuario || 'No disponible'}
                        </div>
                        <div className="correo-usuario">
                          {log.correo_usuario || log.correo || 'Sin correo'}
                        </div>
                      </div>
                    </td>
                    <td className="celda-fecha-log">
                      <div className="fecha-info">
                        {formatearFecha(log.fecha_acceso || log.fecha)}
                      </div>
                    </td>
                    <td className="celda-descripcion-log">
                      <div className="descripcion-log">
                        {log.descripcion || "Acceso al sistema"}
                      </div>
                    </td>
                    <td className="celda-acciones-log">
                      <div className="botones-acciones-log">
                        <button 
                          className="boton-detalles-log"
                          onClick={() => setMostrarDetalles(
                            mostrarDetalles === (log.id_log || log.id) ? null : (log.id_log || log.id)
                          )}
                          title="Ver detalles"
                          aria-label={`Ver detalles del log ${log.id_log || log.id}`}
                        >
                          {mostrarDetalles === (log.id_log || log.id) ? "Ocultar" : "Ver"} detalles
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Panel de detalles */}
          {mostrarDetalles && (
            <div className="panel-detalles-log">
              <div className="panel-cabecera">
                <h3>Detalles del Log #{mostrarDetalles}</h3>
                <button 
                  className="boton-cerrar-panel"
                  onClick={() => setMostrarDetalles(null)}
                  aria-label="Cerrar panel de detalles"
                >
                  ×
                </button>
              </div>
              <div className="panel-cuerpo">
                {(() => {
                  const logDetallado = logs.find(log => 
                    (log.id_log || log.id) === mostrarDetalles
                  );
                  
                  if (!logDetallado) return <p>No se encontraron detalles</p>;
                  
                  return (
                    <div className="detalles-contenido">
                      <div className="detalle-item">
                        <strong>Usuario ID:</strong> {logDetallado.id_usuario || 'No disponible'}
                      </div>
                      <div className="detalle-item">
                        <strong>Nombre completo:</strong> {logDetallado.nombres_usuario || 'Nombre'} {logDetallado.apellidos_usuario || 'No disponible'}
                      </div>
                      <div className="detalle-item">
                        <strong>Correo:</strong> {logDetallado.correo_usuario || logDetallado.correo || 'Sin correo'}
                      </div>
                      <div className="detalle-item">
                        <strong>Fecha exacta:</strong> {formatearFecha(logDetallado.fecha_acceso || logDetallado.fecha)}
                      </div>
                      <div className="detalle-item">
                        <strong>Descripción completa:</strong>
                        <p>{logDetallado.descripcion || "Sin descripción adicional"}</p>
                      </div>
                      {logDetallado.ip && (
                        <div className="detalle-item">
                          <strong>IP:</strong> {logDetallado.ip}
                        </div>
                      )}
                      {logDetallado.user_agent && (
                        <div className="detalle-item">
                          <strong>User Agent:</strong> 
                          <p className="user-agent">{logDetallado.user_agent}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Paginador */}
          {totalPaginas > 1 && (
            <div className="paginador-logs">
              <div className="info-paginacion-logs">
                Mostrando {Math.min((paginaActual - 1) * elementosPorPagina + 1, logsFiltrados.length)} - {Math.min(paginaActual * elementosPorPagina, logsFiltrados.length)} de {logsFiltrados.length} registros
              </div>
              
              <div className="controles-navegacion-logs">
                <button 
                  onClick={paginaAnterior} 
                  disabled={paginaActual === 1}
                  className="boton-paginador-logs boton-anterior-logs"
                  aria-label="Página anterior"
                >
                  ← Anterior
                </button>

                <div className="numeros-pagina-logs">
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
                        onClick={() => cambiarPagina(numeroPagina)}
                        className={`numero-pagina-logs ${paginaActual === numeroPagina ? 'activa' : ''}`}
                        aria-label={`Ir a página ${numeroPagina}`}
                        aria-current={paginaActual === numeroPagina ? 'page' : undefined}
                      >
                        {numeroPagina}
                      </button>
                    );
                  })}
                  
                  {totalPaginas > 5 && paginaActual < totalPaginas - 2 && (
                    <>
                      <span className="puntos-suspensivos-logs">...</span>
                      <button
                        onClick={() => cambiarPagina(totalPaginas)}
                        className={`numero-pagina-logs ${paginaActual === totalPaginas ? 'activa' : ''}`}
                        aria-label={`Ir a última página`}
                      >
                        {totalPaginas}
                      </button>
                    </>
                  )}
                </div>

                <button 
                  onClick={paginaSiguiente} 
                  disabled={paginaActual === totalPaginas}
                  className="boton-paginador-logs boton-siguiente-logs"
                  aria-label="Página siguiente"
                >
                  Siguiente →
                </button>
              </div>
              
              <div className="totales-logs">
                <div className="total-paginas-logs">
                  Página {paginaActual} de {totalPaginas}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Logs;