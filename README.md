# Landing ÍNTEGRA – React + Node.js

Estructura monorepo:
- `client/` React (Vite) – landing responsive.
- `server/` Node/Express – sirve archivos estáticos de `client/dist` (opcional en Hostinger; también podés subir solo `client/dist` como sitio estático).

## Variables rápidas
Editá **client/src/config.js** y poné el link de tu Google Form:
```js
export const GOOGLE_FORM_URL = "https://forms.gle/tu-form"; // <-- cambia esto
export const LUCAS_FOTO_HERO = "/images/lucas-hero.jpg";    // reemplazá con tu foto
export const LUCAS_FOTO_ABOUT = "/images/lucas-about.jpg";  // reemplazá con tu foto
```
Colocá las fotos en **client/public/images/**.

## Comandos
En la raíz del proyecto:
```bash
# 1) Instalar dependencias cliente y server
npm run setup

# 2) Correr en desarrollo (cliente + server con proxy)
npm run dev

# 3) Build de producción (cliente) y levantar server
npm run build
npm run start
```

## Deploy en Hostinger
**Opción A (estático recomendado):**
1. `cd client && npm run build` → genera `client/dist`.
2. Subí el contenido de `client/dist` al administrador de archivos (public_html o carpeta asignada a tu dominio).
3. Listo (no necesitás Node para esta opción).

**Opción B (Node/Express):**
1. Subí todo el proyecto al servidor.
2. En Hostinger (plan con Node), configurá la app con `npm run start` y `PORT` asignado por Hostinger.
3. Asegurate de que `client/dist` exista (ejecutá `npm run build` primero) o cambiá `server/index.js` para hacer el build en postinstall.
