import request from 'supertest';
import app from '../../src/app.js';

describe('GET /health', () => {
  test('devuelve 200 y status up', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.status).toBe('up');
  });
});
