// Middleware que captura cualquier ruta no definida y devuelve un 404.
export const notFound = (req, res) => {
  res.status(404).json({ ok: false, error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` })
}
