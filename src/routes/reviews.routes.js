import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import * as reviewsController from "../controllers/reviews.controller.js";

const router = Router({ mergeParams: true });

// Gestiona las rutas de reviews, montadas en /api/products/:id/reviews

/**
 * @openapi
 * tags:
 *   name: Reviews
 *   description: Reseñas de productos (MongoDB)
 */

// Getters
/**
 * @openapi
 * /api/products/{id}/reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: Listar reviews de un producto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de reviews
 */
router.get('/', reviewsController.getReviews);

// Post
/**
 * @openapi
 * /api/products/{id}/reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Crear review de un producto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating, comment]
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 example: Muy buen producto
 *     responses:
 *       201:
 *         description: Review creada
 *       401:
 *         description: No autenticado
 */
router.post('/', authenticate, reviewsController.createReview);

export default router;
