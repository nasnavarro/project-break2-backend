import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import * as usersController from "../controllers/users.controller.js";

const router = Router();

// Gestiona las rutas de usuarios, con estructura previa definida en
// index.routes: /api/users

router.get('/profile', authenticate, usersController.getProfile);

export default router;
