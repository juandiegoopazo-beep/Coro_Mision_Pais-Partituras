/**
 * Favoritos y Repertorio, guardados en localStorage (igual que el sitio
 * original de referencia). No requieren cuenta ni backend — son locales
 * al navegador del usuario. Si más adelante quieres que se sincronicen
 * entre dispositivos, se puede migrar a tablas en Supabase con auth.
 */

const CLAVE_FAVORITOS = 'cmp:favoritos';
const CLAVE_REPERTORIO = 'cmp:repertorio';
const EVENTO_CAMBIO = 'cmp:listas-cambiaron';

function leer(clave: string): number[] {
  try {
    const raw = localStorage.getItem(clave);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function escribir(clave: string, ids: number[]) {
  localStorage.setItem(clave, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent(EVENTO_CAMBIO, { detail: { clave } }));
}

export function suscribirCambiosListas(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(EVENTO_CAMBIO, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(EVENTO_CAMBIO, handler);
    window.removeEventListener('storage', handler);
  };
}

// --- Favoritos ---

export function getFavoritos(): number[] {
  return leer(CLAVE_FAVORITOS);
}

export function esFavorito(id: number): boolean {
  return getFavoritos().includes(id);
}

export function toggleFavorito(id: number) {
  const actuales = getFavoritos();
  const nuevo = actuales.includes(id)
    ? actuales.filter((x) => x !== id)
    : [...actuales, id];
  escribir(CLAVE_FAVORITOS, nuevo);
}

// --- Repertorio (con orden) ---

export function getRepertorio(): number[] {
  return leer(CLAVE_REPERTORIO);
}

export function estaEnRepertorio(id: number): boolean {
  return getRepertorio().includes(id);
}

export function agregarARepertorio(id: number) {
  const actuales = getRepertorio();
  if (actuales.includes(id)) return;
  escribir(CLAVE_REPERTORIO, [...actuales, id]);
}

export function quitarDeRepertorio(id: number) {
  escribir(
    CLAVE_REPERTORIO,
    getRepertorio().filter((x) => x !== id)
  );
}

export function moverEnRepertorio(id: number, direccion: -1 | 1) {
  const actuales = getRepertorio();
  const i = actuales.indexOf(id);
  const j = i + direccion;
  if (i === -1 || j < 0 || j >= actuales.length) return;
  const copia = [...actuales];
  [copia[i], copia[j]] = [copia[j], copia[i]];
  escribir(CLAVE_REPERTORIO, copia);
}

export function limpiarRepertorio() {
  escribir(CLAVE_REPERTORIO, []);
}
