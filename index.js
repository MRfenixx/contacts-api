const express = require('express');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: Le dice a Express que vamos a recibir y enviar datos en formato JSON
app.use(express.json());

// Función para inicializar la base de datos
// Lanza un error si la consulta falla para evitar iniciar el servidor sin tabla
const initDB = async () => {
  // Creamos la tabla 'contactos' solo si no existe en la base de datos
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
};

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
    // Capturamos cualquier error de base de datos o servidor para que no explote y respondemos con 500
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

// ==========================================
// 3. ENDPOINT: GET /contactos/:id (Ver un contacto por su ID)
// ==========================================
app.get('/contactos/:id', async (req, res) => {
  try {
    // Extraemos el parámetro 'id' de la URL (req.params)
    const { id } = req.params;

    // Consulta SQL parametrizada para buscar el contacto por su ID único
    const query = 'SELECT * FROM contactos WHERE id = $1;';
    const values = [id];

    const resultado = await pool.query(query, values);

    // Verificamos si el contacto existe en la base de datos (si el array de filas está vacío)
    if (resultado.rows.length === 0) {
      return res.status(404).json({ 
        error: `El contacto con ID ${id} no fue encontrado.` 
      });
    }

    // Si existe, respondemos con código 200 y los datos del contacto
    return res.status(200).json({
      contacto: resultado.rows[0]
    });

  } catch (err) {
    // Capturamos errores (por ejemplo, si envían un ID con formato inválido para un entero en postgres)
    console.error('Error al obtener el contacto:', err);
    return res.status(500).json({ 
      error: 'Error interno del servidor al obtener el contacto.' 
    });
  }
});

// ==========================================
// 4. ENDPOINT: PATCH /contactos/:id/notas (Agregar o actualizar notas de un contacto)
// ==========================================
app.patch('/contactos/:id/notas', async (req, res) => {
  try {
    // Extraemos el ID de los parámetros de la URL y las notas del cuerpo de la petición (JSON)
    const { id } = req.params;
    const { notas } = req.body;

    // Validación: Verificar que el campo notas esté presente en el body
    if (notas === undefined || notas === null) {
      return res.status(400).json({ 
        error: 'El campo "notas" es obligatorio en el cuerpo de la petición.' 
      });
    }

    // Consulta SQL parametrizada para actualizar las notas del contacto y retornar el registro actualizado
    const query = `
      UPDATE contactos 
      SET notas = $1 
      WHERE id = $2 
      RETURNING *;
    `;
    const values = [notas, id];

    const resultado = await pool.query(query, values);

    // Si el contacto no existe, resultado.rows estará vacío -> Retornar error 404
    if (resultado.rows.length === 0) {
      return res.status(404).json({ 
        error: `El contacto con ID ${id} no fue encontrado para actualizar sus notas.` 
      });
    }

    // Respondemos con código 200 y el contacto actualizado
    return res.status(200).json({
      mensaje: 'Notas actualizadas exitosamente',
      contacto: resultado.rows[0]
    });

  } catch (err) {
    // Capturamos cualquier error del servidor
    console.error('Error al actualizar las notas:', err);
    return res.status(500).json({ 
      error: 'Error interno del servidor al actualizar las notas.' 
    });
  }
});

// ==========================================
// Función de arranque seguro (Bootstrap)
// Evita race conditions: Express solo acepta peticiones cuando la DB está confirmada
// ==========================================
const startServer = async () => {
  try {
    // 1. Esperamos a que la base de datos y la tabla estén listas
    await initDB();

    // 2. Solo tras confirmar la base de datos, arrancamos a escuchar peticiones
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    // Si la conexión o la creación de la tabla fallan, detenemos el proceso (Fail-Fast)
    console.error('❌ Error fatal al inicializar la base de datos. Servidor no iniciado:', err);
    process.exit(1);
  }
};

startServer();