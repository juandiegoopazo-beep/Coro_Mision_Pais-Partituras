// src/hooks/useListasLocales.ts
import { useState, useEffect, useCallback } from 'react';
import type { Cancion } from '../types/cancionero';
import { supabase } from '../lib/supabase';
import { leerCancionesOffline } from '../lib/offlineDb';
import {
  getFavoritos,
  getRepertorios,
  getRepertorioActivoId,
  getSlotsRepertorio,
  getRepertorioIds,
  getListas,
  crearLista,
  eliminarLista,
  addToLista,
  removeFromLista,
  type SlotRepertorio,
  type RepertorioItem,
  type ListaCanciones,
} from '../lib/listasLocales';

export interface CancionListado {
  id: number;
  titulo: string;
  pagina?: number | null;
  cancionero?: { titulo: string } | null;
  formato?: string;
}

export function useFavoritosIds(): number[] {
  const [favoritos, setFavoritos] = useState<number[]>(() => getFavoritos());

  useEffect(() => {
    const handleUpdate = () => {
      setFavoritos(getFavoritos());
    };
    window.addEventListener('cmp_listas_change', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('cmp_listas_change', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return favoritos;
}

export function useRepertorioIds(): number[] {
  const [ids, setIds] = useState<number[]>(() => getRepertorioIds());

  useEffect(() => {
    const handleUpdate = () => {
      setIds(getRepertorioIds());
    };
    window.addEventListener('cmp_listas_change', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('cmp_listas_change', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return ids;
}

export function useRepertorios(): RepertorioItem[] {
  const [repertorios, setRepertorios] = useState<RepertorioItem[]>(() => getRepertorios());

  useEffect(() => {
    const handleUpdate = () => {
      setRepertorios(getRepertorios());
    };
    window.addEventListener('cmp_listas_change', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('cmp_listas_change', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return repertorios;
}

export function useRepertorioActivoId(): string {
  const [activoId, setActivoId] = useState<string>(() => getRepertorioActivoId());

  useEffect(() => {
    const handleUpdate = () => {
      setActivoId(getRepertorioActivoId());
    };
    window.addEventListener('cmp_listas_change', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('cmp_listas_change', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return activoId;
}

export function useSlotsRepertorio(repertorioId?: string | null): Record<string, SlotRepertorio> {
  const [slots, setSlots] = useState<Record<string, SlotRepertorio>>(() =>
    getSlotsRepertorio(repertorioId)
  );

  useEffect(() => {
    setSlots(getSlotsRepertorio(repertorioId));
    const handleUpdate = () => {
      setSlots(getSlotsRepertorio(repertorioId));
    };
    window.addEventListener('cmp_listas_change', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('cmp_listas_change', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [repertorioId]);

  return slots;
}

export function useCancionesPorIds(ids: number[]) {
  const [canciones, setCanciones] = useState<CancionListado[]>([]);
  const [loading, setLoading] = useState(false);

  const idsClave = ids.slice().sort().join(',');

  useEffect(() => {
    if (ids.length === 0) {
      setCanciones([]);
      setLoading(false);
      return;
    }

    let cancelado = false;
    setLoading(true);

    async function cargar() {
      if (!navigator.onLine) {
        try {
          const offline = await leerCancionesOffline<any>();
          const idSet = new Set(ids);
          const filtradas = offline.filter((c) => idSet.has(c.id));
          if (!cancelado) {
            setCanciones(
              filtradas.map((c) => ({
                id: c.id,
                titulo: c.titulo,
                pagina: c.pagina,
                cancionero: c.cancionero,
                formato: c.formato,
              }))
            );
            setLoading(false);
          }
        } catch {
          if (!cancelado) setLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('canciones')
          .select('id, titulo, pagina, formato, cancionero:cancioneros(titulo)')
          .in('id', ids);

        if (cancelado) return;

        if (error || !data) {
          const offline = await leerCancionesOffline<any>();
          const idSet = new Set(ids);
          const filtradas = offline.filter((c) => idSet.has(c.id));
          setCanciones(
            filtradas.map((c) => ({
              id: c.id,
              titulo: c.titulo,
              pagina: c.pagina,
              cancionero: c.cancionero,
              formato: c.formato,
            }))
          );
        } else {
          setCanciones(data as unknown as CancionListado[]);
        }
      } catch {
        // Fallback
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, [idsClave]);

  return { canciones, loading };
}

export function useListasLocales() {
  const [listas, setListas] = useState<ListaCanciones[]>(() => getListas());

  const recargar = useCallback(() => {
    setListas(getListas());
  }, []);

  useEffect(() => {
    const handleUpdate = () => recargar();
    window.addEventListener('cmp_listas_change', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('cmp_listas_change', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [recargar]);

  const handleCrearLista = (nombre: string) => {
    const actualizadas = crearLista(nombre);
    setListas(actualizadas);
  };

  const handleEliminarLista = (listaId: string) => {
    const actualizadas = eliminarLista(listaId);
    setListas(actualizadas);
  };

  const toggleCancionEnLista = (listaId: string, cancion: Cancion) => {
    const lista = listas.find((l) => l.id === listaId);
    if (!lista) return;

    const exists = lista.canciones.some((c) => c.id === cancion.id);
    if (exists) {
      setListas(removeFromLista(listaId, cancion.id));
    } else {
      setListas(addToLista(listaId, cancion));
    }
  };

  const isFavoritoEnAlgunaLista = (cancionId: number | string) => {
    return listas.some((lista) => lista.canciones.some((c) => String(c.id) === String(cancionId)));
  };

  return {
    listas,
    crearLista: handleCrearLista,
    eliminarLista: handleEliminarLista,
    toggleCancionEnLista,
    isFavoritoEnAlgunaLista,
    recargar,
  };
}
