import React, { createContext, useContext, useState, useEffect } from 'react';
import { obtenerUsuarioPorId } from '../api/Admin/Perfil.js';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cargar datos del usuario
    const loadUserData = async (userId) => {
        setLoading(true);
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
                    carrera_nombre : resultado.nombre_carrera
                    // Agrega otros campos que necesites
                });
            }
        } catch (err) {
            setError(err.message);
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

    return (
        <UserContext.Provider value={{
            userData,
            loading,
            error,
            loadUserData,
            updateUserData,
            getUserField
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);