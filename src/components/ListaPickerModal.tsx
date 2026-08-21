import { useListas } from '../hooks/useListasLocales';
import { toggleEnLista, crearLista } from '../lib/listasLocales';
import { useState } from 'react';
import './ListaPickerModal.css';

interface Props {
  cancionId: number;
  onCerrar: () => void;
}

export function ListaPickerModal({ cancionId, onCerrar }: Props) {
  const listas = useListas();
  const [creando, setCreando] = useState(false);
  const [nombre, setNombre] = useState('');

  function confirmarNueva() {
    if (nombre.trim()) {
      const nueva = crearLista(nombre);
      toggleEnLista(nueva.id, cancionId);
    }
    setNombre('');
    setCreando(false);
  }

  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <div className="modal-caja" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-titulo">Agregar a lista</h2>

        <ul className="lista-picker-items">
          {listas.map((l) => {
            const marcada = l.cancionIds.includes(cancionId);
            return (
              <li key={l.id}>
                <button
                  className="lista-picker-item"
                  onClick={() => toggleEnLista(l.id, cancionId)}
                >
                  <span className={`lista-picker-check${marcada ? ' marcada' : ''}`}>
                    {marcada ? '✓' : ''}
                  </span>
                  <span>{l.esFavoritos ? '★ Favoritos' : l.nombre}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {!creando ? (
          <button className="lista-picker-nueva-btn" onClick={() => setCreando(true)}>
            + Nueva lista
          </button>
        ) : (
          <div className="lista-picker-nueva-form">
            <input
              autoFocus
              className="elegir-input"
              placeholder="Nombre de la lista"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirmarNueva()}
            />
            <button className="lista-btn-primario" onClick={confirmarNueva}>
              Crear y agregar
            </button>
          </div>
        )}

        <button className="modal-cerrar" onClick={onCerrar}>
          Listo
        </button>
      </div>
    </div>
  );
}
