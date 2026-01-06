import React, { useState, useEffect } from "react";
import { usePensum } from "../hooks/UsePensum.js";
import "../css/Principal.css";
import "../css/Pensum.css";

const Pensum = () => {
  const { 
    pensum, 
    cargando, 
    mensaje, 
    recargarPensum,
    crearPensumItem,
    actualizarPensum,
    eliminarPensum,
    carreras,
    asignaturas,
    getNombreCarrera,
    getNombreAsignatura,
    getCodigoAsignatura,
    limpiarMensaje 
  } = usePensum();
  
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(10);
  const [busqueda, setBusqueda] = useState("");
  
  // Estados para el modal de formulario
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [pensumActual, setPensumActual] = useState({
    id_pensum: 0,
    id_carrera: "",
    numero_semestre: "",
    id_asignatura: ""
  });
  
  // Estado para confirmar eliminación
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
  const [pensumAEliminar, setPensumAEliminar] = useState(null);

  // Estado para filtros
  const [filtroCarrera, setFiltroCarrera] = useState("");
  const [filtroSemestre, setFiltroSemestre] = useState("");

  useEffect(() => {
    recargarPensum();
  }, []);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => {
        limpiarMensaje();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje, limpiarMensaje]);

  // Filtrar pensum por búsqueda y filtros
  const pensumFiltrado = pensum.filter(item => {
    const busquedaLower = busqueda.toLowerCase();
    
    // Obtener nombres con validación
    const nombreCarrera = getNombreCarrera(item.id_carrera) || "";
    const nombreAsignatura = getNombreAsignatura(item.id_asignatura) || "";

    
    // Convertir a minúsculas con validación
    const nombreCarreraLower = nombreCarrera.toString().toLowerCase();
    const nombreAsignaturaLower = nombreAsignatura.toString().toLowerCase();
    
    // Filtro por búsqueda general
    const coincideBusqueda = 
      nombreCarreraLower.includes(busquedaLower) ||
      nombreAsignaturaLower.includes(busquedaLower) ||
      item.numero_semestre.toString().includes(busqueda) ||
      item.id_carrera.toString().includes(busqueda) ||
      item.id_asignatura.toString().includes(busqueda);
    
    // Filtro por carrera
    const coincideCarrera = !filtroCarrera || item.id_carrera.toString() === filtroCarrera;
    
    // Filtro por semestre
    const coincideSemestre = !filtroSemestre || item.numero_semestre.toString() === filtroSemestre;
    
    return coincideBusqueda && coincideCarrera && coincideSemestre;
  });

  // Calcular elementos para la página actual
  const indiceUltimoElemento = paginaActual * elementosPorPagina;
  const indicePrimerElemento = indiceUltimoElemento - elementosPorPagina;
  const elementosActuales = pensumFiltrado.slice(indicePrimerElemento, indiceUltimoElemento);
  const totalPaginas = Math.ceil(pensumFiltrado.length / elementosPorPagina);

  // Generar opciones de semestres (1-10)
  const semestres = Array.from({ length: 10 }, (_, i) => i + 1);

  // Funciones de paginación
  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Función para obtener color según semestre
  const getColorSemestre = (semestre) => {
    const colores = [
      { bg: '#e3f2fd', color: '#1976d2', border: '#bbdefb' },  // Semestre 1
      { bg: '#e8f5e9', color: '#388e3c', border: '#c8e6c9' },  // Semestre 2
      { bg: '#fff3e0', color: '#f57c00', border: '#ffe0b2' },  // Semestre 3
      { bg: '#f3e5f5', color: '#7b1fa2', border: '#e1bee7' },  // Semestre 4
      { bg: '#fce4ec', color: '#c2185b', border: '#f8bbd9' },  // Semestre 5
      { bg: '#e8eaf6', color: '#303f9f', border: '#c5cae9' },  // Semestre 6
      { bg: '#e0f2f1', color: '#00796b', border: '#b2dfdb' },  // Semestre 7
      { bg: '#fff8e1', color: '#f57f17', border: '#ffecb3' },  // Semestre 8
      { bg: '#fbe9e7', color: '#d84315', border: '#ffccbc' },  // Semestre 9
      { bg: '#efebe9', color: '#5d4037', border: '#d7ccc8' }   // Semestre 10
    ];
    return colores[semestre - 1] || colores[0];
  };

  // Funciones CRUD usando el hook
  const handleNuevoPensum = () => {
    setPensumActual({
      id_pensum: 0,
      id_carrera: "",
      numero_semestre: "",
      id_asignatura: ""
    });
    setModoEdicion(false);
    setMostrarModal(true);
  };

  const handleEditarPensum = (item) => {
    setPensumActual({
      id_pensum: item.id_pensum,
      id_carrera: item.id_carrera?.toString() || "",
      numero_semestre: item.numero_semestre?.toString() || "",
      id_asignatura: item.id_asignatura?.toString() || ""
    });
    setModoEdicion(true);
    setMostrarModal(true);
  };

  const handleEliminarPensum = (item) => {
    setPensumAEliminar(item);
    setMostrarConfirmacionEliminar(true);
  };

  const confirmarEliminarPensum = async () => {
    if (pensumAEliminar) {
      await eliminarPensum(pensumAEliminar.id_pensum);
      setMostrarConfirmacionEliminar(false);
      setPensumAEliminar(null);
    }
  };

  const handleSubmitPensum = async (e) => {
    e.preventDefault();
    
    // Validar campos obligatorios
    if (!pensumActual.id_carrera || !pensumActual.numero_semestre || !pensumActual.id_asignatura) {
      alert("Por favor complete todos los campos obligatorios");
      return;
    }
    
    // Preparar datos para enviar
    const pensumParaEnviar = { 
      ...pensumActual,
      id_carrera: parseInt(pensumActual.id_carrera),
      numero_semestre: parseInt(pensumActual.numero_semestre),
      id_asignatura: parseInt(pensumActual.id_asignatura)
    };
    
    if (modoEdicion) {
      // Actualizar registro existente
      await actualizarPensum(pensumParaEnviar);
    } else {
      // Crear nuevo registro
      await crearPensumItem(pensumParaEnviar);
    }
    
    setMostrarModal(false);
  };

  const handleChangePensum = (e) => {
    const { name, value } = e.target;
    setPensumActual(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltroCarrera("");
    setFiltroSemestre("");
    setBusqueda("");
    setPaginaActual(1);
  };


  if (!pensum || !Array.isArray(pensum) || pensum.length === 0 && !cargando) return (
    <div className="estado-inicial">
      <h2>Pensum no disponible</h2>
      <p>No se encontraron registros en el pensum.</p>
      <button 
        className="boton-nuevo-pensum"
        onClick={handleNuevoPensum}
      >
        + Crear Primer Registro
      </button>
    </div>
  );

  return (
    <div className="contenedor-pensum">
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

      <div className="cabecera-pensum">
        <div className="titulo-pensum-con-boton">
          <div>
            <h2>Gestión de Pensum</h2>
          </div>
          <button 
            className="boton-nuevo-pensum"
            onClick={handleNuevoPensum}
          >
            + Nuevo Registro
          </button>
        </div>
        
        <div className="filtros-pensum">
          <div className="filtros-superiores">
            <div className="filtro-grupo">
              <label htmlFor="filtro-carrera">Carrera:</label>
              <select
                id="filtro-carrera"
                value={filtroCarrera}
                onChange={(e) => {
                  setFiltroCarrera(e.target.value);
                  setPaginaActual(1);
                }}
                className="select-filtro"
              >
                <option value="">Todas las carreras</option>
                {carreras && carreras.map(carrera => (
                  <option key={carrera.id_carrera} value={carrera.id_carrera}>
                    {carrera.nombre_carrera || `Carrera ${carrera.id_carrera}`}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filtro-grupo">
              <label htmlFor="filtro-semestre">Semestre:</label>
              <select
                id="filtro-semestre"
                value={filtroSemestre}
                onChange={(e) => {
                  setFiltroSemestre(e.target.value);
                  setPaginaActual(1);
                }}
                className="select-filtro"
              >
                <option value="">Todos los semestres</option>
                {semestres.map(semestre => (
                  <option key={semestre} value={semestre}>
                    Semestre {semestre}
                  </option>
                ))}
              </select>
            </div>
            
            <button 
              className="boton-limpiar-filtros"
              onClick={limpiarFiltros}
            >
              Limpiar Filtros
            </button>
          </div>
          
          <div className="controles-pensum">
            <div className="buscador-pensum">
              <input
                type="text"
                placeholder="Buscar por carrera, asignatura o código..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPaginaActual(1);
                }}
                className="input-busqueda-pensum"
              />
            </div>
            
            <div className="controles-paginacion-superior">
              <div className="seleccion-elementos-pensum">
                <span>Mostrar:</span>
                <select 
                  value={elementosPorPagina} 
                  onChange={(e) => {
                    setElementosPorPagina(Number(e.target.value));
                    setPaginaActual(1);
                  }}
                  className="select-elementos-pensum"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
              
              <div className="info-cantidad-pensum">
                {pensumFiltrado.length} {pensumFiltrado.length === 1 ? 'registro encontrado' : 'registros encontrados'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="contenedor-tabla-pensum">
        <table className="tabla-pensum">
          <thead>
            <tr>
              <th className="columna-id-pensum">ID</th>
              <th className="columna-carrera-pensum">Carrera</th>
              <th className="columna-semestre-pensum">Semestre</th>
              <th className="columna-asignatura-pensum">Asignatura</th>
              <th className="columna-acciones-pensum">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {elementosActuales.map((item) => {
              const colorSemestre = getColorSemestre(item.numero_semestre);
              const nombreCarrera = getNombreCarrera(item.id_carrera) || `Carrera ${item.id_carrera}`;
              const nombreAsignatura = getNombreAsignatura(item.id_asignatura) || `Asignatura ${item.id_asignatura}`;
              
              return (
                <tr key={item.id_pensum} className="fila-pensum">
                  <td className="celda-id-pensum">
                    <div className="badge-id-pensum">
                      {item.id_pensum}
                    </div>
                  </td>
                  <td className="celda-carrera-pensum">
                    <div className="info-con-badge">
                      <div className="nombre-carrera">{nombreCarrera}</div>
                      {item.id_carrera && (
                        <div className="badge-id-secundario">
                          ID: {item.id_carrera}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="celda-semestre-pensum">
                    <div 
                      className="badge-semestre"
                      style={{
                        backgroundColor: colorSemestre.bg,
                        color: colorSemestre.color,
                        borderColor: colorSemestre.border
                      }}
                    >
                      Semestre {item.numero_semestre}
                    </div>
                  </td>
                  <td className="celda-asignatura-pensum">
                    <div className="info-con-badge">
                      <div className="nombre-asignatura">{nombreAsignatura}</div>
                      {item.id_asignatura && (
                        <div className="badge-id-secundario">
                          ID: {item.id_asignatura}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="celda-acciones-pensum">
                    <div className="botones-acciones-pensum">
                      <button 
                        className="boton-editar-pensum"
                        onClick={() => handleEditarPensum(item)}
                        title="Editar registro"
                      >
                        Editar
                      </button>
                      <button 
                        className="boton-eliminar-pensum"
                        onClick={() => handleEliminarPensum(item)}
                        title="Eliminar registro"
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

      {/* Modal para crear/editar registros del pensum */}
      {mostrarModal && (
        <div className="modal-fondo-pensum">
          <div className="modal-contenido-pensum">
            <div className="modal-cabecera-pensum">
              <h2>{modoEdicion ? 'Editar Registro' : 'Nuevo Registro'}</h2>
              <button 
                className="modal-cerrar-pensum"
                onClick={() => setMostrarModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmitPensum}>
              <div className="modal-cuerpo-pensum">
                {modoEdicion && (
                  <div className="campo-formulario-pensum">
                    <label>ID del Registro:</label>
                    <input
                      type="text"
                      value={pensumActual.id_pensum}
                      disabled
                      className="input-formulario-pensum disabled"
                    />
                  </div>
                )}
                
                <div className="campo-formulario-pensum">
                  <label>Carrera *</label>
                  <select
                    name="id_carrera"
                    value={pensumActual.id_carrera || ""}
                    onChange={handleChangePensum}
                    required
                    className="select-formulario-pensum"
                  >
                    <option value="">Seleccione una carrera</option>
                    {carreras && carreras.map((carrera) => (
                      <option key={carrera.id_carrera} value={carrera.id_carrera}>
                         {(carrera.id_carrera || "SIN CÓDIGO")} - {carrera.nombre_carrera || "Carrera sin nombre"}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="campo-formulario-pensum">
                  <label>Semestre *</label>
                  <select
                    name="numero_semestre"
                    value={pensumActual.numero_semestre || ""}
                    onChange={handleChangePensum}
                    required
                    className="select-formulario-pensum"
                  >
                    <option value="">Seleccione el semestre</option>
                    {semestres.map((semestre) => (
                      <option key={semestre} value={semestre}>
                        Semestre {semestre}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="campo-formulario-pensum">
                  <label>Asignatura *</label>
                  <select
                    name="id_asignatura"
                    value={pensumActual.id_asignatura || ""}
                    onChange={handleChangePensum}
                    required
                    className="select-formulario-pensum"
                  >
                    <option value="">Seleccione una asignatura</option>
                    {asignaturas && asignaturas.map((asignatura) => (
                      <option key={asignatura.id_asignatura} value={asignatura.id_asignatura}>
                        {(asignatura.id_asignatura || "SIN CÓDIGO")} - {asignatura.nombre_asignatura || "Asignatura sin nombre"}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="info-registro">
                  {pensumActual.id_carrera && (
                    <p><strong>Carrera seleccionada:</strong> {getNombreCarrera(pensumActual.id_carrera) || `Carrera ${pensumActual.id_carrera}`}</p>
                  )}
                  {pensumActual.id_asignatura && (
                    <p><strong>Asignatura seleccionada:</strong> {getNombreAsignatura(pensumActual.id_asignatura) || `Asignatura ${pensumActual.id_asignatura}`} ({getCodigoAsignatura(pensumActual.id_asignatura) || "SIN CÓDIGO"})</p>
                  )}
                </div>
              </div>
              
              <div className="modal-pie-pensum">
                <button 
                  type="button" 
                  className="boton-cancelar-pensum"
                  onClick={() => setMostrarModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="boton-guardar-pensum"
                  disabled={cargando}
                >
                  {cargando ? 'Procesando...' : (modoEdicion ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {mostrarConfirmacionEliminar && (
        <div className="modal-fondo-pensum">
          <div className="modal-contenido-pensum modal-confirmacion">
            <div className="modal-cabecera-pensum">
              <h2>Confirmar Eliminación</h2>
              <button 
                className="modal-cerrar-pensum"
                onClick={() => setMostrarConfirmacionEliminar(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-cuerpo-pensum">
              <p>¿Estás seguro de que deseas eliminar este registro del pensum?</p>
              <div className="info-a-eliminar">
                <p><strong>Carrera:</strong> {getNombreCarrera(pensumAEliminar?.id_carrera) || `Carrera ${pensumAEliminar?.id_carrera}`}</p>
                <p><strong>Semestre:</strong> {pensumAEliminar?.numero_semestre || "N/A"}</p>
                <p><strong>Asignatura:</strong> {getNombreAsignatura(pensumAEliminar?.id_asignatura) || `Asignatura ${pensumAEliminar?.id_asignatura}`}</p>
                <p><strong>Código:</strong> {getCodigoAsignatura(pensumAEliminar?.id_asignatura) || "N/A"}</p>
              </div>
              <p className="alerta-eliminacion">
                ⚠️ Esta acción no se puede deshacer.
              </p>
            </div>
            
            <div className="modal-pie-pensum">
              <button 
                className="boton-cancelar-pensum"
                onClick={() => {
                  setMostrarConfirmacionEliminar(false);
                  setPensumAEliminar(null);
                }}
                disabled={cargando}
              >
                Cancelar
              </button>
              <button 
                className="boton-eliminar-confirmar"
                onClick={confirmarEliminarPensum}
                disabled={cargando}
              >
                {cargando ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paginador */}
      <div className="paginador-pensum">
        <div className="info-paginacion-pensum">
          Mostrando {indicePrimerElemento + 1} - {Math.min(indiceUltimoElemento, pensumFiltrado.length)} de {pensumFiltrado.length} registros
        </div>
        
        <div className="controles-navegacion-pensum">
          <button 
            onClick={paginaAnterior} 
            disabled={paginaActual === 1}
            className="boton-paginador-pensum boton-anterior-pensum"
          >
            ← Anterior
          </button>

          <div className="numeros-pagina-pensum">
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
                  className={`numero-pagina-pensum ${paginaActual === numeroPagina ? 'activa' : ''}`}
                >
                  {numeroPagina}
                </button>
              );
            })}
            
            {totalPaginas > 5 && paginaActual < totalPaginas - 2 && (
              <>
                <span className="puntos-suspensivos-pensum">...</span>
                <button
                  onClick={() => cambiarPagina(totalPaginas)}
                  className={`numero-pagina-pensum ${paginaActual === totalPaginas ? 'activa' : ''}`}
                >
                  {totalPaginas}
                </button>
              </>
            )}
          </div>

          <button 
            onClick={paginaSiguiente} 
            disabled={paginaActual === totalPaginas}
            className="boton-paginador-pensum boton-siguiente-pensum"
          >
            Siguiente →
          </button>
        </div>
        
        <div className="totales-pensum">
          <div className="total-paginas-pensum">
            Página {paginaActual} de {totalPaginas}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pensum;