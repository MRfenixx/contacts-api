const request = require('supertest');
const app = require('../index');
const pool = require('../config/db');

let createdContactId;

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

  it('Debe retornar 400 si falta el nombre al crear contacto', async () => {
    const response = await request(app)
      .post('/contactos')
      .send({ correo: 'test@example.com' });
    
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('Debe retornar 400 si el correo es inválido al crear contacto', async () => {
    const response = await request(app)
      .post('/contactos')
      .send({ nombre: 'Test User', correo: 'correo-sin-formato' });
    
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('Debe crear un contacto exitosamente (201)', async () => {
    const response = await request(app)
      .post('/contactos')
      .send({
        nombre: 'Usuario Test',
        correo: 'usuario.test@example.com',
        telefono: '3001234567',
        empresa: 'CachalotLab',
        notas: 'Nota inicial'
      });
    
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('contacto');
    expect(response.body.contacto).toHaveProperty('id');
    
    createdContactId = response.body.contacto.id;
  });

  it('Debe obtener un contacto por ID existente (200)', async () => {
    const response = await request(app).get(`/contactos/${createdContactId}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('contacto');
    expect(response.body.contacto.id).toBe(createdContactId);
  });

  it('Debe retornar 404 si el ID no existe al buscar por ID', async () => {
    const response = await request(app).get('/contactos/999999');
    
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('error');
  });

  it('Debe actualizar las notas de un contacto existente (200)', async () => {
    const response = await request(app)
      .patch(`/contactos/${createdContactId}/notas`)
      .send({ notas: 'Nota actualizada en testing automatizado' });
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('contacto');
    expect(response.body.contacto.notas).toBe('Nota actualizada en testing automatizado');
  });

});
