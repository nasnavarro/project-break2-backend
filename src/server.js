import app from './app.js';
import { connectMongo } from './config/mongo.js';

if (!process.env.JWT_SECRET) {
  console.error('Error: JWT_SECRET no está definido. El servidor no puede arrancar.');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectMongo();
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
