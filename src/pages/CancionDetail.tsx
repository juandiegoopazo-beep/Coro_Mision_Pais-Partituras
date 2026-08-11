import { useParams, Link } from 'react-router-dom';
import { useCancionDetail } from '../hooks/useCancionDetail';
import { SongViewer } from '../components/SongViewer';

export default function CancionDetail() {
  const { id } = useParams<{ id: string }>();
  const cancionId = id ? Number(id) : null;
  const { cancion, loading, error } = useCancionDetail(cancionId);

  if (loading) {
    return <p className="estado-centro">Cargando…</p>;
  }

  if (error || !cancion) {
    return <p className="estado-centro estado-error">No se pudo cargar la canción.</p>;
  }

  return (
    <>
      <Link to="/" className="volver-link">
        ← Volver al buscador
      </Link>
      <SongViewer cancion={cancion} />
    </>
  );
}
