import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useListaPorId, useCancionesPorIds } from '../hooks/useListasLocales';
import { renombrarLista, eliminarLista, toggleEnLista } from '../lib/listasLocales';
import { FilaCancion } from '../components/FilaCancion';
import './Listas.css';

export default function ListaDetail() {
  const { id } = useParams<{ id: string }>();
  const lista = useListaPorId(id);
  const { canciones, loading } = useCancionesPorIds(lista?.cancionIds ?? []);
  const [editando, setEditando] = useState(false);
  const [nombreEdicion, setNombreEdicion] = useState('');

  if (!id) return <Navigate to="/listas" replace />;
  if (!lista) {
    return (
      <div className="lista-pagina">
        <p className="lista-estado">Cargando…</p>
      </div>
    );
  }

  function confirmarRenombre() {
    if (nombreEdicion.trim()) renombrarLista(lista!.id, nombreEdicion);
    setEditando(false);
  }

  return (
    <div className="lista-pagina">
      <Link to="/listas" className="volver-link">
        ← Mis listas
      </Link>

      <header className="lista-header">
        {!editando ? (
          <div className="repertorio-titulo-activo">
            <h2>{lista.nombre}</h2>
            {!lista.esFavoritos && (
              <>
                <button
                  className="repertorio-editar-btn"
                  onClick={() => {
                    setNombreEdicion(lista.nombre);
                    setEditando(true);
                  }}
                >
                  Renombrar
                </button>
                <button
                  className="repertorio-editar-btn repertorio-eliminar-btn"
                  onClick={() => {
                    if (confirm(`¿Eliminar la lista "${lista.nombre}"?`)) eliminarLista(lista.id);
                  }}
                >
                  Eliminar
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="repertorio-nuevo-form">
            <input
              autoFocus
              className="repertorio-nuevo-input"
              value={nombreEdicion}
              onChange={(e) => setNombreEdicion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirmarRenombre()}
            />
            <button className="lista-btn-primario" onClick={confirmarRenombre}>
              Guardar
            </button>
            <button className="lista-btn-secundario" onClick={() => setEditando(false)}>
              Cancelar
            </button>
          </div>
        )}
      </header>

      {loading && <p className="lista-estado">Cargando…</p>}

      {!loading && canciones.length === 0 && (
        <div className="lista-vacio">
          <p className="lista-vacio-titulo">Esta lista está vacía</p>
          <p className="lista-vacio-texto">
            {lista.esFavoritos
              ? 'Toca la estrella junto a una canción para guardarla acá.'
              : 'Abre una canción y usa "Agregar a lista" para sumarla acá.'}
          </p>
        </div>
      )}

      <ul className="lista-items">
        {canciones.map((c) => (
          <li key={c.id}>
            <FilaCancion
              id={c.id}
              titulo={c.titulo}
              subtitulo={c.cancionero?.titulo}
              accionExtra={
                !lista.esFavoritos
                  ? { texto: '✕', onClick: () => toggleEnLista(lista.id, c.id), etiqueta: 'Quitar de la lista' }
                  : undefined
              }
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
