// src/lib/listasLocales.ts
import { CancionRow } from '../types/cancionero';

// Estructura de una lista
export interface ListaCanciones {
  id: string;
  nombre: string;
  canciones: CancionRow[];
}

const STORAGE_KEY = 'cmp_listas_canciones';

// Obtener todas las listas
export function getListas(): ListaCanciones[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ListaCanciones[];
  } catch (error) {
    console.error('Error leyendo listas locales', error);
    return [];
  }
}

// Guardar listas
function saveListas(listas: ListaCanciones[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(listas));
  } catch (error) {
    console.error('Error guardando listas locales', error);
  }
}

// Crear una nueva lista
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

// Eliminar una lista
export function eliminarLista(listaId: string): ListaCanciones[] {
  const listas = getListas().filter(l => l.id !== listaId);
  saveListas(listas);
  return listas;
}

// Agregar canción a una lista específica
export function addToLista(listaId: string, cancion: CancionRow): ListaCanciones[] {
  const listas = getListas();
  const lista = listas.find(l => l.id === listaId);
  if (lista && !lista.canciones.find(c => c.id === cancion.id)) {
    lista.canciones.push(cancion);
    saveListas(listas);
  }
  return listas;
}

// Eliminar canción de una lista específica
export function removeFromLista(listaId: string, cancionId: string): ListaCanciones[] {
  const listas = getListas();
  const lista = listas.find(l => l.id === listaId);
  if (lista) {
    lista.canciones = lista.canciones.filter(c => c.id !== cancionId);
    saveListas(listas);
  }
  return listas;
}

// Función auxiliar: obtener todas las canciones de todas las listas (útil si necesitas una vista general)
export function getAllSavedSongs(): CancionRow[] {
    const listas = getListas();
    const allSongs = listas.flatMap(l => l.canciones);
    // Eliminar duplicados si una canción está en varias listas
    const uniqueSongs = Array.from(new Set(allSongs.map(c => c.id)))
        .map(id => allSongs.find(c => c.id === id)!);
    return uniqueSongs;
}