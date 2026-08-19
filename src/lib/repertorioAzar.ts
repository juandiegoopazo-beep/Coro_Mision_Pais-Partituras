import { supabase } from './supabase';

export interface CancionParaElegir {
  id: number;
  titulo: string;
  cancionero?: { titulo: string } | null;
}

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Busca canciones dentro de un momento litúrgico específico. */
export async function buscarEnMomento(
  momento: string,
  query: string
): Promise<CancionParaElegir[]> {
  let consulta = supabase
    .from('canciones')
    .select('id, titulo, cancionero:cancioneros(titulo)')
    .eq('momento_liturgico', momento)
    .order('titulo')
    .limit(60);

  const texto = query.trim();
  if (texto.length >= 1) {
    const normalizado = normalizar(texto);
    consulta = consulta.or(`texto_busqueda.ilike.%${normalizado}%,titulo.ilike.%${texto}%`);
  }

  const { data } = await consulta;
  return (data ?? []) as unknown as CancionParaElegir[];
}

/** Elige una canción al azar dentro de un momento litúrgico, evitando repetir las ya usadas si se puede. */
export async function elegirAlAzarEnMomento(
  momento: string,
  evitarIds: number[] = []
): Promise<number | null> {
  const { data } = await supabase.from('canciones').select('id').eq('momento_liturgico', momento);
  const pool = (data ?? []).map((r) => r.id as number);
  if (pool.length === 0) return null;

  const sinRepetir = pool.filter((id) => !evitarIds.includes(id));
  const candidatos = sinRepetir.length > 0 ? sinRepetir : pool;
  return candidatos[Math.floor(Math.random() * candidatos.length)];
}
