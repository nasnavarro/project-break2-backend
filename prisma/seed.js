import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import prisma from '../src/config/prismaClient.js';
import { connectMongo } from '../src/config/mongo.js';
import Review from '../src/models/review.model.js';
import Wishlist from '../src/models/wishlist.model.js';
import AdminLog from '../src/models/adminLog.model.js';

// Reset + seed de la base de datos compartida (local/producción/features usan la misma).
// Deja el catálogo (viajes) y los usuarios de prueba en un estado fijo y reproducible.
//
// BORRA TODO: productos, usuarios, carritos, pedidos (Postgres) y reviews,
// wishlist, admin logs (Mongo). Requiere --yes explícito para evitar
// ejecuciones accidentales sobre datos reales.
//
// Uso: npm run db:reset -- --yes

const TEST_USER = { email: 'test-user@test.internal', password: 'Test1234!' };
const TEST_ADMIN = { email: 'test-admin@test.internal', password: 'Test1234!' };

// El modelo Product se reutiliza tal cual para representar viajes:
// name = destino, description = detalle del viaje, price = precio por persona,
// stock = plazas disponibles, imageUrl = foto del lugar.
//
// Las imágenes son fotos de paisajes de picsum.photos (ids fijos, comprobados
// que responden 200) — no están ligadas al destino exacto, son un placeholder
// vistoso hasta subir fotos reales de cada viaje desde el panel admin.
const products = [
  { name: 'Escapada a Santorini', description: '5 días recorriendo pueblos blancos y atardeceres en Oia, Grecia', price: 649.00, stock: 8, imageUrl: 'https://picsum.photos/id/1015/800/600' },
  { name: 'Safari en el Serengeti', description: '7 días de safari fotográfico entre los Big Five, Tanzania', price: 1899.00, stock: 4, imageUrl: 'https://picsum.photos/id/1016/800/600' },
  { name: 'Ruta por la Toscana', description: '6 días entre viñedos, pueblos medievales y gastronomía, Italia', price: 720.00, stock: 10, imageUrl: 'https://picsum.photos/id/1019/800/600' },
  { name: 'Templos de Kioto', description: '8 días descubriendo templos, jardines y la temporada de sakura, Japón', price: 1450.00, stock: 6, imageUrl: 'https://picsum.photos/id/1021/800/600' },
  { name: 'Machu Picchu y Valle Sagrado', description: '9 días de trekking e historia inca, Perú', price: 1690.00, stock: 5, imageUrl: 'https://picsum.photos/id/1023/800/600' },
  { name: 'Islas Lofoten', description: '6 días persiguiendo auroras boreales y fiordos, Noruega', price: 1320.00, stock: 7, imageUrl: 'https://picsum.photos/id/1024/800/600' },
  { name: 'Marrakech y el desierto de Merzouga', description: '5 días entre zocos y dunas del Sahara, Marruecos', price: 590.00, stock: 12, imageUrl: 'https://picsum.photos/id/1031/800/600' },
  { name: 'Nueva York en 5 días', description: 'Recorrido clásico por Manhattan y Brooklyn, EEUU', price: 980.00, stock: 15, imageUrl: 'https://picsum.photos/id/1035/800/600' },
  { name: 'Islas griegas: Mykonos y Santorini', description: '7 días navegando entre islas, Grecia', price: 1150.00, stock: 9, imageUrl: 'https://picsum.photos/id/1036/800/600' },
  { name: 'Bali esencial', description: '10 días entre templos, arrozales y playas, Indonesia', price: 1290.00, stock: 8, imageUrl: 'https://picsum.photos/id/1039/800/600' },
  { name: 'Ring Road de Islandia', description: '7 días circulando la carretera de circunvalación: glaciares, cascadas y géiseres', price: 1580.00, stock: 6, imageUrl: 'https://picsum.photos/id/1040/800/600' },
  { name: 'Dubái y el desierto de Arabia', description: '4 días de lujo urbano y safari en 4x4, EAU', price: 890.00, stock: 20, imageUrl: 'https://picsum.photos/id/1041/800/600' },
  { name: 'Ciudad del Cabo y Garden Route', description: '8 días de naturaleza y vino, Sudáfrica', price: 1420.00, stock: 5, imageUrl: 'https://picsum.photos/id/1043/800/600' },
  { name: 'Bangkok y playas de Krabi', description: '9 días entre templos y playas de arena blanca, Tailandia', price: 1050.00, stock: 11, imageUrl: 'https://picsum.photos/id/1044/800/600' },
  { name: 'Río de Janeiro y Cataratas de Iguazú', description: '8 días entre playas y una de las 7 maravillas naturales, Brasil', price: 1380.00, stock: 7, imageUrl: 'https://picsum.photos/id/1045/800/600' },
];

async function main() {
  if (!process.argv.includes('--yes')) {
    console.error(
      'Este script BORRA productos, usuarios, carritos, pedidos, reviews, wishlist y admin logs ' +
      'de la base de datos configurada en DATABASE_URL/MONGO_URI (es la misma BD que producción).\n' +
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

  console.log('Insertando catálogo de viajes...');
  await prisma.product.createMany({ data: products });

  console.log('Creando usuarios de prueba...');
  const userPasswordHash = await bcrypt.hash(TEST_USER.password, 10);
  const adminPasswordHash = await bcrypt.hash(TEST_ADMIN.password, 10);
  await prisma.users.create({ data: { email: TEST_USER.email, password: userPasswordHash, role: 'USER' } });
  await prisma.users.create({ data: { email: TEST_ADMIN.email, password: adminPasswordHash, role: 'ADMIN' } });

  console.log(`
Reset completado:
  - ${products.length} viajes
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
