import cloudinary from '../config/cloudinary.js';

// Sube un buffer de imagen a Cloudinary y devuelve la URL pública.
// Usa upload_stream porque Cloudinary no acepta buffers directamente.
export const uploadImage = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'products' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });

// Extrae el public_id de una URL de Cloudinary y elimina la imagen.
// Ejemplo de URL: .../upload/v1234567890/products/abc123.jpg → public_id: products/abc123
export const deleteImage = (imageUrl) => {
  const parts = imageUrl.split('/upload/');
  const withoutVersion = parts[1].replace(/^v\d+\//, '');
  const publicId = withoutVersion.replace(/\.[^/.]+$/, '');
  return cloudinary.uploader.destroy(publicId);
};
