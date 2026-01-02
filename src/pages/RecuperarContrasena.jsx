import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle, AlertCircle, Info } from "lucide-react";
import { recuperarClave } from "../api/auth/Auth.js";

// Importar imagen de fondo (misma que en Login)
import backgroundImage from "../assets/fondo.png";

function RecuperarContrasena() {
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!correo) {
      setMensaje({
        texto: "Por favor ingresa tu correo institucional",
        tipo: "error",
      });
      return;
    }

    setIsSubmitting(true);
    setMensaje({ texto: "", tipo: "" });

    try {
      const respuesta = await recuperarClave(correo);

      if (respuesta.ok) {
        setMensaje({
          texto: respuesta.mensaje || "Se ha enviado un enlace de recuperación a tu correo",
          tipo: "success",
        });
      } else {
        setMensaje({
          texto: respuesta.mensaje || "Hubo un error al procesar la solicitud",
          tipo: "error",
        });
      }
    } catch (error) {
      setMensaje({
        texto: "Error de conexión con el servidor",
        tipo: "error",
      });
    }

    setIsSubmitting(false);
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
            <h2 className="text-center text-2xl md:text-3xl font-bold text-white mb-2">
              Recuperar Contraseña
            </h2>
            <p className="text-center text-blue-100 text-sm">
              Ingresa tu correo para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            
            {/* Mensaje de éxito o error */}
            {mensaje.texto && (
              <div
                className={`rounded-lg p-4 mb-6 border ${
                  mensaje.tipo === "error"
                    ? "bg-red-50 border-red-200"
                    : "bg-green-50 border-green-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 ${
                      mensaje.tipo === "error" ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {mensaje.tipo === "error" ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                  </div>
                  <p
                    className={`text-sm font-medium ${
                      mensaje.tipo === "error" ? "text-red-800" : "text-green-800"
                    }`}
                  >
                    {mensaje.texto}
                  </p>
                </div>
              </div>
            )}

            {/* Correo */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo institucional
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none 
                           text-gray-700 placeholder-gray-400 bg-white/80"
                />
              </div>

              {/* Mensaje pequeño con icono */}
              <div className="flex items-center gap-2 mt-3 text-gray-600 text-xs p-3 bg-blue-50/80 rounded-lg border border-blue-100">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <p className="text-sm">
                  Nota: Para cambiar tu contraseña inicia sesión y dirígete al apartado de tu perfil 
                </p>
              </div>
            </div>

            {/* Botón - Mismo gradient que el login */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={isSubmitting || !correo}
              className={`w-full bg-gradient-to-r from-[#1e3a8a] to-[#4a90e2] 
                        hover:from-blue-900 hover:to-blue-600 
                        text-white font-bold py-3 rounded-xl 
                        transition-all duration-300 shadow-lg hover:shadow-xl
                        ${(isSubmitting || !correo) ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enviando...</span>
                </div>
              ) : (
                "Enviar enlace de recuperación"
              )}
            </motion.button>

            {/* Link volver */}
            <div className="text-center pt-6 mt-6 border-t border-gray-200">
              <a
                href="/Login"
                className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
              >
                Volver al inicio de sesión
              </a>
            </div>
          </form>
        </motion.div>

        <div className="text-center mt-6">
          <p className="text-sm text-white drop-shadow-md bg-black/20 px-3 py-1 rounded-full">
            Plataforma Educativa © 2025
          </p>
        </div>
      </div>
    </div>
  );
}

export default RecuperarContrasena;