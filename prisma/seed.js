import prisma from "../src/config/prismaClient.js"

const products = [
  { name: 'Teclado mecánico TKL', description: 'Teclado compacto sin teclado numérico con switches táctiles', price: 89.99, stock: 42, imageUrl: 'https://placehold.co/300x300?text=Teclado' },
  { name: 'Ratón inalámbrico ergonómico', description: 'Ratón vertical para reducir la tensión en la muñeca', price: 54.50, stock: 18, imageUrl: 'https://placehold.co/300x300?text=Raton' },
  { name: 'Monitor 27" IPS 144Hz', description: 'Panel IPS con tiempo de respuesta de 1ms y HDR400', price: 329.00, stock: 7, imageUrl: 'https://placehold.co/300x300?text=Monitor' },
  { name: 'Auriculares gaming 7.1', description: 'Sonido envolvente virtual 7.1 con micrófono retráctil', price: 74.95, stock: 25, imageUrl: 'https://placehold.co/300x300?text=Auriculares' },
  { name: 'Webcam Full HD 1080p', description: 'Cámara con autoenfoque y corrección de luz automática', price: 49.00, stock: 33, imageUrl: 'https://placehold.co/300x300?text=Webcam' },
  { name: 'Hub USB-C 7 puertos', description: 'Concentrador con HDMI 4K, USB-A 3.0 y carga rápida 100W', price: 39.99, stock: 60, imageUrl: 'https://placehold.co/300x300?text=Hub' },
  { name: 'SSD NVMe 1TB', description: 'Unidad de estado sólido PCIe 4.0 con hasta 7000 MB/s', price: 99.00, stock: 14, imageUrl: 'https://placehold.co/300x300?text=SSD' },
  { name: 'RAM DDR5 32GB (2x16)', description: 'Kit de memoria de alta frecuencia a 6000MHz con XMP 3.0', price: 119.00, stock: 9, imageUrl: 'https://placehold.co/300x300?text=RAM' },
  { name: 'Alfombrilla XL para escritorio', description: 'Superficie antideslizante de 90x40cm para ratón y teclado', price: 22.50, stock: 80, imageUrl: 'https://placehold.co/300x300?text=Alfombrilla' },
  { name: 'Soporte articulado para monitor', description: 'Brazo con ajuste de altura, inclinación y rotación 360°', price: 35.00, stock: 21, imageUrl: 'https://placehold.co/300x300?text=Soporte' },
  { name: 'Micrófono de condensador USB', description: 'Patrón cardioide con filtro antipop y soporte de mesa', price: 65.00, stock: 12, imageUrl: 'https://placehold.co/300x300?text=Microfono' },
  { name: 'Tarjeta capturadora HDMI', description: 'Captura vídeo en 4K30 o 1080p60 sin latencia para streaming', price: 88.00, stock: 5, imageUrl: 'https://placehold.co/300x300?text=Capturadora' },
  { name: 'Regleta con protección 6 tomas', description: 'Protección contra sobretensiones con interruptor maestro', price: 18.99, stock: 47, imageUrl: 'https://placehold.co/300x300?text=Regleta' },
  { name: 'Cable HDMI 2.1 2m', description: 'Soporta 8K60Hz y 4K120Hz con canal de retorno de audio', price: 12.00, stock: 100, imageUrl: 'https://placehold.co/300x300?text=HDMI' },
  { name: 'Lámpara LED escritorio regulable', description: 'Temperatura de color ajustable de 2700K a 6500K con memoria', price: 29.95, stock: 38, imageUrl: 'https://placehold.co/300x300?text=Lampara' },
]

async function main() {
  await prisma.product.createMany({ data: products })
  console.log('Seed completado: 15 productos insertados')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
