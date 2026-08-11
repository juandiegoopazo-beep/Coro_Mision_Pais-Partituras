import { NavLink } from 'react-router-dom';
import './BottomNav.css';

function IconBuscar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconEstrella() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2.5l2.9 6.1 6.6.7-4.9 4.6 1.3 6.6L12 17l-5.9 3.5 1.3-6.6-4.9-4.6 6.6-.7z" />
    </svg>
  );
}

function IconLista() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="3.5" cy="6" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="18" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={({ isActive }) => `bottom-nav-item${isActive ? ' activo' : ''}`}>
        <IconBuscar />
        <span>Buscar</span>
      </NavLink>
      <NavLink to="/favoritos" className={({ isActive }) => `bottom-nav-item${isActive ? ' activo' : ''}`}>
        <IconEstrella />
        <span>Favoritos</span>
      </NavLink>
      <NavLink to="/repertorio" className={({ isActive }) => `bottom-nav-item${isActive ? ' activo' : ''}`}>
        <IconLista />
        <span>Repertorio</span>
      </NavLink>
    </nav>
  );
}
