import { useNavigate } from 'react-router-dom';
import type { AlbumConConteo } from '../hooks/useAlbumes';
import './AlbumCard.css';

interface Props {
  album: AlbumConConteo;
}

const GRADIENTES = [
  'linear-gradient(135deg, #2f5d4e, #17140f)',
  'linear-gradient(135deg, #c9a24b, #7a5230)',
  'linear-gradient(135deg, #6b4a8a, #2a1f3d)',
  'linear-gradient(135deg, #1f5f7a, #12293a)',
  'linear-gradient(135deg, #8a3b4a, #3a1418)',
];

function gradientePara(id: string) {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return GRADIENTES[hash % GRADIENTES.length];
}

export function AlbumCard({ album }: Props) {
  const navigate = useNavigate();

  return (
    <button className="album-card" onClick={() => navigate(`/album/${album.id}`)}>
      <div
        className="album-caratula"
        style={!album.caratula_url ? { background: gradientePara(album.id) } : undefined}
      >
        {album.caratula_url ? (
          <img src={album.caratula_url} alt={album.titulo} loading="lazy" />
        ) : (
          <span className="album-caratula-placeholder">{album.titulo}</span>
        )}
      </div>
      <div className="album-info">
        <p className="album-titulo">{album.titulo}</p>
        <div className="album-meta">
          {album.volumen != null && (
            <span className="album-vol">Vol. {romano(album.volumen)}</span>
          )}
          <span className="album-count">{album.conteo_real}</span>
        </div>
      </div>
    </button>
  );
}

function romano(n: number): string {
  const valores: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let resto = n;
  let resultado = '';
  for (const [valor, simbolo] of valores) {
    while (resto >= valor) {
      resultado += simbolo;
      resto -= valor;
    }
  }
  return resultado || String(n);
}
