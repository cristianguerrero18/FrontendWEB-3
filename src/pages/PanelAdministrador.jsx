import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  User,
  GraduationCap,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Home,
  BookOpen,
  Users,
  FileText,
  BarChart,
  HelpCircle,
  Shield,
  ChevronDown,
  ChevronUp,
  School,
  List,
  BadgeAlertIcon,
  Backpack,
  Folder,
  Database,
  Tag,
  FileWarningIcon,
  AlertTriangle,
  BookLock,
  BeanOff,
  BellPlus,
  MessageSquare,
  Footprints,
  FootprintsIcon,
  FolderOutput,
  LayoutDashboard,
  Video
} from "lucide-react";

import "../css/Principal.css";
import Perfil from "../components/Perfil.jsx";
import Carreras from "../components/Carreras.jsx";
import TiposCarrera from "../components/TipoCarrera.jsx";
import Roles from "../components/Roles.jsx";
import Asignaturas from "../components/Asignaturas.jsx";
import Usuarios from "../components/Usuarios.jsx";
import Pensum from "../components/Pensum.jsx";
import Recursos from "../components/Recursos.jsx";
import Categorias from "../components/Categorias.jsx";
import Reportes from "../components/Reportes.jsx";
import PQRS from "../components/PQRS.jsx";
import Logs from "../components/Logs.jsx";
import Notificaciones from "../components/Notificaciones.jsx";
import NotificacionesSuperior from "../components/NotificacionesSuperior.jsx";
import Dashboard from "../components/Dashboard.jsx";
import VideoTutorial from "../components/VideoTutorial.jsx";
import { usePerfil } from "../hooks/usePerfil.js";


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

const PanelUniversitario = () => {
  const navigate = useNavigate();

  const [panelAbierto, setPanelAbierto] = useState(true);
  const [seccionActiva, setSeccionActiva] = useState("inicio");
  const [subseccionActiva, setSubseccionActiva] = useState(null);
  const [carrerasDesplegado, setCarrerasDesplegado] = useState(false);
  const [recursosDesplegado, setRecursosDesplegado] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [datos, setDatos] = useState(null);
  const [idRecursoFiltro, setIdRecursoFiltro] = useState(null);

  const usuarioStorage = parseLocalStorage("usuario");
  const carreraStorage = parseLocalStorage("carrera");
  const usuarioId = usuarioStorage.id_usuario || null;

  const { perfil, cargando: cargandoPerfil, mensaje, recargar, guardarPerfil } = usePerfil(
    seccionActiva === "perfil" && usuarioStorage.id_usuario ? usuarioStorage.id_usuario : null
  );

  const secciones = [
    { id: "inicio", icono: LayoutDashboard, label: "Dashboard", descripcion: "Dashboard principal del sistema" },
    { 
      id: "carreras",
      icono: GraduationCap,
      label: "Carreras",
      descripcion: "Gestión de carreras",
      tieneSubmenu: true,
      subsecciones: [
        { id: "carreras-lista", icono: School, label: "Carreras", descripcion: "Lista de carreras" },
        { id: "tipos-carrera", icono: List, label: "Tipos de Carrera", descripcion: "Tipos de carreras" }
      ]
    },
    { id: "perfil", icono: User, label: "Perfil", descripcion: "Información personal" },
    { id: "asignaturas", icono: BookOpen, label: "Asignaturas", descripcion: "Administración de Asignaturas" },
    { id: "roles", icono: Shield, label: "Roles", descripcion: "Roles y permisos" },
    { id: "usuarios", icono: Users, label: "Usuarios", descripcion: "Gestión de usuarios" },
    { id: "pensum", icono: Backpack, label: "Pensum", descripcion: "Plan de estudios" },
    { 
      id: "recursos",
      icono: Folder,
      label: "Recursos",
      descripcion: "Recursos educativos",
      tieneSubmenu: true,
      subsecciones: [
        { id: "recursos-lista", icono: Database, label: "Recursos", descripcion: "Gestión de recursos" },
        { id: "categorias-recursos", icono: Tag, label: "Categorías", descripcion: "Categorías de recursos" },
        { id: "reportes-recursos", icono: AlertTriangle, label: "Reportes", descripcion: "Reportes de recursos" }
      ]
    },
    { id: "pqrs", icono: MessageSquare, label: "PQRS", descripcion: "Peticiones, Quejas, Reclamos y Sugerencias" },
    { id: "logs", icono: Footprints, label: "Huella Digital", descripcion: "Registro de accesos y actividad del sistema" },
    { id: "notificaciones", icono: BellPlus, label: "Notificaciones", descripcion: "Gestión de notificaciones del sistema" },
    { id: "tutoriales", icono: Video, label: "Video Tutoriales", descripcion: "Aprende a usar el sistema con video tutoriales" }
  ];

  const seccionActivaInfo = secciones.find((s) => s.id === seccionActiva) || secciones[0];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/Login", { replace: true });

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now() || decoded.id_rol !== 1) {
        localStorage.clear();
        navigate("/Login", { replace: true });
      }
    } catch {
      localStorage.clear();
      navigate("/Login", { replace: true });
    }
  }, [navigate]);

  const handleVerTodasNotificaciones = () => {
    // Cierra cualquier submenu abierto
    setCarrerasDesplegado(false);
    setRecursosDesplegado(false);
    
    // Navega a la sección de notificaciones
    cargarDatosSeccion("notificaciones");
  }; 

  const cargarDatosSeccion = (seccionId, subseccionId = null) => {
    setCargando(true);
    setSeccionActiva(seccionId);
    if (subseccionId) {
      setSubseccionActiva(subseccionId);
    }
    setDatos(null);
    setIdRecursoFiltro(null);

    if (seccionId !== "carreras") {
      setCarrerasDesplegado(false);
    }
    if (seccionId !== "recursos") {
      setRecursosDesplegado(false);
    }

    const seccionesConComponente = [
      "perfil", "carreras", "asignaturas", "roles", "usuarios", "pensum", "recursos",
      "categorias-recursos", "reportes-recursos", "pqrs", "logs", "notificaciones",
      "inicio", "tutoriales"
    ];
    
    if (!seccionesConComponente.includes(seccionId) && 
        !seccionesConComponente.includes(subseccionId)) {
      setTimeout(() => {
        setDatos({
          seccion: subseccionId || seccionId,
          timestamp: new Date().toISOString(),
          totalRegistros: Math.floor(Math.random() * 100) + 1,
          mensaje: `Datos cargados para ${subseccionId || seccionId}`
        });
        setCargando(false);
      }, 600);
    } else {
      setCargando(false);
    }
  };

  const manejarClickMenuConSubmenu = (seccionId) => {
    if (panelAbierto) {
      switch(seccionId) {
        case "carreras":
          const nuevoEstadoCarreras = !carrerasDesplegado;
          setCarrerasDesplegado(nuevoEstadoCarreras);
          setRecursosDesplegado(false);
          
          if (nuevoEstadoCarreras && (!subseccionActiva || !subseccionActiva.startsWith("carreras-"))) {
            setSubseccionActiva("carreras-lista");
            if (seccionActiva !== "carreras") {
              cargarDatosSeccion("carreras", "carreras-lista");
            }
          }
          break;
          
        case "recursos":
          const nuevoEstadoRecursos = !recursosDesplegado;
          setRecursosDesplegado(nuevoEstadoRecursos);
          setCarrerasDesplegado(false);
          
          if (nuevoEstadoRecursos && (!subseccionActiva || !subseccionActiva.startsWith("recursos-"))) {
            setSubseccionActiva("recursos-lista");
            if (seccionActiva !== "recursos") {
              cargarDatosSeccion("recursos", "recursos-lista");
            }
          }
          break;
          
        default:
          break;
      }
    } else {
      setSeccionActiva(seccionId);
      cargarDatosSeccion(seccionId);
    }
  };

  const obtenerEtiquetaActual = () => {
    if (seccionActiva === "inicio") return "Dashboard";
    if (seccionActiva === "tutoriales") return "Video Tutoriales";
    
    if (seccionActiva === "carreras" && subseccionActiva) {
      const seccionCarreras = secciones.find(s => s.id === "carreras");
      const subseccion = seccionCarreras?.subsecciones?.find(s => s.id === subseccionActiva);
      return subseccion?.label || "Carreras";
    }
    
    if (seccionActiva === "recursos" && subseccionActiva) {
      const seccionRecursos = secciones.find(s => s.id === "recursos");
      const subseccion = seccionRecursos?.subsecciones?.find(s => s.id === subseccionActiva);
      
      if (subseccionActiva === "reportes-recursos" && idRecursoFiltro) {
        return `Reportes del Recurso #${idRecursoFiltro}`;
      }
      
      return subseccion?.label || "Recursos";
    }
    
    if (seccionActiva === "logs") {
      return "Huella Digital";
    }
    
    return seccionActivaInfo.label;
  };

  const obtenerDescripcionActual = () => {
    if (seccionActiva === "tutoriales") return "Aprende a usar el Sistema Académico con nuestros tutoriales paso a paso";
    
    if (seccionActiva === "carreras" && subseccionActiva) {
      const seccionCarreras = secciones.find(s => s.id === "carreras");
      const subseccion = seccionCarreras?.subsecciones?.find(sub => sub.id === subseccionActiva);
      return subseccion?.descripcion || seccionActivaInfo.descripcion;
    }
    
    if (seccionActiva === "recursos" && subseccionActiva) {
      const seccionRecursos = secciones.find(s => s.id === "recursos");
      const subseccion = seccionRecursos?.subsecciones?.find(sub => sub.id === subseccionActiva);
      
      if (subseccionActiva === "reportes-recursos" && idRecursoFiltro) {
        return `Viendo reportes específicos del recurso #${idRecursoFiltro}`;
      }
      
      return subseccion?.descripcion || seccionActivaInfo.descripcion;
    }
    
    if (seccionActiva === "logs") {
      return "Registro detallado de accesos al sistema y actividad de usuarios";
    }
    
    return seccionActivaInfo.descripcion;
  };

  const navegarAReportesConFiltro = (idRecurso) => {
    setIdRecursoFiltro(idRecurso);
    setSeccionActiva("recursos");
    setSubseccionActiva("reportes-recursos");
    setRecursosDesplegado(true);
  };

  const handleCerrarSesion = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/Login", { replace: true });
  };

  const renderContenido = () => {
    const seccionesConCargaPropia = [
      "perfil", "roles", "asignaturas", "usuarios", "pensum", "recursos",
      "carreras-lista", "tipos-carrera", "recursos-lista", "categorias-recursos",
      "reportes-recursos", "pqrs", "logs", "notificaciones", "inicio", "tutoriales",
      "tipos-archivo"
    ];
    
    const mostrarCargaGeneral = cargando && 
      !seccionesConCargaPropia.includes(seccionActiva) &&
      !(seccionActiva === "carreras" && seccionesConCargaPropia.includes(subseccionActiva)) &&
      !(seccionActiva === "recursos" && seccionesConCargaPropia.includes(subseccionActiva));

    if (mostrarCargaGeneral) {
      return (
        <div className="estado-carga">
          <div className="spinner-grande"></div>
          <p>Cargando datos de {obtenerEtiquetaActual()}...</p>
        </div>
      );
    }

    switch (seccionActiva) {
      case "inicio":
        return <Dashboard />;
      case "tutoriales":
        return <VideoTutorial />;
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
      case "carreras":
        switch (subseccionActiva) {
          case "carreras-lista":
            return <Carreras />;
          case "tipos-carrera":
            return <TiposCarrera />;
          default:
            return <Carreras />;
        }
      case "roles":
        return <Roles />;
      case "asignaturas":
        return <Asignaturas />;
      case "usuarios":
        return <Usuarios />;
      case "pensum":
        return <Pensum />;
      case "recursos":
        switch (subseccionActiva) {
          case "recursos-lista":
            return <Recursos onVerReportes={navegarAReportesConFiltro} />;
          case "categorias-recursos":
            return <Categorias />;
          case "reportes-recursos":
            return <Reportes idRecursoFiltro={idRecursoFiltro} />;
          default:
            return <Recursos onVerReportes={navegarAReportesConFiltro} />;
        }
      case "pqrs":
        return <PQRS />;
      case "logs":
        return <Logs />;
      case "notificaciones":
        return <Notificaciones />;
      default:
        if (datos) {
          return (
            <div className="contenedor-datos-api">
              <div className="cabecera-tarjeta-api">
                <h2>Vista: {datos.seccion}</h2>
                <div className="badge-cantidad">{datos.totalRegistros} registros</div>
              </div>
              <div className="cuerpo-tarjeta-api">
                <div className="mensaje-api">
                  <p>{datos.mensaje}</p>
                  <p className="texto-ayuda">Timestamp: {new Date(datos.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <div className="pie-tarjeta-api">
                <div className="texto-ayuda">Mostrando vista simulada para desarrollo</div>
                <button className="boton-refrescar" onClick={() => cargarDatosSeccion(seccionActiva, subseccionActiva)}>
                  Refrescar Datos
                </button>
              </div>
            </div>
          );
        } else {
          return (
            <div className="estado-inicial">
              <div className="icono-estado-inicial">
                {seccionActiva === "carreras" ? <GraduationCap size={48} /> : 
                 seccionActiva === "usuarios" ? <Users size={48} /> : 
                 seccionActiva === "pensum" ? <Backpack size={48} /> :
                 seccionActiva === "recursos" ? <Folder size={48} /> :
                 seccionActiva === "categorias-recursos" ? <Tag size={48} /> :
                 seccionActiva === "reportes-recursos" ? <AlertTriangle size={48} /> :
                 seccionActiva === "pqrs" ? <MessageSquare size={48} /> :
                 seccionActiva === "logs" ? <Footprints size={48} /> :
                 seccionActiva === "notificaciones" ? <BellPlus size={48} /> :
                 seccionActiva === "tutoriales" ? <Video size={48} /> :
                 <FileText size={48} />}
              </div>
              <h2>Bienvenido al módulo {obtenerEtiquetaActual()}</h2>
              <p>Seleccione una acción o utilice el botón inferior para cargar datos de ejemplo.</p>
              <button className="boton-cargar-datos" onClick={() => cargarDatosSeccion(seccionActiva, subseccionActiva)}>
                Cargar Datos de Prueba
              </button>
            </div>
          );
        }
    }
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
                <div className="logo-subtexto">Panel de Administración</div>
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
            
            if (s.tieneSubmenu && panelAbierto) {
              const estaActiva = seccionActiva === s.id;
              const tieneSubmenuDesplegado = 
                (s.id === "carreras" && carrerasDesplegado) ||
                (s.id === "recursos" && recursosDesplegado);
              
              return (
                <div key={s.id} className="item-submenu-contenedor">
                  <button
                    className={`item-navegacion ${estaActiva ? "activo" : ""} ${tieneSubmenuDesplegado ? "con-submenu-abierto" : ""}`}
                    onClick={() => manejarClickMenuConSubmenu(s.id)}
                    title={s.descripcion}
                  >
                    <Icono size={18} />
                    {panelAbierto && <span>{s.label}</span>}
                    {panelAbierto && (
                      <div className="icono-desplegable">
                        {tieneSubmenuDesplegado ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    )}
                  </button>
                  
                  {tieneSubmenuDesplegado && panelAbierto && (
                    <div className="submenu-contenido">
                      {s.subsecciones.map((sub) => {
                        const SubIcono = sub.icono;
                        const subEstaActiva = subseccionActiva === sub.id;
                        return (
                          <button
                            key={sub.id}
                            className={`item-submenu ${subEstaActiva ? "activo-sub" : ""}`}
                            onClick={() => cargarDatosSeccion(s.id, sub.id)}
                            title={sub.descripcion}
                          >
                            <SubIcono size={16} />
                            <span>{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={s.id}
                className={`item-navegacion ${seccionActiva === s.id ? "activo" : ""}`}
                onClick={() => cargarDatosSeccion(s.id)}
                title={s.descripcion}
              >
                <Icono size={18} />
                {panelAbierto && <span>{s.label}</span>}
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
              {usuarioStorage.nombres_usuario?.charAt(0) || "A"}
              {usuarioStorage.apellidos_usuario?.charAt(0) || "D"}
            </div>
            <div className="detalles-usuario">
              <div className="nombre-usuario">Admin</div>
              <div className="rol-usuario">Administrador Principal</div>
            </div>
          </div>
        )}
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
            <button 
              className="boton-ayuda" 
              onClick={() => cargarDatosSeccion("tutoriales")}
              title="Video Tutoriales"
            >
              <Video size={20} />
            </button>
            <NotificacionesSuperior 
              usuarioId={usuarioId} 
              onVerTodas={handleVerTodasNotificaciones} 
            />
          </div>
        </header>

        <main className="contenido-dinamico">
          <div className="contenido-seccion">
            {/* CABECERA SIMPLIFICADA - SIN TÍTULO DUPLICADO */}
            <div className="cabecera-seccion">
              <div>
                {/* SOLO DESCRIPCIÓN, SIN TÍTULO <h1> */}
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

            {/* Contenido dinámico */}
            {renderContenido()}
          </div>
        </main>
        

        <footer className="pie-pagina">
          <p>© {new Date().getFullYear()} Sistema Académico Universitario - Panel de Administración</p>
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

export default PanelUniversitario;