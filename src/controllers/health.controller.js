import { responseOk, responseServerError } from '../helpers/controllers.response.js';

// Convierte segundos en un string legible con formato "Xh Ym Zs"
const formatUptime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
};

// Función que devuelve un informe de estado del servidor.
export const getHealth = async (req, res) => {
  try {
    responseOk(res, {
      status: 'up',
      uptime: formatUptime(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    responseServerError(res, err);
  }
};
