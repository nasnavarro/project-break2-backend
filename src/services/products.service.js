import prisma from '../config/prismaClient.js';

// Obtiene todos los productos.
// La forma abreviada de arrow function — devuelve la Promise directamente sin necesidad de await:
export const getAllProducts = async () => prisma.product.findMany({orderBy: { id: 'asc' }});

// Obtiene un producto a partir de su id.
// La forma abreviada de arrow function — devuelve la Promise directamente sin necesidad de await:
export const getProductById = async (id) =>
  prisma.product.findUnique({ where: { id: Number(id) } });

// Crea un producto.
// La forma abreviada de arrow function — devuelve la Promise directamente sin necesidad de await:
export const createProduct = async (data) =>
  prisma.product.create({ data });

// Actualiza un producto.
// La forma no abreviada de arrow function — se utiliza await para esperar el resultado de la actualización antes de devolverlo:
export const updateProduct = async (id, data) => {
  const updatedProduct = await prisma.product.update({
    where: { id: Number(id) },
    data,
  });
  return updatedProduct;
};

// Elimina un producto a partir de su id.
// La forma no abreviada de arrow function — se utiliza await para esperar el resultado de la actualización antes de devolverlo:
export const deleteProduct = async (id) => {
  const deletedProduct = await prisma.product.delete({
    where: { id: Number(id) },
  });
  return deletedProduct;
};