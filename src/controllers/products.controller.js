import * as productsService from '../services/products.service.js';
import { uploadImage, deleteImage } from '../services/cloudinary.service.js';
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
// Acepta form-data: campos de texto en req.body e imagen opcional en req.file
// Los campos numéricos llegan como string en form-data y hay que parsearlos
export const createProduct = async (req, res, next) => {
  try {
    const data = { ...req.body };

    if (data.price !== undefined) data.price = parseFloat(data.price);
    if (data.stock !== undefined) data.stock = parseInt(data.stock, 10);

    if (req.file) {
      data.imageUrl = await uploadImage(req.file.buffer);
    }

    const newProduct = await productsService.createProduct(data);
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

// Sube o reemplaza la imagen de un producto (POST /api/products/:id/image)
// Si ya tenía imagen en Cloudinary, la elimina antes de subir la nueva
export const uploadProductImage = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0)
      return responseBadRequest(res, `El id proporcionado (${req.params.id}) no es válido`);

    if (!req.file) return responseBadRequest(res, 'No se ha enviado ninguna imagen');

    const existing = await productsService.getProductById(id);
    if (!existing) return responseNotFound(res, `No existe ningún producto con id ${id}`);

    if (existing.imageUrl) await deleteImage(existing.imageUrl);

    const imageUrl = await uploadImage(req.file.buffer);
    const product = await productsService.updateProduct(id, { imageUrl });
    responseOk(res, product);
  } catch (err) {
    next(err);
  }
};

// Elimina un producto (DELETE /api/products/:id)
// Si el producto tiene imagen en Cloudinary, la elimina también
export const deleteProduct = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0)
      return responseBadRequest(res, `El id proporcionado (${req.params.id}) no es válido`);

    const product = await productsService.getProductById(id);
    if (!product) return responseNotFound(res, `No existe ningún producto con id ${id}`);

    if (product.imageUrl) await deleteImage(product.imageUrl);

    await productsService.deleteProduct(id);
    responseOk(res, product);
  } catch (err) {
    next(err);
  }
};
