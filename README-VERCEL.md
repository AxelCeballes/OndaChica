# Onda Chica — Vercel

Proyecto Vite + React preparado para Vercel.

## Deploy

1. Subir estos archivos al repositorio de GitHub.
2. En Vercel: Add New → Project → importar `AxelCeballes/OndaChic`.
3. Framework Preset: Vite.
4. Build Command: `pnpm run build`.
5. Output Directory: `dist`.
6. Install Command: `pnpm install --frozen-lockfile`.
7. Deploy.

La aplicación queda configurada para servirse desde `/` y las rutas desconocidas vuelven a `index.html`, evitando pantallas en blanco/404 en una SPA.
