import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { requireRole } from "../middlewares/requireRole.js";
import * as adminLogController from "../controllers/adminLog.controller.js";

const router = Router();

router.get('/', authenticate, requireRole('ADMIN'), adminLogController.getLogs);

export default router;
