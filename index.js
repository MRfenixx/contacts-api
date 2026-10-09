const express = require('express');
const pool = require('./config/db');
const contactosRoutes = require('./routes/contactos.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: Le dice a Express que vamos a recibir y enviar datos en formato JSON
app.use(express.json());

// Función para inicializar la base de datos
// Lanza un error si la consulta falla para evitar iniciar el servidor sin tabla
const initDB = async () => {
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
});

// Registro de rutas del CRM
app.use('/contactos', contactosRoutes);

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
