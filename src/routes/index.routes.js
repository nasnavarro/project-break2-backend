import { Router } from "express";
import productsRoutes from "./products.routes.js";
import usersRoutes from "./users.routes.js";
import authRoutes from "./auth.routes.js";
import healthRoutes from "./health.routes.js";
import reviewsRoutes from "./reviews.routes.js";
import wishlistRoutes from "./wishlist.routes.js";
import { notFound } from "../middlewares/notFound.js";
import { errorHandler } from "../middlewares/errorHandler.js";

const router = Router();

// Cargamos las rutas de los distintos controladores
router.use("/api/auth", authRoutes);
router.use("/api/products", productsRoutes);
router.use("/api/products/:id/reviews", reviewsRoutes);
router.use("/api/users", usersRoutes);
router.use("/api/wishlist", wishlistRoutes);
router.use("/health", healthRoutes);

// Control global del Error 404 - ruta no existe
router.use(notFound);

// Control global del Errir 500 - error no controlado
router.use(errorHandler);

export default router;