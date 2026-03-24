import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  User,
  GraduationCap,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Shield,
  ChevronDown,
  ChevronUp,
  School,
  List,
  Backpack,
  Folder,
  Database,
  Tag,
  AlertTriangle,
  BellPlus,
  MessageSquare,
  Footprints,
  LayoutDashboard,
  Video,
  RotateCw,
  BookOpen,
  Users,
  Bell,
} from "lucide-react";

import "../css/Principal.css";
import Perfil from "../components/Admin/Perfil.jsx";
import Carreras from "../components/Admin/Carreras.jsx";
import TiposCarrera from "../components/Admin/TipoCarrera.jsx";
import Roles from "../components/Admin/Roles.jsx";
import Asignaturas from "../components/Admin/Asignaturas.jsx";
import Usuarios from "../components/Admin/Usuarios.jsx";
import Pensum from "../components/Admin/Pensum.jsx";
import Recursos from "../components/Admin/Recursos.jsx";
import Categorias from "../components/Admin/Categorias.jsx";
import Reportes from "../components/Admin/Reportes.jsx";
import PQRS from "../components/Admin/PQRS.jsx";
import Logs from "../components/Admin/Logs.jsx";
import Notificaciones from "../components/Admin/Notificaciones.jsx";
import NotificacionesSuperior from "../components/Admin/NotificacionesSuperior.jsx";
import Dashboard from "../components/Admin/Dashboard.jsx";
import VideoTutorial from "../components/Usuarios/VideoTutorial.jsx";
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

const MENU_SECCIONES = [
  { id: "inicio", icono: LayoutDashboard, label: "Dashboard", descripcion: "Vista general del sistema" },
  {
    id: "carreras",
    icono: GraduationCap,
    label: "Carreras",
    descripcion: "Gestión académica por carreras",
    tieneSubmenu: true,
    subsecciones: [
      { id: "carreras-lista", icono: School, label: "Carreras", descripcion: "Listado general de carreras" },
      { id: "tipos-carrera", icono: List, label: "Tipos de Carrera", descripcion: "Clasificación por tipo de carrera" },
    ],
  },
  { id: "perfil", icono: User, label: "Perfil", descripcion: "Administración del perfil del usuario" },
  { id: "asignaturas", icono: BookOpen, label: "Asignaturas", descripcion: "Gestión de asignaturas" },
  { id: "roles", icono: Shield, label: "Roles", descripcion: "Administración de roles del sistema" },
  { id: "usuarios", icono: Users, label: "Usuarios", descripcion: "Gestión de usuarios" },
  { id: "pensum", icono: Backpack, label: "Pensum", descripcion: "Organización del pensum académico" },
  {
    id: "recursos",
    icono: Folder,
    label: "Recursos",
    descripcion: "Gestión de recursos académicos",
    tieneSubmenu: true,
    subsecciones: [
      { id: "recursos-lista", icono: Database, label: "Recursos", descripcion: "Listado de recursos" },
      { id: "categorias-recursos", icono: Tag, label: "Categorías", descripcion: "Clasificación de recursos" },
      { id: "reportes-recursos", icono: AlertTriangle, label: "Reportes", descripcion: "Incidencias y reportes" },
    ],
  },
  { id: "pqrs", icono: MessageSquare, label: "PQRS", descripcion: "Peticiones, quejas y reclamos" },
  { id: "logs", icono: Footprints, label: "Huella Digital", descripcion: "Actividad de accesos y eventos" },
  { id: "notificaciones", icono: BellPlus, label: "Notificaciones", descripcion: "Centro de notificaciones" },
  { id: "tutoriales", icono: Video, label: "Video Tutoriales", descripcion: "Guías de uso del sistema" },
];

const PanelUniversitario = () => {
  const navigate = useNavigate();

  const [panelAbierto, setPanelAbierto] = useState(true);
  const [seccionActiva, setSeccionActiva] = useState("inicio");
  const [subseccionActiva, setSubseccionActiva] = useState(null);
  const [carrerasDesplegado, setCarrerasDesplegado] = useState(false);
  const [recursosDesplegado, setRecursosDesplegado] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [datos, setDatos] = useState(null);
  const [idRecursoFiltro, setIdRecursoFiltro] = useState(null);
  const [recargandoSeccion, setRecargandoSeccion] = useState(false);
  const [tiempoRecarga, setTiempoRecarga] = useState(0);

  const esPrimeraCarga = useRef(true);
  const temporizadorRecargaRef = useRef(null);

  const usuarioStorage = parseLocalStorage("usuario");
  const carreraStorage = parseLocalStorage("carrera");
  const usuarioId = usuarioStorage.id_usuario || null;

  const { perfil, cargando: cargandoPerfil, mensaje, guardarPerfil } = usePerfil(
    seccionActiva === "perfil" && usuarioStorage.id_usuario ? usuarioStorage.id_usuario : null
  );

  const seccionesFiltradas = useMemo(() => {
    if (!busqueda.trim()) return MENU_SECCIONES;

    const texto = busqueda.toLowerCase();

    return MENU_SECCIONES.filter((seccion) => {
      const coincideSeccion =
        seccion.label.toLowerCase().includes(texto) ||
        seccion.descripcion.toLowerCase().includes(texto);

      const coincideSubseccion = seccion.subsecciones?.some(
        (sub) =>
          sub.label.toLowerCase().includes(texto) ||
          sub.descripcion.toLowerCase().includes(texto)
      );

      return coincideSeccion || coincideSubseccion;
    }).map((seccion) => {
      if (!seccion.subsecciones) return seccion;

      return {
        ...seccion,
        subsecciones: seccion.subsecciones.filter(
          (sub) =>
            sub.label.toLowerCase().includes(texto) ||
            sub.descripcion.toLowerCase().includes(texto)
        ),
      };
    });
  }, [busqueda]);

  const seccionActivaInfo =
    MENU_SECCIONES.find((s) => s.id === seccionActiva) || MENU_SECCIONES[0];

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

  useEffect(() => {
    if (esPrimeraCarga.current) {
      esPrimeraCarga.current = false;
      return;
    }

    iniciarRecargaSutil();
  }, [seccionActiva, subseccionActiva]);

  useEffect(() => {
    return () => {
      if (temporizadorRecargaRef.current) {
        clearTimeout(temporizadorRecargaRef.current);
      }
    };
  }, []);

  const iniciarRecargaSutil = () => {
    if (temporizadorRecargaRef.current) {
      clearTimeout(temporizadorRecargaRef.current);
    }

    setRecargandoSeccion(true);
    setTiempoRecarga(0);

    const startTime = Date.now();

    const updateTimer = () => {
      const elapsed = Date.now() - startTime;
      setTiempoRecarga(elapsed);

      if (elapsed < 700) {
        temporizadorRecargaRef.current = setTimeout(updateTimer, 40);
      }
    };

    updateTimer();

    temporizadorRecargaRef.current = setTimeout(() => {
      setRecargandoSeccion(false);
      setTiempoRecarga(0);
    }, 700);
  };

  const handleVerTodasNotificaciones = () => {
    setCarrerasDesplegado(false);
    setRecursosDesplegado(false);
    cargarDatosSeccion("notificaciones");
  };

  const cargarDatosSeccion = (seccionId, subseccionId = null) => {
    setSeccionActiva(seccionId);
    setSubseccionActiva(subseccionId);
    setDatos(null);
    setIdRecursoFiltro(null);

    if (seccionId !== "carreras") setCarrerasDesplegado(false);
    if (seccionId !== "recursos") setRecursosDesplegado(false);

    const seccionesConComponente = [
      "perfil",
      "carreras",
      "asignaturas",
      "roles",
      "usuarios",
      "pensum",
      "recursos",
      "categorias-recursos",
      "reportes-recursos",
      "pqrs",
      "logs",
      "notificaciones",
      "inicio",
      "tutoriales",
    ];

    if (!seccionesConComponente.includes(seccionId) && !seccionesConComponente.includes(subseccionId)) {
      setTimeout(() => {
        setDatos({
          seccion: subseccionId || seccionId,
          timestamp: new Date().toISOString(),
          totalRegistros: Math.floor(Math.random() * 100) + 1,
          mensaje: `Datos cargados para ${subseccionId || seccionId}`,
        });
      }, 500);
    }
  };

  const manejarClickMenuConSubmenu = (seccionId) => {
    if (!panelAbierto) {
      setSeccionActiva(seccionId);
      return;
    }

    if (seccionId === "carreras") {
      const nuevo = !carrerasDesplegado;
      setCarrerasDesplegado(nuevo);
      setRecursosDesplegado(false);

      if (nuevo && seccionActiva !== "carreras") {
        cargarDatosSeccion("carreras", "carreras-lista");
      }
      return;
    }

    if (seccionId === "recursos") {
      const nuevo = !recursosDesplegado;
      setRecursosDesplegado(nuevo);
      setCarrerasDesplegado(false);

      if (nuevo && seccionActiva !== "recursos") {
        cargarDatosSeccion("recursos", "recursos-lista");
      }
    }
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

  const obtenerEtiquetaActual = () => {
    if (seccionActiva === "inicio") return "Dashboard";
    if (seccionActiva === "tutoriales") return "Video Tutoriales";

    if (seccionActiva === "carreras" && subseccionActiva) {
      const seccion = MENU_SECCIONES.find((s) => s.id === "carreras");
      const sub = seccion?.subsecciones?.find((s) => s.id === subseccionActiva);
      return sub?.label || "Carreras";
    }

    if (seccionActiva === "recursos" && subseccionActiva) {
      const seccion = MENU_SECCIONES.find((s) => s.id === "recursos");
      const sub = seccion?.subsecciones?.find((s) => s.id === subseccionActiva);

      if (subseccionActiva === "reportes-recursos" && idRecursoFiltro) {
        return `Reportes del recurso #${idRecursoFiltro}`;
      }

      return sub?.label || "Recursos";
    }

    return seccionActivaInfo.label;
  };

  const obtenerDescripcionActual = () => {
    if (seccionActiva === "tutoriales") {
      return "Aprende a usar la plataforma con nuestros tutoriales paso a paso.";
    }

    if (seccionActiva === "carreras" && subseccionActiva) {
      const seccion = MENU_SECCIONES.find((s) => s.id === "carreras");
      const sub = seccion?.subsecciones?.find((s) => s.id === subseccionActiva);
      return sub?.descripcion || seccionActivaInfo.descripcion;
    }

    if (seccionActiva === "recursos" && subseccionActiva) {
      const seccion = MENU_SECCIONES.find((s) => s.id === "recursos");
      const sub = seccion?.subsecciones?.find((s) => s.id === subseccionActiva);

      if (subseccionActiva === "reportes-recursos" && idRecursoFiltro) {
        return `Consulta detallada de incidencias asociadas al recurso seleccionado.`;
      }

      return sub?.descripcion || seccionActivaInfo.descripcion;
    }

    return seccionActivaInfo.descripcion;
  };

  const renderContenido = () => {
    if (recargandoSeccion) {
      return (
        <div className="panel-pro-recarga">
          <div className="panel-pro-recarga-card">
            <div className="panel-pro-recarga-icon">
              <RotateCw size={34} />
            </div>
            <div className="panel-pro-recarga-barra">
              <div
                className="panel-pro-recarga-barra-fill"
                style={{ width: `${Math.min(100, (tiempoRecarga / 700) * 100)}%` }}
              />
            </div>
            <p className="panel-pro-recarga-texto">Actualizando contenido...</p>
            <span className="panel-pro-recarga-subtexto">Cargando la vista seleccionada</span>
          </div>
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
        if (subseccionActiva === "tipos-carrera") return <TiposCarrera />;
        return <Carreras />;

      case "roles":
        return <Roles />;

      case "asignaturas":
        return <Asignaturas />;

      case "usuarios":
        return <Usuarios />;

      case "pensum":
        return <Pensum />;

      case "recursos":
        if (subseccionActiva === "categorias-recursos") return <Categorias />;
        if (subseccionActiva === "reportes-recursos") {
          return <Reportes idRecursoFiltro={idRecursoFiltro} />;
        }
        return <Recursos onVerReportes={navegarAReportesConFiltro} />;

      case "pqrs":
        return <PQRS />;

      case "logs":
        return <Logs />;

      case "notificaciones":
        return <Notificaciones />;

      default:
        return (
          <div className="panel-pro-empty">
            <div className="panel-pro-empty-icon">
              <LayoutDashboard size={42} />
            </div>
            <h3>Módulo en preparación</h3>
            <p>Esta vista aún no tiene un componente asociado.</p>
            {datos && (
              <div className="panel-pro-empty-meta">
                <span>{datos.totalRegistros} registros simulados</span>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="app-universitario panel-pro-app">
      <aside className={`panel-lateral panel-pro-sidebar ${panelAbierto ? "abierto" : "cerrado"}`}>
        <div className="logo-panel panel-pro-sidebar-header">
          <div className="logo-contenido">
            <div className="logo-icono">
              <GraduationCap size={24} />
            </div>
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
            disabled={recargandoSeccion}
          >
            {panelAbierto ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {panelAbierto && (
          <div className="buscador-panel panel-pro-search">
            <div className="icono-busqueda">
              <Search size={16} />
            </div>
            <input
              type="text"
              className="input-busqueda"
              placeholder="Buscar módulo o sección..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              disabled={recargandoSeccion}
            />
          </div>
        )}

        <nav className="navegacion-panel">
          {seccionesFiltradas.map((s) => {
            const Icono = s.icono;

            if (s.tieneSubmenu && panelAbierto) {
              const estaActiva = seccionActiva === s.id;
              const desplegado =
                (s.id === "carreras" && carrerasDesplegado) ||
                (s.id === "recursos" && recursosDesplegado);

              return (
                <div key={s.id} className="item-submenu-contenedor">
                  <button
                    className={`item-navegacion ${estaActiva ? "activo" : ""}`}
                    onClick={() => manejarClickMenuConSubmenu(s.id)}
                    title={s.descripcion}
                    disabled={recargandoSeccion}
                  >
                    <Icono size={18} />
                    <span>{s.label}</span>
                    <div className="icono-desplegable">
                      {desplegado ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {desplegado && (
                    <div className="submenu-contenido">
                      {s.subsecciones.map((sub) => {
                        const SubIcono = sub.icono;
                        const activa = subseccionActiva === sub.id;

                        return (
                          <button
                            key={sub.id}
                            className={`item-submenu ${activa ? "activo-sub" : ""}`}
                            onClick={() => cargarDatosSeccion(s.id, sub.id)}
                            title={sub.descripcion}
                            disabled={recargandoSeccion}
                          >
                            <SubIcono size={15} />
                            <span>{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const estaActiva = seccionActiva === s.id;

            return (
              <button
                key={s.id}
                className={`item-navegacion ${estaActiva ? "activo" : ""}`}
                onClick={() => cargarDatosSeccion(s.id)}
                title={s.descripcion}
                disabled={recargandoSeccion}
              >
                <Icono size={18} />
                {panelAbierto && <span>{s.label}</span>}
              </button>
            );
          })}

          <div className="separador-navegacion" />

          <button className="item-navegacion cerrar-sesion" onClick={handleCerrarSesion}>
            <LogOut size={18} />
            {panelAbierto && <span>Cerrar sesión</span>}
          </button>
        </nav>

        {panelAbierto && (
          <div className="info-usuario-panel panel-pro-user-card">
            <div className="avatar-usuario">
              {usuarioStorage.nombres_usuario?.charAt(0) || "A"}
              {usuarioStorage.apellidos_usuario?.charAt(0) || "D"}
            </div>
            <div className="detalles-usuario">
              <div className="nombre-usuario">
                {usuarioStorage.nombres_usuario || "Administrador"}
              </div>
              <div className="rol-usuario">Administrador principal</div>
            </div>
          </div>
        )}
      </aside>

      <div className={`contenido-principal panel-pro-main ${panelAbierto ? "abierto" : "cerrado"}`}>
        <header className="barra-superior panel-pro-topbar">
          <div className="panel-pro-title-wrap">
            <div className="ruta-actual">
              <span>Sistema Académico</span>
              <span className="separador-ruta">/</span>
              <span className="ruta-actual-item">{obtenerEtiquetaActual()}</span>
            </div>

            <div className="panel-pro-heading">
              <h1>{obtenerEtiquetaActual()}</h1>
              <p>{obtenerDescripcionActual()}</p>
            </div>
          </div>

          <div className="acciones-superior">
            <button
              className="boton-ayuda"
              onClick={() => cargarDatosSeccion("tutoriales")}
              title="Video Tutoriales"
              disabled={recargandoSeccion}
            >
              <Video size={18} />
            </button>

            <button
              className="boton-ayuda"
              onClick={() => cargarDatosSeccion("notificaciones")}
              title="Notificaciones"
              disabled={recargandoSeccion}
            >
              <Bell size={18} />
            </button>

            <NotificacionesSuperior usuarioId={usuarioId} onVerTodas={handleVerTodasNotificaciones} />
          </div>
        </header>

        <main className="contenido-dinamico panel-pro-content">
          <div className="contenido-seccion">
            <div className="panel-pro-summary-row">
              <div className="panel-pro-summary-card">
                <span className="panel-pro-summary-label">Estado del sistema</span>
                <div className="panel-pro-summary-value ok">
                  <span className="panel-pro-dot" />
                  Sistema conectado
                </div>
              </div>

              <div className="panel-pro-summary-card">
                <span className="panel-pro-summary-label">Módulo actual</span>
                <div className="panel-pro-summary-value">{obtenerEtiquetaActual()}</div>
              </div>

              <div className="panel-pro-summary-card">
                <span className="panel-pro-summary-label">Estado de vista</span>
                <div className="panel-pro-summary-value">
                  {recargandoSeccion ? "Actualizando..." : "Operativa"}
                </div>
              </div>
            </div>

            <section className="panel-pro-body-card">{renderContenido()}</section>
          </div>
        </main>

        <footer className="pie-pagina panel-pro-footer">
          <p>© {new Date().getFullYear()} Sistema Académico Universitario</p>
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