import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  User,
  Folder,
  AlertTriangle,
  BellPlus,
  MessageSquare,
  Video,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  LayoutDashboard,
  GraduationCap,
  Star,
  Settings,
  FileText,
  Heart,
  FolderArchive,
  BookCheck
} from "lucide-react";

import "../css/Principal.css";
import "../css/Recursos.css";
import Perfil from "../components/Perfil.jsx";
import Recursos from "../components/Semestres.jsx";
import MisRecursos from "../components/MisRecursos.jsx";
import Favoritos from "../components/Favoritos.jsx";
import PQRSStudent from "../components/PQRSStudent.jsx"; // Importamos el componente de PQRS
import { usePerfil } from "../hooks/usePerfil.js";
import { useUser } from "../context/UserContext.jsx";

const parseLocalStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === "undefined" || item === "null" || item.trim() === "") {
      return {};
    }
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error parsing localStorage item "${key}":`, error);
    return {};
  }
};

const PanelEstudiante = () => {
  const navigate = useNavigate();

  const [panelAbierto, setPanelAbierto] = useState(true);
  const [seccionActiva, setSeccionActiva] = useState("inicio");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [datos, setDatos] = useState(null);
  const [mostrarVistaFavoritos, setMostrarVistaFavoritos] = useState(false);

  const usuarioStorage = parseLocalStorage("usuario");
  const carreraStorage = parseLocalStorage("carrera");

  // Usar el contexto del usuario
  const { userData, loadUserData } = useUser();

  const { perfil, cargando: cargandoPerfil, mensaje, recargar, guardarPerfil } = usePerfil(
    seccionActiva === "perfil" && usuarioStorage.id_usuario ? usuarioStorage.id_usuario : null
  );

  // SECCIONES PARA ESTUDIANTE - Agregamos "pqrs" en el menú
  const secciones = [
    { id: "inicio", icono: LayoutDashboard, label: "Dashboard", descripcion: "Panel principal del estudiante" },
    { id: "perfil", icono: User, label: "Perfil", descripcion: "Información personal y académica" },
    { id: "recursos", icono: BookCheck, label: "Recursos", descripcion: "Recursos educativos disponibles" },
    { id: "favoritos", icono: Heart, label: "Mis Favoritos", descripcion: "Recursos que has marcado como favoritos" },
    { id: "adminrecursos", icono: FolderArchive, label: "Mis Recursos", descripcion: "Administración de mis recursos subidos" },
    { id: "pqrs", icono: MessageSquare, label: "PQRS", descripcion: "Peticiones, Quejas, Reclamos y Sugerencias" },
    { id: "notificaciones", icono: BellPlus, label: "Notificaciones", descripcion: "Notificaciones del sistema" },
    { id: "tutoriales", icono: Video, label: "Video Tutoriales", descripcion: "Aprende a usar el sistema" }
  ];
  const seccionActivaInfo = secciones.find((s) => s.id === seccionActiva) || secciones[0];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/Login", { replace: true });

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now() || decoded.id_rol !== 2) {
        localStorage.clear();
        navigate("/Login", { replace: true });
      }
    } catch {
      localStorage.clear();
      navigate("/Login", { replace: true });
    }
  }, [navigate]);

  // Cargar datos del usuario cuando esté disponible el ID
  useEffect(() => {
    if (usuarioStorage?.id_usuario && !userData) {
      loadUserData(usuarioStorage.id_usuario);
    }
  }, [usuarioStorage?.id_usuario, userData, loadUserData]);

  const cargarDatosSeccion = (seccionId) => {
    setCargando(true);
    setSeccionActiva(seccionId);
    setMostrarVistaFavoritos(false); // Resetear vista de favoritos al cambiar de sección
    
    // Solo las secciones con componentes propios no necesitan datos de prueba
    if (seccionId === "perfil" || seccionId === "recursos" || seccionId === "adminrecursos" || 
        seccionId === "favoritos" || seccionId === "pqrs") {
      setCargando(false);
    } else {
      setTimeout(() => {
        setDatos({
          seccion: seccionId,
          timestamp: new Date().toISOString(),
          totalRegistros: Math.floor(Math.random() * 50) + 1,
          mensaje: `Vista del módulo ${seccionId} - En desarrollo`
        });
        setCargando(false);
      }, 500);
    }
  };

  const obtenerEtiquetaActual = () => {
    return seccionActivaInfo.label;
  };

  const obtenerDescripcionActual = () => {
    return seccionActivaInfo.descripcion;
  };

  const handleCerrarSesion = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/Login", { replace: true });
  };

  // Función para obtener estadísticas de los recursos del usuario
  const obtenerEstadisticasRecursos = () => {
    if (!userData || (seccionActiva !== "adminrecursos" && seccionActiva !== "favoritos" && seccionActiva !== "pqrs")) return null;

    // Estas serían estadísticas reales que vendrían de tu API
    const estadisticas = {
      total: userData.totalRecursos || 0,
      activos: userData.recursosActivos || 0,
      reportados: userData.recursosReportados || 0,
      categorias: userData.categoriasDistintas || 0,
      favoritos: userData.totalFavoritos || 0
    };

    return estadisticas;
  };

  // Función para manejar el retorno desde favoritos
  const handleVolverDeFavoritos = () => {
    setMostrarVistaFavoritos(false);
  };

  const renderContenido = () => {
    if (cargando) {
      return (
        <div className="estado-carga">
          <div className="spinner-grande"></div>
          <p>Cargando {obtenerEtiquetaActual()}...</p>
        </div>
      );
    }

    // Si estamos en la sección de recursos y queremos mostrar la vista de favoritos
    if (seccionActiva === "favoritos") {
      return <Favoritos onVolver={handleVolverDeFavoritos} />;
    }

    switch (seccionActiva) {
      case "perfil":
        return (
          <Perfil
            perfil={perfil}
            cargando={cargandoPerfil}
            mensaje={mensaje}
            carreraStorage={carreraStorage}
            guardarPerfil={guardarPerfil}
          />
        );
      case "recursos":
        return <Recursos />;
      case "adminrecursos":
        return <MisRecursos />;
      case "pqrs":
        return <PQRSStudent />; // Aquí renderizamos el componente de PQRS
      default:
        if (datos && datos.seccion === seccionActiva) {
          return (
            <div className="contenedor-datos-api">
              <div className="cabecera-tarjeta-api">
                <h2>{seccionActivaInfo.label}</h2>
                <div className="badge-cantidad">{datos.totalRegistros} registros</div>
              </div>
              <div className="cuerpo-tarjeta-api">
                <div className="mensaje-api">
                  <p>{datos.mensaje}</p>
                  <p className="texto-ayuda">Timestamp: {new Date(datos.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <div className="pie-tarjeta-api">
                <div className="texto-ayuda">Esta funcionalidad está en desarrollo</div>
                <button className="boton-refrescar" onClick={() => cargarDatosSeccion(seccionActiva)}>
                  Refrescar Datos
                </button>
              </div>
            </div>
          );
        } else {
          return (
            <div className="estado-inicial">
              <div className="icono-estado-inicial">
                {seccionActiva === "recursos" ? <Folder size={48} /> : 
                 seccionActiva === "reportes" ? <AlertTriangle size={48} /> :
                 seccionActiva === "pqrs" ? <MessageSquare size={48} /> :
                 seccionActiva === "notificaciones" ? <BellPlus size={48} /> :
                 seccionActiva === "tutoriales" ? <Video size={48} /> :
                 seccionActiva === "adminrecursos" ? <Settings size={48} /> :
                 seccionActiva === "favoritos" ? <Heart size={48} /> :
                 seccionActiva === "inicio" ? <LayoutDashboard size={48} /> :
                 <User size={48} />}
              </div>
              <h2>{seccionActivaInfo.label}</h2>
              <p>{seccionActivaInfo.descripcion}</p>
              {seccionActiva === "favoritos" ? (
                <p className="texto-ayuda">Aquí podrás ver todos los recursos que has marcado como favoritos</p>
              ) : seccionActiva === "pqrs" ? (
                <p className="texto-ayuda">Aquí podrás gestionar tus peticiones, quejas, reclamos y sugerencias</p>
              ) : (
                <p className="texto-ayuda">Esta funcionalidad estará disponible próximamente</p>
              )}
              {seccionActiva !== "favoritos" && seccionActiva !== "pqrs" && (
                <button className="boton-cargar-datos" onClick={() => cargarDatosSeccion(seccionActiva)}>
                  Ver Vista de Desarrollo
                </button>
              )}
            </div>
          );
        }
    }
  };

  // Renderizar estadísticas en la barra lateral si estamos en adminrecursos, favoritos o pqrs
  const renderEstadisticasPanel = () => {
    if (!panelAbierto || (seccionActiva !== "adminrecursos" && seccionActiva !== "favoritos" && seccionActiva !== "pqrs")) return null;

    const stats = obtenerEstadisticasRecursos();
    if (!stats || (stats.total === 0 && stats.favoritos === 0)) return null;

    return (
      <div className="panel-estadisticas-recursos">
        <div className="cabecera-estadisticas">
          {seccionActiva === "favoritos" ? <Heart size={16} /> : 
           seccionActiva === "pqrs" ? <MessageSquare size={16} /> :
           <FileText size={16} />}
          <span>
            {seccionActiva === "favoritos" ? "Estadísticas de Favoritos" : 
             seccionActiva === "pqrs" ? "Estadísticas de PQRS" :
             "Estadísticas de Recursos"}
          </span>
        </div>
        <div className="estadisticas-contenido">
          {seccionActiva === "favoritos" ? (
            <>
              <div className="estadistica-item destacado">
                <span className="estadistica-label">Total Favoritos:</span>
                <span className="estadistica-valor">{stats.favoritos || 0}</span>
              </div>
            </>
          ) : seccionActiva === "pqrs" ? (
            <>
              <div className="estadistica-item">
                <span className="estadistica-label">PQRS Activos:</span>
                <span className="estadistica-valor">{stats.activos || 0}</span>
              </div>
              <div className="estadistica-item">
                <span className="estadistica-label">PQRS Resueltos:</span>
                <span className="estadistica-valor">{stats.total || 0}</span>
              </div>
            </>
          ) : (
            <>
              <div className="estadistica-item">
                <span className="estadistica-label">Total:</span>
                <span className="estadistica-valor">{stats.total}</span>
              </div>
              <div className="estadistica-item">
                <span className="estadistica-label">Activos:</span>
                <span className="estadistica-valor">{stats.activos}</span>
              </div>
              <div className="estadistica-item">
                <span className="estadistica-label">Categorías:</span>
                <span className="estadistica-valor">{stats.categorias}</span>
              </div>
              {stats.reportados > 0 && (
                <div className="estadistica-item alerta">
                  <span className="estadistica-label">Reportados:</span>
                  <span className="estadistica-valor">{stats.reportados}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="app-universitario">
      {/* PANEL LATERAL */}
      <div className={`panel-lateral ${panelAbierto ? "abierto" : "cerrado"}`}>
        <div className="logo-panel">
          <div className="logo-contenido">
            <div className="logo-icono"><GraduationCap size={24} /></div>
            {panelAbierto && (
              <div>
                <div className="logo-texto">Sistema Académico</div>
                <div className="logo-subtexto">Panel de Estudiante</div>
              </div>
            )}
          </div>
          <button
            className="boton-toggle"
            onClick={() => setPanelAbierto(!panelAbierto)}
            aria-label={panelAbierto ? "Contraer panel" : "Expandir panel"}
          >
            {panelAbierto ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {panelAbierto && (
          <div className="buscador-panel">
            <div className="icono-busqueda"><Search size={16} /></div>
            <input
              type="text"
              className="input-busqueda"
              placeholder="Buscar módulo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        )}

        <nav className="navegacion-panel">
          {secciones.map((s) => {
            const Icono = s.icono;
            const estaActivo = seccionActiva === s.id;
            
            return (
              <button
                key={s.id}
                className={`item-navegacion ${estaActivo ? "activo" : ""}`}
                onClick={() => cargarDatosSeccion(s.id)}
                title={s.descripcion}
              >
                <Icono size={18} />
                {panelAbierto && <span>{s.label}</span>}
                {estaActivo && panelAbierto && (
                  <div className="indicador-activo"></div>
                )}
              </button>
            );
          })}
          <div className="separador-navegacion" />
          <button className="item-navegacion cerrar-sesion" onClick={handleCerrarSesion}>
            <LogOut size={18} />
            {panelAbierto && <span>Cerrar Sesión</span>}
          </button>
        </nav>

        {panelAbierto && (
          <div className="info-usuario-panel">
            <div className="avatar-usuario">
              {usuarioStorage.nombres_usuario?.charAt(0) || "E"}
              {usuarioStorage.apellidos_usuario?.charAt(0) || "S"}
            </div>
            <div className="detalles-usuario">
              <div className="nombre-usuario">
                {usuarioStorage.nombres_usuario || "Estudiante"}
              </div>
              <div className="rol-usuario">{carreraStorage?.nombre_carrera || "No asignada"}</div>
            </div>
          </div>
        )}

        {renderEstadisticasPanel()}
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className={`contenido-principal ${panelAbierto ? "abierto" : "cerrado"}`}>
        <header className="barra-superior">
          <div className="ruta-actual">
            <span>Sistema Académico</span>
            <span className="separador-ruta">/</span>
            <span className="ruta-actual-item">{obtenerEtiquetaActual()}</span>
          </div>
          <div className="acciones-superior">
            {seccionActiva === "adminrecursos" && (
              <div className="badge-accion-admin">
                <Settings size={16} />
                <span>Administrador de Recursos</span>
              </div>
            )}
            {seccionActiva === "pqrs" && (
              <div className="badge-accion-admin">
                <MessageSquare size={16} />
                <span>Gestión de PQRS</span>
              </div>
            )}
            <button 
              className="boton-ayuda" 
              onClick={() => cargarDatosSeccion("tutoriales")}
              title="Video Tutoriales"
            >
              <Video size={20} />
            </button>
          </div>
        </header>

        <main className="contenido-dinamico">
          <div className="contenido-seccion">
            <div className="cabecera-seccion">
              <div>
                <h1>{obtenerEtiquetaActual()}</h1>
                <p className="texto-subtitulo">{obtenerDescripcionActual()}</p>
              </div>
              <div className={`badge-estado-api ${cargando ? 'cargando' : 'conectado'}`}>
                {cargando ? (
                  <>
                    <div className="spinner-api"></div>
                    <span>Sincronizando...</span>
                  </>
                ) : (
                  <>
                    <div className="punto-conectado"></div>
                    <span>Sistema Conectado</span>
                  </>
                )}
              </div>
            </div>

            {renderContenido()}
          </div>
        </main>

        <footer className="pie-pagina">
          <p>© {new Date().getFullYear()} Sistema Académico Universitario - Panel de Estudiante</p>
          <div className="enlaces-pie">
            <a href="/politica">Política de Privacidad</a>
            <a href="/terminos">Términos de Uso</a>
            <a href="/soporte">Soporte Técnico</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PanelEstudiante;