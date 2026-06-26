import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Project Break 2 — E-commerce API',
      version: '1.0.0',
      description: 'API REST de e-commerce — Módulo 2, The Bridge',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Desarrollo' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.routes.js'],
};

export default swaggerJsdoc(options);
