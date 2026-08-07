import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import * as cartController from "../controllers/cart.controller.js";

const router = Router();

// Todas las rutas del carrito requieren autenticación

/**
 * @openapi
 * tags:
 *   name: Carrito
 *   description: Carrito de compra y checkout
 */

// Getters
/**
 * @openapi
 * /api/cart:
 *   get:
 *     tags: [Carrito]
 *     summary: Ver carrito activo (lo crea si no existe)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito activo con sus productos
 *       401:
 *         description: No autenticado
 */
router.get('/', authenticate, cartController.getCart);

// Post
/**
 * @openapi
 * /api/cart/items:
 *   post:
 *     tags: [Carrito]
 *     summary: Añadir producto al carrito (acumula si ya existe)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *     responses:
 *       201:
 *         description: Producto añadido al carrito
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 */
router.post('/items', authenticate, cartController.addItem);

// Patch
/**
 * @openapi
 * /api/cart/items/{productId}:
 *   patch:
 *     tags: [Carrito]
 *     summary: Actualizar cantidad de un producto (quantity 0 lo elimina)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 0
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cantidad actualizada (o producto eliminado si quantity es 0)
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Producto no encontrado en el carrito
 */
router.patch('/items/:productId', authenticate, cartController.updateItem);

// Delete
/**
 * @openapi
 * /api/cart/items/{productId}:
 *   delete:
 *     tags: [Carrito]
 *     summary: Eliminar producto del carrito
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado del carrito
 *       404:
 *         description: Producto no encontrado en el carrito
 */
router.delete('/items/:productId', authenticate, cartController.removeItem);

// Post checkout
/**
 * @openapi
 * /api/cart/checkout:
 *   post:
 *     tags: [Carrito]
 *     summary: Finalizar compra y crear pedido
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: >
 *           Pedido creado con el total calculado al momento del checkout.
 *           Incluye un array `items` con el detalle de cada línea (producto,
 *           cantidad y precio en el momento de la compra).
 *       400:
 *         description: Carrito vacío o sin carrito activo
 *       401:
 *         description: No autenticado
 */
router.post('/checkout', authenticate, cartController.checkout);

/**
 * @openapi
 * /api/cart/checkout/stripe:
 *   post:
 *     tags: [Carrito]
 *     summary: Crear sesión de Stripe para pagar el carrito activo
 *     description: >
 *       Los ítems y precios se toman siempre del carrito activo real en el
 *       servidor (no se aceptan por body) — así no hay forma de manipular
 *       lo que se le cobra al usuario en Stripe.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión de Stripe creada correctamente
 *       400:
 *         description: Carrito vacío o sin carrito activo
 *       401:
 *         description: No autenticado
 */
router.post('/checkout/stripe', authenticate, cartController.createStripeCheckout);

/**
 * @openapi
 * /api/cart/checkout/stripe/confirm:
 *   post:
 *     tags: [Carrito]
 *     summary: Confirmar una sesión de Stripe pagada y crear el pedido
 *     description: >
 *       Se llama al volver a la success_url de Stripe. Comprueba contra la API
 *       de Stripe que la sesión es de este usuario (client_reference_id) y que
 *       el pago se completó (payment_status), y solo entonces crea el pedido
 *       (mismo efecto que /api/cart/checkout, pero solo si Stripe confirma el pago).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sessionId]
 *             properties:
 *               sessionId:
 *                 type: string
 *                 example: cs_test_a1b2c3
 *     responses:
 *       201:
 *         description: Pedido creado
 *       400:
 *         description: sessionId inválido, carrito vacío/sin carrito activo, o pago no completado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: La sesión de Stripe no pertenece a este usuario
 */
router.post('/checkout/stripe/confirm', authenticate, cartController.confirmStripeCheckout);

export default router;
