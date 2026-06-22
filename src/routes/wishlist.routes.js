import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { adminLogger } from "../middlewares/adminLogger.js";
import * as wishlistController from "../controllers/wishlist.controller.js";

const router = Router();

// Gestiona las rutas de wishlist, montadas en /api/wishlist

router.get('/', authenticate, wishlistController.getWishlist);
router.post('/:productId', authenticate, adminLogger('TOGGLE', 'wishlist'), wishlistController.toggleWishlist);

export default router;
