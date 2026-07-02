import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import prisma from '../../src/config/prismaClient.js';
import { connectDatabases, createTestAdmin, createTestUser, cleanupTestUsers, loginAs, TEST_USER, TEST_ADMIN } from './helpers.js';

const TEST_PRODUCT = { name: 'Test Product', description: 'Producto de test', price: 9.99, stock: 10 };

let adminToken, userToken;

beforeAll(async () => {
  await connectDatabases();
  await cleanupTestUsers();
  await createTestAdmin();
  await createTestUser();
  adminToken = await loginAs(TEST_ADMIN);
  userToken = await loginAs(TEST_USER);
});

describe('GET /api/products', () => {
  test('devuelve 200 y un array de productos', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('POST /api/products', () => {
  test('crea un producto como admin → 201', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(TEST_PRODUCT);
    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.name).toBe(TEST_PRODUCT.name);
  });

  test('devuelve 401 sin autenticación', async () => {
    const res = await request(app).post('/api/products').send(TEST_PRODUCT);
    expect(res.statusCode).toBe(401);
    expect(res.body.ok).toBe(false);
  });

  test('devuelve 403 si el usuario no es admin', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send(TEST_PRODUCT);
    expect(res.statusCode).toBe(403);
    expect(res.body.ok).toBe(false);
  });

  test('devuelve 400 con datos inválidos', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Solo nombre sin precio ni stock' });
    expect(res.statusCode).toBe(400);
    expect(res.body.ok).toBe(false);
  });
});

describe('GET /api/products/:id', () => {
  let productId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...TEST_PRODUCT, name: 'Test Product GET' });
    productId = res.body.data.id;
  });

  test('devuelve 200 con el producto correcto', async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.id).toBe(productId);
  });

  test('devuelve 404 si el producto no existe', async () => {
    const res = await request(app).get('/api/products/999999');
    expect(res.statusCode).toBe(404);
    expect(res.body.ok).toBe(false);
  });
});

describe('PUT /api/products/:id', () => {
  let productId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...TEST_PRODUCT, name: 'Test Product PUT' });
    productId = res.body.data.id;
  });

  test('actualiza un producto → 200', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...TEST_PRODUCT, name: 'Test Product PUT updated', price: 19.99 });
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.price).toBe(19.99);
  });

  test('devuelve 404 si el producto no existe', async () => {
    const res = await request(app)
      .put('/api/products/999999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...TEST_PRODUCT, name: 'Test Product PUT inexistente' });
    expect(res.statusCode).toBe(404);
    expect(res.body.ok).toBe(false);
  });
});

describe('DELETE /api/products/:id', () => {
  let productId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...TEST_PRODUCT, name: 'Test Product DELETE' });
    productId = res.body.data.id;
  });

  test('elimina un producto → 200', async () => {
    const res = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.id).toBe(productId);
  });

  test('devuelve 404 si el producto no existe', async () => {
    const res = await request(app)
      .delete('/api/products/999999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.ok).toBe(false);
  });
});

describe('POST /api/products/:id/image', () => {
  // PNG 1×1 mínimo — imagen válida sin peso real
  const PNG_1X1 = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  let productId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...TEST_PRODUCT, name: 'Test Product IMAGE' });
    productId = res.body.data.id;
  });

  test('sube imagen al producto → 200 con imageUrl de Cloudinary', async () => {
    const res = await request(app)
      .post(`/api/products/${productId}/image`)
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('image', PNG_1X1, { filename: 'test.png', contentType: 'image/png' });
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.imageUrl).toBeDefined();
    expect(res.body.data.imageUrl).toMatch(/^https:\/\/res\.cloudinary\.com/);
  });

  afterAll(async () => {
    // Borramos vía API para que el controller elimine también la imagen de Cloudinary
    await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);
  });
});

afterAll(async () => {
  await prisma.product.deleteMany({ where: { name: { startsWith: 'Test Product' } } });
  await cleanupTestUsers();
  await mongoose.disconnect();
  await prisma.$disconnect();
});
