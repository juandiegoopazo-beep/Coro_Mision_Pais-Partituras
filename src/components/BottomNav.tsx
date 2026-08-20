import { NavLink } from 'react-router-dom';
import { IconSearch, IconHeart, IconList } from './Icons';
import './BottomNav.css';

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink 
        to="/" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        end
      >
        <IconSearch className="nav-icon" />
        <span>Buscar</span>
      </NavLink>

      <NavLink 
        to="/favoritos" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <IconHeart className="nav-icon" />
        <span>Listas</span>
      </NavLink>

      <NavLink 
        to="/repertorio" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <IconList className="nav-icon" />
        <span>Repertorio</span>
      </NavLink>
    </nav>
  );
}

export default BottomNav;
