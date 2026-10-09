const request = require('supertest');
const app = require('../index');
const pool = require('../config/db');

afterAll(async () => {
  // Cerramos la conexión del pool de postgres al finalizar los tests para evitar que Jest se quede colgado
  await pool.end();
});

describe('Endpoints de Contactos', () => {
  
  it('Debe retornar 200 al listar contactos', async () => {
    const response = await request(app).get('/contactos');
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('contactos');
    expect(Array.isArray(response.body.contactos)).toBe(true);
  });

  it('Debe retornar 400 si el ID no es numérico', async () => {
    const response = await request(app).get('/contactos/elpepe');
    
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'El ID debe ser un valor numérico');
  });

});
