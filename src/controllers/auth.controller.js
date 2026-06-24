import * as authService from '../services/auth.service.js';
import * as usersService from '../services/users.service.js';
import { responseCreated, responseBadRequest, responseOk, responseFail, responseNotFound } from '../helpers/controllers.response.js';

// Devuelve el perfil del usuario autenticado (GET /api/me)
export const me = async (req, res, next) => {
  try {
    const user = await usersService.getUserById(req.user.id);
    if (!user) return responseNotFound(res, 'Usuario no encontrado');
    responseOk(res, user);
  } catch (err) {
    next(err);
  }
};

// Cierra sesión eliminando la cookie del token (POST /api/auth/logout)
export const logout = (req, res) => {
  res.clearCookie('token');
  responseOk(res, { message: 'Sesión cerrada' });
};

// Registra un nuevo usuario (POST /api/auth/register)
export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return responseBadRequest(res, 'Email y password son obligatorios');

    const user = await authService.register(email, password);
    responseCreated(res, user);
  } catch (err) {
    next(err);
  }
};

// Inicia sesión, guarda el JWT en cookie httpOnly y lo devuelve también en el body
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return responseBadRequest(res, 'Email y password son obligatorios');

    const { token, user } = await authService.login(email, password);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en ms
    });

    responseOk(res, { token, user });
  } catch (err) {
    console.error(`[login] ${err.message}`);
    responseFail(res, 'Credenciales inválidas', 401);
  }
};
