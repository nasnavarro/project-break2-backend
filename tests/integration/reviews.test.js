import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import prisma from '../../src/config/prismaClient.js';
import Review from '../../src/models/review.model.js';
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
    .send({ name: 'Test Product Reviews', price: 9.99, stock: 10 });
  productId = res.body.data.id;
});

describe('GET /api/products/:id/reviews', () => {
  test('devuelve 200 y array de reviews', async () => {
    const res = await request(app).get(`/api/products/${productId}/reviews`);
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('POST /api/products/:id/reviews', () => {
  test('crea una review autenticado → 201', async () => {
    const res = await request(app)
      .post(`/api/products/${productId}/reviews`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 4, comment: 'Buen producto' });
    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.rating).toBe(4);
  });

  test('devuelve 401 sin autenticación', async () => {
    const res = await request(app)
      .post(`/api/products/${productId}/reviews`)
      .send({ rating: 4, comment: 'Test' });
    expect(res.statusCode).toBe(401);
    expect(res.body.ok).toBe(false);
  });

  test('devuelve 400 sin rating', async () => {
    const res = await request(app)
      .post(`/api/products/${productId}/reviews`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ comment: 'Sin rating' });
    expect(res.statusCode).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  test('devuelve 400 con rating fuera de rango', async () => {
    const res = await request(app)
      .post(`/api/products/${productId}/reviews`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 6, comment: 'Rating inválido' });
    expect(res.statusCode).toBe(400);
    expect(res.body.ok).toBe(false);
  });
});

describe('PUT /api/products/:id/reviews/:reviewId', () => {
  let reviewId;

  beforeAll(async () => {
    const res = await request(app)
      .post(`/api/products/${productId}/reviews`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 3, comment: 'Review a editar' });
    reviewId = res.body.data._id;
  });

  test('edita la review propia → 200', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 5, comment: 'Editada' });
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.rating).toBe(5);
  });

  test('devuelve 403 si intenta editar la review de otro usuario', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ rating: 1 });
    expect(res.statusCode).toBe(403);
    expect(res.body.ok).toBe(false);
  });

  test('devuelve 404 si la review no existe', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}/reviews/000000000000000000000000`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 5 });
    expect(res.statusCode).toBe(404);
    expect(res.body.ok).toBe(false);
  });
});

describe('DELETE /api/products/:id/reviews/:reviewId', () => {
  let userReviewId, adminReviewId;

  beforeAll(async () => {
    const r1 = await request(app)
      .post(`/api/products/${productId}/reviews`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 2, comment: 'Review a borrar por su dueño' });
    userReviewId = r1.body.data._id;

    const r2 = await request(app)
      .post(`/api/products/${productId}/reviews`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ rating: 3, comment: 'Review del admin' });
    adminReviewId = r2.body.data._id;
  });

  test('el usuario borra su propia review → 200', async () => {
    const res = await request(app)
      .delete(`/api/products/${productId}/reviews/${userReviewId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('devuelve 403 si intenta borrar la review de otro sin ser admin', async () => {
    const res = await request(app)
      .delete(`/api/products/${productId}/reviews/${adminReviewId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.ok).toBe(false);
  });

  test('el admin borra la review de otro usuario → 200', async () => {
    const res = await request(app)
      .delete(`/api/products/${productId}/reviews/${adminReviewId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('devuelve 404 si la review no existe', async () => {
    const res = await request(app)
      .delete(`/api/products/${productId}/reviews/000000000000000000000000`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.ok).toBe(false);
  });
});

afterAll(async () => {
  await Review.deleteMany({ productId: String(productId) });
  await prisma.product.deleteMany({ where: { name: 'Test Product Reviews' } });
  await cleanupTestUsers();
  await mongoose.disconnect();
  await prisma.$disconnect();
});
