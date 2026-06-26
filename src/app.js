import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger.js';
import routes from './routes/index.routes.js';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { ok: false, error: { message: 'Demasiadas peticiones, intenta de nuevo más tarde' } },
});

// Más restrictivo para las rutas de autenticación (fuerza bruta)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { ok: false, error: { message: 'Demasiados intentos, intenta de nuevo más tarde' } },
});

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', limiter);
app.use('/api/auth', authLimiter);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(routes);

export default app;