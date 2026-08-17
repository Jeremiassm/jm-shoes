const express = require("express");
const path = require("path");
const { upload, detectKind } = require("../lib/upload");
const { optimizeImage, generateThumb } = require("../lib/images");
const { authenticateToken, requireRole } = require("../middleware/auth");
const { uploadLimiter } = require("../lib/rateLimit");
const { HttpError } = require("../middleware/errorHandler");
const log = require("../lib/logger");

const router = express.Router();
const adminUpload = [authenticateToken, requireRole("admin"), uploadLimiter];

async function processUpload(file) {
  const filePath = path.join(__dirname, "..", "uploads", file.filename);
  const detected = await detectKind(filePath, file.mimetype);
  if (!detected) {
    log.warn("upload", "Magic bytes no coinciden con mimetype declarado", {
      filename: file.filename,
      declared: file.mimetype,
    });
    throw new HttpError(400, "Contenido del archivo no valido");
  }

  if (detected.startsWith("image/")) {
    const ok = await optimizeImage(filePath, filePath);
    if (!ok) throw new HttpError(500, "No se pudo optimizar la imagen");
    const basename = path.parse(file.filename).name;
    const thumbUrl = await generateThumb(filePath, basename, 480);
    return {
      url: `/uploads/${file.filename}`,
      thumbUrl,
      filename: file.filename,
      kind: "image",
    };
  }

  return {
    url: `/uploads/${file.filename}`,
    filename: file.filename,
    kind: "video",
  };
}

router.post("/upload", adminUpload, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) throw new HttpError(400, "No se subio ningun archivo");
    const result = await processUpload(req.file);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/upload/multiple", adminUpload, upload.array("files", 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new HttpError(400, "No se subio ningun archivo");
    }
    const results = await Promise.all(req.files.map(processUpload));
    res.json(results);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
