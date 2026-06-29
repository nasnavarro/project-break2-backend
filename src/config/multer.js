import multer from 'multer';

// Almacena el archivo en memoria como buffer en lugar de en disco.
// El buffer queda disponible en req.file.buffer para enviarlo a Cloudinary.
const storage = multer.memoryStorage();

const maxMb = Number(process.env.CLOUDINARY_MAX_MB) || 5;

export const upload = multer({
  storage,
  limits: { fileSize: maxMb * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Solo se permiten imágenes'));
    }
    cb(null, true);
  },
});
