import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import * as wishlistController from "../controllers/wishlist.controller.js";

const router = Router();

// Gestiona las rutas de wishlist, montadas en /api/wishlist

/**
 * @openapi
 * tags:
 *   name: Wishlist
 *   description: Lista de favoritos del usuario (MongoDB)
 */

// Getters
/**
 * @openapi
 * /api/wishlist:
 *   get:
 *     tags: [Wishlist]
 *     summary: Ver lista de favoritos del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos favoritos
 *       401:
 *         description: No autenticado
 */
router.get('/', authenticate, wishlistController.getWishlist);

// Post
/**
 * @openapi
 * /api/wishlist/{productId}:
 *   post:
 *     tags: [Wishlist]
 *     summary: Añadir o quitar producto de favoritos (toggle)
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
 *         description: Producto añadido o eliminado de favoritos
 *       401:
 *         description: No autenticado
 */
router.post('/:productId', authenticate, wishlistController.toggleWishlist);

export default router;
