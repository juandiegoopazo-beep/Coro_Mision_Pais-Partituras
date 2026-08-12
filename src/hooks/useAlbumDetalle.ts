import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { ResultadoBusqueda } from '../types/cancionero';
import type { AlbumConConteo } from './useAlbumes';

export function useAlbumDetalle(id: string | undefined) {
  const [album, setAlbum] = useState<AlbumConConteo | null>(null);
  const [canciones, setCanciones] = useState<ResultadoBusqueda[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelado = false;
    setLoading(true);

    Promise.all([
      supabase
        .from('cancioneros')
        .select('id, titulo, volumen, anio, caratula_url, num_canciones')
        .eq('id', id)
        .single(),
      supabase
        .from('canciones')
        .select('id, titulo, formato, momento_liturgico, cancionero_id, numero_original')
        .eq('cancionero_id', id)
        .order('numero_original', { ascending: true, nullsFirst: false }),
    ]).then(([albumRes, cancionesRes]) => {
      if (cancelado) return;
      setAlbum(
        albumRes.data ? { ...albumRes.data, conteo_real: cancionesRes.data?.length ?? 0 } : null
      );
      setCanciones((cancionesRes.data ?? []) as unknown as ResultadoBusqueda[]);
      setLoading(false);
    });

    return () => {
      cancelado = true;
    };
  }, [id]);

  return { album, canciones, loading };
}
