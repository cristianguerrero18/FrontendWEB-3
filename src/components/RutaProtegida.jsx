import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const RutaProtegida = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/Login" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    if (decoded.exp * 1000 < Date.now()) {
      localStorage.clear();
      return <Navigate to="/Login" replace />;
    }

    return children;

  } catch (error) {
    localStorage.clear();
    return <Navigate to="/Login" replace />;
  }
};

export default RutaProtegida;
