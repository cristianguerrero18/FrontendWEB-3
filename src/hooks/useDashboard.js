import { useState, useEffect } from "react";
import { getDashboardTotales } from "../api/Admin/Dashboard.js";

export const useDashboard = () => {
  const [totales, setTotales] = useState({
    asignaturas: 0,
    carreras: 0,
    categorias: 0,
    pensum: 0,
    recursos: 0,
    tipo_carrera: 0,
    usuarios: 0
  });
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(null);

  // Cargar totales del dashboard
  const cargarTotales = async () => {
    setCargando(true);
    setError(null);
    setMensaje("");
    
    try {
      const resultado = await getDashboardTotales();
      
      if (!resultado.ok) {
        throw new Error("Error al cargar los totales del dashboard");
      }
      
      setTotales(resultado.data || {});
      setMensaje("Datos del dashboard cargados exitosamente");
      
    } catch (err) {
      console.error("Error en useDashboard:", err);
      setError(err.message || "Error al cargar datos del dashboard");
      setMensaje("Error al cargar datos del dashboard");
      
      // Set datos por defecto en caso de error
      setTotales({
        asignaturas: 0,
        carreras: 0,
        categorias: 0,
        pensum: 0,
        recursos: 0,
        tipo_carrera: 0,
        usuarios: 0
      });
    } finally {
      setCargando(false);
    }
  };

  // Limpiar mensajes
  const limpiarMensaje = () => {
    setMensaje("");
    setError(null);
  };

  // Recargar datos
  const recargarDashboard = () => {
    cargarTotales();
  };

  useEffect(() => {
    cargarTotales();
  }, []);

  return {
    totales,
    cargando,
    mensaje,
    error,
    recargarDashboard,
    limpiarMensaje
  };
};