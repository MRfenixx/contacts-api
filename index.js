const express = require('express');
const pool = require('./db');

const app = express();
const PORT = 3000;

// Middleware: Le dice a Express que vamos a recibir y enviar datos en formato JSON
app.use(express.json());

// Función para inicializar la base de datos
const initDB = async () => {
  try {
    // Creamos la tabla 'contactos' solo si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contactos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        correo VARCHAR(100) NOT NULL,
        telefono VARCHAR(20),
        empresa VARCHAR(100),
        notas TEXT
      );
    `);
    console.log('✅ Tabla "contactos" lista en la base de datos.');
  } catch (err) {
    console.error('❌ Error creando la tabla:', err);
  }
};

initDB();

// Ruta básica de prueba
app.get('/', (req, res) => {
  res.send('API del CRM funcionando correctamente');
  // res es el objeto que representa la respuesta HTTP que el servidor envía de regreso al cliente
});

// ==========================================
// 1. ENDPOINT: POST /contactos (Crear contacto)
// ==========================================
app.post('/contactos', async (req, res) => {
  try {
    // Extraemos los campos del cuerpo de la petición (JSON)
    const { nombre, correo, telefono, empresa, notas } = req.body;

    // Validación 1: Verificar que los campos obligatorios (nombre y correo) estén presentes
    if (!nombre || !correo) {
      return res.status(400).json({ 
        error: 'Los campos "nombre" y "correo" son obligatorios.' 
      });
    }

    // Validación 2: Verificar el formato del correo usando una expresión regular (Regex) estándar
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({ 
        error: 'El formato del correo electrónico no es válido.' 
      });
    }

    // Consulta SQL parametrizada ($1, $2...) para prevenir ataques de Inyección SQL (SQL Injection)
    const query = `
      INSERT INTO contactos (nombre, correo, telefono, empresa, notas)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    // Valores que se inyectarán de forma segura en la consulta
    const values = [nombre, correo, telefono || null, empresa || null, notas || null];

    // Ejecutamos la consulta en la base de datos usando el Pool
    const resultado = await pool.query(query, values);

    // Respondemos con el código HTTP 201 (Created) y el objeto recién creado
    return res.status(201).json({
      mensaje: 'Contacto creado exitosamente',
      contacto: resultado.rows[0]
    });

  } catch (err) {
    // Capturamos cualquier error de base de datos o servidor y respondemos con 500
    console.error('Error al crear el contacto:', err);
    return res.status(500).json({ 
      error: 'Error interno del servidor al crear el contacto.' 
    });
  }
});

// ==========================================
// 2. ENDPOINT: GET /contactos (Listar y buscar contactos)
// ==========================================
app.get('/contactos', async (req, res) => {
  try {
    // Capturamos el parámetro de consulta ?q= de la URL (si existe)
    const { q } = req.query;

    let query;
    let values = [];

    // Si el usuario envió un término de búsqueda 'q', filtramos por nombre o empresa (case-insensitive con ILIKE)
    if (q) {
      query = `
        SELECT * FROM contactos 
        WHERE nombre ILIKE $1 OR empresa ILIKE $1
        ORDER BY id DESC;
      `;
      // Usamos comodines % alrededor del término para buscar coincidencias parciales de forma segura
      values = [`%${q}%`];
    } else {
      // Si no hay parámetro de búsqueda, traemos todos los contactos ordenados del más reciente al más antiguo
      query = `
        SELECT * FROM contactos 
        ORDER BY id DESC;
      `;
    }

    // Ejecutamos la consulta en la base de datos
    const resultado = await pool.query(query, values);

    // Respondemos con código 200 y la lista de contactos encontrados (resultado.rows)
    return res.status(200).json({
      total: resultado.rows.length,
      contactos: resultado.rows
    });

  } catch (err) {
    // Si ocurre un error inesperado, respondemos con código 500
    console.error('Error al listar los contactos:', err);
    return res.status(500).json({ 
      error: 'Error interno del servidor al listar los contactos.' 
    });
  }
});

// Arrancar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});