import React, { useState, useEffect } from "react";
import { useTipoCarreras } from "../hooks/useTipoCarreras.js";
import "../css/Principal.css";
import "../css/TipoCarrera.css";

const TipoCarreras = () => {
  const { 
    tiposCarrera, 
    cargando, 
    mensaje, 
    recargarTiposCarrera,
    crearTipoCarrera,
    actualizarTipoCarrera,
    eliminarTipoCarrera,
    limpiarMensaje 
  } = useTipoCarreras();
  
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(10);
  const [busqueda, setBusqueda] = useState("");
  
  // Estados para el modal de formulario
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [tipoCarreraActual, setTipoCarreraActual] = useState({
    id_tipo_carrera: 0,
    nombre_tipo_carrera: ""
  });
  
  // Estado para confirmar eliminación
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
  const [tipoCarreraAEliminar, setTipoCarreraAEliminar] = useState(null);

  useEffect(() => {
    recargarTiposCarrera();
  }, []);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => {
        limpiarMensaje();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje, limpiarMensaje]);

  // Filtrar tipos de carrera por búsqueda
  const tiposCarreraFiltrados = tiposCarrera.filter(tipo =>
    tipo.nombre_tipo_carrera.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Calcular elementos para la página actual
  const indiceUltimoElemento = paginaActual * elementosPorPagina;
  const indicePrimerElemento = indiceUltimoElemento - elementosPorPagina;
  const elementosActuales = tiposCarreraFiltrados.slice(indicePrimerElemento, indiceUltimoElemento);
  const totalPaginas = Math.ceil(tiposCarreraFiltrados.length / elementosPorPagina);

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

  // Función para obtener color según ID
  const getColorTipoCarrera = (id) => {
    const colores = [
      { bg: '#e3f2fd', color: '#1976d2', border: '#bbdefb' }, // Azul
      { bg: '#e8f5e9', color: '#388e3c', border: '#c8e6c9' }, // Verde
      { bg: '#fff3e0', color: '#f57c00', border: '#ffe0b2' }, // Naranja
      { bg: '#f3e5f5', color: '#7b1fa2', border: '#e1bee7' }, // Púrpura
      { bg: '#e0f2f1', color: '#00796b', border: '#b2dfdb' }, // Turquesa
      { bg: '#ffebee', color: '#d32f2f', border: '#ffcdd2' }, // Rojo
      { bg: '#fff8e1', color: '#ff8f00', border: '#ffecb3' }, // Ámbar
      { bg: '#e8eaf6', color: '#303f9f', border: '#c5cae9' }, // Índigo
    ];
    return colores[id % colores.length];
  };

  // Funciones CRUD usando el hook
  const handleNuevoTipoCarrera = () => {
    setTipoCarreraActual({
      id_tipo_carrera: 0,
      nombre_tipo_carrera: ""
    });
    setModoEdicion(false);
    setMostrarModal(true);
  };

  const handleEditarTipoCarrera = (tipo) => {
    setTipoCarreraActual({
      id_tipo_carrera: tipo.id_tipo_carrera,
      nombre_tipo_carrera: tipo.nombre_tipo_carrera
    });
    setModoEdicion(true);
    setMostrarModal(true);
  };

  const handleEliminarTipoCarrera = (tipo) => {
    setTipoCarreraAEliminar(tipo);
    setMostrarConfirmacionEliminar(true);
  };

  const confirmarEliminarTipoCarrera = async () => {
    if (tipoCarreraAEliminar) {
      await eliminarTipoCarrera(tipoCarreraAEliminar.id_tipo_carrera);
      setMostrarConfirmacionEliminar(false);
      setTipoCarreraAEliminar(null);
    }
  };

  const handleSubmitTipoCarrera = async (e) => {
    e.preventDefault();
    
    if (modoEdicion) {
      // Actualizar tipo de carrera existente
      await actualizarTipoCarrera(tipoCarreraActual);
    } else {
      // Crear nuevo tipo de carrera
      await crearTipoCarrera(tipoCarreraActual);
    }
    
    setMostrarModal(false);
  };

  const handleChangeTipoCarrera = (e) => {
    const { name, value } = e.target;
    setTipoCarreraActual(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (cargando) return (
    <div className="estado-carga">
      <div className="spinner-grande"></div>
      <p>Cargando tipos de carrera...</p>
    </div>
  );

  if (!tiposCarrera.length && !cargando) return (
    <div className="estado-inicial">
      <h2>Tipos de carrera no disponibles</h2>
      <p>No se encontraron tipos de carrera en la base de datos.</p>
      <button 
        className="boton-nuevo-tipo-carrera"
        onClick={handleNuevoTipoCarrera}
      >
        + Crear Primer Tipo
      </button>
    </div>
  );

  return (
    <div className="contenedor-tipo-carreras">
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

      <div className="cabecera-tipo-carreras">
        <div className="titulo-tipo-carreras-con-boton">
          <div>
            <h3> Tipos de Carrera</h3>
          </div>
          <button 
            className="boton-nuevo-tipo-carrera"
            onClick={handleNuevoTipoCarrera}
          >
            + Nuevo Tipo
          </button>
        </div>
        
        <div className="controles-tipo-carreras">
          <div className="buscador-tipo-carreras">
            <input
              type="text"
              placeholder="Buscar tipo de carrera..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="input-busqueda-tipo-carreras"
            />
          </div>
          
          <div className="controles-paginacion-superior">
            <div className="seleccion-elementos-tipo-carreras">
              <span>Mostrar:</span>
              <select 
                value={elementosPorPagina} 
                onChange={(e) => {
                  setElementosPorPagina(Number(e.target.value));
                  setPaginaActual(1);
                }}
                className="select-elementos-tipo-carreras"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            
            <div className="info-cantidad-tipo-carreras">
              {tiposCarreraFiltrados.length} {tiposCarreraFiltrados.length === 1 ? 'tipo encontrado' : 'tipos encontrados'}
            </div>
          </div>
        </div>
      </div>

      <div className="contenedor-tabla-tipo-carreras">
        <table className="tabla-tipo-carreras">
          <thead>
            <tr>
              <th className="columna-id-tipo-carrera">ID</th>
              <th className="columna-nombre-tipo-carrera">Nombre del Tipo</th>
              <th className="columna-acciones-tipo-carrera">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {elementosActuales.map((tipo) => {
              const colorTipo = getColorTipoCarrera(tipo.id_tipo_carrera);
              
              return (
                <tr key={tipo.id_tipo_carrera} className="fila-tipo-carrera">
                  <td className="celda-id-tipo-carrera">
                    <div className="badge-id-tipo-carrera" style={{ 
                      backgroundColor: colorTipo.bg,
                      color: colorTipo.color,
                      borderColor: colorTipo.border
                    }}>
                      {tipo.id_tipo_carrera}
                    </div>
                  </td>
                  <td className="celda-nombre-tipo-carrera">
                    <div className="nombre-tipo-carrera-contenedor">
                      <div className="nombre-tipo-carrera">{tipo.nombre_tipo_carrera}</div>
                      <div className="descripcion-tipo-carrera">
                        {/* Puedes agregar descripción si existe */}
                        {tipo.descripcion || "Tipo de carrera académica"}
                      </div>
                    </div>
                  </td>
                  <td className="celda-acciones-tipo-carrera">
                    <div className="botones-acciones-tipo-carrera">
                      <button 
                        className="boton-editar-tipo-carrera"
                        onClick={() => handleEditarTipoCarrera(tipo)}
                      >
                        Editar
                      </button>
                      <button 
                        className="boton-eliminar-tipo-carrera"
                        onClick={() => handleEliminarTipoCarrera(tipo)}
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

      {/* Modal para crear/editar tipos de carrera */}
      {mostrarModal && (
        <div className="modal-fondo-tipo-carreras">
          <div className="modal-contenido-tipo-carreras">
            <div className="modal-cabecera-tipo-carreras">
              <h2>{modoEdicion ? 'Editar Tipo de Carrera' : 'Nuevo Tipo de Carrera'}</h2>
              <button 
                className="modal-cerrar-tipo-carreras"
                onClick={() => setMostrarModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmitTipoCarrera}>
              <div className="modal-cuerpo-tipo-carreras">
                {modoEdicion && (
                  <div className="campo-formulario-tipo-carreras">
                    <label>ID del Tipo:</label>
                    <input
                      type="text"
                      value={tipoCarreraActual.id_tipo_carrera}
                      disabled
                      className="input-formulario-tipo-carreras disabled"
                    />
                  </div>
                )}
                
                <div className="campo-formulario-tipo-carreras">
                  <label>Nombre del Tipo:</label>
                  <input
                    type="text"
                    name="nombre_tipo_carrera"
                    value={tipoCarreraActual.nombre_tipo_carrera}
                    onChange={handleChangeTipoCarrera}
                    required
                    className="input-formulario-tipo-carreras"
                    placeholder="Ej: Tecnológica, Profesional, Técnica"
                  />
                </div>
              </div>
              
              <div className="modal-pie-tipo-carreras">
                <button 
                  type="button" 
                  className="boton-cancelar-tipo-carreras"
                  onClick={() => setMostrarModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="boton-guardar-tipo-carreras"
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
        <div className="modal-fondo-tipo-carreras">
          <div className="modal-contenido-tipo-carreras modal-confirmacion">
            <div className="modal-cabecera-tipo-carreras">
              <h2>Confirmar Eliminación</h2>
              <button 
                className="modal-cerrar-tipo-carreras"
                onClick={() => setMostrarConfirmacionEliminar(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-cuerpo-tipo-carreras">
              <p>¿Estás seguro de que deseas eliminar el tipo de carrera:</p>
              <p className="tipo-carrera-a-eliminar">{tipoCarreraAEliminar?.nombre_tipo_carrera}</p>
              <p>Esta acción no se puede deshacer. Todas las carreras asociadas perderán este tipo.</p>
            </div>
            
            <div className="modal-pie-tipo-carreras">
              <button 
                className="boton-cancelar-tipo-carreras"
                onClick={() => {
                  setMostrarConfirmacionEliminar(false);
                  setTipoCarreraAEliminar(null);
                }}
                disabled={cargando}
              >
                Cancelar
              </button>
              <button 
                className="boton-eliminar-confirmar"
                onClick={confirmarEliminarTipoCarrera}
                disabled={cargando}
              >
                {cargando ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paginador */}
      <div className="paginador-tipo-carreras">
        <div className="info-paginacion-tipo-carreras">
          Mostrando {indicePrimerElemento + 1} - {Math.min(indiceUltimoElemento, tiposCarreraFiltrados.length)} de {tiposCarreraFiltrados.length} tipos
        </div>
        
        <div className="controles-navegacion-tipo-carreras">
          <button 
            onClick={paginaAnterior} 
            disabled={paginaActual === 1}
            className="boton-paginador-tipo-carreras boton-anterior-tipo-carreras"
          >
            ← Anterior
          </button>

          <div className="numeros-pagina-tipo-carreras">
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
                  className={`numero-pagina-tipo-carreras ${paginaActual === numeroPagina ? 'activa' : ''}`}
                >
                  {numeroPagina}
                </button>
              );
            })}
            
            {totalPaginas > 5 && paginaActual < totalPaginas - 2 && (
              <>
                <span className="puntos-suspensivos-tipo-carreras">...</span>
                <button
                  onClick={() => cambiarPagina(totalPaginas)}
                  className={`numero-pagina-tipo-carreras ${paginaActual === totalPaginas ? 'activa' : ''}`}
                >
                  {totalPaginas}
                </button>
              </>
            )}
          </div>

          <button 
            onClick={paginaSiguiente} 
            disabled={paginaActual === totalPaginas}
            className="boton-paginador-tipo-carreras boton-siguiente-tipo-carreras"
          >
            Siguiente →
          </button>
        </div>
        
        <div className="totales-tipo-carreras">
          <div className="total-paginas-tipo-carreras">
            Página {paginaActual} de {totalPaginas}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TipoCarreras;