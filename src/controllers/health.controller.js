import mongoose from 'mongoose';
import prisma from '../config/prismaClient.js';
import { responseOk, responseServerError } from '../helpers/controllers.response.js';

// Convierte segundos en un string legible con formato "Xh Ym Zs"
const formatUptime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
};

// Comprueba la conexión a Postgres con una query mínima.
// No expone el error real (puede contener detalles de infraestructura,
// como el proyecto de Supabase) — solo si respondió o no.
const checkPostgres = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return 'up';
  } catch {
    return 'down';
  }
};

// mongoose.connection.readyState: 1 = conectado. El resto de valores
// (0 desconectado, 2 conectando, 3 desconectando) los tratamos como 'down'.
const checkMongo = () => (mongoose.connection.readyState === 1 ? 'up' : 'down');

// Función que devuelve un informe de estado del servidor y de sus
// dependencias (Postgres/Supabase y MongoDB). El servidor Express puede
// estar "up" mientras alguna de sus bases de datos está caída o pausada
// (p.ej. el proyecto de Supabase free tier tras 7 días de inactividad).
export const getHealth = async (req, res) => {
  try {
    const [postgres, mongo] = await Promise.all([checkPostgres(), checkMongo()]);

    responseOk(res, {
      status: 'up',
      services: { postgres, mongo },
      uptime: formatUptime(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    responseServerError(res, err);
  }
};
