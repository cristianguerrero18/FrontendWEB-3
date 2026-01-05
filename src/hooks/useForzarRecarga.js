// hooks/useRecargaInteligente.js (renombra el archivo o mantén el mismo)
import { useEffect, useRef, useCallback } from 'react';

export const useRecargaInteligente = (dependencia, callback, opciones = {}) => {
  const {
    delay = 300,
    ejecutarInmediato = true,
    deshabilitar = false,
    debug = false,
    condicionExtra = true
  } = opciones;

  const primeraEjecucion = useRef(true);
  const timeoutRef = useRef(null);
  const ultimaEjecucionRef = useRef(0);
  const ultimaDependenciaRef = useRef(dependencia);

  const log = useCallback((mensaje) => {
    if (debug) {
      console.log(`🔔 [useRecargaInteligente] ${mensaje}`, { 
        dependencia, 
        tiempoDesdeUltima: Date.now() - ultimaEjecucionRef.current,
        ejecutarInmediato,
        condicionExtra
      });
    }
  }, [debug, dependencia, ejecutarInmediato, condicionExtra]);

  const ejecutarCallback = useCallback(() => {
    const ahora = Date.now();
    
    // Verificar condiciones adicionales
    if (!condicionExtra) {
      log('Condición extra no cumplida, omitiendo ejecución');
      return;
    }
    
    if (deshabilitar) {
      log('Ejecución deshabilitada');
      return;
    }

    log(`Ejecutando callback (${ahora - ultimaEjecucionRef.current}ms desde última)`);
    ultimaEjecucionRef.current = ahora;
    callback();
  }, [callback, condicionExtra, deshabilitar, log]);

  useEffect(() => {
    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const ahora = Date.now();
    const tiempoDesdeUltimaEjecucion = ahora - ultimaEjecucionRef.current;
    const dependenciaCambio = dependencia !== ultimaDependenciaRef.current;
    
    ultimaDependenciaRef.current = dependencia;

    // Si no hay dependencia válida, no hacer nada
    if (dependencia === undefined || dependencia === null) {
      log('Dependencia no válida, omitiendo');
      return;
    }

    // Lógica de ejecución
    if (primeraEjecucion.current && ejecutarInmediato) {
      log('Primera ejecución inmediata');
      primeraEjecucion.current = false;
      timeoutRef.current = setTimeout(ejecutarCallback, 10); // Pequeño delay para estabilizar
    } else if (dependenciaCambio) {
      log(`Dependencia cambió, programando ejecución`);
      
      if (tiempoDesdeUltimaEjecucion >= delay) {
        timeoutRef.current = setTimeout(ejecutarCallback, 10);
      } else {
        const tiempoRestante = delay - tiempoDesdeUltimaEjecucion;
        timeoutRef.current = setTimeout(ejecutarCallback, tiempoRestante);
      }
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [dependencia, delay, ejecutarInmediato, ejecutarCallback, log]);

  // Función para forzar recarga manual
  const forzarRecarga = useCallback(() => {
    log('Recarga forzada manualmente');
    primeraEjecucion.current = true;
    ultimaEjecucionRef.current = 0;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    ejecutarCallback();
  }, [ejecutarCallback, log]);

  return { forzarRecarga };
};  