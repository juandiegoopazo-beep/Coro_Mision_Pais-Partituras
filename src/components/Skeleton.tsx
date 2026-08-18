import './Skeleton.css';

export function SkeletonFila() {
  return (
    <div className="skeleton-fila">
      <div className="skeleton-bloque skeleton-titulo" />
      <div className="skeleton-bloque skeleton-sub" />
    </div>
  );
}

export function SkeletonListaFilas({ cantidad = 6 }: { cantidad?: number }) {
  return (
    <div>
      {Array.from({ length: cantidad }).map((_, i) => (
        <SkeletonFila key={i} />
      ))}
    </div>
  );
}

export function SkeletonAlbumCard() {
  return (
    <div className="skeleton-album">
      <div className="skeleton-bloque skeleton-caratula" />
      <div className="skeleton-bloque skeleton-album-titulo" />
      <div className="skeleton-bloque skeleton-album-sub" />
    </div>
  );
}

export function SkeletonGrillaAlbumes({ cantidad = 8 }: { cantidad?: number }) {
  return (
    <div className="skeleton-grilla">
      {Array.from({ length: cantidad }).map((_, i) => (
        <SkeletonAlbumCard key={i} />
      ))}
    </div>
  );
}
