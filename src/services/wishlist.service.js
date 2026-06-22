import Wishlist from '../models/wishlist.model.js';

// Obtiene la lista de deseos de un usuario
export const getWishlist = async (userId) => {
  const wishlist = await Wishlist.findOne({ userId });
  return wishlist?.productIds ?? [];
};

// Agrega o elimina un producto de la lista de deseos de un usuario
export const toggleWishlist = async (userId, productId) => {
  const wishlist = await Wishlist.findOne({ userId });

  if (!wishlist) {
    return Wishlist.create({ userId, productIds: [productId] });
  }

  const exists = wishlist.productIds.includes(productId);

  if (exists) {
    wishlist.productIds = wishlist.productIds.filter((id) => id !== productId);
  } else {
    wishlist.productIds.push(productId);
  }

  return wishlist.save();
};
