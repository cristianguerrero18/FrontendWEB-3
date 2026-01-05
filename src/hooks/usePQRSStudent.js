// src/hooks/usePQRSStudent.js - VERSIÓN CON CONTEXTO
import { useState, useEffect, useCallback } from "react";
import { useUser } from "../context/UserContext.jsx"; // Importa el contexto
import { 
  createPQRS, 
  getPQRSPorUsuario 
} from "../api/Admin/PQRS.js";

export const usePQRSStudent = () => {
  const { userData } = useUser(); // Usa el contexto
  const [pqrs, setPqrs] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [cargandoCrear, setCargandoCrear] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(null);

  // Obtener el ID del usuario DESDE EL CONTEXTO
  const getIdUsuario = useCallback(() => {
    console.log("🔍 === BUSCANDO ID USUARIO DESDE CONTEXTO ===");
    
    // Primero intentar desde el contexto
    if (userData && userData.id_usuario) {
      console.log("✅ ID obtenido del contexto:", userData.id_usuario);
      return userData.id_usuario;
    }
    
    // Si no está en el contexto, buscar en localStorage (fallback)
    console.log("⚠️ No hay usuario en contexto, buscando en localStorage...");
    
    try {
      const localData = localStorage.getItem("userData");
      if (localData) {
        const parsed = JSON.parse(localData);
        const idUsuario = parsed.id_usuario || parsed.userId || parsed.id;
        if (idUsuario) {
          console.log("✅ ID obtenido de localStorage:", idUsuario);
          return idUsuario;
        }
      }
      
      // También verificar token u otros lugares
      const token = localStorage.getItem("token");
      if (token) {
        console.log("🔑 Token encontrado, pero no ID de usuario");
      }
      
      console.log("❌ No se encontró ID de usuario");
      return null;
      
    } catch (error) {
      console.error("🔥 Error obteniendo ID usuario:", error);
      return null;
    }
  }, [userData]); // Dependencia del contexto

  // Cargar PQRS del estudiante
  const cargarPQRS = useCallback(async () => {
    const idUsuario = getIdUsuario();
    console.log("📋 === CARGANDO PQRS ===");
    console.log("ID Usuario para cargar:", idUsuario);
    console.log("Datos del contexto:", userData);
    
    if (!idUsuario) {
      const errorMsg = "No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.";
      console.error("❌", errorMsg);
      setMensaje(errorMsg);
      setError(errorMsg);
      setPqrs([]);
      return [];
    }

    setCargando(true);
    setError(null);
    setMensaje("");
    
    try {
      console.log("🔄 Enviando solicitud para obtener PQRS...");
      const resultado = await getPQRSPorUsuario(idUsuario);
      console.log("📊 Resultado recibido:", resultado);
      
      if (resultado && resultado.error) {
        console.error("❌ Error en la respuesta:", resultado.mensaje);
        setMensaje(resultado.mensaje || "Error al cargar tus PQRS");
        setError(resultado.mensaje);
        setPqrs([]);
      } else if (Array.isArray(resultado)) {
        console.log(`✅ ${resultado.length} PQRS cargados exitosamente`);
        setPqrs(resultado);
        setError(null);
      } else {
        console.error("❌ Respuesta no es un array:", resultado);
        setMensaje("Formato de respuesta inválido");
        setError("Formato de respuesta inválido");
        setPqrs([]);
      }
      
      return Array.isArray(resultado) ? resultado : [];
      
    } catch (error) {
      console.error("🔥 Error en cargarPQRS:", error.message);
      console.error("Stack trace:", error.stack);
      const errorMsg = "Error de conexión al cargar tus PQRS";
      setMensaje(errorMsg);
      setError(error.message);
      setPqrs([]);
      return [];
    } finally {
      setCargando(false);
    }
  }, [getIdUsuario, userData]);

  // Crear nuevo PQR - VERSIÓN CON DEPURACIÓN
  const crearPQRS = useCallback(async (descripcion, idTipoPqrs = "1") => {
    const idUsuario = getIdUsuario();
    console.log("✏️ === CREANDO NUEVO PQR ===");
    console.log("Usuario ID:", idUsuario);
    console.log("Datos del contexto:", userData);
    console.log("Descripción:", descripcion);
    console.log("Tipo PQR:", idTipoPqrs);
    
    if (!idUsuario) {
      const errorMsg = "No se pudo identificar al usuario";
      console.error("❌", errorMsg);
      setMensaje(errorMsg);
      return { error: true, mensaje: errorMsg };
    }

    if (!descripcion || descripcion.trim().length < 5) {
      const errorMsg = "La descripción debe tener al menos 5 caracteres";
      console.error("❌", errorMsg);
      return { error: true, mensaje: errorMsg };
    }

    setCargandoCrear(true);
    setError(null);
    setMensaje("");
    
    try {
      console.log("🔄 Enviando solicitud de creación...");
      const resultado = await createPQRS({
        id_usuario: idUsuario,
        descripcion: descripcion.trim(),
        id_tipo_pqrs: idTipoPqrs
      });

      console.log("📊 Resultado de creación:", resultado);
      
      if (resultado && resultado.error) {
        console.error("❌ Error al crear PQR:", resultado.mensaje);
        setMensaje(resultado.mensaje || "Error al crear el PQR");
        setError(resultado.mensaje);
        return { error: true, datos: resultado };
      } else {
        const successMsg = "PQR creado exitosamente";
        console.log("✅", successMsg);
        setMensaje(successMsg);
        
        // Recargar la lista después de 1 segundo
        setTimeout(() => {
          console.log("🔄 Recargando lista de PQRS...");
          cargarPQRS();
        }, 1000);
        
        return { error: false, datos: resultado };
      }
    } catch (error) {
      console.error("🔥 Error en crearPQRS:", error.message);
      console.error("Stack trace:", error.stack);
      const errorMsg = "Error al crear el PQR";
      setMensaje(errorMsg);
      setError(error.message);
      return { error: true, datos: { mensaje: errorMsg } };
    } finally {
      setCargandoCrear(false);
    }
  }, [getIdUsuario, cargarPQRS, userData]);

  // Limpiar mensajes
  const limpiarMensaje = useCallback(() => {
    console.log("🗑️ Limpiando mensajes");
    setMensaje("");
    setError(null);
  }, []);

  // Cargar PQRS al inicio y cuando cambien los datos del usuario
  useEffect(() => {
    console.log("🎬 === INICIALIZANDO HOOK PQRS ===");
    console.log("Estado del contexto:", { 
      userData, 
      tieneUserData: !!userData,
      idUsuario: userData?.id_usuario 
    });
    
    const idUsuario = getIdUsuario();
    if (idUsuario) {
      console.log("👤 Usuario identificado, cargando PQRS...");
      cargarPQRS();
    } else {
      const errorMsg = "Por favor, inicia sesión para ver tus PQRS";
      console.error("❌", errorMsg);
      console.log("userData disponible:", userData);
      setMensaje(errorMsg);
      setError(errorMsg);
    }
  }, [cargarPQRS, getIdUsuario, userData]);

  return { 
    pqrs, 
    cargando, 
    cargandoCrear,
    mensaje, 
    error,
    recargarPQRS: cargarPQRS,
    crearPQRS,
    limpiarMensaje,
    getIdUsuario
  };
};