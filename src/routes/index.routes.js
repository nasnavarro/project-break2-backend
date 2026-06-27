import { Router } from "express";
import productsRoutes from "./products.routes.js";
import authRoutes from "./auth.routes.js";
import healthRoutes from "./health.routes.js";
import reviewsRoutes from "./reviews.routes.js";
import wishlistRoutes from "./wishlist.routes.js";
import adminLogRoutes from "./adminLog.routes.js";
import cartRoutes from "./cart.routes.js";
import { authenticate } from "../middlewares/authenticate.js";
import * as authController from "../controllers/auth.controller.js";
import { notFound } from "../middlewares/notFound.js";
import { errorHandler } from "../middlewares/errorHandler.js";

const router = Router();

//Redirección de la ruta raíz a la documentación de la API
router.get("/", (req, res) => res.redirect("/api/docs"));

router.use("/api/auth", authRoutes);

/**
 * @openapi
 * /api/me:
 *   get:
 *     tags: [Auth]
 *     summary: Perfil del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario actual (id, email, rol)
 *       401:
 *         description: No autenticado
 */
router.get("/api/me", authenticate, authController.me);
router.use("/api/products", productsRoutes);
router.use("/api/products/:id/reviews", reviewsRoutes);
router.use("/api/wishlist", wishlistRoutes);
router.use("/api/cart", cartRoutes);
router.use("/api/admin/logs", adminLogRoutes);
router.use("/health", healthRoutes);

// Control global del Error 404 - ruta no existe
router.use(notFound);

// Control global del Errir 500 - error no controlado
router.use(errorHandler);

export default router;