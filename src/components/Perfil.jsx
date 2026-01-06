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
  AlertCircle
} from "lucide-react";
import "../css/Perfil.css";

const Perfil = ({ perfil, cargando, mensaje, guardarPerfil }) => {
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [editando, setEditando] = useState(false);
    const [formData, setFormData] = useState({
        nombres_usuario: "",
        apellidos_usuario: "",
        correo: "",
        contrasena: "",
    });

    // Función para convertir id_tipo_carrera a texto
    const obtenerTipoCarreraTexto = (idTipoCarrera) => {
        const tipos = {
            1: "Tecnología",
            2: "Profesional",
            3: "Técnico",
            4: "Especialización",
            5: "Maestría",
            6: "Doctorado",
            7: "Diplomado"
        };
        return tipos[idTipoCarrera] || "No especificado";
    };

    // Función para convertir id_rol a texto
    const obtenerRolTexto = (idRol) => {
        const roles = {
            1: "Administrador",
            2: "Estudiante",
            3: "Docente"
        };
        return roles[idRol] || "Usuario";
    };

    // Obtener color según rol
    const getColorRol = (idRol) => {
        switch(idRol) {
            case 1: return { bg: '#e3f2fd', color: '#1976d2', border: '#bbdefb' }; // Admin
            case 2: return { bg: '#e8f5e9', color: '#388e3c', border: '#c8e6c9' }; // Estudiante
            case 3: return { bg: '#fff3e0', color: '#f57c00', border: '#ffe0b2' }; // Docente
            default: return { bg: '#f5f5f5', color: '#616161', border: '#e0e0e0' };
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
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGuardar = () => {
        if (formData.nombres_usuario.trim() && formData.apellidos_usuario.trim() && formData.correo.trim()) {
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



    if (!perfil) return (
        <div className="estado-inicial-perfil">
            <div className="icono-estado-inicial-perfil"><User size={48} /></div>
            <h2>Perfil no disponible</h2>
            <p>No se encontraron datos del perfil.</p>
        </div>
    );

    const colorRol = getColorRol(perfil.id_rol);

    return (
        <div className="contenedor-perfil">
            {/* Mensaje de estado */}
            {mensaje && (
                <div className={`mensaje-perfil ${mensaje.includes("Error") ? "error" : "exito"}`}>
                    <AlertCircle size={18} />
                    <p>{mensaje}</p>
                </div>
            )}

            {/* Cabecera */}
            <div className="cabecera-perfil">
                <div className="titulo-perfil-con-boton">
                    <div>
                        <h1>Perfil de Usuario</h1>
                        <p className="subtitulo-perfil">Gestione su información personal y credenciales</p>
                    </div>
                    {!editando ? (
                        <button 
                            className="boton-editar-perfil"
                            onClick={() => setEditando(true)}
                        >
                            <Edit2 size={16} />
                            <span>Editar Perfil</span>
                        </button>
                    ) : (
                        <div className="botones-accion-perfil">
                            <button 
                                className="boton-cancelar-perfil"
                                onClick={handleCancelar}
                            >
                                <X size={16} />
                                <span>Cancelar</span>
                            </button>
                            <button 
                                className="boton-guardar-perfil"
                                onClick={handleGuardar}
                            >
                                <Save size={16} />
                                <span>Guardar Cambios</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Contenido principal */}
            <div className="contenido-perfil-principal">
                {/* Panel izquierdo - Información personal */}
                <div className="panel-informacion-perfil">
                    <div className="tarjeta-perfil">
                        <div className="cabecera-tarjeta-perfil">
                            <div className="avatar-perfil">
                                <User size={32} />
                            </div>
                            <div className="info-usuario-perfil">
                                <h2>{perfil.nombres_usuario} {perfil.apellidos_usuario}</h2>
                                <div className="badge-id-perfil">ID: {perfil.id_usuario}</div>
                            </div>
                        </div>

                        <div className="campos-perfil">
                            {/* Nombre */}
                            <div className="campo-perfil">
                                <label className="etiqueta-campo-perfil">
                                    <User size={14} />
                                    <span>Nombre Completo</span>
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
                                        />
                                        <input
                                            type="text"
                                            name="apellidos_usuario"
                                            value={formData.apellidos_usuario}
                                            onChange={handleChange}
                                            className="input-perfil"
                                            placeholder="Apellidos"
                                        />
                                    </div>
                                ) : (
                                    <div className="valor-campo-perfil">
                                        {perfil.nombres_usuario} {perfil.apellidos_usuario}
                                    </div>
                                )}
                            </div>

                            {/* Correo */}
                            <div className="campo-perfil">
                                <label className="etiqueta-campo-perfil">
                                    <Mail size={14} />
                                    <span>Correo Electrónico</span>
                                </label>
                                {editando ? (
                                    <input
                                        type="email"
                                        name="correo"
                                        value={formData.correo}
                                        onChange={handleChange}
                                        className="input-perfil"
                                        placeholder="correo@ejemplo.com"
                                    />
                                ) : (
                                    <div className="valor-campo-perfil">
                                        {perfil.correo}
                                    </div>
                                )}
                            </div>

                            {/* Contraseña */}
                            <div className="campo-perfil">
                                <label className="etiqueta-campo-perfil">
                                    <Lock size={14} />
                                    <span>Contraseña</span>
                                </label>
                                <div className="contenedor-contrasena-perfil">
                                    {editando ? (
                                        <div className="campo-editable-perfil">
                                            <input
                                                type={mostrarPassword ? "text" : "password"}
                                                name="contrasena"
                                                value={formData.contrasena}
                                                onChange={handleChange}
                                                className="input-perfil"
                                                placeholder="Nueva contraseña"
                                            />
                                            <button 
                                                type="button" 
                                                className="boton-mostrar-contrasena-perfil" 
                                                onClick={() => setMostrarPassword(!mostrarPassword)}
                                                title={mostrarPassword ? "Ocultar" : "Mostrar"}
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
                                            >
                                                {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {editando && (
                                    <div className="ayuda-contrasena-perfil">
                                        Deje vacío si no desea cambiar la contraseña
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel derecho - Información del sistema */}
                <div className="panel-sistema-perfil">
                    <div className="tarjeta-perfil">
                        <h3 className="titulo-tarjeta-perfil">Información del Sistema</h3>
                        
                        <div className="campos-sistema-perfil">
                            {/* Rol */}
                            <div className="campo-sistema-perfil">
                                <div className="icono-campo-sistema">
                                    <Shield size={18} />
                                </div>
                                <div className="contenido-campo-sistema">
                                    <div className="etiqueta-campo-sistema">Rol del Sistema</div>
                                    <div 
                                        className="badge-rol-perfil"
                                        style={{
                                            backgroundColor: colorRol.bg,
                                            color: colorRol.color,
                                            borderColor: colorRol.border
                                        }}
                                    >
                                        {obtenerRolTexto(perfil.id_rol)}
                                    </div>
                                </div>
                            </div>

                            {/* Carrera */}
                            <div className="campo-sistema-perfil">
                                <div className="icono-campo-sistema">
                                    <GraduationCap size={18} />
                                </div>
                                <div className="contenido-campo-sistema">
                                    <div className="etiqueta-campo-sistema">Carrera Asignada</div>
                                    <div className="valor-campo-sistema">
                                        {perfil.nombre_carrera || "No asignada"}
                                    </div>
                                </div>
                            </div>

                            {/* Tipo de Carrera */}
                            <div className="campo-sistema-perfil">
                                <div className="icono-campo-sistema">
                                    <Calendar size={18} />
                                </div>
                                <div className="contenido-campo-sistema">
                                    <div className="etiqueta-campo-sistema">Tipo de Carrera</div>
                                    <div className="valor-campo-sistema">
                                        {obtenerTipoCarreraTexto(perfil.id_tipo_carrera)}
                                    </div>
                                </div>
                            </div>

                            {/* ID Carrera */}
                            {perfil.id_carrera && (
                                <div className="campo-sistema-perfil">
                                    <div className="icono-campo-sistema">
                                        <span className="icono-id">#</span>
                                    </div>
                                    <div className="contenido-campo-sistema">
                                        <div className="etiqueta-campo-sistema">ID Carrera</div>
                                        <div className="valor-campo-sistema">
                                            {perfil.id_carrera}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Nota de edición */}
                    {editando && (
                        <div className="nota-edicion-perfil">
                            <AlertCircle size={18} />
                            <p>Los cambios se aplicarán inmediatamente después de guardar</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Perfil;