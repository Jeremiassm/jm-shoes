const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = file.mimetype.startsWith("image/") ? "webp" : path.extname(file.originalname).toLowerCase() || "bin";
    cb(null, `${uuidv4()}.${ext}`);
  },
});

const ALLOWED_IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_VIDEO_MIMES = new Set(["video/mp4", "video/webm"]);

// Validamos el mimetype declarado Y los magic bytes en disco.
// Esto evita que un atacante suba un .php renombrado a .png con mimetype image/png.
async function detectKind(filePath, mimetype) {
  const buf = Buffer.alloc(16);
  const fd = fs.openSync(filePath, "r");
  try {
    fs.readSync(fd, buf, 0, 16, 0);
  } finally {
    fs.closeSync(fd);
  }
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) return "image/png";
  // WebP: RIFF....WEBP
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return "image/webp";
  // MP4 / MOV: 'ftyp' at offset 4
  if (buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) {
    return mimetype === "video/quicktime" ? "video/quicktime" : "video/mp4";
  }
  // WebM (EBML): 1A 45 DF A3
  if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) return "video/webm";
  return null;
}

const fileFilter = (_req, file, cb) => {
  const isImage = ALLOWED_IMAGE_MIMES.has(file.mimetype);
  const isVideo = ALLOWED_VIDEO_MIMES.has(file.mimetype) || file.mimetype === "video/quicktime";
  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de archivo no permitido. Solo imagenes (jpg/png/webp) o video (mp4/webm/mov)."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
    files: 10,
  },
});

module.exports = { upload, detectKind, UPLOAD_DIR };
