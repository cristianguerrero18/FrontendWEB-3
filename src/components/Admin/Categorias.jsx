import React, { useState, useEffect } from "react";
import { useCategorias } from "../../hooks/useCategorias.js";
import "../../css/Principal.css";
import "../../css/Categorias.css";

const Categorias = () => {
  const { 
    categorias, 
    cargando, 
    mensaje, 
    recargarCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
    limpiarMensaje 
  } = useCategorias();
  
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(10);
  const [busqueda, setBusqueda] = useState("");
  
  // Estados para el modal de formulario
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [categoriaActual, setCategoriaActual] = useState({
    id_categoria: 0,
    nombre_categoria: ""
  });
  
  // Estado para confirmar eliminación
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);

  useEffect(() => {
    recargarCategorias();
  }, []);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => {
        limpiarMensaje();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje, limpiarMensaje]);

  // Filtrar categorías por búsqueda
  const categoriasFiltradas = categorias.filter(categoria =>
    categoria.nombre_categoria.toLowerCase().includes(busqueda.toLowerCase()) ||
    categoria.id_categoria.toString().includes(busqueda)
  );

  // Calcular elementos para la página actual
  const indiceUltimoElemento = paginaActual * elementosPorPagina;
  const indicePrimerElemento = indiceUltimoElemento - elementosPorPagina;
  const elementosActuales = categoriasFiltradas.slice(indicePrimerElemento, indiceUltimoElemento);
  const totalPaginas = Math.ceil(categoriasFiltradas.length / elementosPorPagina);

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

  // Función para obtener color según ID de la categoría
  const getColorCategoria = (idCategoria) => {
    switch(idCategoria) {
      case 1: return { bg: '#e1f5fe', color: '#0277bd', border: '#b3e5fc', icon: '🖼️' }; // Imágenes
      case 2: return { bg: '#f3e5f5', color: '#7b1fa2', border: '#e1bee7', icon: '📁' }; // Archivos
      case 3: return { bg: '#ffebee', color: '#d32f2f', border: '#ffcdd2', icon: '🎬' }; // Videos
      case 4: return { bg: '#f1f8e9', color: '#689f38', border: '#dcedc8', icon: '🔗' }; // Links
      default: return { bg: '#f5f5f5', color: '#616161', border: '#e0e0e0', icon: '📦' };
    }
  };

  // Funciones CRUD usando el hook
  const handleNuevaCategoria = () => {
    setCategoriaActual({
      id_categoria: 0,
      nombre_categoria: ""
    });
    setModoEdicion(false);
    setMostrarModal(true);
  };

  const handleEditarCategoria = (categoria) => {
    setCategoriaActual({
      id_categoria: categoria.id_categoria,
      nombre_categoria: categoria.nombre_categoria
    });
    setModoEdicion(true);
    setMostrarModal(true);
  };

  const handleEliminarCategoria = (categoria) => {
    setCategoriaAEliminar(categoria);
    setMostrarConfirmacionEliminar(true);
  };

  const confirmarEliminarCategoria = async () => {
    if (categoriaAEliminar) {
      await eliminarCategoria(categoriaAEliminar.id_categoria);
      setMostrarConfirmacionEliminar(false);
      setCategoriaAEliminar(null);
    }
  };

  const handleSubmitCategoria = async (e) => {
    e.preventDefault();
    
    if (modoEdicion) {
      // Actualizar categoría existente
      const resultado = await actualizarCategoria(categoriaActual);
      if (!resultado.error) {
        setMostrarModal(false);
      }
    } else {
      // Crear nueva categoría
      const resultado = await crearCategoria(categoriaActual);
      if (!resultado.error) {
        setMostrarModal(false);
      }
    }
  };

  const handleChangeCategoria = (e) => {
    const { name, value } = e.target;
    setCategoriaActual(prev => ({
      ...prev,
      [name]: value
    }));
  };


  if (!categorias.length && !cargando) return (
    <div className="estado-inicial">
      <h2>Categorías no disponibles</h2>
      <p>No se encontraron categorías en la base de datos.</p>
      <button 
        className="boton-nueva-categoria"
        onClick={handleNuevaCategoria}
      >
        + Crear Primera Categoría
      </button>
    </div>
  );

  return (
    <div className="contenedor-categorias">
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

      <div className="cabecera-categorias">
        <div className="titulo-categorias-con-boton">
          <div>
            <h3>Gestión de Categorías</h3>
          </div>
          <button 
            className="boton-nueva-categoria"
            onClick={handleNuevaCategoria}
          >
            + Nueva Categoría
          </button>
        </div>
        
        <div className="controles-categorias">
          <div className="buscador-categorias">
            <input
              type="text"
              placeholder="Buscar por nombre o ID..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="input-busqueda-categorias"
            />
          </div>
          
          <div className="controles-paginacion-superior">
            <div className="seleccion-elementos-categorias">
              <span>Mostrar:</span>
              <select 
                value={elementosPorPagina} 
                onChange={(e) => {
                  setElementosPorPagina(Number(e.target.value));
                  setPaginaActual(1);
                }}
                className="select-elementos-categorias"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            
            <div className="info-cantidad-categorias">
              {categoriasFiltradas.length} {categoriasFiltradas.length === 1 ? 'categoría encontrada' : 'categorías encontradas'}
            </div>
          </div>
        </div>
      </div>

      <div className="contenedor-tabla-categorias">
        <table className="tabla-categorias">
          <thead>
            <tr>
              <th className="columna-id-categoria">ID</th>
              <th className="columna-nombre-categoria">Nombre</th>
              <th className="columna-icono-categoria">Icono</th>
              <th className="columna-acciones-categoria">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {elementosActuales.map((categoria) => {
              const colorCategoria = getColorCategoria(categoria.id_categoria);
              return (
                <tr key={categoria.id_categoria} className="fila-categoria">
                  <td className="celda-id-categoria">
                    <div className="badge-id-categoria" style={{ 
                      backgroundColor: colorCategoria.bg,
                      color: colorCategoria.color,
                      borderColor: colorCategoria.border
                    }}>
                      {categoria.id_categoria}
                    </div>
                  </td>
                  <td className="celda-nombre-categoria">
                    <div className="nombre-categoria-contenedor">
                      <div className="nombre-categoria">{categoria.nombre_categoria}</div>
                      <div className="tipo-categoria">
                        {categoria.id_categoria === 1 ? 'Archivos de imagen' : 
                         categoria.id_categoria === 2 ? 'Documentos y archivos' : 
                         categoria.id_categoria === 3 ? 'Contenido multimedia' : 
                         categoria.id_categoria === 4 ? 'Enlaces web' : 'Categoría general'}
                      </div>
                    </div>
                  </td>
                  <td className="celda-icono-categoria">
                    <div className="icono-categoria" style={{ fontSize: '1.5rem' }}>
                      {colorCategoria.icon}
                    </div>
                  </td>
                  <td className="celda-acciones-categoria">
                    <div className="botones-acciones-categoria">
                      <button 
                        className="boton-editar-categoria"
                        onClick={() => handleEditarCategoria(categoria)}
                        disabled={categoria.id_categoria <= 4} // No permitir editar categorías del sistema
                        title={categoria.id_categoria <= 4 ? "Las categorías del sistema no se pueden editar" : "Editar categoría"}
                      >
                        Editar
                      </button>
                      <button 
                        className="boton-eliminar-categoria"
                        onClick={() => handleEliminarCategoria(categoria)}
                        disabled={categoria.id_categoria <= 4} // No permitir eliminar categorías del sistema
                        title={categoria.id_categoria <= 4 ? "Las categorías del sistema no se pueden eliminar" : "Eliminar categoría"}
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

      {/* Modal para crear/editar categorías */}
      {mostrarModal && (
        <div className="modal-fondo-categorias">
          <div className="modal-contenido-categorias">
            <div className="modal-cabecera-categorias">
              <h2>{modoEdicion ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
              <button 
                className="modal-cerrar-categorias"
                onClick={() => setMostrarModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmitCategoria}>
              <div className="modal-cuerpo-categorias">
                {modoEdicion && (
                  <div className="campo-formulario-categorias">
                    <label>ID de la Categoría:</label>
                    <input
                      type="text"
                      value={categoriaActual.id_categoria}
                      disabled
                      className="input-formulario-categorias disabled"
                    />
                  </div>
                )}
                
                <div className="campo-formulario-categorias">
                  <label>Nombre de la Categoría:</label>
                  <input
                    type="text"
                    name="nombre_categoria"
                    value={categoriaActual.nombre_categoria}
                    onChange={handleChangeCategoria}
                    required
                    className="input-formulario-categorias"
                    placeholder="Ej: Presentaciones, Guías, Ejercicios"
                  />
                  <small className="texto-ayuda">
                    Los nombres deben ser descriptivos y únicos
                  </small>
                </div>
                
                {!modoEdicion && (
                  <div className="info-nueva-categoria">
                    <div className="icono-info">ℹ️</div>
                    <div className="texto-info">
                      <strong>Nota:</strong> Las categorías creadas manualmente tendrán IDs mayores a 4.
                      Las categorías del sistema (1-4) no se pueden modificar ni eliminar.
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-pie-categorias">
                <button 
                  type="button" 
                  className="boton-cancelar-categorias"
                  onClick={() => setMostrarModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="boton-guardar-categorias"
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
        <div className="modal-fondo-categorias">
          <div className="modal-contenido-categorias modal-confirmacion">
            <div className="modal-cabecera-categorias">
              <h2>Confirmar Eliminación</h2>
              <button 
                className="modal-cerrar-categorias"
                onClick={() => setMostrarConfirmacionEliminar(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-cuerpo-categorias">
              <p>¿Estás seguro de que deseas eliminar la categoría:</p>
              <p className="categoria-a-eliminar">"{categoriaAEliminar?.nombre_categoria}"</p>
              <p>Esta acción no se puede deshacer.</p>
              {categoriaAEliminar?.id_categoria <= 4 && (
                <div className="alerta-categoria-sistema">
                  ⚠️ Esta es una categoría del sistema. No se recomienda eliminarla.
                </div>
              )}
              <div className="info-eliminacion">
                <p><strong>ID:</strong> {categoriaAEliminar?.id_categoria}</p>
                {categoriaAEliminar?.id_categoria > 4 && (
                  <p className="advertencia-recursos">
                    ⚠️ Si hay recursos asociados a esta categoría, deberán ser reasignados.
                  </p>
                )}
              </div>
            </div>
            
            <div className="modal-pie-categorias">
              <button 
                className="boton-cancelar-categorias"
                onClick={() => {
                  setMostrarConfirmacionEliminar(false);
                  setCategoriaAEliminar(null);
                }}
                disabled={cargando}
              >
                Cancelar
              </button>
              <button 
                className="boton-eliminar-confirmar"
                onClick={confirmarEliminarCategoria}
                disabled={cargando || categoriaAEliminar?.id_categoria <= 4}
                title={categoriaAEliminar?.id_categoria <= 4 ? "Las categorías del sistema no se pueden eliminar" : ""}
              >
                {cargando ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paginador */}
      <div className="paginador-categorias">
        <div className="info-paginacion-categorias">
          Mostrando {indicePrimerElemento + 1} - {Math.min(indiceUltimoElemento, categoriasFiltradas.length)} de {categoriasFiltradas.length} categorías
        </div>
        
        <div className="controles-navegacion-categorias">
          <button 
            onClick={paginaAnterior} 
            disabled={paginaActual === 1}
            className="boton-paginador-categorias boton-anterior-categorias"
          >
            ← Anterior
          </button>

          <div className="numeros-pagina-categorias">
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
                  className={`numero-pagina-categorias ${paginaActual === numeroPagina ? 'activa' : ''}`}
                >
                  {numeroPagina}
                </button>
              );
            })}
            
            {totalPaginas > 5 && paginaActual < totalPaginas - 2 && (
              <>
                <span className="puntos-suspensivos-categorias">...</span>
                <button
                  onClick={() => cambiarPagina(totalPaginas)}
                  className={`numero-pagina-categorias ${paginaActual === totalPaginas ? 'activa' : ''}`}
                >
                  {totalPaginas}
                </button>
              </>
            )}
          </div>

          <button 
            onClick={paginaSiguiente} 
            disabled={paginaActual === totalPaginas}
            className="boton-paginador-categorias boton-siguiente-categorias"
          >
            Siguiente →
          </button>
        </div>
        
        <div className="totales-categorias">
          <div className="total-paginas-categorias">
            Página {paginaActual} de {totalPaginas}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categorias;