import React, { useState, useEffect } from "react";
import { useRecursos } from "../../hooks/useRecursos.js";
import "../../css/Principal.css";
import "../../css/Recursos.css";

const Recursos = () => {
  const usuarioStorage = JSON.parse(localStorage.getItem("usuario") || "{}");
  const idUsuarioActual = usuarioStorage.id_usuario || 22;
  const nombreUsuarioActual = usuarioStorage.nombres_usuario
    ? `${usuarioStorage.nombres_usuario} ${usuarioStorage.apellidos_usuario || ""}`.trim()
    : "Administrador";

  const {
    recursos,
    asignaturas,
    categorias,
    usuarios,
    cargando,
    cargandoDetalle,
    cargandoArchivo,
    recursoDetalle,
    recursoArchivoMeta,
    mensaje,
    recargarRecursos,
    crearRecurso,
    actualizarRecurso,
    eliminarRecurso,
    toggleEstadoRecurso,
    cargarRecursoDetalle,
    cargarRecursoArchivoMeta,
    abrirRecurso,
    descargarRecurso,
    limpiarDetalle,
    limpiarArchivoMeta,
    limpiarMensaje
  } = useRecursos();

  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(10);
  const [busqueda, setBusqueda] = useState("");
  const [filtroAsignatura, setFiltroAsignatura] = useState("");
  const [busquedaAsignatura, setBusquedaAsignatura] = useState("");
  const [mostrarOpcionesAsignatura, setMostrarOpcionesAsignatura] = useState(false);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  const [recursoActual, setRecursoActual] = useState({
    id_recurso: 0,
    titulo: "",
    tema: "",
    URL: "",
    PUBLIC_ID: "",
    contador_reportes: 0,
    id_asignatura: "",
    id_categoria: 1,
    id_usuario: idUsuarioActual,
    activo: 1
  });

  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
  const [recursoAEliminar, setRecursoAEliminar] = useState(null);

  const [archivoFormulario, setArchivoFormulario] = useState(null);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [urlManual, setUrlManual] = useState("");

  useEffect(() => {
    recargarRecursos();
  }, []);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => {
        limpiarMensaje();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje, limpiarMensaje]);

  useEffect(() => {
    const hayModalAbierto =
      mostrarModal || mostrarModalDetalle || mostrarConfirmacionEliminar;

    if (hayModalAbierto) {
      document.body.classList.add("modal-abierto");
    } else {
      document.body.classList.remove("modal-abierto");
    }

    return () => {
      document.body.classList.remove("modal-abierto");
    };
  }, [mostrarModal, mostrarModalDetalle, mostrarConfirmacionEliminar]);

  useEffect(() => {
    document.addEventListener("click", handleClickFueraDropdown);
    return () => {
      document.removeEventListener("click", handleClickFueraDropdown);
    };
  }, []);

  const esCategoriaLinks = () => {
    const categoriaSeleccionada = categorias.find(
      (c) => Number(c.id_categoria) === Number(recursoActual.id_categoria)
    );

    return (
      categoriaSeleccionada?.nombre_categoria === "Links" ||
      Number(recursoActual.id_categoria) === 4
    );
  };

  const asignaturasFiltradas = asignaturas.filter((asignatura) =>
    (asignatura.nombre_asignatura || "")
      .toLowerCase()
      .includes(busquedaAsignatura.toLowerCase())
  );

  const getNombreAsignaturaSeleccionada = () => {
    if (!filtroAsignatura) return "Todas las asignaturas";
    const asignatura = asignaturas.find(
      (a) => Number(a.id_asignatura) === Number(filtroAsignatura)
    );
    return asignatura ? asignatura.nombre_asignatura : "Todas las asignaturas";
  };

  const recursosFiltrados = recursos.filter((recurso) => {
    const textoBusqueda = busqueda.toLowerCase();

    const coincideBusqueda =
      (recurso.titulo || "").toLowerCase().includes(textoBusqueda) ||
      (recurso.tema || "").toLowerCase().includes(textoBusqueda) ||
      (recurso.URL || "").toLowerCase().includes(textoBusqueda) ||
      (recurso.PUBLIC_ID || "").toLowerCase().includes(textoBusqueda);

    const coincideAsignatura =
      filtroAsignatura === "" ||
      Number(recurso.id_asignatura) === Number(filtroAsignatura);

    return coincideBusqueda && coincideAsignatura;
  });

  const indiceUltimoElemento = paginaActual * elementosPorPagina;
  const indicePrimerElemento = indiceUltimoElemento - elementosPorPagina;
  const elementosActuales = recursosFiltrados.slice(
    indicePrimerElemento,
    indiceUltimoElemento
  );
  const totalPaginas = Math.max(1, Math.ceil(recursosFiltrados.length / elementosPorPagina));

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
      id_usuario: idUsuarioActual,
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
      titulo: recurso.titulo || "",
      tema: recurso.tema || "",
      URL: recurso.URL || "",
      PUBLIC_ID: recurso.PUBLIC_ID || "",
      contador_reportes: recurso.contador_reportes || 0,
      id_asignatura: recurso.id_asignatura || "",
      id_categoria: recurso.id_categoria || 1,
      id_usuario: recurso.id_usuario || idUsuarioActual,
      activo: recurso.activo !== undefined ? recurso.activo : 1
    });

    setArchivoFormulario(null);
    setNombreArchivo("");
    setUrlManual(recurso.URL || "");
    setModoEdicion(true);
    setMostrarModal(true);
  };

  const handleVerDetalle = async (recurso) => {
    const detalle = await cargarRecursoDetalle(recurso.id_recurso);
    if (!detalle.error) {
      await cargarRecursoArchivoMeta(recurso.id_recurso);
      setMostrarModalDetalle(true);
    }
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
    const archivo = e.target.files?.[0];
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

    if (!modoEdicion && esCategoriaLinks()) {
      if (!urlManual.trim()) {
        alert("Por favor ingresa una URL válida para el enlace");
        return;
      }
      datosRecurso.URL = urlManual.trim();
      datosRecurso.PUBLIC_ID = `link_${Date.now()}`;
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
      const nuevaCategoriaId = parseInt(value, 10);
      const esLinks =
        categorias.find((c) => Number(c.id_categoria) === nuevaCategoriaId)
          ?.nombre_categoria === "Links" || nuevaCategoriaId === 4;

      if (esLinks) {
        setArchivoFormulario(null);
        setNombreArchivo("");
      } else {
        setUrlManual("");
      }
    }

    setRecursoActual((prev) => ({
      ...prev,
      [name]:
        name === "id_categoria" || name === "id_asignatura"
          ? Number(value)
          : value
    }));
  };

  const getNombreAsignatura = (idAsignatura) => {
    const asignatura = asignaturas.find(
      (a) => Number(a.id_asignatura) === Number(idAsignatura)
    );
    return asignatura ? asignatura.nombre_asignatura : "Sin asignatura";
  };

  const getNombreCategoria = (idCategoria) => {
    const categoria = categorias.find(
      (c) => Number(c.id_categoria) === Number(idCategoria)
    );
    return categoria ? categoria.nombre_categoria : "Sin categoría";
  };

  const getNombreUsuario = (idUsuario) => {
    const usuario = usuarios.find((u) => Number(u.id_usuario) === Number(idUsuario));

    if (usuario) {
      return `${usuario.nombres_usuario || usuario.nombre || ""} ${
        usuario.apellidos_usuario || usuario.apellido || ""
      }`.trim();
    }

    if (Number(idUsuario) === Number(idUsuarioActual)) return nombreUsuarioActual;
    return "Usuario desconocido";
  };

  const getTipoDesdeExtension = (extension = "") => {
    const ext = extension.toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "imagen";
    if (["pdf"].includes(ext)) return "pdf";
    if (["doc", "docx"].includes(ext)) return "word";
    if (["xls", "xlsx", "csv"].includes(ext)) return "excel";
    if (["ppt", "pptx"].includes(ext)) return "powerpoint";
    if (["mp4", "avi", "mov", "mkv", "webm"].includes(ext)) return "video";
    if (["mp3", "wav", "ogg"].includes(ext)) return "audio";
    if (["txt", "zip", "rar"].includes(ext)) return "archivo";
    return "archivo";
  };

  const getTipoArchivo = (recurso) => {
    if (!recurso) return "archivo";

    if (Number(recurso.id_categoria) === 4) return "link";

    if (recurso.extension) {
      return getTipoDesdeExtension(recurso.extension);
    }

    const url = recurso.URL || "";
    if (!url) return "archivo";

    try {
      const cleanUrl = url.split("?")[0];
      const extension = cleanUrl.split(".").pop()?.toLowerCase() || "";
      return getTipoDesdeExtension(extension);
    } catch {
      return "archivo";
    }
  };

  const getIconoArchivo = (tipo) => {
    switch (tipo) {
      case "imagen":
        return "🖼️";
      case "pdf":
        return "📄";
      case "word":
        return "📝";
      case "excel":
        return "📊";
      case "powerpoint":
        return "📽️";
      case "video":
        return "🎬";
      case "audio":
        return "🎵";
      case "link":
        return "🔗";
      default:
        return "📎";
    }
  };

  const getNombreTipoArchivo = (tipo) => {
    switch (tipo) {
      case "link":
        return "Enlace web";
      case "imagen":
        return "Imagen";
      case "video":
        return "Video";
      case "pdf":
        return "PDF";
      case "word":
        return "Documento";
      case "excel":
        return "Hoja de cálculo";
      case "powerpoint":
        return "Presentación";
      case "audio":
        return "Audio";
      default:
        return "Archivo";
    }
  };

  const copiarTexto = async (texto, mensajeExito = "Texto copiado al portapapeles") => {
    if (!texto) return;

    try {
      await navigator.clipboard.writeText(texto);
      alert(mensajeExito);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  const getNombreUsuarioFormulario = (idUsuario) => {
    if (Number(idUsuario) === Number(idUsuarioActual)) {
      return `${nombreUsuarioActual} (Tú)`;
    }
    return getNombreUsuario(idUsuario);
  };

  const formatearFecha = (fechaString) => {
    if (!fechaString) return "No disponible";

    const fecha = new Date(fechaString);
    if (Number.isNaN(fecha.getTime())) return "No disponible";

    return fecha.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const cerrarModalDetalle = () => {
    setMostrarModalDetalle(false);
    limpiarDetalle();
    limpiarArchivoMeta();
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroAsignatura("");
    setBusquedaAsignatura("");
    setPaginaActual(1);
    setMostrarOpcionesAsignatura(false);
  };

  const seleccionarAsignatura = (idAsignatura) => {
    setFiltroAsignatura(idAsignatura ? idAsignatura.toString() : "");
    setBusquedaAsignatura("");
    setMostrarOpcionesAsignatura(false);
    setPaginaActual(1);
  };

  const handleClickFueraDropdown = (e) => {
    if (!e.target.closest(".combo-asignatura")) {
      setMostrarOpcionesAsignatura(false);
    }
  };

  const handleAbrirArchivo = async (idRecurso) => {
    await abrirRecurso(idRecurso);
  };

  const handleDescargarArchivo = async (idRecurso) => {
    await descargarRecurso(idRecurso);
  };

  if (cargando && !recursos.length) {
    return (
      <div className="estado-carga">
        <div className="spinner-grande"></div>
        <p>Cargando recursos...</p>
      </div>
    );
  }

  if (!recursos.length && !cargando) {
    return (
      <div className="estado-inicial">
        <h2>No hay recursos disponibles</h2>
        <p>No se encontraron recursos en la base de datos.</p>
        <button className="boton-nuevo-recurso" onClick={handleNuevoRecurso}>
          + Subir Primer Recurso
        </button>
      </div>
    );
  }

  return (
    <div className="contenedor-recursos recursos-pro">
      {mensaje && (
        <div className={`mensaje-api ${mensaje.toLowerCase().includes("error") ? "error" : "exito"}`}>
          <p>{mensaje}</p>
          <button className="boton-cerrar-mensaje" onClick={limpiarMensaje}>
            ×
          </button>
        </div>
      )}

      <div className="cabecera-recursos recursos-header-pro">
        <div className="titulo-recursos-con-boton recursos-header-minimal">
          <div className="recursos-header-info">
            <div className="recursos-badge-superior">
              <span>Biblioteca digital activa</span>
            </div>
            <p className="recursos-subinfo">
              Administra materiales, enlaces y archivos académicos desde un solo lugar.
            </p>
          </div>

          <button className="boton-nuevo-recurso" onClick={handleNuevoRecurso}>
            + Nuevo recurso
          </button>
        </div>

        <div className="controles-recursos controles-recursos-pro">
          <div className="filtros-recursos filtros-recursos-pro">
            <div className="filtro-bloque filtro-busqueda-principal">
              <label className="etiqueta-filtro-recursos">Búsqueda general</label>
              <div className="buscador-recursos">
                <input
                  type="text"
                  placeholder="Buscar por título, tema, URL o public_id"
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setPaginaActual(1);
                  }}
                  className="input-busqueda-recursos"
                />
              </div>
            </div>

            <div className="filtro-bloque filtro-asignatura-pro">
              <label className="etiqueta-filtro-recursos">Filtrar por asignatura</label>

              <div className={`combo-asignatura ${mostrarOpcionesAsignatura ? "combo-abierto" : ""}`}>
                <div
                  className="combo-header"
                  onClick={() => setMostrarOpcionesAsignatura(!mostrarOpcionesAsignatura)}
                >
                  <span className="combo-selected">{getNombreAsignaturaSeleccionada()}</span>
                  <span className="combo-arrow">▼</span>
                </div>

                {mostrarOpcionesAsignatura && (
                  <div className="combo-options">
                    <div className="combo-search">
                      <input
                        type="text"
                        placeholder="Buscar asignatura..."
                        value={busquedaAsignatura}
                        onChange={(e) => setBusquedaAsignatura(e.target.value)}
                        className="combo-search-input"
                        autoFocus
                      />
                    </div>

                    <div className="combo-list">
                      <div
                        className={`combo-option ${!filtroAsignatura ? "selected" : ""}`}
                        onClick={() => seleccionarAsignatura("")}
                      >
                        <span>Todas las asignaturas</span>
                        {!filtroAsignatura && <span className="check">✓</span>}
                      </div>

                      {asignaturasFiltradas.map((asignatura) => (
                        <div
                          key={asignatura.id_asignatura}
                          className={`combo-option ${
                            filtroAsignatura === asignatura.id_asignatura.toString()
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => seleccionarAsignatura(asignatura.id_asignatura)}
                        >
                          <span>{asignatura.nombre_asignatura}</span>
                          {filtroAsignatura === asignatura.id_asignatura.toString() && (
                            <span className="check">✓</span>
                          )}
                        </div>
                      ))}

                      {asignaturasFiltradas.length === 0 && (
                        <div className="combo-no-results">No se encontraron asignaturas</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {(busqueda || filtroAsignatura) && (
              <div className="filtro-bloque filtro-acciones-recursos">
                <label className="etiqueta-filtro-recursos etiqueta-invisible">Acciones</label>
                <button className="boton-limpiar-filtros" onClick={limpiarFiltros}>
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>

          <div className="controles-paginacion-superior controles-top-recursos">
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
              {recursosFiltrados.length}{" "}
              {recursosFiltrados.length === 1 ? "recurso encontrado" : "recursos encontrados"}
            </div>
          </div>
        </div>
      </div>

      <div className="contenedor-tabla-recursos tabla-recursos-pro">
        <table className="tabla-recursos">
          <thead>
            <tr>
              <th className="columna-id-recurso">ID</th>
              <th className="columna-titulo-recurso">Título</th>
              <th className="columna-tema-recurso">Tema</th>
              <th className="columna-url-recurso">Archivo / enlace</th>
              <th className="columna-tipo-recurso">Tipo</th>
              <th className="columna-asignatura-recurso">Asignatura</th>
              <th className="columna-categoria-recurso">Categoría</th>
              <th className="columna-usuario-recurso">Subido por</th>
              <th className="columna-fecha-recurso">Fecha</th>
              <th className="columna-estado-recurso">Estado</th>
              <th className="columna-acciones-recurso">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {elementosActuales.map((recurso) => {
              const tipoArchivo = getTipoArchivo(recurso);
              const iconoArchivo = getIconoArchivo(tipoArchivo);

              const fecha = new Date(
                recurso.fecha_subida || recurso.fecha_creacion || new Date()
              );

              const fechaFormateada = fecha.toLocaleDateString("es-ES", {
                year: "numeric",
                month: "short",
                day: "numeric"
              });

              const estaActivo = recurso.activo !== undefined ? Number(recurso.activo) === 1 : true;

              return (
                <tr
                  key={recurso.id_recurso}
                  className={`fila-recurso ${!estaActivo ? "recurso-inactivo" : ""}`}
                >
                  <td className="celda-id-recurso">
                    <div className="badge-id-recurso">{recurso.id_recurso}</div>
                  </td>

                  <td className="celda-titulo-recurso">
                    <div className="titulo-recurso">
                      <span className="titulo-recurso-principal">{recurso.titulo}</span>
                      {Number(recurso.contador_reportes) > 0 && (
                        <span className="badge-reportes">
                          ⚠️ {recurso.contador_reportes} reporte(s)
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="celda-tema-recurso">
                    <div className="tema-recurso" title={recurso.tema}>
                      {(recurso.tema || "").length > 50
                        ? `${recurso.tema.substring(0, 50)}...`
                        : recurso.tema}
                    </div>
                  </td>

                  <td className="celda-url-recurso">
                    {Number(recurso.id_categoria) === 4 ? (
                      <div className="url-info">
                        <button
                          onClick={() => copiarTexto(recurso.URL, "URL copiada al portapapeles")}
                          className="boton-copiar-url"
                          title="Copiar URL"
                        >
                          📋
                        </button>

                        <span
                          className="texto-url"
                          title={recurso.URL}
                          onClick={() => window.open(recurso.URL, "_blank", "noopener,noreferrer")}
                          style={{ cursor: "pointer", color: "#1976d2" }}
                        >
                          {(recurso.URL || "").length > 30
                            ? `${recurso.URL.substring(0, 30)}...`
                            : recurso.URL}
                        </span>
                      </div>
                    ) : (
                      <div className="url-info">
                        <button
                          onClick={() => handleAbrirArchivo(recurso.id_recurso)}
                          className="boton-copiar-url"
                          title="Abrir archivo"
                        >
                          👁
                        </button>

                        <span
                          className="texto-url"
                          title="Abrir archivo desde el backend"
                          onClick={() => handleAbrirArchivo(recurso.id_recurso)}
                          style={{ cursor: "pointer", color: "#1976d2" }}
                        >
                          {recurso.titulo || "Abrir archivo"}
                        </span>
                      </div>
                    )}
                  </td>

                  <td className="celda-tipo-recurso">
                    <div className="tipo-info">
                      <span className="icono-tipo">{iconoArchivo}</span>
                      <span className="nombre-tipo">{getNombreTipoArchivo(tipoArchivo)}</span>
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

                  <td className="celda-usuario-recurso">
                    <div className="usuario-info">
                      {Number(recurso.id_usuario) === Number(idUsuarioActual) ? (
                        <span className="usuario-actual">
                          {getNombreUsuario(recurso.id_usuario)} <em>(Tú)</em>
                        </span>
                      ) : (
                        getNombreUsuario(recurso.id_usuario)
                      )}
                    </div>
                  </td>

                  <td className="celda-fecha-recurso">
                    <div className="fecha-info">{fechaFormateada}</div>
                  </td>

                  <td className="celda-estado-recurso">
                    <div className="contenedor-estado">
                      <button
                        className={`boton-estado ${estaActivo ? "estado-activo" : "estado-inactivo"}`}
                        onClick={() => handleToggleEstado(recurso)}
                        title={estaActivo ? "Clic para desactivar" : "Clic para activar"}
                        disabled={cargando}
                      >
                        <span className="icono-estado">{estaActivo ? "✓" : "✗"}</span>
                        <span className="texto-estado">{estaActivo ? "Activo" : "Inactivo"}</span>
                      </button>
                    </div>
                  </td>

                  <td className="celda-acciones-recurso">
                    <div className="botones-acciones-recurso acciones-recursos-pro">
                      <button
                        className="boton-ver-detalle boton-accion-tabla"
                        onClick={() => handleVerDetalle(recurso)}
                        title="Ver detalle del recurso"
                      >
                        👁
                      </button>

                      {Number(recurso.id_categoria) !== 4 && (
                        <button
                          className="boton-ver-detalle boton-accion-tabla"
                          onClick={() => handleDescargarArchivo(recurso.id_recurso)}
                          title="Descargar archivo"
                          disabled={cargandoArchivo}
                        >
                          ⬇
                        </button>
                      )}

                      {Number(recurso.id_categoria) === 4 && (
                        <button
                          className="boton-ver-detalle boton-accion-tabla"
                          onClick={() =>
                            window.open(recurso.URL, "_blank", "noopener,noreferrer")
                          }
                          title="Abrir enlace"
                        >
                          🔗
                        </button>
                      )}

                      <button
                        className="boton-editar-recurso boton-accion-tabla"
                        onClick={() => handleEditarRecurso(recurso)}
                        title="Editar recurso"
                      >
                        Editar
                      </button>

                      <button
                        className="boton-eliminar-recurso boton-accion-tabla"
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
          <div className="modal-contenido-recursos recursos-modal-pro">
            <div className="modal-cabecera-recursos">
              <h2>{modoEdicion ? "Editar recurso" : "Nuevo recurso"}</h2>
              <button className="modal-cerrar-recursos" onClick={() => setMostrarModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitRecurso} className="formulario-modal-recursos">
              <div className="modal-cuerpo-recursos contenido-scroll-modal">
                {modoEdicion && (
                  <>
                    <div className="campo-formulario-recursos">
                      <label>ID del recurso:</label>
                      <input
                        type="text"
                        value={recursoActual.id_recurso}
                        disabled
                        className="input-formulario-recursos disabled"
                      />
                    </div>

                    <div className="campo-formulario-recursos">
                      <label>Archivo / URL actual:</label>
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
                            onClick={() => copiarTexto(recursoActual.URL, "URL copiada al portapapeles")}
                            title="Copiar URL"
                          >
                            📋
                          </button>

                          {Number(recursoActual.id_categoria) === 4 ? (
                            <a
                              href={recursoActual.URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="enlace-archivo-modal"
                              title="Abrir enlace"
                            >
                              🔗
                            </a>
                          ) : (
                            <button
                              type="button"
                              className="enlace-archivo-modal"
                              title="Abrir archivo"
                              onClick={() => handleAbrirArchivo(recursoActual.id_recurso)}
                            >
                              👁
                            </button>
                          )}
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
                    {asignaturas.map((asignatura) => (
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
                    {categorias.map((categoria) => (
                      <option key={categoria.id_categoria} value={categoria.id_categoria}>
                        {categoria.nombre_categoria}
                      </option>
                    ))}
                  </select>
                </div>

                {!modoEdicion && (
                  <div className="campo-formulario-recursos">
                    <label>{esCategoriaLinks() ? "URL del enlace:" : "Archivo:"}</label>

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
                          <small>Ingresa la URL completa del recurso web.</small>
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
                                Number(recursoActual.id_categoria) === 1
                                  ? ".jpg,.jpeg,.png,.gif,.webp"
                                  : Number(recursoActual.id_categoria) === 3
                                  ? ".mp4,.avi,.mov,.mkv,.webm"
                                  : ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
                              }
                              required={!modoEdicion}
                            />
                            <label htmlFor="archivo-recurso" className="label-subida-archivo">
                              <span className="icono-subida">📁</span>
                              <span>Haz clic para seleccionar un archivo</span>
                              <small className="texto-ayuda-archivo">
                                {Number(recursoActual.id_categoria) === 1
                                  ? "Formatos permitidos: JPG, PNG, GIF, WEBP"
                                  : Number(recursoActual.id_categoria) === 3
                                  ? "Formatos permitidos: MP4, AVI, MOV, MKV, WEBM"
                                  : "Formatos permitidos: PDF, Word, Excel, PowerPoint, TXT, ZIP"}
                              </small>
                            </label>
                          </div>
                        ) : (
                          <div className="archivo-seleccionado">
                            <span className="nombre-archivo">
                              {Number(recursoActual.id_categoria) === 1
                                ? "🖼️"
                                : Number(recursoActual.id_categoria) === 3
                                ? "🎬"
                                : "📄"}{" "}
                              {nombreArchivo}
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
                      value={getNombreUsuarioFormulario(recursoActual.id_usuario)}
                      disabled
                      className="input-formulario-recursos disabled"
                      style={{ backgroundColor: "#f0f8ff", color: "#2c3e50" }}
                    />

                    <input type="hidden" name="id_usuario" value={recursoActual.id_usuario} />

                    {modoEdicion && Number(recursoActual.id_usuario) !== Number(idUsuarioActual) && (
                      <span className="info-usuario-original">
                        ⓘ Este recurso fue subido originalmente por otro usuario
                      </span>
                    )}

                    {!modoEdicion && (
                      <span className="info-usuario-actual">
                        ⓘ El recurso se asociará automáticamente a tu usuario
                      </span>
                    )}
                  </div>
                </div>

                {!modoEdicion && (
                  <div className="info-tipo-recurso">
                    <div className={`alerta-tipo ${esCategoriaLinks() ? "alerta-link" : "alerta-archivo"}`}>
                      {esCategoriaLinks() ? (
                        <>
                          <span className="icono-alerta">🔗</span>
                          <span>
                            Estás creando un <strong>enlace web</strong>. Solo necesitas ingresar la URL.
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="icono-alerta">
                            {Number(recursoActual.id_categoria) === 1
                              ? "🖼️"
                              : Number(recursoActual.id_categoria) === 3
                              ? "🎬"
                              : "📄"}
                          </span>
                          <span>
                            Estás subiendo un <strong>{getNombreCategoria(recursoActual.id_categoria)}</strong>.
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
                  disabled={
                    cargando ||
                    (!modoEdicion && !esCategoriaLinks() && !archivoFormulario) ||
                    (!modoEdicion && esCategoriaLinks() && !urlManual.trim())
                  }
                >
                  {cargando ? "Procesando..." : modoEdicion ? "Actualizar" : "Subir recurso"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mostrarModalDetalle && recursoDetalle && (
        <div className="modal-fondo-recursos">
          <div className="modal-contenido-recursos modal-detalle-recursos recursos-modal-pro">
            <div className="modal-cabecera-recursos">
              <h2>Detalle del recurso</h2>
              <button className="modal-cerrar-recursos" onClick={cerrarModalDetalle}>
                ×
              </button>
            </div>

            {cargandoDetalle ? (
              <div className="carga-detalle">
                <div className="spinner"></div>
                <p>Cargando detalles del recurso...</p>
              </div>
            ) : (
              <>
                <div className="modal-cuerpo-recursos cuerpo-detalle">
                  <div className="cabecera-detalle">
                    <h3 className="titulo-detalle">{recursoDetalle.titulo}</h3>

                    <div className="badges-detalle">
                      <span className={`badge-estado ${Number(recursoDetalle.activo) === 1 ? "activo" : "inactivo"}`}>
                        {Number(recursoDetalle.activo) === 1 ? "Activo ✓" : "Inactivo ✗"}
                      </span>

                      <span className="badge-id">ID: {recursoDetalle.id_recurso}</span>

                      {Number(recursoDetalle.contador_reportes) > 0 && (
                        <span className="badge-reportes-detalle">
                          ⚠️ {recursoDetalle.contador_reportes} reporte(s)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid-detalle">
                    <div className="info-principal">
                      <h4>Información principal</h4>

                      <div className="campo-detalle">
                        <label>Tema:</label>
                        <p className="valor-detalle">{recursoDetalle.tema}</p>
                      </div>

                      <div className="campo-detalle">
                        <label>Archivo / URL:</label>

                        <div className="url-detalle">
                          <span
                            className="valor-url"
                            title={recursoDetalle.URL || "Archivo gestionado por backend"}
                          >
                            {Number(recursoDetalle.id_categoria) === 4
                              ? recursoDetalle.URL
                                ? recursoDetalle.URL.length > 60
                                  ? `${recursoDetalle.URL.substring(0, 60)}...`
                                  : recursoDetalle.URL
                                : "Sin URL"
                              : recursoArchivoMeta?.nombre_descarga || recursoDetalle.titulo}
                          </span>

                          <div className="botones-url">
                            {Number(recursoDetalle.id_categoria) === 4 ? (
                              <>
                                <button
                                  className="boton-copiar-detalle"
                                  onClick={() =>
                                    copiarTexto(recursoDetalle.URL, "URL copiada al portapapeles")
                                  }
                                  title="Copiar URL"
                                >
                                  📋 Copiar
                                </button>

                                <a
                                  href={recursoDetalle.URL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="boton-abrir-detalle"
                                >
                                  🔗 Abrir
                                </a>
                              </>
                            ) : (
                              <>
                                <button
                                  className="boton-copiar-detalle"
                                  onClick={() =>
                                    copiarTexto(
                                      recursoArchivoMeta?.nombre_descarga || recursoDetalle.titulo,
                                      "Nombre del archivo copiado"
                                    )
                                  }
                                  title="Copiar nombre"
                                >
                                  📋 Copiar
                                </button>

                                <button
                                  className="boton-abrir-detalle"
                                  onClick={() => handleAbrirArchivo(recursoDetalle.id_recurso)}
                                  type="button"
                                >
                                  👁 Ver
                                </button>

                                <button
                                  className="boton-abrir-detalle"
                                  onClick={() => handleDescargarArchivo(recursoDetalle.id_recurso)}
                                  type="button"
                                  disabled={cargandoArchivo}
                                >
                                  ⬇ Descargar
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {recursoDetalle.PUBLIC_ID && (
                        <div className="campo-detalle">
                          <label>Public ID:</label>
                          <p className="valor-detalle">{recursoDetalle.PUBLIC_ID}</p>
                        </div>
                      )}
                    </div>

                    <div className="info-clasificacion">
                      <h4>Clasificación</h4>

                      <div className="campo-detalle">
                        <label>Asignatura:</label>
                        <p className="valor-detalle">{recursoDetalle.asignatura}</p>
                      </div>

                      <div className="campo-detalle">
                        <label>Categoría:</label>
                        <p className="valor-detalle">{recursoDetalle.categoria}</p>
                      </div>

                      <div className="campo-detalle">
                        <label>Tipo de archivo:</label>
                        <p className="valor-detalle">
                          <span className="icono-tipo-detalle">
                            {getIconoArchivo(
                              Number(recursoDetalle.id_categoria) === 4
                                ? "link"
                                : getTipoArchivo({
                                    ...recursoDetalle,
                                    extension: recursoArchivoMeta?.extension
                                  })
                            )}
                          </span>{" "}
                          {Number(recursoDetalle.id_categoria) === 4
                            ? "Enlace web"
                            : recursoArchivoMeta?.extension
                            ? `${getNombreTipoArchivo(getTipoArchivo({
                                ...recursoDetalle,
                                extension: recursoArchivoMeta.extension
                              }))} (.${recursoArchivoMeta.extension})`
                            : getNombreTipoArchivo(getTipoArchivo(recursoDetalle))}
                        </p>
                      </div>

                      {recursoArchivoMeta?.mime_type && Number(recursoDetalle.id_categoria) !== 4 && (
                        <div className="campo-detalle">
                          <label>MIME type:</label>
                          <p className="valor-detalle">{recursoArchivoMeta.mime_type}</p>
                        </div>
                      )}
                    </div>

                    <div className="info-usuario">
                      <h4>Información del usuario</h4>

                      <div className="campo-detalle">
                        <label>Subido por:</label>
                        <p className="valor-detalle">{recursoDetalle.usuario}</p>
                      </div>

                      <div className="campo-detalle">
                        <label>ID Usuario:</label>
                        <p className="valor-detalle">{recursoDetalle.id_usuario}</p>
                      </div>

                      {Number(recursoDetalle.id_usuario) === Number(idUsuarioActual) && (
                        <div className="campo-detalle">
                          <span className="usuario-actual-detalle">
                            ✓ Este recurso fue subido por ti
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="info-interaccion">
                      <h4>Interacción</h4>
                      <div className="estadisticas-interaccion">
                        <div className="estadistica">
                          <span className="icono-estadistica">👍</span>
                          <div>
                            <span className="valor-estadistica">{recursoDetalle.total_likes || 0}</span>
                            <span className="label-estadistica">Likes</span>
                          </div>
                        </div>

                        <div className="estadistica">
                          <span className="icono-estadistica">👎</span>
                          <div>
                            <span className="valor-estadistica">{recursoDetalle.total_dislikes || 0}</span>
                            <span className="label-estadistica">Dislikes</span>
                          </div>
                        </div>

                        <div className="estadistica">
                          <span className="icono-estadistica">💬</span>
                          <div>
                            <span className="valor-estadistica">{recursoDetalle.total_comentarios || 0}</span>
                            <span className="label-estadistica">Comentarios</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {recursoDetalle.reportes && recursoDetalle.reportes.length > 0 && (
                    <div className="seccion-reportes">
                      <h4>Reportes ({recursoDetalle.reportes.length})</h4>
                      <div className="lista-reportes">
                        {recursoDetalle.reportes.map((reporte, index) => (
                          <div key={index} className="reporte-item">
                            <div className="cabecera-reporte">
                              <span className="motivo-reporte">
                                <strong>Motivo:</strong> {reporte.motivo}
                              </span>
                              <span className="fecha-reporte">
                                {formatearFecha(reporte.fecha_reporte)}
                              </span>
                            </div>

                            <div className="info-adicional-reporte">
                              <span className="id-reporte">
                                <strong>ID Reporte:</strong> {reporte.id_reporte}
                              </span>

                              {reporte.id_usuario !== null && reporte.id_usuario !== undefined && (
                                <span className="id-usuario-reportero">
                                  <strong>ID Usuario Reportero:</strong> {reporte.id_usuario}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {recursoDetalle.comentarios && recursoDetalle.comentarios.length > 0 && (
                    <div className="seccion-comentarios">
                      <h4>Comentarios ({recursoDetalle.comentarios.length})</h4>
                      <div className="lista-comentarios">
                        {recursoDetalle.comentarios.map((comentario, index) => (
                          <div key={index} className="comentario-item">
                            <div className="cabecera-comentario">
                              <span className="usuario-comentario">{comentario.usuario}</span>
                              <span className="fecha-comentario">
                                {formatearFecha(comentario.fecha)}
                              </span>
                            </div>
                            <p className="texto-comentario">{comentario.comentario}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!recursoDetalle.comentarios || recursoDetalle.comentarios.length === 0) &&
                    (!recursoDetalle.reportes || recursoDetalle.reportes.length === 0) && (
                      <div className="sin-interacciones">
                        <p>No hay comentarios ni reportes para este recurso.</p>
                      </div>
                    )}
                </div>

                <div className="modal-pie-recursos">
                  <button
                    type="button"
                    className="boton-editar-recursos"
                    onClick={() => {
                      cerrarModalDetalle();
                      handleEditarRecurso(recursoDetalle);
                    }}
                  >
                    Editar recurso
                  </button>

                  <button
                    type="button"
                    className="boton-cerrar-detalle"
                    onClick={cerrarModalDetalle}
                  >
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {mostrarConfirmacionEliminar && (
        <div className="modal-fondo-recursos">
          <div className="modal-contenido-recursos modal-confirmacion recursos-modal-pro">
            <div className="modal-cabecera-recursos">
              <h2>Confirmar eliminación</h2>
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
                <p><strong>Subido por:</strong> {getNombreUsuario(recursoAEliminar?.id_usuario)}</p>
                <p><strong>Asignatura:</strong> {getNombreAsignatura(recursoAEliminar?.id_asignatura)}</p>
                <p><strong>Categoría:</strong> {getNombreCategoria(recursoAEliminar?.id_categoria)}</p>
                <p><strong>Tipo:</strong> {getNombreTipoArchivo(getTipoArchivo(recursoAEliminar))}</p>
              </div>

              {recursoAEliminar?.URL && Number(recursoAEliminar.id_categoria) === 4 && (
                <div className="url-eliminar">
                  <p>
                    <strong>URL:</strong>{" "}
                    <span className="texto-url">
                      {recursoAEliminar.URL.length > 50
                        ? `${recursoAEliminar.URL.substring(0, 50)}...`
                        : recursoAEliminar.URL}
                    </span>
                  </p>

                  <button
                    className="boton-copiar-pequeno"
                    onClick={() => copiarTexto(recursoAEliminar.URL, "URL copiada al portapapeles")}
                  >
                    📋 Copiar URL
                  </button>
                </div>
              )}

              <p className="advertencia-eliminar">
                ⚠️ Esta acción eliminará permanentemente el recurso.
              </p>

              {Number(recursoAEliminar?.contador_reportes) > 0 && (
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
                {cargando ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="paginador-recursos paginador-recursos-pro">
        <div className="info-paginacion-recursos">
          Mostrando {recursosFiltrados.length === 0 ? 0 : indicePrimerElemento + 1} -{" "}
          {Math.min(indiceUltimoElemento, recursosFiltrados.length)} de{" "}
          {recursosFiltrados.length} recursos
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
                  className={`numero-pagina-recursos ${paginaActual === numeroPagina ? "activa" : ""}`}
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
                  className={`numero-pagina-recursos ${paginaActual === totalPaginas ? "activa" : ""}`}
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
    </div>
  );
};

export default Recursos;