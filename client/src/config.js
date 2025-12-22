// client/src/config.js

// URL pública de tu API en Koyeb (ej: https://tu-app.koyeb.app)
export const API_URL = import.meta.env.VITE_API_URL || "https://primary-violetta-asesoriatecnologica-05a5ba92.koyeb.app/";

// PDF servido por el mismo front (Vite) desde /public/ebook/...
export const EBOOK_URL = `${import.meta.env.BASE_URL}ebook/Codigo-Financiero.pdf`;
