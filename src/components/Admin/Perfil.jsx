import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  User,
  Save,
  Edit2,
  X,
  Mail,
  Lock,
  Shield,
  GraduationCap,
  Calendar,
  AlertCircle,
  Trash2,
  AlertTriangle,
  BadgeCheck,
} from "lucide-react";
import "../../css/Perfil.css";

const Perfil = ({
  perfil,
  cargando,
  mensaje,
  guardarPerfil,
  eliminarPerfil,
  mostrarModalEliminar,
  setMostrarModalEliminar,
}) => {
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    nombres_usuario: "",
    apellidos_usuario: "",
    correo: "",
    contrasena: "",
  });

  const obtenerTipoCarreraTexto = (idTipoCarrera) => {
    const tipos = {
      1: "Tecnología",
      2: "Profesional",
      3: "Técnico",
      4: "Especialización",
      5: "Maestría",
      6: "Doctorado",
      7: "Diplomado",
    };
    return tipos[idTipoCarrera] || "No especificado";
  };

  const obtenerRolTexto = (idRol) => {
    const roles = {
      1: "Administrador",
      2: "Estudiante",
      3: "Docente",
    };
    return roles[idRol] || "Usuario";
  };

  const getColorRol = (idRol) => {
    switch (idRol) {
      case 1:
        return { bg: "#eaf2ff", color: "#1d4ed8", border: "#bfdbfe" };
      case 2:
        return { bg: "#ecfdf3", color: "#15803d", border: "#bbf7d0" };
      case 3:
        return { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" };
      default:
        return { bg: "#f8fafc", color: "#475569", border: "#cbd5e1" };
    }
  };

  useEffect(() => {
    if (perfil) {
      setFormData({
        nombres_usuario: perfil.nombres_usuario || "",
        apellidos_usuario: perfil.apellidos_usuario || "",
        correo: perfil.correo || "",
        contrasena: perfil.contrasena || "",
      });
    }
  }, [perfil]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardar = () => {
    if (
      formData.nombres_usuario.trim() &&
      formData.apellidos_usuario.trim() &&
      formData.correo.trim()
    ) {
      guardarPerfil({
        ...formData,
        id_usuario: perfil.id_usuario,
        id_carrera: perfil.id_carrera,
        id_tipo_carrera: perfil.id_tipo_carrera,
        id_rol: perfil.id_rol,
      });
      setEditando(false);
    }
  };

  const handleCancelar = () => {
    setFormData({
      nombres_usuario: perfil.nombres_usuario,
      apellidos_usuario: perfil.apellidos_usuario,
      correo: perfil.correo,
      contrasena: perfil.contrasena,
    });
    setEditando(false);
  };

  const handleEliminarClick = () => {
    if (setMostrarModalEliminar) {
      setMostrarModalEliminar(true);
    }
  };

  const handleConfirmarEliminar = () => {
    if (eliminarPerfil) {
      eliminarPerfil();
    }
  };

  if (!perfil) {
    return (
      <div className="estado-inicial-perfil">
        <div className="icono-estado-inicial-perfil">
          <User size={48} />
        </div>
        <h2>Perfil no disponible</h2>
        <p>{mensaje || "No se encontraron datos del perfil."}</p>
      </div>
    );
  }

  const colorRol = getColorRol(perfil.id_rol);

  return (
    <div className="contenedor-perfil perfil-pro">
      {mensaje && (
        <div
          className={`mensaje-perfil ${
            mensaje.includes("Error") || mensaje.includes("error") ? "error" : "exito"
          }`}
        >
          <AlertCircle size={18} />
          <p>{mensaje}</p>
        </div>
      )}

      {mostrarModalEliminar && (
        <div className="modal-overlay">
          <div className="modal-confirmacion perfil-modal-pro">
            <div className="modal-header warning">
              <div className="icono-modal">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3>Confirmar eliminación</h3>
                <p className="perfil-modal-subtitle">
                  Esta acción eliminará la información del perfil seleccionado.
                </p>
              </div>
            </div>

            <div className="modal-body">
              <p>¿Deseas continuar con la eliminación de este perfil?</p>
              <p className="texto-advertencia">Esta acción no se puede deshacer.</p>

              <div className="usuario-eliminar">
                <strong>
                  {perfil.nombres_usuario} {perfil.apellidos_usuario}
                </strong>
                <br />
                <small>{perfil.correo}</small>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="boton-cancelar-modal"
                onClick={() => setMostrarModalEliminar(false)}
                disabled={cargando}
              >
                Cancelar
              </button>

              <button
                className="boton-eliminar-modal"
                onClick={handleConfirmarEliminar}
                disabled={cargando}
              >
                {cargando ? (
                  "Eliminando..."
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Eliminar perfil</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

<div className="cabecera-perfil perfil-header-pro perfil-header-minimal">
  <div className="titulo-perfil-con-boton perfil-header-minimal-row">
    <div className="perfil-header-texto perfil-header-solo-badge">
      <div className="perfil-badge-superior">
        <BadgeCheck size={14} />
        <span>Información personal activa</span>
      </div>
    </div>

    <div className="botones-cabecera-perfil perfil-botones-superiores">
      {!editando ? (
        <>
          <button
            className="boton-eliminar-perfil"
            onClick={handleEliminarClick}
            disabled={cargando}
          >
            <Trash2 size={16} />
            <span>Eliminar</span>
          </button>

          <button
            className="boton-editar-perfil"
            onClick={() => setEditando(true)}
            disabled={cargando}
          >
            <Edit2 size={16} />
            <span>Editar</span>
          </button>
        </>
      ) : (
        <div className="botones-accion-perfil perfil-botones-superiores">
          <button
            className="boton-cancelar-perfil"
            onClick={handleCancelar}
            disabled={cargando}
          >
            <X size={16} />
            <span>Cancelar</span>
          </button>

          <button
            className="boton-guardar-perfil"
            onClick={handleGuardar}
            disabled={cargando}
          >
            <Save size={16} />
            <span>Guardar</span>
          </button>
        </div>
      )}
    </div>
  </div>
</div>

      <div className="contenido-perfil-principal">
        <div className="panel-informacion-perfil">
          <div className="tarjeta-perfil perfil-card-pro">
            <div className="cabecera-tarjeta-perfil perfil-user-top">
              <div className="avatar-perfil perfil-avatar-pro">
                <User size={28} />
              </div>

              <div className="info-usuario-perfil">
                <h2>
                  {perfil.nombres_usuario} {perfil.apellidos_usuario}
                </h2>
                <div className="perfil-meta-linea">
                  <div className="badge-id-perfil">ID: {perfil.id_usuario}</div>
                  <div
                    className="badge-rol-perfil"
                    style={{
                      backgroundColor: colorRol.bg,
                      color: colorRol.color,
                      borderColor: colorRol.border,
                    }}
                  >
                    {obtenerRolTexto(perfil.id_rol)}
                  </div>
                </div>
              </div>
            </div>

            <div className="campos-perfil">
              <div className="campo-perfil">
                <label className="etiqueta-campo-perfil">
                  <User size={14} />
                  <span>Nombre completo</span>
                </label>

                {editando ? (
                  <div className="campo-editable-perfil">
                    <input
                      type="text"
                      name="nombres_usuario"
                      value={formData.nombres_usuario}
                      onChange={handleChange}
                      className="input-perfil"
                      placeholder="Nombres"
                      disabled={cargando}
                    />
                    <input
                      type="text"
                      name="apellidos_usuario"
                      value={formData.apellidos_usuario}
                      onChange={handleChange}
                      className="input-perfil"
                      placeholder="Apellidos"
                      disabled={cargando}
                    />
                  </div>
                ) : (
                  <div className="valor-campo-perfil">
                    {perfil.nombres_usuario} {perfil.apellidos_usuario}
                  </div>
                )}
              </div>

              <div className="campo-perfil">
                <label className="etiqueta-campo-perfil">
                  <Mail size={14} />
                  <span>Correo electrónico</span>
                </label>

                {editando ? (
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    className="input-perfil"
                    placeholder="correo@ejemplo.com"
                    disabled={cargando}
                  />
                ) : (
                  <div className="valor-campo-perfil">{perfil.correo}</div>
                )}
              </div>

              <div className="campo-perfil">
                <label className="etiqueta-campo-perfil">
                  <Lock size={14} />
                  <span>Contraseña</span>
                </label>

                <div className="contenedor-contrasena-perfil">
                  {editando ? (
                    <div className="campo-editable-perfil perfil-password-edit">
                      <input
                        type={mostrarPassword ? "text" : "password"}
                        name="contrasena"
                        value={formData.contrasena}
                        onChange={handleChange}
                        className="input-perfil"
                        placeholder="Nueva contraseña"
                        disabled={cargando}
                      />
                      <button
                        type="button"
                        className="boton-mostrar-contrasena-perfil"
                        onClick={() => setMostrarPassword(!mostrarPassword)}
                        title={mostrarPassword ? "Ocultar" : "Mostrar"}
                        disabled={cargando}
                      >
                        {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  ) : (
                    <div className="valor-campo-perfil contrasena-perfil">
                      <span className="contrasena-oculta">
                        {mostrarPassword ? perfil.contrasena : "••••••••"}
                      </span>
                      <button
                        type="button"
                        className="boton-mostrar-contrasena-perfil"
                        onClick={() => setMostrarPassword(!mostrarPassword)}
                        title={mostrarPassword ? "Ocultar" : "Mostrar"}
                        disabled={cargando}
                      >
                        {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  )}
                </div>

                {editando && (
                  <div className="ayuda-contrasena-perfil">
                    Deja este campo sin cambios si no deseas actualizar la contraseña.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="panel-sistema-perfil">
          <div className="tarjeta-perfil perfil-card-pro">
            <h3 className="titulo-tarjeta-perfil">Información del sistema</h3>

            <div className="campos-sistema-perfil">
              <div className="campo-sistema-perfil">
                <div className="icono-campo-sistema">
                  <Shield size={18} />
                </div>
                <div className="contenido-campo-sistema">
                  <div className="etiqueta-campo-sistema">Rol del sistema</div>
                  <div
                    className="badge-rol-perfil"
                    style={{
                      backgroundColor: colorRol.bg,
                      color: colorRol.color,
                      borderColor: colorRol.border,
                    }}
                  >
                    {obtenerRolTexto(perfil.id_rol)}
                  </div>
                </div>
              </div>

              <div className="campo-sistema-perfil">
                <div className="icono-campo-sistema">
                  <GraduationCap size={18} />
                </div>
                <div className="contenido-campo-sistema">
                  <div className="etiqueta-campo-sistema">Carrera asignada</div>
                  <div className="valor-campo-sistema">
                    {perfil.nombre_carrera || "No asignada"}
                  </div>
                </div>
              </div>

              <div className="campo-sistema-perfil">
                <div className="icono-campo-sistema">
                  <Calendar size={18} />
                </div>
                <div className="contenido-campo-sistema">
                  <div className="etiqueta-campo-sistema">Tipo de carrera</div>
                  <div className="valor-campo-sistema">
                    {obtenerTipoCarreraTexto(perfil.id_tipo_carrera)}
                  </div>
                </div>
              </div>

              {perfil.id_carrera && (
                <div className="campo-sistema-perfil">
                  <div className="icono-campo-sistema">
                    <span className="icono-id">#</span>
                  </div>
                  <div className="contenido-campo-sistema">
                    <div className="etiqueta-campo-sistema">ID carrera</div>
                    <div className="valor-campo-sistema">{perfil.id_carrera}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {editando && (
            <div className="nota-edicion-perfil">
              <AlertCircle size={18} />
              <p>Los cambios se aplicarán inmediatamente después de guardar la información.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Perfil;