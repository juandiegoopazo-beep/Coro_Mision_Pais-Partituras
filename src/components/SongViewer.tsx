import { useMemo, useState } from 'react';
import type { CancionConCancionero } from '../types/cancionero';
import { transponerBloque } from '../lib/transposer';
import {
  esFavorito,
  toggleFavorito,
  estaEnRepertorio,
  agregarARepertorio,
  quitarDeRepertorio,
} from '../lib/listasLocales';
import { useFavoritosIds, useRepertorioIds } from '../hooks/useListasLocales';
import { IconEstrella, IconMas } from './Icons';
import './SongViewer.css';

interface Props {
  cancion: CancionConCancionero;
}

type Vista = 'letra' | 'partitura';

export function SongViewer({ cancion }: Props) {
  const [semitonos, setSemitonos] = useState(0);
  const favoritos = useFavoritosIds();
  const repertorio = useRepertorioIds();
  const favorito = favoritos.includes(cancion.id);
  const enRepertorio = repertorio.includes(cancion.id);

  const tieneLetra =
    (cancion.formato === 'linea' || cancion.formato === 'estrofa' || cancion.formato === 'partitura') &&
    !!cancion.secciones &&
    cancion.secciones.length > 0;
  const tienePartitura = !!cancion.partitura_pdf_url;

  const [vista, setVista] = useState<Vista>(tienePartitura && !tieneLetra ? 'partitura' : 'letra');

  const secciones = useMemo(() => {
    if (!cancion.secciones) return [];
    if (semitonos === 0) return cancion.secciones;
    return cancion.secciones.map((s) => ({
      lyric: s.lyric,
      chords: transponerBloque(s.chords, semitonos),
    }));
  }, [cancion.secciones, semitonos]);

  const sinContenidoEstructurado = !tieneLetra && !tienePartitura;

  return (
    <article className="visor">
      <header className="visor-header">
        <div className="visor-header-top">
          {cancion.numero_original != null && (
            <span className="visor-numero">Nº {cancion.numero_original}</span>
          )}
          <div className="visor-acciones">
            <button
              className={`accion-btn${favorito ? ' activo' : ''}`}
              onClick={() => toggleFavorito(cancion.id)}
              aria-label={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              title={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              <IconEstrella filled={favorito} />
            </button>
            <button
              className={`accion-btn${enRepertorio ? ' activo' : ''}`}
              onClick={() =>
                enRepertorio ? quitarDeRepertorio(cancion.id) : agregarARepertorio(cancion.id)
              }
              aria-label={enRepertorio ? 'Quitar del repertorio' : 'Agregar al repertorio'}
              title={enRepertorio ? 'Quitar del repertorio' : 'Agregar al repertorio'}
            >
              <IconMas activo={enRepertorio} />
            </button>
          </div>
        </div>
        <h1 className="visor-titulo">{cancion.titulo}</h1>
        {(cancion.artista || cancion.autor_letra) && (
          <p className="visor-autor">{cancion.artista ?? cancion.autor_letra}</p>
        )}
        {cancion.cancionero?.titulo && (
          <p className="visor-cancionero">{cancion.cancionero.titulo}</p>
        )}
        <hr className="filo-oro" />
      </header>

      {tieneLetra && tienePartitura && (
        <div className="visor-tabs">
          <button
            className={`visor-tab${vista === 'letra' ? ' activo' : ''}`}
            onClick={() => setVista('letra')}
          >
            Letra y acordes
          </button>
          <button
            className={`visor-tab${vista === 'partitura' ? ' activo' : ''}`}
            onClick={() => setVista('partitura')}
          >
            Partitura
          </button>
        </div>
      )}

      {vista === 'letra' && tieneLetra && (
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
            <p className="visor-aviso">Acordes por línea (no siempre alineados por sílaba exacta)</p>
          )}

          <div className="visor-secciones">
            {secciones.map((seccion, i) => (
              <div className="seccion" key={i}>
                <SeccionInterlineada chords={seccion.chords} lyric={seccion.lyric} />
              </div>
            ))}
          </div>
        </>
      )}

      {vista === 'partitura' && tienePartitura && (
        <PartituraViewer cancion={cancion} />
      )}

      {sinContenidoEstructurado && <PdfFallback cancion={cancion} />}
    </article>
  );
}

function SeccionInterlineada({ chords, lyric }: { chords: string; lyric: string }) {
  const lineasAcordes = chords ? chords.split('\n') : [];
  const lineasLetra = lyric ? lyric.split('\n') : [];
  const total = Math.max(lineasAcordes.length, lineasLetra.length);

  if (total === 0) return null;

  return (
    <div className="seccion-interlineada">
      {Array.from({ length: total }).map((_, i) => (
        <div className="linea-par" key={i}>
          {lineasAcordes[i] && <div className="linea-acorde">{lineasAcordes[i]}</div>}
          {lineasLetra[i] && <div className="linea-letra">{lineasLetra[i]}</div>}
        </div>
      ))}
    </div>
  );
}

function PartituraViewer({ cancion }: Props) {
  const url = cancion.partitura_pdf_url!;
  const esPastoralUC = cancion.partitura_fuente === 'pastoral_uc';

  return (
    <div className="partitura-viewer">
      {esPastoralUC && (
        <p className="visor-aviso">Arreglo de Pastoral UC</p>
      )}
      <div className="partitura-embed">
        <iframe src={url} title={`Partitura de ${cancion.titulo}`} loading="lazy" />
      </div>
      <a className="pdf-btn partitura-btn-externo" href={url} target="_blank" rel="noreferrer">
        Abrir en una pestaña nueva
      </a>
    </div>
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
