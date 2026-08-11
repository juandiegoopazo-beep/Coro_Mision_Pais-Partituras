import { Routes, Route } from 'react-router-dom';
import Buscador from './pages/Buscador';
import CancionDetail from './pages/CancionDetail';
import './App.css';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Buscador />} />
      <Route path="/cancion/:id" element={<CancionDetail />} />
    </Routes>
  );
}
