import { useMemo, useState } from 'react';
import type { CancionConCancionero } from '../types/cancionero';
import { transponerBloque } from '../lib/transposer';
import './SongViewer.css';

interface Props {
  cancion: CancionConCancionero;
}

export function SongViewer({ cancion }: Props) {
  const [semitonos, setSemitonos] = useState(0);

  const secciones = useMemo(() => {
    if (!cancion.secciones) return [];
    if (semitonos === 0) return cancion.secciones;
    return cancion.secciones.map((s) => ({
      lyric: s.lyric,
      chords: transponerBloque(s.chords, semitonos),
    }));
  }, [cancion.secciones, semitonos]);

  const tieneContenido =
    (cancion.formato === 'linea' || cancion.formato === 'estrofa') && secciones.length > 0;

  return (
    <article className="visor">
      <header className="visor-header">
        {cancion.numero_original != null && (
          <span className="visor-numero">Nº {cancion.numero_original}</span>
        )}
        <h1 className="visor-titulo">{cancion.titulo}</h1>
        {(cancion.artista || cancion.autor_letra) && (
          <p className="visor-autor">{cancion.artista ?? cancion.autor_letra}</p>
        )}
        {cancion.cancionero?.titulo && (
          <p className="visor-cancionero">{cancion.cancionero.titulo}</p>
        )}
        <hr className="filo-oro" />
      </header>

      {tieneContenido ? (
        <>
          <div className="transportador">
            <button
              className="transportador-btn"
              onClick={() => setSemitonos((s) => s - 1)}
              aria-label="Bajar medio tono"
            >
              −
            </button>
            <span className="transportador-label">
              Tono {semitonos > 0 ? `+${semitonos}` : semitonos}
            </span>
            <button
              className="transportador-btn"
              onClick={() => setSemitonos((s) => s + 1)}
              aria-label="Subir medio tono"
            >
              +
            </button>
            {semitonos !== 0 && (
              <button className="transportador-reset" onClick={() => setSemitonos(0)}>
                original
              </button>
            )}
          </div>

          {cancion.formato === 'estrofa' && (
            <p className="visor-aviso">Acordes por estrofa (no alineados palabra por palabra)</p>
          )}

          <div className="visor-secciones">
            {secciones.map((seccion, i) => (
              <div className="seccion" key={i}>
                {seccion.chords && <pre className="seccion-acordes">{seccion.chords}</pre>}
                {seccion.lyric && <p className="seccion-letra">{seccion.lyric}</p>}
              </div>
            ))}
          </div>
        </>
      ) : (
        <PdfFallback cancion={cancion} />
      )}
    </article>
  );
}

function PdfFallback({ cancion }: Props) {
  const pdfUrl = cancion.cancionero?.pdf_url;
  const hojaOffset = cancion.cancionero?.hoja_offset ?? 0;
  const hojaEstim = cancion.pagina != null ? cancion.pagina + hojaOffset : null;

  return (
    <div className="pdf-fallback">
      <p>Esta canción todavía no está transcrita con letra y acordes.</p>
      {cancion.pagina != null && (
        <p className="pdf-fallback-pagina">
          Página {cancion.pagina} del cancionero
          {hojaEstim != null ? ` (hoja ~${hojaEstim} del PDF)` : ''}
        </p>
      )}
      {pdfUrl ? (
        <a className="pdf-btn" href={pdfUrl} target="_blank" rel="noreferrer">
          Abrir PDF del cancionero
        </a>
      ) : (
        <p>No hay PDF disponible para este cancionero.</p>
      )}
    </div>
  );
}
