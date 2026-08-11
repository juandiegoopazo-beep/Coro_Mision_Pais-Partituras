import { useFavoritosIds, useCancionesPorIds } from '../hooks/useListasLocales';
import { FilaCancion } from '../components/FilaCancion';
import './Listas.css';

export default function Favoritos() {
  const ids = useFavoritosIds();
  const { canciones, loading } = useCancionesPorIds(ids);

  return (
    <div className="lista-pagina">
      <header className="lista-header">
        <p className="lista-eyebrow">Misión País</p>
        <h1 className="lista-titulo">Favoritos</h1>
      </header>

      {loading && <p className="lista-estado">Cargando…</p>}

      {!loading && canciones.length === 0 && (
        <div className="lista-vacio">
          <p className="lista-vacio-titulo">Aún no tienes favoritos</p>
          <p className="lista-vacio-texto">
            Toca la estrella junto a una canción, desde el buscador o su ficha, para guardarla
            acá.
          </p>
        </div>
      )}

      <ul className="lista-items">
        {canciones.map((c) => (
          <li key={c.id}>
            <FilaCancion id={c.id} titulo={c.titulo} subtitulo={c.cancionero?.titulo} />
          </li>
        ))}
      </ul>
    </div>
  );
}
