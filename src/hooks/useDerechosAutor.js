import { useState, useCallback } from 'react';
import { 
  postDerechoAutor, 
  putDerechoAutor, 
  deleteDerechoAutor, 
  getDerechoAutorPorId,
  getDerechosAutor 
} from '../api/Admin/derechos-autor.js';

export const useDerechosAutor = () => {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [derechos, setDerechos] = useState([]);
  const [derechoActual, setDerechoActual] = useState(null);

  // Función para obtener ID de usuario del token
  const obtenerIdUsuario = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id_usuario;
    } catch (error) {
      console.error('Error obteniendo id_usuario:', error);
      return null;
    }
  };

  // Función para formatear fecha
  const formatearFecha = (fecha = new Date()) => {
    return fecha.toISOString().slice(0, 19).replace('T', ' ');
  };

  // Crear declaración de derechos
  const crearDeclaracion = useCallback(async (declaracionData) => {
    setCargando(true);
    setError(null);
    setExito(null);

    try {
      const id_usuario = obtenerIdUsuario();
      if (!id_usuario) {
        throw new Error('No se pudo obtener la información del usuario');
      }

      const datosCompletos = {
        ...declaracionData,
        id_usuario,
        fecha_declaracion: formatearFecha()
      };

      const resultado = await postDerechoAutor(datosCompletos);
      
      if (resultado.mensaje && resultado.mensaje.includes('Error')) {
        throw new Error(resultado.mensaje);
      }

      setExito('Declaración de derechos registrada correctamente');
      return { exito: true, data: resultado };
    } catch (error) {
      setError(error.message || 'Error al registrar la declaración de derechos');
      return { exito: false, error: error.message };
    } finally {
      setCargando(false);
    }
  }, []);

  // Actualizar declaración de derechos
  const actualizarDeclaracion = useCallback(async (declaracionData) => {
    setCargando(true);
    setError(null);
    setExito(null);

    try {
      const resultado = await putDerechoAutor(declaracionData);
      
      if (resultado.mensaje && resultado.mensaje.includes('Error')) {
        throw new Error(resultado.mensaje);
      }

      setExito('Declaración de derechos actualizada correctamente');
      return { exito: true, data: resultado };
    } catch (error) {
      setError(error.message || 'Error al actualizar la declaración de derechos');
      return { exito: false, error: error.message };
    } finally {
      setCargando(false);
    }
  }, []);

  // Eliminar declaración de derechos
  const eliminarDeclaracion = useCallback(async (id_derechos_autor) => {
    setCargando(true);
    setError(null);
    setExito(null);

    try {
      const resultado = await deleteDerechoAutor(id_derechos_autor);
      
      if (resultado.mensaje && resultado.mensaje.includes('Error')) {
        throw new Error(resultado.mensaje);
      }

      setExito('Declaración de derechos eliminada correctamente');
      return { exito: true, data: resultado };
    } catch (error) {
      setError(error.message || 'Error al eliminar la declaración de derechos');
      return { exito: false, error: error.message };
    } finally {
      setCargando(false);
    }
  }, []);

  // Obtener declaración por ID
  const obtenerDeclaracionPorId = useCallback(async (id_derechos_autor) => {
    setCargando(true);
    setError(null);

    try {
      const resultado = await getDerechoAutorPorId(id_derechos_autor);
      
      if (!resultado) {
        throw new Error('No se encontró la declaración de derechos');
      }

      setDerechoActual(resultado);
      return { exito: true, data: resultado };
    } catch (error) {
      setError(error.message || 'Error al obtener la declaración de derechos');
      return { exito: false, error: error.message };
    } finally {
      setCargando(false);
    }
  }, []);

  // Obtener todas las declaraciones
  const obtenerTodasDeclaraciones = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const resultado = await getDerechosAutor();
      
      if (resultado.mensaje && resultado.mensaje.includes('Error')) {
        throw new Error(resultado.mensaje);
      }

      setDerechos(Array.isArray(resultado) ? resultado : []);
      return { exito: true, data: resultado };
    } catch (error) {
      setError(error.message || 'Error al obtener las declaraciones de derechos');
      return { exito: false, error: error.message };
    } finally {
      setCargando(false);
    }
  }, []);

  // Limpiar mensajes
  const limpiarMensajes = useCallback(() => {
    setError(null);
    setExito(null);
  }, []);

  return {
    cargando,
    error,
    exito,
    derechos,
    derechoActual,
    crearDeclaracion,
    actualizarDeclaracion,
    eliminarDeclaracion,
    obtenerDeclaracionPorId,
    obtenerTodasDeclaraciones,
    limpiarMensajes,
    obtenerIdUsuario
  };
};