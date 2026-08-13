import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { cancionesPorMomentoOffline } from '../lib/offlineQueries';
import type { ResultadoBusqueda } from '../types/cancionero';

export function useCancionesPorMomento(momento: string | null) {
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!momento) {
      setResultados([]);
      return;
    }
    let cancelado = false;
    setLoading(true);

    async function cargar() {
      if (!navigator.onLine) {
        const local = await cancionesPorMomentoOffline(momento!);
        if (!cancelado) {
          setResultados(local);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from('canciones')
        .select('id, titulo, formato, momento_liturgico, cancionero_id, cancionero:cancioneros(titulo)')
        .eq('momento_liturgico', momento)
        .order('titulo');

      if (cancelado) return;

      if (error || !data) {
        const local = await cancionesPorMomentoOffline(momento!);
        setResultados(local);
      } else {
        setResultados(data as unknown as ResultadoBusqueda[]);
      }
      setLoading(false);
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, [momento]);

  return { resultados, loading };
}
