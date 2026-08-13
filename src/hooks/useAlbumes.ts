import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { albumesOffline } from '../lib/offlineQueries';

export interface AlbumConConteo {
  id: string;
  titulo: string;
  volumen: number | null;
  anio: number | null;
  caratula_url: string | null;
  num_canciones: number | null;
  conteo_real: number;
}

export function useAlbumes() {
  const [albumes, setAlbumes] = useState<AlbumConConteo[]>([]);
  const [totalCancioneros, setTotalCancioneros] = useState(0);
  const [totalCanciones, setTotalCanciones] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      if (!navigator.onLine) {
        const local = await albumesOffline();
        if (!cancelado) {
          setAlbumes(local as AlbumConConteo[]);
          setTotalCancioneros(local.length);
          setTotalCanciones(local.reduce((acc, a) => acc + a.conteo_real, 0));
          setLoading(false);
        }
        return;
      }

      const [cancionerosRes, cancionesRes] = await Promise.all([
        supabase
          .from('cancioneros')
          .select('id, titulo, volumen, anio, caratula_url, num_canciones')
          .order('volumen', { ascending: false, nullsFirst: false }),
        supabase.from('canciones').select('cancionero_id'),
      ]);

      if (cancelado) return;

      if (cancionerosRes.error) {
        const local = await albumesOffline();
        setAlbumes(local as AlbumConConteo[]);
        setTotalCancioneros(local.length);
        setTotalCanciones(local.reduce((acc, a) => acc + a.conteo_real, 0));
        setLoading(false);
        return;
      }

      const conteoPorAlbum = new Map<string, number>();
      for (const row of (cancionesRes.data ?? []) as { cancionero_id: string | null }[]) {
        if (!row.cancionero_id) continue;
        conteoPorAlbum.set(row.cancionero_id, (conteoPorAlbum.get(row.cancionero_id) ?? 0) + 1);
      }

      const conAlbumes = (cancionerosRes.data ?? []).map((c) => ({
        ...c,
        conteo_real: conteoPorAlbum.get(c.id) ?? 0,
      }));

      setAlbumes(conAlbumes as AlbumConConteo[]);
      setTotalCancioneros(cancionerosRes.data?.length ?? 0);
      setTotalCanciones(cancionesRes.data?.length ?? 0);
      setLoading(false);
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  return { albumes, totalCancioneros, totalCanciones, loading };
}
