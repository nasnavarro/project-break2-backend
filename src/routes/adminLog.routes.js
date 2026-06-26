import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { requireRole } from "../middlewares/requireRole.js";
import * as adminLogController from "../controllers/adminLog.controller.js";

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Admin
 *   description: Logs de acciones de administrador
 */

// Getters
/**
 * @openapi
 * /api/admin/logs:
 *   get:
 *     tags: [Admin]
 *     summary: Historial de acciones de administrador
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de logs de admin
 *       403:
 *         description: Acceso denegado
 */
router.get('/', authenticate, requireRole('ADMIN'), adminLogController.getLogs);

export default router;
