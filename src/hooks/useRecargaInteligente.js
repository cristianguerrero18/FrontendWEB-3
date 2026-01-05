// hooks/useRecargaInteligente.js
import { useEffect, useRef, useCallback, useState } from 'react';

export const useRecargaInteligente = (dependencia, callback, opciones = {}) => {
  const {
    delay = 300,
    ejecutarInmediato = true,
    deshabilitar = false,
    debug = false,
    condicionExtra = true,
    modoInmediato = false  // Nueva opción para recarga inmediata
  } = opciones;

  const [recargaPendiente, setRecargaPendiente] = useState(false);
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
    setRecargaPendiente(false);
    callback();
  }, [callback, condicionExtra, deshabilitar, log]);

  // Función para recarga INMEDIATA
  const ejecutarInmediatamente = useCallback(() => {
    log('Ejecutando recarga INMEDIATA');
    
    // Limpiar cualquier timeout pendiente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Ejecutar de inmediato
    ejecutarCallback();
  }, [ejecutarCallback, log]);

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
    if (modoInmediato) {
      // MODO INMEDIATO: Ejecutar de inmediato
      log('Modo inmediato - ejecutando ahora');
      timeoutRef.current = setTimeout(ejecutarCallback, 10);
    } else if (primeraEjecucion.current && ejecutarInmediato) {
      log('Primera ejecución inmediata');
      primeraEjecucion.current = false;
      timeoutRef.current = setTimeout(ejecutarCallback, 10);
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
  }, [dependencia, delay, ejecutarInmediato, ejecutarCallback, log, modoInmediato]);

  // Función para forzar recarga manual INMEDIATA
  const forzarRecarga = useCallback((inmediato = false) => {
    if (inmediato) {
      log('Recarga forzada INMEDIATA');
      ejecutarInmediatamente();
    } else {
      log('Recarga forzada programada');
      primeraEjecucion.current = true;
      ultimaEjecucionRef.current = 0;
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(ejecutarCallback, 10);
    }
  }, [ejecutarCallback, ejecutarInmediatamente, log]);

  return { 
    forzarRecarga,
    ejecutarInmediatamente  // Nueva función exportada
  };
};