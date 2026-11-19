// Conexión a MongoDB (Atlas) con Mongoose.
import mongoose from 'mongoose'; // ODM para modelar datos y gestionar la conexión con MongoDB

mongoose.set('sanitizeFilter', true); // evita inyección NoSQL en filtros

// ¿Hay conexión viva con la base de datos?
// readyState === 1 indica que Mongoose está conectado ("connected")
export const dbReady = () => mongoose.connection.readyState === 1;

// Conecta y, si falla (red, clave mala), avisa claro y reintenta cada 10 s.
// El servidor NO se apaga: el login del admin sigue funcionando mientras tanto.
export function connectDb() {
  // Función asíncrona interna que ejecuta un intento de conexión
  const intentar = async () => {
    try {
      // Intenta conectar al clúster usando MONGODB_URI con un límite de 8 segundos para seleccionar servidor
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
      console.log('Base de datos conectada');
    } catch (err) {
      // Informa el error específico y recuerda revisar credenciales y acceso de red en Atlas
      console.error(`No se pudo conectar a MongoDB: ${err.message}`);
      console.error('Revisa MONGODB_URI en el .env y que Atlas permita tu IP. Reintentando en 10 s...');
      // Programa un nuevo intento en 10 segundos (10_000 ms) sin detener el proceso de Node.js
      setTimeout(intentar, 10_000);
    }
  };
  // Dispara el primer intento de conexión al iniciar
  intentar();
}