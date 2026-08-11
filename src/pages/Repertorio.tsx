import { useState } from 'react';
import {
  useRepertorioIds,
  useCancionesPorIds,
} from '../hooks/useListasLocales';
import { moverEnRepertorio, quitarDeRepertorio, limpiarRepertorio } from '../lib/listasLocales';
import { CompartirModal } from '../components/CompartirModal';
import './Listas.css';

export default function Repertorio() {
  const ids = useRepertorioIds();
  const { canciones, loading } = useCancionesPorIds(ids);
  const [mostrarCompartir, setMostrarCompartir] = useState(false);

  return (
    <div className="lista-pagina">
      <header className="lista-header">
        <p className="lista-eyebrow">Misión País</p>
        <h1 className="lista-titulo">Repertorio</h1>
      </header>

      {loading && <p className="lista-estado">Cargando…</p>}

      {!loading && canciones.length === 0 && (
        <div className="lista-vacio">
          <p className="lista-vacio-titulo">Tu repertorio está vacío</p>
          <p className="lista-vacio-texto">
            Toca el + junto a una canción para armar la lista de tu próxima misa o ensayo, en el
            orden que quieras.
          </p>
        </div>
      )}

      {!loading && canciones.length > 0 && (
        <div className="lista-acciones-top">
          <button className="lista-btn-secundario" onClick={limpiarRepertorio}>
            Vaciar
          </button>
          <button className="lista-btn-primario" onClick={() => setMostrarCompartir(true)}>
            Compartir
          </button>
        </div>
      )}

      <ul className="lista-items">
        {canciones.map((c, i) => (
          <li key={c.id} className="repertorio-item">
            <span className="repertorio-numero">{i + 1}</span>
            <div className="repertorio-orden">
              <button onClick={() => moverEnRepertorio(c.id, -1)} disabled={i === 0} aria-label="Mover arriba">
                ▲
              </button>
              <button
                onClick={() => moverEnRepertorio(c.id, 1)}
                disabled={i === canciones.length - 1}
                aria-label="Mover abajo"
              >
                ▼
              </button>
            </div>
            <a className="tarjeta-cancion-principal" href={`/cancion/${c.id}`} style={{ flex: 1, textDecoration: 'none' }}>
              <span className="tarjeta-cancion-info">
                <span className="tarjeta-cancion-titulo">{c.titulo}</span>
                {c.cancionero?.titulo && (
                  <span className="tarjeta-cancion-sub">{c.cancionero.titulo}</span>
                )}
              </span>
            </a>
            <button
              className="accion-btn"
              onClick={() => quitarDeRepertorio(c.id)}
              aria-label="Quitar del repertorio"
              title="Quitar del repertorio"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {mostrarCompartir && (
        <CompartirModal canciones={canciones} onCerrar={() => setMostrarCompartir(false)} />
      )}
    </div>
  );
}
