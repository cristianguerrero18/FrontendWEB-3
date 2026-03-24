import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, BookOpen, ArrowRight } from "lucide-react";
import { loginUsuario } from "../api/auth/Auth.js";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { storeUserToken } from "./../utils/tokenStorage.js";
import backgroundImage from "../assets/fondo.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "UTS - Iniciar Sesión | Plataforma Educativa";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await loginUsuario({
        correo: email,
        contrasena: password,
      });

      if (!res.success) {
        setError(res.mensaje || "Credenciales incorrectas");
        return;
      }

      localStorage.setItem("token", res.token);
      localStorage.setItem("usuario", JSON.stringify(res.usuario));
      localStorage.setItem("carrera", JSON.stringify(res.carrera));
      localStorage.setItem("id_rol", res.usuario.id_rol);

      const decoded = jwtDecode(res.token);
      const userId = res.usuario.id_usuario || decoded.sub || email;
      storeUserToken(userId, res.token, res.usuario, res.carrera);

      if (decoded.id_rol === 1) {
        navigate("/PanelAdministrador", { replace: true });
        return;
      }

      if (decoded.id_rol === 2) {
        navigate("/PanelEstudiante", { replace: true });
        return;
      }

      if (decoded.id_rol === 3) {
        navigate("/PanelDocente", { replace: true });
        return;
      }

      localStorage.clear();
      setError("No tienes permisos para acceder");
    } catch (err) {
      setError("Error de conexión con el servidor");
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
      {/* Overlay elegante */}
      <div className="absolute inset-0 bg-slate-950/55"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-slate-900/30 to-sky-800/30"></div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="rounded-3xl border border-white/15 bg-white/92 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] overflow-hidden">
          
          {/* Encabezado */}
          <div className="px-8 pt-8 pb-6 text-center bg-gradient-to-b from-[#153e75] to-[#1e4d8f]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
              <BookOpen size={30} className="text-white" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white">
              UTS
            </h1>

            <p className="mt-2 text-sm text-blue-100 font-medium">
              Plataforma Web de Recursos Digitales
            </p>

            <p className="mt-3 text-xs text-blue-200/90 max-w-xs mx-auto leading-relaxed">
              Accede con tu cuenta institucional para consultar y gestionar recursos académicos.
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
            <div className="text-center mb-2">
              <h2 className="text-2xl font-semibold text-slate-800">
                Iniciar sesión
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Ingresa tus credenciales para continuar
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 text-center font-medium"
              >
                {error}
              </motion.div>
            )}

            {/* Correo */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Correo institucional
              </label>
              <div className="relative group">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1e4d8f] transition-colors"
                />
                <input
                  type="email"
                  placeholder="ejemplo@uts.edu.co"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-3.5 text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-[#1e4d8f] focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <div className="relative group">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1e4d8f] transition-colors"
                />
                <input
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-3.5 text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-[#1e4d8f] focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Acciones secundarias */}
            <div className="flex items-center justify-between gap-4 text-sm pt-1">
              <button
                type="button"
                onClick={() => navigate("/recuperar-contrasena")}
                className="text-[#1e4d8f] font-medium hover:text-[#153e75] hover:underline transition"
              >
                ¿Olvidaste tu contraseña?
              </button>

              <button
                type="button"
                onClick={() => navigate("/Registro")}
                className="text-slate-600 font-medium hover:text-slate-900 transition"
              >
                Crear cuenta
              </button>
            </div>

            {/* Botón principal */}
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              type="submit"
              className="w-full rounded-2xl bg-[#1e4d8f] py-3.5 text-white font-semibold shadow-lg shadow-blue-900/20 transition-all duration-300 hover:bg-[#153e75] focus:outline-none focus:ring-4 focus:ring-blue-200 flex items-center justify-center gap-2"
            >
              <span>Ingresar</span>
              <ArrowRight size={18} />
            </motion.button>

            {/* Texto inferior */}
            <div className="border-t border-slate-200 pt-4">
              <p className="text-center text-xs leading-relaxed text-slate-500">
                Acceso exclusivo para estudiantes, docentes y personal administrativo.
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-5 text-center"
        >
          <p className="inline-block rounded-full bg-black/25 px-4 py-2 text-xs text-white/90 backdrop-blur-md shadow-md">
            © 2025 UTS - Unidades Tecnológicas de Santander
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Login;