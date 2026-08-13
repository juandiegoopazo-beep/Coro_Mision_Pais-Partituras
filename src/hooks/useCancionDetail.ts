import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { cancionPorIdOffline } from '../lib/offlineQueries';
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

    async function cargar() {
      if (!navigator.onLine) {
        const local = await cancionPorIdOffline(id!);
        if (!cancelado) {
          setCancion(local);
          if (!local) setError('Sin conexión y esta canción no está guardada localmente.');
          setLoading(false);
        }
        return;
      }

      const { data, error: err } = await supabase
        .from('canciones')
        .select(
          `*, cancionero:cancioneros(id, titulo, pdf_url, hoja_offset, autor),
           partitura_archivos(id, voz, pdf_url, fuente, orden)`
        )
        .eq('id', id)
        .single();

      if (cancelado) return;

      if (err) {
        const local = await cancionPorIdOffline(id!);
        if (local) {
          setCancion(local);
          setError(null);
        } else {
          setError(err.message);
          setCancion(null);
        }
      } else {
        setCancion(data as unknown as CancionConCancionero);
      }
      setLoading(false);
    }

    cargar();

    return () => {
      cancelado = true;
    };
  }, [id]);

  return { cancion, loading, error };
}
