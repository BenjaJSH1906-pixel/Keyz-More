const PRODUCTION_API = 'https://keyz-more.onrender.com';
const host = location.hostname;
const isLocal = host === 'localhost' || host === '127.0.0.1';
const isRender = host.endsWith('.onrender.com');
window.API_URL = isLocal
  ? (location.port === '3000' ? '' : 'http://localhost:3000')
  : (isRender ? '' : PRODUCTION_API);
