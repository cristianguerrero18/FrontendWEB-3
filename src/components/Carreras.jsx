import React, { useState, useEffect } from "react";
import { useCarreras } from "../hooks/useCarreras.js";
import "../css/Principal.css";
import "../css/Carreras.css";

const Carreras = () => {
  const { 
    carreras, 
    tiposCarrera,        // ✅ Array de tipos reales desde backend
    cargando, 
    cargandoTipos,       // ✅ Estado de carga de tipos
    mensaje, 
    recargarCarreras,
    crearCarreras,
    actualizarCarrera,
    eliminarCarrera,
    getNombreTipoCarrera, // ✅ Función para obtener nombre
    limpiarMensaje
  } = useCarreras();
  
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(10);
  const [busqueda, setBusqueda] = useState("");
  
  // Estados para el modal de formulario
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [carreraActual, setCarreraActual] = useState({
    id_carrera: 0,
    nombre_carrera: "",
    id_tipo_carrera: "",
    Descripcion: ""
  });
  
  // Estado para confirmar eliminación
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
  const [carreraAEliminar, setCarreraAEliminar] = useState(null);

  useEffect(() => {
    recargarCarreras();
  }, []);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => {
        limpiarMensaje();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje, limpiarMensaje]);

  // Filtrar carreras por búsqueda
  const carrerasFiltradas = carreras.filter(carrera => {
    const busquedaLower = busqueda.toLowerCase();
    const tipoNombre = getNombreTipoCarrera(carrera.id_tipo_carrera).toLowerCase();
    
    return (
      carrera.nombre_carrera.toLowerCase().includes(busquedaLower) ||
      (carrera.Descripcion?.toLowerCase() || "").includes(busquedaLower) ||
      tipoNombre.includes(busquedaLower) ||
      carrera.id_tipo_carrera?.toString().includes(busqueda)
    );
  });

  // Calcular elementos para la página actual
  const indiceUltimoElemento = paginaActual * elementosPorPagina;
  const indicePrimerElemento = indiceUltimoElemento - elementosPorPagina;
  const elementosActuales = carrerasFiltradas.slice(indicePrimerElemento, indiceUltimoElemento);
  const totalPaginas = Math.ceil(carrerasFiltradas.length / elementosPorPagina);

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

  // Función para obtener color según tipo de carrera
  const getColorTipoCarrera = (idTipo) => {
    const colores = [
      { bg: '#e3f2fd', color: '#1976d2', border: '#bbdefb' }, // Azul
      { bg: '#e8f5e9', color: '#388e3c', border: '#c8e6c9' }, // Verde
      { bg: '#fff3e0', color: '#f57c00', border: '#ffe0b2' }, // Naranja
      { bg: '#f3e5f5', color: '#7b1fa2', border: '#e1bee7' }, // Púrpura
      { bg: '#ffebee', color: '#d32f2f', border: '#ffcdd2' }, // Rojo
      { bg: '#e0f2f1', color: '#00796b', border: '#b2dfdb' }, // Turquesa
      { bg: '#fff8e1', color: '#ff8f00', border: '#ffecb3' }, // Ámbar
    ];
    
    const index = (idTipo - 1) % colores.length;
    return colores[index] || { bg: '#f5f5f5', color: '#616161', border: '#e0e0e0' };
  };

  // Funciones CRUD usando el hook
  const handleNuevaCarrera = () => {
    setCarreraActual({
      id_carrera: 0,
      nombre_carrera: "",
      id_tipo_carrera: tiposCarrera.length > 0 ? tiposCarrera[0].id_tipo_carrera : "",
      Descripcion: ""
    });
    setModoEdicion(false);
    setMostrarModal(true);
  };

  const handleEditarCarrera = (carrera) => {
    setCarreraActual({
      id_carrera: carrera.id_carrera,
      nombre_carrera: carrera.nombre_carrera,
      id_tipo_carrera: carrera.id_tipo_carrera || "",
      Descripcion: carrera.Descripcion || ""
    });
    setModoEdicion(true);
    setMostrarModal(true);
  };

  const handleEliminarCarrera = (carrera) => {
    setCarreraAEliminar(carrera);
    setMostrarConfirmacionEliminar(true);
  };

  const confirmarEliminarCarrera = async () => {
    if (carreraAEliminar) {
      await eliminarCarrera(carreraAEliminar.id_carrera);
      setMostrarConfirmacionEliminar(false);
      setCarreraAEliminar(null);
    }
  };

  const handleSubmitCarrera = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!carreraActual.nombre_carrera.trim()) {
      alert("El nombre de la carrera es obligatorio");
      return;
    }

    if (!carreraActual.id_tipo_carrera) {
      alert("Debe seleccionar un tipo de carrera");
      return;
    }

    // Convertir id_tipo_carrera a número
    const carreraParaEnviar = {
      ...carreraActual,
      id_tipo_carrera: parseInt(carreraActual.id_tipo_carrera)
    };

    if (modoEdicion) {
      // Actualizar carrera existente
      await actualizarCarrera(carreraParaEnviar);
    } else {
      // Crear nueva carrera (como array según la API)
      await crearCarreras([carreraParaEnviar]);
    }
    
    setMostrarModal(false);
  };

  const handleChangeCarrera = (e) => {
    const { name, value } = e.target;
    setCarreraActual(prev => ({
      ...prev,
      [name]: value
    }));
  };



  if (!carreras.length && !cargando) return (
    <div className="estado-inicial">
      <h2>Carreras no disponibles</h2>
      <p>No se encontraron carreras en la base de datos.</p>
      <button 
        className="boton-nueva-carrera"
        onClick={handleNuevaCarrera}
      >
        + Crear Primera Carrera
      </button>
    </div>
  );

  return (
    <div className="contenedor-carreras">
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

      <div className="cabecera-carreras">
        <div className="titulo-carreras-con-boton">
          <h1>Carreras Académicas</h1>
          <button 
            className="boton-nueva-carrera"
            onClick={handleNuevaCarrera}
          >
            + Nueva Carrera
          </button>
        </div>
        
        <div className="controles-carreras">
          <div className="buscador-carreras">
            <input
              type="text"
              placeholder="Buscar por nombre, descripción o tipo de carrera..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="input-busqueda-carreras"
            />
          </div>
          
          <div className="controles-paginacion-superior">
            <div className="seleccion-elementos-carreras">
              <span>Mostrar:</span>
              <select 
                value={elementosPorPagina} 
                onChange={(e) => {
                  setElementosPorPagina(Number(e.target.value));
                  setPaginaActual(1);
                }}
                className="select-elementos-carreras"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            
            <div className="info-cantidad-carreras">
              {carrerasFiltradas.length} {carrerasFiltradas.length === 1 ? 'carrera encontrada' : 'carreras encontradas'}
            </div>
          </div>
        </div>
      </div>

      <div className="contenedor-tabla-carreras">
        <table className="tabla-carreras">
          <thead>
            <tr>
              <th className="columna-id-carrera">ID</th>
              <th className="columna-nombre-carrera">Nombre de la Carrera</th>
              <th className="columna-tipo-carrera">Tipo</th>
              <th className="columna-descripcion-carrera">Descripción</th>
              <th className="columna-acciones-carrera">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {elementosActuales.map((carrera) => {
              const colorTipo = getColorTipoCarrera(carrera.id_tipo_carrera);
              const nombreTipo = getNombreTipoCarrera(carrera.id_tipo_carrera);
              
              return (
                <tr key={carrera.id_carrera} className="fila-carrera">
                  <td className="celda-id-carrera">
                    <div className="badge-id-carrera" style={{ 
                      backgroundColor: colorTipo.bg,
                      color: colorTipo.color,
                      borderColor: colorTipo.border
                    }}>
                      {carrera.id_carrera}
                    </div>
                  </td>
                  <td className="celda-nombre-carrera">
                    <div className="nombre-carrera-contenedor">
                      <div className="nombre-carrera">{carrera.nombre_carrera}</div>
                    </div>
                  </td>
                  <td className="celda-tipo-carrera">
                    <div className="info-con-badge">
                      <div 
                        className="badge-tipo-carrera"
                        style={{ 
                          backgroundColor: colorTipo.bg,
                          color: colorTipo.color,
                          borderColor: colorTipo.border
                        }}
                      >
                        {nombreTipo}
                      </div>
                      {carrera.id_tipo_carrera && (
                        <div className="badge-id-secundario">
                          ID: {carrera.id_tipo_carrera}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="celda-descripcion-carrera">
                    <div className="descripcion-carrera">
                      {carrera.Descripcion || "Sin descripción"}
                    </div>
                  </td>
                  <td className="celda-acciones-carrera">
                    <div className="botones-acciones-carrera">
                      <button 
                        className="boton-editar-carrera"
                        onClick={() => handleEditarCarrera(carrera)}
                      >
                        Editar
                      </button>
                      <button 
                        className="boton-eliminar-carrera"
                        onClick={() => handleEliminarCarrera(carrera)}
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

      {/* Modal para crear/editar carreras */}
      {mostrarModal && (
        <div className="modal-fondo-carreras">
          <div className="modal-contenido-carreras">
            <div className="modal-cabecera-carreras">
              <h2>{modoEdicion ? 'Editar Carrera' : 'Nueva Carrera'}</h2>
              <button 
                className="modal-cerrar-carreras"
                onClick={() => setMostrarModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmitCarrera}>
              <div className="modal-cuerpo-carreras">
                <div className="campo-formulario-carreras">
                  <label>Nombre de la Carrera *</label>
                  <input
                    type="text"
                    name="nombre_carrera"
                    value={carreraActual.nombre_carrera}
                    onChange={handleChangeCarrera}
                    required
                    className="input-formulario-carreras"
                    placeholder="Ingrese el nombre de la carrera"
                  />
                </div>
                
                <div className="campo-formulario-carreras">
                  <label>Tipo de Carrera *</label>
                  {cargandoTipos ? (
                    <div className="cargando-tipos">
                      <small>Cargando tipos de carrera...</small>
                      <select 
                        name="id_tipo_carrera"
                        value={carreraActual.id_tipo_carrera}
                        onChange={handleChangeCarrera}
                        className="select-formulario-carreras"
                        disabled
                      >
                        <option value="">Cargando...</option>
                      </select>
                    </div>
                  ) : tiposCarrera.length > 0 ? (
                    <>
                      <select
                        name="id_tipo_carrera"
                        value={carreraActual.id_tipo_carrera}
                        onChange={handleChangeCarrera}
                        required
                        className="select-formulario-carreras"
                      >
                        <option value="">Seleccione un tipo</option>
                        {tiposCarrera.map((tipo) => (
                          <option key={tipo.id_tipo_carrera} value={tipo.id_tipo_carrera}>
                            {tipo.nombre_tipo_carrera} (ID: {tipo.id_tipo_carrera})
                          </option>
                        ))}
                      </select>
                      <small className="texto-ayuda">
                        {modoEdicion && `Actual: ${getNombreTipoCarrera(carreraActual.id_tipo_carrera)}`}
                      </small>
                    </>
                  ) : (
                    <div className="error-tipos">
                      <small>No se pudieron cargar los tipos de carrera</small>
                      <input
                        type="number"
                        name="id_tipo_carrera"
                        value={carreraActual.id_tipo_carrera}
                        onChange={handleChangeCarrera}
                        required
                        className="input-formulario-carreras"
                        placeholder="Ingrese ID del tipo"
                        min="1"
                      />
                    </div>
                  )}
                </div>
                
                <div className="campo-formulario-carreras">
                  <label>Descripción</label>
                  <textarea
                    name="Descripcion"
                    value={carreraActual.Descripcion}
                    onChange={handleChangeCarrera}
                    rows="4"
                    className="textarea-formulario-carreras"
                    placeholder="Descripción opcional de la carrera"
                  />
                </div>
              </div>
              
              <div className="modal-pie-carreras">
                <button 
                  type="button" 
                  className="boton-cancelar-carreras"
                  onClick={() => setMostrarModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="boton-guardar-carreras"
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
        <div className="modal-fondo-carreras">
          <div className="modal-contenido-carreras modal-confirmacion">
            <div className="modal-cabecera-carreras">
              <h2>Confirmar Eliminación</h2>
              <button 
                className="modal-cerrar-carreras"
                onClick={() => setMostrarConfirmacionEliminar(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-cuerpo-carreras">
              <p>¿Estás seguro de que deseas eliminar la carrera:</p>
              <p className="carrera-a-eliminar">{carreraAEliminar?.nombre_carrera}</p>
              <p><strong>Tipo:</strong> {getNombreTipoCarrera(carreraAEliminar?.id_tipo_carrera)}</p>
              <p><strong>ID:</strong> {carreraAEliminar?.id_carrera}</p>
              <p className="alerta-eliminacion">⚠️ Esta acción no se puede deshacer.</p>
            </div>
            
            <div className="modal-pie-carreras">
              <button 
                className="boton-cancelar-carreras"
                onClick={() => {
                  setMostrarConfirmacionEliminar(false);
                  setCarreraAEliminar(null);
                }}
                disabled={cargando}
              >
                Cancelar
              </button>
              <button 
                className="boton-eliminar-confirmar"
                onClick={confirmarEliminarCarrera}
                disabled={cargando}
              >
                {cargando ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paginador */}
      <div className="paginador-carreras">
        <div className="info-paginacion-carreras">
          Mostrando {indicePrimerElemento + 1} - {Math.min(indiceUltimoElemento, carrerasFiltradas.length)} de {carrerasFiltradas.length} carreras
        </div>
        
        <div className="controles-navegacion-carreras">
          <button 
            onClick={paginaAnterior} 
            disabled={paginaActual === 1}
            className="boton-paginador-carreras boton-anterior-carreras"
          >
            ← Anterior
          </button>

          <div className="numeros-pagina-carreras">
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
                  className={`numero-pagina-carreras ${paginaActual === numeroPagina ? 'activa' : ''}`}
                >
                  {numeroPagina}
                </button>
              );
            })}
            
            {totalPaginas > 5 && paginaActual < totalPaginas - 2 && (
              <>
                <span className="puntos-suspensivos-carreras">...</span>
                <button
                  onClick={() => cambiarPagina(totalPaginas)}
                  className={`numero-pagina-carreras ${paginaActual === totalPaginas ? 'activa' : ''}`}
                >
                  {totalPaginas}
                </button>
              </>
            )}
          </div>

          <button 
            onClick={paginaSiguiente} 
            disabled={paginaActual === totalPaginas}
            className="boton-paginador-carreras boton-siguiente-carreras"
          >
            Siguiente →
          </button>
        </div>
        
        <div className="totales-carreras">
          <div className="total-paginas-carreras">
            Página {paginaActual} de {totalPaginas}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carreras;