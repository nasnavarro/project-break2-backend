import { stripe } from '../config/stripe.js';

// client_reference_id guarda a qué usuario pertenece la sesión — lo usamos
// luego en confirmStripeCheckout para comprobar que quien confirma el pago
// es el mismo usuario que lo inició, no cualquiera que consiga el sessionId.
// {CHECKOUT_SESSION_ID} lo sustituye Stripe por el id real al redirigir de vuelta.
export const createStripeCheckoutSession = async (items, { successUrl, cancelUrl, userId }) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    client_reference_id: String(userId),
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
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
  });

  return {
    url: session.url,
    sessionId: session.id,
  };
};

// Recupera una sesión de Stripe ya creada, para comprobar en confirmStripeCheckout
// que el pago se completó de verdad antes de crear el pedido.
export const retrieveStripeCheckoutSession = async (sessionId) =>
  stripe.checkout.sessions.retrieve(sessionId);
