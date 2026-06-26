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
    tags: [
      { name: 'Auth', description: 'Registro, login y sesión' },
      { name: 'Productos', description: 'Catálogo de productos' },
      { name: 'Reviews', description: 'Reseñas de productos (MongoDB)' },
      { name: 'Wishlist', description: 'Lista de favoritos del usuario (MongoDB)' },
      { name: 'Carrito', description: 'Carrito de compra y checkout' },
      { name: 'Admin', description: 'Logs de acciones de administrador' },
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
