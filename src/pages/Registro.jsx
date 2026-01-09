
import { useState, useEffect } from "react"
import {
  User,
  Mail,
  Lock,
  Info,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  BookOpen,
  GraduationCap,
} from "lucide-react"
import { registrarUsuario } from "../api/auth/Auth.js"
import { getTipo_carrera } from "../api/Admin/Tipo_Carreras.js"
import { getCarrerasPortipo } from "../api/Admin/Carreras.js"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useUsuarios } from "../hooks/useUsuarios.js"
import backgroundImage from "../assets/fondo.png"

export default function Registro() {
  const navigate = useNavigate()
  const { validarCorreo } = useUsuarios()

  // Estado inicial - rol se determinará automáticamente
  const [form, setForm] = useState({
    nombres_usuario: "",
    apellidos_usuario: "",
    correo: "",
    contrasena: "",
    id_carrera: "",
    id_rol: 2, // Valor por defecto (Estudiante)
  })

  // ui state
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" })
  const [showTips, setShowTips] = useState({
    nombres: false,
    apellidos: false,
    correo: false,
    contrasena: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validandoCorreo, setValidandoCorreo] = useState(false)
  const [correoExistente, setCorreoExistente] = useState(false)

  // Estados para tipos de carrera y carreras específicas
  const [tiposCarrera, setTiposCarrera] = useState([])
  const [carreras, setCarreras] = useState([])
  const [cargandoTipos, setCargandoTipos] = useState(true)
  const [cargandoCarreras, setCargandoCarreras] = useState(false)
  const [tipoSeleccionado, setTipoSeleccionado] = useState("")

  // Dominios válidos - Agregar @correo.uts.edu.co para docentes
  const dominiosValidos = ["uts.edu.co", "correo.uts.edu.co", "proton.me"]

  // Función para determinar el rol basado en el dominio del correo
  const determinarRolPorCorreo = (correo) => {
    if (!correo) return 2; // Por defecto estudiante
    
    const dominio = correo.split('@')[1];
    
    // Si es @correo.uts.edu.co -> Docente (rol 3)
    if (dominio === 'correo.uts.edu.co') {
      return 3;
    }
    
    // Si es @uts.edu.co o @proton.me -> Estudiante (rol 2)
    return 2;
  }

  // VALIDACIONES
  const validarNombre = (valor) => /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]{2,}$/.test(valor)

  const validarFormatoCorreo = (correo) => {
    if (!correo || !correo.includes("@")) return false
    const part = correo.split("@")[1] ?? ""
    return dominiosValidos.includes(part.toLowerCase())
  }

  const validarContrasenaObj = (pass) => ({
    longitud: pass.length >= 8,
    mayuscula: /[A-Z]/.test(pass),
    minuscula: /[a-z]/.test(pass),
    numero: /\d/.test(pass),
    simbolo: /[@$!%*?&._-]/.test(pass),
  })

  // util: estado general de validez por campo
  const fieldValid = {
    nombres: validarNombre(form.nombres_usuario),
    apellidos: validarNombre(form.apellidos_usuario),
    correoFormato: validarFormatoCorreo(form.correo),
    correoDisponible: !correoExistente && form.correo !== "",
    contrasena: Object.values(validarContrasenaObj(form.contrasena)).every(Boolean),
    carrera: !!form.id_carrera,
  }

  const correoValido = fieldValid.correoFormato && fieldValid.correoDisponible
  const allFieldsValid = Object.values({
    ...fieldValid,
    correo: correoValido
  }).every(Boolean)

  // Efecto para actualizar automáticamente el rol cuando cambia el correo
  useEffect(() => {
    if (form.correo && validarFormatoCorreo(form.correo)) {
      const nuevoRol = determinarRolPorCorreo(form.correo);
      setForm(prev => ({
        ...prev,
        id_rol: nuevoRol
      }));
    }
  }, [form.correo]);

  // Cargar tipos de carrera al montar el componente
  useEffect(() => {
    const cargarTiposCarrera = async () => {
      try {
        setCargandoTipos(true)
        const data = await getTipo_carrera()
        setTiposCarrera(data)

        if (data.length > 0) {
          setTipoSeleccionado(data[0].id_tipo_carrera)
        }
      } catch (error) {
        console.error("Error cargando tipos de carrera:", error)
        setMensaje({
          texto: "Error al cargar los tipos de carrera. Intenta recargar la página.",
          tipo: "error",
        })
      } finally {
        setCargandoTipos(false)
      }
    }

    cargarTiposCarrera()
  }, [])

  // Cargar carreras específicas cuando cambia el tipo seleccionado
  useEffect(() => {
    const cargarCarrerasPorTipo = async () => {
      if (!tipoSeleccionado) {
        setCarreras([])
        setForm((prev) => ({ ...prev, id_carrera: "" }))
        return
      }

      try {
        setCargandoCarreras(true)
        setForm((prev) => ({ ...prev, id_carrera: "" }))

        const data = await getCarrerasPortipo(tipoSeleccionado)
        setCarreras(data)

        if (data.length > 0) {
          setForm((prev) => ({
            ...prev,
            id_carrera: data[0].id_carrera,
          }))
        }
      } catch (error) {
        console.error("Error cargando carreras:", error)
        setMensaje({
          texto: "Error al cargar las carreras. Intenta recargar la página.",
          tipo: "error",
        })
        setCarreras([])
      } finally {
        setCargandoCarreras(false)
      }
    }

    cargarCarrerasPorTipo()
  }, [tipoSeleccionado])

  // Validar correo cuando cambia y tiene formato válido
  useEffect(() => {
    const validarCorreoExistente = async () => {
      if (fieldValid.correoFormato) {
        setValidandoCorreo(true)
        try {
          const existe = await validarCorreo(form.correo)
          setCorreoExistente(existe)
          
          if (existe) {
            setMensaje({
              texto: "Este correo electrónico ya está registrado. Por favor, usa otro correo.",
              tipo: "error",
            })
          } else if (mensaje.tipo === "error" && mensaje.texto.includes("correo")) {
            setMensaje({ texto: "", tipo: "" })
          }
        } catch (error) {
          console.error("Error al validar correo:", error)
        } finally {
          setValidandoCorreo(false)
        }
      } else {
        setCorreoExistente(false)
      }
    }

    const timeoutId = setTimeout(validarCorreoExistente, 500)
    return () => clearTimeout(timeoutId)
  }, [form.correo, fieldValid.correoFormato])

  // handlers
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((s) => ({ ...s, [name]: value }))
    
    if (name === "correo" && mensaje.texto.includes("correo")) {
      setMensaje({ texto: "", tipo: "" })
    } else if (mensaje.texto) {
      setMensaje({ texto: "", tipo: "" })
    }
  }

  const handleTipoCarreraChange = (e) => {
    const value = e.target.value
    setTipoSeleccionado(value)
  }

  const toggleTip = (field) => {
    setShowTips((t) => ({ ...t, [field]: !t[field] }))
  }

  const closeAllTips = () => {
    setShowTips({
      nombres: false,
      apellidos: false,
      correo: false,
      contrasena: false,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validación final antes de enviar
    if (!allFieldsValid) {
      setMensaje({
        texto: "Por favor corrige los campos marcados antes de continuar.",
        tipo: "error",
      })
      return
    }

    // Verificar si el correo ya existe (última validación)
    if (correoExistente) {
      setMensaje({
        texto: "Este correo electrónico ya está registrado. Por favor, usa otro correo.",
        tipo: "error",
      })
      return
    }

    // Determinar rol final basado en el correo
    const rolFinal = determinarRolPorCorreo(form.correo);
    const datosEnvio = {
      ...form,
      id_rol: rolFinal
    };

    // Mostrar mensaje informativo sobre el rol asignado
    const mensajeRol = rolFinal === 3 
      ? "Se ha detectado que eres docente. Tu cuenta será de tipo Docente."
      : "Tu cuenta será de tipo Estudiante.";
    
    setMensaje({
      texto: mensajeRol,
      tipo: "info"
    });

    setIsSubmitting(true)

    try {
      const respuesta = await registrarUsuario(datosEnvio)
      
      setMensaje({
        texto: respuesta.mensaje || "¡Registro exitoso! Redirigiendo a verificación...",
        tipo: "success",
      })

      localStorage.setItem("correo_verificacion", form.correo)
      localStorage.setItem("rol_asignado", rolFinal.toString());
      
      setTimeout(() => {
        navigate("/verificacion", { 
          state: { 
            correo: form.correo,
            rol: rolFinal 
          }
        })
      }, 2000)
      
    } catch (err) {
      setMensaje({
        texto: err.response?.data?.error || "Error en el servidor. Intenta de nuevo.",
        tipo: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Obtener información del rol actual para mostrar
  const obtenerInfoRol = () => {
    if (!form.correo || !validarFormatoCorreo(form.correo)) return null;
    
    const rol = determinarRolPorCorreo(form.correo);
    return {
      id: rol,
      nombre: rol === 3 ? "Docente" : "Estudiante",
      descripcion: rol === 3 
        ? "Acceso al panel de docentes" 
        : "Acceso al panel de estudiantes",
      icono: rol === 3 ? "👨‍🏫" : "👨‍🎓"
    };
  };

  const infoRol = obtenerInfoRol();

  // Render helpers
  const ValidationIcon = ({ isValid, loading = false }) => (
    <div
      className={`flex items-center justify-center w-5 h-5 rounded-full ${isValid ? "bg-green-100" : "bg-gray-100"}`}
    >
      {loading ? (
        <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      ) : isValid ? (
        <Check className="w-3 h-3 text-green-600" />
      ) : (
        <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      )}
    </div>
  )

  const CheckOrX = ({ ok, loading = false }) => {
    if (loading) {
      return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    }
    return ok ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />
  }

  const passChecks = validarContrasenaObj(form.contrasena)

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      onClick={closeAllTips}
    >
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20"
        >
          <div className="bg-gradient-to-r from-[#1e3a8a] to-[#4a90e2] py-6 px-6">
            <h2 className="text-center text-2xl md:text-3xl font-bold text-white mb-2">
              Crear Cuenta
            </h2>
            <p className="text-center text-blue-100 text-sm">
              Regístrate en la plataforma educativa
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            {/* Mensaje de estado */}
            {mensaje.texto && (
              <div className={`rounded-lg p-3 mb-4 border ${
                mensaje.tipo === "error" ? "bg-red-50 border-red-200" : 
                mensaje.tipo === "info" ? "bg-blue-50 border-blue-200" :
                "bg-green-50 border-green-200"
              }`}>
                <div className="flex items-start gap-2">
                  <div className={`flex-shrink-0 ${
                    mensaje.tipo === "error" ? "text-red-600" : 
                    mensaje.tipo === "info" ? "text-blue-600" :
                    "text-green-600"
                  }`}>
                    {mensaje.tipo === "error" ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : mensaje.tipo === "info" ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      mensaje.tipo === "error" ? "text-red-800" : 
                      mensaje.tipo === "info" ? "text-blue-800" :
                      "text-green-800"
                    }`}>
                      {mensaje.texto}
                    </p>
                    {mensaje.tipo === "success" && <p className="text-xs text-green-600 mt-0.5">Redirigiendo...</p>}
                  </div>
                </div>
              </div>
            )}


            {/* Resto del formulario permanece igual */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* NOMBRES */}
              <div className="space-y-1 relative">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-700">Nombres</label>
                  <ValidationIcon isValid={fieldValid.nombres} />
                </div>
                <div className="relative">
                  <input
                    name="nombres_usuario"
                    value={form.nombres_usuario}
                    onChange={handleChange}
                    placeholder="Juan Carlos"
                    className="w-full pl-10 pr-8 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm transition-all outline-none bg-white/80"
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleTip("nombres")
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
                  >
                    <Info className={`w-4 h-4 transition-colors ${showTips.nombres ? "text-blue-500" : "text-gray-400 hover:text-gray-600"}`} />
                  </button>
                </div>

                {showTips.nombres && (
                  <div
                    className="absolute left-0 bottom-full mb-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-start gap-2">
                      <CheckOrX ok={fieldValid.nombres} />
                      <div>
                        <p className="font-semibold text-gray-800 text-xs mb-1">Requisitos:</p>
                        <ul className="text-xs text-gray-600 space-y-0.5">
                          <li>• Sólo letras y espacios</li>
                          <li>• Mínimo 2 caracteres</li>
                        </ul>
                      </div>
                    </div>
                    <div className="absolute left-4 bottom-0 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
                  </div>
                )}
              </div>

              {/* APELLIDOS */}
              <div className="space-y-1 relative">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-700">Apellidos</label>
                  <ValidationIcon isValid={fieldValid.apellidos} />
                </div>
                <div className="relative">
                  <input
                    name="apellidos_usuario"
                    value={form.apellidos_usuario}
                    onChange={handleChange}
                    placeholder="Pérez Gómez"
                    className="w-full pl-10 pr-8 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm transition-all outline-none bg-white/80"
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleTip("apellidos")
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
                  >
                    <Info className={`w-4 h-4 transition-colors ${showTips.apellidos ? "text-blue-500" : "text-gray-400 hover:text-gray-600"}`} />
                  </button>
                </div>

                {showTips.apellidos && (
                  <div
                    className="absolute left-0 bottom-full mb-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-start gap-2">
                      <CheckOrX ok={fieldValid.apellidos} />
                      <div>
                        <p className="font-semibold text-gray-800 text-xs mb-1">Requisitos:</p>
                        <ul className="text-xs text-gray-600 space-y-0.5">
                          <li>• Sólo letras y espacios</li>
                          <li>• Mínimo 2 caracteres</li>
                        </ul>
                      </div>
                    </div>
                    <div className="absolute left-4 bottom-0 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
                  </div>
                )}
              </div>
            </div>

            {/* CORREO */}
            <div className="mb-4 relative">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-700">Correo Electrónico</label>
                <ValidationIcon isValid={correoValido} loading={validandoCorreo} />
              </div>
              <div className="relative">
                <input
                  name="correo"
                  value={form.correo}
                  onChange={handleChange}
                  placeholder="ejemplo@uts.edu.co o ejemplo@correo.uts.edu.co"
                  className={`w-full pl-10 pr-8 py-2.5 rounded-lg border text-sm transition-all outline-none bg-white/80 ${
                    correoExistente 
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100" 
                      : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  }`}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleTip("correo")
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
                >
                  <Info className={`w-4 h-4 transition-colors ${showTips.correo ? "text-blue-500" : "text-gray-400 hover:text-gray-600"}`} />
                </button>
              </div>

              {/* Mensaje de estado del correo */}
              {form.correo && !validandoCorreo && (
                <div className="mt-1">
                  {!fieldValid.correoFormato ? (
                    <p className="text-xs text-red-600">
                      Formato de correo inválido. Usa @uts.edu.co, @correo.uts.edu.co o @proton.me
                    </p>
                  ) : correoExistente ? (
                    <p className="text-xs text-red-600">
                      Este correo ya está registrado
                    </p>
                  ) : (
                    <div>
                      <p className="text-xs text-green-600">
                        ✓ Correo disponible
                      </p>
                    </div>
                  )}
                </div>
              )}

              {showTips.correo && (
                <div
                  className="absolute left-0 bottom-full mb-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-start gap-2">
                    <CheckOrX ok={correoValido} loading={validandoCorreo} />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-xs mb-1.5">Requisitos:</p>
                      <div className="space-y-1.5 mb-2">
                        <div className="flex items-center gap-2">
                          <CheckOrX ok={fieldValid.correoFormato} />
                          <span className={`text-xs ${fieldValid.correoFormato ? "text-gray-700" : "text-gray-500"}`}>
                            Formato válido
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckOrX ok={fieldValid.correoDisponible} loading={validandoCorreo} />
                          <span className={`text-xs ${fieldValid.correoDisponible ? "text-gray-700" : "text-gray-500"}`}>
                            Disponible
                          </span>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-800 text-xs mb-1.5">Dominios permitidos:</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {dominiosValidos.map((d) => (
                          <span key={d} className={`px-2 py-0.5 text-[10px] rounded-md font-medium border ${
                            d === 'correo.uts.edu.co' 
                              ? 'bg-purple-50 text-purple-700 border-purple-100' 
                              : 'bg-blue-50 text-blue-700 border-blue-100'
                          }`}>
                            @{d}
                          </span>
                        ))}
                      </div>
                      <p className="font-semibold text-gray-800 text-xs mb-1">Asignación automática de roles:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          <span><strong>@correo.uts.edu.co</strong> → Docente</span>
                        </li>
                        <li className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span><strong>@uts.edu.co</strong> → Estudiante</span>
                        </li>
                        <li className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span><strong>@proton.me</strong> → Estudiante</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="absolute left-4 bottom-0 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
                </div>
              )}
            </div>

             {/* TIPO DE CARRERA */}
             <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-700">Tipo de Carrera</label>
                <ValidationIcon isValid={!!tipoSeleccionado} />
              </div>
              <div className="relative">
                <select
                  value={tipoSeleccionado}
                  onChange={handleTipoCarreraChange}
                  className="w-full pl-10 pr-8 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm transition-all outline-none appearance-none bg-white/80"
                  disabled={cargandoTipos}
                >
                  {cargandoTipos ? (
                    <option value="">Cargando tipos de carrera...</option>
                  ) : tiposCarrera.length === 0 ? (
                    <option value="">No hay tipos de carrera disponibles</option>
                  ) : (
                    <>
                      <option value="">Selecciona el tipo de carrera</option>
                      {tiposCarrera.map((tipo) => (
                        <option key={tipo.id_tipo_carrera} value={tipo.id_tipo_carrera}>
                          {tipo.nombre_tipo_carrera}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* CARRERA ESPECÍFICA */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-700">Carrera</label>
                <ValidationIcon isValid={fieldValid.carrera} />
              </div>
              <div className="relative">
                <select
                  name="id_carrera"
                  value={form.id_carrera}
                  onChange={handleChange}
                  className="w-full pl-10 pr-8 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm transition-all outline-none appearance-none bg-white/80"
                  disabled={!tipoSeleccionado || cargandoCarreras}
                >
                  {!tipoSeleccionado ? (
                    <option value="">Primero selecciona un tipo de carrera</option>
                  ) : cargandoCarreras ? (
                    <option value="">Cargando carreras...</option>
                  ) : carreras.length === 0 ? (
                    <option value="">No hay carreras disponibles para este tipo</option>
                  ) : (
                    <>
                      <option value="">Selecciona una carrera</option>
                      {carreras.map((carrera) => (
                        <option key={carrera.id_carrera} value={carrera.id_carrera}>
                          {carrera.nombre_carrera}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            {/* CONTRASEÑA */}
            <div className="mb-6 relative">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-700">Contraseña</label>
                <ValidationIcon isValid={fieldValid.contrasena} />
              </div>
              <div className="relative">
                <input
                  name="contrasena"
                  value={form.contrasena}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  placeholder="Crea una contraseña segura"
                  className="w-full pl-10 pr-20 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm transition-all outline-none bg-white/80"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowPassword(!showPassword)
                    }}
                    className="text-gray-400 hover:text-gray-700 transition-colors"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleTip("contrasena")
                    }}
                    className="z-10"
                  >
                    <Info className={`w-4 h-4 transition-colors ${showTips.contrasena ? "text-blue-500" : "text-gray-400 hover:text-gray-600"}`} />
                  </button>
                </div>
              </div>

              {showTips.contrasena && (
                <div
                  className="absolute left-0 bottom-full mb-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="font-semibold text-gray-800 text-xs mb-2">Requisitos de seguridad:</p>
                  <div className="space-y-1.5">
                    {Object.entries({
                      longitud: "Mínimo 8 caracteres",
                      mayuscula: "Una letra mayúscula (A-Z)",
                      minuscula: "Una letra minúscula (a-z)",
                      numero: "Un número (0-9)",
                      simbolo: "Un símbolo (@$!%*?&._-)",
                    }).map(([key, text]) => (
                      <div key={key} className="flex items-center gap-2">
                        <CheckOrX ok={passChecks[key]} />
                        <span className={`text-xs ${passChecks[key] ? "text-gray-700 font-medium" : "text-gray-500"}`}>
                          {text}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="absolute left-4 bottom-0 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
                </div>
              )}
            </div>

            {/* Botón de submit */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={!allFieldsValid || isSubmitting || validandoCorreo}
              className={`w-full bg-gradient-to-r from-[#1e3a8a] to-[#4a90e2] hover:from-blue-900 hover:to-blue-600 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl ${
                (!allFieldsValid || isSubmitting || validandoCorreo) && "opacity-50 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-1.5">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creando cuenta...</span>
                </div>
              ) : validandoCorreo ? (
                <div className="flex items-center justify-center gap-1.5">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verificando correo...</span>
                </div>
              ) : (
                "Crear Cuenta"
              )}
            </motion.button>

            <div className="text-center pt-4 mt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                Al registrarte aceptas nuestros{" "}
                <a href="#" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                  Términos
                </a>{" "}
                y{" "}
                <a href="#" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                  Privacidad
                </a>
              </p>
            </div>
          </form>
        </motion.div>

        <div className="text-center mt-6">
          <p className="text-sm text-white drop-shadow-md bg-black/20 px-3 py-1 rounded-full">
            ¿Ya tienes cuenta?{" "}
            <a href="/login" className="font-semibold hover:text-blue-200 transition-colors underline">
              Iniciar sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}