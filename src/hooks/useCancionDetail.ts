import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { CancionConCancionero } from '../types/cancionero';

export function useCancionDetail(id: number | null) {
  const [cancion, setCancion] = useState<CancionConCancionero | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id == null) {
      setCancion(null);
      setLoading(false);
      return;
    }

    let cancelado = false;
    setLoading(true);
    setError(null);

    supabase
      .from('canciones')
      .select('*, cancionero:cancioneros(id, titulo, pdf_url, hoja_offset, autor)')
      .eq('id', id)
      .single()
      .then(({ data, error: err }) => {
        if (cancelado) return;
        if (err) {
          setError(err.message);
          setCancion(null);
        } else {
          setCancion(data as unknown as CancionConCancionero);
        }
        setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [id]);

  return { cancion, loading, error };
}
