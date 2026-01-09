import React, { useState, useEffect } from "react";
import { useUsuarios } from "../../hooks/useUsuarios.js";
import "../../css/Principal.css";
import "../../css/Usuarios.css";

const Usuarios = () => {
  const {
    usuarios,
    cargando,
    mensaje,
    recargarUsuarios,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    carreras,
    roles,
    getNombreCarrera,
    getNombreRol,
    toggleVerContrasena,
    limpiarMensaje,
  } = useUsuarios();

  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(10);
  const [busqueda, setBusqueda] = useState("");

  // Estados para el modal de formulario
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState({
    id_usuario: 0,
    nombres_usuario: "",
    apellidos_usuario: "",
    correo: "",
    contrasena: "",
    id_carrera: "",
    id_rol: "",
    contrasena_original: "", // Para guardar la contraseña original
    mostrarPassword: false, // Para mostrar/ocultar en el formulario
  });

  // Estado para confirmar eliminación
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] =
    useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);

  useEffect(() => {
    recargarUsuarios();
  }, []);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => {
        limpiarMensaje();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje, limpiarMensaje]);

  // Filtrar usuarios por búsqueda
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const busquedaLower = busqueda.toLowerCase();

    // Buscar por todos los campos
    return (
      (usuario.nombres_usuario?.toLowerCase() || "").includes(busquedaLower) ||
      (usuario.apellidos_usuario?.toLowerCase() || "").includes(
        busquedaLower
      ) ||
      (usuario.correo?.toLowerCase() || "").includes(busquedaLower) ||
      (getNombreCarrera(usuario.id_carrera)?.toLowerCase() || "").includes(
        busquedaLower
      ) ||
      (getNombreRol(usuario.id_rol)?.toLowerCase() || "").includes(
        busquedaLower
      ) ||
      (usuario.id_carrera?.toString() || "").includes(busqueda) ||
      (usuario.id_rol?.toString() || "").includes(busqueda) ||
      (usuario.contrasena_mostrar?.toLowerCase() || "").includes(busquedaLower)
    );
  });

  // Calcular elementos para la página actual
  const indiceUltimoElemento = paginaActual * elementosPorPagina;
  const indicePrimerElemento = indiceUltimoElemento - elementosPorPagina;
  const elementosActuales = usuariosFiltrados.slice(
    indicePrimerElemento,
    indiceUltimoElemento
  );
  const totalPaginas = Math.ceil(usuariosFiltrados.length / elementosPorPagina);

  // Funciones de paginación
  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const paginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const paginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      setPaginaActual(paginaActual + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Función para obtener color según rol del usuario
  const getColorUsuario = (idRol) => {
    const nombreRol = getNombreRol(idRol);
    switch (nombreRol) {
      case "Administrador":
        return { bg: "#e3f2fd", color: "#1976d2", border: "#bbdefb" };
      case "Estudiante":
        return { bg: "#e8f5e9", color: "#388e3c", border: "#c8e6c9" };
      case "Docente":
        return { bg: "#fff3e0", color: "#f57c00", border: "#ffe0b2" };
      default:
        return { bg: "#f5f5f5", color: "#616161", border: "#e0e0e0" };
    }
  };

  // Funciones CRUD usando el hook
  const handleNuevoUsuario = () => {
    setUsuarioActual({
      id_usuario: 0,
      nombres_usuario: "",
      apellidos_usuario: "",
      correo: "",
      contrasena: "",
      id_carrera: "",
      id_rol: "",
      contrasena_original: "",
      mostrarPassword: false,
    });
    setModoEdicion(false);
    setMostrarModal(true);
  };

  const handleEditarUsuario = async (usuario) => {
    // Al editar, obtenemos la contraseña original
    const usuarioEditado = {
      id_usuario: usuario.id_usuario,
      nombres_usuario: usuario.nombres_usuario || "",
      apellidos_usuario: usuario.apellidos_usuario || "",
      correo: usuario.correo || "",
      contrasena: usuario.contrasena, // Inicialmente vacío
      id_carrera: usuario.id_carrera || "",
      id_rol: usuario.id_rol || "",
      contrasena_original: usuario.contrasena_original || "",
      mostrarPassword: false,
    };

    // Si el usuario está mostrando su contraseña, la prellenamos
    if (usuario.mostrarContrasena && usuario.contrasena_original) {
      usuarioEditado.contrasena = usuario.contrasena_original;
    }

    setUsuarioActual(usuarioEditado);
    setModoEdicion(true);
    setMostrarModal(true);
  };

  const handleEliminarUsuario = (usuario) => {
    setUsuarioAEliminar(usuario);
    setMostrarConfirmacionEliminar(true);
  };

  const confirmarEliminarUsuario = async () => {
    if (usuarioAEliminar) {
      await eliminarUsuario(usuarioAEliminar.id_usuario);
      setMostrarConfirmacionEliminar(false);
      setUsuarioAEliminar(null);
    }
  };

  const handleSubmitUsuario = async (e) => {
    e.preventDefault();

    // Validación básica
    if (!usuarioActual.nombres_usuario.trim() || !usuarioActual.correo.trim()) {
      alert("Nombre y correo son obligatorios");
      return;
    }

    if (!modoEdicion && !usuarioActual.contrasena.trim()) {
      alert("La contraseña es obligatoria para nuevos usuarios");
      return;
    }

    // Preparar datos para enviar
    const usuarioParaEnviar = { ...usuarioActual };

    // Convertir a números
    usuarioParaEnviar.id_carrera = usuarioParaEnviar.id_carrera
      ? parseInt(usuarioParaEnviar.id_carrera)
      : null;
    usuarioParaEnviar.id_rol = parseInt(usuarioParaEnviar.id_rol);

    // Guardar la contraseña actual como original si estamos editando
    if (modoEdicion) {
      usuarioParaEnviar.contrasena_original = usuarioActual.contrasena_original;
    }

    if (modoEdicion) {
      await actualizarUsuario(usuarioParaEnviar);
    } else {
      await crearUsuario(usuarioParaEnviar);
    }

    setMostrarModal(false);
  };

  const handleChangeUsuario = (e) => {
    const { name, value } = e.target;
    setUsuarioActual((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleMostrarPassword = () => {
    setUsuarioActual((prev) => ({
      ...prev,
      mostrarPassword: !prev.mostrarPassword,
    }));
  };

 

  if (!usuarios.length && !cargando)
    return (
      <div className="estado-inicial">
        <h2>Usuarios no disponibles</h2>
        <p>No se encontraron usuarios en la base de datos.</p>
        <button className="boton-nuevo-usuario" onClick={handleNuevoUsuario}>
          + Crear Primer Usuario
        </button>
      </div>
    );

  return (
    <div className="contenedor-usuarios">
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

      <div className="cabecera-usuarios">
        <div className="titulo-usuarios-con-boton">
          <div>
            <h3>Gestión de Usuarios</h3>
          </div>
          <button className="boton-nuevo-usuario" onClick={handleNuevoUsuario}>
            + Nuevo Usuario
          </button>
        </div>

        <div className="controles-usuarios">
          <div className="buscador-usuarios">
            <input
              type="text"
              placeholder="Buscar por nombre, apellido, correo, contraseña, carrera o rol..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="input-busqueda-usuarios"
            />
          </div>

          <div className="controles-paginacion-superior">
            <div className="seleccion-elementos-usuarios">
              <span>Mostrar:</span>
              <select
                value={elementosPorPagina}
                onChange={(e) => {
                  setElementosPorPagina(Number(e.target.value));
                  setPaginaActual(1);
                }}
                className="select-elementos-usuarios"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>

            <div className="info-cantidad-usuarios">
              {usuariosFiltrados.length}{" "}
              {usuariosFiltrados.length === 1
                ? "usuario encontrado"
                : "usuarios encontrados"}
            </div>
          </div>
        </div>
      </div>

      <div className="contenedor-tabla-usuarios">
        <table className="tabla-usuarios">
          <thead>
            <tr>
              <th className="columna-id-usuario">ID</th>
              <th className="columna-nombre-usuario">Nombre Completo</th>
              <th className="columna-correo-usuario">Correo</th>
              <th className="columna-contrasena-usuario">Contraseña</th>
              <th className="columna-carrera-usuario">Carrera</th>
              <th className="columna-rol-usuario">Rol</th>
              <th className="columna-acciones-usuario">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {elementosActuales.map((usuario) => {
              const colorUsuario = getColorUsuario(usuario.id_rol);
              const nombreCarrera = getNombreCarrera(usuario.id_carrera);
              const nombreRol = getNombreRol(usuario.id_rol);

              return (
                <tr key={usuario.id_usuario} className="fila-usuario">
                  <td className="celda-id-usuario">
                    <div
                      className="badge-id-usuario"
                      style={{
                        backgroundColor: colorUsuario.bg,
                        color: colorUsuario.color,
                        borderColor: colorUsuario.border,
                      }}
                    >
                      {usuario.id_usuario}
                    </div>
                  </td>
                  <td className="celda-nombre-usuario">
                    <div className="nombre-usuario-contenedor">
                      <div className="nombre-completo-usuario">
                        {usuario.nombres_usuario} {usuario.apellidos_usuario}
                      </div>
                    </div>
                  </td>
                  <td className="celda-correo-usuario">
                    <div className="correo-usuario">{usuario.correo}</div>
                  </td>

                  <td className="celda-contrasena-usuario">
                    <div className="contrasena-contenedor">
                      <div
                        className={`contrasena-texto ${
                          usuario.mostrarContrasena ? "contrasena-visible" : ""
                        }`}
                      >
                        {usuario.mostrarContrasena
                          ? usuario.contrasena
                          : "••••••••"}
                      </div>
                      <button
                        className="boton-ver-contrasena"
                        onClick={() => toggleVerContrasena(usuario.id_usuario)}
                        title={
                          usuario.mostrarContrasena
                            ? "Ocultar contraseña"
                            : "Ver contraseña"
                        }
                      >
                        {usuario.mostrarContrasena ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                  </td>
                  <td className="celda-carrera-usuario">
                    <div className="info-con-badge">
                      <div className="nombre-carrera">{nombreCarrera}</div>
                      {usuario.id_carrera && (
                        <div className="badge-id-secundario">
                          ID: {usuario.id_carrera}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="celda-rol-usuario">
                    <div className="info-con-badge">
                      <div
                        className="rol-badge"
                        style={{
                          backgroundColor: colorUsuario.bg,
                          color: colorUsuario.color,
                          borderColor: colorUsuario.border,
                        }}
                      >
                        {nombreRol}
                      </div>
                      <div className="badge-id-secundario">
                        ID: {usuario.id_rol}
                      </div>
                    </div>
                  </td>
                  <td className="celda-acciones-usuario">
                    <div className="botones-acciones-usuario">
                      <button
                        className="boton-editar-usuario"
                        onClick={() => handleEditarUsuario(usuario)}
                        disabled={usuario.id_usuario === 21}
                        title={
                          usuario.id_usuario === 21
                            ? "El usuario Administrador no se puede editar"
                            : "Editar usuario"
                        }
                      >
                        Editar
                      </button>
                      <button
                        className="boton-eliminar-usuario"
                        onClick={() => handleEliminarUsuario(usuario)}
                        disabled={usuario.id_usuario === 21}
                        title={
                          usuario.id_usuario === 21
                            ? "El usuario Administrador no se puede eliminar"
                            : "Eliminar usuario"
                        }
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

      {/* Modal para crear/editar usuarios */}
      {mostrarModal && (
        <div className="modal-fondo-usuarios">
          <div className="modal-contenido-usuarios">
            <div className="modal-cabecera-usuarios">
              <h2>{modoEdicion ? "Editar Usuario" : "Nuevo Usuario"}</h2>
              <button
                className="modal-cerrar-usuarios"
                onClick={() => setMostrarModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitUsuario}>
              <div className="modal-cuerpo-usuarios">
                {modoEdicion && (
                  <div className="campo-formulario-usuarios">
                    <label>ID del Usuario:</label>
                    <input
                      type="text"
                      value={usuarioActual.id_usuario}
                      disabled
                      className="input-formulario-usuarios disabled"
                    />
                  </div>
                )}

                <div className="campo-formulario-usuarios">
                  <label>Nombres *</label>
                  <input
                    type="text"
                    name="nombres_usuario"
                    value={usuarioActual.nombres_usuario}
                    onChange={handleChangeUsuario}
                    required
                    className="input-formulario-usuarios"
                    placeholder="Ej: Juan Carlos"
                  />
                </div>

                <div className="campo-formulario-usuarios">
                  <label>Apellidos</label>
                  <input
                    type="text"
                    name="apellidos_usuario"
                    value={usuarioActual.apellidos_usuario}
                    onChange={handleChangeUsuario}
                    className="input-formulario-usuarios"
                    placeholder="Ej: Pérez Gómez"
                  />
                </div>

                <div className="campo-formulario-usuarios">
                  <label>Correo Electrónico *</label>
                  <input
                    type="email"
                    name="correo"
                    value={usuarioActual.correo}
                    onChange={handleChangeUsuario}
                    required
                    className="input-formulario-usuarios"
                    placeholder="usuario@ejemplo.com"
                  />
                </div>

                <div className="campo-formulario-usuarios">
                  <label>Contraseña {!modoEdicion && "*"}</label>
                  <div className="input-con-ojito">
                    <input
                      type={usuarioActual.mostrarPassword ? "text" : "password"}
                      name="contrasena"
                      value={usuarioActual.contrasena}
                      onChange={handleChangeUsuario}
                      required={!modoEdicion}
                      className="input-formulario-usuarios"
                      placeholder={
                        modoEdicion
                          ? "Dejar vacío para no cambiar"
                          : "Ingrese contraseña"
                      }
                    />
                    <button
                      type="button"
                      className="boton-ojito"
                      onClick={toggleMostrarPassword}
                      title={
                        usuarioActual.mostrarPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                    >
                      {usuarioActual.mostrarPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                  {modoEdicion && (
                    <small className="texto-ayuda">
                      Dejar vacío para mantener la contraseña actual
                    </small>
                  )}
                </div>

                {/* Campo de Carrera como SELECT */}
                <div className="campo-formulario-usuarios">
                  <label>Carrera</label>
                  <select
                    name="id_carrera"
                    value={usuarioActual.id_carrera || ""}
                    onChange={handleChangeUsuario}
                    className="select-formulario-usuarios"
                  >
                    <option value="">Seleccione una carrera</option>
                    {carreras.map((carrera) => (
                      <option
                        key={carrera.id_carrera}
                        value={carrera.id_carrera}
                      >
                        {carrera.nombre_carrera} (ID: {carrera.id_carrera})
                      </option>
                    ))}
                  </select>
                  <small className="texto-ayuda">
                    Actual: {getNombreCarrera(usuarioActual.id_carrera)}
                    {usuarioActual.id_carrera &&
                      ` (ID: ${usuarioActual.id_carrera})`}
                  </small>
                </div>

                {/* Campo de Rol como SELECT */}
                <div className="campo-formulario-usuarios">
                  <label>Rol *</label>
                  <select
                    name="id_rol"
                    value={usuarioActual.id_rol || ""}
                    onChange={handleChangeUsuario}
                    required
                    className="select-formulario-usuarios"
                  >
                    <option value="">Seleccione un rol</option>
                    {roles.map((rol) => (
                      <option key={rol.id_rol} value={rol.id_rol}>
                        {rol.nombre_rol} (ID: {rol.id_rol})
                      </option>
                    ))}
                  </select>
                  <small className="texto-ayuda">
                    Actual: {getNombreRol(usuarioActual.id_rol)}
                    {usuarioActual.id_rol && ` (ID: ${usuarioActual.id_rol})`}
                  </small>
                </div>
              </div>

              <div className="modal-pie-usuarios">
                <button
                  type="button"
                  className="boton-cancelar-usuarios"
                  onClick={() => setMostrarModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="boton-guardar-usuarios"
                  disabled={cargando}
                >
                  {cargando
                    ? "Procesando..."
                    : modoEdicion
                    ? "Actualizar"
                    : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {mostrarConfirmacionEliminar && (
        <div className="modal-fondo-usuarios">
          <div className="modal-contenido-usuarios modal-confirmacion">
            <div className="modal-cabecera-usuarios">
              <h2>Confirmar Eliminación</h2>
              <button
                className="modal-cerrar-usuarios"
                onClick={() => setMostrarConfirmacionEliminar(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-cuerpo-usuarios">
              <p>¿Estás seguro de que deseas eliminar al usuario:</p>
              <p className="usuario-a-eliminar">
                {usuarioAEliminar?.nombres_usuario}{" "}
                {usuarioAEliminar?.apellidos_usuario}
              </p>
              <p className="correo-usuario-a-eliminar">
                {usuarioAEliminar?.correo}
              </p>
              <p>
                <strong>ID Usuario:</strong> {usuarioAEliminar?.id_usuario}
              </p>
              <p>
                <strong>Carrera:</strong>{" "}
                {getNombreCarrera(usuarioAEliminar?.id_carrera)}
              </p>
              <p>
                <strong>Rol:</strong> {getNombreRol(usuarioAEliminar?.id_rol)}
              </p>
              <p className="alerta-eliminacion">
                ⚠️ Esta acción no se puede deshacer.
              </p>
              {usuarioAEliminar?.id_usuario === 21 && (
                <div className="alerta-admin">
                  ⚠️ El usuario Administrador es crítico para el sistema. No se
                  recomienda eliminarlo.
                </div>
              )}
            </div>

            <div className="modal-pie-usuarios">
              <button
                className="boton-cancelar-usuarios"
                onClick={() => {
                  setMostrarConfirmacionEliminar(false);
                  setUsuarioAEliminar(null);
                }}
                disabled={cargando}
              >
                Cancelar
              </button>
              <button
                className="boton-eliminar-confirmar"
                onClick={confirmarEliminarUsuario}
                disabled={cargando || usuarioAEliminar?.id_usuario === 21}
                title={
                  usuarioAEliminar?.id_usuario === 21
                    ? "El usuario Administrador no se puede eliminar"
                    : ""
                }
              >
                {cargando ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paginador */}
      <div className="paginador-usuarios">
        <div className="info-paginacion-usuarios">
          Mostrando {indicePrimerElemento + 1} -{" "}
          {Math.min(indiceUltimoElemento, usuariosFiltrados.length)} de{" "}
          {usuariosFiltrados.length} usuarios
        </div>

        <div className="controles-navegacion-usuarios">
          <button
            onClick={paginaAnterior}
            disabled={paginaActual === 1}
            className="boton-paginador-usuarios boton-anterior-usuarios"
          >
            ← Anterior
          </button>

          <div className="numeros-pagina-usuarios">
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
                  className={`numero-pagina-usuarios ${
                    paginaActual === numeroPagina ? "activa" : ""
                  }`}
                >
                  {numeroPagina}
                </button>
              );
            })}

            {totalPaginas > 5 && paginaActual < totalPaginas - 2 && (
              <>
                <span className="puntos-suspensivos-usuarios">...</span>
                <button
                  onClick={() => cambiarPagina(totalPaginas)}
                  className={`numero-pagina-usuarios ${
                    paginaActual === totalPaginas ? "activa" : ""
                  }`}
                >
                  {totalPaginas}
                </button>
              </>
            )}
          </div>

          <button
            onClick={paginaSiguiente}
            disabled={paginaActual === totalPaginas}
            className="boton-paginador-usuarios boton-siguiente-usuarios"
          >
            Siguiente →
          </button>
        </div>

        <div className="totales-usuarios">
          <div className="total-paginas-usuarios">
            Página {paginaActual} de {totalPaginas}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Usuarios;
