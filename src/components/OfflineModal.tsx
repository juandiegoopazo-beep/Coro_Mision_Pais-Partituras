import { useOfflineSync } from '../hooks/useOfflineSync';
import './OfflineModal.css';

interface Props {
  onCerrar: () => void;
}

export function OfflineModal({ onCerrar }: Props) {
  const { tieneDatos, ultimaSync, sincronizando, progreso, error, enLinea, sincronizar } =
    useOfflineSync();

  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <div className="modal-caja" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-titulo">Usar sin conexión</h2>
        <p className="offline-desc">
          Guarda todas las canciones (título, letra y acordes) en tu teléfono para abrirlas
          aunque no tengas internet. Los PDFs de partitura y cancionero siguen necesitando
          conexión por ahora.
        </p>

        {!enLinea && (
          <p className="offline-aviso offline-aviso-rojo">
            Estás sin conexión ahora mismo{tieneDatos ? ' — usando la copia guardada.' : '.'}
          </p>
        )}

        {tieneDatos && ultimaSync && (
          <p className="offline-aviso">
            Última descarga: {new Date(ultimaSync).toLocaleString('es-CL')}
          </p>
        )}

        {sincronizando && progreso && (
          <p className="offline-aviso">
            {progreso.etapa === 'cancioneros' && 'Descargando álbumes…'}
            {progreso.etapa === 'canciones' && `Descargando canciones… (${progreso.cargadas})`}
            {progreso.etapa === 'listo' && `Listo — ${progreso.cargadas} canciones guardadas.`}
          </p>
        )}

        {error && <p className="offline-aviso offline-aviso-rojo">{error}</p>}

        <button
          className="pdf-btn offline-btn-descargar"
          onClick={sincronizar}
          disabled={sincronizando || !enLinea}
        >
          {sincronizando ? 'Descargando…' : tieneDatos ? 'Actualizar copia local' : 'Descargar todo'}
        </button>

        <button className="modal-cerrar" onClick={onCerrar}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
