import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../context/UserContext.jsx';
import { getAsignaturasPorCarrera } from '../api/Admin/Pensum.js';

export const useMaterias = () => {
    const { userData } = useUser();
    const [materias, setMaterias] = useState([]);
    const [materiasPorSemestre, setMateriasPorSemestre] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cargar materias de la carrera - memoizado con useCallback
    const cargarMaterias = useCallback(async () => {
        if (!userData?.id_carrera) return;
        
        setLoading(true);
        try {
            const resultado = await getAsignaturasPorCarrera(userData.id_carrera);
            
            if (resultado.error) {
                throw new Error(resultado.mensaje || 'Error al cargar materias');
            }

            // Organizar materias por semestre
            const materiasOrganizadas = {};
            resultado.forEach(materia => {
                const semestre = materia.numero_semestre;
                if (!materiasOrganizadas[semestre]) {
                    materiasOrganizadas[semestre] = [];
                }
                materiasOrganizadas[semestre].push({
                    id: materia.id_asignatura,
                    nombre: materia.nombre_asignatura,
                    semestre: materia.numero_semestre
                });
            });

            setMaterias(resultado);
            setMateriasPorSemestre(materiasOrganizadas);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error cargando materias:', err);
        } finally {
            setLoading(false);
        }
    }, [userData?.id_carrera]); // Solo depende de id_carrera

    // Obtener materias de un semestre específico
    const getMateriasPorSemestre = useCallback((numeroSemestre) => {
        return materiasPorSemestre[numeroSemestre] || [];
    }, [materiasPorSemestre]); // Depende de materiasPorSemestre

    // Obtener todos los semestres disponibles
    const getSemestresDisponibles = useCallback(() => {
        return Object.keys(materiasPorSemestre).map(Number).sort((a, b) => a - b);
    }, [materiasPorSemestre]);

    // Cargar materias cuando cambie la carrera del usuario
    useEffect(() => {
        if (userData?.id_carrera) {
            cargarMaterias();
        }
    }, [userData?.id_carrera, cargarMaterias]); // Incluir cargarMaterias

    return {
        // Datos generales
        materias,
        materiasPorSemestre,
        loading,
        error,
        
        // Funciones útiles
        cargarMaterias,
        getMateriasPorSemestre,
        getSemestresDisponibles,
        
        // Información de contexto
        idCarrera: userData?.id_carrera,
        nombreCarrera: userData?.carrera_nombre || 'Carrera no asignada',
        tipoCarrera: userData?.id_tipo_carrera
    };
};