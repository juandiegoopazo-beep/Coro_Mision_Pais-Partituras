/**
 * Favoritos y Repertorios, guardados en localStorage. No requieren cuenta
 * ni backend — son locales al navegador del usuario.
 */

const CLAVE_FAVORITOS = 'cmp:favoritos';
const CLAVE_REPERTORIOS = 'cmp:repertorios';
const CLAVE_REPERTORIO_ACTIVO = 'cmp:repertorio-activo';
const CLAVE_REPERTORIO_LEGADO = 'cmp:repertorio'; // versión anterior, un solo repertorio
const EVENTO_CAMBIO = 'cmp:listas-cambiaron';

export interface Repertorio {
  id: string;
  nombre: string;
  cancionIds: number[];
  creado: string;
}

function leerJson<T>(clave: string, porDefecto: T): T {
  try {
    const raw = localStorage.getItem(clave);
    if (!raw) return porDefecto;
    return JSON.parse(raw) as T;
  } catch {
    return porDefecto;
  }
}

function escribirJson(clave: string, valor: unknown) {
  localStorage.setItem(clave, JSON.stringify(valor));
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

function nuevoId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// --- Favoritos ---

export function getFavoritos(): number[] {
  return leerJson<number[]>(CLAVE_FAVORITOS, []);
}

export function esFavorito(id: number): boolean {
  return getFavoritos().includes(id);
}

export function toggleFavorito(id: number) {
  const actuales = getFavoritos();
  const nuevo = actuales.includes(id) ? actuales.filter((x) => x !== id) : [...actuales, id];
  escribirJson(CLAVE_FAVORITOS, nuevo);
}

// --- Repertorios (varios, con nombre) ---

function migrarRepertorioLegadoSiExiste(): Repertorio[] {
  const legado = leerJson<number[] | null>(CLAVE_REPERTORIO_LEGADO, null);
  if (legado && legado.length > 0) {
    const migrado: Repertorio = {
      id: nuevoId(),
      nombre: 'Mi repertorio',
      cancionIds: legado,
      creado: new Date().toISOString(),
    };
    localStorage.removeItem(CLAVE_REPERTORIO_LEGADO);
    return [migrado];
  }
  return [];
}

export function getRepertorios(): Repertorio[] {
  const existentes = leerJson<Repertorio[] | null>(CLAVE_REPERTORIOS, null);
  if (existentes) return existentes;
  const migrados = migrarRepertorioLegadoSiExiste();
  if (migrados.length > 0) {
    escribirJson(CLAVE_REPERTORIOS, migrados);
    escribirJson(CLAVE_REPERTORIO_ACTIVO, migrados[0].id);
  }
  return migrados;
}

function guardarRepertorios(lista: Repertorio[]) {
  escribirJson(CLAVE_REPERTORIOS, lista);
}

export function getRepertorioActivoId(): string | null {
  const id = leerJson<string | null>(CLAVE_REPERTORIO_ACTIVO, null);
  const lista = getRepertorios();
  if (id && lista.some((r) => r.id === id)) return id;
  return lista[0]?.id ?? null;
}

export function setRepertorioActivo(id: string) {
  escribirJson(CLAVE_REPERTORIO_ACTIVO, id);
}

/** Devuelve el repertorio activo, creando uno por defecto si no hay ninguno. */
export function getOCrearRepertorioActivo(): Repertorio {
  let lista = getRepertorios();
  let activoId = getRepertorioActivoId();
  if (!activoId || lista.length === 0) {
    const nuevo: Repertorio = {
      id: nuevoId(),
      nombre: 'Mi repertorio',
      cancionIds: [],
      creado: new Date().toISOString(),
    };
    lista = [...lista, nuevo];
    guardarRepertorios(lista);
    setRepertorioActivo(nuevo.id);
    return nuevo;
  }
  return lista.find((r) => r.id === activoId)!;
}

export function crearRepertorio(nombre: string): Repertorio {
  const nuevo: Repertorio = {
    id: nuevoId(),
    nombre: nombre.trim() || 'Repertorio sin nombre',
    cancionIds: [],
    creado: new Date().toISOString(),
  };
  const lista = [...getRepertorios(), nuevo];
  guardarRepertorios(lista);
  setRepertorioActivo(nuevo.id);
  return nuevo;
}

export function renombrarRepertorio(id: string, nombre: string) {
  const lista = getRepertorios().map((r) =>
    r.id === id ? { ...r, nombre: nombre.trim() || r.nombre } : r
  );
  guardarRepertorios(lista);
}

export function eliminarRepertorio(id: string) {
  const lista = getRepertorios().filter((r) => r.id !== id);
  guardarRepertorios(lista);
  if (getRepertorioActivoId() === id) {
    setRepertorioActivo(lista[0]?.id ?? '');
  }
}

function actualizarRepertorio(id: string, fn: (r: Repertorio) => Repertorio) {
  const lista = getRepertorios().map((r) => (r.id === id ? fn(r) : r));
  guardarRepertorios(lista);
}

export function estaEnRepertorio(cancionId: number, repertorioId?: string): boolean {
  const id = repertorioId ?? getOCrearRepertorioActivo().id;
  const r = getRepertorios().find((x) => x.id === id);
  return r ? r.cancionIds.includes(cancionId) : false;
}

export function agregarARepertorio(cancionId: number, repertorioId?: string) {
  const id = repertorioId ?? getOCrearRepertorioActivo().id;
  actualizarRepertorio(id, (r) =>
    r.cancionIds.includes(cancionId) ? r : { ...r, cancionIds: [...r.cancionIds, cancionId] }
  );
}

export function quitarDeRepertorio(cancionId: number, repertorioId?: string) {
  const id = repertorioId ?? getOCrearRepertorioActivo().id;
  actualizarRepertorio(id, (r) => ({
    ...r,
    cancionIds: r.cancionIds.filter((x) => x !== cancionId),
  }));
}

export function moverEnRepertorio(repertorioId: string, cancionId: number, direccion: -1 | 1) {
  actualizarRepertorio(repertorioId, (r) => {
    const i = r.cancionIds.indexOf(cancionId);
    const j = i + direccion;
    if (i === -1 || j < 0 || j >= r.cancionIds.length) return r;
    const copia = [...r.cancionIds];
    [copia[i], copia[j]] = [copia[j], copia[i]];
    return { ...r, cancionIds: copia };
  });
}

export function limpiarRepertorio(repertorioId: string) {
  actualizarRepertorio(repertorioId, (r) => ({ ...r, cancionIds: [] }));
}
