import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { adminLogger } from "../middlewares/adminLogger.js";
import * as reviewsController from "../controllers/reviews.controller.js";

const router = Router({ mergeParams: true });

// Gestiona las rutas de reviews, montadas en /api/products/:id/reviews

router.get('/', reviewsController.getReviews);
router.post('/', authenticate, adminLogger('CREATE', 'review'), reviewsController.createReview);

export default router;
