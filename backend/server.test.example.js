// Example test file showing how to use the exported app
// To run tests, install a testing framework like supertest and jest/mocha

import app from './server.js';
// import request from 'supertest';

// Example test structure (uncomment when testing framework is installed):
/*
describe('Server Health Check', () => {
  it('should return status running', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'running' });
  });
});

describe('Authentication Routes', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/register')
      .send({ email: 'test@example.com', password: 'test123' });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
  });

  it('should login an existing user', async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: 'demo@example.com', password: 'demo123' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});
*/

console.log('App exported successfully for testing');
