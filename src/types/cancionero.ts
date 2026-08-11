export type FormatoCancion = 'linea' | 'estrofa' | 'pdf';

export interface Cancionero {
  id: string;
  titulo: string;
  autor: string | null;
  anio: number | null;
  tipo: string | null;
  subtitulo: string | null;
  pdf_url: string | null;
  hoja_offset: number | null;
  num_canciones: number | null;
  familia: string | null;
  volumen: number | null;
  serie: string | null;
  orden: number | null;
}

export interface SeccionCancion {
  lyric: string;
  chords: string;
}

export interface Cancion {
  id: number;
  titulo: string;
  cancionero_id: string | null;
  pagina: number | null;
  seccion_original: string | null;
  momento_liturgico: string | null;
  texto_busqueda: string | null;
  numero_original: number | null;
  artista: string | null;
  autor_letra: string | null;
  autor_musica: string | null;
  formato: FormatoCancion;
  secciones: SeccionCancion[] | null;
}

export interface CancionConCancionero extends Cancion {
  cancionero: Pick<
    Cancionero,
    'id' | 'titulo' | 'pdf_url' | 'hoja_offset' | 'autor'
  > | null;
}

export interface ResultadoBusqueda {
  id: number;
  titulo: string;
  formato: FormatoCancion;
  momento_liturgico: string | null;
  cancionero_id: string | null;
  cancionero?: { titulo: string } | null;
}
