import React, { useState, useEffect } from "react";
import { useRoles } from "../../hooks/useRoles.js";
import "../../css/Principal.css";
import "../../css/Roles.css";

const Roles = () => {
  const { 
    roles, 
    cargando, 
    mensaje, 
    recargarRoles,
    crearRol,
    actualizarRol,
    eliminarRol,
    limpiarMensaje 
  } = useRoles();
  
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(10);
  const [busqueda, setBusqueda] = useState("");
  
  // Estados para el modal de formulario
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [rolActual, setRolActual] = useState({
    id_rol: 0,
    nombre_rol: "",
    descripcion: ""
  });
  
  // Estado para confirmar eliminación
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
  const [rolAEliminar, setRolAEliminar] = useState(null);

  useEffect(() => {
    recargarRoles();
  }, []);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => {
        limpiarMensaje();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje, limpiarMensaje]);

  // Filtrar roles por búsqueda
  const rolesFiltrados = roles.filter(rol =>
    rol.nombre_rol.toLowerCase().includes(busqueda.toLowerCase()) ||
    rol.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Calcular elementos para la página actual
  const indiceUltimoElemento = paginaActual * elementosPorPagina;
  const indicePrimerElemento = indiceUltimoElemento - elementosPorPagina;
  const elementosActuales = rolesFiltrados.slice(indicePrimerElemento, indiceUltimoElemento);
  const totalPaginas = Math.ceil(rolesFiltrados.length / elementosPorPagina);

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

  // Función para obtener color según ID del rol
  const getColorRol = (idRol) => {
    switch(idRol) {
      case 1: return { bg: '#e3f2fd', color: '#1976d2', border: '#bbdefb' }; // Admin
      case 2: return { bg: '#e8f5e9', color: '#388e3c', border: '#c8e6c9' }; // Estudiante
      case 3: return { bg: '#fff3e0', color: '#f57c00', border: '#ffe0b2' }; // Docente
      default: return { bg: '#f5f5f5', color: '#616161', border: '#e0e0e0' };
    }
  };

  // Funciones CRUD usando el hook
  const handleNuevoRol = () => {
    setRolActual({
      id_rol: 0,
      nombre_rol: "",
      descripcion: ""
    });
    setModoEdicion(false);
    setMostrarModal(true);
  };

  const handleEditarRol = (rol) => {
    setRolActual({
      id_rol: rol.id_rol,
      nombre_rol: rol.nombre_rol,
      descripcion: rol.descripcion
    });
    setModoEdicion(true);
    setMostrarModal(true);
  };

  const handleEliminarRol = (rol) => {
    setRolAEliminar(rol);
    setMostrarConfirmacionEliminar(true);
  };

  const confirmarEliminarRol = async () => {
    if (rolAEliminar) {
      await eliminarRol(rolAEliminar.id_rol);
      setMostrarConfirmacionEliminar(false);
      setRolAEliminar(null);
    }
  };

  const handleSubmitRol = async (e) => {
    e.preventDefault();
    
    if (modoEdicion) {
      // Actualizar rol existente
      await actualizarRol(rolActual);
    } else {
      // Crear nuevo rol
      await crearRol(rolActual);
    }
    
    setMostrarModal(false);
  };

  const handleChangeRol = (e) => {
    const { name, value } = e.target;
    setRolActual(prev => ({
      ...prev,
      [name]: value
    }));
  };

 
  if (!roles.length && !cargando) return (
    <div className="estado-inicial">
      <h2>Roles no disponibles</h2>
      <p>No se encontraron roles en la base de datos.</p>
      <button 
        className="boton-nuevo-rol"
        onClick={handleNuevoRol}
      >
        + Crear Primer Rol
      </button>
    </div>
  );

  return (
    <div className="contenedor-roles">
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

      <div className="cabecera-roles">
        <div className="titulo-roles-con-boton">
          <div>
            <h2>Gestión de Roles</h2>
          </div>
          <button 
            className="boton-nuevo-rol"
            onClick={handleNuevoRol}
          >
            + Nuevo Rol
          </button>
        </div>
        
        <div className="controles-roles">
          <div className="buscador-roles">
            <input
              type="text"
              placeholder="Buscar rol o descripción..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="input-busqueda-roles"
            />
          </div>
          
          <div className="controles-paginacion-superior">
            <div className="seleccion-elementos-roles">
              <span>Mostrar:</span>
              <select 
                value={elementosPorPagina} 
                onChange={(e) => {
                  setElementosPorPagina(Number(e.target.value));
                  setPaginaActual(1);
                }}
                className="select-elementos-roles"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            
            <div className="info-cantidad-roles">
              {rolesFiltrados.length} {rolesFiltrados.length === 1 ? 'rol encontrado' : 'roles encontrados'}
            </div>
          </div>
        </div>
      </div>

      <div className="contenedor-tabla-roles">
        <table className="tabla-roles">
          <thead>
            <tr>
              <th className="columna-id-rol">ID</th>
              <th className="columna-nombre-rol">Nombre del Rol</th>
              <th className="columna-descripcion-rol">Descripción</th>
              <th className="columna-acciones-rol">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {elementosActuales.map((rol) => {
              const colorRol = getColorRol(rol.id_rol);
              return (
                <tr key={rol.id_rol} className="fila-rol">
                  <td className="celda-id-rol">
                    <div className="badge-id-rol" style={{ 
                      backgroundColor: colorRol.bg,
                      color: colorRol.color,
                      borderColor: colorRol.border
                    }}>
                      {rol.id_rol}
                    </div>
                  </td>
                  <td className="celda-nombre-rol">
                    <div className="nombre-rol-contenedor">
                      <div className="nombre-rol">{rol.nombre_rol}</div>
                      <div className="nivel-acceso-rol">
                        {rol.id_rol === 1 ? 'Acceso Total' : 
                         rol.id_rol === 2 ? 'Acceso Limitado' : 
                         rol.id_rol === 3 ? 'Acceso Moderado' : 'Acceso Básico'}
                      </div>
                    </div>
                  </td>
                  <td className="celda-descripcion-rol">
                    <div className="descripcion-rol">
                      {rol.descripcion || "Sin descripción"}
                    </div>
                  </td>
                  <td className="celda-acciones-rol">
                    <div className="botones-acciones-rol">
                      <button 
                        className="boton-editar-rol"
                        onClick={() => handleEditarRol(rol)}
                        disabled={rol.id_rol === 1} // No permitir editar rol Admin
                        title={rol.id_rol === 1 ? "El rol Administrador no se puede editar" : "Editar rol"}
                      >
                        Editar
                      </button>
                      <button 
                        className="boton-eliminar-rol"
                        onClick={() => handleEliminarRol(rol)}
                        disabled={rol.id_rol === 1} // No permitir eliminar rol Admin
                        title={rol.id_rol === 1 ? "El rol Administrador no se puede eliminar" : "Eliminar rol"}
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
{/* Modal para crear/editar roles - Estructura normalizada */}
{mostrarModal && (
  <div className="modal-fondo-roles">
    <div className="modal-contenido-roles">
      <div className="modal-cabecera-roles">
        <h2>{modoEdicion ? 'Editar Rol' : 'Nuevo Rol'}</h2>
        <button 
          className="modal-cerrar-roles"
          onClick={() => setMostrarModal(false)}
        >
          ×
        </button>
      </div>
      
      <form onSubmit={handleSubmitRol}>
        <div className="modal-cuerpo-roles">
          {modoEdicion && (
            <div className="campo-formulario-roles">
              <label>ID del Rol:</label>
              <input
                type="text"
                value={rolActual.id_rol}
                disabled
                className="input-formulario-roles disabled"
              />
            </div>
          )}
          
          <div className="campo-formulario-roles">
            <label>Nombre del Rol:</label>
            <input
              type="text"
              name="nombre_rol"
              value={rolActual.nombre_rol}
              onChange={handleChangeRol}
              required
              className="input-formulario-roles"
              placeholder="Ej: Coordinador, Supervisor"
            />
          </div>
          
          <div className="campo-formulario-roles">
            <label>Descripción:</label>
            <textarea
              name="descripcion"
              value={rolActual.descripcion}
              onChange={handleChangeRol}
              rows="3"
              className="textarea-formulario-roles"
              placeholder="Describa las funciones y permisos de este rol"
            />
          </div>
        </div>
        
        <div className="modal-pie-roles">
          <button 
            type="button" 
            className="boton-cancelar-roles"
            onClick={() => setMostrarModal(false)}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="boton-guardar-roles"
            disabled={cargando}
          >
            {cargando ? 'Procesando...' : (modoEdicion ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{/* Modal de confirmación para eliminar - Estructura normalizada */}
{mostrarConfirmacionEliminar && (
  <div className="modal-fondo-roles">
    <div className="modal-contenido-roles modal-confirmacion">
      <div className="modal-cabecera-roles">
        <h2>Confirmar Eliminación</h2>
        <button 
          className="modal-cerrar-roles"
          onClick={() => setMostrarConfirmacionEliminar(false)}
        >
          ×
        </button>
      </div>
      
      <div className="modal-cuerpo-roles">
        <p>¿Estás seguro de que deseas eliminar el rol:</p>
        <div className="rol-a-eliminar">{rolAEliminar?.nombre_rol}</div>
        <p>Esta acción no se puede deshacer.</p>
        {rolAEliminar?.id_rol === 1 && (
          <div className="alerta-admin">
            ⚠️ El rol Administrador es crítico para el sistema. No se recomienda eliminarlo.
          </div>
        )}
      </div>
      
      <div className="modal-pie-roles">
        <button 
          className="boton-cancelar-roles"
          onClick={() => {
            setMostrarConfirmacionEliminar(false);
            setRolAEliminar(null);
          }}
          disabled={cargando}
        >
          Cancelar
        </button>
        <button 
          className="boton-eliminar-confirmar"
          onClick={confirmarEliminarRol}
          disabled={cargando || rolAEliminar?.id_rol === 1}
          title={rolAEliminar?.id_rol === 1 ? "El rol Administrador no se puede eliminar" : ""}
        >
          {cargando ? 'Eliminando...' : 'Eliminar'}
        </button>
      </div>
    </div>
  </div>
)}

      {/* Paginador */}
      <div className="paginador-roles">
        <div className="info-paginacion-roles">
          Mostrando {indicePrimerElemento + 1} - {Math.min(indiceUltimoElemento, rolesFiltrados.length)} de {rolesFiltrados.length} roles
        </div>
        
        <div className="controles-navegacion-roles">
          <button 
            onClick={paginaAnterior} 
            disabled={paginaActual === 1}
            className="boton-paginador-roles boton-anterior-roles"
          >
            ← Anterior
          </button>

          <div className="numeros-pagina-roles">
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
                  className={`numero-pagina-roles ${paginaActual === numeroPagina ? 'activa' : ''}`}
                >
                  {numeroPagina}
                </button>
              );
            })}
            
            {totalPaginas > 5 && paginaActual < totalPaginas - 2 && (
              <>
                <span className="puntos-suspensivos-roles">...</span>
                <button
                  onClick={() => cambiarPagina(totalPaginas)}
                  className={`numero-pagina-roles ${paginaActual === totalPaginas ? 'activa' : ''}`}
                >
                  {totalPaginas}
                </button>
              </>
            )}
          </div>

          <button 
            onClick={paginaSiguiente} 
            disabled={paginaActual === totalPaginas}
            className="boton-paginador-roles boton-siguiente-roles"
          >
            Siguiente →
          </button>
        </div>
        
        <div className="totales-roles">
          <div className="total-paginas-roles">
            Página {paginaActual} de {totalPaginas}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roles;