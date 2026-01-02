import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail } from "lucide-react";
import { loginUsuario } from "../api/auth/Auth.js";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Importar imagen de fondo (ajusta la ruta según tu estructura)
import backgroundImage from "../assets/fondo.png"; // Ajusta la extensión según tu imagen

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

      // 🔐 Guardar token y datos
      localStorage.setItem("token", res.token);
      localStorage.setItem("usuario", JSON.stringify(res.usuario));
      localStorage.setItem("carrera", JSON.stringify(res.carrera));
      localStorage.setItem("id_rol", res.usuario.id_rol);

      // 🔎 Decodificar token
      const decoded = jwtDecode(res.token);

      // ✅ ADMIN
      if (decoded.id_rol === 1) {
        navigate("/PanelAdministrador", { replace: true });
        return;
      }

      // ✅ ESTUDIANTE
      if (decoded.id_rol === 2) {
        navigate("/PanelEstudiante", { replace: true });
        return;
      }

      // ✅ DOCENTE - ERROR: Estaba repetido el id_rol 2, lo corregí a 3
      if (decoded.id_rol === 3) {
        navigate("/PanelDocente", { replace: true });
        return;
      }

      // ❌ Rol no permitido
      localStorage.clear();
      setError("No tienes permisos para acceder");
    } catch (err) {
      setError("Error de conexión con el servidor");
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
          {/* HEADER - NUEVO GRADIENTE */}
          <div className="bg-gradient-to-r from-[#1e3a8a] to-[#4a90e2] py-6 px-6">
            <h2 className="text-center text-2xl md:text-3xl font-bold text-white mb-2">
              Iniciar Sesión
            </h2>
            <p className="text-center text-blue-100 text-sm">
              Acceso al sistema académico
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {error && (
              <p className="text-red-600 text-sm text-center font-semibold bg-red-50 py-2 rounded-lg">
                {error}
              </p>
            )}

            {/* EMAIL */}
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                size={20}
              />
              <input
                type="email"
                placeholder="Correo institucional"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl 
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none 
                text-gray-700 placeholder-gray-400 bg-white/80"
              />
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                size={20}
              />
              <input
                type="password"
                placeholder="Contraseña"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl 
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none 
                text-gray-700 placeholder-gray-400 bg-white/80"
              />
            </div>

            {/* LINKS */}
            <div className="flex justify-between text-sm">
              <button
                type="button"
                onClick={() => navigate("/recuperar-contrasena")}
                className="text-[#1e3a8a] hover:text-blue-900 font-medium 
                cursor-pointer hover:underline transition"
              >
                ¿Olvidaste tu contraseña?
              </button>

              <button
                type="button"
                onClick={() => navigate("/Registro")}
                className="text-[#1e3a8a] hover:text-blue-900 font-semibold 
                cursor-pointer hover:underline transition"
              >
                Regístrate
              </button>
            </div>

            {/* BOTÓN - NUEVO GRADIENTE */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#4a90e2] 
              hover:from-blue-900 hover:to-blue-600 
              text-white font-bold py-3 rounded-xl 
              transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Iniciar Sesión
            </motion.button>
          </form>
        </motion.div>

        <div className="text-center mt-6">
          <p className="text-xs text-white drop-shadow-md bg-black/20 px-3 py-1 rounded-full">
            Plataforma Educativa © 2025
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;