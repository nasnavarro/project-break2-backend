import * as wishlistService from '../services/wishlist.service.js';
import { responseOk } from '../helpers/controllers.response.js';

// GET /api/wishlist
export const getWishlist = async (req, res, next) => {
  try {
    const productIds = await wishlistService.getWishlist(req.user.id);
    responseOk(res, { productIds });
  } catch (err) {
    next(err);
  }
};

// POST /api/wishlist/:productId
export const toggleWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistService.toggleWishlist(req.user.id, req.params.productId);
    responseOk(res, wishlist);
  } catch (err) {
    next(err);
  }
};
