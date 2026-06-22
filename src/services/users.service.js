import prisma from '../config/prismaClient.js';

//Función que obtiene un usuario por su ID, omitiendo el campo password para no exponerlo
export const getUserById = async (id) =>
  prisma.users.findUnique({
    where: { id },
    omit: { password: true },
  });
