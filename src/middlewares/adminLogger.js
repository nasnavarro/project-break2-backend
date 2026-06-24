import { createAdminLog } from '../services/adminLog.service.js';
import prisma from '../config/prismaClient.js';

// Middleware que registra en MongoDB las acciones de administradores.
// Debe usarse después de authenticate y requireRole.
// - Para UPDATE y DELETE: consulta el estado original antes de la operación.
// - Intercepta res.json para capturar el resultado y guardar el log completo.
export const adminLogger = (action, resource) => async (req, res, next) => {
  let before = null;

  if (['UPDATE', 'DELETE'].includes(action) && req.params.id) {
    try {
      before = await prisma.product.findUnique({ where: { id: Number(req.params.id) } });
    } catch (err) {
      console.error('AdminLogger: error al obtener estado original:', err.message);
    }
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (body?.ok) {
      const after = action === 'DELETE' ? null : body.data;
      const resourceId = before?.id ?? body.data?.id ?? null;

      createAdminLog({
        adminId: String(req.user.id),
        action,
        resource,
        resourceId,
        before: action === 'CREATE' ? null : before,
        after,
        ip: req.ip,
      }).catch((err) => console.error('AdminLogger: error al guardar log:', err.message));
    }
    return originalJson(body);
  };

  next();
};
