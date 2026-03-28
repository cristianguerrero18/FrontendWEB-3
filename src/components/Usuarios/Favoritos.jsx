import { useState, useEffect, useCallback, useMemo } from "react";
import { useFavoritos } from "../../hooks/useFavoritos.js";
import { getRecursoPorId } from "../../api/Admin/Recursos.js";
import {
  Heart,
  FileText,
  Image,
  Link,
  File,
  Download,
  Eye,
  AlertCircle,
  Bookmark,
  Clock3,
  Grid2x2,
} from "lucide-react";
import "../../css/semestres.css";
import "../../css/Favoritos.css";

const Favoritos = ({ onVolver }) => {
  const {
    favoritosPorUsuario,
    loading,
    error,
    esFavorito,
    alternarFavorito,
    operacion: operacionFavorito,
    cargarFavoritosUsuario,
    idUsuario,
  } = useFavoritos();

  const [recursosDetallados, setRecursosDetallados] = useState([]);
  const [cargandoDetalles, setCargandoDetalles] = useState(false);

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
            fecha_favorito: favorito.fecha_creacion,
          };
        } catch (err) {
          console.error(`Error cargando recurso ${favorito.id_recurso}:`, err);
          return null;
        }
      });

      const resultados = await Promise.all(promesas);
      const recursosValidos = resultados.filter(
        (recurso) => recurso !== null && recurso.activo === 1
      );

      setRecursosDetallados(recursosValidos);
    } catch (err) {
      console.error("Error cargando detalles de recursos:", err);
    } finally {
      setCargandoDetalles(false);
    }
  }, [favoritosPorUsuario]);

  const handleToggleFavorito = useCallback(
    async (recurso) => {
      const exito = await alternarFavorito(recurso.id_recurso);

      if (exito) {
        if (!esFavorito(recurso.id_recurso)) {
          setRecursosDetallados((prev) =>
            prev.filter((r) => r.id_recurso !== recurso.id_recurso)
          );
        }
      }
    },
    [alternarFavorito, esFavorito]
  );

  const getIconoCategoria = useCallback((idCategoria) => {
    switch (idCategoria) {
      case 1:
        return <Image size={20} />;
      case 2:
        return <FileText size={20} />;
      case 3:
        return <File size={20} />;
      case 4:
        return <Link size={20} />;
      default:
        return <File size={20} />;
    }
  }, []);

  const getEtiquetaCategoria = useCallback((idCategoria) => {
    switch (idCategoria) {
      case 1:
        return "Imagen";
      case 2:
        return "PDF";
      case 3:
        return "Archivo";
      case 4:
        return "Enlace";
      default:
        return "Recurso";
    }
  }, []);

  const handleVerRecurso = useCallback((recurso) => {
    if (recurso.id_categoria === 4 || recurso.URL) {
      window.open(recurso.URL, "_blank");
    }
  }, []);

  const handleDescargarRecurso = useCallback((recurso) => {
    if (recurso.URL) {
      window.open(recurso.URL, "_blank");
    }
  }, []);

  const formatearFecha = useCallback((fechaString) => {
    if (!fechaString) return "Fecha no disponible";

    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, []);

  const totalCategorias = useMemo(() => {
    const categorias = new Set(recursosDetallados.map((r) => r.id_categoria));
    return categorias.size;
  }, [recursosDetallados]);

  useEffect(() => {
    cargarDetallesRecursos();
  }, [favoritosPorUsuario, cargarDetallesRecursos]);

  useEffect(() => {
    if (idUsuario) {
      cargarFavoritosUsuario(idUsuario);
    }
  }, [idUsuario, cargarFavoritosUsuario]);

  if (loading || cargandoDetalles) {
    return (
      <div className="contenedor-recursos favoritos-page">
        <div className="estado-carga">
          <div className="spinner-grande"></div>
          <p>Cargando favoritos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contenedor-recursos favoritos-page">
        <div className="error-recurso favoritos-error">
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
    <div className="contenedor-recursos favoritos-page">
      <div className="cabecera-favoritos">
        <div className="titulo-favoritos-bloque">
         

          <div>
            <p className="subtitulo-favoritos">
              Aquí puedes encontrar rápidamente los recursos que has guardado.
            </p>
          </div>
        </div>

        <div className="badge-contador-favoritos">
          <Heart size={18} fill="currentColor" />
          <span>
            {recursosDetallados.length}{" "}
            {recursosDetallados.length === 1 ? "favorito" : "favoritos"}
          </span>
        </div>
      </div>

      <div className="resumen-favoritos">
        <div className="tarjeta-resumen-favoritos">
          <span>Total guardados</span>
          <strong>{recursosDetallados.length}</strong>
        </div>

        <div className="tarjeta-resumen-favoritos">
          <span>Categorías</span>
          <strong>{totalCategorias}</strong>
        </div>

        <div className="tarjeta-resumen-favoritos">
          <span>Acceso rápido</span>
          <strong>Activo</strong>
        </div>
      </div>

      <div className="seccion-materias favoritos-seccion">
        {recursosDetallados.length > 0 ? (
          <div className="grid-recursos favoritos-grid">
            {recursosDetallados.map((recurso) => {
              const estaProcesando =
                operacionFavorito.cargando &&
                operacionFavorito.idRecurso === recurso.id_recurso;

              return (
                <article key={recurso.id_recurso} className="tarjeta-recurso tarjeta-favorito">
                  <div className="cabecera-recurso cabecera-favorito">
                    <div className="icono-recurso icono-favorito-recurso">
                      {getIconoCategoria(recurso.id_categoria)}
                    </div>

                    <div className="info-recurso info-favorito-recurso">
                      <h3 className="titulo-recurso">{recurso.titulo}</h3>

                      <div className="detalles-recurso detalles-favorito-recurso">
                        <span className="categoria-recurso categoria-favoritos-chip">
                          {getEtiquetaCategoria(recurso.id_categoria)}
                        </span>

                        {recurso.tema && (
                          <span className="tema-recurso tema-favoritos">
                            {recurso.tema}
                          </span>
                        )}
                      </div>

                      {recurso.fecha_favorito && (
                        <div className="fecha-favorito">
                          <Clock3 size={14} />
                          <small>
                            Agregado el {formatearFecha(recurso.fecha_favorito)}
                          </small>
                        </div>
                      )}
                    </div>

                    <button
                      className="boton-favorito activo boton-favorito-destacado"
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

                  <div className="acciones-recurso acciones-favorito">
                    <button
                      className="boton-ver-recurso"
                      onClick={() => handleVerRecurso(recurso)}
                      title="Ver recurso"
                      disabled={!recurso.URL}
                    >
                      <Eye size={16} />
                      <span>Ver</span>
                    </button>

                    <button
                      className="boton-descargar-recurso"
                      onClick={() => handleDescargarRecurso(recurso)}
                      title="Descargar recurso"
                      disabled={!recurso.URL}
                    >
                      <Download size={16} />
                      <span>Descargar</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="sin-recursos sin-favoritos">
            <div className="sin-favoritos-icono">
              <Bookmark size={58} />
            </div>
            <h3>No tienes favoritos todavía</h3>
            <p>
              Comienza marcando recursos como favoritos para acceder a ellos más
              rápido desde aquí.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favoritos;