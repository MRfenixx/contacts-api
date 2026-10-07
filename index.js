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

// Arrancar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});