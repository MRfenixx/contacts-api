const { Pool } = require('pg');
// las conexion con las credenciales de la base de datos del docker-compose.yml
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'crm_db',
  password: 'postgrespassword',
  port: 5432,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error conectando a PostgreSQL:', err.stack);
  }
  console.log('¡Conectado exitosamente a la base de datos!');
  release();
});

module.exports = pool;
