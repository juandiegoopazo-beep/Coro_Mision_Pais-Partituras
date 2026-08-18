import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import './Categorizar.css';

const MOMENTOS = [
  'Entrada',
  'Perdón',
  'Gloria',
  'Salmo',
  'Aleluya',
  'Ofertorio',
  'Santo',
  'Cordero',
  'Comunión',
  'Salida / María',
  'Adoración',
  'Espíritu Santo',
  'Adviento',
  'Navidad',
  'Himnos',
  'Otros',
];

interface CancionPendiente {
  id: number;
  titulo: string;
  cancionero: { titulo: string } | null;
}

export default function Categorizar() {
  const [pendientes, setPendientes] = useState<CancionPendiente[]>([]);
  const [indice, setIndice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totalInicial, setTotalInicial] = useState(0);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('canciones')
      .select('id, titulo, cancionero:cancioneros(titulo)')
      .is('momento_liturgico', null)
      .order('titulo');
    const lista = (data ?? []) as unknown as CancionPendiente[];
    setPendientes(lista);
    setTotalInicial((t) => (t === 0 ? lista.length : t));
    setIndice(0);
    setLoading(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function asignar(momento: string) {
    const actual = pendientes[indice];
    if (!actual || !supabaseAdmin) return;
    setGuardando(true);
    await supabaseAdmin.from('canciones').update({ momento_liturgico: momento }).eq('id', actual.id);
    setGuardando(false);
    avanzar();
  }

  function avanzar() {
    setIndice((i) => i + 1);
  }

  if (!supabaseAdmin) {
    return (
      <div className="categorizar-bloqueado">
        <h1>No disponible</h1>
        <p>
          Esta pantalla solo funciona corriendo la app en local con
          <code> VITE_SUPABASE_SERVICE_ROLE_KEY</code> configurada en tu <code>.env.local</code>.
          No está disponible en el sitio público.
        </p>
        <Link to="/">Volver al buscador</Link>
      </div>
    );
  }

  if (loading) return <p className="estado-centro">Cargando…</p>;

  if (pendientes.length === 0 || indice >= pendientes.length) {
    return (
      <div className="categorizar-bloqueado">
        <h1>¡Listo!</h1>
        <p>No quedan canciones sin momento litúrgico asignado.</p>
        <Link to="/">Volver al buscador</Link>
      </div>
    );
  }

  const actual = pendientes[indice];

  return (
    <div className="categorizar">
      <header className="categorizar-header">
        <Link to="/" className="volver-link">
          ← Salir
        </Link>
        <span className="categorizar-progreso">
          {totalInicial - pendientes.length + indice} / {totalInicial}
        </span>
      </header>

      <div className="categorizar-tarjeta">
        <p className="categorizar-cancionero">{actual.cancionero?.titulo}</p>
        <h1 className="categorizar-titulo">{actual.titulo}</h1>
      </div>

      <div className="categorizar-opciones">
        {MOMENTOS.map((m) => (
          <button key={m} className="categorizar-chip" onClick={() => asignar(m)} disabled={guardando}>
            {m}
          </button>
        ))}
      </div>

      <button className="categorizar-saltar" onClick={avanzar} disabled={guardando}>
        Saltar por ahora →
      </button>
    </div>
  );
}
