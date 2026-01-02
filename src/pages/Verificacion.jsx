import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle, AlertCircle, Key } from "lucide-react";
import { verificarCodigo } from "../api/auth/Auth.js";

// Importar imagen de fondo (misma que en Login)
import backgroundImage from "../assets/fondo.png";

export default function Verificacion() {
  const correo = localStorage.getItem("correo_verificacion");
  const [codigo, setCodigo] = useState("");
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCodigo(value);
    if (mensaje.texto) setMensaje({ texto: "", tipo: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (codigo.length !== 6) {
      setMensaje({
        texto: "El código debe tener 6 dígitos",
        tipo: "error"
      });
      return;
    }

    setIsSubmitting(true);
    setMensaje({ texto: "", tipo: "" });

    try {
      const respuesta = await verificarCodigo(correo, codigo);
      
      if (respuesta.ok) {
        setMensaje({
          texto: respuesta.mensaje || "¡Verificación exitosa!",
          tipo: "success"
        });
        
        localStorage.removeItem("correo_verificacion");
        
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        setMensaje({
          texto: respuesta.mensaje || "Código incorrecto",
          tipo: "error"
        });
      }
    } catch (err) {
      setMensaje({
        texto: err.response?.data?.error || "Error en el servidor",
        tipo: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Capa de superposición para mejor legibilidad */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20"
        >
          {/* Header - Mismo gradient que el login */}
          <div className="bg-gradient-to-r from-[#1e3a8a] to-[#4a90e2] py-6 px-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Key className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-center text-2xl md:text-3xl font-bold text-white mb-2">
                Verificación
              </h2>
              <p className="text-center text-blue-100 text-sm">
                Confirma tu correo electrónico
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            {/* Mensaje de estado */}
            {mensaje.texto && (
              <div className={`rounded-lg p-4 mb-6 border ${mensaje.tipo === "error" ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 ${mensaje.tipo === "error" ? "text-red-600" : "text-green-600"}`}>
                    {mensaje.tipo === "error" ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${mensaje.tipo === "error" ? "text-red-800" : "text-green-800"}`}>
                      {mensaje.texto}
                    </p>
                    {mensaje.tipo === "success" && (
                      <p className="text-xs text-green-600 mt-1">
                        Redirigiendo al login...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Información del correo */}
            <div className="mb-6 p-4 bg-blue-50/80 rounded-lg border border-blue-100">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Hemos enviado un código de 6 dígitos a:
                  </p>
                  <p className="text-blue-700 font-semibold text-sm break-all">
                    {correo}
                  </p>
                </div>
              </div>
            </div>

            {/* Input de código */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Código de verificación
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Key className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={codigo}
                  onChange={handleChange}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-300 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none 
                           text-center text-2xl font-mono tracking-widest bg-white/80"
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <span className="text-sm text-gray-500 font-medium">
                    {codigo.length}/6
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Ingresa el código de 6 dígitos que recibiste por correo
              </p>
            </div>

            {/* Botón de verificación - Mismo gradient que el login */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={isSubmitting || codigo.length !== 6}
              className={`w-full bg-gradient-to-r from-[#1e3a8a] to-[#4a90e2] 
                        hover:from-blue-900 hover:to-blue-600 
                        text-white font-bold py-3 rounded-xl 
                        transition-all duration-300 shadow-lg hover:shadow-xl
                        ${(isSubmitting || codigo.length !== 6) ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verificando...</span>
                </div>
              ) : (
                "Verificar Código"
              )}
            </motion.button>

            {/* Información adicional */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center space-y-2">
                <p className="text-xs text-gray-500">
                  ⏰ El código expira en 5 minutos
                </p>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  onClick={() => {
                    // Aquí iría la lógica para reenviar el código
                    alert("Se ha reenviado el código de verificación");
                  }}
                >
                  ¿No recibiste el código? Reenviar
                </button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-white drop-shadow-md bg-black/20 px-3 py-1 rounded-full">
            Plataforma Educativa © 2025 - Verificación de seguridad
          </p>
        </div>
      </div>
    </div>
  );
}