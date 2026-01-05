import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { obtenerUsuarioPorId } from '../api/Admin/Perfil.js';

// Crear el contexto
const UserContext = createContext();

// Crear un hook personalizado para usar el contexto
const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  return context;
};

// Función para decodificar token JWT
const decodeToken = (token) => {
  try {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
};

// Obtener ID de usuario desde localStorage
const getUserIdFromStorage = () => {
  try {
    // Primero verificar si hay token (autenticación activa)
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      // Si no hay token, limpiar todo
      localStorage.removeItem('userData');
      sessionStorage.removeItem('userData');
      return null;
    }
    
    // Decodificar token para obtener ID
    const decoded = decodeToken(token);
    if (decoded && decoded.id_usuario) {
      return decoded.id_usuario;
    }
    
    return null;
  } catch (error) {
    console.error('Error obteniendo ID de usuario:', error);
    return null;
  }
};

// Proveedor del contexto
const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Verificar token de autenticación
  const checkAuthToken = useCallback(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return !!token; // Devuelve true si hay token, false si no
  }, []);

  // Limpiar todos los datos de usuario
  const clearAllUserData = useCallback(() => {
    // Limpiar state
    setUserData(null);
    setError(null);
    
    // Limpiar almacenamiento local
    localStorage.removeItem('userData');
    sessionStorage.removeItem('userData');
  }, []);

  // Verificar si hay usuario autenticado al iniciar
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Verificar si hay token de autenticación
        const hasToken = checkAuthToken();
        
        if (!hasToken) {
          console.log('No hay token de autenticación');
          clearAllUserData();
          setIsInitialized(true);
          setLoading(false);
          return;
        }
        
        const userId = getUserIdFromStorage();
        
        if (userId) {
          await loadUserData(userId);
        } else {
          console.log('No hay usuario autenticado');
          clearAllUserData();
        }
      } catch (err) {
        console.error('Error inicializando usuario:', err);
        setError(err.message);
        clearAllUserData();
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    initializeUser();
  }, [checkAuthToken, clearAllUserData]);

  // Cargar datos del usuario - MODIFICADA
  const loadUserData = useCallback(async (userId) => {
    if (!userId) {
      console.error('No se proporcionó ID de usuario');
      clearAllUserData();
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      // ✅ Obtener token del localStorage primero
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación disponible');
      }
      
      // ✅ Llamar a la función modificada con el token
      // Necesitas modificar obtenerUsuarioPorId para aceptar token como parámetro
      const resultado = await obtenerUsuarioPorId(userId, token);
      
      // Verificar que la respuesta sea válida
      if (!resultado || resultado.error) {
        throw new Error(resultado?.mensaje || 'Error al cargar datos del usuario');
      }
      
      const user = {
        ...resultado,
        id_usuario: resultado.id_usuario,
        id_carrera: resultado.id_carrera,
        id_tipo_carrera: resultado.id_tipo_carrera,
        id_rol: resultado.id_rol,
        nombres_usuario: resultado.nombres_usuario,
        apellidos_usuario: resultado.apellidos_usuario,
        correo: resultado.correo,
        carrera_nombre: resultado.nombre_carrera || resultado.carrera_nombre,
        rol_nombre: resultado.rol_nombre || resultado.nombre_rol,
      };
      
      setUserData(user);
      
      // Guardar en localStorage
      localStorage.setItem('userData', JSON.stringify({
        id_usuario: user.id_usuario,
        nombres_usuario: user.nombres_usuario,
        apellidos_usuario: user.apellidos_usuario,
        correo: user.correo,
        id_rol: user.id_rol
      }));
      
      return user;
    } catch (err) {
      // Manejar error específico de token
      if (err.message.includes('token') || err.message.includes('autenticación') || err.message.includes('No hay token')) {
        console.warn('Token inválido o expirado, limpiando sesión');
        logout(); // Usar la función logout que ya tienes
      }
      
      setError(err.message || 'Error al cargar datos del usuario');
      console.error('Error en loadUserData:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearAllUserData]);

  // Cargar datos desde localStorage si existe
  const loadFromLocalStorage = useCallback(() => {
    try {
      // Verificar primero si hay token de autenticación
      if (!checkAuthToken()) {
        clearAllUserData();
        return null;
      }
      
      const storedData = localStorage.getItem('userData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setUserData(parsedData);
        return parsedData;
      }
      return null;
    } catch (error) {
      console.error('Error cargando de localStorage:', error);
      clearAllUserData();
      return null;
    }
  }, [checkAuthToken, clearAllUserData]);

  // Actualizar datos
  const updateUserData = useCallback((newData) => {
    setUserData(prev => {
      if (!prev) return null;
      
      const updated = {
        ...prev,
        ...newData
      };
      
      // Actualizar localStorage solo si hay autenticación
      if (checkAuthToken() && updated && updated.id_usuario) {
        localStorage.setItem('userData', JSON.stringify({
          id_usuario: updated.id_usuario,
          nombres_usuario: updated.nombres_usuario,
          apellidos_usuario: updated.apellidos_usuario,
          correo: updated.correo,
          id_rol: updated.id_rol
        }));
      }
      
      return updated;
    });
  }, [checkAuthToken]);

  // Obtener datos específicos
  const getUserField = useCallback((field) => {
    return userData ? userData[field] : null;
  }, [userData]);

  // Obtener ID de usuario
  const getUserId = useCallback(() => {
    if (userData) return userData.id_usuario;
    
    // Verificar token primero
    if (!checkAuthToken()) return null;
    
    return getUserIdFromStorage();
  }, [userData, checkAuthToken]);

  // Cerrar sesión COMPLETA
  const logout = useCallback(() => {
    // Limpiar todos los datos
    clearAllUserData();
    
    // Limpiar tokens de autenticación
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    // También limpiar cualquier otro dato relacionado
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('refreshToken');
    
    // Limpiar tokenStorage
    try {
      // Si tienes una función para limpiar tokenStorage
      if (typeof window.clearTokenStorage === 'function') {
        window.clearTokenStorage();
      }
    } catch (e) {
      console.warn('No se pudo limpiar tokenStorage:', e);
    }
    
    // Forzar recarga del estado
    setIsInitialized(false);
    
    // Opcional: recargar la página para asegurar limpieza completa
    // window.location.reload();
  }, [clearAllUserData]);

  // Login manual
  const login = useCallback(async (userId, token = null) => {
    if (token) {
      // Guardar token primero
      localStorage.setItem('token', token);
    }
    
    return await loadUserData(userId);
  }, [loadUserData]);

  // Verificar autenticación
  const checkAuthentication = useCallback(() => {
    return checkAuthToken() && !!userData;
  }, [checkAuthToken, userData]);

  const value = {
    userData,
    loading,
    error,
    isInitialized,
    isAuthenticated: checkAuthentication(),
    loadUserData,
    loadFromLocalStorage,
    updateUserData,
    getUserField,
    getUserId,
    login,
    logout,
    checkAuthentication
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Exportaciones nombradas
export { UserProvider, useUser };
export default UserContext;