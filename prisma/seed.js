import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prisma from '../src/config/prismaClient.js';
import cloudinary from '../src/config/cloudinary.js';
import { connectMongo } from '../src/config/mongo.js';
import Review from '../src/models/review.model.js';
import Wishlist from '../src/models/wishlist.model.js';
import AdminLog from '../src/models/adminLog.model.js';

// Reset + seed de la base de datos compartida (local/producción/features usan la misma).
// Deja el catálogo (viajes) y los usuarios de prueba en un estado fijo y reproducible.
//
// BORRA TODO: productos, usuarios, carritos, pedidos (Postgres), reviews,
// wishlist, admin logs (Mongo) y las imágenes en Cloudinary bajo products/.
// Requiere --yes explícito para evitar ejecuciones accidentales sobre datos reales.
//
// Uso: npm run db:reset -- --yes

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, 'seed-images');

const TEST_USER = { email: 'test-user@test.internal', password: 'Test1234!' };
const TEST_ADMIN = { email: 'test-admin@test.internal', password: 'Test1234!' };

// El modelo Product se reutiliza tal cual para representar viajes:
// name = destino, description = detalle del viaje, price = precio por persona,
// stock = plazas disponibles, imageUrl = foto del lugar (se sube a Cloudinary
// desde prisma/seed-images/ al ejecutar este script).
const products = [
  { name: 'Escapada a Santorini', description: '5 días recorriendo pueblos blancos y atardeceres en Oia, Grecia', price: 649.00, stock: 8, image: 'Santorini.jpeg' },
  { name: 'Safari en el Serengeti', description: '7 días de safari fotográfico entre los Big Five, Tanzania', price: 1899.00, stock: 4, image: 'Serengueti.jpeg' },
  { name: 'Ruta por la Toscana', description: '6 días entre viñedos, pueblos medievales y gastronomía, Italia', price: 720.00, stock: 10, image: 'Toscana.jpeg' },
  { name: 'Templos de Kioto', description: '8 días descubriendo templos, jardines y la temporada de sakura, Japón', price: 1450.00, stock: 6, image: 'Kyoto.jpeg' },
  { name: 'Machu Picchu y Valle Sagrado', description: '9 días de trekking e historia inca, Perú', price: 1690.00, stock: 5, image: 'MachuPichu.jpeg' },
  { name: 'Islas Lofoten', description: '6 días persiguiendo auroras boreales y fiordos, Noruega', price: 1320.00, stock: 7, image: 'Lofoten.jpeg' },
  { name: 'Marrakech y el desierto de Merzouga', description: '5 días entre zocos y dunas del Sahara, Marruecos', price: 590.00, stock: 12, image: 'Marrakech.jpeg' },
  { name: 'Nueva York en 5 días', description: 'Recorrido clásico por Manhattan y Brooklyn, EEUU', price: 980.00, stock: 15, image: 'NewYork.jpeg' },
  { name: 'Islas griegas: Mykonos y Santorini', description: '7 días navegando entre islas, Grecia', price: 1150.00, stock: 9, image: 'Myconos.jpeg' },
  { name: 'Bali esencial', description: '10 días entre templos, arrozales y playas, Indonesia', price: 1290.00, stock: 8, image: 'Bali.jpeg' },
  { name: 'Ring Road de Islandia', description: '7 días circulando la carretera de circunvalación: glaciares, cascadas y géiseres', price: 1580.00, stock: 6, image: 'Islandia.jpeg' },
  { name: 'Dubái y el desierto de Arabia', description: '4 días de lujo urbano y safari en 4x4, EAU', price: 890.00, stock: 20, image: 'Arabia.jpeg' },
  { name: 'Ciudad del Cabo y Garden Route', description: '8 días de naturaleza y vino, Sudáfrica', price: 1420.00, stock: 5, image: 'CiudadDelCabo.jpeg' },
  { name: 'Bangkok y playas de Krabi', description: '9 días entre templos y playas de arena blanca, Tailandia', price: 1050.00, stock: 11, image: 'Krabi.jpeg' },
  { name: 'Río de Janeiro y Cataratas de Iguazú', description: '8 días entre playas y una de las 7 maravillas naturales, Brasil', price: 1380.00, stock: 7, image: 'Iguazu.jpeg' },
];

// Misma transformación que usa la subida real de producto (products.controller
// vía cloudinary.service.js), para que las imágenes de seed salgan igual que
// las que suba un admin desde el panel.
const uploadTripImage = (filename) =>
  cloudinary.uploader.upload(path.join(IMAGES_DIR, filename), {
    folder: 'products',
    transformation: [
      { width: 800, height: 800, crop: 'fill', gravity: 'auto' },
      { fetch_format: 'auto', quality: 'auto' },
    ],
  }).then((result) => result.secure_url);

async function main() {
  if (!process.argv.includes('--yes')) {
    console.error(
      'Este script BORRA productos, usuarios, carritos, pedidos, reviews, wishlist, admin logs ' +
      '(BD configurada en DATABASE_URL/MONGO_URI, la misma que producción) y las imágenes en Cloudinary bajo products/.\n' +
      'Vuelve a ejecutarlo con --yes si estás seguro: npm run db:reset -- --yes'
    );
    process.exit(1);
  }

  await connectMongo();

  console.log('Borrando datos existentes (Postgres)...');
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "order_items", "orders", "cart_items", "carts", "products", "users" RESTART IDENTITY CASCADE'
  );

  console.log('Borrando datos existentes (Mongo)...');
  await Promise.all([
    Review.deleteMany({}),
    Wishlist.deleteMany({}),
    AdminLog.deleteMany({}),
  ]);

  console.log('Borrando imágenes existentes de Cloudinary (products/)...');
  await cloudinary.api.delete_resources_by_prefix('products/');

  console.log('Subiendo imágenes de los viajes a Cloudinary...');
  const productsWithImages = [];
  for (const { image, ...product } of products) {
    const imageUrl = await uploadTripImage(image);
    console.log(`  ${product.name} -> ${imageUrl}`);
    productsWithImages.push({ ...product, imageUrl });
  }

  console.log('Insertando catálogo de viajes...');
  await prisma.product.createMany({ data: productsWithImages });

  console.log('Creando usuarios de prueba...');
  const userPasswordHash = await bcrypt.hash(TEST_USER.password, 10);
  const adminPasswordHash = await bcrypt.hash(TEST_ADMIN.password, 10);
  await prisma.users.create({ data: { email: TEST_USER.email, password: userPasswordHash, role: 'USER' } });
  await prisma.users.create({ data: { email: TEST_ADMIN.email, password: adminPasswordHash, role: 'ADMIN' } });

  console.log(`
Reset completado:
  - ${products.length} viajes (imágenes subidas a Cloudinary)
  - usuario de prueba:  ${TEST_USER.email} / ${TEST_USER.password}
  - usuario admin:      ${TEST_ADMIN.email} / ${TEST_ADMIN.password}
`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await mongoose.disconnect();
  });
