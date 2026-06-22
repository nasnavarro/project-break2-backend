import * as authService from '../services/auth.service.js';
import { responseCreated, responseBadRequest, responseOk, responseFail } from '../helpers/controllers.response.js';

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

// Inicia sesión y devuelve un token JWT (POST /api/auth/login)
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return responseBadRequest(res, 'Email y password son obligatorios');

    const token = await authService.login(email, password);
    responseOk(res, { token });
  } catch (err) {
    console.error(`[login] ${err.message}`);
    responseFail(res, 'Credenciales inválidas', 401);
  }
};
