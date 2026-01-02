import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext.jsx';

export const useSemestres = () => {
    const { userData } = useUser();
    const [semestres, setSemestres] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Generar semestres según el tipo de carrera
    const generarSemestres = () => {
        if (!userData || !userData.id_tipo_carrera) {
            return [];
        }

        let inicio = 1;
        let fin = 6;

        if (userData.id_tipo_carrera === 2) { // Profesional
            inicio = 7;
            fin = 10;
        }

        const semestresArray = [];
        for (let i = inicio; i <= fin; i++) {
            semestresArray.push({
                id: i,
                numero: i,
                nombre: `Semestre ${i}`,
                descripcion: userData.id_tipo_carrera === 1 
                    ? `Semestre ${i} de Tecnología` 
                    : `Semestre ${i} de Carrera Profesional`
            });
        }

        return semestresArray;
    };

    // Cargar semestres cuando cambien los datos del usuario
    useEffect(() => {
        if (userData) {
            setLoading(true);
            try {
                const semestresGenerados = generarSemestres();
                setSemestres(semestresGenerados);
                setError(null);
            } catch (err) {
                setError('Error al generar semestres');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        }
    }, [userData]);

    return {
        semestres,
        loading,
        error,
        tipoCarrera: userData?.id_tipo_carrera,
        idCarrera: userData?.id_carrera,
        nombreCarrera: userData?.carrera_nombre || 'Carrera no asignada'
    };
};