import * as productsService from '../services/products.service.js';
import { responseOk, responseCreated, responseNotFound, responseBadRequest } from '../helpers/controllers.response.js';

// Obtiene todos los productos (GET /api/products)
export const getProducts = async (req, res, next) => {
  try {
    responseOk(res, await productsService.getAllProducts());
  } catch (err) {
    next(err);
  }
};

// Obtiene un producto por id (GET /api/products/:id)
export const getProductById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0)
      return responseBadRequest(res, `El id proporcionado (${req.params.id}) no es válido`);

    const product = await productsService.getProductById(id);
    if (!product) return responseNotFound(res, `No existe ningún producto con id ${id}`);

    responseOk(res, product);
  } catch (err) {
    next(err);
  }
};

// Crea un producto (POST /api/products)
export const createProduct = async (req, res, next) => {
  try {
    const newProduct = await productsService.createProduct(req.body);
    responseCreated(res, newProduct);
  } catch (err) {
    next(err);
  }
};

// Actualiza un producto (PUT /api/products/:id)
export const updateProduct = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0)
      return responseBadRequest(res, `El id proporcionado (${req.params.id}) no es válido`);

    const product = await productsService.updateProduct(id, req.body);
    if (!product) return responseNotFound(res, `No existe ningún producto con id ${id}`);

    responseOk(res, product);
  } catch (err) {
    next(err);
  }
};

// Elimina un producto (DELETE /api/products/:id)
export const deleteProduct = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0)
      return responseBadRequest(res, `El id proporcionado (${req.params.id}) no es válido`);

    const product = await productsService.deleteProduct(id);
    if (!product) return responseNotFound(res, `No existe ningún producto con id ${id}`);

    responseOk(res, product);
  } catch (err) {
    next(err);
  }
};
