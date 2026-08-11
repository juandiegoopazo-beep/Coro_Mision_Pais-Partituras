import { createClient } from '@supabase/supabase-js';

// Vite expone env vars prefijadas con VITE_ vía import.meta.env.
// Con fallback a los valores actuales para que el proyecto ande "out of the box";
// mueve esto a un .env (no versionado) antes de compartir el repo públicamente.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://qgpkmeovpbchgeedvfba.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  'sb_publishable_N-Vu4B925jjTVLKa-MngbQ_8HVLiwPn';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
