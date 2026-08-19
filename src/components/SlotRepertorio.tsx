import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  elegirEnSlot,
  toggleFijarSlot,
  vaciarSlot,
  type SlotRepertorio as SlotData,
} from '../lib/listasLocales';
import { elegirAlAzarEnMomento, type CancionParaElegir } from '../lib/repertorioAzar';
import { ElegirCancionModal } from './ElegirCancionModal';
import './SlotRepertorio.css';

interface Props {
  repertorioId: string;
  momento: string;
  etiqueta: string;
  slot: SlotData;
  cancion: CancionParaElegir | null;
  idsYaUsados: number[];
}

export function SlotRepertorioItem({ repertorioId, momento, etiqueta, slot, cancion, idsYaUsados }: Props) {
  const [mostrarElegir, setMostrarElegir] = useState(false);
  const [sorteando, setSorteando] = useState(false);

  async function azar() {
    setSorteando(true);
    const id = await elegirAlAzarEnMomento(momento, idsYaUsados);
    if (id != null) elegirEnSlot(repertorioId, momento, id);
    setSorteando(false);
  }

  return (
    <div className={`slot-parte${slot.fijada ? ' slot-fijada' : ''}`}>
      <div className="slot-parte-header">
        <h3 className="slot-parte-titulo">{etiqueta}</h3>
        <div className="slot-parte-acciones">
          <button className="slot-btn" onClick={() => setMostrarElegir(true)}>
            Elegir
          </button>
          <button className="slot-btn" onClick={azar} disabled={sorteando}>
            Azar
          </button>
          <button
            className={`slot-btn${slot.fijada ? ' slot-btn-fijada' : ''}`}
            onClick={() => toggleFijarSlot(repertorioId, momento)}
          >
            {slot.fijada ? '🔒 Fijada' : 'Fijar'}
          </button>
          <button className="slot-btn slot-btn-vaciar" onClick={() => vaciarSlot(repertorioId, momento)}>
            Vaciar
          </button>
        </div>
      </div>

      <div className="slot-parte-contenido">
        {cancion ? (
          <Link to={`/cancion/${cancion.id}`} className="slot-cancion-elegida">
            <span className="slot-cancion-titulo">{cancion.titulo}</span>
            {cancion.cancionero?.titulo && (
              <span className="slot-cancion-sub">{cancion.cancionero.titulo}</span>
            )}
          </Link>
        ) : (
          <p className="slot-sin-elegir">— sin elegir —</p>
        )}
      </div>

      {mostrarElegir && (
        <ElegirCancionModal
          momento={momento}
          etiqueta={etiqueta}
          onElegir={(id) => elegirEnSlot(repertorioId, momento, id)}
          onCerrar={() => setMostrarElegir(false)}
        />
      )}
    </div>
  );
}
