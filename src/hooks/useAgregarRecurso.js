import { useState, useCallback } from 'react';
import { postRecurso } from '../api/Admin/Recursos.js';
import { getCategorias } from '../api/Admin/Categorias.js';

export const useAgregarRecurso = () => {
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);
    const [exito, setExito] = useState(null);
    const [categorias, setCategorias] = useState([]);

    // Cargar categorías disponibles - memoizado
    const cargarCategorias = useCallback(async () => {
        try {
            const resultado = await getCategorias();
            if (Array.isArray(resultado)) {
                setCategorias(resultado);
            } else if (resultado.error) {
                throw new Error(resultado.mensaje || 'Error al cargar categorías');
            }
        } catch (err) {
            console.error('Error cargando categorías:', err);
            setError('No se pudieron cargar las categorías');
        }
    }, []);

    // Agregar un nuevo recurso - memoizado
    const agregarRecurso = useCallback(async (recurso, archivo = null) => {
        setCargando(true);
        setError(null);
        setExito(null);

        try {
            // Validar campos requeridos
            if (!recurso.titulo?.trim()) {
                throw new Error('El título es requerido');
            }
            if (!recurso.tema?.trim()) {
                throw new Error('El tema es requerido');
            }
            if (!recurso.id_asignatura) {
                throw new Error('Debe seleccionar una asignatura');
            }
            if (!recurso.id_categoria) {
                throw new Error('Debe seleccionar una categoría');
            }

            // Validar si es enlace web
            const categoriaSeleccionada = categorias.find(c => c.id_categoria == recurso.id_categoria);
            const esEnlaceWeb = categoriaSeleccionada?.nombre_categoria === "Links" || recurso.id_categoria == 4;

            // Validar URL para enlaces web
            if (esEnlaceWeb) {
                if (!recurso.URL?.trim()) {
                    throw new Error('La URL es requerida para enlaces web');
                }
                try {
                    const urlValue = recurso.URL.trim();
                    new URL(urlValue);
                } catch {
                    throw new Error('La URL no tiene un formato válido');
                }
            }

            // Validar archivo para otras categorías
            if (!esEnlaceWeb && !archivo && !recurso.URL?.trim()) {
                throw new Error('Debe seleccionar un archivo o proporcionar una URL');
            }

            // Obtener usuario actual
            const usuarioStorage = JSON.parse(localStorage.getItem("usuario") || "{}");
            const idUsuarioActual = usuarioStorage.id_usuario || null;

            // Preparar datos del recurso
            const datosRecurso = {
                titulo: recurso.titulo.trim(),
                tema: recurso.tema.trim(),
                contador_reportes: 0,
                id_asignatura: recurso.id_asignatura,
                id_categoria: recurso.id_categoria,
                id_usuario: idUsuarioActual,
                activo: 1,
            };

            // Agregar URL si existe
            if (recurso.URL?.trim()) {
                datosRecurso.URL = recurso.URL.trim();
            }

            // Para enlaces web, no enviar archivo
            const archivoAEnviar = esEnlaceWeb ? null : archivo;
            const resultado = await postRecurso(datosRecurso, archivoAEnviar);

            if (resultado.mensaje?.includes("Error") || resultado.error) {
                throw new Error(resultado.mensaje || 'Error al crear el recurso');
            }

            setExito('Recurso creado exitosamente');
            return { exito: true, datos: resultado };
        } catch (err) {
            const mensajeError = err.message || 'Error al crear el recurso';
            setError(mensajeError);
            console.error('Error en agregarRecurso:', err);
            return { exito: false, error: mensajeError };
        } finally {
            setCargando(false);
        }
    }, [categorias]);

    // Limpiar mensajes
    const limpiarMensajes = useCallback(() => {
        setError(null);
        setExito(null);
    }, []);

    return {
        cargando,
        error,
        exito,
        categorias,
        cargarCategorias,
        agregarRecurso,
        limpiarMensajes
    };
};