import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  CheckCircle,
  X,
  ListVideo,
  FileVideo,
  Download,
  Share2,
  ThumbsUp,
  Bookmark,
  Settings,
  HelpCircle
} from 'lucide-react';
import '../../css/VideoTutorial.css';

const VideoTutorial = () => {
  const [reproduciendo, setReproduciendo] = useState(false);
  const [volumen, setVolumen] = useState(0.7);
  const [silenciado, setSilenciado] = useState(false);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  const [tutorialSeleccionado, setTutorialSeleccionado] = useState(0);
  const [progreso, setProgreso] = useState(0);
  const [tiempoActual, setTiempoActual] = useState('0:00');
  const [duracionTotal, setDuracionTotal] = useState('5:30');
  const [seccionActiva, setSeccionActiva] = useState('todos');
  const [marcadoComoCompletado, setMarcadoComoCompletado] = useState([]);

  // Lista de tutoriales (simulados)
  const tutoriales = [
    {
      id: 1,
      titulo: 'Introducción al Sistema Académico',
      descripcion: 'Aprende los conceptos básicos y la navegación principal del sistema',
      duracion: '5:30',
      categoria: 'basico',
      dificultad: 'Principiante',
      completado: false,
      tags: ['inicio', 'navegación', 'básico'],
      vistaPrevia: 'https://via.placeholder.com/400x225/4a90e2/ffffff?text=Vista+Previa+Tutorial+1'
    },
    {
      id: 2,
      titulo: 'Gestión de Usuarios - Guía Completa',
      descripcion: 'Cómo crear, editar y administrar usuarios del sistema',
      duracion: '8:15',
      categoria: 'avanzado',
      dificultad: 'Intermedio',
      completado: false,
      tags: ['usuarios', 'admin', 'gestión'],
      vistaPrevia: 'https://via.placeholder.com/400x225/50c878/ffffff?text=Vista+Previa+Tutorial+2'
    },
    {
      id: 3,
      titulo: 'Administración de Carreras y Asignaturas',
      descripcion: 'Configuración completa del sistema académico',
      duracion: '12:45',
      categoria: 'academico',
      dificultad: 'Avanzado',
      completado: false,
      tags: ['carreras', 'asignaturas', 'pensum'],
      vistaPrevia: 'https://via.placeholder.com/400x225/f39c12/ffffff?text=Vista+Previa+Tutorial+3'
    },
    {
      id: 4,
      titulo: 'Reportes y Análisis de Datos',
      descripcion: 'Generación y exportación de reportes del sistema',
      duracion: '7:20',
      categoria: 'reportes',
      dificultad: 'Intermedio',
      completado: false,
      tags: ['reportes', 'datos', 'exportar'],
      vistaPrevia: 'https://via.placeholder.com/400x225/e74c3c/ffffff?text=Vista+Previa+Tutorial+4'
    },
    {
      id: 5,
      titulo: 'Configuración del Sistema',
      descripcion: 'Personalización de preferencias y ajustes avanzados',
      duracion: '6:40',
      categoria: 'configuracion',
      dificultad: 'Avanzado',
      completado: false,
      tags: ['configuración', 'ajustes', 'preferencias'],
      vistaPrevia: 'https://via.placeholder.com/400x225/3498db/ffffff?text=Vista+Previa+Tutorial+5'
    },
    {
      id: 6,
      titulo: 'Manejo de Notificaciones y Alertas',
      descripcion: 'Configuración y gestión del sistema de notificaciones',
      duracion: '4:50',
      categoria: 'notificaciones',
      dificultad: 'Principiante',
      completado: false,
      tags: ['notificaciones', 'alertas', 'configuración'],
      vistaPrevia: 'https://via.placeholder.com/400x225/9b59b6/ffffff?text=Vista+Previa+Tutorial+6'
    }
  ];

  // Categorías de tutoriales
  const categorias = [
    { id: 'todos', label: 'Todos los Tutoriales', icon: <ListVideo size={16} />, color: '#4a90e2' },
    { id: 'basico', label: 'Básicos', icon: <BookOpen size={16} />, color: '#50c878' },
    { id: 'academico', label: 'Académico', icon: <BookOpen size={16} />, color: '#f39c12' },
    { id: 'avanzado', label: 'Avanzados', icon: <Settings size={16} />, color: '#e74c3c' },
    { id: 'reportes', label: 'Reportes', icon: <FileVideo size={16} />, color: '#3498db' },
    { id: 'configuracion', label: 'Configuración', icon: <Settings size={16} />, color: '#9b59b6' }
  ];

  // Filtrar tutoriales por categoría
  const tutorialesFiltrados = seccionActiva === 'todos' 
    ? tutoriales 
    : tutoriales.filter(t => t.categoria === seccionActiva);

  // Control del video (simulado)
  const toggleReproduccion = () => {
    setReproduciendo(!reproduciendo);
  };

  const toggleSilencio = () => {
    setSilenciado(!silenciado);
  };

  const togglePantallaCompleta = () => {
    setPantallaCompleta(!pantallaCompleta);
  };

  const cambiarVolumen = (e) => {
    const nuevoVolumen = parseFloat(e.target.value);
    setVolumen(nuevoVolumen);
    if (nuevoVolumen === 0) {
      setSilenciado(true);
    } else if (silenciado) {
      setSilenciado(false);
    }
  };

  const cambiarProgreso = (e) => {
    const nuevoProgreso = parseInt(e.target.value);
    setProgreso(nuevoProgreso);
    // Calcular tiempo actual basado en el progreso
    const minutos = Math.floor((nuevoProgreso / 100) * 5.5);
    const segundos = Math.floor(((nuevoProgreso / 100) * 5.5 * 60) % 60);
    setTiempoActual(`${minutos}:${segundos.toString().padStart(2, '0')}`);
  };

  const seleccionarTutorial = (index) => {
    setTutorialSeleccionado(index);
    setReproduciendo(false);
    setProgreso(0);
    setTiempoActual('0:00');
  };

  const marcarComoCompletado = (tutorialId) => {
    if (!marcadoComoCompletado.includes(tutorialId)) {
      setMarcadoComoCompletado([...marcadoComoCompletado, tutorialId]);
    }
  };

  const siguienteTutorial = () => {
    if (tutorialSeleccionado < tutorialesFiltrados.length - 1) {
      seleccionarTutorial(tutorialSeleccionado + 1);
    }
  };

  const tutorialAnterior = () => {
    if (tutorialSeleccionado > 0) {
      seleccionarTutorial(tutorialSeleccionado - 1);
    }
  };

  // Efecto para simular reproducción
  useEffect(() => {
    let intervalo;
    if (reproduciendo && progreso < 100) {
      intervalo = setInterval(() => {
        setProgreso(prev => {
          const nuevoProgreso = prev + 0.5;
          if (nuevoProgreso >= 100) {
            setReproduciendo(false);
            marcarComoCompletado(tutorialesFiltrados[tutorialSeleccionado].id);
            return 100;
          }
          
          // Actualizar tiempo actual
          const minutos = Math.floor((nuevoProgreso / 100) * 5.5);
          const segundos = Math.floor(((nuevoProgreso / 100) * 5.5 * 60) % 60);
          setTiempoActual(`${minutos}:${segundos.toString().padStart(2, '0')}`);
          
          return nuevoProgreso;
        });
      }, 50);
    }
    
    return () => clearInterval(intervalo);
  }, [reproduciendo, progreso, tutorialSeleccionado, tutorialesFiltrados]);

  return (
    <div className="contenedor-tutoriales">
      <div className="cabecera-tutoriales">
        <div className="info-titulo-tutoriales">
          <h1>Video Tutoriales</h1>
          <p>Aprende a utilizar el Sistema Académico con nuestros tutoriales paso a paso</p>
        </div>
        <div className="estadisticas-tutoriales">
          <div className="estadistica-item">
            <div className="estadistica-valor">{tutoriales.length}</div>
            <div className="estadistica-label">Tutoriales</div>
          </div>
          <div className="estadistica-item">
            <div className="estadistica-valor">{marcadoComoCompletado.length}</div>
            <div className="estadistica-label">Completados</div>
          </div>
          <div className="estadistica-item">
            <div className="estadistica-valor">
              {Math.round((marcadoComoCompletado.length / tutoriales.length) * 100)}%
            </div>
            <div className="estadistica-label">Progreso</div>
          </div>
        </div>
      </div>

      <div className="contenido-tutoriales">
        {/* Panel de video principal */}
        <div className="panel-video-principal">
          <div className={`contenedor-video ${pantallaCompleta ? 'pantalla-completa' : ''}`}>
            {/* Video placeholder */}
            <div className="video-placeholder">
              <div className="mensaje-video-placeholder">
                <h2>{tutorialesFiltrados[tutorialSeleccionado]?.titulo}</h2>
                <p>{tutorialesFiltrados[tutorialSeleccionado]?.descripcion}</p>
                <div className="tags-video">
                  {tutorialesFiltrados[tutorialSeleccionado]?.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Controles del video */}
            <div className="controles-video">
              <div className="barra-progreso">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progreso}
                  onChange={cambiarProgreso}
                  className="input-progreso"
                />
                <div className="tiempo-video">
                  <span>{tiempoActual}</span>
                  <span>/</span>
                  <span>{tutorialesFiltrados[tutorialSeleccionado]?.duracion || duracionTotal}</span>
                </div>
              </div>

              <div className="botones-control">
                <div className="botones-izquierda">
                  <button 
                    className="boton-control" 
                    onClick={toggleReproduccion}
                    title={reproduciendo ? 'Pausar' : 'Reproducir'}
                  >
                    {reproduciendo ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  
                  <button 
                    className="boton-control" 
                    onClick={tutorialAnterior}
                    disabled={tutorialSeleccionado === 0}
                    title="Tutorial anterior"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <button 
                    className="boton-control" 
                    onClick={siguienteTutorial}
                    disabled={tutorialSeleccionado === tutorialesFiltrados.length - 1}
                    title="Siguiente tutorial"
                  >
                    <ChevronRight size={20} />
                  </button>

                  <div className="control-volumen">
                    <button 
                      className="boton-control" 
                      onClick={toggleSilencio}
                      title={silenciado ? 'Activar sonido' : 'Silenciar'}
                    >
                      {silenciado ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volumen}
                      onChange={cambiarVolumen}
                      className="input-volumen"
                    />
                  </div>
                </div>

                <div className="botones-derecha">
                  <button 
                    className={`boton-control ${marcadoComoCompletado.includes(tutorialesFiltrados[tutorialSeleccionado]?.id) ? 'completado' : ''}`}
                    onClick={() => marcarComoCompletado(tutorialesFiltrados[tutorialSeleccionado]?.id)}
                    title="Marcar como completado"
                  >
                    <CheckCircle size={20} />
                  </button>

                  <button 
                    className="boton-control" 
                    onClick={togglePantallaCompleta}
                    title={pantallaCompleta ? 'Salir de pantalla completa' : 'Pantalla completa'}
                  >
                    {pantallaCompleta ? <Minimize size={20} /> : <Maximize size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Información del tutorial actual */}
          <div className="info-tutorial-actual">
            <div className="cabecera-info-tutorial">
              <h2>{tutorialesFiltrados[tutorialSeleccionado]?.titulo}</h2>
              <div className="meta-info-tutorial">
                <span className="badge-dificultad" style={{
                  backgroundColor: 
                    tutorialesFiltrados[tutorialSeleccionado]?.dificultad === 'Principiante' ? '#e8f5e9' :
                    tutorialesFiltrados[tutorialSeleccionado]?.dificultad === 'Intermedio' ? '#fff3e0' :
                    '#f8d7da',
                  color: 
                    tutorialesFiltrados[tutorialSeleccionado]?.dificultad === 'Principiante' ? '#388e3c' :
                    tutorialesFiltrados[tutorialSeleccionado]?.dificultad === 'Intermedio' ? '#f57c00' :
                    '#c0392b'
                }}>
                  {tutorialesFiltrados[tutorialSeleccionado]?.dificultad}
                </span>
                <span className="duracion-tutorial">
                  <Clock size={14} /> {tutorialesFiltrados[tutorialSeleccionado]?.duracion}
                </span>
              </div>
            </div>
            <p className="descripcion-tutorial">
              {tutorialesFiltrados[tutorialSeleccionado]?.descripcion}
            </p>
            <div className="acciones-tutorial">
              <button className="boton-accion-secundario">
                <Download size={16} />
                <span>Descargar Guía PDF</span>
              </button>
              <button className="boton-accion-secundario">
                <Share2 size={16} />
                <span>Compartir</span>
              </button>
              <button className="boton-accion-secundario">
                <Bookmark size={16} />
                <span>Guardar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Panel lateral de lista de tutoriales */}
        <div className="panel-lista-tutoriales">
          <div className="cabecera-lista-tutoriales">
            <h3>Lista de Tutoriales</h3>
            <div className="filtros-tutoriales">
              {categorias.map((categoria) => (
                <button
                  key={categoria.id}
                  className={`filtro-categoria ${seccionActiva === categoria.id ? 'activa' : ''}`}
                  onClick={() => setSeccionActiva(categoria.id)}
                  style={{
                    borderColor: categoria.color,
                    backgroundColor: seccionActiva === categoria.id ? categoria.color : 'transparent',
                    color: seccionActiva === categoria.id ? 'white' : categoria.color
                  }}
                >
                  {categoria.icon}
                  <span>{categoria.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="lista-tutoriales">
            {tutorialesFiltrados.map((tutorial, index) => (
              <div 
                key={tutorial.id}
                className={`tarjeta-tutorial ${index === tutorialSeleccionado ? 'seleccionada' : ''} ${marcadoComoCompletado.includes(tutorial.id) ? 'completada' : ''}`}
                onClick={() => seleccionarTutorial(index)}
              >
                <div className="vista-previa-tutorial">
                  <img 
                    src={tutorial.vistaPrevia} 
                    alt={`Vista previa ${tutorial.titulo}`}
                    className="imagen-vista-previa"
                  />
                  <div className="duracion-badge">
                    <Clock size={12} />
                    <span>{tutorial.duracion}</span>
                  </div>
                  {marcadoComoCompletado.includes(tutorial.id) && (
                    <div className="badge-completado">
                      <CheckCircle size={16} />
                    </div>
                  )}
                </div>
                <div className="info-tarjeta-tutorial">
                  <h4 className="titulo-tarjeta-tutorial">{tutorial.titulo}</h4>
                  <p className="descripcion-tarjeta-tutorial">{tutorial.descripcion}</p>
                  <div className="meta-tarjeta-tutorial">
                    <span className="dificultad-tarjeta">{tutorial.dificultad}</span>
                    <div className="tags-tarjeta">
                      {tutorial.tags.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="tag-tarjeta">{tag}</span>
                      ))}
                      {tutorial.tags.length > 2 && (
                        <span className="tag-tarjeta">+{tutorial.tags.length - 2}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Panel de progreso */}
          <div className="panel-progreso">
            <h4>Tu Progreso</h4>
            <div className="barra-progreso-general">
              <div 
                className="progreso-llenado"
                style={{ width: `${(marcadoComoCompletado.length / tutoriales.length) * 100}%` }}
              />
            </div>
            <div className="estadisticas-progreso">
              <span>{marcadoComoCompletado.length} de {tutoriales.length} completados</span>
              <span>{Math.round((marcadoComoCompletado.length / tutoriales.length) * 100)}%</span>
            </div>
            <div className="consejo-ayuda">
              <HelpCircle size={16} />
              <p>Completa todos los tutoriales para dominar el sistema</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoTutorial;