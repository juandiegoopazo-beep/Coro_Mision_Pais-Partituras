import { useCallback, useEffect, useState } from 'react';
import {
  hayDatosOffline,
  leerUltimaSincronizacion,
} from '../lib/offlineDb';
import { sincronizarOffline, type ProgresoSincronizacion } from '../lib/offlineSync';

export function useOfflineSync() {
  const [tieneDatos, setTieneDatos] = useState(false);
  const [ultimaSync, setUltimaSync] = useState<string | null>(null);
  const [sincronizando, setSincronizando] = useState(false);
  const [progreso, setProgreso] = useState<ProgresoSincronizacion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enLinea, setEnLinea] = useState(navigator.onLine);

  useEffect(() => {
    hayDatosOffline().then(setTieneDatos);
    leerUltimaSincronizacion().then(setUltimaSync);

    const actualizarEnLinea = () => setEnLinea(navigator.onLine);
    window.addEventListener('online', actualizarEnLinea);
    window.addEventListener('offline', actualizarEnLinea);
    return () => {
      window.removeEventListener('online', actualizarEnLinea);
      window.removeEventListener('offline', actualizarEnLinea);
    };
  }, []);

  const sincronizar = useCallback(async () => {
    setSincronizando(true);
    setError(null);
    try {
      await sincronizarOffline(setProgreso);
      setTieneDatos(true);
      setUltimaSync(await leerUltimaSincronizacion());
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo descargar la información.');
    } finally {
      setSincronizando(false);
    }
  }, []);

  return { tieneDatos, ultimaSync, sincronizando, progreso, error, enLinea, sincronizar };
}
