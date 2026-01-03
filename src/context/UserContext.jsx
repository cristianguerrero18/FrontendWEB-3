import React, { createContext, useContext, useState, useEffect } from 'react';
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

// Proveedor del contexto
const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar datos del usuario
  const loadUserData = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await obtenerUsuarioPorId(userId);
      if (!resultado.error) {
        setUserData({
          ...resultado,
          // Guardamos todos los campos importantes
          id_carrera: resultado.id_carrera,
          id_tipo_carrera: resultado.id_tipo_carrera,
          id_rol: resultado.id_rol,
          nombres_usuario: resultado.nombres_usuario,
          apellidos_usuario: resultado.apellidos_usuario,
          correo: resultado.correo,
          carrera_nombre: resultado.nombre_carrera || resultado.carrera_nombre,
          // Agrega otros campos que necesites
        });
      } else {
        setError(resultado.mensaje || 'Error al cargar datos del usuario');
      }
    } catch (err) {
      setError(err.message || 'Error al cargar datos del usuario');
      console.error('Error en loadUserData:', err);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar datos
  const updateUserData = (newData) => {
    setUserData(prev => ({
      ...prev,
      ...newData
    }));
  };

  // Obtener datos específicos
  const getUserField = (field) => {
    return userData ? userData[field] : null;
  };

  // Cerrar sesión
  const logout = () => {
    setUserData(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('userData');
  };

  const value = {
    userData,
    loading,
    error,
    loadUserData,
    updateUserData,
    getUserField,
    logout,
    isAuthenticated: !!userData
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Exportaciones nombradas
export { UserProvider, useUser };
export default UserContext; // También exportamos el contexto por si acaso