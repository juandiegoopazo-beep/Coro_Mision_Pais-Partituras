// src/pages/Favoritos.tsx
import React, { useState } from 'react';
import { useListasLocales } from '../hooks/useListasLocales';
import FilaCancion from '../components/FilaCancion';
import { Link } from 'react-router-dom';
import './Listas.css'; // Asegúrate de renombrar el CSS a Listas.css o actualizar el import

export default function Favoritos() {
  const { listas, crearLista, eliminarLista, toggleCancionEnLista } = useListasLocales();
  const [nuevaListaNombre, setNuevaListaNombre] = useState('');
  const [listaSeleccionadaId, setListaSeleccionadaId] = useState<string | null>(null);

  const handleCrear = (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevaListaNombre.trim()) {
      crearLista(nuevaListaNombre.trim());
      setNuevaListaNombre('');
    }
  };

  const listaSeleccionada = listas.find(l => l.id === listaSeleccionadaId);

  return (
    <div className="listas-page">
      <header className="listas-header">
        <h1>Mis Listas</h1>
      </header>

      {/* Vista de creación y selección de listas */}
      {!listaSeleccionadaId ? (
        <div className="listas-container">
          <form onSubmit={handleCrear} className="crear-lista-form">
            <input
              type="text"
              placeholder="Nueva lista..."
              value={nuevaListaNombre}
              onChange={(e) => setNuevaListaNombre(e.target.value)}
            />
            <button type="submit">Crear</button>
          </form>

          {listas.length === 0 ? (
            <p className="no-listas">Aún no tienes listas. Crea una para comenzar a guardar canciones.</p>
          ) : (
            <ul className="listas-grid">
              {listas.map(lista => (
                <li key={lista.id} className="lista-card">
                  <div className="lista-card-content" onClick={() => setListaSeleccionadaId(lista.id)}>
                    <h3>{lista.nombre}</h3>
                    <p>{lista.canciones.length} canciones</p>
                  </div>
                  <button onClick={() => eliminarLista(lista.id)} className="btn-eliminar-lista">
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        /* Vista de canciones de una lista específica */
        <div className="lista-detalle">
          <button className="btn-volver" onClick={() => setListaSeleccionadaId(null)}>
            &larr; Volver a Listas
          </button>
          <h2>{listaSeleccionada?.nombre}</h2>
          
          {listaSeleccionada?.canciones.length === 0 ? (
            <p className="empty-state">No hay canciones en esta lista.</p>
          ) : (
            <div className="canciones-list">
              {listaSeleccionada?.canciones.map((c) => (
                <Link to={`/cancion/${c.id}`} key={c.id} className="cancion-link">
                  <FilaCancion
                    cancion={c}
                    isFavorito={true} // Como estamos dentro de la lista, siempre es true
                    onToggleFavorito={(e) => {
                      e.preventDefault();
                      toggleCancionEnLista(listaSeleccionada.id, c);
                    }}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}