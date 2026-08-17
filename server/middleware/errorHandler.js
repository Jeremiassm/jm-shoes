const multer = require("multer");
const log = require("../lib/logger");

class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function errorHandler(err, req, res, _next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message, code: err.code });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  if (err && err.name === "ZodError") {
    return res.status(400).json({ error: "Datos invalidos", details: err.errors });
  }
  log.error("http", "Unhandled error", { path: req.path, message: err?.message, stack: err?.stack });
  return res.status(500).json({ error: "Error interno del servidor" });
}

module.exports = errorHandler;
module.exports.HttpError = HttpError;
