import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

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

export function useMomentosConteo() {
  const [momentos, setMomentos] = useState<MomentoConteo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelado = false;
    supabase
      .from('canciones')
      .select('momento_liturgico')
      .not('momento_liturgico', 'is', null)
      .then(({ data }) => {
        if (cancelado || !data) return;
        const conteo = new Map<string, number>();
        for (const row of data as { momento_liturgico: string }[]) {
          conteo.set(row.momento_liturgico, (conteo.get(row.momento_liturgico) ?? 0) + 1);
        }
        const ordenados = ORDEN_MOMENTOS.filter((m) => conteo.has(m)).map((m) => ({
          momento: m,
          cantidad: conteo.get(m)!,
        }));
        // agrega cualquier momento no contemplado en el orden fijo, al final
        for (const [m, n] of conteo) {
          if (!ORDEN_MOMENTOS.includes(m)) ordenados.push({ momento: m, cantidad: n });
        }
        setMomentos(ordenados);
        setLoading(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  return { momentos, loading };
}
