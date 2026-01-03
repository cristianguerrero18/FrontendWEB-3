const API_URL = "https://proyectoweb-3.onrender.com"; // ajusta si cambia el puerto

// ======================
// DASHBOARD
// ======================

// Obtener totales del dashboard
export const getDashboardTotales = async () => {
  try {
    const res = await fetch(`${API_URL}/api/dashboard`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch (error) {
    console.error("Error en getDashboardTotales:", error.message);
    return {
      ok: false,
      data: {},
    };
  }
};
