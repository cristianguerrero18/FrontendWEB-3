import React, { useState, useEffect } from "react";
import { useRecursosUsuario } from "../hooks/useRecursosUsuario";
import "../css/Recursos.css";

const MisRecursos = () => {
  const {
    recursos,
    asignaturas,
    categorias,
    cargando,
    mensaje,
    archivo,
    filtros,
    idUsuario,
    userData,
    recargarRecursos,
    crearRecurso,
    actualizarRecurso,
    eliminarRecurso,
    toggleEstadoRecurso,
    manejarArchivo,
    limpiarArchivo,
    limpiarMensaje,
    setFiltros,
    limpiarFiltros
  } = useRecursosUsuario();

  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(10);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
  const [recursoAEliminar, setRecursoAEliminar] = useState(null);
  const [archivoFormulario, setArchivoFormulario] = useState(null);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [urlManual, setUrlManual] = useState("");

  const [recursoActual, setRecursoActual] = useState({
    id_recurso: 0,
    titulo: "",
    tema: "",
    URL: "",
    PUBLIC_ID: "",
    contador_reportes: 0,
    id_asignatura: "",
    id_categoria: 1,
    id_usuario: idUsuario,
    activo: 1
  });

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => {
        limpiarMensaje();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje, limpiarMensaje]);

  const esCategoriaLinks = () => {
    const categoriaSeleccionada = categorias.find(c => c.id_categoria === recursoActual.id_categoria);
    return categoriaSeleccionada?.nombre_categoria === "Links" || recursoActual.id_categoria === 4;
  };

  // Cálculos de paginación
  const indiceUltimoElemento = paginaActual * elementosPorPagina;
  const indicePrimerElemento = indiceUltimoElemento - elementosPorPagina;
  const elementosActuales = recursos.slice(indicePrimerElemento, indiceUltimoElemento);
  const totalPaginas = Math.ceil(recursos.length / elementosPorPagina);

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

  const handleNuevoRecurso = () => {
    setRecursoActual({
      id_recurso: 0,
      titulo: "",
      tema: "",
      URL: "",
      PUBLIC_ID: "",
      contador_reportes: 0,
      id_asignatura: "",
      id_categoria: 1,
      id_usuario: idUsuario,
      activo: 1
    });
    setArchivoFormulario(null);
    setNombreArchivo("");
    setUrlManual("");
    setModoEdicion(false);
    setMostrarModal(true);
  };

  const handleEditarRecurso = (recurso) => {
    setRecursoActual({
      id_recurso: recurso.id_recurso,
      titulo: recurso.titulo,
      tema: recurso.tema,
      URL: recurso.URL || "",
      PUBLIC_ID: recurso.PUBLIC_ID || "",
      contador_reportes: recurso.contador_reportes || 0,
      id_asignatura: recurso.id_asignatura,
      id_categoria: recurso.id_categoria || 1,
      id_usuario: recurso.id_usuario || idUsuario,
      activo: recurso.activo !== undefined ? recurso.activo : 1
    });
    setArchivoFormulario(null);
    setNombreArchivo("");
    setUrlManual(recurso.URL || "");
    setModoEdicion(true);
    setMostrarModal(true);
  };

  const handleEliminarRecurso = (recurso) => {
    setRecursoAEliminar(recurso);
    setMostrarConfirmacionEliminar(true);
  };

  const confirmarEliminarRecurso = async () => {
    if (recursoAEliminar) {
      await eliminarRecurso(recursoAEliminar.id_recurso);
      setMostrarConfirmacionEliminar(false);
      setRecursoAEliminar(null);
    }
  };

  const handleToggleEstado = async (recurso) => {
    const estadoActual = recurso.activo !== undefined ? recurso.activo : 1;
    await toggleEstadoRecurso(recurso.id_recurso, estadoActual);
  };

  const handleArchivoSeleccionado = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      setArchivoFormulario(archivo);
      setNombreArchivo(archivo.name);
    }
  };

  const handleQuitarArchivo = () => {
    setArchivoFormulario(null);
    setNombreArchivo("");
  };

  const handleSubmitRecurso = async (e) => {
    e.preventDefault();

    let datosRecurso = { ...recursoActual };

    if (!modoEdicion) {
      if (esCategoriaLinks()) {
        if (!urlManual.trim()) {
          alert("Por favor ingresa una URL válida para el enlace");
          return;
        }
        datosRecurso.URL = urlManual;
        datosRecurso.PUBLIC_ID = `link_${Date.now()}`;
      }
    }

    if (modoEdicion) {
      const resultado = await actualizarRecurso(datosRecurso);
      if (!resultado.error) {
        setMostrarModal(false);
        setArchivoFormulario(null);
        setNombreArchivo("");
        setUrlManual("");
      }
    } else {
      const resultado = await crearRecurso(
        datosRecurso,
        esCategoriaLinks() ? null : archivoFormulario
      );
      if (!resultado.error) {
        setMostrarModal(false);
        setArchivoFormulario(null);
        setNombreArchivo("");
        setUrlManual("");
      }
    }
  };

  const handleChangeRecurso = (e) => {
    const { name, value } = e.target;

    if (name === "id_categoria") {
      const nuevaCategoriaId = parseInt(value);
      const esLinks = categorias.find(c => c.id_categoria === nuevaCategoriaId)?.nombre_categoria === "Links";

      if (esLinks) {
        setArchivoFormulario(null);
        setNombreArchivo("");
      } else {
        setUrlManual("");
      }
    }

    setRecursoActual(prev => ({
      ...prev,
      [name]: name === "id_categoria" ? parseInt(value) : value
    }));
  };

  const handleChangeFiltro = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
    setPaginaActual(1);
  };

  const getNombreAsignatura = (idAsignatura) => {
    const asignatura = asignaturas.find(a => a.id_asignatura === idAsignatura);
    return asignatura ? asignatura.nombre_asignatura : "Sin asignatura";
  };

  const getNombreCategoria = (idCategoria) => {
    const categoria = categorias.find(c => c.id_categoria === idCategoria);
    return categoria ? categoria.nombre_categoria : "Sin categoría";
  };

  const getTipoArchivo = (url) => {
    if (!url) return "desconocido";

    const extension = url.split('.').pop().toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      return "imagen";
    } else if (['pdf'].includes(extension)) {
      return "pdf";
    } else if (['doc', 'docx'].includes(extension)) {
      return "word";
    } else if (['xls', 'xlsx'].includes(extension)) {
      return "excel";
    } else if (['ppt', 'pptx'].includes(extension)) {
      return "powerpoint";
    } else if (['mp4', 'avi', 'mov', 'mkv'].includes(extension)) {
      return "video";
    } else if (['mp3', 'wav', 'ogg'].includes(extension)) {
      return "audio";
    } else if (url.startsWith('http')) {
      return "link";
    } else {
      return "archivo";
    }
  };

  const getIconoArchivo = (tipo) => {
    switch(tipo) {
      case 'imagen': return '🖼️';
      case 'pdf': return '📄';
      case 'word': return '📝';
      case 'excel': return '📊';
      case 'powerpoint': return '📽️';
      case 'video': return '🎬';
      case 'audio': return '🎵';
      case 'link': return '🔗';
      default: return '📎';
    }
  };

  const copiarURL = (url) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        alert("URL copiada al portapapeles");
      })
      .catch(err => {
        console.error("Error al copiar URL:", err);
      });
  };

  if (cargando && !recursos.length) return (
    <div className="estado-carga">
      <div className="spinner-grande"></div>
      <p>Cargando tus recursos...</p>
    </div>
  );

  if (!cargando && !recursos.length) return (
    <div className="estado-inicial">
      <h2>No tienes recursos subidos</h2>
      <p>Comienza compartiendo recursos educativos con la comunidad.</p>
      <button
        className="boton-nuevo-recurso"
        onClick={handleNuevoRecurso}
      >
        + Subir Mi Primer Recurso
      </button>
    </div>
  );

  return (
    <div className="contenedor-recursos">
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

      <div className="cabecera-recursos">
        <div className="titulo-recursos-con-boton">
          <div>
            <h3>Mis Recursos</h3>
            <p className="info-usuario-actual">
              <strong>Usuario:</strong> {userData?.nombres_usuario || "Usuario"} {userData?.apellidos_usuario || ""}
            </p>
            <p className="info-total-recursos">
              <strong>Total de recursos:</strong> {recursos.length}
            </p>
          </div>
          <button
            className="boton-nuevo-recurso"
            onClick={handleNuevoRecurso}
          >
            + Nuevo Recurso
          </button>
        </div>

        <div className="controles-recursos">
          <div className="buscador-recursos">
            <input
              type="text"
              name="busqueda"
              placeholder="Buscar en mis recursos..."
              value={filtros.busqueda}
              onChange={handleChangeFiltro}
              className="input-busqueda-recursos"
            />
          </div>

          <div className="filtros-avanzados">
            <div className="filtro-item">
              <label htmlFor="filtro-asignatura">Asignatura:</label>
              <select
                id="filtro-asignatura"
                name="asignatura"
                value={filtros.asignatura}
                onChange={handleChangeFiltro}
                className="select-filtro"
              >
                <option value="">Todas las asignaturas</option>
                {asignaturas.map(asignatura => (
                  <option key={asignatura.id_asignatura} value={asignatura.id_asignatura}>
                    {asignatura.nombre_asignatura}
                  </option>
                ))}
              </select>
            </div>

            <div className="filtro-item">
              <label htmlFor="filtro-categoria">Categoría:</label>
              <select
                id="filtro-categoria"
                name="categoria"
                value={filtros.categoria}
                onChange={handleChangeFiltro}
                className="select-filtro"
              >
                <option value="">Todas las categorías</option>
                {categorias.map(categoria => (
                  <option key={categoria.id_categoria} value={categoria.id_categoria}>
                    {categoria.nombre_categoria}
                  </option>
                ))}
              </select>
            </div>

            {(filtros.asignatura || filtros.categoria || filtros.busqueda) && (
              <button
                className="boton-limpiar-filtros"
                onClick={limpiarFiltros}
              >
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="controles-paginacion-superior">
            <div className="seleccion-elementos-recursos">
              <span>Mostrar:</span>
              <select
                value={elementosPorPagina}
                onChange={(e) => {
                  setElementosPorPagina(Number(e.target.value));
                  setPaginaActual(1);
                }}
                className="select-elementos-recursos"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>

            <div className="info-cantidad-recursos">
              {recursos.length} {recursos.length === 1 ? 'recurso encontrado' : 'recursos encontrados'}
            </div>
          </div>
        </div>
      </div>

      <div className="contenedor-tabla-recursos">
        <table className="tabla-recursos">
          <thead>
            <tr>
              <th className="columna-id-recurso">ID</th>
              <th className="columna-titulo-recurso">Título</th>
              <th className="columna-tema-recurso">Tema</th>
              <th className="columna-url-recurso">URL</th>
              <th className="columna-tipo-recurso">Tipo</th>
              <th className="columna-asignatura-recurso">Asignatura</th>
              <th className="columna-categoria-recurso">Categoría</th>
              <th className="columna-fecha-recurso">Fecha</th>
              <th className="columna-reportes-recurso">Reportes</th>
              <th className="columna-estado-recurso">Estado</th>
              <th className="columna-acciones-recurso">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {elementosActuales.map((recurso) => {
              const tipoArchivo = getTipoArchivo(recurso.URL);
              const iconoArchivo = getIconoArchivo(tipoArchivo);

              const fecha = new Date(recurso.fecha_subida || recurso.fecha_creacion || new Date());
              const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });

              const estaActivo = recurso.activo !== undefined ? recurso.activo === 1 : true;

              return (
                <tr key={recurso.id_recurso} className={`fila-recurso ${!estaActivo ? 'recurso-inactivo' : ''}`}>
                  <td className="celda-id-recurso">
                    <div className="badge-id-recurso">
                      {recurso.id_recurso}
                    </div>
                  </td>
                  <td className="celda-titulo-recurso">
                    <div className="titulo-recurso">
                      {recurso.titulo}
                    </div>
                  </td>
                  <td className="celda-tema-recurso">
                    <div className="tema-recurso" title={recurso.tema}>
                      {recurso.tema.length > 50 ? recurso.tema.substring(0, 50) + '...' : recurso.tema}
                    </div>
                  </td>
                  <td className="celda-url-recurso">
                    {recurso.URL ? (
                      <div className="url-info">
                        <button
                          onClick={() => copiarURL(recurso.URL)}
                          className="boton-copiar-url"
                          title="Copiar URL"
                        >
                          📋
                        </button>
                        <span
                          className="texto-url"
                          title={recurso.URL}
                          onClick={() => window.open(recurso.URL, '_blank')}
                          style={{cursor: 'pointer', color: '#1976d2'}}
                        >
                          {recurso.URL.length > 30 ? recurso.URL.substring(0, 30) + '...' : recurso.URL}
                        </span>
                      </div>
                    ) : (
                      <span className="sin-url">Sin URL</span>
                    )}
                  </td>
                  <td className="celda-tipo-recurso">
                    <div className="tipo-info">
                      <span className="icono-tipo">{iconoArchivo}</span>
                      <span className="nombre-tipo">
                        {tipoArchivo === 'link' ? 'Enlace Web' :
                         tipoArchivo === 'imagen' ? 'Imagen' :
                         tipoArchivo === 'video' ? 'Video' :
                         tipoArchivo === 'pdf' ? 'PDF' :
                         tipoArchivo === 'word' ? 'Documento' :
                         tipoArchivo === 'excel' ? 'Hoja de cálculo' :
                         tipoArchivo === 'powerpoint' ? 'Presentación' :
                         tipoArchivo === 'audio' ? 'Audio' : 'Archivo'}
                      </span>
                    </div>
                  </td>
                  <td className="celda-asignatura-recurso">
                    {getNombreAsignatura(recurso.id_asignatura)}
                  </td>
                  <td className="celda-categoria-recurso">
                    <div className="badge-categoria">
                      {getNombreCategoria(recurso.id_categoria)}
                    </div>
                  </td>
                  <td className="celda-fecha-recurso">
                    <div className="fecha-info">
                      {fechaFormateada}
                    </div>
                  </td>
                  <td className="celda-reportes-recurso">
                    {recurso.contador_reportes > 0 ? (
                      <span className="badge-reportes">
                        ⚠️ {recurso.contador_reportes}
                      </span>
                    ) : (
                      <span className="sin-reportes">-</span>
                    )}
                  </td>
                  <td className="celda-estado-recurso">
                    <div className="contenedor-estado">
                      <button
                        className={`boton-estado ${estaActivo ? 'estado-activo' : 'estado-inactivo'}`}
                        onClick={() => handleToggleEstado(recurso)}
                        title={estaActivo ? 'Clic para desactivar' : 'Clic para activar'}
                        disabled={cargando}
                      >
                        <span className="icono-estado">
                          {estaActivo ? '✓' : '✗'}
                        </span>
                        <span className="texto-estado">
                          {estaActivo ? 'Activo' : 'Inactivo'}
                        </span>
                      </button>
                    </div>
                  </td>
                  <td className="celda-acciones-recurso">
                    <div className="botones-acciones-recurso">
                      <button
                        className="boton-editar-recurso"
                        onClick={() => handleEditarRecurso(recurso)}
                        title="Editar recurso"
                      >
                        Editar
                      </button>
                      <button
                        className="boton-eliminar-recurso"
                        onClick={() => handleEliminarRecurso(recurso)}
                        title="Eliminar recurso"
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

      {mostrarModal && (
        <div className="modal-fondo-recursos">
          <div className="modal-contenido-recursos">
            <div className="modal-cabecera-recursos">
              <h2>{modoEdicion ? 'Editar Recurso' : 'Nuevo Recurso'}</h2>
              <button
                className="modal-cerrar-recursos"
                onClick={() => setMostrarModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitRecurso}>
              <div className="modal-cuerpo-recursos">
                {modoEdicion && (
                  <>
                    <div className="campo-formulario-recursos">
                      <label>ID del Recurso:</label>
                      <input
                        type="text"
                        value={recursoActual.id_recurso}
                        disabled
                        className="input-formulario-recursos disabled"
                      />
                    </div>

                    <div className="campo-formulario-recursos">
                      <label>URL actual:</label>
                      {recursoActual.URL ? (
                        <div className="url-actual-info">
                          <input
                            type="text"
                            value={recursoActual.URL}
                            disabled
                            className="input-formulario-recursos disabled"
                          />
                          <button
                            type="button"
                            className="boton-copiar-modal"
                            onClick={() => copiarURL(recursoActual.URL)}
                            title="Copiar URL"
                          >
                            📋
                          </button>
                          <a
                            href={recursoActual.URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="enlace-archivo-modal"
                            title="Abrir recurso"
                          >
                            🔗
                          </a>
                        </div>
                      ) : (
                        <span className="sin-url-modal">Sin URL configurada</span>
                      )}
                    </div>

                    <div className="campo-formulario-recursos">
                      <label>Contador de reportes:</label>
                      <input
                        type="number"
                        name="contador_reportes"
                        value={recursoActual.contador_reportes}
                        onChange={handleChangeRecurso}
                        min="0"
                        className="input-formulario-recursos"
                      />
                    </div>
                  </>
                )}

                <div className="campo-formulario-recursos">
                  <label>Título:</label>
                  <input
                    type="text"
                    name="titulo"
                    value={recursoActual.titulo}
                    onChange={handleChangeRecurso}
                    required
                    className="input-formulario-recursos"
                    placeholder="Ej: Guía de Álgebra Básica"
                  />
                </div>

                <div className="campo-formulario-recursos">
                  <label>Tema:</label>
                  <textarea
                    name="tema"
                    value={recursoActual.tema}
                    onChange={handleChangeRecurso}
                    rows="3"
                    className="textarea-formulario-recursos"
                    placeholder="Describa el tema o contenido del recurso"
                    required
                  />
                </div>

                <div className="campo-formulario-recursos">
                  <label>Asignatura:</label>
                  <select
                    name="id_asignatura"
                    value={recursoActual.id_asignatura}
                    onChange={handleChangeRecurso}
                    required
                    className="select-formulario-recursos"
                  >
                    <option value="">Seleccionar asignatura</option>
                    {asignaturas.map(asignatura => (
                      <option key={asignatura.id_asignatura} value={asignatura.id_asignatura}>
                        {asignatura.nombre_asignatura}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="campo-formulario-recursos">
                  <label>Categoría:</label>
                  <select
                    name="id_categoria"
                    value={recursoActual.id_categoria}
                    onChange={handleChangeRecurso}
                    className="select-formulario-recursos"
                  >
                    {categorias.map(categoria => (
                      <option key={categoria.id_categoria} value={categoria.id_categoria}>
                        {categoria.nombre_categoria}
                      </option>
                    ))}
                  </select>
                </div>

                {!modoEdicion && (
                  <div className="campo-formulario-recursos">
                    <label>
                      {esCategoriaLinks() ? "URL del Enlace:" : "Archivo:"}
                    </label>

                    {esCategoriaLinks() ? (
                      <div className="campo-url-manual">
                        <input
                          type="url"
                          value={urlManual}
                          onChange={(e) => setUrlManual(e.target.value)}
                          placeholder="https://ejemplo.com/recurso"
                          className="input-formulario-recursos"
                          required={!modoEdicion}
                        />
                        <div className="info-url">
                          <small>Ingresa la URL completa del recurso web (YouTube, artículos, sitios educativos, etc.)</small>
                        </div>
                      </div>
                    ) : (
                      <div className="area-subida-archivo">
                        {!archivoFormulario ? (
                          <div className="dropzone-recursos">
                            <input
                              type="file"
                              id="archivo-recurso"
                              onChange={handleArchivoSeleccionado}
                              className="input-archivo-recursos"
                              accept={
                                recursoActual.id_categoria === 1 ? ".jpg,.jpeg,.png,.gif,.webp" :
                                recursoActual.id_categoria === 3 ? ".mp4,.avi,.mov,.mkv,.webm" :
                                ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
                              }
                              required={!modoEdicion}
                            />
                            <label htmlFor="archivo-recurso" className="label-subida-archivo">
                              <span className="icono-subida">📁</span>
                              <span>Haz clic para seleccionar un archivo</span>
                              <small className="texto-ayuda-archivo">
                                {recursoActual.id_categoria === 1 ? "Formatos permitidos: JPG, PNG, GIF, WEBP" :
                                 recursoActual.id_categoria === 3 ? "Formatos permitidos: MP4, AVI, MOV, MKV" :
                                 "Formatos permitidos: PDF, Word, Excel, PowerPoint, TXT, ZIP"}
                              </small>
                            </label>
                          </div>
                        ) : (
                          <div className="archivo-seleccionado">
                            <span className="nombre-archivo">
                              {recursoActual.id_categoria === 1 ? "🖼️" :
                               recursoActual.id_categoria === 3 ? "🎬" : "📄"} {nombreArchivo}
                            </span>
                            <button
                              type="button"
                              className="boton-quitar-archivo"
                              onClick={handleQuitarArchivo}
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="campo-formulario-recursos">
                  <label>Subido por:</label>
                  <div className="campo-usuario-bloqueado">
                    <input
                      type="text"
                      value={`${userData?.nombres_usuario || ""} ${userData?.apellidos_usuario || ""}`.trim() || "Usuario actual"}
                      disabled
                      className="input-formulario-recursos disabled"
                      style={{backgroundColor: '#f0f8ff', color: '#2c3e50'}}
                    />
                    <input
                      type="hidden"
                      name="id_usuario"
                      value={recursoActual.id_usuario}
                    />
                    <span className="info-usuario-actual">
                      ⓘ El recurso se asociará automáticamente a tu usuario
                    </span>
                  </div>
                </div>

                {!modoEdicion && (
                  <div className="info-tipo-recurso">
                    <div className={`alerta-tipo ${esCategoriaLinks() ? 'alerta-link' : 'alerta-archivo'}`}>
                      {esCategoriaLinks() ? (
                        <>
                          <span className="icono-alerta">🔗</span>
                          <span>Estás creando un <strong>enlace web</strong>. Solo necesitas ingresar la URL.</span>
                        </>
                      ) : (
                        <>
                          <span className="icono-alerta">
                            {recursoActual.id_categoria === 1 ? "🖼️" :
                             recursoActual.id_categoria === 3 ? "🎬" : "📄"}
                          </span>
                          <span>
                            Estás subiendo un <strong>{getNombreCategoria(recursoActual.id_categoria)}</strong>.
                            {recursoActual.id_categoria === 1 && " El archivo se subirá a Cloudinary."}
                            {recursoActual.id_categoria === 3 && " El video se subirá a Cloudinary."}
                            {recursoActual.id_categoria === 2 && " El archivo se subirá a Cloudinary."}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-pie-recursos">
                <button
                  type="button"
                  className="boton-cancelar-recursos"
                  onClick={() => setMostrarModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="boton-guardar-recursos"
                  disabled={cargando || (!modoEdicion && !esCategoriaLinks() && !archivoFormulario) || (!modoEdicion && esCategoriaLinks() && !urlManual)}
                  title={
                    !modoEdicion && !esCategoriaLinks() && !archivoFormulario ? "Debes seleccionar un archivo" :
                    !modoEdicion && esCategoriaLinks() && !urlManual ? "Debes ingresar una URL válida" : ""
                  }
                >
                  {cargando ? 'Procesando...' : (modoEdicion ? 'Actualizar' : 'Subir Recurso')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mostrarConfirmacionEliminar && (
        <div className="modal-fondo-recursos">
          <div className="modal-contenido-recursos modal-confirmacion">
            <div className="modal-cabecera-recursos">
              <h2>Confirmar Eliminación</h2>
              <button
                className="modal-cerrar-recursos"
                onClick={() => setMostrarConfirmacionEliminar(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-cuerpo-recursos">
              <p>¿Estás seguro de que deseas eliminar el recurso:</p>
              <p className="recurso-a-eliminar">"{recursoAEliminar?.titulo}"</p>

              <div className="info-eliminar-detalle">
                <p><strong>Asignatura:</strong> {getNombreAsignatura(recursoAEliminar?.id_asignatura)}</p>
                <p><strong>Categoría:</strong> {getNombreCategoria(recursoAEliminar?.id_categoria)}</p>
                <p><strong>Tipo:</strong> {getTipoArchivo(recursoAEliminar?.URL)}</p>
                <p><strong>Fecha:</strong> {new Date(recursoAEliminar?.fecha_subida).toLocaleDateString('es-ES')}</p>
              </div>

              {recursoAEliminar?.URL && (
                <div className="url-eliminar">
                  <p><strong>URL:</strong> <span className="texto-url">{recursoAEliminar.URL.substring(0, 50)}...</span></p>
                  <button
                    className="boton-copiar-pequeno"
                    onClick={() => copiarURL(recursoAEliminar.URL)}
                  >
                    📋 Copiar URL
                  </button>
                </div>
              )}

              <p className="advertencia-eliminar">
                ⚠️ Esta acción {recursoAEliminar?.URL?.includes('cloudinary') ? "eliminará permanentemente el recurso y su archivo asociado en Cloudinary." : "eliminará permanentemente el recurso."}
              </p>

              {recursoAEliminar?.contador_reportes > 0 && (
                <div className="alerta-reportes">
                  ⚠️ Este recurso tiene {recursoAEliminar.contador_reportes} reporte(s)
                </div>
              )}
            </div>

            <div className="modal-pie-recursos">
              <button
                className="boton-cancelar-recursos"
                onClick={() => {
                  setMostrarConfirmacionEliminar(false);
                  setRecursoAEliminar(null);
                }}
                disabled={cargando}
              >
                Cancelar
              </button>
              <button
                className="boton-eliminar-confirmar"
                onClick={confirmarEliminarRecurso}
                disabled={cargando}
              >
                {cargando ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {recursos.length > 0 && (
        <div className="paginador-recursos">
          <div className="info-paginacion-recursos">
            Mostrando {indicePrimerElemento + 1} - {Math.min(indiceUltimoElemento, recursos.length)} de {recursos.length} recursos
          </div>

          <div className="controles-navegacion-recursos">
            <button
              onClick={paginaAnterior}
              disabled={paginaActual === 1}
              className="boton-paginador-recursos boton-anterior-recursos"
            >
              ← Anterior
            </button>

            <div className="numeros-pagina-recursos">
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
                    className={`numero-pagina-recursos ${paginaActual === numeroPagina ? 'activa' : ''}`}
                  >
                    {numeroPagina}
                  </button>
                );
              })}

              {totalPaginas > 5 && paginaActual < totalPaginas - 2 && (
                <>
                  <span className="puntos-suspensivos-recursos">...</span>
                  <button
                    onClick={() => cambiarPagina(totalPaginas)}
                    className={`numero-pagina-recursos ${paginaActual === totalPaginas ? 'activa' : ''}`}
                  >
                    {totalPaginas}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={paginaSiguiente}
              disabled={paginaActual === totalPaginas}
              className="boton-paginador-recursos boton-siguiente-recursos"
            >
              Siguiente →
            </button>
          </div>

          <div className="totales-recursos">
            <div className="total-paginas-recursos">
              Página {paginaActual} de {totalPaginas}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisRecursos;