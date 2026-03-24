import { useSemestres } from "../../hooks/useSemestres.js"
import { useMaterias } from "../../hooks/useMaterias.js"
import { useRecursosMateria } from "../../hooks/useRecursosMateria.js"
import { useAsignaturasEstudiante } from "../../hooks/useAsignaturasEstudiante.js"
import { useAgregarRecurso } from "../../hooks/useAgregarRecurso.js"
import { useFavoritos } from "../../hooks/useFavoritos.js"
import { useReportes } from "../../hooks/useReportes.js"
import { useRecursoLikes } from "../../hooks/useRecursoLikes.js"
import { useComentarios } from "../../hooks/useComentarios.js"
import { useUser } from "../../context/UserContext.jsx"
import {
  BookOpen,
  GraduationCap,
  ArrowLeft,
  Book,
  AlertCircle,
  Home,
  FolderOpen,
  Hash,
  FileText,
  Image,
  Link,
  File,
  Download,
  Eye,
  X,
  Plus,
  Upload,
  Globe,
  Check,
  AlertTriangle,
  Copyright,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
  Edit2,
  Trash2,
  Smile,
  Clock,
} from "lucide-react"
import "../../css/semestres.css"
import { useState, useEffect, useCallback, useRef } from "react"

const Semestres = () => {
  const {
    semestres,
    loading: loadingSemestres,
    error: errorSemestres,
    tipoCarrera,
    idCarrera,
    nombreCarrera,
  } = useSemestres()

  const {
    materiasPorSemestre,
    loading: loadingMaterias,
    error: errorMaterias,
    getMateriasPorSemestre,
    cargarMaterias,
  } = useMaterias()

  const {
    recursos,
    loading: loadingRecursos,
    error: errorRecursos,
    cargarRecursosMateria,
    getRecursosPorIdAsignatura,
    materiaTieneRecursos,
    contarRecursosPorTipo,
    recargarRecursosMateria,
  } = useRecursosMateria()

  const {
    asignaturas,
    loading: loadingAsignaturas,
    error: errorAsignaturas,
    getAsignaturasPorSemestre,
    cargarAsignaturas,
  } = useAsignaturasEstudiante()

  const {
    cargando: cargandoRecurso,
    error: errorAgregarRecurso,
    exito: exitoAgregarRecurso,
    categorias,
    cargarCategorias,
    agregarRecurso,
    limpiarMensajes,
  } = useAgregarRecurso()

  const {
    favoritosPorUsuario,
    loading: loadingFavoritos,
    error: errorFavoritos,
    esFavorito,
    alternarFavorito,
    operacion: operacionFavorito,
    cargarFavoritosUsuario,
  } = useFavoritos()

  const {
    cargando: cargandoReporte,
    error: errorReporte,
    exito: exitoReporte,
    operacion: operacionReporte,
    reportarRecurso,
    usuarioReportoRecurso,
    limpiarMensajesReporte,
  } = useReportes()

  const { getUserId } = useUser()

  const [semestreSeleccionado, setSemestreSeleccionado] = useState(null)
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null)
  const [mostrarMaterias, setMostrarMaterias] = useState(false)
  const [mostrarRecursos, setMostrarRecursos] = useState(false)
  const [mostrarFormularioRecurso, setMostrarFormularioRecurso] = useState(false)
  const [mostrarModalDerechos, setMostrarModalDerechos] = useState(false)
  const [mostrarModalReportar, setMostrarModalReportar] = useState(false)
  const [materiasDelSemestre, setMateriasDelSemestre] = useState([])
  const [recursosMateria, setRecursosMateria] = useState([])
  const [mostrarFavoritos, setMostrarFavoritos] = useState(false)
  const [recursoAReporter, setRecursoAReporter] = useState(null)
  const [usuarioYaReporto, setUsuarioYaReporto] = useState(false)
  const [motivoReporte, setMotivoReporte] = useState("")
  const [descargando, setDescargando] = useState({})
  const [notificacion, setNotificacion] = useState(null)
  const [mostrarComentarios, setMostrarComentarios] = useState({})

  const descargaRef = useRef(null)

  const [formularioRecurso, setFormularioRecurso] = useState({
    titulo: "",
    tema: "",
    URL: "",
    id_asignatura: null,
    id_categoria: null,
    id_usuario: null,
  })

  const [archivoRecurso, setArchivoRecurso] = useState(null)

  const [formularioDerechos, setFormularioDerechos] = useState({
    tipo_autoria: "propio",
    declara_autoria: false,
    acepta_terminos: false,
    nombre_autor_original: "",
    fuente_original: "",
    referencia_bibliografica: "",
    tipo_licencia: "",
    observaciones_licencia: "",
  })

  const mostrarNotificacion = (tipo, mensaje) => {
    setNotificacion({ tipo, mensaje })
    setTimeout(() => {
      setNotificacion(null)
    }, 3000)
  }

  const toggleMostrarComentarios = (idRecurso) => {
    setMostrarComentarios((prev) => ({
      ...prev,
      [idRecurso]: !prev[idRecurso],
    }))
  }

  const resetFormularioDerechos = () => {
    setFormularioDerechos({
      tipo_autoria: "propio",
      declara_autoria: false,
      acepta_terminos: false,
      nombre_autor_original: "",
      fuente_original: "",
      referencia_bibliografica: "",
      tipo_licencia: "",
      observaciones_licencia: "",
    })
  }

  useEffect(() => {
    cargarCategorias()
  }, [cargarCategorias])

  useEffect(() => {
    cargarFavoritosUsuario()
  }, [cargarFavoritosUsuario])

  useEffect(() => {
    const userId = getUserId()
    if (userId) {
      setFormularioRecurso((prev) => ({
        ...prev,
        id_usuario: userId,
      }))
    }
  }, [getUserId])

  const cargarMateriasDelSemestre = useCallback(() => {
    if (semestreSeleccionado) {
      const materias = getMateriasPorSemestre(semestreSeleccionado.numero)
      setMateriasDelSemestre(materias)
    }
  }, [semestreSeleccionado, getMateriasPorSemestre])

  const cargarRecursosDeMateria = useCallback(async () => {
    if (materiaSeleccionada) {
      await cargarRecursosMateria(materiaSeleccionada.id)
      const recursosAsignatura = getRecursosPorIdAsignatura(materiaSeleccionada.id)
      setRecursosMateria(recursosAsignatura)

      setFormularioRecurso((prev) => ({
        ...prev,
        id_asignatura: materiaSeleccionada.id,
      }))
    }
  }, [materiaSeleccionada, cargarRecursosMateria, getRecursosPorIdAsignatura])

  useEffect(() => {
    cargarMateriasDelSemestre()
  }, [cargarMateriasDelSemestre])

  useEffect(() => {
    cargarRecursosDeMateria()
    setMostrarFavoritos(false)
  }, [cargarRecursosDeMateria])

  useEffect(() => {
    if (!mostrarFormularioRecurso) {
      limpiarMensajes()
    }
  }, [mostrarFormularioRecurso, limpiarMensajes])

  useEffect(() => {
    if (!mostrarModalReportar) {
      limpiarMensajesReporte()
    }
  }, [mostrarModalReportar, limpiarMensajesReporte])

  const handleSeleccionarSemestre = (semestre) => {
    setSemestreSeleccionado(semestre)
    setMostrarMaterias(true)
    setMostrarRecursos(false)
    setMostrarFormularioRecurso(false)
    setMateriaSeleccionada(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSeleccionarMateria = (materia) => {
    setMateriaSeleccionada(materia)
    setMostrarRecursos(true)
    setMostrarFormularioRecurso(false)
    setMostrarFavoritos(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleVolverAMaterias = () => {
    setMostrarRecursos(false)
    setMostrarFormularioRecurso(false)
    setMostrarModalReportar(false)
    setMateriaSeleccionada(null)
  }

  const handleVolverASemestres = () => {
    setMostrarMaterias(false)
    setMostrarRecursos(false)
    setMostrarFormularioRecurso(false)
    setMostrarModalReportar(false)
    setSemestreSeleccionado(null)
    setMateriaSeleccionada(null)
  }

  const handleRefrescarMaterias = () => {
    cargarMaterias()
  }

  const handleAbrirFormularioRecurso = () => {
    setMostrarFormularioRecurso(true)
    resetFormularioDerechos()
  }

  const handleCerrarFormularioRecurso = () => {
    setMostrarFormularioRecurso(false)
    setFormularioRecurso({
      titulo: "",
      tema: "",
      URL: "",
      id_asignatura: materiaSeleccionada?.id || null,
      id_categoria: null,
      id_usuario: getUserId(),
    })
    setArchivoRecurso(null)
    resetFormularioDerechos()
  }

  const handleChangeFormulario = (e) => {
    const { name, value } = e.target
    setFormularioRecurso((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleArchivoChange = (e) => {
    const file = e.target.files[0]
    setArchivoRecurso(file)
  }

  const handleChangeDerechos = (e) => {
    const { name, value, type, checked } = e.target
    setFormularioDerechos((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const validarDerechos = () => {
    if (!formularioDerechos.declara_autoria) {
      return {
        valido: false,
        error: "Debes declarar la titularidad o legitimidad del recurso antes de continuar.",
      }
    }

    if (!formularioDerechos.acepta_terminos) {
      return {
        valido: false,
        error: "Debes aceptar los términos y condiciones de publicación.",
      }
    }

    if (
      ["tercero", "licencia", "dominio_publico"].includes(
        formularioDerechos.tipo_autoria
      )
    ) {
      if (!formularioDerechos.nombre_autor_original.trim()) {
        return {
          valido: false,
          error: "Debes indicar el nombre del autor original del recurso.",
        }
      }

      if (!formularioDerechos.fuente_original.trim()) {
        return {
          valido: false,
          error: "Debes indicar la fuente, enlace o procedencia del recurso.",
        }
      }

      if (!formularioDerechos.referencia_bibliografica.trim()) {
        return {
          valido: false,
          error: "Debes registrar una referencia o citación básica del recurso.",
        }
      }
    }

    if (
      formularioDerechos.tipo_autoria === "licencia" &&
      !formularioDerechos.tipo_licencia.trim()
    ) {
      return {
        valido: false,
        error: "Debes indicar el tipo de licencia o permiso de uso.",
      }
    }

    return { valido: true }
  }

  const handleAbrirModalDerechos = (e) => {
    e.preventDefault()

    if (!formularioRecurso.id_categoria) {
      mostrarNotificacion("error", "Por favor selecciona una categoría")
      return
    }

    if (!formularioRecurso.id_asignatura) {
      mostrarNotificacion("error", "Por favor selecciona una asignatura")
      return
    }

    if (!formularioRecurso.id_usuario) {
      mostrarNotificacion(
        "error",
        "No se pudo identificar al usuario. Por favor, inicia sesión nuevamente."
      )
      return
    }

    if (!categoriaEsLink() && !archivoRecurso) {
      mostrarNotificacion("error", "Debes seleccionar un archivo para subir")
      return
    }

    if (categoriaEsLink() && !formularioRecurso.URL.trim()) {
      mostrarNotificacion("error", "Debes ingresar la URL del enlace")
      return
    }

    setMostrarModalDerechos(true)
  }

  const handleCerrarModalDerechos = () => {
    setMostrarModalDerechos(false)
  }

  const handleEnviarConDerechos = async () => {
    const validacion = validarDerechos()

    if (!validacion.valido) {
      mostrarNotificacion("error", validacion.error)
      return
    }

    console.log("Datos de derechos de autor:", {
      ...formularioDerechos,
      fecha_declaracion: new Date().toISOString(),
    })

    setMostrarModalDerechos(false)

    try {
      const datosRecursoFinal = {
        ...formularioRecurso,
        copyright_simulado: {
          ...formularioDerechos,
          fecha_declaracion: new Date().toISOString(),
        },
      }

      const resultado = await agregarRecurso(datosRecursoFinal, archivoRecurso)

      if (resultado.exito) {
        mostrarNotificacion(
          "success",
          "Recurso agregado exitosamente. La declaración de derechos se registró correctamente."
        )

        if (materiaSeleccionada) {
          await recargarRecursosMateria(materiaSeleccionada.id)
          const nuevosRecursos = getRecursosPorIdAsignatura(materiaSeleccionada.id)
          setRecursosMateria(nuevosRecursos)
        }

        setTimeout(() => {
          handleCerrarFormularioRecurso()
        }, 2000)
      }
    } catch (error) {
      console.error("Error al agregar recurso:", error)
      mostrarNotificacion("error", "Error al agregar recurso")
    }
  }

  const getIconoCategoria = (idCategoria) => {
    switch (idCategoria) {
      case 1:
        return <Image size={20} />
      case 2:
        return <FileText size={20} />
      case 3:
        return <File size={20} />
      case 4:
        return <Link size={20} />
      default:
        return <File size={20} />
    }
  }

  const getEtiquetaCategoria = (idCategoria) => {
    switch (idCategoria) {
      case 1:
        return "Imagen"
      case 2:
        return "PDF"
      case 3:
        return "Archivo"
      case 4:
        return "Enlace"
      default:
        return "Recurso"
    }
  }

  const obtenerExtension = (recurso) => {
    if (recurso.id_categoria === 4) {
      return "html"
    }

    const url = recurso.URL || ""
    const match = url.match(/\.([a-z0-9]+)(?:[\?#]|$)/i)
    if (match) {
      return match[1].toLowerCase()
    }

    switch (recurso.id_categoria) {
      case 1:
        return "jpg"
      case 2:
        return "pdf"
      case 3:
        return "bin"
      default:
        return "file"
    }
  }

  const generarNombreArchivo = (recurso) => {
    const tituloLimpio = recurso.titulo
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()
      .substring(0, 50)

    const extension = obtenerExtension(recurso)
    return `${tituloLimpio}.${extension}`
  }

  const forzarDescargaCloudinary = (url) => {
    if (url.includes("/fl_attachment/")) {
      return url
    }

    return url.replace("/upload/", "/upload/fl_attachment/")
  }

  const handleDescargarRecurso = (recurso) => {
    if (
      recurso.id_categoria === 4 ||
      (recurso.URL?.startsWith("http") &&
        recurso.id_categoria !== 1 &&
        recurso.id_categoria !== 2 &&
        recurso.id_categoria !== 3)
    ) {
      window.open(recurso.URL, "_blank")
      return
    }

    if (!recurso.URL) {
      mostrarNotificacion("error", "No se puede descargar este recurso")
      return
    }

    setDescargando((prev) => ({ ...prev, [recurso.id_recurso]: true }))

    try {
      const nombreArchivo = generarNombreArchivo(recurso)
      let urlDescarga = recurso.URL

      if (urlDescarga.includes("cloudinary.com")) {
        urlDescarga = forzarDescargaCloudinary(urlDescarga)
      }

      const enlace = document.createElement("a")
      enlace.href = urlDescarga
      enlace.download = nombreArchivo
      enlace.target = "_blank"
      enlace.rel = "noopener noreferrer"
      enlace.style.display = "none"

      document.body.appendChild(enlace)
      enlace.click()

      setTimeout(() => {
        document.body.removeChild(enlace)
        setDescargando((prev) => ({ ...prev, [recurso.id_recurso]: false }))
        mostrarNotificacion("success", `Descargando: ${recurso.titulo}`)
      }, 100)
    } catch (error) {
      console.error("Error al descargar:", error)
      setDescargando((prev) => ({ ...prev, [recurso.id_recurso]: false }))
      mostrarNotificacion("error", "Error al descargar el archivo")
    }
  }

  const handleVerRecurso = (recurso) => {
    if (recurso.id_categoria === 4) {
      window.open(recurso.URL, "_blank")
    } else if (recurso.URL) {
      const ventana = window.open(recurso.URL, "_blank")
      if (!ventana || ventana.closed || typeof ventana.closed === "undefined") {
        handleDescargarRecurso(recurso)
      }
    }
  }

  const categoriaEsLink = () => {
    const categoriaSeleccionada = categorias.find(
      (c) => c.id_categoria == formularioRecurso.id_categoria
    )
    return (
      categoriaSeleccionada?.nombre_categoria === "Links" ||
      formularioRecurso.id_categoria == 4
    )
  }

  const handleToggleFavorito = async (recurso) => {
    await alternarFavorito(recurso.id_recurso)

    if (mostrarFavoritos && materiaSeleccionada) {
      await recargarRecursosMateria(materiaSeleccionada.id)
      const nuevosRecursos = getRecursosPorIdAsignatura(materiaSeleccionada.id)
      setRecursosMateria(nuevosRecursos)
    }
  }

  const handleVerFavoritos = () => {
    setMostrarFavoritos(true)
    const recursosFavoritos = recursosMateria.filter((recurso) =>
      esFavorito(recurso.id_recurso)
    )
    setRecursosMateria(recursosFavoritos)
  }

  const handleVerTodosRecursos = async () => {
    setMostrarFavoritos(false)
    if (materiaSeleccionada) {
      await cargarRecursosMateria(materiaSeleccionada.id)
      const todosRecursos = getRecursosPorIdAsignatura(materiaSeleccionada.id)
      setRecursosMateria(todosRecursos)
    }
  }

  const handleAbrirModalReportar = async (recurso) => {
    setRecursoAReporter(recurso)
    const yaReporto = await usuarioReportoRecurso(recurso.id_recurso)
    setUsuarioYaReporto(yaReporto)
    setMostrarModalReportar(true)
  }

  const handleCerrarModalReportar = () => {
    setMostrarModalReportar(false)
    setRecursoAReporter(null)
    setUsuarioYaReporto(false)
    setMotivoReporte("")
    limpiarMensajesReporte()
  }

  const handleReportarRecurso = async () => {
    if (!recursoAReporter || !motivoReporte.trim()) {
      mostrarNotificacion("error", "Por favor, proporciona un motivo para reportar")
      return
    }

    const resultado = await reportarRecurso(
      recursoAReporter.id_recurso,
      motivoReporte
    )

    if (resultado.exito) {
      setUsuarioYaReporto(true)

      setTimeout(() => {
        if (materiaSeleccionada) {
          recargarRecursosMateria(materiaSeleccionada.id)
        }
      }, 2000)
    }
  }

  const loading =
    loadingSemestres || loadingMaterias || loadingAsignaturas || loadingFavoritos
  const error =
    errorSemestres || errorMaterias || errorRecursos || errorAsignaturas || errorFavoritos

  if (loading) {
    return (
      <div className="estado-carga">
        <div className="spinner-grande"></div>
        <p>Cargando recursos académicos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-recurso">
        <div className="icono-error">
          <AlertCircle size={48} />
        </div>
        <h3>Error</h3>
        <p>{error}</p>
        <button className="boton-refrescar" onClick={handleRefrescarMaterias}>
          Reintentar
        </button>
      </div>
    )
  }

  const totalMaterias = Object.values(materiasPorSemestre).reduce(
    (total, materias) => total + materias.length,
    0
  )

  if (mostrarRecursos && materiaSeleccionada) {
    const conteoRecursos = contarRecursosPorTipo(materiaSeleccionada.id)
    const conteoFavoritos = recursosMateria.filter((recurso) =>
      esFavorito(recurso.id_recurso)
    ).length

    return (
      <div className="contenedor-recursos">
        <div className="navegacion-materias">
          <button className="boton-volver-materias" onClick={handleVolverAMaterias}>
            <ArrowLeft size={20} />
            Volver a Materias
          </button>
          <div className="info-navegacion">
            <Home size={18} />
            <span>
              Semestre {semestreSeleccionado?.numero} / {materiaSeleccionada.nombre}
            </span>
          </div>
        </div>

        <div className="cabecera-materias-simple">
          <div className="titulo-materias-con-info">
            <div>
              <h2>{materiaSeleccionada.nombre}</h2>
              <p className="subtitulo-materias">
                Semestre {semestreSeleccionado?.numero} - {nombreCarrera}
              </p>
            </div>
            <div className="controles-materia">
              <div className="badge-contador-materias">
                <FolderOpen size={20} />
                <span>
                  {recursosMateria.length}{" "}
                  {recursosMateria.length === 1 ? "recurso" : "recursos"}
                </span>
                {conteoFavoritos > 0 && (
                  <span className="contador-favoritos">
                    <Heart size={14} />
                    {conteoFavoritos}
                  </span>
                )}
              </div>
              <button
                className="boton-agregar-recurso"
                onClick={handleAbrirFormularioRecurso}
              >
                <Plus size={20} />
                <span>Agregar Recurso</span>
              </button>
            </div>
          </div>
        </div>

        {recursosMateria.length > 0 && (
          <div className="estadisticas-recursos">
            <div className="estadistica-recurso">
              <div className="icono-estadistica">
                <FileText size={24} />
              </div>
              <div className="contenido-estadistica">
                <div className="numero-estadistica">{conteoRecursos.total}</div>
                <div className="label-estadistica">Total</div>
              </div>
            </div>

            {conteoRecursos.imagenes > 0 && (
              <div className="estadistica-recurso">
                <div className="icono-estadistica">
                  <Image size={24} />
                </div>
                <div className="contenido-estadistica">
                  <div className="numero-estadistica">{conteoRecursos.imagenes}</div>
                  <div className="label-estadistica">Imágenes</div>
                </div>
              </div>
            )}

            {conteoRecursos.pdf > 0 && (
              <div className="estadistica-recurso">
                <div className="icono-estadistica">
                  <FileText size={24} />
                </div>
                <div className="contenido-estadistica">
                  <div className="numero-estadistica">{conteoRecursos.pdf}</div>
                  <div className="label-estadistica">PDFs</div>
                </div>
              </div>
            )}

            {conteoRecursos.links > 0 && (
              <div className="estadistica-recurso">
                <div className="icono-estadistica">
                  <Link size={24} />
                </div>
                <div className="contenido-estadistica">
                  <div className="numero-estadistica">{conteoRecursos.links}</div>
                  <div className="label-estadistica">Enlaces</div>
                </div>
              </div>
            )}

            {conteoFavoritos > 0 && (
              <div className="estadistica-recurso">
                <div className="icono-estadistica">
                  <Heart size={24} />
                </div>
                <div className="contenido-estadistica">
                  <div className="numero-estadistica">{conteoFavoritos}</div>
                  <div className="label-estadistica">Favoritos</div>
                </div>
              </div>
            )}
          </div>
        )}

        {mostrarFormularioRecurso && (
          <div className="formulario-agregar-recurso">
            <div className="cabecera-formulario">
              <h3>
                <Plus size={24} /> Agregar Nuevo Recurso
              </h3>
              <button
                className="boton-cerrar-formulario"
                onClick={handleCerrarFormularioRecurso}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAbrirModalDerechos}>
              {errorAgregarRecurso && (
                <div className="mensaje-error">
                  <AlertCircle size={16} />
                  <span>{errorAgregarRecurso}</span>
                </div>
              )}

              {exitoAgregarRecurso && (
                <div className="mensaje-exito">
                  <span>{exitoAgregarRecurso}</span>
                </div>
              )}

              <div className="campos-formulario">
                <div className="campo-formulario">
                  <label htmlFor="titulo">Título *</label>
                  <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    value={formularioRecurso.titulo}
                    onChange={handleChangeFormulario}
                    placeholder="Ingresa el título del recurso"
                    required
                  />
                </div>

                <div className="campo-formulario">
                  <label htmlFor="tema">Tema *</label>
                  <input
                    type="text"
                    id="tema"
                    name="tema"
                    value={formularioRecurso.tema}
                    onChange={handleChangeFormulario}
                    placeholder="Ej: Álgebra Lineal, Cálculo Diferencial"
                    required
                  />
                </div>

                <div className="campo-formulario">
                  <label htmlFor="id_categoria">Categoría *</label>
                  <select
                    id="id_categoria"
                    name="id_categoria"
                    value={formularioRecurso.id_categoria || ""}
                    onChange={handleChangeFormulario}
                    required
                  >
                    <option value="">Selecciona una categoría</option>
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

                {!categoriaEsLink() && (
                  <div className="campo-formulario">
                    <label htmlFor="archivo">
                      <Upload size={16} /> Archivo *
                    </label>
                    <input
                      type="file"
                      id="archivo"
                      onChange={handleArchivoChange}
                      required={!categoriaEsLink() && !formularioRecurso.URL}
                    />
                    <small className="texto-ayuda">
                      Sube el archivo del recurso (PDF, imagen, etc.)
                    </small>
                  </div>
                )}

                {categoriaEsLink() && (
                  <div className="campo-formulario">
                    <label htmlFor="URL">
                      <Globe size={16} /> URL del Enlace *
                    </label>
                    <input
                      type="url"
                      id="URL"
                      name="URL"
                      value={formularioRecurso.URL}
                      onChange={handleChangeFormulario}
                      placeholder="https://ejemplo.com"
                      required
                    />
                  </div>
                )}

                <div className="campo-formulario">
                  <label>Materia</label>
                  <div className="materia-seleccionada">
                    <Book size={16} />
                    <span>{materiaSeleccionada?.nombre}</span>
                  </div>
                </div>
              </div>

              <div className="acciones-formulario">
                <button
                  type="button"
                  className="boton-cancelar"
                  onClick={handleCerrarFormularioRecurso}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="boton-guardar"
                  disabled={cargandoRecurso}
                >
                  {cargandoRecurso ? (
                    <>
                      <div className="spinner-pequeno"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Siguiente: Derechos de Autor</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {mostrarModalDerechos && (
          <div className="modal-derechos">
            <div className="modal-contenido-derechos modal-contenido-derechos-uniforme">
              <div className="cabecera-modal-derechos">
                <div className="icono-cabecera-modal">
                  <Copyright size={24} />
                  <h3>Declaración de titularidad y derechos de autor</h3>
                </div>
                <button
                  className="boton-cerrar-modal"
                  onClick={handleCerrarModalDerechos}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="contenido-modal-derechos">
                <div className="bloque-legal-recurso bloque-legal-recurso-semestres">
                  <div className="bloque-legal-header">
                    <div className="bloque-legal-icono">©</div>
                    <div>
                      <h3>Declaración de titularidad y derechos de autor</h3>
                      <p>
                        Antes de publicar este recurso, debes declarar bajo tu
                        responsabilidad la legitimidad del contenido.
                      </p>
                    </div>
                  </div>

                  <div className="campo-derechos">
                    <label>Condición de autoría del recurso:</label>
                    <select
                      name="tipo_autoria"
                      value={formularioDerechos.tipo_autoria}
                      onChange={handleChangeDerechos}
                      className="select-formulario-derechos"
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

                  {formularioDerechos.tipo_autoria !== "propio" && (
                    <div className="grid-copyright">
                      <div className="campo-derechos">
                        <label>Nombre del autor original:</label>
                        <input
                          type="text"
                          name="nombre_autor_original"
                          value={formularioDerechos.nombre_autor_original}
                          onChange={handleChangeDerechos}
                          className="input-formulario-derechos"
                          placeholder="Nombre completo del autor, institución o entidad"
                        />
                      </div>

                      <div className="campo-derechos">
                        <label>Fuente o procedencia del recurso:</label>
                        <input
                          type="text"
                          name="fuente_original"
                          value={formularioDerechos.fuente_original}
                          onChange={handleChangeDerechos}
                          className="input-formulario-derechos"
                          placeholder="URL, libro, repositorio, editorial, revista, etc."
                        />
                      </div>

                      <div className="campo-derechos campo-full">
                        <label>Referencia o citación:</label>
                        <textarea
                          name="referencia_bibliografica"
                          value={formularioDerechos.referencia_bibliografica}
                          onChange={handleChangeDerechos}
                          rows="3"
                          className="textarea-formulario-derechos"
                          placeholder="Ejemplo: Apellido, N. (Año). Título del recurso. Editorial / URL"
                        />
                      </div>

                      {formularioDerechos.tipo_autoria === "licencia" && (
                        <>
                          <div className="campo-derechos">
                            <label>Tipo de licencia o permiso:</label>
                            <input
                              type="text"
                              name="tipo_licencia"
                              value={formularioDerechos.tipo_licencia}
                              onChange={handleChangeDerechos}
                              className="input-formulario-derechos"
                              placeholder="Creative Commons, permiso institucional, licencia comercial, etc."
                            />
                          </div>

                          <div className="campo-derechos">
                            <label>Observaciones sobre la licencia:</label>
                            <input
                              type="text"
                              name="observaciones_licencia"
                              value={formularioDerechos.observaciones_licencia}
                              onChange={handleChangeDerechos}
                              className="input-formulario-derechos"
                              placeholder="Condiciones de uso, restricciones o notas adicionales"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <div className="checks-legales">
                    <label className="check-termino check-termino-uniforme">
                      <input
                        type="checkbox"
                        name="declara_autoria"
                        checked={formularioDerechos.declara_autoria}
                        onChange={handleChangeDerechos}
                      />
                      <span>
                        Declaro bajo gravedad de juramento que este recurso es propio
                        o que cuento con la debida autorización, cita, licencia o
                        fundamento legal para compartirlo con fines académicos.
                      </span>
                    </label>

                    <label className="check-termino check-termino-uniforme">
                      <input
                        type="checkbox"
                        name="acepta_terminos"
                        checked={formularioDerechos.acepta_terminos}
                        onChange={handleChangeDerechos}
                      />
                      <span>
                        Acepto los términos y condiciones de publicación, y asumo
                        la responsabilidad por la veracidad de esta declaración y
                        por el uso legítimo del contenido compartido.
                      </span>
                    </label>
                  </div>

                  <div className="informacion-legal informacion-legal-uniforme">
                    <p className="texto-legal">
                      <small>
                        Esta declaración se registra como evidencia de responsabilidad
                        del usuario frente a la publicación del recurso. El uso
                        inadecuado de material protegido por derechos de autor puede
                        dar lugar al retiro del contenido y a las acciones
                        correspondientes.
                      </small>
                    </p>
                  </div>
                </div>
              </div>

              <div className="acciones-modal-derechos">
                <button
                  type="button"
                  className="boton-cancelar-modal"
                  onClick={handleCerrarModalDerechos}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="boton-confirmar-derechos"
                  onClick={handleEnviarConDerechos}
                  disabled={cargandoRecurso || !formularioDerechos.acepta_terminos}
                >
                  {cargandoRecurso ? (
                    <>
                      <div className="spinner-pequeno"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Confirmar y Subir Recurso</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {mostrarModalReportar && recursoAReporter && (
          <div className="modal-reportar-recurso">
            <div className="modal-contenido-reportar">
              <div className="cabecera-modal-reportar">
                <div className="icono-cabecera-reportar">
                  <AlertTriangle size={24} />
                  <h3>Reportar Recurso</h3>
                </div>
                <button
                  className="boton-cerrar-modal-reportar"
                  onClick={handleCerrarModalReportar}
                  disabled={cargandoReporte}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="contenido-modal-reportar">
                <div className="alerta-importante-reportar">
                  <AlertCircle size={20} />
                  <div>
                    <p>
                      <strong>Estás reportando:</strong> "
                      {recursoAReporter.titulo || "Recurso"}"
                    </p>
                    <p className="subtitulo-reportar">
                      Los reportes serán revisados por los administradores. Por
                      favor, proporciona información clara y precisa.
                    </p>
                  </div>
                </div>

                <div className="formulario-reportar">
                  <div className="campo-reportar">
                    <label htmlFor="motivoReporte">Motivo del reporte *</label>
                    <textarea
                      id="motivoReporte"
                      value={motivoReporte}
                      onChange={(e) => setMotivoReporte(e.target.value)}
                      placeholder="Describe el problema con este recurso (contenido inapropiado, derechos de autor, información incorrecta, etc.)..."
                      rows="5"
                      disabled={usuarioYaReporto || cargandoReporte}
                    />
                    {usuarioYaReporto && (
                      <div className="mensaje-ya-reportado">
                        <AlertCircle size={16} />
                        <span>Ya has reportado este recurso anteriormente.</span>
                      </div>
                    )}
                  </div>

                  <div className="informacion-legal-reportar">
                    <p>
                      <small>
                        Al reportar un recurso, confirmas que la información
                        proporcionada es verídica. Los reportes falsos o
                        malintencionados pueden tener consecuencias.
                      </small>
                    </p>
                  </div>

                  {errorReporte && (
                    <div className="mensaje-error-reportar">
                      <AlertCircle size={16} />
                      <span>{errorReporte}</span>
                    </div>
                  )}

                  {exitoReporte && (
                    <div className="mensaje-exito-reportar">
                      <Check size={16} />
                      <span>{exitoReporte}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="acciones-modal-reportar">
                <button
                  type="button"
                  className="boton-cancelar-reportar"
                  onClick={handleCerrarModalReportar}
                  disabled={cargandoReporte}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="boton-confirmar-reportar"
                  onClick={handleReportarRecurso}
                  disabled={usuarioYaReporto || cargandoReporte || !motivoReporte.trim()}
                >
                  {cargandoReporte ? (
                    <>
                      <div className="spinner-pequeno"></div>
                      <span>Enviando reporte...</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={16} />
                      <span>{usuarioYaReporto ? "Ya Reportado" : "Reportar Recurso"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {notificacion && (
          <div className={`notificacion ${notificacion.tipo}`}>
            {notificacion.mensaje}
          </div>
        )}

        <div className="seccion-materias">
          {recursosMateria.length > 0 ? (
            <>
              <div className="filtros-recursos">
                <div className="contador-filtros">
                  <span>
                    {mostrarFavoritos
                      ? `${recursosMateria.length} ${
                          recursosMateria.length === 1 ? "favorito" : "favoritos"
                        }`
                      : `${recursosMateria.length} ${
                          recursosMateria.length === 1 ? "recurso" : "recursos"
                        }`}
                  </span>
                </div>
                <div className="botones-filtros">
                  <button
                    className={`boton-filtro ${!mostrarFavoritos ? "activo" : ""}`}
                    onClick={handleVerTodosRecursos}
                  >
                    <FolderOpen size={16} />
                    <span>Todos</span>
                  </button>
                  <button
                    className={`boton-filtro ${mostrarFavoritos ? "activo" : ""}`}
                    onClick={handleVerFavoritos}
                    disabled={conteoFavoritos === 0}
                  >
                    <Heart size={16} />
                    <span>Favoritos</span>
                  </button>
                </div>
              </div>

              <div className="grid-recursos">
                {recursosMateria.map((recurso) => {
                  const esFavoritoRecurso = esFavorito(recurso.id_recurso)
                  const estaProcesandoFavorito =
                    operacionFavorito?.cargando &&
                    operacionFavorito?.idRecurso === recurso.id_recurso
                  const estaProcesandoReporte =
                    operacionReporte?.cargando &&
                    operacionReporte?.idRecurso === recurso.id_recurso
                  const yaReportado =
                    usuarioYaReporto &&
                    recursoAReporter?.id_recurso === recurso.id_recurso
                  const estaDescargando = descargando[recurso.id_recurso] || false

                  return (
                    <RecursoCompleto
                      key={recurso.id_recurso}
                      recurso={recurso}
                      esFavoritoRecurso={esFavoritoRecurso}
                      estaProcesandoFavorito={estaProcesandoFavorito}
                      estaProcesandoReporte={estaProcesandoReporte}
                      yaReportado={yaReportado}
                      estaDescargando={estaDescargando}
                      mostrarComentarios={mostrarComentarios[recurso.id_recurso] || false}
                      toggleMostrarComentarios={() =>
                        toggleMostrarComentarios(recurso.id_recurso)
                      }
                      getIconoCategoria={getIconoCategoria}
                      getEtiquetaCategoria={getEtiquetaCategoria}
                      handleToggleFavorito={handleToggleFavorito}
                      handleAbrirModalReportar={handleAbrirModalReportar}
                      handleVerRecurso={handleVerRecurso}
                      handleDescargarRecurso={handleDescargarRecurso}
                    />
                  )
                })}
              </div>
            </>
          ) : loadingRecursos ? (
            <div className="estado-carga-pequeno">
              <div className="spinner-pequeno"></div>
              <p>Cargando recursos...</p>
            </div>
          ) : (
            <div className="sin-recursos">
              {mostrarFavoritos ? (
                <>
                  <Heart size={64} />
                  <h3>No tienes favoritos</h3>
                  <p>No has marcado ningún recurso como favorito en esta materia.</p>
                  <button
                    className="boton-agregar-primer-recurso"
                    onClick={handleVerTodosRecursos}
                  >
                    <FolderOpen size={16} />
                    <span>Ver todos los recursos</span>
                  </button>
                </>
              ) : (
                <>
                  <FolderOpen size={64} />
                  <h3>No hay recursos disponibles</h3>
                  <p>Esta materia no tiene recursos registrados en el sistema.</p>
                  <button
                    className="boton-agregar-primer-recurso"
                    onClick={handleAbrirFormularioRecurso}
                  >
                    <Plus size={16} />
                    <span>Agregar Primer Recurso</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (mostrarMaterias && semestreSeleccionado) {
    return (
      <div className="contenedor-recursos">
        <div className="navegacion-materias">
          <button className="boton-volver-materias" onClick={handleVolverASemestres}>
            <ArrowLeft size={20} />
            Volver a Semestres
          </button>
          <div className="info-navegacion">
            <Home size={18} />
            <span>Semestre {semestreSeleccionado.numero}</span>
          </div>
        </div>

        <div className="cabecera-materias-simple">
          <div className="titulo-materias-con-info">
            <div>
              <h2>Materias del Semestre {semestreSeleccionado.numero}</h2>
              <p className="subtitulo-materias">
                {semestreSeleccionado.descripcion} - {nombreCarrera}
              </p>
            </div>
            <div className="badge-contador-materias">
              <Book size={20} />
              <span>
                {materiasDelSemestre.length}{" "}
                {materiasDelSemestre.length === 1 ? "materia" : "materias"}
              </span>
            </div>
          </div>
        </div>

        <div className="seccion-materias">
          {materiasDelSemestre.length > 0 ? (
            <div className="grid-materias-simple">
              {materiasDelSemestre.map((materia, index) => {
                const tieneRecursos = materiaTieneRecursos(materia.id)
                const recursosCount = recursos[materia.id]?.length || 0

                return (
                  <div key={materia.id} className="tarjeta-materia-simple">
                    <div className="cabecera-materia-simple">
                      <div className="icono-materia">
                        <Book size={20} />
                      </div>
                      <div className="info-materia">
                        <div className="indice-materia">
                          <Hash size={12} />
                          <span>{index + 1}</span>
                        </div>
                        <h3 className="nombre-materia-simple">{materia.nombre}</h3>
                      </div>
                    </div>
                    <div className="acciones-materia-simple">
                      <button
                        className="boton-recursos-simple"
                        onClick={() => handleSeleccionarMateria(materia)}
                        disabled={!tieneRecursos && loadingRecursos}
                      >
                        <FolderOpen size={16} />
                        <span>Ver Recursos</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="sin-materias-detalle">
              <Book size={64} />
              <h3>No hay materias asignadas</h3>
              <p>Este semestre no tiene materias registradas en el sistema.</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="contenedor-recursos">
      <div className="cabecera-recursos">
        <div className="info-carrera">
          <h2>Recursos académicos</h2>
          <div className="detalles-carrera">
            <div className="badge-info">
              <GraduationCap size={16} />
              <span>{nombreCarrera}</span>
            </div>
            <div className="badge-info">
              <BookOpen size={16} />
              <span>{totalMaterias} materias</span>
            </div>
            <div className="badge-info">
              <span>Tipo: {tipoCarrera === 1 ? "Tecnología" : "Profesional"}</span>
            </div>
          </div>
        </div>
        <div className="contador-semestres">
          <Book size={20} />
          <span>{semestres.length} semestres</span>
        </div>
      </div>

      <div className="grid-semestres">
        {semestres.length > 0 ? (
          semestres.map((semestre) => {
            const materiasCount = materiasPorSemestre[semestre.numero]?.length || 0

            return (
              <div
                key={semestre.id}
                className={`semestre-card ${
                  materiasCount > 0 ? "con-materias" : "sin-materias"
                }`}
                onClick={() => handleSeleccionarSemestre(semestre)}
              >
                <div className="numero-semestre">{semestre.numero}</div>
                <h3>Semestre {semestre.numero}</h3>
                <p>{semestre.descripcion}</p>

                <div className="info-materias-card">
                  <div className="contador-materias">
                    <Book size={14} />
                    <span>{materiasCount} materias</span>
                  </div>
                  <div className="estado-semestre">
                    <div
                      className={`punto-disponible ${
                        materiasCount > 0 ? "activo" : "inactivo"
                      }`}
                    ></div>
                    <span>{materiasCount > 0 ? "Disponible" : "Sin materias"}</span>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="sin-semestres">
            <Book size={48} />
            <h3>No hay semestres disponibles</h3>
            <p>No se encontraron semestres para tu tipo de carrera</p>
          </div>
        )}
      </div>

      {semestres.length > 0 && (
        <div className="indicadores-semestres">
          {semestres.map((semestre) => {
            const materiasCount = materiasPorSemestre[semestre.numero]?.length || 0

            return (
              <button
                key={semestre.id}
                className={`indicador-semestre ${
                  materiasCount > 0 ? "con-materias" : "sin-materias"
                }`}
                onClick={() => handleSeleccionarSemestre(semestre)}
                title={`Semestre ${semestre.numero} - ${materiasCount} materias`}
              >
                <span className="numero-indicador">{semestre.numero}</span>
                {materiasCount > 0 && (
                  <span className="contador-materias-indicador">
                    {materiasCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

const RecursoCompleto = ({
  recurso,
  esFavoritoRecurso,
  estaProcesandoFavorito,
  estaProcesandoReporte,
  yaReportado,
  estaDescargando,
  mostrarComentarios,
  toggleMostrarComentarios,
  getIconoCategoria,
  getEtiquetaCategoria,
  handleToggleFavorito,
  handleAbrirModalReportar,
  handleVerRecurso,
  handleDescargarRecurso,
}) => {
  const {
    likesData,
    miReaccion,
    cargando: cargandoLikes,
    darLike,
    darDislike,
  } = useRecursoLikes(recurso.id_recurso)

  const {
    comentarios,
    totalComentarios,
    cargando: cargandoComentarios,
    error: errorComentarios,
    mensaje: mensajeComentarios,
    nuevoComentario,
    setNuevoComentario,
    crearNuevoComentario,
    editandoComentario,
    textoEditando,
    setTextoEditando,
    iniciarEdicion,
    cancelarEdicion,
    guardarEdicion,
    eliminarComentario,
    formatearFecha,
    obtenerAvatar,
    obtenerNombre,
    estaEditando,
  } = useComentarios(recurso.id_recurso)

  const handleMeGusta = async () => {
    await darLike(recurso.id_recurso)
  }

  const handleNoMeGusta = async () => {
    await darDislike(recurso.id_recurso)
  }

  const handleEnviarComentario = async (e) => {
    e.preventDefault()
    if (nuevoComentario.trim()) {
      await crearNuevoComentario()
    }
  }

  const verificarPermisosComentario = (comentario) => {
    const token = localStorage.getItem("token")
    if (!token) return false

    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      return payload.id_usuario === comentario.id_usuario
    } catch {
      return false
    }
  }

  return (
    <div className="tarjeta-recurso">
      <div className="cabecera-recurso">
        <div className="icono-recurso">{getIconoCategoria(recurso.id_categoria)}</div>

        <div className="info-recurso">
          <h3 className="titulo-recurso">{recurso.titulo}</h3>
          <div className="detalles-recurso">
            <span className="categoria-recurso">
              {getEtiquetaCategoria(recurso.id_categoria)}
            </span>
            <span className="tema-recurso">{recurso.tema}</span>
            {recurso.contador_reportes > 0 && (
              <span className="contador-reportes-badge">
                <AlertTriangle size={12} />
                {recurso.contador_reportes} reporte
                {recurso.contador_reportes !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        <div className="acciones-superiores-recurso">
          <button
            className={`boton-favorito ${esFavoritoRecurso ? "activo" : ""}`}
            onClick={() => handleToggleFavorito(recurso)}
            disabled={estaProcesandoFavorito}
            title={esFavoritoRecurso ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            {estaProcesandoFavorito ? (
              <div className="spinner-favorito"></div>
            ) : esFavoritoRecurso ? (
              <Heart size={20} fill="currentColor" />
            ) : (
              <Heart size={20} />
            )}
          </button>

          <button
            className={`boton-reportar ${yaReportado ? "ya-reportado" : ""}`}
            onClick={() => handleAbrirModalReportar(recurso)}
            disabled={estaProcesandoReporte || yaReportado}
            title={yaReportado ? "Ya reportaste este recurso" : "Reportar recurso"}
          >
            {estaProcesandoReporte ? (
              <div className="spinner-pequeno"></div>
            ) : (
              <AlertTriangle size={18} />
            )}
          </button>

          <button
            className={`boton-comentarios ${mostrarComentarios ? "activo" : ""}`}
            onClick={toggleMostrarComentarios}
            title="Ver comentarios"
          >
            <MessageCircle size={18} />
            {totalComentarios > 0 && (
              <span className="contador-comentarios-mini">{totalComentarios}</span>
            )}
          </button>
        </div>
      </div>

      <div className="seccion-likes-recurso">
        <div className="controles-likes">
          <button
            className={`boton-me-gusta ${miReaccion === "like" ? "activo" : ""}`}
            onClick={handleMeGusta}
            disabled={cargandoLikes}
            title="Me gusta"
          >
            {cargandoLikes && miReaccion === "like" ? (
              <div className="spinner-me-gusta"></div>
            ) : (
              <>
                <ThumbsUp size={18} />
                <span className="contador-me-gusta">{likesData.likes}</span>
              </>
            )}
          </button>

          <button
            className={`boton-no-me-gusta ${
              miReaccion === "dislike" ? "activo" : ""
            }`}
            onClick={handleNoMeGusta}
            disabled={cargandoLikes}
            title="No me gusta"
          >
            {cargandoLikes && miReaccion === "dislike" ? (
              <div className="spinner-no-me-gusta"></div>
            ) : (
              <>
                <ThumbsDown size={18} />
                <span className="contador-no-me-gusta">{likesData.dislikes}</span>
              </>
            )}
          </button>

          <div className="total-reacciones">
            <span>{likesData.total} reacciones</span>
          </div>
        </div>
      </div>

      {mostrarComentarios && (
        <div className="seccion-comentarios-recurso">
          <div className="cabecera-seccion-comentarios">
            <h4>
              <MessageCircle size={16} />
              Comentarios ({totalComentarios})
            </h4>
            <button
              className="btn-cerrar-comentarios"
              onClick={toggleMostrarComentarios}
              title="Cerrar comentarios"
            >
              <X size={16} />
            </button>
          </div>

          <form className="formulario-nuevo-comentario" onSubmit={handleEnviarComentario}>
            <textarea
              className="area-comentario"
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              placeholder="Escribe un comentario sobre este recurso..."
              rows="3"
              maxLength="500"
            />
            <div className="contador-caracteres">{nuevoComentario.length}/500</div>

            <div className="acciones-formulario-comentario">
              <button
                type="button"
                className="btn-cancelar-comentario"
                onClick={() => setNuevoComentario("")}
                disabled={cargandoComentarios || !nuevoComentario.trim()}
              >
                Limpiar
              </button>
              <button
                type="submit"
                className="btn-enviar-comentario"
                disabled={cargandoComentarios || !nuevoComentario.trim()}
              >
                {cargandoComentarios ? (
                  <>
                    <div className="spinner-pequeno"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Comentar</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {errorComentarios && (
            <div className="mensaje-error-comentario">
              <AlertCircle size={14} />
              <span>{errorComentarios}</span>
            </div>
          )}

          {mensajeComentarios && (
            <div className="mensaje-exito-comentario">
              <Check size={14} />
              <span>{mensajeComentarios}</span>
            </div>
          )}

          <div className="lista-comentarios">
            {cargandoComentarios ? (
              <div className="cargando-comentarios">
                <div className="spinner-pequeno"></div>
                <span>Cargando comentarios...</span>
              </div>
            ) : comentarios.length > 0 ? (
              comentarios.map((comentario) => (
                <div key={comentario.id_comentario} className="tarjeta-comentario">
                  <div className="cabecera-comentario">
                    <div className="avatar-usuario">{obtenerAvatar(comentario)}</div>

                    <div className="info-comentario">
                      <div className="nombre-usuario">{obtenerNombre(comentario)}</div>
                      <div className="fecha-comentario">
                        <Clock size={12} />
                        <span>{formatearFecha(comentario.fecha)}</span>
                      </div>
                    </div>

                    {verificarPermisosComentario(comentario) && (
                      <div className="menu-comentario">
                        {editandoComentario === comentario.id_comentario ? (
                          <div className="acciones-edicion">
                            <button
                              className="btn-guardar-edicion"
                              onClick={guardarEdicion}
                              disabled={cargandoComentarios}
                              title="Guardar cambios"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              className="btn-cancelar-edicion"
                              onClick={cancelarEdicion}
                              disabled={cargandoComentarios}
                              title="Cancelar"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="acciones-comunes">
                            <button
                              className="btn-editar-comentario"
                              onClick={() => iniciarEdicion(comentario)}
                              title="Editar comentario"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn-eliminar-comentario"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "¿Estás seguro de eliminar este comentario?"
                                  )
                                ) {
                                  eliminarComentario(comentario.id_comentario)
                                }
                              }}
                              title="Eliminar comentario"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="contenido-comentario">
                    {editandoComentario === comentario.id_comentario ? (
                      <div className="formulario-edicion-comentario">
                        <textarea
                          className="area-edicion-comentario"
                          value={textoEditando}
                          onChange={(e) => setTextoEditando(e.target.value)}
                          rows="2"
                          maxLength="500"
                          autoFocus
                        />
                        <div className="contador-caracteres-edicion">
                          {textoEditando.length}/500
                        </div>
                      </div>
                    ) : (
                      <p>{comentario.comentario}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="sin-comentarios">
                <Smile size={32} />
                <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="acciones-recurso">
        <button
          className="boton-ver-recurso"
          onClick={() => handleVerRecurso(recurso)}
          title="Ver recurso"
        >
          <Eye size={16} />
          <span>Ver</span>
        </button>

        <button
          className="boton-descargar-recurso"
          onClick={() => handleDescargarRecurso(recurso)}
          disabled={estaDescargando || recurso.id_categoria === 4}
          title={
            recurso.id_categoria === 4
              ? "Enlace web - No descargable"
              : "Descargar recurso"
          }
        >
          {estaDescargando ? (
            <>
              <div className="spinner-pequeno"></div>
              <span>Descargando...</span>
            </>
          ) : (
            <>
              <Download size={16} />
              <span>{recurso.id_categoria === 4 ? "Abrir" : "Descargar"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default Semestres