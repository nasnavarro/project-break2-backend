import { jest } from '@jest/globals';

const mockCreate = jest.fn();
const mockRetrieve = jest.fn();

jest.unstable_mockModule('../../src/config/stripe.js', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: mockCreate,
        retrieve: mockRetrieve,
      },
    },
  },
}));

const { request, app, createTestAdmin, createTestUser, cleanupTestUsers, loginAs, TEST_USER, TEST_ADMIN } =
  await import('./helpers.js');
const { default: prisma } = await import('../../src/config/prismaClient.js');

let userToken, adminToken, productId, userId;

beforeAll(async () => {
  await cleanupTestUsers();
  await createTestAdmin();
  await createTestUser();
  adminToken = await loginAs(TEST_ADMIN);
  userToken = await loginAs(TEST_USER);

  const user = await prisma.users.findUnique({ where: { email: TEST_USER.email } });
  userId = user.id;

  const res = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Test Product Stripe', price: 25.0, stock: 50 });
  productId = res.body.data.id;
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/cart/checkout/stripe', () => {
  test('devuelve 400 con carrito vacío', async () => {
    const res = await request(app)
      .post('/api/cart/checkout/stripe')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  test('crea la sesión con los items del carrito real, ignorando lo que mande el body → 200', async () => {
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId, quantity: 2 });

    mockCreate.mockResolvedValue({ url: 'https://checkout.stripe.test/session', id: 'cs_test_abc' });

    const res = await request(app)
      .post('/api/cart/checkout/stripe')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ items: [{ name: 'Producto falso', price: 0.01, quantity: 999 }] });

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toEqual({ url: 'https://checkout.stripe.test/session', sessionId: 'cs_test_abc' });

    expect(mockCreate).toHaveBeenCalledTimes(1);
    const callArg = mockCreate.mock.calls[0][0];
    expect(callArg.client_reference_id).toBe(String(userId));
    expect(callArg.line_items).toEqual([
      expect.objectContaining({
        price_data: expect.objectContaining({
          product_data: { name: 'Test Product Stripe' },
          unit_amount: 2500,
        }),
        quantity: 2,
      }),
    ]);
  });

  test('devuelve 401 sin autenticación', async () => {
    const res = await request(app).post('/api/cart/checkout/stripe');
    expect(res.statusCode).toBe(401);
  });
});

describe('POST /api/cart/checkout/stripe/confirm', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId, quantity: 1 });
  });

  test('devuelve 400 sin sessionId', async () => {
    const res = await request(app)
      .post('/api/cart/checkout/stripe/confirm')
      .set('Authorization', `Bearer ${userToken}`)
      .send({});
    expect(res.statusCode).toBe(400);
    expect(mockRetrieve).not.toHaveBeenCalled();
  });

  test('devuelve 403 si la sesión no pertenece al usuario', async () => {
    mockRetrieve.mockResolvedValue({ payment_status: 'paid', client_reference_id: 'otro-usuario' });

    const res = await request(app)
      .post('/api/cart/checkout/stripe/confirm')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ sessionId: 'cs_test_ajeno' });

    expect(res.statusCode).toBe(403);
    expect(res.body.ok).toBe(false);
  });

  test('devuelve 400 si el pago no se ha completado', async () => {
    mockRetrieve.mockResolvedValue({ payment_status: 'unpaid', client_reference_id: String(userId) });

    const res = await request(app)
      .post('/api/cart/checkout/stripe/confirm')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ sessionId: 'cs_test_sinpagar' });

    expect(res.statusCode).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  test('pago confirmado y del usuario → crea el pedido (201) y la segunda confirmación no lo duplica', async () => {
    mockRetrieve.mockResolvedValue({ payment_status: 'paid', client_reference_id: String(userId) });

    const res = await request(app)
      .post('/api/cart/checkout/stripe/confirm')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ sessionId: 'cs_test_pagado' });

    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.total).toBeGreaterThan(0);

    const res2 = await request(app)
      .post('/api/cart/checkout/stripe/confirm')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ sessionId: 'cs_test_pagado' });

    expect(res2.statusCode).toBe(400);
    expect(res2.body.ok).toBe(false);
  });

  test('devuelve 401 sin autenticación', async () => {
    const res = await request(app)
      .post('/api/cart/checkout/stripe/confirm')
      .send({ sessionId: 'cs_test_x' });
    expect(res.statusCode).toBe(401);
  });
});

afterAll(async () => {
  const user = await prisma.users.findUnique({ where: { email: TEST_USER.email } });
  if (user) {
    await prisma.cartItem.deleteMany({ where: { cart: { userId: user.id } } });
    await prisma.cart.deleteMany({ where: { userId: user.id } });
    await prisma.orderItem.deleteMany({ where: { order: { userId: user.id } } });
    await prisma.order.deleteMany({ where: { userId: user.id } });
  }
  await prisma.product.deleteMany({ where: { name: 'Test Product Stripe' } });
  await cleanupTestUsers();
  await prisma.$disconnect();
});
