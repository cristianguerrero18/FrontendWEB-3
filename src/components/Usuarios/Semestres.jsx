import { useSemestres } from "../../hooks/useSemestres.js"
import { useMaterias } from "../../hooks/useMaterias.js"
import { useRecursosMateria } from "../../hooks/useRecursosMateria.js"
import { useAsignaturasEstudiante } from "../../hooks/useAsignaturasEstudiante.js"
import { useAgregarRecurso } from "../../hooks/useAgregarRecurso.js"
import { useFavoritos } from "../../hooks/useFavoritos.js"
import { useReportes } from "../../hooks/useReportes.js"
import { useRecursoLikes } from "../../hooks/useRecursoLikes.js"
import { useComentarios } from "../../hooks/useComentarios.js"
import { useUser } from "../../context/UserContext.jsx" // Importamos el contexto
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
  ChevronRight,
  X,
  Plus,
  Upload,
  Globe,
  Check,
  AlertTriangle,
  Copyright,
  User,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
  Edit2,
  Trash2,
  MoreVertical,
  Smile,
  Clock
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
    recargarRecursosMateria
  } = useRecursosMateria()

  const {
    asignaturas,
    loading: loadingAsignaturas,
    error: errorAsignaturas,
    getAsignaturasPorSemestre,
    cargarAsignaturas
  } = useAsignaturasEstudiante()

  const {
    cargando: cargandoRecurso,
    error: errorAgregarRecurso,
    exito: exitoAgregarRecurso,
    categorias,
    cargarCategorias,
    agregarRecurso,
    limpiarMensajes
  } = useAgregarRecurso()

  // Hook de favoritos
  const {
    favoritosPorUsuario,
    loading: loadingFavoritos,
    error: errorFavoritos,
    esFavorito,
    alternarFavorito,
    operacion: operacionFavorito,
    cargarFavoritosUsuario
  } = useFavoritos()

  // Hook de reportes
  const {
    cargando: cargandoReporte,
    error: errorReporte,
    exito: exitoReporte,
    operacion: operacionReporte,
    reportarRecurso,
    usuarioReportoRecurso,
    limpiarMensajes: limpiarMensajesReporte
  } = useReportes()

  // Contexto de usuario para obtener id_usuario
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

  // Estado para mostrar/ocultar comentarios por recurso
  const [mostrarComentarios, setMostrarComentarios] = useState({})

  // Ref para controlar las descargas
  const descargaRef = useRef(null)

  // Estados para el formulario de recurso - AHORA INCLUYE id_usuario
  const [formularioRecurso, setFormularioRecurso] = useState({
    titulo: '',
    tema: '',
    URL: '',
    id_asignatura: null,
    id_categoria: null,
    id_usuario: null // <-- Se agregará desde el contexto
  })
  const [archivoRecurso, setArchivoRecurso] = useState(null)

  // Estados para el modal de derechos de autor - SIMPLIFICADO
  const [formularioDerechos, setFormularioDerechos] = useState({
    esAutor: 'si',
    autorOriginal: '',
    fuenteOriginal: '',
    licencia: '',
    aceptaTerminos: false
  })

  // Función para mostrar notificaciones
  const mostrarNotificacion = (tipo, mensaje) => {
    setNotificacion({ tipo, mensaje })
    setTimeout(() => {
      setNotificacion(null)
    }, 3000)
  }

  // Toggle para mostrar/ocultar comentarios de un recurso
  const toggleMostrarComentarios = (idRecurso) => {
    setMostrarComentarios(prev => ({
      ...prev,
      [idRecurso]: !prev[idRecurso]
    }))
  }

  // Cargar categorías al montar el componente
  useEffect(() => {
    cargarCategorias()
  }, [cargarCategorias])

  // Cargar favoritos al montar
  useEffect(() => {
    cargarFavoritosUsuario()
  }, [cargarFavoritosUsuario])

  // Obtener id_usuario del contexto y asignarlo al formulario
  useEffect(() => {
    const userId = getUserId()
    if (userId) {
      setFormularioRecurso(prev => ({
        ...prev,
        id_usuario: userId
      }))
    }
  }, [getUserId])

  // Memoizar funciones para evitar recreaciones innecesarias
  const cargarMateriasDelSemestre = useCallback(() => {
    if (semestreSeleccionado) {
      const materias = getMateriasPorSemestre(semestreSeleccionado.numero)
      setMateriasDelSemestre(materias)
    }
  }, [semestreSeleccionado, getMateriasPorSemestre])

  const cargarRecursosDeMateria = useCallback(async () => {
    if (materiaSeleccionada) {
      await cargarRecursosMateria(materiaSeleccionada.id)
      const recursos = getRecursosPorIdAsignatura(materiaSeleccionada.id)
      setRecursosMateria(recursos)
      
      // Pre-fill asignatura en el formulario
      setFormularioRecurso(prev => ({
        ...prev,
        id_asignatura: materiaSeleccionada.id
      }))
    }
  }, [materiaSeleccionada, cargarRecursosMateria, getRecursosPorIdAsignatura])

  // Cargar materias cuando se selecciona un semestre
  useEffect(() => {
    cargarMateriasDelSemestre()
  }, [cargarMateriasDelSemestre])

  // Cargar recursos cuando se selecciona una materia
  useEffect(() => {
    cargarRecursosDeMateria()
    setMostrarFavoritos(false) // Resetear filtro al cambiar de materia
  }, [cargarRecursosDeMateria])

  // Limpiar mensajes cuando se cierra el formulario
  useEffect(() => {
    if (!mostrarFormularioRecurso) {
      limpiarMensajes()
    }
  }, [mostrarFormularioRecurso, limpiarMensajes])

  // Limpiar mensajes de reporte cuando se cierra el modal
  useEffect(() => {
    if (!mostrarModalReportar) {
      limpiarMensajesReporte()
    }
  }, [mostrarModalReportar, limpiarMensajesReporte])

  // Manejar clic en un semestre
  const handleSeleccionarSemestre = (semestre) => {
    setSemestreSeleccionado(semestre)
    setMostrarMaterias(true)
    setMostrarRecursos(false)
    setMostrarFormularioRecurso(false)
    setMateriaSeleccionada(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Manejar clic en una materia
  const handleSeleccionarMateria = (materia) => {
    setMateriaSeleccionada(materia)
    setMostrarRecursos(true)
    setMostrarFormularioRecurso(false)
    setMostrarFavoritos(false) // Resetear filtro
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Volver a la vista de materias
  const handleVolverAMaterias = () => {
    setMostrarRecursos(false)
    setMostrarFormularioRecurso(false)
    setMostrarModalReportar(false)
    setMateriaSeleccionada(null)
  }

  // Volver a la vista de semestres
  const handleVolverASemestres = () => {
    setMostrarMaterias(false)
    setMostrarRecursos(false)
    setMostrarFormularioRecurso(false)
    setMostrarModalReportar(false)
    setSemestreSeleccionado(null)
    setMateriaSeleccionada(null)
  }

  // Refrescar materias
  const handleRefrescarMaterias = () => {
    cargarMaterias()
  }

  // Abrir formulario para agregar recurso
  const handleAbrirFormularioRecurso = () => {
    setMostrarFormularioRecurso(true)
    // Resetear formulario de derechos cuando se abre el formulario
    setFormularioDerechos({
      esAutor: 'si',
      autorOriginal: '',
      fuenteOriginal: '',
      licencia: '',
      aceptaTerminos: false
    })
  }

  // Cerrar formulario de recurso
  const handleCerrarFormularioRecurso = () => {
    setMostrarFormularioRecurso(false)
    setFormularioRecurso({
      titulo: '',
      tema: '',
      URL: '',
      id_asignatura: materiaSeleccionada?.id || null,
      id_categoria: null,
      id_usuario: getUserId() // Mantener el id_usuario
    })
    setArchivoRecurso(null)
  }

  // Manejar cambio en el formulario
  const handleChangeFormulario = (e) => {
    const { name, value } = e.target
    setFormularioRecurso(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Manejar cambio de archivo
  const handleArchivoChange = (e) => {
    const file = e.target.files[0]
    setArchivoRecurso(file)
  }

  // Manejar cambio en el formulario de derechos
  const handleChangeDerechos = (e) => {
    const { name, value, type, checked } = e.target
    setFormularioDerechos(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Validar formulario de derechos
  const validarDerechos = () => {
    const { esAutor, autorOriginal, fuenteOriginal, aceptaTerminos } = formularioDerechos
    
    // Validar términos obligatorios
    if (!aceptaTerminos) {
      return {
        valido: false,
        error: 'Debes aceptar los términos y condiciones de uso'
      }
    }

    // Si no es autor, debe completar información del autor original
    if (esAutor === 'no') {
      if (!autorOriginal.trim()) {
        return {
          valido: false,
          error: 'Debes especificar el autor original del contenido'
        }
      }
      if (!fuenteOriginal.trim()) {
        return {
          valido: false,
          error: 'Debes especificar la fuente original del contenido'
        }
      }
    }

    return { valido: true }
  }

  // Abrir modal de derechos antes de enviar
  const handleAbrirModalDerechos = (e) => {
    e.preventDefault()
    
    // Validar formulario básico primero
    if (!formularioRecurso.id_categoria) {
      mostrarNotificacion('error', 'Por favor selecciona una categoría')
      return
    }
    if (!formularioRecurso.id_asignatura) {
      mostrarNotificacion('error', 'Por favor selecciona una asignatura')
      return
    }

    // Verificar que tenemos id_usuario
    if (!formularioRecurso.id_usuario) {
      mostrarNotificacion('error', 'No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.')
      return
    }

    setMostrarModalDerechos(true)
  }

  // Cerrar modal de derechos
  const handleCerrarModalDerechos = () => {
    setMostrarModalDerechos(false)
  }

  // Enviar recurso después de aceptar derechos
  const handleEnviarConDerechos = async () => {
    const validacion = validarDerechos()
    if (!validacion.valido) {
      mostrarNotificacion('error', validacion.error)
      return
    }

    // El TRIGGER se encargará de insertar en derechos_autor automáticamente
    console.log('Datos de derechos de autor:', formularioDerechos)
    
    setMostrarModalDerechos(false)
    
    try {
      // Agregar el recurso (el trigger insertará en derechos_autor)
      const resultado = await agregarRecurso(formularioRecurso, archivoRecurso)
      
      if (resultado.exito) {
        mostrarNotificacion('success', 'Recurso agregado exitosamente. La declaración de derechos se registró automáticamente.')
        
        // Actualizar recursos de la materia
        if (materiaSeleccionada) {
          await recargarRecursosMateria(materiaSeleccionada.id)
          const nuevosRecursos = getRecursosPorIdAsignatura(materiaSeleccionada.id)
          setRecursosMateria(nuevosRecursos)
        }
        
        // Cerrar formulario después de 2 segundos
        setTimeout(() => {
          handleCerrarFormularioRecurso()
        }, 2000)
      }
    } catch (error) {
      console.error('Error al agregar recurso:', error)
      mostrarNotificacion('error', 'Error al agregar recurso')
    }
  }

  // Obtener icono por categoría
  const getIconoCategoria = (idCategoria) => {
    switch(idCategoria) {
      case 1: // Imágenes
        return <Image size={20} />
      case 2: // PDF
        return <FileText size={20} />
      case 3: // Otros archivos
        return <File size={20} />
      case 4: // Links
        return <Link size={20} />
      default:
        return <File size={20} />
    }
  }

  // Obtener etiqueta por categoría
  const getEtiquetaCategoria = (idCategoria) => {
    switch(idCategoria) {
      case 1: return "Imagen"
      case 2: return "PDF"
      case 3: return "Archivo"
      case 4: return "Enlace"
      default: return "Recurso"
    }
  }

  // Obtener extensión basada en categoría o tipo de archivo
  const obtenerExtension = (recurso) => {
    // Si es un enlace web
    if (recurso.id_categoria === 4) {
      return 'html'
    }
    
    // Si la URL contiene un tipo de archivo conocido
    const url = recurso.URL || ''
    const match = url.match(/\.([a-z0-9]+)(?:[\?#]|$)/i)
    if (match) {
      return match[1].toLowerCase()
    }
    
    // Si no, basarse en la categoría
    switch(recurso.id_categoria) {
      case 1: return 'jpg'
      case 2: return 'pdf'
      case 3: return 'bin'
      default: return 'file'
    }
  }

  // Función para generar un nombre de archivo seguro
  const generarNombreArchivo = (recurso) => {
    const tituloLimpio = recurso.titulo
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()
      .substring(0, 50)
    const extension = obtenerExtension(recurso)
    return `${tituloLimpio}.${extension}`
  }

  // Función para forzar descarga en Cloudinary
  const forzarDescargaCloudinary = (url) => {
    // Si ya tiene el parámetro de descarga, no hacer nada
    if (url.includes('/fl_attachment/')) {
      return url
    }
    
    // Agregar el parámetro de descarga forzada
    return url.replace('/upload/', '/upload/fl_attachment/')
  }

  // Descargar recurso usando el atributo download
  const handleDescargarRecurso = (recurso) => {
    // Si es un enlace web, simplemente abrir en nueva pestaña
    if (recurso.id_categoria === 4 || recurso.URL?.startsWith('http') && recurso.id_categoria !== 1 && recurso.id_categoria !== 2 && recurso.id_categoria !== 3) {
      window.open(recurso.URL, '_blank')
      return
    }

    // Si no tiene URL, no se puede descargar
    if (!recurso.URL) {
      mostrarNotificacion('error', 'No se puede descargar este recurso')
      return
    }

    // Marcar como descargando
    setDescargando(prev => ({ ...prev, [recurso.id_recurso]: true }))

    try {
      const nombreArchivo = generarNombreArchivo(recurso)
      let urlDescarga = recurso.URL

      // Si es Cloudinary, forzar descarga
      if (urlDescarga.includes('cloudinary.com')) {
        urlDescarga = forzarDescargaCloudinary(urlDescarga)
      }

      // Crear un enlace temporal
      const enlace = document.createElement('a')
      enlace.href = urlDescarga
      enlace.download = nombreArchivo
      enlace.target = '_blank'
      enlace.rel = 'noopener noreferrer'
      
      // Estilos para ocultar el enlace
      enlace.style.display = 'none'
      
      // Agregar al DOM
      document.body.appendChild(enlace)
      
      // Simular clic
      enlace.click()
      
      // Limpiar después de un tiempo
      setTimeout(() => {
        document.body.removeChild(enlace)
        setDescargando(prev => ({ ...prev, [recurso.id_recurso]: false }))
        mostrarNotificacion('success', `Descargando: ${recurso.titulo}`)
      }, 100)
      
    } catch (error) {
      console.error('Error al descargar:', error)
      setDescargando(prev => ({ ...prev, [recurso.id_recurso]: false }))
      mostrarNotificacion('error', 'Error al descargar el archivo')
    }
  }

  // Ver recurso
  const handleVerRecurso = (recurso) => {
    if (recurso.id_categoria === 4) { // Link
      window.open(recurso.URL, '_blank')
    } else if (recurso.URL) {
      // Para archivos, intentar abrirlos en nueva pestaña
      const ventana = window.open(recurso.URL, '_blank')
      if (!ventana || ventana.closed || typeof ventana.closed === 'undefined') {
        // Si falla al abrir (posible bloqueo de popup), ofrecer descarga
        handleDescargarRecurso(recurso)
      }
    }
  }

  // Verificar si la categoría seleccionada es "Links" (para mostrar/ocultar campos)
  const categoriaEsLink = () => {
    const categoriaSeleccionada = categorias.find(c => c.id_categoria == formularioRecurso.id_categoria)
    return categoriaSeleccionada?.nombre_categoria === "Links" || formularioRecurso.id_categoria == 4
  }

  // Función para manejar clic en favorito
  const handleToggleFavorito = async (recurso) => {
    await alternarFavorito(recurso.id_recurso)
    // Si estamos en vista de favoritos y eliminamos, recargar recursos
    if (mostrarFavoritos && materiaSeleccionada) {
      await recargarRecursosMateria(materiaSeleccionada.id)
      const nuevosRecursos = getRecursosPorIdAsignatura(materiaSeleccionada.id)
      setRecursosMateria(nuevosRecursos)
    }
  }

  // Función para ver solo favoritos
  const handleVerFavoritos = () => {
    setMostrarFavoritos(true)
    // Filtrar recursos que son favoritos
    const recursosFavoritos = recursosMateria.filter(recurso => 
      esFavorito(recurso.id_recurso)
    )
    setRecursosMateria(recursosFavoritos)
  }

  // Función para ver todos los recursos
  const handleVerTodosRecursos = async () => {
    setMostrarFavoritos(false)
    // Recargar todos los recursos
    if (materiaSeleccionada) {
      await cargarRecursosMateria(materiaSeleccionada.id)
      const todosRecursos = getRecursosPorIdAsignatura(materiaSeleccionada.id)
      setRecursosMateria(todosRecursos)
    }
  }

  // Función para abrir modal de reporte
  const handleAbrirModalReportar = async (recurso) => {
    setRecursoAReporter(recurso)
    
    // Verificar si el usuario ya reportó este recurso
    const yaReporto = await usuarioReportoRecurso(recurso.id_recurso)
    setUsuarioYaReporto(yaReporto)
    
    setMostrarModalReportar(true)
  }

  // Función para cerrar modal de reporte
  const handleCerrarModalReportar = () => {
    setMostrarModalReportar(false)
    setRecursoAReporter(null)
    setUsuarioYaReporto(false)
    setMotivoReporte("")
    limpiarMensajesReporte() 
  }

  // Función para enviar reporte
  const handleReportarRecurso = async () => {
    if (!recursoAReporter || !motivoReporte.trim()) {
      mostrarNotificacion('error', 'Por favor, proporciona un motivo para reportar')
      return
    }

    const resultado = await reportarRecurso(recursoAReporter.id_recurso, motivoReporte)
    
    if (resultado.exito) {
      // Actualizar estado para mostrar que ya fue reportado
      setUsuarioYaReporto(true)
      
      // Recargar recursos después de 2 segundos
      setTimeout(() => {
        if (materiaSeleccionada) {
          recargarRecursosMateria(materiaSeleccionada.id)
        }
      }, 2000)
    }
  }

  const loading = loadingSemestres || loadingMaterias || loadingAsignaturas || loadingFavoritos
  const error = errorSemestres || errorMaterias || errorRecursos || errorAsignaturas || errorFavoritos

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

  // Calcular total de materias
  const totalMaterias = Object.values(materiasPorSemestre).reduce((total, materias) => total + materias.length, 0)

  // VISTA DE RECURSOS DE LA MATERIA
  if (mostrarRecursos && materiaSeleccionada) {
    const conteoRecursos = contarRecursosPorTipo(materiaSeleccionada.id)
    const conteoFavoritos = recursosMateria.filter(recurso => esFavorito(recurso.id_recurso)).length

    return (
      <div className="contenedor-recursos">
        {/* Encabezado de navegación */}
        <div className="navegacion-materias">
          <button className="boton-volver-materias" onClick={handleVolverAMaterias}>
            <ArrowLeft size={20} />
            Volver a Materias
          </button>
          <div className="info-navegacion">
            <Home size={18} />
            <span>Semestre {semestreSeleccionado?.numero} / {materiaSeleccionada.nombre}</span>
          </div>
        </div>

        {/* Cabecera de la materia */}
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
                  {recursosMateria.length} {recursosMateria.length === 1 ? "recurso" : "recursos"}
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

        {/* Estadísticas de recursos */}
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

        {/* Formulario para agregar recurso */}
        {mostrarFormularioRecurso && (
          <div className="formulario-agregar-recurso">
            <div className="cabecera-formulario">
              <h3><Plus size={24} /> Agregar Nuevo Recurso</h3>
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
                    value={formularioRecurso.id_categoria || ''}
                    onChange={handleChangeFormulario}
                    required
                  >
                    <option value="">Selecciona una categoría</option>
                    {categorias.map(categoria => (
                      <option key={categoria.id_categoria} value={categoria.id_categoria}>
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

        {/* Modal de Derechos de Autor */}
        {mostrarModalDerechos && (
          <div className="modal-derechos">
            <div className="modal-contenido-derechos">
              <div className="cabecera-modal-derechos">
                <div className="icono-cabecera-modal">
                  <Copyright size={24} />
                  <h3>Declaración de Derechos de Autor</h3>
                </div>
                <button 
                  className="boton-cerrar-modal"
                  onClick={handleCerrarModalDerechos}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="contenido-modal-derechos">
                <div className="alerta-importante">
                  <AlertTriangle size={20} />
                  <p>
                    <strong>Importante:</strong> Al aceptar estos términos, se registrará automáticamente tu declaración de derechos de autor en el sistema.
                  </p>
                </div>

                <div className="formulario-derechos">
                  <div className="campo-derechos">
                    <label htmlFor="esAutor">
                      <User size={16} /> ¿Eres el autor original de este contenido? *
                    </label>
                    <div className="opciones-autoria">
                      <label className="opcion-autoria">
                        <input
                          type="radio"
                          name="esAutor"
                          value="si"
                          checked={formularioDerechos.esAutor === 'si'}
                          onChange={handleChangeDerechos}
                        />
                        <span>Sí, soy el autor original</span>
                      </label>
                      <label className="opcion-autoria">
                        <input
                          type="radio"
                          name="esAutor"
                          value="no"
                          checked={formularioDerechos.esAutor === 'no'}
                          onChange={handleChangeDerechos}
                        />
                        <span>No, es contenido de terceros</span>
                      </label>
                    </div>
                  </div>

                  {formularioDerechos.esAutor === 'no' && (
                    <>
                      <div className="campo-derechos">
                        <label htmlFor="autorOriginal">Autor original del contenido *</label>
                        <input
                          type="text"
                          id="autorOriginal"
                          name="autorOriginal"
                          value={formularioDerechos.autorOriginal}
                          onChange={handleChangeDerechos}
                          placeholder="Nombre del autor o institución"
                        />
                      </div>

                      <div className="campo-derechos">
                        <label htmlFor="fuenteOriginal">Fuente original *</label>
                        <input
                          type="text"
                          id="fuenteOriginal"
                          name="fuenteOriginal"
                          value={formularioDerechos.fuenteOriginal}
                          onChange={handleChangeDerechos}
                          placeholder="URL, libro, revista o publicación"
                        />
                      </div>

                      <div className="campo-derechos">
                        <label htmlFor="licencia">Licencia del contenido</label>
                        <input
                          type="text"
                          id="licencia"
                          name="licencia"
                          value={formularioDerechos.licencia}
                          onChange={handleChangeDerechos}
                          placeholder="Ej: Creative Commons, Dominio Público, etc."
                        />
                      </div>
                    </>
                  )}

                  <div className="terminos-condiciones">
                    <div className="check-termino">
                      <input
                        type="checkbox"
                        id="aceptaTerminos"
                        name="aceptaTerminos"
                        checked={formularioDerechos.aceptaTerminos}
                        onChange={handleChangeDerechos}
                      />
                      <label htmlFor="aceptaTerminos">
                        <strong>Acepto los términos y condiciones:</strong> Declaro que tengo los derechos o el permiso necesario para compartir este contenido con fines educativos en esta plataforma, y soy responsable del material que estoy subiendo. Se registrará automáticamente mi declaración en el sistema.
                      </label>
                    </div>
                  </div>

                  <div className="informacion-legal">
                    <p className="texto-legal">
                      <small>
                        * El sistema registrará automáticamente tu aceptación en la tabla de derechos de autor. Esta plataforma está diseñada para uso educativo. Al subir contenido, te comprometes a respetar los derechos de autor y a usar únicamente material para el cual tengas permiso de distribución.
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
                  disabled={cargandoRecurso || !formularioDerechos.aceptaTerminos}
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

        {/* Modal para Reportar Recurso */}
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
                      <strong>Estás reportando:</strong> "{recursoAReporter.titulo || 'Recurso'}"
                    </p>
                    <p className="subtitulo-reportar">
                      Los reportes serán revisados por los administradores. 
                      Por favor, proporciona información clara y precisa.
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
                        Al reportar un recurso, confirmas que la información proporcionada es verídica.
                        Los reportes falsos o malintencionados pueden tener consecuencias.
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
                      <span>{usuarioYaReporto ? 'Ya Reportado' : 'Reportar Recurso'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notificación flotante */}
        {notificacion && (
          <div className={`notificacion ${notificacion.tipo}`}>
            {notificacion.mensaje}
          </div>
        )}

        {/* Listado de recursos */}
        <div className="seccion-materias">
          {recursosMateria.length > 0 ? (
            <>
              {/* Filtro de favoritos */}
              <div className="filtros-recursos">
                <div className="contador-filtros">
                  <span>
                    {mostrarFavoritos 
                      ? `${recursosMateria.length} ${recursosMateria.length === 1 ? 'favorito' : 'favoritos'}`
                      : `${recursosMateria.length} ${recursosMateria.length === 1 ? 'recurso' : 'recursos'}`
                    }
                  </span>
                </div>
                <div className="botones-filtros">
                  <button 
                    className={`boton-filtro ${!mostrarFavoritos ? 'activo' : ''}`}
                    onClick={handleVerTodosRecursos}
                  >
                    <FolderOpen size={16} />
                    <span>Todos</span>
                  </button>
                  <button 
                    className={`boton-filtro ${mostrarFavoritos ? 'activo' : ''}`}
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
                  const estaProcesandoFavorito = operacionFavorito?.cargando && operacionFavorito?.idRecurso === recurso.id_recurso
                  const estaProcesandoReporte = operacionReporte?.cargando && operacionReporte?.idRecurso === recurso.id_recurso
                  const yaReportado = usuarioYaReporto && recursoAReporter?.id_recurso === recurso.id_recurso
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
                      toggleMostrarComentarios={() => toggleMostrarComentarios(recurso.id_recurso)}
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

  // VISTA DE MATERIAS DEL SEMESTRE
  if (mostrarMaterias && semestreSeleccionado) {
    return (
      <div className="contenedor-recursos">
        {/* Encabezado de navegación */}
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

        {/* Cabecera del semestre */}
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
                {materiasDelSemestre.length} {materiasDelSemestre.length === 1 ? "materia" : "materias"}
              </span>
            </div>
          </div>
        </div>

        {/* Listado de materias */}
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
                        <span>{"Ver Recursos"}</span>
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

  // VISTA PRINCIPAL DE SEMESTRES
  return (
    <div className="contenedor-recursos">
      {/* Información de la carrera */}
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

      {/* Grid de semestres */}
      <div className="grid-semestres">
        {semestres.length > 0 ? (
          semestres.map((semestre) => {
            const materiasCount = materiasPorSemestre[semestre.numero]?.length || 0

            return (
              <div
                key={semestre.id}
                className={`semestre-card ${materiasCount > 0 ? "con-materias" : "sin-materias"}`}
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
                    <div className={`punto-disponible ${materiasCount > 0 ? "activo" : "inactivo"}`}></div>
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

      {/* Indicadores de navegación */}
      {semestres.length > 0 && (
        <div className="indicadores-semestres">
          {semestres.map((semestre) => {
            const materiasCount = materiasPorSemestre[semestre.numero]?.length || 0

            return (
              <button
                key={semestre.id}
                className={`indicador-semestre ${materiasCount > 0 ? "con-materias" : "sin-materias"}`}
                onClick={() => handleSeleccionarSemestre(semestre)}
                title={`Semestre ${semestre.numero} - ${materiasCount} materias`}
              >
                <span className="numero-indicador">{semestre.numero}</span>
                {materiasCount > 0 && <span className="contador-materias-indicador">{materiasCount}</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Componente separado para el recurso con likes y comentarios
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
  handleDescargarRecurso
}) => {
  // Usar el hook de likes para este recurso específico
  const {
    likesData,
    miReaccion,
    cargando: cargandoLikes,
    darLike,
    darDislike
  } = useRecursoLikes(recurso.id_recurso)

  // Usar el hook de comentarios para este recurso
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
    estaEditando
  } = useComentarios(recurso.id_recurso)

  // Manejar clic en "Me gusta"
  const handleMeGusta = async () => {
    await darLike(recurso.id_recurso)
  }

  // Manejar clic en "No me gusta"
  const handleNoMeGusta = async () => {
    await darDislike(recurso.id_recurso)
  }

  // Manejar envío de nuevo comentario
  const handleEnviarComentario = async (e) => {
    e.preventDefault()
    if (nuevoComentario.trim()) {
      await crearNuevoComentario()
    }
  }

  // Verificar si el usuario puede editar/eliminar un comentario
  const verificarPermisosComentario = (comentario) => {
    // En un caso real, esto verificaría con el backend
    // Por ahora, asumimos que el usuario solo puede editar/eliminar sus propios comentarios
    const token = localStorage.getItem("token")
    if (!token) return false
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.id_usuario === comentario.id_usuario
    } catch {
      return false
    }
  }

  return (
    <div className="tarjeta-recurso">
      <div className="cabecera-recurso">
        <div className="icono-recurso">
          {getIconoCategoria(recurso.id_categoria)}
        </div>
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
                {recurso.contador_reportes} reporte{recurso.contador_reportes !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <div className="acciones-superiores-recurso">
          <button 
            className={`boton-favorito ${esFavoritoRecurso ? 'activo' : ''}`}
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
            className={`boton-reportar ${yaReportado ? 'ya-reportado' : ''}`}
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

          {/* Botón para mostrar/ocultar comentarios */}
          <button 
            className={`boton-comentarios ${mostrarComentarios ? 'activo' : ''}`}
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

      {/* Sección de Me gusta / No me gusta */}
      <div className="seccion-likes-recurso">
        <div className="controles-likes">
          <button 
            className={`boton-me-gusta ${miReaccion === 'like' ? 'activo' : ''}`}
            onClick={handleMeGusta}
            disabled={cargandoLikes}
            title="Me gusta"
          >
            {cargandoLikes && miReaccion === 'like' ? (
              <div className="spinner-me-gusta"></div>
            ) : (
              <>
                <ThumbsUp size={18} />
                <span className="contador-me-gusta">{likesData.likes}</span>
              </>
            )}
          </button>
          
          <button 
            className={`boton-no-me-gusta ${miReaccion === 'dislike' ? 'activo' : ''}`}
            onClick={handleNoMeGusta}
            disabled={cargandoLikes}
            title="No me gusta"
          >
            {cargandoLikes && miReaccion === 'dislike' ? (
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

      {/* Sección de comentarios (colapsable) */}
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

          {/* Formulario para nuevo comentario */}
          <form className="formulario-nuevo-comentario" onSubmit={handleEnviarComentario}>
            <textarea
              className="area-comentario"
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              placeholder="Escribe un comentario sobre este recurso..."
              rows="3"
              maxLength="500"
            />
            <div className="contador-caracteres">
              {nuevoComentario.length}/500
            </div>
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

          {/* Mensajes de error/éxito */}
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

          {/* Lista de comentarios */}
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
                    <div className="avatar-usuario">
                      {obtenerAvatar(comentario)}
                    </div>
                    <div className="info-comentario">
                      <div className="nombre-usuario">
                        {obtenerNombre(comentario)}
                      </div>
                      <div className="fecha-comentario">
                        <Clock size={12} />
                        <span>{formatearFecha(comentario.fecha)}</span>
                      </div>
                    </div>
                    
                    {/* Menú de acciones (solo para el autor) */}
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
                                if (window.confirm("¿Estás seguro de eliminar este comentario?")) {
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
          title={recurso.id_categoria === 4 ? "Enlace web - No descargable" : "Descargar recurso"}
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