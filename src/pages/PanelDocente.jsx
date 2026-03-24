import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  User,
  Folder,
  BellPlus,
  MessageSquare,
  Video,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  LayoutDashboard,
  GraduationCap,
  Heart,
  FolderArchive,
  BookCheck,
  Bell,
  RotateCw,
  Database,
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
import RecursosAdmin from "../components/Admin/Recursos.jsx";
import Categorias from "../components/Admin/Categorias.jsx";
import Reportes from "../components/Admin/Reportes.jsx";
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

const MENU_SECCIONES_DOCENTE = [
  {
    id: "inicio",
    icono: LayoutDashboard,
    label: "Dashboard",
    descripcion: "Vista general del panel del docente",
  },
  {
    id: "perfil",
    icono: User,
    label: "Perfil",
    descripcion: "Administración del perfil del docente",
  },
  {
    id: "recursos",
    icono: BookCheck,
    label: "Recursos",
    descripcion: "Consulta de recursos académicos disponibles",
  },
  {
    id: "adminrecursos",
    icono: Folder,
    label: "Administrar Recursos",
    descripcion: "Administración completa de recursos",
    tieneSubmenu: true,
    subsecciones: [
      {
        id: "recursos-lista",
        icono: Database,
        label: "Recursos",
        descripcion: "Gestión de recursos",
      },
      {
        id: "categorias-recursos",
        icono: Database,
        label: "Categorías",
        descripcion: "Gestión de categorías",
      },
      {
        id: "reportes-recursos",
        icono: Database,
        label: "Reportes",
        descripcion: "Gestión de reportes",
      },
    ],
  },
  {
    id: "misrecursos",
    icono: FolderArchive,
    label: "Mis Recursos",
    descripcion: "Administración de mis recursos subidos",
  },
  {
    id: "favoritos",
    icono: Heart,
    label: "Mis Favoritos",
    descripcion: "Recursos marcados como favoritos",
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
    descripcion: "Centro de notificaciones del docente",
  },
  {
    id: "tutoriales",
    icono: Video,
    label: "Video Tutoriales",
    descripcion: "Guías de uso de la plataforma",
  },
];

const PanelDocente = () => {
  const navigate = useNavigate();

  const [panelAbierto, setPanelAbierto] = useState(true);
  const [seccionActiva, setSeccionActiva] = useState("inicio");
  const [subseccionActiva, setSubseccionActiva] = useState(null);
  const [recursosDesplegado, setRecursosDesplegado] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [datos, setDatos] = useState(null);
  const [mostrarVistaFavoritos, setMostrarVistaFavoritos] = useState(false);
  const [idRecursoFiltro, setIdRecursoFiltro] = useState(null);

  const [recargandoSeccion, setRecargandoSeccion] = useState(false);
  const [ultimaSeccionClickeada, setUltimaSeccionClickeada] = useState(null);
  const [ultimaSubseccionClickeada, setUltimaSubseccionClickeada] = useState(null);
  const [tiempoRecarga, setTiempoRecarga] = useState(0);

  const esPrimeraCarga = useRef(true);
  const temporizadorRecargaRef = useRef(null);

  const usuarioStorage = parseLocalStorage("usuario");
  const carreraStorage = parseLocalStorage("carrera");
  const usuarioId = usuarioStorage.id_usuario || null;

  const { userData, loadUserData } = useUser();

  const { perfil, cargando: cargandoPerfil, mensaje, recargar, guardarPerfil } = usePerfil(
    seccionActiva === "perfil" && usuarioStorage.id_usuario ? usuarioStorage.id_usuario : null
  );

  const seccionesFiltradas = useMemo(() => {
    if (!busqueda.trim()) return MENU_SECCIONES_DOCENTE;

    const texto = busqueda.toLowerCase();

    return MENU_SECCIONES_DOCENTE.filter((seccion) => {
      const coincidePrincipal =
        seccion.label.toLowerCase().includes(texto) ||
        seccion.descripcion.toLowerCase().includes(texto);

      const coincideSub =
        seccion.subsecciones?.some(
          (sub) =>
            sub.label.toLowerCase().includes(texto) ||
            sub.descripcion.toLowerCase().includes(texto)
        ) || false;

      return coincidePrincipal || coincideSub;
    });
  }, [busqueda]);

  const seccionActivaInfo =
    MENU_SECCIONES_DOCENTE.find((s) => s.id === seccionActiva) || MENU_SECCIONES_DOCENTE[0];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/Login", { replace: true });

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now() || decoded.id_rol !== 3) {
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

    if (
      (ultimaSeccionClickeada && ultimaSeccionClickeada === seccionActiva) ||
      (ultimaSubseccionClickeada && ultimaSubseccionClickeada === subseccionActiva)
    ) {
      iniciarRecargaSutil();
    }
  }, [seccionActiva, subseccionActiva, ultimaSeccionClickeada, ultimaSubseccionClickeada]);

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

      if (elapsed < 800) {
        temporizadorRecargaRef.current = setTimeout(updateTimer, 50);
      }
    };

    updateTimer();

    temporizadorRecargaRef.current = setTimeout(() => {
      setRecargandoSeccion(false);
      setTiempoRecarga(0);
    }, 800);
  };

  const handleVerTodasNotificaciones = () => {
    cargarDatosSeccion("notificaciones");
  };

  const cargarDatosSeccion = (seccionId, subseccionId = null) => {
    setUltimaSeccionClickeada(seccionId);
    if (subseccionId) {
      setUltimaSubseccionClickeada(subseccionId);
    }

    setSeccionActiva(seccionId);
    if (subseccionId) {
      setSubseccionActiva(subseccionId);
    } else if (seccionId !== "adminrecursos") {
      setSubseccionActiva(null);
    }

    setDatos(null);
    setMostrarVistaFavoritos(false);
    setIdRecursoFiltro(null);

    if (seccionId !== "adminrecursos") {
      setRecursosDesplegado(false);
    }

    const seccionesConComponente = [
      "perfil",
      "recursos",
      "adminrecursos",
      "misrecursos",
      "favoritos",
      "pqrs",
      "notificaciones",
      "inicio",
      "tutoriales",
      "recursos-lista",
      "categorias-recursos",
      "reportes-recursos",
    ];

    if (
      !seccionesConComponente.includes(seccionId) &&
      !seccionesConComponente.includes(subseccionId)
    ) {
      setTimeout(() => {
        setDatos({
          seccion: subseccionId || seccionId,
          timestamp: new Date().toISOString(),
          totalRegistros: Math.floor(Math.random() * 100) + 1,
          mensaje: `Datos cargados para ${subseccionId || seccionId}`,
        });
      }, 600);
    }
  };

  const manejarClickMenuConSubmenu = (seccionId) => {
    if (panelAbierto) {
      switch (seccionId) {
        case "adminrecursos": {
          const nuevoEstadoRecursos = !recursosDesplegado;
          setRecursosDesplegado(nuevoEstadoRecursos);

          if (
            nuevoEstadoRecursos &&
            (!subseccionActiva || !subseccionActiva.startsWith("recursos-"))
          ) {
            setSubseccionActiva("recursos-lista");
            if (seccionActiva !== "adminrecursos") {
              cargarDatosSeccion("adminrecursos", "recursos-lista");
            }
          }
          break;
        }
        default:
          break;
      }
    } else {
      setUltimaSeccionClickeada(seccionId);
      setSeccionActiva(seccionId);
      cargarDatosSeccion(seccionId);
    }
  };

  const obtenerEtiquetaActual = () => {
    if (seccionActiva === "inicio") return "Dashboard";
    if (seccionActiva === "tutoriales") return "Video Tutoriales";

    if (seccionActiva === "adminrecursos" && subseccionActiva) {
      const seccionAdmin = MENU_SECCIONES_DOCENTE.find((s) => s.id === "adminrecursos");
      const subseccion = seccionAdmin?.subsecciones?.find((s) => s.id === subseccionActiva);

      if (subseccionActiva === "reportes-recursos" && idRecursoFiltro) {
        return `Reportes del Recurso #${idRecursoFiltro}`;
      }

      return subseccion?.label || "Administrar Recursos";
    }

    if (seccionActiva === "misrecursos") return "Mis Recursos";
    if (seccionActiva === "favoritos") return "Mis Favoritos";

    return seccionActivaInfo.label;
  };

  const obtenerDescripcionActual = () => {
    if (seccionActiva === "tutoriales") {
      return "Aprende a usar el Sistema Académico con tutoriales paso a paso";
    }

    if (seccionActiva === "adminrecursos" && subseccionActiva) {
      const seccionAdmin = MENU_SECCIONES_DOCENTE.find((s) => s.id === "adminrecursos");
      const subseccion = seccionAdmin?.subsecciones?.find((sub) => sub.id === subseccionActiva);

      if (subseccionActiva === "reportes-recursos" && idRecursoFiltro) {
        return `Viendo reportes específicos del recurso #${idRecursoFiltro}`;
      }

      return subseccion?.descripcion || "Administración completa de recursos educativos";
    }

    return seccionActivaInfo.descripcion;
  };

  const navegarAReportesConFiltro = (idRecurso) => {
    setIdRecursoFiltro(idRecurso);
    setUltimaSeccionClickeada("adminrecursos");
    setUltimaSubseccionClickeada("reportes-recursos");
    setSeccionActiva("adminrecursos");
    setSubseccionActiva("reportes-recursos");
    setRecursosDesplegado(true);
  };

  const obtenerEstadisticasRecursos = () => {
    if (
      !userData ||
      (seccionActiva !== "misrecursos" &&
        seccionActiva !== "favoritos" &&
        seccionActiva !== "pqrs" &&
        seccionActiva !== "notificaciones")
    ) {
      return null;
    }

    return {
      total: userData.totalRecursos || 0,
      activos: userData.recursosActivos || 0,
      reportados: userData.recursosReportados || 0,
      categorias: userData.categoriasDistintas || 0,
      favoritos: userData.totalFavoritos || 0,
      notificaciones: userData.notificacionesNoLeidas || 0,
    };
  };

  const handleVolverDeFavoritos = () => {
    setMostrarVistaFavoritos(false);
  };

  const handleCerrarSesion = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/Login", { replace: true });
  };

  const obtenerResumenRapido = () => {
    const stats = obtenerEstadisticasRecursos();

    if (!stats) {
      return {
        recursos: userData?.totalRecursos || 0,
        favoritos: userData?.totalFavoritos || 0,
        noLeidas: userData?.notificacionesNoLeidas || 0,
      };
    }

    return {
      recursos: stats.total || 0,
      favoritos: stats.favoritos || 0,
      noLeidas: stats.notificaciones || 0,
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
                style={{ width: `${Math.min(100, (tiempoRecarga / 800) * 100)}%` }}
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
        return <DashboardEstudiante />;

      case "perfil":
        return (
          <Perfil
            perfil={perfil}
            cargando={cargandoPerfil}
            mensaje={mensaje}
            carreraStorage={carreraStorage}
            guardarPerfil={guardarPerfil}
            recargar={recargar}
          />
        );

      case "recursos":
        return <Recursos />;

      case "misrecursos":
        return <MisRecursos />;

      case "adminrecursos":
        switch (subseccionActiva) {
          case "recursos-lista":
            return <RecursosAdmin onVerReportes={navegarAReportesConFiltro} />;
          case "categorias-recursos":
            return <Categorias />;
          case "reportes-recursos":
            return <Reportes idRecursoFiltro={idRecursoFiltro} />;
          default:
            return <RecursosAdmin onVerReportes={navegarAReportesConFiltro} />;
        }

      case "pqrs":
        return <PQRSStudent />;

      case "notificaciones":
        return <Notificaciones />;

      case "tutoriales":
        return (
          <div className="panel-pro-empty">
            <div className="panel-pro-empty-icon">
              <Video size={42} />
            </div>
            <h3>Video Tutoriales</h3>
            <p>Accede a las guías de uso de la plataforma.</p>
          </div>
        );

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
                  <p className="texto-ayuda">
                    Timestamp: {new Date(datos.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="pie-tarjeta-api">
                <div className="texto-ayuda">Esta funcionalidad está en desarrollo</div>
                <button
                  className="boton-refrescar"
                  onClick={() => cargarDatosSeccion(seccionActiva)}
                >
                  Refrescar Datos
                </button>
              </div>
            </div>
          );
        }

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

  const stats = obtenerResumenRapido();

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
                <div className="logo-subtexto">Panel de Docente</div>
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

            if (s.tieneSubmenu && panelAbierto) {
              const submenuAbierto = s.id === "adminrecursos" && recursosDesplegado;

              return (
                <div key={s.id} className="item-submenu-contenedor">
                  <button
                    className={`item-navegacion ${estaActiva ? "activo" : ""} ${
                      submenuAbierto ? "con-submenu-abierto" : ""
                    }`}
                    onClick={() => manejarClickMenuConSubmenu(s.id)}
                    title={s.descripcion}
                    disabled={recargandoSeccion}
                  >
                    <Icono size={18} />
                    {panelAbierto && <span>{s.label}</span>}
                  </button>

                  {submenuAbierto && (
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
                            disabled={recargandoSeccion}
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

          <button
            className="item-navegacion cerrar-sesion"
            onClick={handleCerrarSesion}
            disabled={recargandoSeccion}
          >
            <LogOut size={18} />
            {panelAbierto && <span>Cerrar sesión</span>}
          </button>
        </nav>

        {panelAbierto && (
          <div className="info-usuario-panel panel-pro-user-card">
            <div className="avatar-usuario">
              {usuarioStorage.nombres_usuario?.charAt(0) || "D"}
              {usuarioStorage.apellidos_usuario?.charAt(0) || "O"}
            </div>
            <div className="detalles-usuario">
              <div className="nombre-usuario">
                {usuarioStorage.nombres_usuario || "Docente"}
              </div>
              <div className="rol-usuario">
                {carreraStorage?.nombre_carrera || "Carrera no asignada"}
              </div>
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

export default PanelDocente;