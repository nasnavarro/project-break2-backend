import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prismaClient.js';

// Función que registra un nuevo usuario, hashando su contraseña antes de guardarla en la base de datos
export const register = async (email, password) => {
  const existing = await prisma.users.findUnique({ where: { email } });
  if (existing) throw Object.assign(new Error('Email ya registrado'), { code: 'P2002', meta: { target: ['email'] } });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.users.create({
    data: { email, password: passwordHash },
    omit: { password: true },
  });
  return user;
};

// Función que autentica un usuario y devuelve el token JWT junto con los datos del usuario
export const login = async (email, password) => {
  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) throw new Error('Credenciales inválidas');

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) throw new Error('Credenciales inválidas');

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  const { password: _, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
};
