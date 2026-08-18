import { useState } from 'react';
import { TAMANOS, type TamanoLetra, setTamanoLetra, setModoOscuroVisor } from '../lib/preferenciasLectura';
import { useAutoScroll } from '../hooks/useAutoScroll';
import './VisorControles.css';

interface Props {
  tamano: TamanoLetra;
  onTamanoChange: (t: TamanoLetra) => void;
  oscuro: boolean;
  onOscuroChange: (v: boolean) => void;
}

export function VisorControles({ tamano, onTamanoChange, oscuro, onOscuroChange }: Props) {
  const [abierto, setAbierto] = useState(false);
  const autoScroll = useAutoScroll();

  function cambiarTamano(delta: 1 | -1) {
    const i = TAMANOS.indexOf(tamano);
    const nuevo = TAMANOS[Math.min(Math.max(i + delta, 0), TAMANOS.length - 1)];
    setTamanoLetra(nuevo);
    onTamanoChange(nuevo);
  }

  function alternarOscuro() {
    const nuevo = !oscuro;
    setModoOscuroVisor(nuevo);
    onOscuroChange(nuevo);
  }

  return (
    <div className="visor-controles">
      <button className="visor-controles-toggle" onClick={() => setAbierto((a) => !a)}>
        Ajustes de lectura
      </button>

      {abierto && (
        <div className="visor-controles-panel">
          <div className="visor-controles-fila">
            <span className="visor-controles-label">Tamaño de letra</span>
            <div className="visor-controles-grupo">
              <button onClick={() => cambiarTamano(-1)} disabled={tamano === TAMANOS[0]} aria-label="Achicar letra">
                A−
              </button>
              <button
                onClick={() => cambiarTamano(1)}
                disabled={tamano === TAMANOS[TAMANOS.length - 1]}
                aria-label="Agrandar letra"
              >
                A+
              </button>
            </div>
          </div>

          <div className="visor-controles-fila">
            <span className="visor-controles-label">Modo oscuro (visor)</span>
            <button
              className={`visor-controles-switch${oscuro ? ' activo' : ''}`}
              onClick={alternarOscuro}
              aria-pressed={oscuro}
            >
              {oscuro ? 'Activado' : 'Desactivado'}
            </button>
          </div>

          <div className="visor-controles-fila">
            <span className="visor-controles-label">Auto-scroll</span>
            <div className="visor-controles-grupo">
              <button onClick={autoScroll.bajarVelocidad} aria-label="Más lento">
                −
              </button>
              <button
                className={`visor-controles-play${autoScroll.activo ? ' activo' : ''}`}
                onClick={autoScroll.toggle}
              >
                {autoScroll.activo ? 'Pausar' : 'Iniciar'}
              </button>
              <button onClick={autoScroll.subirVelocidad} aria-label="Más rápido">
                +
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
