import * as cartService from '../services/cart.service.js';
import { responseOk, responseCreated, responseBadRequest, responseFail } from '../helpers/controllers.response.js';

// GET /api/cart — devuelve el carrito activo del usuario (lo crea si no existe)
export const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    responseOk(res, cart);
  } catch (err) {
    next(err);
  }
};

// POST /api/cart/items — añade un producto al carrito
export const addItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity)
      return responseBadRequest(res, 'productId y quantity son obligatorios');

    if (!Number.isInteger(quantity) || quantity < 1)
      return responseBadRequest(res, 'quantity debe ser un entero mayor que 0');

    const item = await cartService.addItem(req.user.id, productId, quantity);
    responseCreated(res, item);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart/items/:productId — elimina un producto del carrito
export const removeItem = async (req, res, next) => {
  try {
    await cartService.removeItem(req.user.id, Number(req.params.productId));
    responseOk(res, { message: 'Producto eliminado del carrito' });
  } catch (err) {
    if (err.status) return responseFail(res, err.message, err.status);
    next(err);
  }
};

// POST /api/cart/checkout — finaliza la compra y crea un pedido
export const checkout = async (req, res, next) => {
  try {
    const order = await cartService.checkout(req.user.id);
    responseCreated(res, order);
  } catch (err) {
    if (err.status) return responseFail(res, err.message, err.status);
    next(err);
  }
};
