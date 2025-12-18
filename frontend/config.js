// frontend/config.js
// Configuración automática para desarrollo/producción
const API_URL = (() => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';  // Desarrollo
  } else {
    return 'https://auth-6myc.onrender.com';  // Producción - CAMBIARÁS ESTO
  }
})();