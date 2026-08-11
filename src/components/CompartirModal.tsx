import { useState } from 'react';
import type { CancionListado } from '../hooks/useListasLocales';
import './CompartirModal.css';

interface Props {
  canciones: CancionListado[];
  onCerrar: () => void;
}

type Formato = 'cuadernillo' | 'enlace' | 'imagen' | 'texto';

export function CompartirModal({ canciones, onCerrar }: Props) {
  const [copiado, setCopiado] = useState<Formato | null>(null);

  const textoPlano = canciones
    .map((c, i) => `${i + 1}. ${c.titulo}${c.pagina != null ? ` (pág. ${c.pagina})` : ''}`)
    .join('\n');

  const enlace = `${window.location.origin}/repertorio?ids=${canciones.map((c) => c.id).join(',')}`;

  async function copiar(texto: string, formato: Formato) {
    await navigator.clipboard.writeText(texto);
    setCopiado(formato);
    setTimeout(() => setCopiado(null), 1800);
  }

  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <div className="modal-caja" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-titulo">Compartir repertorio</h2>

        <button className="modal-opcion" disabled>
          <span className="modal-opcion-titulo">Cuadernillo PDF</span>
          <span className="modal-opcion-desc">
            Próximamente — arma un PDF con la hoja de cada canción, todas del mismo tamaño.
          </span>
        </button>

        <button className="modal-opcion" onClick={() => copiar(enlace, 'enlace')}>
          <span className="modal-opcion-titulo">
            Enlace {copiado === 'enlace' && <span className="modal-copiado">· copiado</span>}
          </span>
          <span className="modal-opcion-desc">Un link con el repertorio completo para compartir.</span>
        </button>

        <button className="modal-opcion" disabled>
          <span className="modal-opcion-titulo">Imagen</span>
          <span className="modal-opcion-desc">Próximamente — foto de la lista para pegar en un grupo.</span>
        </button>

        <button className="modal-opcion" onClick={() => copiar(textoPlano, 'texto')}>
          <span className="modal-opcion-titulo">
            Texto plano {copiado === 'texto' && <span className="modal-copiado">· copiado</span>}
          </span>
          <span className="modal-opcion-desc">Solo los nombres y las páginas.</span>
        </button>

        <button className="modal-cerrar" onClick={onCerrar}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
