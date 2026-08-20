export type FormatoCancion = 'linea' | 'estrofa' | 'partitura' | 'pdf';

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
  partitura_pdf_url: string | null;
  partitura_fuente: string | null;
}

export type CancionRow = Cancion;

export interface PartituraArchivo {
  id: number;
  voz: string;
  pdf_url: string;
  fuente: string | null;
  orden: number;
}

export interface CancionConCancionero extends Cancion {
  cancionero: Pick<
    Cancionero,
    'id' | 'titulo' | 'pdf_url' | 'hoja_offset' | 'autor'
  > | null;
  partitura_archivos: PartituraArchivo[];
}

export interface ResultadoBusqueda {
  id: number;
  titulo: string;
  formato: FormatoCancion;
  momento_liturgico: string | null;
  cancionero_id: string | null;
  cancionero?: { titulo: string } | null;
}
