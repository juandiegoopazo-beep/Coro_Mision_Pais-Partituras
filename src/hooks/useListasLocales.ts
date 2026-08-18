import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  getFavoritos,
  getRepertorios,
  getRepertorioActivoId,
  getOCrearRepertorioActivo,
  suscribirCambiosListas,
  type Repertorio,
} from '../lib/listasLocales';

export function useFavoritosIds(): number[] {
  const [ids, setIds] = useState<number[]>(() => getFavoritos());
  useEffect(() => suscribirCambiosListas(() => setIds(getFavoritos())), []);
  return ids;
}

/** Todos los repertorios guardados, reactivos a cambios. */
export function useRepertorios(): Repertorio[] {
  const [lista, setLista] = useState<Repertorio[]>(() => getRepertorios());
  useEffect(() => suscribirCambiosListas(() => setLista(getRepertorios())), []);
  return lista;
}

/** El id del repertorio activo (el que usa el botón + rápido). */
export function useRepertorioActivoId(): string | null {
  const [id, setId] = useState<string | null>(() => getRepertorioActivoId());
  useEffect(() => suscribirCambiosListas(() => setId(getRepertorioActivoId())), []);
  return id;
}

/** Ids de canción del repertorio activo (crea uno por defecto si no hay ninguno). */
export function useRepertorioIds(): number[] {
  const [ids, setIds] = useState<number[]>(() => getOCrearRepertorioActivo().cancionIds);
  useEffect(
    () => suscribirCambiosListas(() => setIds(getOCrearRepertorioActivo().cancionIds)),
    []
  );
  return ids;
}

export interface CancionListado {
  id: number;
  titulo: string;
  pagina: number | null;
  cancionero?: { titulo: string } | null;
}

/** Trae título/página/cancionero para un set de ids, preservando el orden dado. */
export function useCancionesPorIds(ids: number[]) {
  const [canciones, setCanciones] = useState<CancionListado[]>([]);
  const [loading, setLoading] = useState(false);
  const clave = ids.join(',');

  useEffect(() => {
    if (ids.length === 0) {
      setCanciones([]);
      return;
    }
    let cancelado = false;
    setLoading(true);
    supabase
      .from('canciones')
      .select('id, titulo, pagina, cancionero:cancioneros(titulo)')
      .in('id', ids)
      .then(({ data }) => {
        if (cancelado) return;
        const porId = new Map((data ?? []).map((c: any) => [c.id, c]));
        setCanciones(ids.map((id) => porId.get(id)).filter(Boolean) as CancionListado[]);
        setLoading(false);
      });
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  return { canciones, loading };
}
