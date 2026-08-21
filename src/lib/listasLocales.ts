/**
 * Favoritos y Repertorios, guardados en localStorage. No requieren cuenta
 * ni backend — son locales al navegador del usuario.
 */

const CLAVE_FAVORITOS = 'cmp:favoritos'; // formato legado, se migra a Listas
const CLAVE_LISTAS = 'cmp:listas';
const ID_LISTA_FAVORITOS = 'favoritos';
const CLAVE_REPERTORIOS = 'cmp:repertorios';
const CLAVE_REPERTORIO_ACTIVO = 'cmp:repertorio-activo';
const CLAVE_REPERTORIO_LEGADO = 'cmp:repertorio'; // versión anterior, un solo repertorio
const EVENTO_CAMBIO = 'cmp:listas-cambiaron';

export interface Repertorio {
  id: string;
  nombre: string;
  cancionIds: number[];
  slots?: Record<string, SlotRepertorio>;
  creado: string;
}

export interface ListaCanciones {
  id: string;
  nombre: string;
  cancionIds: number[];
  esFavoritos?: boolean;
  creado: string;
}

export interface SlotRepertorio {
  cancionId: number | null;
  fijada: boolean;
}

/** Partes de la misa, en orden, y su momento_liturgico correspondiente. */
export const PARTES_MISA: { momento: string; etiqueta: string }[] = [
  { momento: 'Entrada', etiqueta: 'Entrada' },
  { momento: 'Perdón', etiqueta: 'Acto penitencial' },
  { momento: 'Gloria', etiqueta: 'Gloria' },
  { momento: 'Salmo', etiqueta: 'Salmo' },
  { momento: 'Aleluya', etiqueta: 'Aclamación / Aleluya' },
  { momento: 'Ofertorio', etiqueta: 'Ofertorio' },
  { momento: 'Santo', etiqueta: 'Santo' },
  { momento: 'Cordero', etiqueta: 'Cordero / Paz' },
  { momento: 'Comunión', etiqueta: 'Comunión' },
  { momento: 'Salida / María', etiqueta: 'Salida' },
];

function slotsVacios(): Record<string, SlotRepertorio> {
  const s: Record<string, SlotRepertorio> = {};
  for (const p of PARTES_MISA) s[p.momento] = { cancionId: null, fijada: false };
  return s;
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

// --- Listas (tipo playlists de Spotify: varias, con nombre, una canción puede estar en varias) ---

function migrarFavoritosLegadoSiExiste(): number[] {
  const legado = leerJson<number[] | null>(CLAVE_FAVORITOS, null);
  if (legado && legado.length > 0) {
    localStorage.removeItem(CLAVE_FAVORITOS);
    return legado;
  }
  return [];
}

/** Devuelve todas las listas, asegurando que siempre exista "Favoritos" (no eliminable). */
export function getListas(): ListaCanciones[] {
  const existentes = leerJson<ListaCanciones[] | null>(CLAVE_LISTAS, null);
  if (existentes && existentes.some((l) => l.id === ID_LISTA_FAVORITOS)) return existentes;

  const cancionesLegado = migrarFavoritosLegadoSiExiste();
  const favoritosBase: ListaCanciones = {
    id: ID_LISTA_FAVORITOS,
    nombre: 'Favoritos',
    cancionIds: cancionesLegado,
    esFavoritos: true,
    creado: new Date().toISOString(),
  };
  const lista = existentes ? [favoritosBase, ...existentes] : [favoritosBase];
  escribirJson(CLAVE_LISTAS, lista);
  return lista;
}

function guardarListas(lista: ListaCanciones[]) {
  escribirJson(CLAVE_LISTAS, lista);
}

export function crearLista(nombre: string): ListaCanciones {
  const nueva: ListaCanciones = {
    id: nuevoId(),
    nombre: nombre.trim() || 'Lista sin nombre',
    cancionIds: [],
    creado: new Date().toISOString(),
  };
  guardarListas([...getListas(), nueva]);
  return nueva;
}

export function renombrarLista(id: string, nombre: string) {
  const lista = getListas().map((l) => (l.id === id ? { ...l, nombre: nombre.trim() || l.nombre } : l));
  guardarListas(lista);
}

/** No permite eliminar la lista "Favoritos". */
export function eliminarLista(id: string) {
  if (id === ID_LISTA_FAVORITOS) return;
  guardarListas(getListas().filter((l) => l.id !== id));
}

function actualizarLista(id: string, fn: (l: ListaCanciones) => ListaCanciones) {
  guardarListas(getListas().map((l) => (l.id === id ? fn(l) : l)));
}

export function estaEnLista(listaId: string, cancionId: number): boolean {
  return getListas().find((l) => l.id === listaId)?.cancionIds.includes(cancionId) ?? false;
}

export function toggleEnLista(listaId: string, cancionId: number) {
  actualizarLista(listaId, (l) => ({
    ...l,
    cancionIds: l.cancionIds.includes(cancionId)
      ? l.cancionIds.filter((x) => x !== cancionId)
      : [...l.cancionIds, cancionId],
  }));
}

/** En qué listas (aparte de Favoritos) está una canción — para el selector "Agregar a lista". */
export function listasConCancion(cancionId: number): string[] {
  return getListas()
    .filter((l) => l.cancionIds.includes(cancionId))
    .map((l) => l.id);
}

// --- Favoritos: atajos sobre la lista especial "Favoritos" (compatibilidad) ---

export function esFavorito(id: number): boolean {
  return estaEnLista(ID_LISTA_FAVORITOS, id);
}

export function toggleFavorito(id: number) {
  toggleEnLista(ID_LISTA_FAVORITOS, id);
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

// --- Repertorio por partes de la misa ---

export function getSlots(repertorioId: string): Record<string, SlotRepertorio> {
  const r = getRepertorios().find((x) => x.id === repertorioId);
  return r?.slots ?? slotsVacios();
}

function actualizarSlot(
  repertorioId: string,
  momento: string,
  cambio: Partial<SlotRepertorio>
) {
  actualizarRepertorio(repertorioId, (r) => {
    const slots = { ...(r.slots ?? slotsVacios()) };
    slots[momento] = { ...(slots[momento] ?? { cancionId: null, fijada: false }), ...cambio };
    return { ...r, slots };
  });
}

/** Elige una canción específica para una parte (queda sin fijar). */
export function elegirEnSlot(repertorioId: string, momento: string, cancionId: number) {
  actualizarSlot(repertorioId, momento, { cancionId, fijada: false });
}

/** Fija (o desfija) lo que esté actualmente en esa parte, incluida una parte vacía. */
export function toggleFijarSlot(repertorioId: string, momento: string) {
  const slots = getSlots(repertorioId);
  const actual = slots[momento] ?? { cancionId: null, fijada: false };
  actualizarSlot(repertorioId, momento, { fijada: !actual.fijada });
}

/** Vacía una parte y la deja fijada así (para partes que no corresponden, ej. Gloria en día de semana). */
export function vaciarSlot(repertorioId: string, momento: string) {
  actualizarSlot(repertorioId, momento, { cancionId: null, fijada: true });
}

/** Vuelve a dejar todas las partes en blanco y sin fijar. */
export function limpiarTodosLosSlots(repertorioId: string) {
  actualizarRepertorio(repertorioId, (r) => ({ ...r, slots: slotsVacios() }));
}

/** Aplica un mapa completo de resultados de sorteo, respetando lo ya fijado. */
export function aplicarSorteo(repertorioId: string, resultado: Record<string, number | null>) {
  actualizarRepertorio(repertorioId, (r) => {
    const slots = { ...(r.slots ?? slotsVacios()) };
    for (const [momento, cancionId] of Object.entries(resultado)) {
      const actual = slots[momento] ?? { cancionId: null, fijada: false };
      if (actual.fijada) continue; // no toca lo fijado
      slots[momento] = { cancionId, fijada: false };
    }
    return { ...r, slots };
  });
}

/** Devuelve los ids de canción elegidos en las partes, en el orden de la misa. */
export function idsDesdeSlots(slots: Record<string, SlotRepertorio>): number[] {
  return PARTES_MISA.map((p) => slots[p.momento]?.cancionId)
    .filter((id): id is number => id != null);
}
