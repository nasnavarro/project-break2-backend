import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import routes from './routes/index.routes.js';

// Configura un limitador de peticiones para proteger las rutas de
// la API contra ataques de fuerza bruta
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { ok: false, error: { message: 'Demasiadas peticiones, intenta de nuevo más tarde' } },
});

const app = express();

// Añade cabeceras HTTP de seguridad automáticamente
app.use(helmet());
// Permite peticiones solo desde el dominio configurado en CORS_ORIGIN
app.use(cors({ origin: process.env.CORS_ORIGIN }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Limita a 100 peticiones por IP cada 15 minutos en rutas /api
app.use('/api', limiter);

//Conectamos las rutas
app.use(routes);

export default app;