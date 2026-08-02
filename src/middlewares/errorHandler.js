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

  // Errores de Multer al subir una imagen (ver config/multer.js)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const maxMb = Number(process.env.CLOUDINARY_MAX_MB) || 5;
      return responseFail(res, `La imagen supera el tamaño máximo permitido (${maxMb}MB)`, 400);
    }
    return responseFail(res, 'No se pudo procesar el archivo subido', 400);
  }

  // fileFilter de multer.js rechaza archivos que no sean imágenes
  if (err.message === 'Solo se permiten imágenes') {
    return responseFail(res, err.message, 400);
  }

  responseServerError(res, err);
}
