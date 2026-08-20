import React, { useState } from 'react';
import {
  useRepertorios,
  useRepertorioActivoId,
  useSlotsRepertorio,
  useCancionesPorIds,
  type CancionListado,
} from '../hooks/useListasLocales';
import {
  crearRepertorio,
  renombrarRepertorio,
  eliminarRepertorio,
  setRepertorioActivo,
  limpiarTodosLosSlots,
  aplicarSorteo,
  idsDesdeSlots,
  PARTES_MISA,
  type RepertorioItem,
} from '../lib/listasLocales';
import { elegirAlAzarEnMomento, type CancionParaElegir } from '../lib/repertorioAzar';
import { SlotRepertorioItem } from '../components/SlotRepertorio';
import { CompartirModal } from '../components/CompartirModal';
import './Listas.css';
import './Repertorio.css';

export default function Repertorio() {
  const repertorios = useRepertorios();
  const activoId = useRepertorioActivoId();
  const activo = repertorios.find((r: RepertorioItem) => r.id === activoId) ?? null;
  const slots = useSlotsRepertorio(activoId);

  const idsElegidos = idsDesdeSlots(slots);
  const { canciones } = useCancionesPorIds(idsElegidos);
  const cancionPorId = new Map<number, CancionParaElegir>(
    canciones.map((c: CancionListado) => [
      c.id,
      {
        id: c.id,
        titulo: c.titulo,
        cancionero: c.cancionero,
      },
    ])
  );

  const [mostrarCompartir, setMostrarCompartir] = useState(false);
  const [creandoNuevo, setCreandoNuevo] = useState(false);
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [editandoNombre, setEditandoNombre] = useState(false);
  const [nombreEdicion, setNombreEdicion] = useState('');
  const [generando, setGenerando] = useState(false);

  function confirmarNuevo() {
    if (nombreNuevo.trim()) crearRepertorio(nombreNuevo);
    setNombreNuevo('');
    setCreandoNuevo(false);
  }

  function confirmarRenombre() {
    if (activo && nombreEdicion.trim()) renombrarRepertorio(activo.id, nombreEdicion);
    setEditandoNombre(false);
  }

  async function generarAlAzar() {
    if (!activo) return;
    setGenerando(true);
    const usados = idsDesdeSlots(slots);
    const resultado: Record<string, number | null> = {};
    for (const parte of PARTES_MISA) {
      const yaFijada = slots[parte.momento]?.fijada;
      if (yaFijada) continue;
      const id = await elegirAlAzarEnMomento(parte.momento, usados);
      resultado[parte.momento] = id;
      if (id != null) usados.push(id);
    }
    aplicarSorteo(activo.id, resultado);
    setGenerando(false);
  }

  return (
    <div className="lista-pagina">
      <header className="lista-header">
        <p className="lista-eyebrow">Misión País</p>
        <h1 className="lista-titulo">Repertorio de misa</h1>
        <p className="repertorio-explicacion">
          Arma el repertorio parte por parte. Elige cada canción con el buscador o genera al
          azar. Fija 🔒 las que quieras dejar definitivas y vuelve a generar para rellenar el
          resto. Al final, si quieres, guárdalo como una lista.
        </p>
      </header>

      {repertorios.length > 0 && (
        <div className="repertorio-selector">
          {repertorios.map((r: RepertorioItem) => (
            <button
              key={r.id}
              className={`repertorio-chip${r.id === activoId ? ' activo' : ''}`}
              onClick={() => setRepertorioActivo(r.id)}
            >
              {r.nombre}
            </button>
          ))}
          {!creandoNuevo && (
            <button className="repertorio-chip repertorio-chip-nuevo" onClick={() => setCreandoNuevo(true)}>
              + Nueva lista
            </button>
          )}
        </div>
      )}

      {creandoNuevo && (
        <div className="repertorio-nuevo-form">
          <input
            autoFocus
            className="repertorio-nuevo-input"
            placeholder="Nombre (ej. Misa domingo, ensayo miércoles)"
            value={nombreNuevo}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombreNuevo(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && confirmarNuevo()}
          />
          <button className="lista-btn-primario" onClick={confirmarNuevo}>
            Crear
          </button>
          <button className="lista-btn-secundario" onClick={() => setCreandoNuevo(false)}>
            Cancelar
          </button>
        </div>
      )}

      {activo && !editandoNombre && (
        <div className="repertorio-titulo-activo">
          <h2>{activo.nombre}</h2>
          <button
            className="repertorio-editar-btn"
            onClick={() => {
              setNombreEdicion(activo.nombre);
              setEditandoNombre(true);
            }}
          >
            Renombrar
          </button>
          {repertorios.length > 1 && (
            <button
              className="repertorio-editar-btn repertorio-eliminar-btn"
              onClick={() => {
                if (confirm(`¿Eliminar "${activo.nombre}"?`)) eliminarRepertorio(activo.id);
              }}
            >
              Eliminar
            </button>
          )}
        </div>
      )}

      {activo && editandoNombre && (
        <div className="repertorio-nuevo-form">
          <input
            autoFocus
            className="repertorio-nuevo-input"
            value={nombreEdicion}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombreEdicion(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && confirmarRenombre()}
          />
          <button className="lista-btn-primario" onClick={confirmarRenombre}>
            Guardar
          </button>
          <button className="lista-btn-secundario" onClick={() => setEditandoNombre(false)}>
            Cancelar
          </button>
        </div>
      )}

      {activo && (
        <>
          <div className="lista-acciones-top">
            <button className="lista-btn-secundario" onClick={() => limpiarTodosLosSlots(activo.id)}>
              Limpiar todo
            </button>
            <button className="lista-btn-secundario" onClick={generarAlAzar} disabled={generando}>
              {generando ? 'Generando…' : '🎲 Generar al azar'}
            </button>
            {idsElegidos.length > 0 && (
              <button className="lista-btn-primario" onClick={() => setMostrarCompartir(true)}>
                Compartir
              </button>
            )}
          </div>

          {PARTES_MISA.map((parte: { momento: string; etiqueta: string }) => {
            const slot = slots[parte.momento] ?? { cancionId: null, fijada: false };
            return (
              <SlotRepertorioItem
                key={parte.momento}
                repertorioId={activo.id}
                momento={parte.momento}
                etiqueta={parte.etiqueta}
                slot={slot}
                cancion={slot.cancionId != null ? cancionPorId.get(slot.cancionId) ?? null : null}
                idsYaUsados={idsElegidos}
              />
            );
          })}
        </>
      )}

      {mostrarCompartir && activo && (
        <CompartirModal canciones={canciones} onCerrar={() => setMostrarCompartir(false)} />
      )}
    </div>
  );
}
