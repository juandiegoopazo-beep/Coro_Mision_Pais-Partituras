// src/hooks/useListasLocales.ts
import { useState, useEffect } from 'react';
import { CancionRow } from '../types/cancionero';
import {
  getListas,
  crearLista,
  eliminarLista,
  addToLista,
  removeFromLista,
  ListaCanciones
} from '../lib/listasLocales';

export function useListasLocales() {
  const [listas, setListas] = useState<ListaCanciones[]>([]);

  useEffect(() => {
    setListas(getListas());
  }, []);

  const handleCrearLista = (nombre: string) => {
    setListas(crearLista(nombre));
  };

  const handleEliminarLista = (listaId: string) => {
    setListas(eliminarLista(listaId));
  };

  const toggleCancionEnLista = (listaId: string, cancion: CancionRow) => {
    const lista = listas.find(l => l.id === listaId);
    if (!lista) return;

    const exists = lista.canciones.some((c) => c.id === cancion.id);
    if (exists) {
      setListas(removeFromLista(listaId, cancion.id));
    } else {
      setListas(addToLista(listaId, cancion));
    }
  };

  const isFavoritoEnAlgunaLista = (cancionId: string) => {
    return listas.some(lista => lista.canciones.some(c => c.id === cancionId));
  };

  return {
    listas,
    crearLista: handleCrearLista,
    eliminarLista: handleEliminarLista,
    toggleCancionEnLista,
    isFavoritoEnAlgunaLista
  };
}