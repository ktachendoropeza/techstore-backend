const Venta = require('../models/Venta');
const Producto = require('../models/Producto');

// POST /ventas - Registrar una venta y descontar inventario
exports.crearVenta = async (req, res) => {
  const { cliente_id, productos } = req.body; // productos es un array de { producto_id, cantidad }

  try {
    let totalVenta = 0;
    const productosDetalle = [];

    // Iterar y validar cada producto del carrito
    for (const item of productos) {
      const productoDb = await Producto.findById(item.producto_id);
      
      if (!productoDb) {
        return res.status(404).json({ mensaje: `Producto con ID ${item.producto_id} no encontrado` });
      }

      if (productoDb.stock < item.cantidad) {
        return res.status(400).json({ mensaje: `Stock insuficiente para: ${productoDb.nombre}. Disponible: ${productoDb.stock}` });
      }

      // Calcular subtotal e ir sumando al total de la venta
      const subtotal = productoDb.precio * item.cantidad;
      totalVenta += subtotal;

      // Restar del stock físico y guardar el producto actualizado
      productoDb.stock -= item.cantidad;
      await productoDb.save();

      // Estructurar el producto para el historial de la venta
      productosDetalle.push({
        producto_id: productoDb._id,
        nombre: productoDb.nombre,
        precio_unitario: productoDb.precio,
        cantidad: item.cantidad
      });
    }

    // Crear y guardar el documento final de la Venta
    const nuevaVenta = new Venta({
      cliente_id,
      productos: productosDetalle,
      total: totalVenta
    });

    await nuevaVenta.save();
    res.status(201).json(nuevaVenta);

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al procesar la venta', error: error.message });
  }
};

// GET /ventas - Consultar historial de ventas (con populate para traer datos del cliente)
exports.obtenerVentas = async (req, res) => {
  try {
    const ventas = await Venta.find().populate('cliente_id', 'nombre correo');
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el historial de ventas', error });
  }
};

// DELETE /ventas - Eliminar una venta omg
exports.eliminarVenta = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Buscar la venta original para saber qué se vendió
    const venta = await Venta.findById(id);
    if (!venta) {
      return res.status(404).json({ mensaje: 'La nota de venta no existe' });
    }

    // 2. Regresar las piezas vendidas al inventario de productos de forma automática
    for (const item of venta.productos) {
      await Producto.findByIdAndUpdate(item.producto_id, {
        $inc: { stock: item.cantidad } // Suma/Incrementa el stock de vuelta
      });
    }

    // 3. Borrar físicamente la venta de MongoDB
    await Venta.findByIdAndDelete(id);

    res.json({ mensaje: 'Venta cancelada con éxito y stock devuelto' });
  } catch (error) {
    console.error("❌ Error al eliminar venta:", error);
    res.status(500).json({ mensaje: 'Error interno al eliminar la venta', error: error.message });
  }
};

// === CONSULTAS DE AGREGACIÓN (Para los reportes de la Universidad) ===

// Reporte 1: Ventas mayores a $10,000
exports.obtenerGrandesVentas = async (req, res) => {
  try {
    const ventasGrandes = await Venta.find({ total: { $gt: 10000 } }).populate('cliente_id', 'nombre');
    res.json(ventasGrandes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar reportes', error });
  }
};

// Reporte 2: Total acumulado de ingresos (Suma usando .aggregate de MongoDB)
exports.obtenerTotalVendido = async (req, res) => {
  try {
    const resultado = await Venta.aggregate([
      { $group: { _id: null, totalVendido: { $sum: "$total" } } }
    ]);
    res.json({ total: resultado[0]?.totalVendido || 0 });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al calcular total acumulado', error });
  }
};