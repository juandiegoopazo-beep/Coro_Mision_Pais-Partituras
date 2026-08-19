import { useEffect, useState } from 'react';
import { buscarEnMomento, type CancionParaElegir } from '../lib/repertorioAzar';
import './ElegirCancionModal.css';

interface Props {
  momento: string;
  etiqueta: string;
  onElegir: (cancionId: number) => void;
  onCerrar: () => void;
}

export function ElegirCancionModal({ momento, etiqueta, onElegir, onCerrar }: Props) {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<CancionParaElegir[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    const timeout = setTimeout(() => {
      buscarEnMomento(momento, query).then((r) => {
        if (!cancelado) {
          setResultados(r);
          setLoading(false);
        }
      });
    }, 200);
    return () => {
      cancelado = true;
      clearTimeout(timeout);
    };
  }, [momento, query]);

  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <div className="modal-caja elegir-caja" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-titulo">Elegir para {etiqueta}</h2>

        <input
          autoFocus
          className="elegir-input"
          placeholder="Buscar canción..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {loading && <p className="elegir-estado">Buscando…</p>}

        {!loading && resultados.length === 0 && (
          <p className="elegir-estado">
            No hay canciones catalogadas como "{etiqueta}" que calcen con esa búsqueda todavía.
          </p>
        )}

        <ul className="elegir-lista">
          {resultados.map((c) => (
            <li key={c.id}>
              <button
                className="elegir-item"
                onClick={() => {
                  onElegir(c.id);
                  onCerrar();
                }}
              >
                <span className="elegir-item-titulo">{c.titulo}</span>
                {c.cancionero?.titulo && (
                  <span className="elegir-item-sub">{c.cancionero.titulo}</span>
                )}
              </button>
            </li>
          ))}
        </ul>

        <button className="modal-cerrar" onClick={onCerrar}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
