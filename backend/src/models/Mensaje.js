// Modelo: define qué datos de cada mensaje se guardan en MongoDB (colección "mensajes").
import mongoose from 'mongoose'; // ODM para definir esquemas, validaciones y modelos en MongoDB

// Esquema que valida y estructura cada documento de mensaje antes de guardarlo
const mensajeSchema = new mongoose.Schema(
  {
    // Nombre del remitente: obligatorio, sin espacios extremos y entre 3 y 100 caracteres
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    // Correo electrónico del remitente: obligatorio, sin espacios extremos y hasta 150 caracteres
    email: { type: String, required: true, trim: true, maxlength: 150 },
    // Contenido del mensaje: obligatorio, sin espacios extremos y entre 10 y 2000 caracteres
    message: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
  },
  // Mongo agrega la fecha solo, en el campo "created_at"
  { timestamps: { createdAt: 'created_at', updatedAt: false } },
);

// Al enviar al navegador: _id -> id, y se quita el campo interno __v
// Normaliza el JSON serializado para que el frontend reciba un id limpio como string
mensajeSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

// Compila y exporta el modelo 'Mensaje' (Mongoose lo asocia a la colección 'mensajes')
export default mongoose.model('Mensaje', mensajeSchema);