import { useState, useEffect, useCallback } from 'react';
import { 
  getFavoritos, 
  getFavoritosPorUsuario, 
  postFavorito, 
  deleteFavorito 
} from '../api/Admin/Favoritos.js';
import { useUser } from '../context/UserContext.jsx';

export const useFavoritos = () => {
  const { userData } = useUser();
  const [favoritos, setFavoritos] = useState([]);
  const [favoritosPorUsuario, setFavoritosPorUsuario] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [operacion, setOperacion] = useState({ tipo: null, cargando: false });

  // Cargar todos los favoritos (para administración)
  const cargarFavoritos = useCallback(async () => {
    setLoading(true);
    try {
      const resultado = await getFavoritos();
      setFavoritos(resultado);
      setError(null);
    } catch (err) {
      setError('Error al cargar favoritos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar favoritos del usuario actual
  const cargarFavoritosUsuario = useCallback(async (idUsuario = null) => {
    const usuarioId = idUsuario || userData?.id_usuario;
    if (!usuarioId) return;

    setLoading(true);
    try {
      const resultado = await getFavoritosPorUsuario(usuarioId);
      setFavoritosPorUsuario(resultado);
      setError(null);
    } catch (err) {
      setError('Error al cargar favoritos del usuario');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [userData?.id_usuario]);

  // Verificar si un recurso es favorito
  const esFavorito = useCallback((idRecurso) => {
    return favoritosPorUsuario.some(fav => fav.id_recurso === idRecurso);
  }, [favoritosPorUsuario]);

  // Agregar a favoritos
  const agregarAFavoritos = useCallback(async (idRecurso) => {
    if (!userData?.id_usuario || !idRecurso) {
      setError('Usuario o recurso no válido');
      return false;
    }

    setOperacion({ tipo: 'agregar', cargando: true, idRecurso });
    try {
      const favoritoData = {
        id_usuario: userData.id_usuario,
        id_recurso: idRecurso
      };

      const resultado = await postFavorito(favoritoData);
      
      if (resultado.mensaje?.includes('Error') || resultado.error) {
        throw new Error(resultado.mensaje || 'Error al agregar a favoritos');
      }

      // Actualizar lista de favoritos
      await cargarFavoritosUsuario();
      setOperacion({ tipo: null, cargando: false });
      return true;
    } catch (err) {
      setError(err.message);
      setOperacion({ tipo: null, cargando: false });
      console.error('Error:', err);
      return false;
    }
  }, [userData?.id_usuario, cargarFavoritosUsuario]);

  // Eliminar de favoritos
  const eliminarDeFavoritos = useCallback(async (idRecurso) => {
    if (!userData?.id_usuario || !idRecurso) {
      setError('Usuario o recurso no válido');
      return false;
    }

    setOperacion({ tipo: 'eliminar', cargando: true, idRecurso });
    try {
      const resultado = await deleteFavorito(userData.id_usuario, idRecurso);
      
      if (resultado.mensaje?.includes('Error') || resultado.error) {
        throw new Error(resultado.mensaje || 'Error al eliminar de favoritos');
      }

      // Actualizar lista de favoritos
      await cargarFavoritosUsuario();
      setOperacion({ tipo: null, cargando: false });
      return true;
    } catch (err) {
      setError(err.message);
      setOperacion({ tipo: null, cargando: false });
      console.error('Error:', err);
      return false;
    }
  }, [userData?.id_usuario, cargarFavoritosUsuario]);

  // Alternar favorito (agregar/eliminar)
  const alternarFavorito = useCallback(async (idRecurso) => {
    if (esFavorito(idRecurso)) {
      return await eliminarDeFavoritos(idRecurso);
    } else {
      return await agregarAFavoritos(idRecurso);
    }
  }, [esFavorito, agregarAFavoritos, eliminarDeFavoritos]);

  // Cargar favoritos del usuario al montar
  useEffect(() => {
    if (userData?.id_usuario) {
      cargarFavoritosUsuario();
    }
  }, [userData?.id_usuario, cargarFavoritosUsuario]);

  return {
    // Datos
    favoritos,
    favoritosPorUsuario,
    loading,
    error,
    
    // Funciones
    cargarFavoritos,
    cargarFavoritosUsuario,
    esFavorito,
    agregarAFavoritos,
    eliminarDeFavoritos,
    alternarFavorito,
    
    // Estado de operaciones
    operacion,
    
    // Información del usuario
    idUsuario: userData?.id_usuario
  };
};