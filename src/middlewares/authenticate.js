import jwt from 'jsonwebtoken';
import { responseFail } from '../helpers/controllers.response.js';

// Lee el token desde la cookie httpOnly o, si no existe, desde el header Authorization: Bearer
export const authenticate = (req, res, next) => {
  const tokenFromCookie = req.cookies?.token;
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  const token = tokenFromCookie || tokenFromHeader;

  if (!token)
    return responseFail(res, 'Token no proporcionado', 401);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    responseFail(res, 'Token inválido o expirado', 401);
  }
};
