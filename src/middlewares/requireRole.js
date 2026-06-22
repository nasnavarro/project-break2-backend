import { responseFail } from '../helpers/controllers.response.js';

// Función middleware que verifica que el usuario autenticado tenga
// uno de los roles permitidos
// El (...roles) permite pasar un número variable de roles al middleware, por ejemplo:
// requireRole('admin') o requireRole('admin', 'editor')
export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return responseFail(res, 'No tienes permisos para realizar esta acción', 403);
  next();
};
