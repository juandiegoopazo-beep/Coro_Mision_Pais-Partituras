# Cancionero CMP — App web (React + Vite + TypeScript)

Reemplaza los intentos anteriores (React Native y Android nativo). Se
despliega en Netlify y usa el mismo backend Supabase ya armado (32
cancioneros, 2.146 canciones, 11 ya con letra+acordes transcritos).

## 1. Correr en local

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

## 2. Desplegar en Netlify

**Opción A — arrastrando la carpeta (más simple, sin git):**

```bash
npm install
npm run build
```

Esto genera `dist/`. En [app.netlify.com](https://app.netlify.com) →
"Add new site" → "Deploy manually" → arrastra la carpeta `dist/`.

**Opción B — conectado a un repo de Git (recomendado, con auto-deploy):**

1. Sube este proyecto a un repo de GitHub (mismo proceso que ya vimos para
   el intento en React Native: crear repo vacío en GitHub, `git init`,
   `git remote add origin ...`, `git push`).
2. En Netlify → "Add new site" → "Import an existing project" → conecta el
   repo.
3. Build command: `npm run build` — Publish directory: `dist`.
4. Cada `git push` vuelve a desplegar solo.

El archivo `public/_redirects` ya está incluido para que las rutas de
React Router (`/cancion/123`) funcionen en Netlify sin dar 404 al
refrescar.

## 3. Estructura

```
src/
  lib/
    supabase.ts       <- cliente Supabase (URL y key con fallback hardcodeado)
    transposer.ts      <- transportador de tono, notación latina
  types/cancionero.ts   <- tipos TypeScript
  hooks/
    useCancionDetail.ts
    useBuscadorCanciones.ts
  components/
    SongViewer.tsx + .css   <- el visor: letra+acordes o fallback a PDF
  pages/
    Buscador.tsx + .css      <- pantalla de búsqueda/biblioteca
    CancionDetail.tsx        <- pantalla de detalle de una canción
  App.tsx                    <- rutas (React Router)
```

## 4. Identidad visual

Paleta de "misal encuadernado": verde botella profundo (`--verde-tapa`),
dorado de hoja (`--oro`) para acordes y acentos, pergamino cálido
(`--pergamino`) para el texto. Tipografía: **Fraunces** (serifa cálida,
para títulos de canciones — como el nombre grabado en un himnario) +
**Inter** (UI) + **JetBrains Mono** (acordes, para que se lean como
notación técnica). Todo cargado vía Google Fonts en `index.html`.

## 5. Cómo decide la app qué mostrar

Igual que en los intentos anteriores: `SongViewer` mira `formato`.

- `'linea'` / `'estrofa'` → letra+acordes con transportador de tono (+/−).
- `'pdf'` (2.135 de 2.146 hoy) → botón "Abrir PDF del cancionero" con la
  página de referencia.

## 6. Variables de entorno (opcional pero recomendado)

Hoy `src/lib/supabase.ts` trae la URL y la key pública hardcodeadas como
fallback, así que funciona sin configurar nada. Para no versionar
credenciales (aunque la key pública es segura por diseño, gracias a RLS),
puedes crear un `.env.local`:

```
VITE_SUPABASE_URL=https://qgpkmeovpbchgeedvfba.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_N-Vu4B925jjTVLKa-MngbQ_8HVLiwPn
```

Y en Netlify: Site settings → Environment variables → agrega las mismas
dos.

## 7. Pendiente / próximos pasos sugeridos

- **Favoritos y Repertorio**: falta tabla en Supabase
  (`repertorios` + `repertorio_canciones`) y las pantallas.
- **Diagramas de acordes**: se podría sumar un diccionario tipo
  `chords-db-latino.json` (como usa cancionerodigitalcmp) y un componente
  `ChordDiagram`.
- **Transcribir el resto**: sube el próximo PDF que priorices y lo
  proceso igual que el álbum 2026.
- **PWA**: si quieres que se pueda "instalar" en el celular con ícono,
  se puede agregar `vite-plugin-pwa` con un manifest.
