import React from "react";
import {
  GraduationCap,
  Shield,
  BookOpen,
  Users,
  Globe,
  Heart,
  Target,
  Clock,
  Award,
  Lightbulb,
  AlertTriangle,
  RotateCw,
  AlertCircle
} from "lucide-react";
import "../../css/DashboardS.css";

const DashboardEstudiante = () => {
  return (
    <div className="dashboard-estudiante">

      {/* Hero Section */}
      <div className="hero-dashboard">
        <div className="hero-contenido">
          <div className="hero-icono">
            <GraduationCap size={48} />
          </div>
          <h1 className="hero-titulo">Plataforma Educativa Digital - UTS</h1>
          <div className="hero-badges">
            <span className="badge-estado activo">
              <RotateCw size={12} />
              En Desarrollo Activo
            </span>
            <span className="badge-version">Versión 1.0.0</span>
          </div>
        </div>
      </div>

      {/* Grid de características con indicadores de desarrollo */}
      <div className="grid-caracteristicas">
        <div className="caracteristica-card">
          <div className="caracteristica-icono">
            <BookOpen size={32} />
          </div>
          <div className="caracteristica-badge desarrollo">En Desarrollo</div>
          <h3>Recursos Digitales</h3>
          <p>
            Comparte y accede a materiales educativos, presentaciones, 
            guías de estudio y recursos multimedia con tus compañeros.
          </p>
          <div className="caracteristica-estado">
            <AlertCircle size={14} />
            <span>Funcionalidad en pruebas</span>
          </div>
        </div>

        <div className="caracteristica-card">
          <div className="caracteristica-icono">
            <Users size={32} />
          </div>
          <div className="caracteristica-badge desarrollo">En Desarrollo</div>
          <h3>Colaboración Estudiantil</h3>
          <p>
            Fomentamos el trabajo colaborativo y el intercambio de conocimiento
            entre estudiantes de diferentes semestres y programas.
          </p>
          <div className="caracteristica-estado">
            <AlertCircle size={14} />
            <span>Sujeto a cambios</span>
          </div>
        </div>

        <div className="caracteristica-card">
          <div className="caracteristica-icono">
            <Globe size={32} />
          </div>
          <div className="caracteristica-badge desarrollo">En Desarrollo</div>
          <h3>Acceso Universal</h3>
          <p>
            Plataforma disponible 24/7 desde cualquier dispositivo con conexión
            a internet, promoviendo la educación inclusiva.
          </p>
          <div className="caracteristica-estado">
            <AlertCircle size={14} />
            <span>Mejoras continuas</span>
          </div>
        </div>

        <div className="caracteristica-card">
          <div className="caracteristica-icono">
            <Heart size={32} />
          </div>
          <div className="caracteristica-badge desarrollo">En Desarrollo</div>
          <h3>Comunidad Educativa</h3>
          <p>
            Forma parte de una comunidad activa comprometida con la mejora
            continua de los procesos de enseñanza-aprendizaje.
          </p>
          <div className="caracteristica-estado">
            <AlertCircle size={14} />
            <span>En construcción</span>
          </div>
        </div>
      </div>

      {/* Sección de misión */}
      <div className="seccion-mision">
        <div className="mision-contenido">
          <div className="mision-icono">
            <Target size={40} />
          </div>
          <div className="mision-texto">
            <div className="mision-badges">
              <span className="badge-proyecto">Proyecto de Grado</span>
              <span className="badge-investigacion">Investigación Aplicada</span>
            </div>
            <h2>Nuestra Misión</h2>
            <p>
              Desarrollar una plataforma tecnológica que facilite el intercambio
              de recursos educativos digitales entre los estudiantes de la 
              <strong> Unidades Tecnológicas de Santander (UTS)</strong>, 
              fortaleciendo el aprendizaje colaborativo y promoviendo la 
              innovación en los procesos académicos.
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas y beneficios */}
      <div className="estadisticas-beneficios">
        <div className="beneficio-item">
          <div className="beneficio-icono">
            <Clock size={24} />
          </div>
          <div className="beneficio-contenido">
            <h4>Optimización del Tiempo</h4>
            <p>Acceso rápido a recursos validados por la comunidad estudiantil</p>
            <span className="beneficio-tag desarrollo">En Pruebas</span>
          </div>
        </div>

        <div className="beneficio-item">
          <div className="beneficio-icono">
            <Award size={24} />
          </div>
          <div className="beneficio-contenido">
            <h4>Calidad Garantizada</h4>
            <p>Sistema de valoración y reportes para mantener la calidad de contenidos</p>
            <span className="beneficio-tag desarrollo">En Pruebas</span>
          </div>
        </div>

        <div className="beneficio-item">
          <div className="beneficio-icono">
            <Lightbulb size={24} />
          </div>
          <div className="beneficio-contenido">
            <h4>Innovación Educativa</h4>
            <p>Fomento de nuevas metodologías de enseñanza-aprendizaje digital</p>
            <span className="beneficio-tag desarrollo">En Pruebas</span>
          </div>
        </div>
      </div>

      {/* Nota sobre errores y fallas */}
      <div className="seccion-errores">
        <div className="error-contenido">
          <div className="error-icono">
            <AlertTriangle size={32} />
          </div>
          <div className="error-texto">
            <h3>¿Encontraste un error o falla?</h3>
            <p>
              <strong>¡Es normal!</strong> Este sistema está en desarrollo activo. 
              Si encuentras algún problema, comportamiento extraño o funcionalidad 
              que no trabaja como esperabas:
            </p>
            <ul className="error-lista">
              <li>Intenta recargar la página</li>
              <li>Espera unos minutos e intenta nuevamente</li>
              <li>Reporta el problema usando la sección PQRS</li>
              <li>Ten paciencia mientras mejoramos el sistema</li>
            </ul>
            <p className="error-ayuda">
              Tu experiencia es valiosa para el desarrollo del proyecto. 
              Cada error reportado nos ayuda a mejorar.
            </p>
          </div>
        </div>
      </div>

      {/* Marco legal y políticas */}
      <div className="seccion-legal">
        <div className="legal-header">
          <div className="legal-icono">
            <Shield size={32} />
          </div>
          <h2>Marco Legal y Políticas</h2>
        </div>

        <div className="legal-grid">
          <div className="legal-card">
            <h3>Ley 1581 de 2012</h3>
            <p>
              Protección de datos personales. Este sistema garantiza la 
              protección y tratamiento adecuado de la información personal
              de los usuarios, cumpliendo con los estándares de privacidad
              establecidos por la ley colombiana.
            </p>
          </div>

          <div className="legal-card">
            <h3>Propiedad Intelectual</h3>
            <p>
              Respetamos los derechos de autor y propiedad intelectual.
              Los recursos compartidos deben respetar las normativas de 
              uso justo y citación académica apropiada.
            </p>
          </div>

          <div className="legal-card">
            <h3>Uso Responsable</h3>
            <p>
              La plataforma está diseñada para fines académicos exclusivamente.
              Se prohíbe cualquier uso que viole las normas de la institución
              o que promueva contenido inapropiado.
            </p>
          </div>

          <div className="legal-card">
            <h3>Política de Privacidad</h3>
            <p>
              Tu información personal es confidencial. Solo se utilizará
              con fines académicos y administrativos dentro del contexto
              del proyecto de grado y la institución educativa.
            </p>
          </div>
        </div>

        <div className="legal-footer">
          <div className="legal-advertencia">
            <AlertTriangle size={20} />
            <p>
              <strong>Nota Importante:</strong> Este es un sistema en desarrollo 
              como parte de un proyecto de grado de la <strong>Unidades Tecnológicas de Santander (UTS)</strong>. 
              <strong> Pueden presentarse errores, fallas o comportamientos inesperados.</strong> 
              El uso de la plataforma implica la aceptación de las políticas establecidas.
            </p>
          </div>
          <a href="/politica-completa" className="enlace-politica">
            Ver política completa de uso y privacidad →
          </a>
        </div>
      </div>

      {/* Call to Action */}
      <div className="cta-dashboard">
        <div className="cta-contenido">
          <h2>¡Comienza a Explorar!</h2>
          <p>
            Únete a la comunidad educativa digital de las UTS y contribuye
            al crecimiento académico colectivo. 
            <strong> Recuerda que esta es una versión en desarrollo.</strong>
          </p>
          
          <div className="cta-estadisticas">
            <div className="estadistica">
              <span className="numero">100+</span>
              <span className="label">Estudiantes Activos</span>
              <span className="estadistica-tag beta">Estimación</span>
            </div>
            <div className="estadistica">
              <span className="numero">500+</span>
              <span className="label">Recursos Compartidos</span>
              <span className="estadistica-tag beta">Estimación</span>
            </div>
            <div className="estadistica">
              <span className="numero">10+</span>
              <span className="label">Programas Académicos</span>
              <span className="estadistica-tag beta">Estimación</span>
            </div>
          </div>
          
          <div className="cta-advertencia">
            <AlertTriangle size={16} />
            <span>
              <strong>Nota:</strong> Los datos mostrados son estimaciones del proyecto. 
              El sistema real puede variar durante el desarrollo.
            </span>
          </div>
        </div>
      </div>

      {/* Sección de reporte de errores */}
      <div className="seccion-reporte">
        <div className="reporte-contenido">
          <h3>¿Cómo reportar errores o problemas?</h3>
          <div className="reporte-pasos">
            <div className="paso">
              <div className="paso-numero">1</div>
              <div className="paso-contenido">
                <h4>Ve a la sección PQRS</h4>
                <p>En el menú lateral, selecciona "PQRS"</p>
              </div>
            </div>
            <div className="paso">
              <div className="paso-numero">2</div>
              <div className="paso-contenido">
                <h4>Describe el problema</h4>
                <p>Sé específico sobre lo que sucedió</p>
              </div>
            </div>
            <div className="paso">
              <div className="paso-numero">3</div>
              <div className="paso-contenido">
                <h4>Enviar reporte</h4>
                <p>Tu reporte nos ayuda a mejorar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardEstudiante;