const Cliente = require('../models/Cliente');

// GET /clientes - Obtener todos los clientes
exports.obtenerClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener clientes', error });
  }
};

// POST /clientes - Registrar un nuevo cliente
exports.crearCliente = async (req, res) => {
  try {
    const nuevoCliente = new Cliente(req.body);
    await nuevoCliente.save();
    res.status(201).json(nuevoCliente);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al registrar cliente. El correo podría estar duplicado.', error });
  }
};

// DELETE /clientes - Eliminar un cliente 
exports.eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const clienteEliminado = await Cliente.findByIdAndDelete(id);

    if (!clienteEliminado) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado en la base de datos' });
    }

    res.json({ mensaje: 'Cliente eliminado correctamente de Atlas' });
  } catch (error) {
    console.error("❌ Error al eliminar cliente:", error);
    res.status(500).json({ mensaje: 'Error interno al eliminar cliente', error });
  }
};