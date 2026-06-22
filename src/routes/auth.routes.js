import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import * as authController from "../controllers/auth.controller.js";

// Configura un limitador de peticiones específico para la ruta
// de login, permitiendo solo 3 intentos por minuto
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { ok: false, error: { message: 'Demasiados intentos de login, espera 1 minuto' } },
});

const router = Router();

// Gestiona las rutas de autenticación, con estructura previa definida en
// index.routes: /api/auth

router.post('/register', authController.register);
router.post('/login', loginLimiter, authController.login);

export default router;
