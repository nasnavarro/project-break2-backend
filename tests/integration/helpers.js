import bcrypt from 'bcrypt';
import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/config/prismaClient.js';
import { connectMongo } from '../../src/config/mongo.js';

// Credenciales de los usuarios de test — no existen en la BD, se crean y borran en cada suite
export const TEST_USER = { email: 'test-user@test.internal', password: 'Test1234!' };
export const TEST_ADMIN = { email: 'test-admin@test.internal', password: 'Test1234!' };

// Crea el usuario admin directamente en la BD con rol ADMIN (no existe endpoint para esto)
export const createTestAdmin = async () => {
  const password = await bcrypt.hash(TEST_ADMIN.password, 10);
  return prisma.users.create({ data: { email: TEST_ADMIN.email, password, role: 'ADMIN' } });
};

// Registra el usuario normal via endpoint
export const createTestUser = async () => {
  await request(app).post('/api/auth/register').send(TEST_USER);
};

// Hace login y devuelve el token JWT
export const loginAs = async (credentials) => {
  const res = await request(app).post('/api/auth/login').send(credentials);
  return res.body.data?.token;
};

// Borra los usuarios de test y todos sus datos relacionados
export const cleanupTestUsers = async () => {
  await prisma.users.deleteMany({
    where: { email: { in: [TEST_USER.email, TEST_ADMIN.email] } },
  });
};

// Inicializa las conexiones necesarias para los tests
export const connectDatabases = async () => {
  await connectMongo();
};

export { app, request };
