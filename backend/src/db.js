// Conexión a MongoDB (Atlas) con Mongoose.
import mongoose from 'mongoose';

mongoose.set('sanitizeFilter', true); // evita inyección NoSQL en filtros

// ¿Hay conexión viva con la base de datos?
export const dbReady = () => mongoose.connection.readyState === 1;

// Conecta y, si falla (red, clave mala), avisa claro y reintenta cada 10 s.
// El servidor NO se apaga: el login del admin sigue funcionando mientras tanto.
export function connectDb() {
  const intentar = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
      console.log('Base de datos conectada');
    } catch (err) {
      console.error(`No se pudo conectar a MongoDB: ${err.message}`);
      console.error('Revisa MONGODB_URI en el .env y que Atlas permita tu IP. Reintentando en 10 s...');
      setTimeout(intentar, 10_000);
    }
  };
  intentar();
}
