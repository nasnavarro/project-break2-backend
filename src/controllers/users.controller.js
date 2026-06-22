import * as usersService from '../services/users.service.js';
import { responseOk, responseNotFound } from '../helpers/controllers.response.js';

// Devuelve el perfil del usuario autenticado (GET /api/users/profile)
export const getProfile = async (req, res, next) => {
  try {
    const user = await usersService.getUserById(req.user.id);
    if (!user) return responseNotFound(res, 'Usuario no encontrado');
    responseOk(res, user);
  } catch (err) {
    next(err);
  }
};
