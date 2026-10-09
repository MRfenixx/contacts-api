require('dotenv').config();
const { Pool } = require('pg');

// Configuración de la conexión a PostgreSQL mediante variables de entorno (.env)
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'crm_db',
  password: process.env.DB_PASSWORD || 'postgrespassword',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error conectando a PostgreSQL:', err.stack);
  }
  console.log('¡Conectado exitosamente a la base de datos!');
  release();
});

module.exports = pool;
