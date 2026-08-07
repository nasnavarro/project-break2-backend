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

const { createStripeCheckoutSession, retrieveStripeCheckoutSession } = await import('../../src/services/stripeCheckout.service.js');

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
        cancelUrl: 'http://localhost:5173/checkout/cancel',
        userId: 7,
      },
    );

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'payment',
      payment_method_types: ['card'],
      // {CHECKOUT_SESSION_ID} lo sustituye Stripe por el id real al redirigir de vuelta
      success_url: 'http://localhost:5173/checkout/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:5173/checkout/cancel',
      // Guarda a qué usuario pertenece la sesión, para poder comprobarlo al confirmar el pago
      client_reference_id: '7',
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

  test('recupera una sesión de Stripe ya creada por su id', async () => {
    mockRetrieve.mockResolvedValue({ id: 'cs_test_123', payment_status: 'paid', client_reference_id: '7' });

    const session = await retrieveStripeCheckoutSession('cs_test_123');

    expect(mockRetrieve).toHaveBeenCalledWith('cs_test_123');
    expect(session).toEqual({ id: 'cs_test_123', payment_status: 'paid', client_reference_id: '7' });
  });
});
