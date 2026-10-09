const express = require('express');
const router = express.Router();

const {
  crearContacto,
  obtenerContactos,
  obtenerContactoPorId,
  actualizarNotas
} = require('../controllers/contactos.controller');

// Definición de rutas asociadas a /contactos
router.post('/', crearContacto);
router.get('/', obtenerContactos);
router.get('/:id', obtenerContactoPorId);
router.patch('/:id/notas', actualizarNotas);

module.exports = router;
