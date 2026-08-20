import { useNavigate } from 'react-router-dom';
import {
  esFavorito,
  toggleFavorito,
  estaEnRepertorio,
  agregarARepertorio,
  quitarDeRepertorio,
} from '../lib/listasLocales';
import { IconEstrella, IconMas, IconFlecha } from './Icons';
import './FilaCancion.css';

interface Props {
  id: number;
  titulo: string;
  subtitulo?: string | null;
  etiqueta?: string | null;
  onCambio?: () => void;
}

export function FilaCancion({ id, titulo, subtitulo, etiqueta, onCambio }: Props) {
  const navigate = useNavigate();
  const favorito = esFavorito(id);
  const enRepertorio = estaEnRepertorio(id);

  return (
    <div className="tarjeta-cancion">
      <button className="tarjeta-cancion-principal" onClick={() => navigate(`/cancion/${id}`)}>
        <span className="tarjeta-cancion-info">
          <span className="tarjeta-cancion-titulo">{titulo}</span>
          {subtitulo && <span className="tarjeta-cancion-sub">{subtitulo}</span>}
        </span>
        <span className="tarjeta-cancion-derecha">
          {etiqueta && <span className="tarjeta-cancion-badge">{etiqueta}</span>}
          <IconFlecha />
        </span>
      </button>

      <div className="tarjeta-cancion-acciones">
        <button
          className={`accion-btn${favorito ? ' activo' : ''}`}
          onClick={() => {
            toggleFavorito(id);
            onCambio?.();
          }}
          aria-label={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          title={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <IconEstrella filled={favorito} />
        </button>
        <button
          className={`accion-btn${enRepertorio ? ' activo' : ''}`}
          onClick={() => {
            if (enRepertorio) quitarDeRepertorio(id);
            else agregarARepertorio(id);
            onCambio?.();
          }}
          aria-label={enRepertorio ? 'Quitar del repertorio' : 'Agregar al repertorio'}
          title={enRepertorio ? 'Quitar del repertorio' : 'Agregar al repertorio'}
        >
          <IconMas activo={enRepertorio} />
        </button>
      </div>
    </div>
  );
}

export default FilaCancion;

