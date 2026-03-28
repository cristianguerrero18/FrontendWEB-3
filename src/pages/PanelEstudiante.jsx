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
  MessageSquare,
  BellPlus,
  Video,
  LayoutDashboard,
  Heart,
  FolderArchive,
  Bell,
  RotateCw,
  BookOpen,
} from "lucide-react";

import "../css/Principal.css";
import "../css/Recursos.css";

import Perfil from "../components/Admin/Perfil.jsx";
import Recursos from "../components/Usuarios/Semestres.jsx";
import MisRecursos from "../components/Usuarios/MisRecursos.jsx";
import Favoritos from "../components/Usuarios/Favoritos.jsx";
import PQRSStudent from "../components/Usuarios/PQRSStudent.jsx";
import Notificaciones from "../components/Usuarios/NotificacionesStudent.jsx";
import NotificacionesSuperior from "../components/Admin/NotificacionesSuperior.jsx";
import DashboardEstudiante from "../components/Usuarios/Dashboards.jsx";
import VideoTutorial from "../components/Usuarios/VideoTutorial.jsx";
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

const MENU_SECCIONES = [
  {
    id: "inicio",
    icono: LayoutDashboard,
    label: "Dashboard",
    descripcion: "Vista general del panel del estudiante",
  },
  {
    id: "perfil",
    icono: User,
    label: "Perfil",
    descripcion: "Administración del perfil del estudiante",
  },
  {
    id: "recursos",
    icono: BookOpen,
    label: "Recursos",
    descripcion: "Consulta de recursos académicos disponibles",
  },
  {
    id: "favoritos",
    icono: Heart,
    label: "Mis Favoritos",
    descripcion: "Recursos marcados como favoritos",
  },
  {
    id: "adminrecursos",
    icono: FolderArchive,
    label: "Mis Recursos",
    descripcion: "Gestión de los recursos subidos por el estudiante",
  },
  {
    id: "pqrs",
    icono: MessageSquare,
    label: "PQRS",
    descripcion: "Peticiones, quejas, reclamos y sugerencias",
  },
  {
    id: "notificaciones",
    icono: BellPlus,
    label: "Notificaciones",
    descripcion: "Centro de notificaciones del estudiante",
  },
  {
    id: "tutoriales",
    icono: Video,
    label: "Video Tutoriales",
    descripcion: "Guías de uso de la plataforma",
  },
];

const PanelEstudiante = () => {
  const navigate = useNavigate();

  const [panelAbierto, setPanelAbierto] = useState(true);
  const [seccionActiva, setSeccionActiva] = useState("inicio");
  const [busqueda, setBusqueda] = useState("");
  const [recargandoSeccion, setRecargandoSeccion] = useState(false);
  const [tiempoRecarga, setTiempoRecarga] = useState(0);

  const esPrimeraCarga = useRef(true);
  const temporizadorRecargaRef = useRef(null);

  const usuarioStorage = parseLocalStorage("usuario");
  const usuarioId = usuarioStorage.id_usuario || null;

  const { userData, loadUserData } = useUser();

  const carreraNombre =
    userData?.carrera_nombre ||
    userData?.nombre_carrera ||
    usuarioStorage?.nombre_carrera ||
    "Carrera no asignada";

  const {
    perfil,
    cargando: cargandoPerfil,
    mensaje,
    guardarPerfil,
    eliminarPerfil,
    mostrarModalEliminar,
    setMostrarModalEliminar,
  } = usePerfil(
    seccionActiva === "perfil" && usuarioStorage.id_usuario
      ? usuarioStorage.id_usuario
      : null
  );

  const seccionesFiltradas = useMemo(() => {
    if (!busqueda.trim()) return MENU_SECCIONES;

    const texto = busqueda.toLowerCase();

    return MENU_SECCIONES.filter(
      (seccion) =>
        seccion.label.toLowerCase().includes(texto) ||
        seccion.descripcion.toLowerCase().includes(texto)
    );
  }, [busqueda]);

  const seccionActivaInfo =
    MENU_SECCIONES.find((s) => s.id === seccionActiva) || MENU_SECCIONES[0];

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

  useEffect(() => {
    if (usuarioStorage?.id_usuario && !userData) {
      loadUserData(usuarioStorage.id_usuario);
    }
  }, [usuarioStorage?.id_usuario, userData, loadUserData]);

  useEffect(() => {
    if (esPrimeraCarga.current) {
      esPrimeraCarga.current = false;
      return;
    }

    iniciarRecargaSutil();
  }, [seccionActiva]);

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

  const cargarDatosSeccion = (seccionId) => {
    setSeccionActiva(seccionId);
  };

  const handleVerTodasNotificaciones = () => {
    cargarDatosSeccion("notificaciones");
  };

  const handleCerrarSesion = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/Login", { replace: true });
  };

  const obtenerEtiquetaActual = () => {
    return seccionActivaInfo.label;
  };

  const obtenerDescripcionActual = () => {
    return seccionActivaInfo.descripcion;
  };

  const obtenerEstadisticas = () => {
    return {
      recursos: userData?.totalRecursos || 0,
      favoritos: userData?.totalFavoritos || 0,
      noLeidas: userData?.notificacionesNoLeidas || 0,
    };
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
            <span className="panel-pro-recarga-subtexto">
              Cargando la vista seleccionada
            </span>
          </div>
        </div>
      );
    }

    switch (seccionActiva) {
      case "inicio":
        return <DashboardEstudiante />;
      case "perfil":
        return (
          <Perfil
            perfil={perfil}
            cargando={cargandoPerfil}
            mensaje={mensaje}
            carreraStorage={{ nombre_carrera: carreraNombre }}
            guardarPerfil={guardarPerfil}
            eliminarPerfil={eliminarPerfil}
            mostrarModalEliminar={mostrarModalEliminar}
            setMostrarModalEliminar={setMostrarModalEliminar}
          />
        );
      case "recursos":
        return <Recursos />;
      case "favoritos":
        return <Favoritos />;
      case "adminrecursos":
        return <MisRecursos />;
      case "pqrs":
        return <PQRSStudent />;
      case "notificaciones":
        return <Notificaciones />;
      case "tutoriales":
        return <VideoTutorial />;
      default:
        return (
          <div className="panel-pro-empty">
            <div className="panel-pro-empty-icon">
              <LayoutDashboard size={42} />
            </div>
            <h3>Módulo en preparación</h3>
            <p>Esta vista aún no tiene un componente asociado.</p>
          </div>
        );
    }
  };

  const stats = obtenerEstadisticas();

  return (
    <div className="app-universitario panel-pro-app">
      <aside
        className={`panel-lateral panel-pro-sidebar ${
          panelAbierto ? "abierto" : "cerrado"
        }`}
      >
        <div className="logo-panel panel-pro-sidebar-header">
          <div className="logo-contenido">
            <div className="logo-icono">
              <GraduationCap size={24} />
            </div>
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
              {usuarioStorage.nombres_usuario?.charAt(0) || "E"}
              {usuarioStorage.apellidos_usuario?.charAt(0) || "S"}
            </div>
            <div className="detalles-usuario">
              <div className="nombre-usuario">
                {usuarioStorage.nombres_usuario || "Estudiante"}
              </div>
              <div className="rol-usuario">{carreraNombre}</div>
            </div>
          </div>
        )}
      </aside>

      <div
        className={`contenido-principal panel-pro-main ${
          panelAbierto ? "abierto" : "cerrado"
        }`}
      >
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

            <NotificacionesSuperior
              usuarioId={usuarioId}
              onVerTodas={handleVerTodasNotificaciones}
            />
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
                <span className="panel-pro-summary-label">Resumen rápido</span>
                <div className="panel-pro-summary-value">
                  {seccionActiva === "favoritos"
                    ? `${stats.favoritos} favoritos`
                    : seccionActiva === "notificaciones"
                    ? `${stats.noLeidas} sin leer`
                    : `${stats.recursos} recursos`}
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

export default PanelEstudiante;