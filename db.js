require('dotenv').config();
const { Pool } = require('pg');

// Configuración de la conexión a PostgreSQL dependiente estrictamente de process.env (.env)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error conectando a PostgreSQL:', err.stack);
  }
  console.log('¡Conectado exitosamente a la base de datos!');
  release();
});

module.exports = pool;
