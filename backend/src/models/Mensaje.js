// Modelo: define qué datos de cada mensaje se guardan en MongoDB (colección "mensajes").
import mongoose from 'mongoose';

const mensajeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    email: { type: String, required: true, trim: true, maxlength: 150 },
    message: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
  },
  // Mongo agrega la fecha solo, en el campo "created_at"
  { timestamps: { createdAt: 'created_at', updatedAt: false } },
);

// Al enviar al navegador: _id -> id, y se quita el campo interno __v
mensajeSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('Mensaje', mensajeSchema);
