import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/config/prismaClient.js';
import { createTestAdmin, createTestUser, cleanupTestUsers, loginAs, TEST_USER, TEST_ADMIN } from './helpers.js';

let adminToken, userToken, productId;

beforeAll(async () => {
  await cleanupTestUsers();
  await createTestAdmin();
  await createTestUser();
  adminToken = await loginAs(TEST_ADMIN);
  userToken = await loginAs(TEST_USER);

  const res = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Test Product Cart', price: 10.00, stock: 100 });
  productId = res.body.data.id;
});

describe('GET /api/cart', () => {
  test('devuelve 200 con el carrito activo (lo crea si no existe)', async () => {
    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.status).toBe('ACTIVE');
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  test('devuelve 401 sin autenticación', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.statusCode).toBe(401);
    expect(res.body.ok).toBe(false);
  });
});

describe('POST /api/cart/items', () => {
  test('añade un producto al carrito → 201', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId, quantity: 2 });
    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.productId).toBe(productId);
    expect(res.body.data.quantity).toBe(2);
  });

  test('acumula cantidad si el producto ya está en el carrito', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId, quantity: 3 });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.quantity).toBe(5); // 2 + 3
  });

  test('devuelve 400 sin productId ni quantity', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  test('devuelve 401 sin autenticación', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .send({ productId, quantity: 1 });
    expect(res.statusCode).toBe(401);
    expect(res.body.ok).toBe(false);
  });
});

describe('PATCH /api/cart/items/:productId', () => {
  test('actualiza la cantidad del producto → 200', async () => {
    const res = await request(app)
      .patch(`/api/cart/items/${productId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 10 });
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.quantity).toBe(10);
  });

  test('devuelve 404 si el producto no está en el carrito', async () => {
    const res = await request(app)
      .patch('/api/cart/items/999999')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 1 });
    expect(res.statusCode).toBe(404);
    expect(res.body.ok).toBe(false);
  });

  test('quantity=0 elimina el producto del carrito → 200', async () => {
    const res = await request(app)
      .patch(`/api/cart/items/${productId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 0 });
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

describe('DELETE /api/cart/items/:productId', () => {
  beforeAll(async () => {
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId, quantity: 1 });
  });

  test('elimina el producto del carrito → 200', async () => {
    const res = await request(app)
      .delete(`/api/cart/items/${productId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('devuelve 404 si el producto no está en el carrito', async () => {
    const res = await request(app)
      .delete(`/api/cart/items/${productId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.ok).toBe(false);
  });
});

describe('POST /api/cart/checkout', () => {
  test('devuelve 400 con carrito vacío', async () => {
    const res = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  test('hace checkout y devuelve el pedido → 201', async () => {
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId, quantity: 2 });
    const res = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.total).toBeGreaterThan(0);
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].quantity).toBe(2);
    expect(res.body.data.items[0].priceAtPurchase).toBe(10.00);
  });
});

afterAll(async () => {
  // Sin cascade en el schema: borrar en orden CartItem → Cart → Order antes de borrar usuario
  const user = await prisma.users.findUnique({ where: { email: TEST_USER.email } });
  if (user) {
    await prisma.cartItem.deleteMany({ where: { cart: { userId: user.id } } });
    await prisma.cart.deleteMany({ where: { userId: user.id } });
    await prisma.orderItem.deleteMany({ where: { order: { userId: user.id } } });
    await prisma.order.deleteMany({ where: { userId: user.id } });
  }
  await prisma.product.deleteMany({ where: { name: 'Test Product Cart' } });
  await cleanupTestUsers();
  await prisma.$disconnect();
});
