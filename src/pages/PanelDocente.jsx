import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const PanelDocente = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/Login", { replace: true });
      return;
    }

    try {
      const decoded = jwtDecode(token);

      // Expirado
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.clear();
        navigate("/Login", { replace: true });
        return;
      }

      // SOLO ESTUDIANTE
      if (decoded.id_rol !== 2) {
        localStorage.clear();
        navigate("/Login", { replace: true });
      }

    } catch {
      localStorage.clear();
      navigate("/Login", { replace: true });
    }
  }, [navigate]);

  return (
    <div style={{ padding: 40 }}>
      <h1>🎓 Panel Docente</h1>
      <p>Bienvenido al sistema académico</p>
    </div>
  );
};

export default PanelDocente;
