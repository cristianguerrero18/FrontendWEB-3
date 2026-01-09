import { useState, useEffect, useCallback } from 'react';
import { useFavoritos } from '../../hooks/useFavoritos.js';
import { getRecursoPorId } from '../../api/Admin/Recursos.js';
import { 
  Heart, 
  FolderOpen, 
  FileText, 
  Image, 
  Link, 
  File,
  Download,
  Eye,
  ArrowLeft,
  Home,
  Book,
  AlertCircle
} from 'lucide-react';
import '../../css/semestres.css';

const Favoritos = ({ onVolver }) => {
  const {
    favoritosPorUsuario,
    loading,
    error,
    esFavorito,
    alternarFavorito,
    operacion: operacionFavorito,
    cargarFavoritosUsuario,
    idUsuario
  } = useFavoritos();

  const [recursosDetallados, setRecursosDetallados] = useState([]);
  const [cargandoDetalles, setCargandoDetalles] = useState(false);

  // Cargar detalles de los recursos favoritos
  const cargarDetallesRecursos = useCallback(async () => {
    if (!favoritosPorUsuario.length) {
      setRecursosDetallados([]);
      return;
    }

    setCargandoDetalles(true);
    try {
      const promesas = favoritosPorUsuario.map(async (favorito) => {
        try {
          const recurso = await getRecursoPorId(favorito.id_recurso);
          return {
            ...recurso,
            id_favorito: favorito.id_favorito,
            fecha_favorito: favorito.fecha_creacion
          };
        } catch (err) {
          console.error(`Error cargando recurso ${favorito.id_recurso}:`, err);
          return null;
        }
      });

      const resultados = await Promise.all(promesas);
      const recursosValidos = resultados.filter(recurso => recurso !== null && recurso.activo === 1);
      
      setRecursosDetallados(recursosValidos);
    } catch (err) {
      console.error('Error cargando detalles de recursos:', err);
    } finally {
      setCargandoDetalles(false);
    }
  }, [favoritosPorUsuario]);

  // Manejar toggle de favorito
  const handleToggleFavorito = async (recurso) => {
    const exito = await alternarFavorito(recurso.id_recurso);
    if (exito) {
      // Remover del estado si se eliminó
      if (!esFavorito(recurso.id_recurso)) {
        setRecursosDetallados(prev => 
          prev.filter(r => r.id_recurso !== recurso.id_recurso)
        );
      }
    }
  };

  // Obtener icono por categoría
  const getIconoCategoria = (idCategoria) => {
    switch(idCategoria) {
      case 1: return <Image size={20} />;
      case 2: return <FileText size={20} />;
      case 3: return <File size={20} />;
      case 4: return <Link size={20} />;
      default: return <File size={20} />;
    }
  };

  // Obtener etiqueta por categoría
  const getEtiquetaCategoria = (idCategoria) => {
    switch(idCategoria) {
      case 1: return "Imagen";
      case 2: return "PDF";
      case 3: return "Archivo";
      case 4: return "Enlace";
      default: return "Recurso";
    }
  };

  // Ver recurso
  const handleVerRecurso = (recurso) => {
    if (recurso.id_categoria === 4 || recurso.URL) {
      window.open(recurso.URL, '_blank');
    }
  };

  // Descargar recurso
  const handleDescargarRecurso = (recurso) => {
    if (recurso.URL) {
      window.open(recurso.URL, '_blank');
    }
  };

  // Formatear fecha
  const formatearFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Cargar detalles cuando cambien los favoritos
  useEffect(() => {
    cargarDetallesRecursos();
  }, [favoritosPorUsuario, cargarDetallesRecursos]);

  // Recargar favoritos al montar
  useEffect(() => {
    if (idUsuario) {
      cargarFavoritosUsuario(idUsuario);
    }
  }, [idUsuario, cargarFavoritosUsuario]);

  if (loading || cargandoDetalles) {
    return (
      <div className="contenedor-recursos">
        <div className="estado-carga">
          <div className="spinner-grande"></div>
          <p>Cargando favoritos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contenedor-recursos">
        <div className="error-recurso">
          <div className="icono-error">
            <AlertCircle size={48} />
          </div>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="contenedor-recursos">

      {/* Cabecera */}
      <div className="cabecera-materias-simple">
        <div className="titulo-materias-con-info">
          <div>
            <h2>Mis Recursos Favoritos</h2>
            <p className="subtitulo-materias">
              Todos los recursos que has marcado como favoritos
            </p>
          </div>
          <div className="badge-contador-materias">
            <Heart size={20} fill="currentColor" />
            <span>
              {recursosDetallados.length} {recursosDetallados.length === 1 ? 'favorito' : 'favoritos'}
            </span>
          </div>
        </div>
      </div>

      {/* Listado de favoritos */}
      <div className="seccion-materias">
        {recursosDetallados.length > 0 ? (
          <div className="grid-recursos">
            {recursosDetallados.map((recurso) => {
              const estaProcesando = operacionFavorito.cargando && 
                operacionFavorito.idRecurso === recurso.id_recurso;

              return (
                <div key={recurso.id_recurso} className="tarjeta-recurso">
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
                      </div>
                      {recurso.fecha_favorito && (
                        <div className="fecha-favorito">
                          <small>Agregado el {formatearFecha(recurso.fecha_favorito)}</small>
                        </div>
                      )}
                    </div>
                    <button 
                      className="boton-favorito activo"
                      onClick={() => handleToggleFavorito(recurso)}
                      disabled={estaProcesando}
                      title="Quitar de favoritos"
                    >
                      {estaProcesando ? (
                        <div className="spinner-favorito"></div>
                      ) : (
                        <Heart size={20} fill="currentColor" />
                      )}
                    </button>
                  </div>
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
                      title="Descargar recurso"
                    >
                      <Download size={16} />
                      <span>Descargar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="sin-recursos">
            <Heart size={64} />
            <h3>No tienes favoritos</h3>
            <p>Comienza marcando recursos como favoritos para verlos aquí.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favoritos;