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

// Put
/**
 * @openapi
 * /api/products/{id}/reviews/{reviewId}:
 *   put:
 *     tags: [Reviews]
 *     summary: Editar review propia
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: Mejor de lo esperado
 *     responses:
 *       200:
 *         description: Review actualizada
 *       403:
 *         description: No puedes editar la review de otro usuario
 *       404:
 *         description: Review no encontrada
 */
router.put('/:reviewId', authenticate, reviewsController.updateReview);

// Delete
/**
 * @openapi
 * /api/products/{id}/reviews/{reviewId}:
 *   delete:
 *     tags: [Reviews]
 *     summary: Eliminar review (propia o cualquiera si es admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review eliminada
 *       403:
 *         description: No puedes eliminar la review de otro usuario
 *       404:
 *         description: Review no encontrada
 */
router.delete('/:reviewId', authenticate, reviewsController.deleteReview);

export default router;
