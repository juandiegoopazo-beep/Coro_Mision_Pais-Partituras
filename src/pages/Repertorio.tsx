import { useState } from 'react';
import {
  useRepertorios,
  useRepertorioActivoId,
  useCancionesPorIds,
} from '../hooks/useListasLocales';
import {
  moverEnRepertorio,
  quitarDeRepertorio,
  limpiarRepertorio,
  crearRepertorio,
  renombrarRepertorio,
  eliminarRepertorio,
  setRepertorioActivo,
} from '../lib/listasLocales';
import { CompartirModal } from '../components/CompartirModal';
import './Listas.css';
import './Repertorio.css';

export default function Repertorio() {
  const repertorios = useRepertorios();
  const activoId = useRepertorioActivoId();
  const activo = repertorios.find((r) => r.id === activoId) ?? null;
  const { canciones, loading } = useCancionesPorIds(activo?.cancionIds ?? []);

  const [mostrarCompartir, setMostrarCompartir] = useState(false);
  const [creandoNuevo, setCreandoNuevo] = useState(false);
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [editandoNombre, setEditandoNombre] = useState(false);
  const [nombreEdicion, setNombreEdicion] = useState('');

  function confirmarNuevo() {
    if (nombreNuevo.trim()) crearRepertorio(nombreNuevo);
    setNombreNuevo('');
    setCreandoNuevo(false);
  }

  function confirmarRenombre() {
    if (activo && nombreEdicion.trim()) renombrarRepertorio(activo.id, nombreEdicion);
    setEditandoNombre(false);
  }

  return (
    <div className="lista-pagina">
      <header className="lista-header">
        <p className="lista-eyebrow">Misión País</p>
        <h1 className="lista-titulo">Repertorio</h1>
      </header>

      {repertorios.length > 0 && (
        <div className="repertorio-selector">
          {repertorios.map((r) => (
            <button
              key={r.id}
              className={`repertorio-chip${r.id === activoId ? ' activo' : ''}`}
              onClick={() => setRepertorioActivo(r.id)}
            >
              {r.nombre} <span className="repertorio-chip-num">{r.cancionIds.length}</span>
            </button>
          ))}
          {!creandoNuevo && (
            <button className="repertorio-chip repertorio-chip-nuevo" onClick={() => setCreandoNuevo(true)}>
              + Nuevo
            </button>
          )}
        </div>
      )}

      {creandoNuevo && (
        <div className="repertorio-nuevo-form">
          <input
            autoFocus
            className="repertorio-nuevo-input"
            placeholder="Nombre del repertorio (ej. Misa domingo)"
            value={nombreNuevo}
            onChange={(e) => setNombreNuevo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && confirmarNuevo()}
          />
          <button className="lista-btn-primario" onClick={confirmarNuevo}>
            Crear
          </button>
          <button className="lista-btn-secundario" onClick={() => setCreandoNuevo(false)}>
            Cancelar
          </button>
        </div>
      )}

      {activo && !editandoNombre && (
        <div className="repertorio-titulo-activo">
          <h2>{activo.nombre}</h2>
          <button
            className="repertorio-editar-btn"
            onClick={() => {
              setNombreEdicion(activo.nombre);
              setEditandoNombre(true);
            }}
          >
            Renombrar
          </button>
          <button
            className="repertorio-editar-btn repertorio-eliminar-btn"
            onClick={() => {
              if (confirm(`¿Eliminar "${activo.nombre}"?`)) eliminarRepertorio(activo.id);
            }}
          >
            Eliminar
          </button>
        </div>
      )}

      {activo && editandoNombre && (
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
          <button className="lista-btn-secundario" onClick={() => setEditandoNombre(false)}>
            Cancelar
          </button>
        </div>
      )}

      {loading && <p className="lista-estado">Cargando…</p>}

      {!loading && activo && canciones.length === 0 && (
        <div className="lista-vacio">
          <p className="lista-vacio-titulo">Este repertorio está vacío</p>
          <p className="lista-vacio-texto">
            Toca el + junto a una canción para agregarla acá, en el orden que quieras.
          </p>
        </div>
      )}

      {!loading && activo && canciones.length > 0 && (
        <div className="lista-acciones-top">
          <button className="lista-btn-secundario" onClick={() => limpiarRepertorio(activo.id)}>
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
              <button
                onClick={() => activo && moverEnRepertorio(activo.id, c.id, -1)}
                disabled={i === 0}
                aria-label="Mover arriba"
              >
                ▲
              </button>
              <button
                onClick={() => activo && moverEnRepertorio(activo.id, c.id, 1)}
                disabled={i === canciones.length - 1}
                aria-label="Mover abajo"
              >
                ▼
              </button>
            </div>
            <a
              className="tarjeta-cancion-principal"
              href={`/cancion/${c.id}`}
              style={{ flex: 1, textDecoration: 'none' }}
            >
              <span className="tarjeta-cancion-info">
                <span className="tarjeta-cancion-titulo">{c.titulo}</span>
                {c.cancionero?.titulo && (
                  <span className="tarjeta-cancion-sub">{c.cancionero.titulo}</span>
                )}
              </span>
            </a>
            <button
              className="accion-btn"
              onClick={() => activo && quitarDeRepertorio(c.id, activo.id)}
              aria-label="Quitar del repertorio"
              title="Quitar del repertorio"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {mostrarCompartir && activo && (
        <CompartirModal canciones={canciones} onCerrar={() => setMostrarCompartir(false)} />
      )}
    </div>
  );
}
