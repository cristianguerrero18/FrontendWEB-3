import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle, AlertCircle, Key, ArrowRight } from "lucide-react";
import { verificarCodigo } from "../api/auth/Auth.js";
import backgroundImage from "../assets/fondo.png";

export default function Verificacion() {
  const correo = localStorage.getItem("correo_verificacion");
  const [codigo, setCodigo] = useState("");
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "UTS - Verificación | Plataforma Educativa";
  }, []);

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCodigo(value);
    if (mensaje.texto) setMensaje({ texto: "", tipo: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (codigo.length !== 6) {
      setMensaje({
        texto: "El código debe tener 6 dígitos.",
        tipo: "error",
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
          tipo: "success",
        });

        localStorage.removeItem("correo_verificacion");

        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        setMensaje({
          texto: respuesta.mensaje || "Código incorrecto.",
          tipo: "error",
        });
      }
    } catch (err) {
      setMensaje({
        texto: err.response?.data?.error || "Error en el servidor.",
        tipo: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Mismo overlay que login y registro */}
      <div className="absolute inset-0 bg-slate-950/55"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-slate-900/30 to-sky-800/30"></div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-3xl border border-white/15 bg-white/92 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] overflow-hidden">
          {/* Header igual al estilo general */}
          <div className="px-8 pt-8 pb-6 text-center bg-gradient-to-b from-[#153e75] to-[#1e4d8f]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
              <Key size={30} className="text-white" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white">
              UTS
            </h1>

            <p className="mt-2 text-sm text-blue-100 font-medium">
              Plataforma Web de Recursos Digitales
            </p>

            <p className="mt-3 text-xs text-blue-200/90 max-w-xs mx-auto leading-relaxed">
              Confirma tu correo electrónico para activar tu cuenta y continuar con el acceso a la plataforma.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-slate-800">
                Verificación
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Ingresa el código enviado a tu correo
              </p>
            </div>

            {mensaje.texto && (
              <div
                className={`rounded-2xl border px-4 py-3 ${
                  mensaje.tipo === "error"
                    ? "bg-red-50 border-red-200"
                    : "bg-green-50 border-green-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 ${
                      mensaje.tipo === "error" ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {mensaje.tipo === "error" ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        mensaje.tipo === "error"
                          ? "text-red-800"
                          : "text-green-800"
                      }`}
                    >
                      {mensaje.texto}
                    </p>

                    {mensaje.tipo === "success" && (
                      <p className="text-xs text-green-600 mt-1">
                        Redirigiendo al inicio de sesión...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Bloque del correo */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/80 px-4 py-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#1e4d8f] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-600 mb-1">
                    Hemos enviado un código de verificación a:
                  </p>
                  <p className="text-sm font-semibold text-[#1e4d8f] break-all">
                    {correo}
                  </p>
                </div>
              </div>
            </div>

            {/* Input del código */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Código de verificación
              </label>

              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#1e4d8f] transition-colors" />
                <input
                  type="text"
                  value={codigo}
                  onChange={handleChange}
                  placeholder="000000"
                  maxLength={6}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-14 py-3.5 text-center text-2xl font-mono tracking-[0.35em] text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-[#1e4d8f] focus:ring-4 focus:ring-blue-100"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <span className="text-xs font-medium text-slate-500">
                    {codigo.length}/6
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 text-center">
                Ingresa el código de 6 dígitos que recibiste por correo electrónico.
              </p>
            </div>

            {/* Botón */}
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              type="submit"
              disabled={isSubmitting || codigo.length !== 6}
              className={`w-full rounded-2xl bg-[#1e4d8f] py-3.5 text-white font-semibold shadow-lg shadow-blue-900/20 transition-all duration-300 hover:bg-[#153e75] focus:outline-none focus:ring-4 focus:ring-blue-200 flex items-center justify-center gap-2 ${
                isSubmitting || codigo.length !== 6
                  ? "opacity-60 cursor-not-allowed"
                  : ""
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <span>Verificar código</span>
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>

            {/* Pie interno */}
            <div className="border-t border-slate-200 pt-4 text-center space-y-2">
              <p className="text-xs text-slate-500">
                ⏰ El código expira en 5 minutos
              </p>

              <button
                type="button"
                className="text-sm text-[#1e4d8f] hover:text-[#153e75] font-medium transition-colors"
                onClick={() => {
                  alert("Se ha reenviado el código de verificación");
                }}
              >
                ¿No recibiste el código? Reenviar
              </button>
            </div>
          </form>
        </div>

        {/* Footer igual línea visual */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-5 text-center"
        >
          <p className="inline-block rounded-full bg-black/25 px-4 py-2 text-xs text-white/90 backdrop-blur-md shadow-md">
            Plataforma Educativa © 2025 - Verificación de seguridad
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}