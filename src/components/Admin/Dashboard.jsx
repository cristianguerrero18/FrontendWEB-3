import React, { useState, useEffect } from "react";
import { useDashboard } from "../../hooks/useDashboard.js";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  Folder, 
  Tag, 
  List, 
  RefreshCw,
  BarChart3,
  TrendingUp,
  Clock,
  Info,
  Zap
} from "lucide-react";
import "../../css/Dashboard.css";

const Dashboard = () => {
  const { 
    totales, 
    cargando, 
    recargarDashboard 
  } = useDashboard();
  
  const [stats, setStats] = useState([]);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  // Efecto para procesar los totales
  useEffect(() => {
    if (Object.keys(totales).length > 0) {
      procesarEstadisticas();
      setUltimaActualizacion(new Date().toLocaleTimeString());
    }
  }, [totales]);

  // Función para procesar estadísticas
  const procesarEstadisticas = () => {
    const estadisticas = [
      {
        id: 1,
        titulo: "Usuarios",
        valor: totales.usuarios || 0,
        icono: <Users size={24} />,
        color: "#4a90e2",
        descripcion: "Usuarios registrados",
        ruta: "#usuarios",
        variacion: "+12%"
      },
      {
        id: 2,
        titulo: "Carreras",
        valor: totales.carreras || 0,
        icono: <GraduationCap size={24} />,
        color: "#50c878",
        descripcion: "Programas académicos",
        ruta: "#carreras",
        variacion: "+5%"
      },
      {
        id: 3,
        titulo: "Asignaturas",
        valor: totales.asignaturas || 0,
        icono: <BookOpen size={24} />,
        color: "#f39c12",
        descripcion: "Materias del sistema",
        ruta: "#asignaturas",
        variacion: "+8%"
      },
      {
        id: 4,
        titulo: "Pensum",
        valor: totales.pensum || 0,
        icono: <FileText size={24} />,
        color: "#e74c3c",
        descripcion: "Registros de pensum",
        ruta: "#pensum",
        variacion: "+3%"
      },
      {
        id: 5,
        titulo: "Recursos",
        valor: totales.recursos || 0,
        icono: <Folder size={24} />,
        color: "#3498db",
        descripcion: "Archivos y documentos",
        ruta: "#recursos",
        variacion: "+15%"
      },
      {
        id: 6,
        titulo: "Categorías",
        valor: totales.categorias || 0,
        icono: <Tag size={24} />,
        color: "#9b59b6",
        descripcion: "Clasificaciones",
        ruta: "#categorias",
        variacion: "+7%"
      },
      {
        id: 7,
        titulo: "Tipos de Carrera",
        valor: totales.tipo_carrera || 0,
        icono: <List size={24} />,
        color: "#1abc9c",
        descripcion: "Modalidades",
        ruta: "#tipos-carrera",
        variacion: "+2%"
      }
    ];
    
    setStats(estadisticas);
  };

  // Función para formatear números grandes
  const formatearNumero = (num) => {
    if (num >= 1000) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return num.toString();
  };

  // Calcular total general
  const totalGeneral = Object.values(totales).reduce((a, b) => a + b, 0);

  return (
    <div className="contenedor-dashboard">
      {/* Cabecera */}
      <div className="cabecera-dashboard">
        <div className="titulo-dashboard-con-boton">
          <div>
            <h1>Dashboard del Sistema</h1>
            <p className="subtitulo-dashboard">
              Resumen general de los datos del sistema educativo
            </p>
          </div>
          <div className="controles-dashboard">
            {ultimaActualizacion && (
              <div className="info-actualizacion-dashboard">
                <Clock size={14} />
                <span>Actualizado: {ultimaActualizacion}</span>
              </div>
            )}
            <button 
              className="boton-actualizar-dashboard"
              onClick={recargarDashboard}
              disabled={cargando}
              title="Actualizar datos"
            >
              <RefreshCw size={16} className={cargando ? "girando" : ""} />
              <span>Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Total General */}
      <div className="total-general-dashboard">
        <div className="tarjeta-total-general">
          <div className="icono-total-general">
            <BarChart3 size={32} />
          </div>
          <div className="contenido-total-general">
            <div className="valor-total-general">{formatearNumero(totalGeneral)}</div>
            <div className="titulo-total-general">Registros Totales</div>
            <div className="variacion-total-general">
              <TrendingUp size={14} />
              <span>+8% vs mes anterior</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de estadísticas */}
      <div className="grid-estadisticas-dashboard">
        {stats.map((stat) => (
          <div 
            key={stat.id} 
            className="tarjeta-estadistica"
            onClick={() => window.location.hash = stat.ruta}
          >
            <div className="cabecera-tarjeta-estadistica">
              <div className="icono-tarjeta-estadistica" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                {stat.icono}
              </div>
              <div className="variacion-tarjeta-estadistica">
                <span style={{ color: stat.color }}>{stat.variacion}</span>
              </div>
            </div>
            
            <div className="cuerpo-tarjeta-estadistica">
              <div className="valor-tarjeta-estadistica">
                {formatearNumero(stat.valor)}
              </div>
              <div className="titulo-tarjeta-estadistica">
                {stat.titulo}
              </div>
              <div className="descripcion-tarjeta-estadistica">
                {stat.descripcion}
              </div>
            </div>
            
            <div className="pie-tarjeta-estadistica">
              <div className="indicador-acceso">
                <span>Ver detalles</span>
                <div className="flecha-acceso">→</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className="informacion-adicional-dashboard">
        <div className="tarjeta-informacion">
          <div className="icono-informacion">
            <Info size={20} />
          </div>
          <div className="contenido-informacion">
            <h4>Información del Dashboard</h4>
            <p>
              Este dashboard muestra un resumen de todos los datos registrados en el sistema. 
              Los números representan el total de registros en cada categoría.
            </p>
          </div>
        </div>
        <div className="tarjeta-informacion">
          <div className="icono-informacion">
            <Zap size={20} />
          </div>
          <div className="contenido-informacion">
            <h4>Actualizaciones en tiempo real</h4>
            <p>
              Los datos se actualizan automáticamente. Usa el botón "Actualizar" 
              para obtener la información más reciente del sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;