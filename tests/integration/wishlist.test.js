import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import prisma from '../../src/config/prismaClient.js';
import Wishlist from '../../src/models/wishlist.model.js';
import { connectDatabases, createTestAdmin, createTestUser, cleanupTestUsers, loginAs, TEST_USER, TEST_ADMIN } from './helpers.js';

let adminToken, userToken, productId;

beforeAll(async () => {
  await connectDatabases();
  await cleanupTestUsers();
  await createTestAdmin();
  await createTestUser();
  adminToken = await loginAs(TEST_ADMIN);
  userToken = await loginAs(TEST_USER);

  const res = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Test Product Wishlist', price: 15.00, stock: 50 });
  productId = res.body.data.id;
});

describe('GET /api/wishlist', () => {
  test('devuelve 200 con array de favoritos (vacío inicialmente)', async () => {
    const res = await request(app)
      .get('/api/wishlist')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data.productIds)).toBe(true);
  });

  test('devuelve 401 sin autenticación', async () => {
    const res = await request(app).get('/api/wishlist');
    expect(res.statusCode).toBe(401);
    expect(res.body.ok).toBe(false);
  });
});

describe('POST /api/wishlist/:productId (toggle)', () => {
  test('primer toggle — añade el producto a favoritos → 200', async () => {
    const res = await request(app)
      .post(`/api/wishlist/${productId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.productIds).toContain(String(productId));
  });

  test('GET /api/wishlist refleja el producto añadido', async () => {
    const res = await request(app)
      .get('/api/wishlist')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.body.data.productIds).toContain(String(productId));
  });

  test('segundo toggle — quita el producto de favoritos → 200', async () => {
    const res = await request(app)
      .post(`/api/wishlist/${productId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.productIds).not.toContain(String(productId));
  });

  test('devuelve 401 sin autenticación', async () => {
    const res = await request(app).post(`/api/wishlist/${productId}`);
    expect(res.statusCode).toBe(401);
    expect(res.body.ok).toBe(false);
  });
});

afterAll(async () => {
  const user = await prisma.users.findUnique({ where: { email: TEST_USER.email } });
  if (user) await Wishlist.deleteOne({ userId: String(user.id) });
  await prisma.product.deleteMany({ where: { name: 'Test Product Wishlist' } });
  await cleanupTestUsers();
  await mongoose.disconnect();
  await prisma.$disconnect();
});
