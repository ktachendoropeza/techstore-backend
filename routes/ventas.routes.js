const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/venta.controller');

router.get('/', ventaController.obtenerVentas);
router.post('/', ventaController.crearVenta);

// Rutas de reportes
router.get('/reporte/mayores-10k', ventaController.obtenerGrandesVentas);
router.get('/reporte/total-acumulado', ventaController.obtenerTotalVendido);
router.delete('/:id', ventaController.eliminarVenta);

module.exports = router;