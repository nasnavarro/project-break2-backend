import { Router } from "express";
// Middlewares.
import { authenticate } from "../middlewares/authenticate.js";
import { requireRole } from "../middlewares/requireRole.js";
import { validateProduct } from "../middlewares/validateProduct.js";
import { adminLogger } from "../middlewares/adminLogger.js";
import { upload } from "../config/multer.js";
// Controladores.
import * as productsController from "../controllers/products.controller.js";

const router = Router();

// Gestiona las rutas de productos, que tienen estructura previa definida en
// index.routes: /api/products

/**
 * @openapi
 * tags:
 *   name: Productos
 *   description: Catálogo de productos
 */

// Getters
/**
 * @openapi
 * /api/products:
 *   get:
 *     tags: [Productos]
 *     summary: Listar todos los productos
 *     responses:
 *       200:
 *         description: Lista de productos
 */
router.get('/', productsController.getProducts);
/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     tags: [Productos]
 *     summary: Obtener producto por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:id', productsController.getProductById);

// Post
/**
 * @openapi
 * /api/products:
 *   post:
 *     tags: [Productos]
 *     summary: Crear producto (solo admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, stock]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Camiseta
 *               description:
 *                 type: string
 *                 example: Camiseta de algodón
 *               price:
 *                 type: number
 *                 example: 19.99
 *               stock:
 *                 type: integer
 *                 example: 100
 *               imageUrl:
 *                 type: string
 *                 example: https://ejemplo.com/imagen.jpg
 *     responses:
 *       201:
 *         description: Producto creado
 *       403:
 *         description: Acceso denegado
 */
router.post('/', authenticate, requireRole('ADMIN'), adminLogger('CREATE', 'product'), upload.single('image'), validateProduct, productsController.createProduct);

// Put
/**
 * @openapi
 * /api/products/{id}:
 *   put:
 *     tags: [Productos]
 *     summary: Actualizar producto (solo admin)
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Producto no encontrado
 */
router.put('/:id', authenticate, requireRole('ADMIN'), adminLogger('UPDATE', 'product'), validateProduct, productsController.updateProduct);

// Delete
/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     tags: [Productos]
 *     summary: Eliminar producto (solo admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Producto no encontrado
 */
router.delete('/:id', authenticate, requireRole('ADMIN'), adminLogger('DELETE', 'product'), productsController.deleteProduct);

export default router;