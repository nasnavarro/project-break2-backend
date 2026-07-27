import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger.js';
import routes from './routes/index.routes.js';

const skipInTest = () => process.env.NODE_ENV === 'test';

// Más restrictivo para las rutas de autenticación (fuerza bruta)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: skipInTest,
  message: { ok: false, error: { message: 'Demasiados intentos, intenta de nuevo más tarde' } },
});

const app = express();

// En producción (Render, Heroku, etc.) la app corre detrás de un proxy inverso.
// Sin esto, Express ignora X-Forwarded-For y express-rate-limit no puede
// identificar bien a cada cliente (lanza ERR_ERL_UNEXPECTED_X_FORWARDED_FOR).
// "1" = confiar solo en el primer proxy delante de la app (el de Render).
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// CORS_ORIGIN admite varios orígenes separados por comas
// (p.ej. "http://localhost:5173,http://localhost:4173" para dev + preview).
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : '*';

app.use(helmet());
app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authLimiter);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(routes);

export default app;