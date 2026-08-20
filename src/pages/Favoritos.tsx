import React, { useState } from 'react';
import {
  useFavoritosIds,
  useCancionesPorIds,
  useListasLocales,
  type CancionListado,
} from '../hooks/useListasLocales';
import { FilaCancion } from '../components/FilaCancion';
import { SkeletonListaFilas } from '../components/Skeleton';
import './Listas.css';

export default function Favoritos() {
  const [pestana, setPestana] = useState<'favoritos' | 'listas'>('favoritos');
  const favoritosIds = useFavoritosIds();
  const { canciones: cancionesFavoritas, loading: cargandoFavoritos } = useCancionesPorIds(favoritosIds);

  const { listas, crearLista, eliminarLista } = useListasLocales();
  const [nuevaListaNombre, setNuevaListaNombre] = useState('');
  const [listaSeleccionadaId, setListaSeleccionadaId] = useState<string | null>(null);

  const handleCrear = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (nuevaListaNombre.trim()) {
      crearLista(nuevaListaNombre.trim());
      setNuevaListaNombre('');
    }
  };

  const listaSeleccionada = listas.find((l) => l.id === listaSeleccionadaId);

  return (
    <div className="lista-pagina">
      <header className="lista-header">
        <p className="lista-eyebrow">Mi Cancionero</p>
        <h1 className="lista-titulo">Guardadas y Listas</h1>
      </header>

      <div className="repertorio-selector" style={{ marginBottom: '20px' }}>
        <button
          className={`repertorio-chip${pestana === 'favoritos' ? ' activo' : ''}`}
          onClick={() => {
            setPestana('favoritos');
            setListaSeleccionadaId(null);
          }}
        >
          ⭐ Favoritos ({favoritosIds.length})
        </button>
        <button
          className={`repertorio-chip${pestana === 'listas' ? ' activo' : ''}`}
          onClick={() => setPestana('listas')}
        >
          📁 Mis Listas ({listas.length})
        </button>
      </div>

      {pestana === 'favoritos' && (
        <section>
          {cargandoFavoritos && <SkeletonListaFilas cantidad={4} />}

          {!cargandoFavoritos && favoritosIds.length === 0 && (
            <div className="lista-vacio">
              <h2 className="lista-vacio-titulo">No tienes canciones favoritas</h2>
              <p className="lista-vacio-texto">
                Toca la estrella ⭐ en cualquier canción del buscador o visor para guardarla aquí y
                acceder rápido.
              </p>
            </div>
          )}

          {!cargandoFavoritos && cancionesFavoritas.length > 0 && (
            <ul className="lista-items">
              {cancionesFavoritas.map((c: CancionListado) => (
                <li key={c.id}>
                  <FilaCancion
                    id={c.id}
                    titulo={c.titulo}
                    subtitulo={c.cancionero?.titulo}
                    etiqueta={
                      c.formato === 'partitura'
                        ? 'partitura'
                        : c.formato !== 'pdf'
                        ? 'letra'
                        : null
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {pestana === 'listas' && (
        <section>
          {!listaSeleccionadaId ? (
            <div>
              <form onSubmit={handleCrear} className="repertorio-nuevo-form" style={{ marginBottom: '20px' }}>
                <input
                  type="text"
                  className="repertorio-nuevo-input"
                  placeholder="Nombre de nueva lista..."
                  value={nuevaListaNombre}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNuevaListaNombre(e.target.value)}
                />
                <button type="submit" className="lista-btn-primario">
                  Crear lista
                </button>
              </form>

              {listas.length === 0 ? (
                <div className="lista-vacio">
                  <h2 className="lista-vacio-titulo">Aún no tienes listas personalizadas</h2>
                  <p className="lista-vacio-texto">
                    Crea listas para organizar tus cantos por misa, coro, eventos o ensayos.
                  </p>
                </div>
              ) : (
                <ul className="lista-items">
                  {listas.map((lista) => (
                    <li
                      key={lista.id}
                      className="repertorio-item"
                      style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div
                        style={{ cursor: 'pointer', flex: 1 }}
                        onClick={() => setListaSeleccionadaId(lista.id)}
                      >
                        <h3 style={{ margin: '0 0 4px', color: 'var(--pergamino)', fontSize: '16px' }}>
                          {lista.nombre}
                        </h3>
                        <p style={{ margin: 0, color: 'var(--pergamino-tenue)', fontSize: '13px' }}>
                          {lista.canciones.length} {lista.canciones.length === 1 ? 'canción' : 'canciones'}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="lista-btn-secundario"
                          onClick={() => setListaSeleccionadaId(lista.id)}
                        >
                          Ver
                        </button>
                        <button
                          className="lista-btn-secundario"
                          onClick={() => {
                            if (confirm(`¿Eliminar la lista "${lista.nombre}"?`)) {
                              eliminarLista(lista.id);
                            }
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <button
                  className="lista-btn-secundario"
                  onClick={() => setListaSeleccionadaId(null)}
                >
                  ← Volver a listas
                </button>
                <h2 style={{ margin: 0, color: 'var(--pergamino)', fontSize: '18px' }}>
                  {listaSeleccionada?.nombre}
                </h2>
              </div>

              {listaSeleccionada?.canciones.length === 0 ? (
                <div className="lista-vacio">
                  <h2 className="lista-vacio-titulo">Esta lista está vacía</h2>
                  <p className="lista-vacio-texto">
                    Agrega canciones a esta lista desde el visor de canciones o buscador.
                  </p>
                </div>
              ) : (
                <ul className="lista-items">
                  {listaSeleccionada?.canciones.map((c) => (
                    <li key={c.id}>
                      <FilaCancion
                        id={c.id}
                        titulo={c.titulo}
                        subtitulo={c.cancionero_id}
                        etiqueta={
                          c.formato === 'partitura'
                            ? 'partitura'
                            : c.formato !== 'pdf'
                            ? 'letra'
                            : null
                        }
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
