// Respuesta exitosa 200. Usar para GET y operaciones que devuelven datos existentes.
export const responseOk = (res, data) => res.json({ ok: true, data });

// Respuesta exitosa 201. Usar exclusivamente cuando se crea un nuevo recurso (POST).
export const responseCreated = (res, data) => res.status(201).json({ ok: true, data });

// Error genérico parametrizable. Base del resto de helpers de error.
export const responseFail = (res, message, status = 400) =>
  res.status(status).json({ ok: false, error: { message } });

// Datos de entrada inválidos o incompletos. Usar cuando el body o los params no superan la validación
// (campo obligatorio ausente, tipo incorrecto, valor fuera de rango).
// details: array opcional con los errores concretos por campo. Permite reportar todos los fallos en una sola respuesta.
export const responseBadRequest = (res, message = 'Datos inválidos', details = []) => {
  const error = { message };
  if (details.length) error.details = details;
  return res.status(400).json({ ok: false, error });
};

// Recurso no encontrado. Usar exclusivamente cuando se busca algo por identificador concreto (id) y no existe.
// No usar para filtros o listados sin resultados — esos devuelven responseOk con array vacío.
export const responseNotFound = (res, message = 'Recurso no encontrado') => responseFail(res, message, 404);

// Error inesperado del servidor. Usar en bloques catch cuando el error no es de validación ni de negocio
// sino una excepción no controlada.
// El parámetro err (opcional) se logea internamente pero nunca se expone al cliente por temas de seguridad.
export const responseServerError = (res, err = null, message = 'Error interno del servidor') => {
  if (err) console.error(err);
  return responseFail(res, message, 500);
};
