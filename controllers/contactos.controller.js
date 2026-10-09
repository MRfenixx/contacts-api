const pool = require('../config/db');

// ==========================================
// CONTROLADOR: CREAR CONTACTO (POST /contactos)
// ==========================================
const crearContacto = async (req, res, next) => {
  try {
    const { nombre, correo, telefono, empresa, notas } = req.body;

    // Validación 1: Campos obligatorios
    if (!nombre || !correo) {
      return res.status(400).json({ 
        error: 'Los campos "nombre" y "correo" son obligatorios.' 
      });
    }

    // Validación 2: Formato de correo con Regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({ 
        error: 'El formato del correo electrónico no es válido.'  
      });
    }

    // Consulta SQL parametrizada para prevenir SQL Injection
    const query = `
      INSERT INTO contactos (nombre, correo, telefono, empresa, notas)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [nombre, correo, telefono || null, empresa || null, notas || null];

    const resultado = await pool.query(query, values);

    return res.status(201).json({
      mensaje: 'Contacto creado exitosamente',
      contacto: resultado.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// CONTROLADOR: OBTENER/BUSCAR CONTACTOS (GET /contactos)
// ==========================================
const obtenerContactos = async (req, res, next) => {
  try {
    const { q } = req.query;
    let query;
    let values = [];

    if (q) {
      query = `
        SELECT * FROM contactos 
        WHERE nombre ILIKE $1 OR empresa ILIKE $1
        ORDER BY id DESC;
      `;
      values = [`%${q}%`];
    } else {
      query = `
        SELECT * FROM contactos 
        ORDER BY id DESC;
      `;
    }

    const resultado = await pool.query(query, values);

    return res.status(200).json({
      total: resultado.rows.length,
      contactos: resultado.rows
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// CONTROLADOR: OBTENER CONTACTO POR ID (GET /contactos/:id)
// ==========================================
const obtenerContactoPorId = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validación de ID numérico (Fase 3 / robustez)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'El ID debe ser numérico.' });
    }

    const query = 'SELECT * FROM contactos WHERE id = $1;';
    const values = [id];

    const resultado = await pool.query(query, values);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ 
        error: `El contacto con ID ${id} no fue encontrado.` 
      });
    }

    return res.status(200).json({
      contacto: resultado.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// CONTROLADOR: ACTUALIZAR NOTAS (PATCH /contactos/:id/notas)
// ==========================================
const actualizarNotas = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notas } = req.body;

    // Validación de ID numérico
    if (isNaN(id)) {
      return res.status(400).json({ error: 'El ID debe ser numérico.' });
    }

    if (notas === undefined || notas === null) {
      return res.status(400).json({ 
        error: 'El campo "notas" es obligatorio en el cuerpo de la petición.' 
      });
    }

    const query = `
      UPDATE contactos 
      SET notas = $1 
      WHERE id = $2 
      RETURNING *;
    `;
    const values = [notas, id];

    const resultado = await pool.query(query, values);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ 
        error: `El contacto con ID ${id} no fue encontrado para actualizar sus notas.` 
      });
    }

    return res.status(200).json({
      mensaje: 'Notas actualizadas exitosamente',
      contacto: resultado.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  crearContacto,
  obtenerContactos,
  obtenerContactoPorId,
  actualizarNotas
};
