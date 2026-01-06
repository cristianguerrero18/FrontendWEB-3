import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import Registro from "./pages/Registro.jsx";
import Verificacion from "./pages/Verificacion.jsx";
import RecuperarContrasena from "./pages/RecuperarContrasena.jsx";
import Login from "./pages/Login.jsx";
import PanelAdministrador from "./pages/PanelAdministrador.jsx";
import PanelEstudiante from "./pages/PanelEstudiante.jsx";
import PanelDocente from "./pages/PanelDocente.jsx";
import RutaProtegida from "./components/RutaProtegida.jsx";
import { UserProvider } from "./context/UserContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <UserProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Registro" element={<Registro />} />
          <Route path="/Verificacion" element={<Verificacion />} />
          <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />

          <Route
            path="/PanelAdministrador"
            element={
              <RutaProtegida>
                <PanelAdministrador />
              </RutaProtegida>
            }
          />

          <Route
            path="/PanelEstudiante"
            element={
              <RutaProtegida>
                <PanelEstudiante />
              </RutaProtegida>
            }
          />

          <Route
            path="/PanelDocente"
            element={
              <RutaProtegida>
                <PanelDocente />
              </RutaProtegida>
            }
          />
        </Routes>
      </UserProvider>
    </HashRouter>
  </StrictMode>
);
