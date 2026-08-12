import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
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
    supabase
      .from('canciones')
      .select('id, titulo, formato, momento_liturgico, cancionero_id, cancionero:cancioneros(titulo)')
      .eq('momento_liturgico', momento)
      .order('titulo')
      .then(({ data }) => {
        if (cancelado) return;
        setResultados((data ?? []) as unknown as ResultadoBusqueda[]);
        setLoading(false);
      });
    return () => {
      cancelado = true;
    };
  }, [momento]);

  return { resultados, loading };
}
