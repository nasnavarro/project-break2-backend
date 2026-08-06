import { stripe } from '../config/stripe.js';

export const createStripeCheckoutSession = async (items, { successUrl, cancelUrl }) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    })),
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return {
    url: session.url,
    sessionId: session.id,
  };
};
