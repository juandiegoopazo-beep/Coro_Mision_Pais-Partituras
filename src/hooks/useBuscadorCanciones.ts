import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { ResultadoBusqueda } from '../types/cancionero';

export function useBuscadorCanciones(query: string) {
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const texto = query.trim();
    if (texto.length < 2) {
      setResultados([]);
      return;
    }

    let cancelado = false;
    setLoading(true);
    setError(null);

    const normalizado = texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const timeout = setTimeout(() => {
      supabase
        .from('canciones')
        .select('id, titulo, formato, momento_liturgico, cancionero_id, cancionero:cancioneros(titulo)')
        .or(`texto_busqueda.ilike.%${normalizado}%,titulo.ilike.%${texto}%`)
        .order('titulo')
        .limit(50)
        .then(({ data, error: err }) => {
          if (cancelado) return;
          if (err) {
            setError(err.message);
            setResultados([]);
          } else {
            setResultados((data ?? []) as unknown as ResultadoBusqueda[]);
          }
          setLoading(false);
        });
    }, 250);

    return () => {
      cancelado = true;
      clearTimeout(timeout);
    };
  }, [query]);

  return { resultados, loading, error };
}
