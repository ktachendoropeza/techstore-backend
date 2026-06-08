const mongoose = require('mongoose');

const VentaSchema = new mongoose.Schema({
  fecha: { type: Date, default: Date.now },
  cliente_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  productos: [
    {
      producto_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
      nombre: { type: String, required: true },
      precio_unitario: { type: Number, required: true },
      cantidad: { type: Number, required: true, min: 1 }
    }
  ],
  total: { type: Number, required: true, default: 0 }
}, { versionKey: false });

module.exports = mongoose.model('Venta', VentaSchema);