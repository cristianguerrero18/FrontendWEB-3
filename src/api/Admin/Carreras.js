const API_URL = "http://localhost:4000";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});
// Obtener carreras
export const getCarreras = async () => {
  const res = await fetch(`${API_URL}/api/carreras`, {
    method: "GET",
    headers: authHeaders(),
  });
  return res.json();
};

// Obtener carreras por tipo
export const getCarrerasPortipo = async (id_tipo_carrera) => {
  const res = await fetch(`${API_URL}/api/carreras/tipo/${id_tipo_carrera}`, {
    method: "GET",
    headers: authHeaders(),
  });
  return res.json();
};

// Crear carreras
export const postCarreras = async (carreras) => {
  const res = await fetch(`${API_URL}/api/carreras`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(carreras),
  });
  return res.json();
};

// Actualizar carrera
export const putCarrera = async (carrera) => {
  const res = await fetch(`${API_URL}/api/carreras`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(carrera),
  });
  return res.json();
};

// Eliminar carrera
export const deleteCarrera = async (id) => {
  const res = await fetch(`${API_URL}/api/carreras/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
};
