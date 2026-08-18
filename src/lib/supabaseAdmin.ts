import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://qgpkmeovpbchgeedvfba.supabase.co';

/**
 * Cliente con permisos de escritura (service_role), SOLO disponible cuando
 * corres la app en local (`npm run dev`) y tienes VITE_SUPABASE_SERVICE_ROLE_KEY
 * en tu .env.local (nunca se sube a git, nunca se incluye en el build de
 * producción — import.meta.env.DEV es false en `npm run build`).
 *
 * Úsalo SOLO para herramientas internas (como /categorizar). El sitio
 * público siempre usa el cliente de solo-lectura en lib/supabase.ts.
 */
export const supabaseAdmin: SupabaseClient | null =
  import.meta.env.DEV && import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY)
    : null;
