import React from "react";
import {
  GraduationCap,
  BookOpen,
  Users,
  Globe,
  Target,
  AlertTriangle,
  MessageSquare,
  FolderOpen,
  BellRing,
  Shield,
} from "lucide-react";
import "../../css/DashboardS.css";

const DashboardEstudiante = () => {
  return (
    <div className="dashboard-estudiante dashboard-estudiante-limpio">
      <section className="hero-dashboard hero-dashboard-limpio">
        <div className="hero-contenido">
          <div className="hero-icono hero-icono-limpio">
            <GraduationCap size={42} />
          </div>

          <div className="hero-texto-limpio">
            <span className="etiqueta-dashboard">Proyecto académico UTS</span>
            <h1 className="hero-titulo">Bienvenido a la Plataforma Educativa Digital</h1>
            <p className="hero-subtitulo hero-subtitulo-limpio">
              Accede a recursos académicos, comparte material de apoyo y participa
              en una comunidad de aprendizaje colaborativo.
            </p>
          </div>
        </div>
      </section>

      <section className="grid-caracteristicas grid-caracteristicas-limpio">
        <article className="caracteristica-card caracteristica-card-limpia">
          <div className="caracteristica-icono">
            <BookOpen size={28} />
          </div>
          <h3>Recursos Académicos</h3>
          <p>
            Consulta materiales organizados por semestre y asignatura para facilitar
            tu estudio.
          </p>
        </article>

        <article className="caracteristica-card caracteristica-card-limpia">
          <div className="caracteristica-icono">
            <Users size={28} />
          </div>
          <h3>Colaboración</h3>
          <p>
            Comparte contenido útil con otros estudiantes y fortalece el aprendizaje
            colaborativo.
          </p>
        </article>

        <article className="caracteristica-card caracteristica-card-limpia">
          <div className="caracteristica-icono">
            <Globe size={28} />
          </div>
          <h3>Acceso Flexible</h3>
          <p>
            Ingresa desde distintos dispositivos y consulta la información cuando la
            necesites.
          </p>
        </article>
      </section>

      <section className="seccion-mision seccion-mision-limpia">
        <div className="mision-contenido">
          <div className="mision-icono">
            <Target size={34} />
          </div>

          <div className="mision-texto">
            <span className="etiqueta-seccion">Propósito</span>
            <h2>Nuestra misión</h2>
            <p>
              Fortalecer el acceso a recursos educativos digitales dentro de las
              <strong> Unidades Tecnológicas de Santander (UTS)</strong>, promoviendo
              la organización del conocimiento, el apoyo entre estudiantes y el uso
              responsable de la información académica.
            </p>
          </div>
        </div>
      </section>

      <section className="seccion-alerta-dashboard">
        <div className="alerta-dashboard-card">
          <div className="alerta-dashboard-icono">
            <AlertTriangle size={26} />
          </div>

          <div className="alerta-dashboard-texto">
            <h3>Sistema en mejora continua</h3>
            <p>
              Algunas funciones pueden presentar ajustes o cambios durante el
              desarrollo. Si detectas un error, puedes reportarlo desde la sección
              <strong> PQRS</strong>.
            </p>
          </div>
        </div>
      </section>

      <section className="seccion-accesos-rapidos">
        <div className="seccion-header-simple">
          <span className="etiqueta-seccion">Guía rápida</span>
          <h2>¿Cómo aprovechar mejor la plataforma?</h2>
        </div>

        <div className="reporte-pasos reporte-pasos-limpio">
          <div className="paso paso-limpio">
            <div className="paso-icono-limpio">
              <FolderOpen size={20} />
            </div>
            <div className="paso-contenido">
              <h4>Explora los recursos</h4>
              <p>Ingresa a la sección de recursos y navega por semestre y asignatura.</p>
            </div>
          </div>

          <div className="paso paso-limpio">
            <div className="paso-icono-limpio">
              <BellRing size={20} />
            </div>
            <div className="paso-contenido">
              <h4>Consulta notificaciones</h4>
              <p>Revisa novedades del sistema y mantente al tanto de los cambios.</p>
            </div>
          </div>

          <div className="paso paso-limpio">
            <div className="paso-icono-limpio">
              <MessageSquare size={20} />
            </div>
            <div className="paso-contenido">
              <h4>Reporta inconvenientes</h4>
              <p>Usa PQRS para informar errores, sugerencias o dificultades de uso.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="seccion-legal-compacta">
        <div className="legal-compacta-card">
          <div className="legal-compacta-icono">
            <Shield size={24} />
          </div>
          <div className="legal-compacta-texto">
            <h3>Uso responsable y protección de datos</h3>
            <p>
              La plataforma está orientada a fines académicos y promueve el respeto
              por la privacidad, la autoría y el uso adecuado de los recursos
              compartidos.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardEstudiante;