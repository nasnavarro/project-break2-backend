import { Router } from "express";
// Middlewares.
import { authenticate } from "../middlewares/authenticate.js";
import { requireRole } from "../middlewares/requireRole.js";
import { validateProduct } from "../middlewares/validateProduct.js";
import { adminLogger } from "../middlewares/adminLogger.js";
// Controladores.
import * as productsController from "../controllers/products.controller.js";

const router = Router();

// Gestiona las rutas de productos, que tienen estructura previa definida en
// index.routes: /api/products

// Getters
router.get('/', productsController.getProducts);
router.get('/:id', productsController.getProductById);
// Post
router.post('/', authenticate, requireRole('ADMIN'), adminLogger('CREATE', 'product'), validateProduct, productsController.createProduct);
// Put
router.put('/:id', authenticate, requireRole('ADMIN'), adminLogger('UPDATE', 'product'), validateProduct, productsController.updateProduct);
// Delete
router.delete('/:id', authenticate, requireRole('ADMIN'), adminLogger('DELETE', 'product'), productsController.deleteProduct);

export default router;