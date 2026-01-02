import { useState, useEffect, useCallback } from 'react';
import { getRecursosPorAsignatura } from '../api/Admin/Recursos.js';

export const useRecursosMateria = () => {
    const [recursos, setRecursos] = useState({});
    const [recursosCargados, setRecursosCargados] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cargar recursos de una materia específica - memoizado
    const cargarRecursosMateria = useCallback(async (idAsignatura) => {
        if (!idAsignatura || recursosCargados[idAsignatura]) return;

        setLoading(true);
        try {
            const resultado = await getRecursosPorAsignatura(idAsignatura);
            
            if (resultado.error) {
                throw new Error(resultado.mensaje || 'Error al cargar recursos');
            }

            // Filtrar solo recursos activos (activo = 1)
            const recursosActivos = Array.isArray(resultado) 
                ? resultado.filter(recurso => recurso.activo === 1 || recurso.activo === true)
                : [];

            setRecursos(prev => ({
                ...prev,
                [idAsignatura]: recursosActivos
            }));

            setRecursosCargados(prev => ({
                ...prev,
                [idAsignatura]: true
            }));

            setError(null);
        } catch (err) {
            setError(err.message);
            console.error(`Error cargando recursos para asignatura ${idAsignatura}:`, err);
        } finally {
            setLoading(false);
        }
    }, [recursosCargados]);

    // Obtener recursos de una materia específica (ya filtrados por activo)
    const getRecursosPorIdAsignatura = useCallback((idAsignatura) => {
        return recursos[idAsignatura] || [];
    }, [recursos]);

    // Verificar si una materia tiene recursos activos
    const materiaTieneRecursos = useCallback((idAsignatura) => {
        return recursos[idAsignatura]?.length > 0;
    }, [recursos]);

    // Contar recursos activos por categoría
    const contarRecursosPorTipo = useCallback((idAsignatura) => {
        const recursosMateria = recursos[idAsignatura] || [];
        const conteo = {
            total: recursosMateria.length,
            imagenes: 0,
            pdf: 0,
            links: 0,
            otros: 0
        };

        recursosMateria.forEach(recurso => {
            switch(recurso.id_categoria) {
                case 1: // Imágenes
                    conteo.imagenes++;
                    break;
                case 2: // PDF
                    conteo.pdf++;
                    break;
                case 3: // Otros archivos
                    conteo.otros++;
                    break;
                case 4: // Links
                    conteo.links++;
                    break;
                default:
                    conteo.otros++;
            }
        });

        return conteo;
    }, [recursos]);

    // Función para recargar recursos de una materia específica
    const recargarRecursosMateria = useCallback(async (idAsignatura) => {
        if (!idAsignatura) return;

        setRecursosCargados(prev => ({
            ...prev,
            [idAsignatura]: false
        }));

        await cargarRecursosMateria(idAsignatura);
    }, [cargarRecursosMateria]);

    return {
        // Datos
        recursos,
        loading,
        error,
        
        // Funciones principales
        cargarRecursosMateria,
        getRecursosPorIdAsignatura,
        materiaTieneRecursos,
        contarRecursosPorTipo,
        
        // Funciones de actualización
        recargarRecursosMateria,
        
        // Estado de carga
        recursosCargados
    };
};