import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../context/UserContext.jsx';
import { getAsignaturasPorCarrera } from '../api/Admin/Pensum.js';

export const useAsignaturasEstudiante = () => {
    const { userData } = useUser();
    const [asignaturas, setAsignaturas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cargar asignaturas de la carrera del estudiante - memoizado
    const cargarAsignaturas = useCallback(async () => {
        if (!userData?.id_carrera) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const resultado = await getAsignaturasPorCarrera(userData.id_carrera);
            
            if (resultado.error) {
                throw new Error(resultado.mensaje || 'Error al cargar asignaturas');
            }

            // Filtrar asignaturas únicas por ID
            const asignaturasUnicas = resultado.reduce((acc, asignatura) => {
                if (!acc.find(a => a.id === asignatura.id_asignatura)) {
                    acc.push({
                        id: asignatura.id_asignatura,
                        nombre: asignatura.nombre_asignatura,
                        semestre: asignatura.numero_semestre
                    });
                }
                return acc;
            }, []);

            // Ordenar por semestre y nombre
            asignaturasUnicas.sort((a, b) => {
                if (a.semestre !== b.semestre) {
                    return a.semestre - b.semestre;
                }
                return a.nombre.localeCompare(b.nombre);
            });

            setAsignaturas(asignaturasUnicas);
        } catch (err) {
            setError(err.message);
            console.error('Error cargando asignaturas:', err);
        } finally {
            setLoading(false);
        }
    }, [userData?.id_carrera]);

    // Obtener asignaturas por semestre
    const getAsignaturasPorSemestre = useCallback((numeroSemestre) => {
        return asignaturas.filter(asignatura => asignatura.semestre === numeroSemestre);
    }, [asignaturas]);

    // Cargar asignaturas cuando cambie la carrera del usuario
    useEffect(() => {
        if (userData?.id_carrera) {
            cargarAsignaturas();
        }
    }, [userData?.id_carrera, cargarAsignaturas]);

    return {
        asignaturas,
        loading,
        error,
        cargarAsignaturas,
        getAsignaturasPorSemestre,
        idCarrera: userData?.id_carrera,
        nombreCarrera: userData?.carrera_nombre
    };
};