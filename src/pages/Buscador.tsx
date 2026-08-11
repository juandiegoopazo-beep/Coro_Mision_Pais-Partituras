import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useBuscadorCanciones } from '../hooks/useBuscadorCanciones';
import './Buscador.css';

export default function Buscador() {
  const [query, setQuery] = useState('');
  const { resultados, loading } = useBuscadorCanciones(query);
  const navigate = useNavigate();

  return (
    <div className="buscador">
      <header className="buscador-header">
        <p className="buscador-eyebrow">Misión País</p>
        <h1 className="buscador-titulo">Cancionero</h1>
        <hr className="filo-oro" />
      </header>

      <input
        className="buscador-input"
        type="search"
        placeholder="Buscar canción..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />

      {loading && <p className="buscador-estado">Buscando…</p>}

      {!loading && query.trim().length >= 2 && resultados.length === 0 && (
        <p className="buscador-estado">Sin resultados.</p>
      )}

      <ul className="buscador-lista">
        {resultados.map((item) => (
          <li key={item.id}>
            <button
              className="buscador-fila"
              onClick={() => navigate(`/cancion/${item.id}`)}
            >
              <span className="buscador-fila-info">
                <span className="buscador-fila-titulo">{item.titulo}</span>
                {item.cancionero?.titulo && (
                  <span className="buscador-fila-sub">{item.cancionero.titulo}</span>
                )}
              </span>
              {item.formato !== 'pdf' && <span className="buscador-badge">letra</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
