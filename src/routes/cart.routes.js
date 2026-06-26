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
 *         description: Pedido creado con el total calculado al momento del checkout
 *       400:
 *         description: Carrito vacío o sin carrito activo
 *       401:
 *         description: No autenticado
 */
router.post('/checkout', authenticate, cartController.checkout);

export default router;
