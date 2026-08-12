import { useParams, Link } from 'react-router-dom';
import { useAlbumDetalle } from '../hooks/useAlbumDetalle';
import { FilaCancion } from '../components/FilaCancion';
import './AlbumDetail.css';

export default function AlbumDetail() {
  const { id } = useParams<{ id: string }>();
  const { album, canciones, loading } = useAlbumDetalle(id);

  if (loading) {
    return <p className="estado-centro">Cargando…</p>;
  }

  if (!album) {
    return <p className="estado-centro estado-error">No se encontró el álbum.</p>;
  }

  return (
    <div className="album-detail">
      <Link to="/" className="volver-link">
        ← Volver
      </Link>

      <header className="album-detail-header">
        <div
          className="album-detail-caratula"
          style={!album.caratula_url ? { background: '#17171a' } : undefined}
        >
          {album.caratula_url ? (
            <img src={album.caratula_url} alt={album.titulo} />
          ) : (
            <span className="album-detail-caratula-placeholder">{album.titulo}</span>
          )}
        </div>
        <div>
          <p className="album-detail-eyebrow">
            {album.volumen != null ? `Vol. ${album.volumen}` : 'Cancionero'}
          </p>
          <h1 className="album-detail-titulo">{album.titulo}</h1>
          <p className="album-detail-meta">{canciones.length} canciones</p>
        </div>
      </header>

      <ul className="lista-items">
        {canciones.map((c) => (
          <li key={c.id}>
            <FilaCancion
              id={c.id}
              titulo={c.titulo}
              etiqueta={c.formato === 'partitura' ? 'partitura' : c.formato !== 'pdf' ? 'letra' : null}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
