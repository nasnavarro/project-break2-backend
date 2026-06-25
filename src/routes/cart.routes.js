import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import * as cartController from "../controllers/cart.controller.js";

const router = Router();

// Todas las rutas del carrito requieren autenticación
router.get('/', authenticate, cartController.getCart);
router.post('/items', authenticate, cartController.addItem);
router.delete('/items/:itemId', authenticate, cartController.removeItem);
router.post('/checkout', authenticate, cartController.checkout);

export default router;
