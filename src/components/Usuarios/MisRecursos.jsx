"use client";

import { useState, useEffect } from "react";
import { useRecursosUsuario } from "../../hooks/useRecursosUsuario.js";
import { useUser } from "../../context/UserContext.jsx";
import { getNombresAsignaturasPorCarrera } from "../../api/Admin/Pensum.js";
import "../../css/Recursos.css";

const MisRecursos = () => {
  const {
    recursos,
    asignaturas: todasAsignaturas,
    categorias,
    cargando,
    cargandoDetalle,
    mensaje,
    filtros,
    idUsuario,
    recursoDetalle,
    userData: recursosUserData,
    crearRecurso,
    actualizarRecurso,
    eliminarRecurso,
    toggleEstadoRecurso,
    cargarRecursoDetalle,
    limpiarDetalle,
    limpiarMensaje,
    setFiltros,
    limpiarFiltros,
  } = useRecursosUsuario();

  const { userData: contextoUserData } = useUser();
  const [asignaturasFiltradas, setAsignaturasFiltradas] = useState([]);
  const [cargandoAsignaturas, setCargandoAsignaturas] = useState(false);

  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(10);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] =
    useState(false);
  const [recursoAEliminar, setRecursoAEliminar] = useState(null);
  const [archivoFormulario, setArchivoFormulario] = useState(null);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [urlManual, setUrlManual] = useState("");

  const userData = contextoUserData || recursosUserData;

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
    activo: 1,
  });

  const [copyrightData, setCopyrightData] = useState({
    tipo_autoria: "propio",
    declara_autoria: false,
    acepta_terminos: false,
    nombre_autor_original: "",
    fuente_original: "",
    referencia_bibliografica: "",
    tipo_licencia: "",
    observaciones_licencia: "",
  });

  useEffect(() => {
    const cargarAsignaturasPorCarrera = async () => {
      if (userData?.id_carrera) {
        setCargandoAsignaturas(true);
        try {
          const asignaturas = await getNombresAsignaturasPorCarrera(
            userData.id_carrera
          );
          setAsignaturasFiltradas(asignaturas);
        } catch (error) {
          console.error("Error cargando asignaturas por carrera:", error);
          setAsignaturasFiltradas(todasAsignaturas);
        } finally {
          setCargandoAsignaturas(false);
        }
      } else {
        setAsignaturasFiltradas(todasAsignaturas);
      }
    };

    cargarAsignaturasPorCarrera();
  }, [userData?.id_carrera, todasAsignaturas]);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => {
        limpiarMensaje();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje, limpiarMensaje]);

  useEffect(() => {
    if (mostrarModal || mostrarModalDetalle || mostrarConfirmacionEliminar) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mostrarModal, mostrarModalDetalle, mostrarConfirmacionEliminar]);

  useEffect(() => {
    setPaginaActual(1);
  }, [recursos.length]);

  const esCategoriaLinks = () => {
    const categoriaSeleccionada = categorias.find(
      (c) => Number(c.id_categoria) === Number(recursoActual.id_categoria)
    );
    return (
      categoriaSeleccionada?.nombre_categoria === "Links" ||
      Number(recursoActual.id_categoria) === 4
    );
  };

  const indiceUltimoElemento = paginaActual * elementosPorPagina;
  const indicePrimerElemento = indiceUltimoElemento - elementosPorPagina;
  const elementosActuales = recursos.slice(
    indicePrimerElemento,
    indiceUltimoElemento
  );
  const totalPaginas = Math.ceil(recursos.length / elementosPorPagina);

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

  const resetCopyrightData = () => {
    setCopyrightData({
      tipo_autoria: "propio",
      declara_autoria: false,
      acepta_terminos: false,
      nombre_autor_original: "",
      fuente_original: "",
      referencia_bibliografica: "",
      tipo_licencia: "",
      observaciones_licencia: "",
    });
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
      activo: 1,
    });
    setArchivoFormulario(null);
    setNombreArchivo("");
    setUrlManual("");
    resetCopyrightData();
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
      activo: recurso.activo !== undefined ? recurso.activo : 1,
    });
    setArchivoFormulario(null);
    setNombreArchivo("");
    setUrlManual(recurso.URL || "");
    resetCopyrightData();
    setModoEdicion(true);
    setMostrarModal(true);
  };

  const handleVerDetalle = async (recurso) => {
    const resultado = await cargarRecursoDetalle(recurso.id_recurso);
    if (!resultado.error) {
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

  const handleChangeCopyright = (e) => {
    const { name, value, type, checked } = e.target;
    setCopyrightData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validarBloqueLegal = () => {
    if (!copyrightData.declara_autoria) {
      alert(
        "Debes declarar la titularidad o legitimidad del recurso antes de continuar."
      );
      return false;
    }

    if (!copyrightData.acepta_terminos) {
      alert("Debes aceptar los términos y condiciones de publicación.");
      return false;
    }

    if (
      ["tercero", "licencia", "dominio_publico"].includes(
        copyrightData.tipo_autoria
      )
    ) {
      if (!copyrightData.nombre_autor_original.trim()) {
        alert("Debes indicar el nombre del autor original del recurso.");
        return false;
      }

      if (!copyrightData.fuente_original.trim()) {
        alert("Debes indicar la fuente, enlace o procedencia del recurso.");
        return false;
      }

      if (!copyrightData.referencia_bibliografica.trim()) {
        alert("Debes registrar una referencia o citación básica del recurso.");
        return false;
      }
    }

    if (
      copyrightData.tipo_autoria === "licencia" &&
      !copyrightData.tipo_licencia.trim()
    ) {
      alert("Debes indicar el tipo de licencia o permiso de uso.");
      return false;
    }

    return true;
  };

  const handleSubmitRecurso = async (e) => {
    e.preventDefault();

    if (!modoEdicion && !validarBloqueLegal()) {
      return;
    }

    const datosRecurso = {
      ...recursoActual,
      copyright_simulado: !modoEdicion
        ? {
            ...copyrightData,
            fecha_declaracion: new Date().toISOString(),
          }
        : undefined,
    };

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
        resetCopyrightData();
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
        resetCopyrightData();
      }
    }
  };

  const handleChangeRecurso = (e) => {
    const { name, value } = e.target;

    if (name === "id_categoria") {
      const nuevaCategoriaId = Number.parseInt(value);
      const esLinks =
        categorias.find((c) => Number(c.id_categoria) === nuevaCategoriaId)
          ?.nombre_categoria === "Links";

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
          ? Number.parseInt(value) || value
          : value,
    }));
  };

  const handleChangeFiltro = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPaginaActual(1);
  };

  const cerrarModalDetalle = () => {
    setMostrarModalDetalle(false);
    limpiarDetalle();
  };

  const getNombreAsignatura = (idAsignatura) => {
    const asignatura = asignaturasFiltradas.find(
      (a) => Number(a.id_asignatura) === Number(idAsignatura)
    );
    if (asignatura) return asignatura.nombre_asignatura;

    const asignaturaTodas = todasAsignaturas.find(
      (a) => Number(a.id_asignatura) === Number(idAsignatura)
    );
    return asignaturaTodas
      ? asignaturaTodas.nombre_asignatura
      : "Sin asignatura";
  };

  const getNombreCategoria = (idCategoria) => {
    const categoria = categorias.find(
      (c) => Number(c.id_categoria) === Number(idCategoria)
    );
    return categoria ? categoria.nombre_categoria : "Sin categoría";
  };

  const getTipoArchivo = (url) => {
    if (!url) return "desconocido";

    const extension = url.split(".").pop().toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension)) {
      return "imagen";
    } else if (["pdf"].includes(extension)) {
      return "pdf";
    } else if (["doc", "docx"].includes(extension)) {
      return "word";
    } else if (["xls", "xlsx"].includes(extension)) {
      return "excel";
    } else if (["ppt", "pptx"].includes(extension)) {
      return "powerpoint";
    } else if (["mp4", "avi", "mov", "mkv", "webm"].includes(extension)) {
      return "video";
    } else if (["mp3", "wav", "ogg"].includes(extension)) {
      return "audio";
    } else if (url.startsWith("http")) {
      return "link";
    } else {
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

  const copiarURL = (url) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        alert("URL copiada al portapapeles");
      })
      .catch((err) => {
        console.error("Error al copiar URL:", err);
      });
  };

  const formatearFecha = (fechaValor) => {
    if (!fechaValor) return "No disponible";

    const fechaNormalizada =
      typeof fechaValor === "string"
        ? fechaValor.replace(" ", "T")
        : fechaValor;

    const fecha = new Date(fechaNormalizada);

    if (Number.isNaN(fecha.getTime())) return "No disponible";

    return fecha.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (cargando && !recursos.length) {
    return (
      <div className="estado-carga">
        <div className="spinner-grande"></div>
        <p>Cargando tus recursos...</p>
      </div>
    );
  }

  return (
    <div className="contenedor-recursos">
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

      {!cargando && recursos.length === 0 ? (
        <div className="estado-inicial">
          <h2>No tienes recursos subidos</h2>
          <p>Comienza compartiendo recursos educativos con la comunidad.</p>
          <button
            className="boton-nuevo-recurso"
            onClick={handleNuevoRecurso}
            type="button"
          >
            + Subir Mi Primer Recurso
          </button>
        </div>
      ) : (
        <>
          <div className="cabecera-recursos">
            <div className="titulo-recursos-con-boton">
              <button
                className="boton-nuevo-recurso"
                onClick={handleNuevoRecurso}
                type="button"
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
                    disabled={cargandoAsignaturas}
                  >
                    <option value="">Todas las asignaturas</option>
                    {asignaturasFiltradas.map((asignatura) => (
                      <option
                        key={asignatura.id_asignatura}
                        value={asignatura.id_asignatura}
                      >
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
                    {categorias.map((categoria) => (
                      <option
                        key={categoria.id_categoria}
                        value={categoria.id_categoria}
                      >
                        {categoria.nombre_categoria}
                      </option>
                    ))}
                  </select>
                </div>

                {(filtros.asignatura || filtros.categoria || filtros.busqueda) && (
                  <button
                    className="boton-limpiar-filtros"
                    onClick={limpiarFiltros}
                    type="button"
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
                  {recursos.length}{" "}
                  {recursos.length === 1
                    ? "recurso encontrado"
                    : "recursos encontrados"}
                </div>
              </div>
            </div>
          </div>

          <div className="contenedor-tabla-recursos">
            <table className="tabla-recursos">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Tema</th>
                  <th>URL</th>
                  <th>Tipo</th>
                  <th>Asignatura</th>
                  <th>Categoría</th>
                  <th>Fecha</th>
                  <th>Reportes</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {elementosActuales.map((recurso) => {
                  const tipoArchivo = getTipoArchivo(recurso.URL);
                  const iconoArchivo = getIconoArchivo(tipoArchivo);
                  const fechaFormateada = formatearFecha(
                    recurso.fecha_subida || recurso.fecha_creacion
                  );

                  return (
                    <tr key={recurso.id_recurso}>
                      <td>{recurso.id_recurso}</td>
                      <td>{recurso.titulo}</td>
                      <td>{recurso.tema}</td>
                      <td>
                        {recurso.URL ? (
                          <div className="url-info">
                            <button
                              onClick={() => copiarURL(recurso.URL)}
                              className="boton-copiar-url"
                              title="Copiar URL"
                              type="button"
                            >
                              📋
                            </button>
                            <span
                              className="texto-url"
                              title={recurso.URL}
                              onClick={() => window.open(recurso.URL, "_blank")}
                              style={{ cursor: "pointer", color: "#1976d2" }}
                            >
                              {recurso.URL.length > 30
                                ? recurso.URL.substring(0, 30) + "..."
                                : recurso.URL}
                            </span>
                          </div>
                        ) : (
                          <span className="sin-url">Sin URL</span>
                        )}
                      </td>
                      <td>
                        <div className="tipo-info">
                          <span className="icono-tipo">{iconoArchivo}</span>
                          <span className="nombre-tipo">
                            {tipoArchivo === "link"
                              ? "Enlace Web"
                              : tipoArchivo === "imagen"
                              ? "Imagen"
                              : tipoArchivo === "video"
                              ? "Video"
                              : tipoArchivo === "pdf"
                              ? "PDF"
                              : tipoArchivo === "word"
                              ? "Documento"
                              : tipoArchivo === "excel"
                              ? "Hoja de cálculo"
                              : tipoArchivo === "powerpoint"
                              ? "Presentación"
                              : tipoArchivo === "audio"
                              ? "Audio"
                              : "Archivo"}
                          </span>
                        </div>
                      </td>
                      <td>{getNombreAsignatura(recurso.id_asignatura)}</td>
                      <td>{getNombreCategoria(recurso.id_categoria)}</td>
                      <td>{fechaFormateada}</td>
                      <td>{recurso.contador_reportes || 0}</td>
                      <td>
                        <div className="botones-acciones-recurso">
                          <button
                            className="boton-ver-detalle"
                            onClick={() => handleVerDetalle(recurso)}
                            title="Ver detalle del recurso"
                            type="button"
                          >
                            👁️
                          </button>
                          <button
                            className="boton-editar-recurso"
                            onClick={() => handleEditarRecurso(recurso)}
                            title="Editar recurso"
                            type="button"
                          >
                            Editar
                          </button>
                          <button
                            className="boton-eliminar-recurso"
                            onClick={() => handleEliminarRecurso(recurso)}
                            title="Eliminar recurso"
                            type="button"
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

          {recursos.length > 0 && (
            <div className="paginador-recursos">
              <div className="info-paginacion-recursos">
                Mostrando {indicePrimerElemento + 1} -{" "}
                {Math.min(indiceUltimoElemento, recursos.length)} de{" "}
                {recursos.length} recursos
              </div>

              <div className="controles-navegacion-recursos">
                <button
                  onClick={paginaAnterior}
                  disabled={paginaActual === 1}
                  className="boton-paginador-recursos boton-anterior-recursos"
                  type="button"
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
                        className={`numero-pagina-recursos ${
                          paginaActual === numeroPagina ? "activa" : ""
                        }`}
                        type="button"
                      >
                        {numeroPagina}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={paginaSiguiente}
                  disabled={paginaActual === totalPaginas}
                  className="boton-paginador-recursos boton-siguiente-recursos"
                  type="button"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {mostrarModal && (
        <div
          className="modal-fondo-recursos"
          onClick={() => setMostrarModal(false)}
        >
          <div
            className="modal-contenido-recursos modal-contenido-legal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-cabecera-recursos">
              <h2>{modoEdicion ? "Editar Recurso" : "Nuevo Recurso"}</h2>
              <button
                type="button"
                className="modal-cerrar-recursos"
                onClick={() => setMostrarModal(false)}
              >
                ×
              </button>
            </div>

            <form
              className="formulario-modal-recursos"
              onSubmit={handleSubmitRecurso}
            >
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
                    disabled={cargandoAsignaturas}
                  >
                    <option value="">Seleccionar asignatura</option>
                    {asignaturasFiltradas.map((asignatura) => (
                      <option
                        key={asignatura.id_asignatura}
                        value={asignatura.id_asignatura}
                      >
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
                      <option
                        key={categoria.id_categoria}
                        value={categoria.id_categoria}
                      >
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
                            <label
                              htmlFor="archivo-recurso"
                              className="label-subida-archivo"
                            >
                              <span className="icono-subida">📁</span>
                              <span>Haz clic para seleccionar un archivo</span>
                              <small className="texto-ayuda-archivo">
                                Formatos permitidos según categoría
                              </small>
                            </label>
                          </div>
                        ) : (
                          <div className="archivo-seleccionado">
                            <span className="nombre-archivo">
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
                      value={
                        `${userData?.nombres_usuario || ""} ${
                          userData?.apellidos_usuario || ""
                        }`.trim() || "Usuario actual"
                      }
                      disabled
                      className="input-formulario-recursos disabled"
                    />
                    <input
                      type="hidden"
                      name="id_usuario"
                      value={recursoActual.id_usuario}
                    />
                  </div>
                </div>

                {!modoEdicion && (
                  <>
                    <div className="bloque-legal-recurso">
                      <div className="bloque-legal-header">
                        <div className="bloque-legal-icono">©</div>
                        <div>
                          <h3>Declaración de titularidad y derechos de autor</h3>
                          <p>
                            Antes de publicar este recurso, debes declarar bajo
                            tu responsabilidad la legitimidad del contenido.
                          </p>
                        </div>
                      </div>

                      <div className="campo-formulario-recursos">
                        <label>Condición de autoría del recurso:</label>
                        <select
                          name="tipo_autoria"
                          value={copyrightData.tipo_autoria}
                          onChange={handleChangeCopyright}
                          className="select-formulario-recursos"
                        >
                          <option value="propio">
                            Soy el autor original del recurso
                          </option>
                          <option value="tercero">
                            El recurso pertenece a un tercero y lo cito
                          </option>
                          <option value="licencia">
                            El recurso tiene licencia o permiso de uso
                          </option>
                          <option value="dominio_publico">
                            El recurso es de dominio público o uso libre
                          </option>
                        </select>
                      </div>

                      {copyrightData.tipo_autoria !== "propio" && (
                        <div className="grid-copyright">
                          <div className="campo-formulario-recursos">
                            <label>Nombre del autor original:</label>
                            <input
                              type="text"
                              name="nombre_autor_original"
                              value={copyrightData.nombre_autor_original}
                              onChange={handleChangeCopyright}
                              className="input-formulario-recursos"
                              placeholder="Nombre completo del autor, institución o entidad"
                            />
                          </div>

                          <div className="campo-formulario-recursos">
                            <label>Fuente o procedencia del recurso:</label>
                            <input
                              type="text"
                              name="fuente_original"
                              value={copyrightData.fuente_original}
                              onChange={handleChangeCopyright}
                              className="input-formulario-recursos"
                              placeholder="URL, libro, repositorio, editorial, revista, etc."
                            />
                          </div>

                          <div className="campo-formulario-recursos campo-full">
                            <label>Referencia o citación:</label>
                            <textarea
                              name="referencia_bibliografica"
                              value={copyrightData.referencia_bibliografica}
                              onChange={handleChangeCopyright}
                              rows="3"
                              className="textarea-formulario-recursos"
                              placeholder="Ejemplo: Apellido, N. (Año). Título del recurso. Editorial / URL"
                            />
                          </div>

                          {copyrightData.tipo_autoria === "licencia" && (
                            <>
                              <div className="campo-formulario-recursos">
                                <label>Tipo de licencia o permiso:</label>
                                <input
                                  type="text"
                                  name="tipo_licencia"
                                  value={copyrightData.tipo_licencia}
                                  onChange={handleChangeCopyright}
                                  className="input-formulario-recursos"
                                  placeholder="Creative Commons, permiso institucional, cesión, etc."
                                />
                              </div>

                              <div className="campo-formulario-recursos campo-full">
                                <label>Observaciones sobre licencia:</label>
                                <textarea
                                  name="observaciones_licencia"
                                  value={copyrightData.observaciones_licencia}
                                  onChange={handleChangeCopyright}
                                  rows="2"
                                  className="textarea-formulario-recursos"
                                  placeholder="Condiciones adicionales de uso, atribución, restricciones, etc."
                                />
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      <div className="aviso-legal-profesional">
                        <p>
                          <strong>Declaración responsable:</strong> El usuario
                          manifiesta que el recurso publicado no vulnera derechos
                          de autor, propiedad intelectual, derechos morales ni
                          derechos patrimoniales de terceros.
                        </p>
                        <p>
                          En caso de no ser autor original, el usuario declara
                          que cuenta con legitimidad suficiente para compartir el
                          contenido, citando adecuadamente la fuente y las
                          condiciones de uso correspondientes.
                        </p>
                      </div>

                      <div className="grupo-check-legal">
                        <label className="check-legal-item">
                          <input
                            type="checkbox"
                            name="declara_autoria"
                            checked={copyrightData.declara_autoria}
                            onChange={handleChangeCopyright}
                          />
                          <span>
                            Declaro bajo mi responsabilidad que la información
                            suministrada sobre autoría, procedencia y uso del
                            recurso es veraz.
                          </span>
                        </label>

                        <label className="check-legal-item">
                          <input
                            type="checkbox"
                            name="acepta_terminos"
                            checked={copyrightData.acepta_terminos}
                            onChange={handleChangeCopyright}
                          />
                          <span>
                            Acepto los términos y condiciones de publicación,
                            incluyendo la revisión, retiro o suspensión del
                            recurso si se detecta incumplimiento normativo o
                            reclamación válida de derechos.
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="info-tipo-recurso">
                      <div
                        className={`alerta-tipo ${
                          esCategoriaLinks() ? "alerta-link" : "alerta-archivo"
                        }`}
                      >
                        {esCategoriaLinks() ? (
                          <>
                            <span className="icono-alerta">🔗</span>
                            <span>
                              Estás creando un <strong>enlace web</strong>.
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="icono-alerta">📄</span>
                            <span>
                              Estás subiendo un recurso en la categoría{" "}
                              <strong>
                                {getNombreCategoria(recursoActual.id_categoria)}
                              </strong>
                              .
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </>
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
                    (!modoEdicion &&
                      !esCategoriaLinks() &&
                      !archivoFormulario) ||
                    (!modoEdicion && esCategoriaLinks() && !urlManual) ||
                    (!modoEdicion && !copyrightData.declara_autoria) ||
                    (!modoEdicion && !copyrightData.acepta_terminos)
                  }
                >
                  {cargando
                    ? "Procesando..."
                    : modoEdicion
                    ? "Actualizar"
                    : "Subir Recurso"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mostrarModalDetalle && recursoDetalle && (
        <div className="modal-fondo-recursos" onClick={cerrarModalDetalle}>
          <div
            className="modal-contenido-recursos modal-detalle-recursos"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-cabecera-recursos">
              <h2>Detalle del Recurso</h2>
              <button
                className="modal-cerrar-recursos"
                onClick={cerrarModalDetalle}
                type="button"
              >
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
                    <h3 className="titulo-detalle">
                      {recursoDetalle.titulo || "Sin título"}
                    </h3>

                    <div className="badges-detalle">
                      <span
                        className={`badge-estado ${
                          Number(recursoDetalle.activo) === 1
                            ? "activo"
                            : "inactivo"
                        }`}
                      >
                        {Number(recursoDetalle.activo) === 1
                          ? "Activo ✓"
                          : "Inactivo ✗"}
                      </span>

                      <span className="badge-id">
                        ID: {recursoDetalle.id_recurso || "N/A"}
                      </span>

                      <span className="badge-reportes-detalle">
                        ⚠️ {recursoDetalle.contador_reportes || 0} reporte(s)
                      </span>
                    </div>
                  </div>

                  <div className="grid-detalle">
                    <div className="tarjeta-detalle info-principal">
                      <h4>Información Principal</h4>

                      <div className="campo-detalle">
                        <label>Tema:</label>
                        <p className="valor-detalle">
                          {recursoDetalle.tema || "Sin tema registrado"}
                        </p>
                      </div>

                      <div className="campo-detalle">
                        <label>URL:</label>
                        {recursoDetalle.URL ? (
                          <div className="url-detalle">
                            <span
                              className="valor-url"
                              title={recursoDetalle.URL}
                            >
                              {recursoDetalle.URL}
                            </span>

                            <div className="botones-url">
                              <button
                                type="button"
                                className="boton-copiar-detalle"
                                onClick={() => copiarURL(recursoDetalle.URL)}
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
                            </div>
                          </div>
                        ) : (
                          <p className="valor-detalle">Sin URL registrada</p>
                        )}
                      </div>

                      <p className="mensaje-suspension">
                        ⚠ Los recursos con más de <strong>5 reportes</strong>{" "}
                        serán <strong>suspendidos</strong>.
                      </p>
                    </div>

                    <div className="tarjeta-detalle info-clasificacion">
                      <h4>Clasificación</h4>

                      <div className="campo-detalle">
                        <label>Asignatura:</label>
                        <p className="valor-detalle">
                          {recursoDetalle.asignatura ||
                            getNombreAsignatura(recursoDetalle.id_asignatura)}
                        </p>
                      </div>

                      <div className="campo-detalle">
                        <label>Categoría:</label>
                        <p className="valor-detalle">
                          {recursoDetalle.categoria ||
                            getNombreCategoria(recursoDetalle.id_categoria)}
                        </p>
                      </div>

                      <div className="campo-detalle">
                        <label>Tipo de archivo:</label>
                        <p className="valor-detalle valor-tipo-detalle">
                          <span className="icono-tipo-detalle">
                            {getIconoArchivo(getTipoArchivo(recursoDetalle.URL))}
                          </span>
                          <span>
                            {getTipoArchivo(recursoDetalle.URL) === "link"
                              ? "Enlace Web"
                              : getTipoArchivo(recursoDetalle.URL) === "imagen"
                              ? "Imagen"
                              : getTipoArchivo(recursoDetalle.URL) === "video"
                              ? "Video"
                              : getTipoArchivo(recursoDetalle.URL) === "pdf"
                              ? "PDF"
                              : getTipoArchivo(recursoDetalle.URL) === "word"
                              ? "Documento"
                              : getTipoArchivo(recursoDetalle.URL) === "excel"
                              ? "Hoja de cálculo"
                              : getTipoArchivo(recursoDetalle.URL) ===
                                "powerpoint"
                              ? "Presentación"
                              : getTipoArchivo(recursoDetalle.URL) === "audio"
                              ? "Audio"
                              : "Archivo"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="tarjeta-detalle info-usuario">
                      <h4>Información del Usuario</h4>

                      <div className="campo-detalle">
                        <label>Subido por:</label>
                        <p className="valor-detalle">
                          {recursoDetalle.usuario || "Usuario no disponible"}
                        </p>
                      </div>

                      <div className="campo-detalle">
                        <label>ID Usuario:</label>
                        <p className="valor-detalle">
                          {recursoDetalle.id_usuario || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="tarjeta-detalle info-fechas">
                      <h4>Información Adicional</h4>

                      <div className="campo-detalle">
                        <label>Fecha de creación:</label>
                        <p className="valor-detalle">
                          {recursoDetalle.fecha_creacion
                            ? new Date(
                                String(recursoDetalle.fecha_creacion).replace(
                                  " ",
                                  "T"
                                )
                              ).toLocaleString("es-CO", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: false,
                              })
                            : "No disponible"}
                        </p>
                      </div>

                      <div className="campo-detalle">
                        <label>Fecha de subida:</label>
                        <p className="valor-detalle">
                          {recursoDetalle.fecha_subida
                            ? new Date(
                                String(recursoDetalle.fecha_subida).replace(
                                  " ",
                                  "T"
                                )
                              ).toLocaleString("es-CO", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: false,
                              })
                            : "No disponible"}
                        </p>
                      </div>

                      <div className="campo-detalle">
                        <label>Estado actual:</label>
                        <p className="valor-detalle">
                          {Number(recursoDetalle.activo) === 1
                            ? "Recurso activo"
                            : "Recurso inactivo"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-pie-recursos modal-pie-detalle">
                  <button
                    type="button"
                    className="boton-editar-recurso"
                    onClick={() => {
                      cerrarModalDetalle();
                      handleEditarRecurso(recursoDetalle);
                    }}
                  >
                    Editar Recurso
                  </button>

                  <button
                    type="button"
                    className="boton-cancelar-recursos"
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
          <div className="modal-contenido-recursos modal-confirmacion">
            <div className="modal-cabecera-recursos">
              <h2>Confirmar Eliminación</h2>
              <button
                className="modal-cerrar-recursos"
                onClick={() => setMostrarConfirmacionEliminar(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="modal-cuerpo-recursos">
              <p>¿Estás seguro de que deseas eliminar el recurso?</p>
              <p className="recurso-a-eliminar">"{recursoAEliminar?.titulo}"</p>
            </div>

            <div className="modal-pie-recursos">
              <button
                className="boton-cancelar-recursos"
                onClick={() => {
                  setMostrarConfirmacionEliminar(false);
                  setRecursoAEliminar(null);
                }}
                disabled={cargando}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="boton-eliminar-confirmar"
                onClick={confirmarEliminarRecurso}
                disabled={cargando}
                type="button"
              >
                {cargando ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisRecursos;