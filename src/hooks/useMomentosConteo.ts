import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { momentosConteoOffline } from '../lib/offlineQueries';

const ORDEN_MOMENTOS = [
  'Entrada',
  'Perdón',
  'Gloria',
  'Salmo',
  'Aleluya',
  'Ofertorio',
  'Santo',
  'Cordero',
  'Comunión',
  'Salida / María',
  'Adoración',
  'Espíritu Santo',
  'Adviento',
  'Navidad',
  'Himnos',
  'Otros',
];

export interface MomentoConteo {
  momento: string;
  cantidad: number;
}

function ordenar(conteo: Map<string, number>): MomentoConteo[] {
  const ordenados = ORDEN_MOMENTOS.filter((m) => conteo.has(m)).map((m) => ({
    momento: m,
    cantidad: conteo.get(m)!,
  }));
  for (const [m, n] of conteo) {
    if (!ORDEN_MOMENTOS.includes(m)) ordenados.push({ momento: m, cantidad: n });
  }
  return ordenados;
}

export function useMomentosConteo() {
  const [momentos, setMomentos] = useState<MomentoConteo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      if (!navigator.onLine) {
        const conteo = await momentosConteoOffline();
        if (!cancelado) {
          setMomentos(ordenar(conteo));
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from('canciones')
        .select('momento_liturgico')
        .not('momento_liturgico', 'is', null);

      if (cancelado) return;

      if (error || !data) {
        const conteo = await momentosConteoOffline();
        setMomentos(ordenar(conteo));
        setLoading(false);
        return;
      }

      const conteo = new Map<string, number>();
      for (const row of data as { momento_liturgico: string }[]) {
        conteo.set(row.momento_liturgico, (conteo.get(row.momento_liturgico) ?? 0) + 1);
      }
      setMomentos(ordenar(conteo));
      setLoading(false);
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  return { momentos, loading };
}
