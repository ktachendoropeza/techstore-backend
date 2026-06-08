const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// FIRMA SECRETA PARA EL TOKEN (En producción muévela a tu .env en Render)
const JWT_SECRET = process.env.JWT_SECRET || 'FirmaSecretaTechStore2026';

// 1. RUTA DE REGISTRO
router.post('/register', async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body;

    // Validar si el usuario ya existe
    let usuarioExiste = await Usuario.findOne({ correo });
    if (usuarioExiste) return res.status(400).json({ mensaje: 'El correo ya está registrado' });

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);

    // Guardar en MongoDB Atlas
    const nuevoUsuario = new Usuario({ nombre, correo, contrasena: contrasenaEncriptada });
    await nuevoUsuario.save();

    res.status(201).json({ mensaje: '✅ Usuario creado exitosamente' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: err.message });
  }
});

// 2. RUTA DE LOGIN
router.post('/login', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    // Verificar si el usuario existe
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) return res.status(400).json({ mensaje: 'Credenciales inválidas' });

    // Validar la contraseña
    const esCorrecta = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!esCorrecta) return res.status(400).json({ mensaje: 'Credenciales inválidas' });

    // Crear y firmar el JWT Token
    const token = jwt.sign({ id: usuario._id }, JWT_SECRET, { expiresIn: '8h' });

    res.json({
      token,
      usuario: { id: usuario._id, nombre: usuario.nombre, correo: usuario.correo }
    });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: err.message });
  }
});

module.exports = router;