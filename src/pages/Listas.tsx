import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useListas, useCancionesPorIds } from '../hooks/useListasLocales';
import { crearLista } from '../lib/listasLocales';
import './Listas.css';

export default function Listas() {
  const listas = useListas();
  const [creando, setCreando] = useState(false);
  const [nombre, setNombre] = useState('');

  function confirmar() {
    if (nombre.trim()) crearLista(nombre);
    setNombre('');
    setCreando(false);
  }

  return (
    <div className="lista-pagina">
      <header className="lista-header">
        <p className="lista-eyebrow">Misión País</p>
        <h1 className="lista-titulo">Mis listas</h1>
      </header>

      <div className="lista-acciones-top">
        {!creando ? (
          <button className="lista-btn-primario" onClick={() => setCreando(true)}>
            + Nueva lista
          </button>
        ) : (
          <div className="repertorio-nuevo-form" style={{ width: '100%' }}>
            <input
              autoFocus
              className="repertorio-nuevo-input"
              placeholder="Nombre de la lista (ej. Para aprender, Bodas)"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirmar()}
            />
            <button className="lista-btn-primario" onClick={confirmar}>
              Crear
            </button>
            <button className="lista-btn-secundario" onClick={() => setCreando(false)}>
              Cancelar
            </button>
          </div>
        )}
      </div>

      <ul className="listas-grid">
        {listas.map((l) => (
          <ListaCard key={l.id} id={l.id} nombre={l.nombre} cancionIds={l.cancionIds} esFavoritos={l.esFavoritos} />
        ))}
      </ul>
    </div>
  );
}

function ListaCard({
  id,
  nombre,
  cancionIds,
  esFavoritos,
}: {
  id: string;
  nombre: string;
  cancionIds: number[];
  esFavoritos?: boolean;
}) {
  return (
    <li>
      <Link to={`/lista/${id}`} className="lista-card">
        <div className={`lista-card-icono${esFavoritos ? ' lista-card-icono-favoritos' : ''}`}>
          {esFavoritos ? '★' : '🎵'}
        </div>
        <div className="lista-card-info">
          <span className="lista-card-nombre">{nombre}</span>
          <span className="lista-card-conteo">
            {cancionIds.length} canción{cancionIds.length === 1 ? '' : 'es'}
          </span>
        </div>
      </Link>
    </li>
  );
}
