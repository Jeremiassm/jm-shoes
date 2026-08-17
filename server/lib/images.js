const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { UPLOAD_DIR } = require("./upload");

const THUMBS_DIR = path.join(UPLOAD_DIR, "thumbs");
if (!fs.existsSync(THUMBS_DIR)) {
  fs.mkdirSync(THUMBS_DIR, { recursive: true });
}

async function optimizeImage(inputPath, outputPath) {
  // sharp no puede escribir sobre el mismo archivo que esta leyendo:
  // escribimos a un temp y lo renombramos (atomico en NTFS/POSIX).
  const tmpPath = `${outputPath}.tmp-${Date.now()}`;
  try {
    await sharp(inputPath)
      .rotate()
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(tmpPath);
    fs.renameSync(tmpPath, outputPath);
    return true;
  } catch (err) {
    try { if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath); } catch (_) { /* noop */ }
    console.error("[image] Error optimizing:", err.message);
    return false;
  }
}

async function generateThumb(inputPath, basename, size = 480) {
  const thumbPath = path.join(THUMBS_DIR, `${basename}-${size}.webp`);
  try {
    await sharp(inputPath)
      .rotate()
      .resize(size, size, { fit: "cover" })
      .webp({ quality: 70 })
      .toFile(thumbPath);
    return `/uploads/thumbs/${basename}-${size}.webp`;
  } catch (err) {
    console.error("[image] Error thumb:", err.message);
    return null;
  }
}

module.exports = { optimizeImage, generateThumb, THUMBS_DIR };
