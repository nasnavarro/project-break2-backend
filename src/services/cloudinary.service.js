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
