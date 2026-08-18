import { useEffect, useRef, useState } from 'react';

const VELOCIDADES = [0.4, 0.7, 1, 1.5, 2.2] as const;

export function useAutoScroll() {
  const [activo, setActivo] = useState(false);
  const [velocidadIndex, setVelocidadIndex] = useState(1);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!activo) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      return;
    }

    let ultimo = performance.now();
    function tick(ahora: number) {
      const dt = ahora - ultimo;
      ultimo = ahora;
      window.scrollBy(0, (VELOCIDADES[velocidadIndex] * dt) / 16);
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
        setActivo(false);
        return;
      }
      frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [activo, velocidadIndex]);

  return {
    activo,
    toggle: () => setActivo((a) => !a),
    velocidadIndex,
    subirVelocidad: () => setVelocidadIndex((i) => Math.min(i + 1, VELOCIDADES.length - 1)),
    bajarVelocidad: () => setVelocidadIndex((i) => Math.max(i - 1, 0)),
  };
}
