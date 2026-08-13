import { supabase } from './supabase';
import {
  guardarCancionesOffline,
  guardarCancionerosOffline,
  guardarUltimaSincronizacion,
} from './offlineDb';

export interface ProgresoSincronizacion {
  etapa: 'cancioneros' | 'canciones' | 'listo';
  cargadas: number;
  total: number | null;
}

/**
 * Descarga todas las canciones y cancioneros a IndexedDB para uso sin
 * conexión. No incluye los PDFs (partituras/cancioneros) — esos siguen
 * necesitando internet por ahora, dado su tamaño.
 */
export async function sincronizarOffline(
  onProgreso?: (p: ProgresoSincronizacion) => void
): Promise<{ canciones: number; cancioneros: number }> {
  onProgreso?.({ etapa: 'cancioneros', cargadas: 0, total: null });

  const { data: cancioneros, error: errCancioneros } = await supabase
    .from('cancioneros')
    .select('*');
  if (errCancioneros) throw errCancioneros;
  await guardarCancionerosOffline(cancioneros ?? []);

  // trae las canciones por páginas para no reventar la memoria/el límite
  // de una sola respuesta si la tabla sigue creciendo
  const TAMANO_PAGINA = 500;
  let desde = 0;
  let todas: any[] = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data, error } = await supabase
      .from('canciones')
      .select('*, cancionero:cancioneros(titulo), partitura_archivos(id, voz, pdf_url, fuente, orden)')
      .range(desde, desde + TAMANO_PAGINA - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    todas = todas.concat(data);
    onProgreso?.({ etapa: 'canciones', cargadas: todas.length, total: null });
    if (data.length < TAMANO_PAGINA) break;
    desde += TAMANO_PAGINA;
  }

  await guardarCancionesOffline(todas);
  await guardarUltimaSincronizacion(new Date().toISOString());

  onProgreso?.({ etapa: 'listo', cargadas: todas.length, total: todas.length });

  return { canciones: todas.length, cancioneros: cancioneros?.length ?? 0 };
}
