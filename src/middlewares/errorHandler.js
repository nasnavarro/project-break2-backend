import { responseFail, responseServerError } from '../helpers/controllers.response.js'

// Middleware de error global. Express lo identifica por los 4 parámetros (err, req, res, next).
// Centraliza todos los errores que llegan via next(err) desde los controladores.
export const errorHandler = (err, req, res, next) => {
  // P2002: violación de unique constraint en Prisma (ej: email duplicado)
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] ?? 'campo';
    return responseFail(res, `Ya existe un registro con ese ${field}`, 409);
  }

  // P2025: registro no encontrado en Prisma (ej: update/delete de ID inexistente)
  if (err.code === 'P2025') {
    return responseFail(res, 'Registro no encontrado', 404);
  }

  // CastError: ID con formato inválido en Mongoose (ej: pasar "1" como ObjectId)
  if (err.name === 'CastError') {
    return responseFail(res, `ID inválido: ${err.value}`, 400);
  }

  responseServerError(res, err);
}
