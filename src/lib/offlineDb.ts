/**
 * Wrapper mínimo sobre IndexedDB — sin librerías externas.
 * Guarda copias locales de canciones/cancioneros para uso sin conexión.
 */

const DB_NAME = 'cancionero-cmp-offline';
const DB_VERSION = 1;

const STORES = {
  canciones: 'canciones',
  cancioneros: 'cancioneros',
  meta: 'meta', // guarda cosas como "ultima_sincronizacion"
} as const;

function abrirDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORES.canciones)) {
        db.createObjectStore(STORES.canciones, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.cancioneros)) {
        db.createObjectStore(STORES.cancioneros, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.meta)) {
        db.createObjectStore(STORES.meta, { keyPath: 'clave' });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function reemplazarStore<T>(storeName: string, filas: T[]): Promise<void> {
  const db = await abrirDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.clear();
    for (const fila of filas) store.put(fila);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function leerTodo<T>(storeName: string): Promise<T[]> {
  const db = await abrirDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

export async function guardarCancionesOffline(filas: unknown[]) {
  await reemplazarStore(STORES.canciones, filas);
}

export async function guardarCancionerosOffline(filas: unknown[]) {
  await reemplazarStore(STORES.cancioneros, filas);
}

export async function leerCancionesOffline<T = any>(): Promise<T[]> {
  return leerTodo<T>(STORES.canciones);
}

export async function leerCancionerosOffline<T = any>(): Promise<T[]> {
  return leerTodo<T>(STORES.cancioneros);
}

export async function guardarUltimaSincronizacion(fechaIso: string) {
  const db = await abrirDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORES.meta, 'readwrite');
    tx.objectStore(STORES.meta).put({ clave: 'ultima_sincronizacion', valor: fechaIso });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function leerUltimaSincronizacion(): Promise<string | null> {
  const db = await abrirDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.meta, 'readonly');
    const req = tx.objectStore(STORES.meta).get('ultima_sincronizacion');
    req.onsuccess = () => resolve(req.result?.valor ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function hayDatosOffline(): Promise<boolean> {
  const canciones = await leerCancionesOffline();
  return canciones.length > 0;
}
