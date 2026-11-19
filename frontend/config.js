// URL pública del backend desplegado en la nube (se usa cuando la web no corre en local)
const PRODUCTION_API = 'https://TU-BACKEND.onrender.com';
// Obtiene el nombre del dominio o host actual desde donde se abrió la página
const host = location.hostname;
// Verifica si la página se está ejecutando en desarrollo local (localhost o 127.0.0.1)
const isLocal = host === 'localhost' || host === '127.0.0.1';
// Define la URL base de la API: si es local y ya está en el puerto 3000 usa ruta relativa (''),
// si es local en otro puerto apunta a 'http://localhost:3000', y si está en producción usa PRODUCTION_API
window.API_URL = isLocal ? (location.port === '3000' ? '' : 'http://localhost:3000') : PRODUCTION_API;
