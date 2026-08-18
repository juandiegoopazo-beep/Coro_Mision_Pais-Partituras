import { useEffect, useMemo, useRef, useState } from 'react';
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
import { getPreferenciasVisor, guardarPreferenciasVisor, PASOS_TAMANO } from '../lib/preferenciasVisor';
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

  const [prefs, setPrefs] = useState(() => getPreferenciasVisor());
  const [autoScroll, setAutoScroll] = useState(false);
  const [velocidad, setVelocidad] = useState(1); // 0.5 a 3
  const scrollFrame = useRef<number | null>(null);

  function actualizarPrefs(next: Partial<typeof prefs>) {
    const nuevo = { ...prefs, ...next };
    setPrefs(nuevo);
    guardarPreferenciasVisor(nuevo);
  }

  function cambiarTamano(direccion: 1 | -1) {
    const i = PASOS_TAMANO.indexOf(prefs.tamanoLetra);
    const nuevoI = Math.min(PASOS_TAMANO.length - 1, Math.max(0, i + direccion));
    actualizarPrefs({ tamanoLetra: PASOS_TAMANO[nuevoI] });
  }

  useEffect(() => {
    if (!autoScroll) {
      if (scrollFrame.current) cancelAnimationFrame(scrollFrame.current);
      return;
    }
    let ultimo = performance.now();
    function paso(ahora: number) {
      const dt = ahora - ultimo;
      ultimo = ahora;
      window.scrollBy(0, (dt / 1000) * 18 * velocidad);
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
        setAutoScroll(false);
        return;
      }
      scrollFrame.current = requestAnimationFrame(paso);
    }
    scrollFrame.current = requestAnimationFrame(paso);
    return () => {
      if (scrollFrame.current) cancelAnimationFrame(scrollFrame.current);
    };
  }, [autoScroll, velocidad]);

  const tieneLetra =
    (cancion.formato === 'linea' || cancion.formato === 'estrofa' || cancion.formato === 'partitura') &&
    !!cancion.secciones &&
    cancion.secciones.length > 0;
  const tienePartitura = (cancion.partitura_archivos?.length ?? 0) > 0;

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
    <article className={`visor${prefs.modoOscuro ? ' visor-oscuro' : ''}`} style={{ '--tamano-letra': prefs.tamanoLetra } as React.CSSProperties}>
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
          <div className="visor-controles">
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

            <div className="visor-ajustes">
              <button
                className="ajuste-btn"
                onClick={() => cambiarTamano(-1)}
                aria-label="Letra más chica"
                disabled={prefs.tamanoLetra === PASOS_TAMANO[0]}
              >
                A−
              </button>
              <button
                className="ajuste-btn"
                onClick={() => cambiarTamano(1)}
                aria-label="Letra más grande"
                disabled={prefs.tamanoLetra === PASOS_TAMANO[PASOS_TAMANO.length - 1]}
              >
                A+
              </button>
              <button
                className={`ajuste-btn${prefs.modoOscuro ? ' activo' : ''}`}
                onClick={() => actualizarPrefs({ modoOscuro: !prefs.modoOscuro })}
                aria-label="Modo oscuro"
                title="Modo oscuro"
              >
                ◐
              </button>
              <button
                className={`ajuste-btn${autoScroll ? ' activo' : ''}`}
                onClick={() => setAutoScroll((a) => !a)}
                aria-label={autoScroll ? 'Detener auto-scroll' : 'Iniciar auto-scroll'}
                title={autoScroll ? 'Detener auto-scroll' : 'Auto-scroll'}
              >
                {autoScroll ? '⏸' : '▶'}
              </button>
            </div>
          </div>

          {autoScroll && (
            <div className="autoscroll-velocidad">
              <span>Velocidad</span>
              <input
                type="range"
                min={0.5}
                max={3}
                step={0.25}
                value={velocidad}
                onChange={(e) => setVelocidad(Number(e.target.value))}
              />
            </div>
          )}

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
  const archivos = [...(cancion.partitura_archivos ?? [])].sort((a, b) => a.orden - b.orden);
  const [seleccion, setSeleccion] = useState(archivos[0]?.id);
  const actual = archivos.find((a) => a.id === seleccion) ?? archivos[0];

  if (!actual) return null;

  return (
    <div className="partitura-viewer">
      {archivos.length > 1 && (
        <div className="voz-chips">
          {archivos.map((a) => (
            <button
              key={a.id}
              className={`voz-chip${a.id === actual.id ? ' activo' : ''}`}
              onClick={() => setSeleccion(a.id)}
            >
              {a.voz}
            </button>
          ))}
        </div>
      )}

      {actual.fuente === 'pastoral_uc' && <p className="visor-aviso">Arreglo de Pastoral UC</p>}

      <div className="partitura-embed">
        <iframe src={actual.pdf_url} title={`Partitura de ${cancion.titulo} — ${actual.voz}`} loading="lazy" />
      </div>
      <a className="pdf-btn partitura-btn-externo" href={actual.pdf_url} target="_blank" rel="noreferrer">
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
