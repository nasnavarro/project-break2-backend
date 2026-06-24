import { responseBadRequest } from '../helpers/controllers.response.js';

// Middleware que valida los campos obligatorios del body en POST y PUT:
// name, price >= 0 y stock >= 0.
export const validateProduct = (req, res, next) => {
  const { name, price, stock } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string')
    errors.push('El nombre (name) es obligatorio y debe ser un texto');

  if (price === undefined || price === null)
    errors.push('El precio (price) es obligatorio');
  else if (typeof price !== 'number' || price < 0)
    errors.push('El precio (price) debe ser un número mayor o igual a 0');

  if (stock === undefined || stock === null)
    errors.push('El stock es obligatorio');
  else if (!Number.isInteger(stock) || stock < 0)
    errors.push('El stock debe ser un entero mayor o igual a 0');

  if (errors.length) return responseBadRequest(res, 'Datos del producto inválidos', errors);

  next();
}
