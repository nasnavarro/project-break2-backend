import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import prisma from '../../src/config/prismaClient.js';
import { connectDatabases, createTestAdmin, cleanupTestUsers, loginAs, TEST_USER, TEST_ADMIN } from './helpers.js';

beforeAll(async () => {
  await connectDatabases();
  await createTestAdmin();
});

describe('POST /api/auth/register', () => {
  test('registra un usuario nuevo correctamente', async () => {
    const res = await request(app).post('/api/auth/register').send(TEST_USER);
    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);
  });

  test('devuelve 409 si el email ya existe', async () => {
    const res = await request(app).post('/api/auth/register').send(TEST_USER);
    expect(res.statusCode).toBe(409);
    expect(res.body.ok).toBe(false);
  });
});

describe('POST /api/auth/login', () => {
  test('login correcto devuelve token y datos del usuario', async () => {
    const res = await request(app).post('/api/auth/login').send(TEST_USER);
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(TEST_USER.email);
  });

  test('login con contraseña incorrecta devuelve 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: TEST_USER.email, password: 'wrongpassword' });
    expect(res.statusCode).toBe(401);
    expect(res.body.ok).toBe(false);
  });

  test('login con email inexistente devuelve 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'noexiste@test.internal', password: 'Test1234!' });
    expect(res.statusCode).toBe(401);
    expect(res.body.ok).toBe(false);
  });
});

describe('GET /api/me', () => {
  let adminToken;

  beforeAll(async () => {
    adminToken = await loginAs(TEST_ADMIN);
  });

  test('devuelve el perfil del usuario autenticado', async () => {
    const res = await request(app).get('/api/me').set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.email).toBe(TEST_ADMIN.email);
  });

  test('devuelve 401 sin token', async () => {
    const res = await request(app).get('/api/me');
    expect(res.statusCode).toBe(401);
    expect(res.body.ok).toBe(false);
  });
});

afterAll(async () => {
  await cleanupTestUsers();
  await mongoose.disconnect();
  await prisma.$disconnect();
});
