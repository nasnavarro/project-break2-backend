import { createAdminLog } from '../services/adminLog.service.js';

// Middleware que registra en MongoDB las acciones de administradores.
// Debe usarse después de authenticate y requireRole.
export const adminLogger = (action, resource) => async (req, res, next) => {
  try {
    await createAdminLog(req.user.id, action, resource);
  } catch (err) {
    console.error('Error al registrar admin log:', err.message);
  }
  next();
};
