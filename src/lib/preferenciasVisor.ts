const CLAVE = 'cmp:preferencias-visor';

export interface PreferenciasVisor {
  tamanoLetra: number; // multiplicador, 1 = normal
  modoOscuro: boolean;
}

const DEFAULT: PreferenciasVisor = {
  tamanoLetra: 1,
  modoOscuro: false,
};

export function getPreferenciasVisor(): PreferenciasVisor {
  try {
    const raw = localStorage.getItem(CLAVE);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
}

export function guardarPreferenciasVisor(p: PreferenciasVisor) {
  localStorage.setItem(CLAVE, JSON.stringify(p));
}

export const PASOS_TAMANO = [0.85, 1, 1.15, 1.3, 1.5];
