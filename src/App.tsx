import { Routes, Route } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import Buscador from './pages/Buscador';
import Listas from './pages/Listas';
import ListaDetail from './pages/ListaDetail';
import Repertorio from './pages/Repertorio';
import CancionDetail from './pages/CancionDetail';
import AlbumDetail from './pages/AlbumDetail';
import Categorizar from './pages/Categorizar';
import './App.css';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Buscador />} />
        <Route path="/listas" element={<Listas />} />
        <Route path="/lista/:id" element={<ListaDetail />} />
        <Route path="/repertorio" element={<Repertorio />} />
        <Route path="/cancion/:id" element={<CancionDetail />} />
        <Route path="/album/:id" element={<AlbumDetail />} />
        <Route path="/categorizar" element={<Categorizar />} />
      </Routes>
      <BottomNav />
    </>
  );
}
