import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

const RutaProtegida = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsValid(false);
      setChecking(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);

      // Token expirado
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        setIsValid(false);
      } else {
        setIsValid(true);
      }
    } catch (error) {
      localStorage.removeItem("token");
      setIsValid(false);
    }

    setChecking(false);
  }, []);

  // ⏳ Esperar validación
  if (checking) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh" 
      }}>
        Cargando...
      </div>
    );
  }

  // ❌ No autorizado
  if (!isValid) {
    return <Navigate to="/Login" replace />;
  }

  // ✅ Autorizado
  return children;
};

export default RutaProtegida;


//grande messi