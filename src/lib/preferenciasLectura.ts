const CLAVE_TAMANO = 'cmp:visor-tamano-letra';
const CLAVE_OSCURO = 'cmp:visor-oscuro';

export const TAMANOS = [15, 17, 19, 22, 25] as const;
export type TamanoLetra = (typeof TAMANOS)[number];

export function getTamanoLetra(): TamanoLetra {
  const guardado = Number(localStorage.getItem(CLAVE_TAMANO));
  return (TAMANOS as readonly number[]).includes(guardado) ? (guardado as TamanoLetra) : 17;
}

export function setTamanoLetra(valor: TamanoLetra) {
  localStorage.setItem(CLAVE_TAMANO, String(valor));
}

export function getModoOscuroVisor(): boolean {
  return localStorage.getItem(CLAVE_OSCURO) === '1';
}

export function setModoOscuroVisor(valor: boolean) {
  localStorage.setItem(CLAVE_OSCURO, valor ? '1' : '0');
}
