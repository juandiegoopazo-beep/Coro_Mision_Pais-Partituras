import { useState } from 'react';
import { useBuscadorCanciones } from '../hooks/useBuscadorCanciones';
import { useMomentosConteo } from '../hooks/useMomentosConteo';
import { useCancionesPorMomento } from '../hooks/useCancionesPorMomento';
import { useAlbumes } from '../hooks/useAlbumes';
import { FilaCancion } from '../components/FilaCancion';
import { FiltroChips } from '../components/FiltroChips';
import { AlbumCard } from '../components/AlbumCard';
import { OfflineModal } from '../components/OfflineModal';
import { SkeletonListaFilas, SkeletonGrillaAlbumes } from '../components/Skeleton';
import { IconBuscarChico, IconDescargar } from '../components/Icons';
import './Buscador.css';

export default function Buscador() {
  const [query, setQuery] = useState('');
  const [momento, setMomento] = useState<string | null>(null);
  const [mostrarOffline, setMostrarOffline] = useState(false);

  const { resultados: resultadosBusqueda, loading: buscando } = useBuscadorCanciones(query);
  const { momentos } = useMomentosConteo();
  const { resultados: resultadosMomento, loading: cargandoMomento } = useCancionesPorMomento(momento);
  const { albumes, totalCancioneros, totalCanciones, loading: cargandoAlbumes } = useAlbumes();

  const hayBusqueda = query.trim().length >= 2;

  return (
    <div className="buscador">
      <div className="buscador-input-wrap">
        <span className="buscador-input-icono">
          <IconBuscarChico />
        </span>
        <input
          className="buscador-input"
          type="search"
          placeholder="Buscar canción o cancionero..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="buscador-offline-btn"
          onClick={() => setMostrarOffline(true)}
          aria-label="Usar sin conexión"
          title="Usar sin conexión"
        >
          <IconDescargar />
        </button>
      </div>

      <FiltroChips
        momentos={momentos}
        totalCanciones={totalCanciones}
        seleccionado={momento}
        onSeleccionar={(m) => {
          setMomento(m);
          setQuery('');
        }}
      />

      {hayBusqueda ? (
        <>
          {buscando && <SkeletonListaFilas cantidad={5} />}
          {!buscando && resultadosBusqueda.length === 0 && (
            <p className="buscador-estado">Sin resultados para "{query}".</p>
          )}
          <ul className="buscador-lista">
            {resultadosBusqueda.map((item) => (
              <li key={item.id}>
                <FilaCancion
                  id={item.id}
                  titulo={item.titulo}
                  subtitulo={item.cancionero?.titulo}
                  etiqueta={
                    item.formato === 'partitura'
                      ? 'partitura'
                      : item.formato !== 'pdf'
                      ? 'letra'
                      : null
                  }
                />
              </li>
            ))}
          </ul>
        </>
      ) : momento ? (
        <>
          {cargandoMomento && <SkeletonListaFilas cantidad={5} />}
          <ul className="buscador-lista">
            {resultadosMomento.map((item) => (
              <li key={item.id}>
                <FilaCancion
                  id={item.id}
                  titulo={item.titulo}
                  subtitulo={item.cancionero?.titulo}
                  etiqueta={
                    item.formato === 'partitura'
                      ? 'partitura'
                      : item.formato !== 'pdf'
                      ? 'letra'
                      : null
                  }
                />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <header className="buscador-header">
            <h1 className="buscador-titulo">Coro Misión País</h1>
            <p className="buscador-eyebrow">
              {totalCancioneros} cancioneros · {totalCanciones} canciones
            </p>
          </header>

          <p className="discos-label">Discos</p>
          {cargandoAlbumes && <SkeletonGrillaAlbumes />}
          <div className="albumes-grid">
            {albumes.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </>
      )}

      {mostrarOffline && <OfflineModal onCerrar={() => setMostrarOffline(false)} />}
    </div>
  );
}
