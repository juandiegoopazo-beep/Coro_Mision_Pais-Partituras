import { leerCancionesOffline, leerCancionerosOffline } from './offlineDb';
import type { ResultadoBusqueda, CancionConCancionero } from '../types/cancionero';

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export async function buscarOffline(query: string): Promise<ResultadoBusqueda[]> {
  const texto = normalizar(query.trim());
  const canciones = await leerCancionesOffline<any>();
  return canciones
    .filter(
      (c) =>
        (c.texto_busqueda && c.texto_busqueda.includes(texto)) ||
        normalizar(c.titulo ?? '').includes(texto)
    )
    .slice(0, 50)
    .map((c) => ({
      id: c.id,
      titulo: c.titulo,
      formato: c.formato,
      momento_liturgico: c.momento_liturgico,
      cancionero_id: c.cancionero_id,
      cancionero: c.cancionero,
    }));
}

export async function cancionPorIdOffline(id: number): Promise<CancionConCancionero | null> {
  const canciones = await leerCancionesOffline<any>();
  return canciones.find((c) => c.id === id) ?? null;
}

export async function cancionesPorMomentoOffline(momento: string): Promise<ResultadoBusqueda[]> {
  const canciones = await leerCancionesOffline<any>();
  return canciones
    .filter((c) => c.momento_liturgico === momento)
    .sort((a, b) => (a.titulo > b.titulo ? 1 : -1))
    .map((c) => ({
      id: c.id,
      titulo: c.titulo,
      formato: c.formato,
      momento_liturgico: c.momento_liturgico,
      cancionero_id: c.cancionero_id,
      cancionero: c.cancionero,
    }));
}

export async function albumesOffline() {
  const [cancioneros, canciones] = await Promise.all([
    leerCancionerosOffline<any>(),
    leerCancionesOffline<any>(),
  ]);
  const conteo = new Map<string, number>();
  for (const c of canciones) {
    if (!c.cancionero_id) continue;
    conteo.set(c.cancionero_id, (conteo.get(c.cancionero_id) ?? 0) + 1);
  }
  return cancioneros
    .map((c) => ({ ...c, conteo_real: conteo.get(c.id) ?? 0 }))
    .sort((a, b) => (b.volumen ?? 0) - (a.volumen ?? 0));
}

export async function momentosConteoOffline() {
  const canciones = await leerCancionesOffline<any>();
  const conteo = new Map<string, number>();
  for (const c of canciones) {
    if (!c.momento_liturgico) continue;
    conteo.set(c.momento_liturgico, (conteo.get(c.momento_liturgico) ?? 0) + 1);
  }
  return conteo;
}
