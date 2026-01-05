import React, { useState, useEffect, useRef } from "react";
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
  BookCheck,
  Bell,
  RotateCw
} from "lucide-react";

import "../css/Principal.css";
import "../css/Recursos.css";
import Perfil from "../components/Perfil.jsx";
import Recursos from "../components/Semestres.jsx";
import MisRecursos from "../components/MisRecursos.jsx";
import Favoritos from "../components/Favoritos.jsx";
import PQRSStudent from "../components/PQRSStudent.jsx";
import Notificaciones from "../components/NotificacionesStudent.jsx";
import NotificacionesSuperior from "../components/NotificacionesSuperior.jsx";
import DashboardEstudiante from "../components/Dashboards.jsx"; // Nueva importación
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
  
  // Nuevo estado para el efecto de recarga
  const [recargandoSeccion, setRecargandoSeccion] = useState(false);
  const [ultimaSeccionClickeada, setUltimaSeccionClickeada] = useState(null);
  const [tiempoRecarga, setTiempoRecarga] = useState(0);
  
  // Ref para controlar si es la primera carga
  const esPrimeraCarga = useRef(true);
  const temporizadorRecargaRef = useRef(null);

  const usuarioStorage = parseLocalStorage("usuario");
  const carreraStorage = parseLocalStorage("carrera");

  const { userData, loadUserData } = useUser();

  const { perfil, cargando: cargandoPerfil, mensaje, recargar, guardarPerfil } = usePerfil(
    seccionActiva === "perfil" && usuarioStorage.id_usuario ? usuarioStorage.id_usuario : null
  );

  // SECCIONES PARA ESTUDIANTE - Actualizada con Dashboard
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

  // Cargar datos del usuario
  useEffect(() => {
    if (usuarioStorage?.id_usuario && !userData) {
      loadUserData(usuarioStorage.id_usuario);
    }
  }, [usuarioStorage?.id_usuario, userData, loadUserData]);

  // Efecto para manejar la recarga automática cuando se cambia de sección
  useEffect(() => {
    // No aplicar recarga en la primera carga
    if (esPrimeraCarga.current) {
      esPrimeraCarga.current = false;
      return;
    }

    // Solo recargar si la sección ha cambiado (no cuando se hace clic en la misma)
    if (ultimaSeccionClickeada && ultimaSeccionClickeada === seccionActiva) {
      iniciarRecargaSutil();
    }
  }, [seccionActiva, ultimaSeccionClickeada]);

  // Limpiar temporizador al desmontar
  useEffect(() => {
    return () => {
      if (temporizadorRecargaRef.current) {
        clearTimeout(temporizadorRecargaRef.current);
      }
    };
  }, []);

  const iniciarRecargaSutil = () => {
    // Limpiar temporizador anterior si existe
    if (temporizadorRecargaRef.current) {
      clearTimeout(temporizadorRecargaRef.current);
    }

    // Iniciar recarga
    setRecargandoSeccion(true);
    setTiempoRecarga(0);
    
    // Temporizador para el contador visual
    const startTime = Date.now();
    const updateTimer = () => {
      const elapsed = Date.now() - startTime;
      setTiempoRecarga(elapsed);
      
      if (elapsed < 800) {
        temporizadorRecargaRef.current = setTimeout(updateTimer, 50);
      }
    };
    
    updateTimer();

    // Finalizar recarga después de un tiempo corto
    setTimeout(() => {
      setRecargandoSeccion(false);
      setTiempoRecarga(0);
    }, 800); // 0.8 segundos - suficiente para notarse pero no molesto
  };

  const handleVerTodasNotificaciones = () => {
    cargarDatosSeccion("notificaciones");
  };

  const cargarDatosSeccion = (seccionId) => {
    // Guardar la sección clickeada para comparar después
    setUltimaSeccionClickeada(seccionId);
    
    // Cambiar inmediatamente la sección activa
    setSeccionActiva(seccionId);
    setMostrarVistaFavoritos(false);
    
    // No iniciar la recarga aquí, se manejará en el useEffect
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

  const obtenerEstadisticasRecursos = () => {
    if (!userData || (seccionActiva !== "adminrecursos" && seccionActiva !== "favoritos" && seccionActiva !== "pqrs" && seccionActiva !== "notificaciones")) return null;

    const estadisticas = {
      total: userData.totalRecursos || 0,
      activos: userData.recursosActivos || 0,
      reportados: userData.recursosReportados || 0,
      categorias: userData.categoriasDistintas || 0,
      favoritos: userData.totalFavoritos || 0,
      notificaciones: userData.notificacionesNoLeidas || 0
    };

    return estadisticas;
  };

  const handleVolverDeFavoritos = () => {
    setMostrarVistaFavoritos(false);
  };

  const renderContenido = () => {
    // Mostrar el efecto de recarga sutil si está activo
    if (recargandoSeccion) {
      return (
        <div className="contenedor-recarga-sutil">
          <div className="animacion-recarga">
            <div className="icono-recarga-girando">
              <RotateCw size={40} />
            </div>
            <div className="progreso-recarga">
              <div 
                className="barra-progreso-recarga" 
                style={{ width: `${Math.min(100, (tiempoRecarga / 800) * 100)}%` }}
              ></div>
            </div>
            <p className="texto-recarga">Actualizando contenido...</p>
            <p className="texto-ayuda-recarga">Esto tomará solo un momento</p>
          </div>
        </div>
      );
    }

    if (cargando) {
      return (
        <div className="estado-carga">
          <div className="spinner-grande"></div>
          <p>Cargando {obtenerEtiquetaActual()}...</p>
        </div>
      );
    }

    if (seccionActiva === "favoritos") {
      return <Favoritos onVolver={handleVolverDeFavoritos} />;
    }

    switch (seccionActiva) {
      case "inicio":
        return <DashboardEstudiante />; // Dashboard agregado aquí
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
        return <PQRSStudent />;
      case "notificaciones":
        return <Notificaciones />;
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
              ) : seccionActiva === "notificaciones" ? (
                <p className="texto-ayuda">Aquí podrás ver y gestionar todas tus notificaciones del sistema</p>
              ) : seccionActiva === "inicio" ? (
                <p className="texto-ayuda">Bienvenido al panel principal del estudiante</p>
              ) : (
                <p className="texto-ayuda">Esta funcionalidad estará disponible próximamente</p>
              )}
              {seccionActiva !== "favoritos" && seccionActiva !== "pqrs" && seccionActiva !== "notificaciones" && seccionActiva !== "inicio" && (
                <button className="boton-cargar-datos" onClick={() => cargarDatosSeccion(seccionActiva)}>
                  Ver Vista de Desarrollo
                </button>
              )}
            </div>
          );
        }
    }
  };

  const renderEstadisticasPanel = () => {
    if (!panelAbierto || (seccionActiva !== "adminrecursos" && seccionActiva !== "favoritos" && seccionActiva !== "pqrs" && seccionActiva !== "notificaciones")) return null;

    const stats = obtenerEstadisticasRecursos();
    if (!stats || (stats.total === 0 && stats.favoritos === 0 && stats.notificaciones === 0)) return null;

    return (
      <div className="panel-estadisticas-recursos">
        <div className="cabecera-estadisticas">
          {seccionActiva === "favoritos" ? <Heart size={16} /> : 
           seccionActiva === "pqrs" ? <MessageSquare size={16} /> :
           seccionActiva === "notificaciones" ? <BellPlus size={16} /> :
           <FileText size={16} />}
          <span>
            {seccionActiva === "favoritos" ? "Estadísticas de Favoritos" : 
             seccionActiva === "pqrs" ? "Estadísticas de PQRS" :
             seccionActiva === "notificaciones" ? "Estadísticas de Notificaciones" :
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
          ) : seccionActiva === "notificaciones" ? (
            <>
              <div className="estadistica-item destacado">
                <span className="estadistica-label">No leídas:</span>
                <span className="estadistica-valor">{stats.notificaciones || 0}</span>
              </div>
              <div className="estadistica-item">
                <span className="estadistica-label">Total:</span>
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
                className={`item-navegacion ${estaActivo ? "activo" : ""} ${recargandoSeccion && estaActivo ? 'recargando' : ''}`}
                onClick={() => cargarDatosSeccion(s.id)}
                title={s.descripcion}
                disabled={recargandoSeccion}
              >
                <Icono size={18} />
                {panelAbierto && <span>{s.label}</span>}
                {estaActivo && panelAbierto && (
                  <div className="indicador-activo"></div>
                )}
                {recargandoSeccion && estaActivo && panelAbierto && (
                  <div className="indicador-recarga">
                    <RotateCw size={12} />
                  </div>
                )}
              </button>
            );
          })}
          <div className="separador-navegacion" />
          <button 
            className="item-navegacion cerrar-sesion" 
            onClick={handleCerrarSesion}
            disabled={recargandoSeccion}
          >
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
            {recargandoSeccion && (
              <span className="badge-recarga-activa">
                <RotateCw size={12} />
                <span>Actualizando...</span>
              </span>
            )}
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
            {seccionActiva === "notificaciones" && (
              <div className="badge-accion-admin">
                <BellPlus size={16} />
                <span>Mis Notificaciones</span>
              </div>
            )}
            <button 
              className="boton-ayuda" 
              onClick={() => cargarDatosSeccion("tutoriales")}
              title="Video Tutoriales"
              disabled={recargandoSeccion}
            >
              <Video size={20} />
            </button>
            <NotificacionesSuperior 
              onVerTodas={handleVerTodasNotificaciones} 
            />
          </div>
        </header>

        <main className="contenido-dinamico">
          <div className="contenido-seccion">
            <div className="cabecera-seccion">
              <div>
                <h1>
                  {obtenerEtiquetaActual()}
                  {recargandoSeccion && (
                    <span className="badge-recarga-titulo">
                      <RotateCw size={14} />
                      <span>Actualizando</span>
                    </span>
                  )}
                </h1>
                <p className="texto-subtitulo">{obtenerDescripcionActual()}</p>
              </div>
              <div className={`badge-estado-api ${recargandoSeccion ? 'recargando' : cargando ? 'cargando' : 'conectado'}`}>
                {recargandoSeccion ? (
                  <>
                    <div className="spinner-recarga"></div>
                    <span>Actualizando contenido...</span>
                  </>
                ) : cargando ? (
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