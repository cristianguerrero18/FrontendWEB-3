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
  Clock
} from 'lucide-react';
import '../../css/VideoTutorial.css';

const VideoTutorial = () => {
  const [reproduciendo, setReproduciendo] = useState(false);
  const [volumen, setVolumen] = useState(0.7);
  const [silenciado, setSilenciado] = useState(false);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  const [videoSeleccionado, setVideoSeleccionado] = useState(0);
  const [progreso, setProgreso] = useState(0);
  const [tiempoActual, setTiempoActual] = useState('0:00');

  // Solo los dos videos específicos
  const videos = [
    {
      id: 1,
      titulo: 'Registro de Usuarios',
      descripcion: 'Aprende a registrarte en el sistema',
      duracion: '8:45',
      url: 'https://youtu.be/9IIf6Nr1SyE',
      embedUrl: 'https://www.youtube.com/embed/9IIf6Nr1SyE'
    },
    {
      id: 2,
      titulo: 'Funcionamiento del Sistema',
      descripcion: 'Guía completa sobre el funcionamiento del sistema académico',
      duracion: '10:30',
      url: 'https://youtu.be/q4Us_EsbuHs',
      embedUrl: 'https://www.youtube.com/embed/q4Us_EsbuHs'
    }
  ];

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
    setProgreso(parseInt(e.target.value));
  };

  const seleccionarVideo = (index) => {
    setVideoSeleccionado(index);
    setReproduciendo(false);
    setProgreso(0);
    setTiempoActual('0:00');
  };

  const siguienteVideo = () => {
    if (videoSeleccionado < videos.length - 1) {
      seleccionarVideo(videoSeleccionado + 1);
    }
  };

  const videoAnterior = () => {
    if (videoSeleccionado > 0) {
      seleccionarVideo(videoSeleccionado - 1);
    }
  };

  return (
    <div className="contenedor-tutoriales">
      

      <div className="contenido-tutoriales">
        {/* Panel de video principal */}
        <div className="panel-video-principal">
          <div className={`contenedor-video ${pantallaCompleta ? 'pantalla-completa' : ''}`}>
            {/* Video embebido de YouTube */}
            <iframe
              src={videos[videoSeleccionado].embedUrl}
              title={videos[videoSeleccionado].titulo}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="video-iframe"
            ></iframe>

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
                  <span>{videos[videoSeleccionado].duracion}</span>
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
                    onClick={videoAnterior}
                    disabled={videoSeleccionado === 0}
                    title="Video anterior"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <button 
                    className="boton-control" 
                    onClick={siguienteVideo}
                    disabled={videoSeleccionado === videos.length - 1}
                    title="Siguiente video"
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

          {/* Información del video actual */}
          <div className="info-video-actual">
            <h2>{videos[videoSeleccionado].titulo}</h2>
            <p className="descripcion-video">{videos[videoSeleccionado].descripcion}</p>
          </div>
        </div>

        {/* Panel lateral de lista de videos */}
        <div className="panel-lista-videos">
          <h3>Lista de Videos</h3>
          
          <div className="lista-videos">
            {videos.map((video, index) => (
              <div 
                key={video.id}
                className={`item-video ${index === videoSeleccionado ? 'seleccionado' : ''}`}
                onClick={() => seleccionarVideo(index)}
              >
                <div className="miniatura-video">
                  <img 
                    src={`https://img.youtube.com/vi/${video.url.split('/').pop()}/mqdefault.jpg`}
                    alt={`Miniatura ${video.titulo}`}
                  />
                  <div className="duracion-badge">
                    <Clock size={12} />
                    <span>{video.duracion}</span>
                  </div>
                </div>
                <div className="info-item-video">
                  <h4>{video.titulo}</h4>
                  <p>{video.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoTutorial;