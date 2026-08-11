/**
 * Transportador de acordes para notación latina (Do Re Mi Fa Sol La Si).
 * Mayúscula inicial = mayor ("Sol"), minúscula = menor ("lam7").
 * No es un parser ChordPro completo: transporta solo tokens que matchean
 * un acorde reconocible; deja intactas anotaciones ("(Intro)", "Cejillo IV").
 */

const ESCALA = [
  'Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si',
] as const;

const ALIAS_A_INDICE: Record<string, number> = {
  do: 0, 'do#': 1, reb: 1,
  re: 2, 're#': 3, mib: 3,
  mi: 4,
  fa: 5, 'fa#': 6, solb: 6,
  sol: 7, 'sol#': 8, lab: 8,
  la: 9, 'la#': 10, sib: 10,
  si: 11,
};

const CHORD_RE =
  /^(do|re|mi|fa|sol|la|si)(#|b)?([a-z0-9#+\-.]*)?(\/(do|re|mi|fa|sol|la|si)(#|b)?([a-z0-9#+\-.]*)?)?$/i;

function transponerNota(
  nota: string,
  accidente: string | undefined,
  semitonos: number,
  eraMayuscula: boolean
): string {
  const clave = (nota + (accidente ?? '')).toLowerCase();
  const indice = ALIAS_A_INDICE[clave];
  if (indice === undefined) return nota + (accidente ?? '');
  const nuevoIndice = ((indice + semitonos) % 12 + 12) % 12;
  const nombre = ESCALA[nuevoIndice];
  return eraMayuscula ? nombre : nombre.toLowerCase();
}

export function transponerAcorde(token: string, semitonos: number): string {
  if (semitonos === 0) return token;
  const match = token.match(CHORD_RE);
  if (!match) return token;

  const [, root, acc, suf, , bassRoot, bassAcc, bassSuf] = match;
  const eraMayRoot = root[0] === root[0].toUpperCase() && root[0] !== root[0].toLowerCase();
  let resultado = transponerNota(root, acc, semitonos, eraMayRoot) + (suf ?? '');

  if (bassRoot) {
    const eraMayBass = bassRoot[0] === bassRoot[0].toUpperCase() && bassRoot[0] !== bassRoot[0].toLowerCase();
    resultado += '/' + transponerNota(bassRoot, bassAcc, semitonos, eraMayBass) + (bassSuf ?? '');
  }
  return resultado;
}

export function transponerBloque(chordsText: string, semitonos: number): string {
  if (!chordsText || semitonos === 0) return chordsText;

  return chordsText
    .split(/(\s+)/)
    .map((piece) => {
      if (/^\s+$/.test(piece) || piece === '') return piece;
      const leading = piece.match(/^[(/]*/)?.[0] ?? '';
      const trailing = piece.match(/[).,;:]*$/)?.[0] ?? '';
      const core = piece.slice(leading.length, piece.length - trailing.length);
      return leading + transponerAcorde(core, semitonos) + trailing;
    })
    .join('');
}
