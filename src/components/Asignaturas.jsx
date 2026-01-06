import React, { useState, useEffect } from "react";
import { useAsignaturas } from "../hooks/UseAsignaturas.js";
import "../css/Principal.css";
import "../css/Asignaturas.css";

const Asignaturas = () => {
  const { 
    asignaturas, 
    cargando, 
    mensaje, 
    recargarAsignaturas,
    crearAsignaturas,
    actualizarAsignatura,
    eliminarAsignatura,
    limpiarMensaje 
  } = useAsignaturas();
  
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(10);
  const [busqueda, setBusqueda] = useState("");
  
  // Estados para el modal de formulario
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [asignaturaActual, setAsignaturaActual] = useState({
    id_asignatura: 0,
    nombre_asignatura: ""
  });
  
  // Estado para confirmar eliminación
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
  const [asignaturaAEliminar, setAsignaturaAEliminar] = useState(null);

  useEffect(() => {
    recargarAsignaturas();
  }, []);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => {
        limpiarMensaje();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje, limpiarMensaje]);

  // Filtrar asignaturas por búsqueda
  const asignaturasFiltradas = asignaturas.filter(asignatura =>
    asignatura.nombre_asignatura.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Calcular elementos para la página actual
  const indiceUltimoElemento = paginaActual * elementosPorPagina;
  const indicePrimerElemento = indiceUltimoElemento - elementosPorPagina;
  const elementosActuales = asignaturasFiltradas.slice(indicePrimerElemento, indiceUltimoElemento);
  const totalPaginas = Math.ceil(asignaturasFiltradas.length / elementosPorPagina);

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
  const getColorAsignatura = (id) => {
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
  const handleNuevaAsignatura = () => {
    setAsignaturaActual({
      id_asignatura: 0,
      nombre_asignatura: ""
    });
    setModoEdicion(false);
    setMostrarModal(true);
  };

  const handleEditarAsignatura = (asignatura) => {
    setAsignaturaActual({
      id_asignatura: asignatura.id_asignatura,
      nombre_asignatura: asignatura.nombre_asignatura
    });
    setModoEdicion(true);
    setMostrarModal(true);
  };

  const handleEliminarAsignatura = (asignatura) => {
    setAsignaturaAEliminar(asignatura);
    setMostrarConfirmacionEliminar(true);
  };

  const confirmarEliminarAsignatura = async () => {
    if (asignaturaAEliminar) {
      await eliminarAsignatura(asignaturaAEliminar.id_asignatura);
      setMostrarConfirmacionEliminar(false);
      setAsignaturaAEliminar(null);
    }
  };

  const handleSubmitAsignatura = async (e) => {
    e.preventDefault();
    
    if (modoEdicion) {
      // Actualizar asignatura existente
      await actualizarAsignatura(asignaturaActual);
    } else {
      // Crear nueva asignatura (como array según la API)
      await crearAsignaturas([asignaturaActual]);
    }
    
    setMostrarModal(false);
  };

  const handleChangeAsignatura = (e) => {
    const { name, value } = e.target;
    setAsignaturaActual(prev => ({
      ...prev,
      [name]: value
    }));
  };


  if (!asignaturas.length && !cargando) return (
    <div className="estado-inicial">
      <h2>Asignaturas no disponibles</h2>
      <p>No se encontraron asignaturas en la base de datos.</p>
      <button 
        className="boton-nueva-asignatura"
        onClick={handleNuevaAsignatura}
      >
        + Crear Primera Asignatura
      </button>
    </div>
  );

  return (
    <div className="contenedor-asignaturas">
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

      <div className="cabecera-asignaturas">
        <div className="titulo-asignaturas-con-boton">
          <div>
            <h3>Gestión de Asignaturas</h3>
          </div>
          <button 
            className="boton-nueva-asignatura"
            onClick={handleNuevaAsignatura}
          >
            + Nueva Asignatura
          </button>
        </div>
        
        <div className="controles-asignaturas">
          <div className="buscador-asignaturas">
            <input
              type="text"
              placeholder="Buscar asignatura..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="input-busqueda-asignaturas"
            />
          </div>
          
          <div className="controles-paginacion-superior">
            <div className="seleccion-elementos-asignaturas">
              <span>Mostrar:</span>
              <select 
                value={elementosPorPagina} 
                onChange={(e) => {
                  setElementosPorPagina(Number(e.target.value));
                  setPaginaActual(1);
                }}
                className="select-elementos-asignaturas"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            
            <div className="info-cantidad-asignaturas">
              {asignaturasFiltradas.length} {asignaturasFiltradas.length === 1 ? 'asignatura encontrada' : 'asignaturas encontradas'}
            </div>
          </div>
        </div>
      </div>

      <div className="contenedor-tabla-asignaturas">
        <table className="tabla-asignaturas">
          <thead>
            <tr>
              <th className="columna-id-asignatura">ID</th>
              <th className="columna-nombre-asignatura">Nombre de la Asignatura</th>
              <th className="columna-codigo-asignatura">Código</th>
              <th className="columna-acciones-asignatura">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {elementosActuales.map((asignatura) => {
              const colorAsignatura = getColorAsignatura(asignatura.id_asignatura);
              // Generar código basado en ID (puedes adaptarlo según tu lógica)
              const codigo = `ASG-${asignatura.id_asignatura.toString().padStart(3, '0')}`;
              
              return (
                <tr key={asignatura.id_asignatura} className="fila-asignatura">
                  <td className="celda-id-asignatura">
                    <div className="badge-id-asignatura" style={{ 
                      backgroundColor: colorAsignatura.bg,
                      color: colorAsignatura.color,
                      borderColor: colorAsignatura.border
                    }}>
                      {asignatura.id_asignatura}
                    </div>
                  </td>
                  <td className="celda-nombre-asignatura">
                    <div className="nombre-asignatura-contenedor">
                      <div className="nombre-asignatura">{asignatura.nombre_asignatura}</div>
                      <div className="tipo-asignatura">
                        {/* Puedes agregar lógica para mostrar tipo si existe */}
                        {asignatura.tipo || "Asignatura Regular"}
                      </div>
                    </div>
                  </td>
                  <td className="celda-codigo-asignatura">
                    <div className="codigo-asignatura">
                      {codigo}
                    </div>
                  </td>
                  <td className="celda-acciones-asignatura">
                    <div className="botones-acciones-asignatura">
                      <button 
                        className="boton-editar-asignatura"
                        onClick={() => handleEditarAsignatura(asignatura)}
                      >
                        Editar
                      </button>
                      <button 
                        className="boton-eliminar-asignatura"
                        onClick={() => handleEliminarAsignatura(asignatura)}
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

      {/* Modal para crear/editar asignaturas */}
      {mostrarModal && (
        <div className="modal-fondo-asignaturas">
          <div className="modal-contenido-asignaturas">
            <div className="modal-cabecera-asignaturas">
              <h2>{modoEdicion ? 'Editar Asignatura' : 'Nueva Asignatura'}</h2>
              <button 
                className="modal-cerrar-asignaturas"
                onClick={() => setMostrarModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmitAsignatura}>
              <div className="modal-cuerpo-asignaturas">
                {modoEdicion && (
                  <div className="campo-formulario-asignaturas">
                    <label>ID de la Asignatura:</label>
                    <input
                      type="text"
                      value={asignaturaActual.id_asignatura}
                      disabled
                      className="input-formulario-asignaturas disabled"
                    />
                  </div>
                )}
                
                <div className="campo-formulario-asignaturas">
                  <label>Nombre de la Asignatura:</label>
                  <input
                    type="text"
                    name="nombre_asignatura"
                    value={asignaturaActual.nombre_asignatura}
                    onChange={handleChangeAsignatura}
                    required
                    className="input-formulario-asignaturas"
                    placeholder="Ej: Matemáticas, Programación, Historia"
                  />
                </div>
              </div>
              
              <div className="modal-pie-asignaturas">
                <button 
                  type="button" 
                  className="boton-cancelar-asignaturas"
                  onClick={() => setMostrarModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="boton-guardar-asignaturas"
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
        <div className="modal-fondo-asignaturas">
          <div className="modal-contenido-asignaturas modal-confirmacion">
            <div className="modal-cabecera-asignaturas">
              <h2>Confirmar Eliminación</h2>
              <button 
                className="modal-cerrar-asignaturas"
                onClick={() => setMostrarConfirmacionEliminar(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-cuerpo-asignaturas">
              <p>¿Estás seguro de que deseas eliminar la asignatura:</p>
              <p className="asignatura-a-eliminar">{asignaturaAEliminar?.nombre_asignatura}</p>
              <p>Esta acción no se puede deshacer.</p>
            </div>
            
            <div className="modal-pie-asignaturas">
              <button 
                className="boton-cancelar-asignaturas"
                onClick={() => {
                  setMostrarConfirmacionEliminar(false);
                  setAsignaturaAEliminar(null);
                }}
                disabled={cargando}
              >
                Cancelar
              </button>
              <button 
                className="boton-eliminar-confirmar"
                onClick={confirmarEliminarAsignatura}
                disabled={cargando}
              >
                {cargando ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paginador */}
      <div className="paginador-asignaturas">
        <div className="info-paginacion-asignaturas">
          Mostrando {indicePrimerElemento + 1} - {Math.min(indiceUltimoElemento, asignaturasFiltradas.length)} de {asignaturasFiltradas.length} asignaturas
        </div>
        
        <div className="controles-navegacion-asignaturas">
          <button 
            onClick={paginaAnterior} 
            disabled={paginaActual === 1}
            className="boton-paginador-asignaturas boton-anterior-asignaturas"
          >
            ← Anterior
          </button>

          <div className="numeros-pagina-asignaturas">
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
                  className={`numero-pagina-asignaturas ${paginaActual === numeroPagina ? 'activa' : ''}`}
                >
                  {numeroPagina}
                </button>
              );
            })}
            
            {totalPaginas > 5 && paginaActual < totalPaginas - 2 && (
              <>
                <span className="puntos-suspensivos-asignaturas">...</span>
                <button
                  onClick={() => cambiarPagina(totalPaginas)}
                  className={`numero-pagina-asignaturas ${paginaActual === totalPaginas ? 'activa' : ''}`}
                >
                  {totalPaginas}
                </button>
              </>
            )}
          </div>

          <button 
            onClick={paginaSiguiente} 
            disabled={paginaActual === totalPaginas}
            className="boton-paginador-asignaturas boton-siguiente-asignaturas"
          >
            Siguiente →
          </button>
        </div>
        
        <div className="totales-asignaturas">
          <div className="total-paginas-asignaturas">
            Página {paginaActual} de {totalPaginas}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Asignaturas;