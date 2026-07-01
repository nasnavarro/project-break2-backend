import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import * as authController from "../controllers/auth.controller.js";

// Configura un limitador de peticiones específico para la ruta
// de login, permitiendo solo 3 intentos por minuto
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  skip: () => process.env.NODE_ENV === 'test',
  message: { ok: false, error: { message: 'Demasiados intentos de login, espera 1 minuto' } },
});

const router = Router();

// Gestiona las rutas de autenticación, con estructura previa definida en
// index.routes: /api/auth

/**
 * @openapi
 * tags:
 *   name: Auth
 *   description: Registro, login y sesión
 */

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registrar nuevo usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@ejemplo.com
 *               password:
 *                 type: string
 *                 example: contraseña123
 *     responses:
 *       201:
 *         description: Usuario creado
 *       409:
 *         description: El email ya está registrado
 */
router.post('/register', authController.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesión
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@ejemplo.com
 *               password:
 *                 type: string
 *                 example: contraseña123
 *     responses:
 *       200:
 *         description: Login correcto, devuelve token JWT y datos del usuario
 *       401:
 *         description: Credenciales incorrectas
 */
router.post('/login', loginLimiter, authController.login);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Cerrar sesión
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada, cookie eliminada
 */
router.post('/logout', authController.logout);

export default router;
