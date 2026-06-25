import prisma from '../config/prismaClient.js';

// Obtiene el carrito ACTIVE del usuario. Si no existe, lo crea automáticamente.
// El usuario nunca "crea" un carrito explícitamente — simplemente empieza a comprar.
export const getCart = async (userId) => {
  let cart = await prisma.cart.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: { items: { include: { product: true } } },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { items: { include: { product: true } } },
    });
  }

  return cart;
};

// Añade un producto al carrito activo.
// Si el producto ya existe en el carrito, acumula la cantidad en lugar de duplicar la línea.
export const addItem = async (userId, productId, quantity) => {
  const cart = await getCart(userId);

  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId },
  });

  if (existingItem) {
    return prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
      include: { product: true },
    });
  }

  return prisma.cartItem.create({
    data: { cartId: cart.id, productId, quantity },
    include: { product: true },
  });
};

// Elimina una línea del carrito. Verifica que el item pertenece al carrito activo del usuario.
export const removeItem = async (itemId, userId) => {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });

  if (!item) throw Object.assign(new Error('Item no encontrado'), { status: 404 });
  if (item.cart.userId !== userId) throw Object.assign(new Error('No autorizado'), { status: 403 });
  if (item.cart.status !== 'ACTIVE') throw Object.assign(new Error('El carrito ya no está activo'), { status: 400 });

  return prisma.cartItem.delete({ where: { id: itemId } });
};

// Realiza el checkout: calcula el total con precios reales, crea el pedido
// y cierra el carrito (CHECKED_OUT).
export const checkout = async (userId) => {
  const cart = await prisma.cart.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: { items: { include: { product: true } } },
  });

  if (!cart) throw Object.assign(new Error('No hay carrito activo'), { status: 400 });
  if (cart.items.length === 0) throw Object.assign(new Error('El carrito está vacío'), { status: 400 });

  const total = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const order = await prisma.order.create({
    data: { userId, total },
  });

  await prisma.cart.update({
    where: { id: cart.id },
    data: { status: 'CHECKED_OUT' },
  });

  return order;
};
