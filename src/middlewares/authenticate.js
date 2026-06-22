import jwt from 'jsonwebtoken';
import { responseFail } from '../helpers/controllers.response.js';

// Función middleware que verifica la autenticidad del token JWT en
// solicitudes protegidas
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer '))
    return responseFail(res, 'Token no proporcionado', 401);

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    responseFail(res, 'Token inválido o expirado', 401);
  }
};
