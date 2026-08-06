import { jest } from '@jest/globals';

const mockCreate = jest.fn();

jest.unstable_mockModule('../../src/config/stripe.js', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: mockCreate,
      },
    },
  },
}));

const { createStripeCheckoutSession } = await import('../../src/services/stripeCheckout.service.js');

describe('stripeCheckout.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('crea una sesión de Stripe con los datos esperados', async () => {
    mockCreate.mockResolvedValue({ url: 'https://checkout.stripe.test/session', id: 'cs_test_123' });

    const result = await createStripeCheckoutSession(
      [{ name: 'Viaje a Lisboa', price: 120, quantity: 2 }],
      {
        successUrl: 'http://localhost:5173/checkout/success',
        cancelUrl: 'http://localhost:5173/cart',
      },
    );

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'payment',
      payment_method_types: ['card'],
      success_url: 'http://localhost:5173/checkout/success',
      cancel_url: 'http://localhost:5173/cart',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: { name: 'Viaje a Lisboa' },
            unit_amount: 12000,
          },
          quantity: 2,
        },
      ],
    }));

    expect(result).toEqual({ url: 'https://checkout.stripe.test/session', sessionId: 'cs_test_123' });
  });
});
