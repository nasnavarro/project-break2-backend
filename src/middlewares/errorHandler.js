import { responseServerError } from '../helpers/controllers.response.js'

// Middleware de error global. Express lo identifica por los 4 parámetros (err, req, res, next).
// Centraliza todos los errores que llegan via next(err) desde los controladores.
export const errorHandler = (err, req, res, next) => {
  responseServerError(res, err)
}
