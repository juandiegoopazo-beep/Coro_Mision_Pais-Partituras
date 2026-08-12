import type { MomentoConteo } from '../hooks/useMomentosConteo';
import './FiltroChips.css';

interface Props {
  momentos: MomentoConteo[];
  totalCanciones: number;
  seleccionado: string | null; // null = "Todo"
  onSeleccionar: (momento: string | null) => void;
}

export function FiltroChips({ momentos, totalCanciones, seleccionado, onSeleccionar }: Props) {
  return (
    <div className="filtro-chips-scroll">
      <div className="filtro-chips">
        <button
          className={`filtro-chip${seleccionado === null ? ' activo' : ''}`}
          onClick={() => onSeleccionar(null)}
        >
          Todo
        </button>
        {momentos.map((m) => (
          <button
            key={m.momento}
            className={`filtro-chip${seleccionado === m.momento ? ' activo' : ''}`}
            onClick={() => onSeleccionar(m.momento)}
          >
            {m.momento} <span className="filtro-chip-num">{m.cantidad}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
