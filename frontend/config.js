// URL del backend.
// - Si abres la página desde http://localhost:3000 (recomendado) usa la misma dirección.
// - Si la abres con otro servidor (Live Server), apunta a localhost:3000.
// - Al publicar en GitHub Pages, cambia PRODUCTION_API por la URL de tu backend en Render.
const PRODUCTION_API = 'https://TU-BACKEND.onrender.com';
const host = location.hostname;
const isLocal = host === 'localhost' || host === '127.0.0.1';
window.API_URL = isLocal ? (location.port === '3000' ? '' : 'http://localhost:3000') : PRODUCTION_API;
