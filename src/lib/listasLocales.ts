// src/lib/listasLocales.ts
import type { Cancion } from '../types/cancionero';

export interface SlotRepertorio {
  cancionId: number | null;
  fijada: boolean;
}

export interface RepertorioItem {
  id: string;
  nombre: string;
  slots: Record<string, SlotRepertorio>;
  fechaCreacion?: string;
}

export interface ListaCanciones {
  id: string;
  nombre: string;
  canciones: Cancion[];
}

export const PARTES_MISA = [
  { momento: 'Entrada', etiqueta: 'Entrada' },
  { momento: 'Perdón', etiqueta: 'Perdón' },
  { momento: 'Gloria', etiqueta: 'Gloria' },
  { momento: 'Salmo', etiqueta: 'Salmo' },
  { momento: 'Aleluya', etiqueta: 'Aleluya' },
  { momento: 'Ofertorio', etiqueta: 'Ofertorio' },
  { momento: 'Santo', etiqueta: 'Santo' },
  { momento: 'Cordero', etiqueta: 'Cordero' },
  { momento: 'Comunión', etiqueta: 'Comunión' },
  { momento: 'Salida / María', etiqueta: 'Salida / María' },
];

const STORAGE_KEY_FAVORITOS = 'cmp_favoritos';
const STORAGE_KEY_REPERTORIOS = 'cmp_repertorios';
const STORAGE_KEY_REPERTORIO_ACTIVO = 'cmp_repertorio_activo';
const STORAGE_KEY_LISTAS = 'cmp_listas_canciones';

function notificarCambio() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cmp_listas_change'));
  }
}

// ---------------- FAVORITOS ----------------

export function getFavoritos(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FAVORITOS);
    if (!raw) return [];
    return JSON.parse(raw) as number[];
  } catch (error) {
    console.error('Error leyendo favoritos locales', error);
    return [];
  }
}

function saveFavoritos(favs: number[]) {
  try {
    localStorage.setItem(STORAGE_KEY_FAVORITOS, JSON.stringify(favs));
    notificarCambio();
  } catch (error) {
    console.error('Error guardando favoritos', error);
  }
}

export function esFavorito(id: number): boolean {
  return getFavoritos().includes(id);
}

export function toggleFavorito(id: number): boolean {
  const favs = getFavoritos();
  const index = favs.indexOf(id);
  let nuevoEstado = false;
  if (index >= 0) {
    favs.splice(index, 1);
  } else {
    favs.push(id);
    nuevoEstado = true;
  }
  saveFavoritos(favs);
  return nuevoEstado;
}

export function agregarAFavoritos(id: number) {
  const favs = getFavoritos();
  if (!favs.includes(id)) {
    favs.push(id);
    saveFavoritos(favs);
  }
}

export function quitarDeFavoritos(id: number) {
  const favs = getFavoritos().filter((f) => f !== id);
  saveFavoritos(favs);
}

// ---------------- REPERTORIOS ----------------

function crearSlotsIniciales(): Record<string, SlotRepertorio> {
  const slots: Record<string, SlotRepertorio> = {};
  for (const parte of PARTES_MISA) {
    slots[parte.momento] = { cancionId: null, fijada: false };
  }
  return slots;
}

export function getRepertorios(): RepertorioItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REPERTORIOS);
    if (!raw) {
      const defaultItem: RepertorioItem = {
        id: 'principal',
        nombre: 'Misa domingo',
        slots: crearSlotsIniciales(),
      };
      const inicial = [defaultItem];
      localStorage.setItem(STORAGE_KEY_REPERTORIOS, JSON.stringify(inicial));
      return inicial;
    }
    return JSON.parse(raw) as RepertorioItem[];
  } catch (error) {
    console.error('Error leyendo repertorios', error);
    return [];
  }
}

function saveRepertorios(items: RepertorioItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY_REPERTORIOS, JSON.stringify(items));
    notificarCambio();
  } catch (error) {
    console.error('Error guardando repertorios', error);
  }
}

export function getRepertorioActivoId(): string {
  const repertorios = getRepertorios();
  try {
    const guardado = localStorage.getItem(STORAGE_KEY_REPERTORIO_ACTIVO);
    if (guardado && repertorios.some((r) => r.id === guardado)) {
      return guardado;
    }
  } catch (error) {
    console.error('Error leyendo repertorio activo', error);
  }
  return repertorios[0]?.id ?? 'principal';
}

export function setRepertorioActivo(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY_REPERTORIO_ACTIVO, id);
    notificarCambio();
  } catch (error) {
    console.error('Error fijando repertorio activo', error);
  }
}

export function crearRepertorio(nombre: string): RepertorioItem[] {
  const repertorios = getRepertorios();
  const nuevo: RepertorioItem = {
    id: Date.now().toString(),
    nombre: nombre.trim() || 'Nuevo repertorio',
    slots: crearSlotsIniciales(),
  };
  repertorios.push(nuevo);
  saveRepertorios(repertorios);
  setRepertorioActivo(nuevo.id);
  return repertorios;
}

export function renombrarRepertorio(id: string, nuevoNombre: string): RepertorioItem[] {
  const repertorios = getRepertorios();
  const index = repertorios.findIndex((r) => r.id === id);
  if (index >= 0) {
    repertorios[index].nombre = nuevoNombre.trim();
    saveRepertorios(repertorios);
  }
  return repertorios;
}

export function eliminarRepertorio(id: string): RepertorioItem[] {
  let repertorios = getRepertorios().filter((r) => r.id !== id);
  if (repertorios.length === 0) {
    repertorios = [
      {
        id: 'principal',
        nombre: 'Misa domingo',
        slots: crearSlotsIniciales(),
      },
    ];
  }
  saveRepertorios(repertorios);
  const activo = getRepertorioActivoId();
  if (activo === id) {
    setRepertorioActivo(repertorios[0].id);
  }
  return repertorios;
}

export function getSlotsRepertorio(repertorioId?: string | null): Record<string, SlotRepertorio> {
  const reps = getRepertorios();
  const targetId = repertorioId || getRepertorioActivoId();
  const found = reps.find((r) => r.id === targetId);
  return found?.slots ?? crearSlotsIniciales();
}

function updateSlot(
  repertorioId: string,
  momento: string,
  modifier: (prev: SlotRepertorio) => SlotRepertorio
) {
  const reps = getRepertorios();
  const target = reps.find((r) => r.id === repertorioId);
  if (target) {
    if (!target.slots) target.slots = crearSlotsIniciales();
    const prev = target.slots[momento] ?? { cancionId: null, fijada: false };
    target.slots[momento] = modifier(prev);
    saveRepertorios(reps);
  }
}

export function elegirEnSlot(repertorioId: string, momento: string, cancionId: number) {
  updateSlot(repertorioId, momento, (prev) => ({ ...prev, cancionId }));
}

export function toggleFijarSlot(repertorioId: string, momento: string) {
  updateSlot(repertorioId, momento, (prev) => ({ ...prev, fijada: !prev.fijada }));
}

export function vaciarSlot(repertorioId: string, momento: string) {
  updateSlot(repertorioId, momento, () => ({ cancionId: null, fijada: false }));
}

export function limpiarTodosLosSlots(repertorioId: string) {
  const reps = getRepertorios();
  const target = reps.find((r) => r.id === repertorioId);
  if (target) {
    target.slots = crearSlotsIniciales();
    saveRepertorios(reps);
  }
}

export function aplicarSorteo(
  repertorioId: string,
  resultado: Record<string, number | null>
) {
  const reps = getRepertorios();
  const target = reps.find((r) => r.id === repertorioId);
  if (target) {
    if (!target.slots) target.slots = crearSlotsIniciales();
    for (const [momento, cancionId] of Object.entries(resultado)) {
      if (!target.slots[momento]) {
        target.slots[momento] = { cancionId, fijada: false };
      } else if (!target.slots[momento].fijada) {
        target.slots[momento].cancionId = cancionId;
      }
    }
    saveRepertorios(reps);
  }
}

export function idsDesdeSlots(slots: Record<string, SlotRepertorio> | null | undefined): number[] {
  if (!slots) return [];
  const ids: number[] = [];
  for (const slot of Object.values(slots)) {
    if (slot && slot.cancionId != null && !ids.includes(slot.cancionId)) {
      ids.push(slot.cancionId);
    }
  }
  return ids;
}

export function getRepertorioIds(): number[] {
  const slots = getSlotsRepertorio();
  return idsDesdeSlots(slots);
}

export function estaEnRepertorio(id: number): boolean {
  return getRepertorioIds().includes(id);
}

export function agregarARepertorio(id: number, repertorioId?: string) {
  const reps = getRepertorios();
  const targetId = repertorioId || getRepertorioActivoId();
  const target = reps.find((r) => r.id === targetId);
  if (!target) return;
  if (!target.slots) target.slots = crearSlotsIniciales();

  // Buscar primer slot vacío
  for (const parte of PARTES_MISA) {
    const slot = target.slots[parte.momento];
    if (!slot || slot.cancionId == null) {
      target.slots[parte.momento] = { cancionId: id, fijada: false };
      saveRepertorios(reps);
      return;
    }
  }
}

export function quitarDeRepertorio(id: number, repertorioId?: string) {
  const reps = getRepertorios();
  const targetId = repertorioId || getRepertorioActivoId();
  const target = reps.find((r) => r.id === targetId);
  if (!target || !target.slots) return;

  for (const momento of Object.keys(target.slots)) {
    if (target.slots[momento]?.cancionId === id) {
      target.slots[momento] = { cancionId: null, fijada: false };
    }
  }
  saveRepertorios(reps);
}

// ---------------- LISTAS DE REPRODUCCIÓN PERSONALIZADAS ----------------

export function getListas(): ListaCanciones[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LISTAS);
    if (!raw) return [];
    return JSON.parse(raw) as ListaCanciones[];
  } catch (error) {
    console.error('Error leyendo listas locales', error);
    return [];
  }
}

function saveListas(listas: ListaCanciones[]) {
  try {
    localStorage.setItem(STORAGE_KEY_LISTAS, JSON.stringify(listas));
    notificarCambio();
  } catch (error) {
    console.error('Error guardando listas locales', error);
  }
}

export function crearLista(nombre: string): ListaCanciones[] {
  const listas = getListas();
  const nuevaLista: ListaCanciones = {
    id: Date.now().toString(),
    nombre,
    canciones: [],
  };
  listas.push(nuevaLista);
  saveListas(listas);
  return listas;
}

export function eliminarLista(listaId: string): ListaCanciones[] {
  const listas = getListas().filter((l) => l.id !== listaId);
  saveListas(listas);
  return listas;
}

export function addToLista(listaId: string, cancion: Cancion): ListaCanciones[] {
  const listas = getListas();
  const lista = listas.find((l) => l.id === listaId);
  if (lista && !lista.canciones.find((c) => c.id === cancion.id)) {
    lista.canciones.push(cancion);
    saveListas(listas);
  }
  return listas;
}

export function removeFromLista(listaId: string, cancionId: number | string): ListaCanciones[] {
  const listas = getListas();
  const lista = listas.find((l) => l.id === listaId);
  if (lista) {
    lista.canciones = lista.canciones.filter((c) => String(c.id) !== String(cancionId));
    saveListas(listas);
  }
  return listas;
}

export function getAllSavedSongs(): Cancion[] {
  const listas = getListas();
  const allSongs = listas.flatMap((l) => l.canciones);
  const seen = new Set<number>();
  const uniqueSongs: Cancion[] = [];
  for (const song of allSongs) {
    if (!seen.has(song.id)) {
      seen.add(song.id);
      uniqueSongs.push(song);
    }
  }
  return uniqueSongs;
}
