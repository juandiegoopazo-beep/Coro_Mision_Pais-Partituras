import { useState } from 'react';
import { useBuscadorCanciones } from '../hooks/useBuscadorCanciones';
import { FilaCancion } from '../components/FilaCancion';
import { IconBuscarChico } from '../components/Icons';
import './Buscador.css';

export default function Buscador() {
  const [query, setQuery] = useState('');
  const { resultados, loading } = useBuscadorCanciones(query);
  const sinBuscar = query.trim().length < 2;

  return (
    <div className="buscador">
      <header className="buscador-header">
        <p className="buscador-eyebrow">Misión País</p>
        <h1 className="buscador-titulo">Cancionero</h1>
      </header>

      <div className="buscador-input-wrap">
        <span className="buscador-input-icono">
          <IconBuscarChico />
        </span>
        <input
          className="buscador-input"
          type="search"
          placeholder="Buscar canción..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {sinBuscar && (
        <div className="buscador-vacio">
          <p className="buscador-vacio-titulo">Encuentra cualquier canción</p>
          <p className="buscador-vacio-texto">
            Escribe el título o un pedazo de la letra para empezar a buscar entre todos los
            cancioneros de Misión País.
          </p>
        </div>
      )}

      {loading && <p className="buscador-estado">Buscando…</p>}

      {!loading && !sinBuscar && resultados.length === 0 && (
        <p className="buscador-estado">Sin resultados para "{query}".</p>
      )}

      <ul className="buscador-lista">
        {resultados.map((item) => (
          <li key={item.id}>
            <FilaCancion
              id={item.id}
              titulo={item.titulo}
              subtitulo={item.cancionero?.titulo}
              etiqueta={item.formato !== 'pdf' ? 'letra' : null}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
