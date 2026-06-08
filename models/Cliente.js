const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  correo: { type: String, required: true, unique: true },
  telefono: { type: String, required: true }
}, { versionKey: false });

module.exports = mongoose.model('Cliente', ClienteSchema);