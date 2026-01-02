const API_URL = "https://proyectoweb-3.onrender.com/"; // cambia si tu backend usa otro puerto
// CARRERAS
const authHeaders = () => ({
  "Content-Type": "application/json",
});

export const getTipo_carrera = async () => {
    const res = await fetch(`${API_URL}/api/tipo_carrera`, {
      method: "GET",
      headers : authHeaders()
    });
  
    return res.json();
  };