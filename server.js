require('dotenv').config();
const express = require('express');
const cors = require('cors');
const conectarDB = require('./config/db');

const app = express();

// Conectar a MongoDB
conectarDB();

// Middlewares
app.use(cors());
app.use(express.json()); // Permite procesar documentos JSON

// Rutas
app.use('/productos', require('./routes/productos.routes.js'));
app.use('/clientes',require('./routes/clientes.routes.js'));
app.use('/ventas', require('./routes/ventas.routes.js'));

// Puerto e inicio del servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});