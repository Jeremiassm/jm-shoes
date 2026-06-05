const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const util = require("util");
const { pool, initDatabase } = require("./db");
const { authenticateToken } = require("./middleware/auth");
const jwtVerify = util.promisify(jwt.verify);

function ensureSecret(name, value) {
  if (!value || value.length < 32 || value.includes("change-in-production")) {
    console.error(`❌ ${name} no está configurado o es el valor por defecto. Definilo en .env con un valor fuerte.`);
    process.exit(1);
  }
}

ensureSecret("JWT_SECRET", process.env.JWT_SECRET);
ensureSecret("JWT_REFRESH_SECRET", process.env.JWT_REFRESH_SECRET);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const BASE_URL = `http://localhost:${PORT}`;

const optimizeImage = async (inputPath, outputPath) => {
  try {
    await sharp(inputPath)
      .resize(1200, 1200, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toFile(outputPath);
    return true;
  } catch (err) {
    console.error("Error optimizing image:", err);
    return false;
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    const filename = `${uuidv4()}.webp`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de archivo no permitido"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Probá de nuevo en unos minutos." },
});

const requiredFields = (body, fields) => {
  const missing = fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === "");
  return missing;
};

function mapSneakerRow(row) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    price: parseFloat(row.price),
    description: row.description,
    images: row.images || [],
    video: row.video,
    sizes: row.sizes || [],
    review: row.review || {},
    pros: row.pros || [],
    cons: row.cons || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

app.post("/api/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ningún archivo" });
  }

  const inputPath = path.join(__dirname, "uploads", req.file.filename);

  if (req.file.mimetype.startsWith("image/")) {
    const optimized = await optimizeImage(inputPath, inputPath);
    if (optimized) {
      return res.json({ url: `${BASE_URL}/uploads/${req.file.filename}`, filename: req.file.filename });
    }
  }

  res.json({ url: `${BASE_URL}/uploads/${req.file.filename}`, filename: req.file.filename });
});

app.post("/api/upload/multiple", upload.array("files", 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No se subió ningún archivo" });
  }

  const results = [];

  for (const file of req.files) {
    const filePath = path.join(__dirname, "uploads", file.filename);

    if (file.mimetype.startsWith("image/")) {
      const optimized = await optimizeImage(filePath, filePath);
      if (optimized) {
        results.push({ url: `${BASE_URL}/uploads/${file.filename}`, filename: file.filename });
        continue;
      }
    }

    results.push({ url: `${BASE_URL}/uploads/${file.filename}`, filename: file.filename });
  }

  res.json(results);
});

app.get("/", (req, res) => {
  res.json({ message: "JM Shoes API", endpoints: ["/api/sneakers", "/api/login", "/api/upload"] });
});

app.get("/api/sneakers", async (req, res) => {
  try {
    const { brand, minPrice, maxPrice, minRating, search, sortBy, order } = req.query;

    let query = "SELECT * FROM sneakers WHERE 1=1";
    const params = [];
    let paramCount = 0;

    if (brand) {
      paramCount++;
      query += ` AND brand = $${paramCount}`;
      params.push(brand);
    }

    if (minPrice) {
      paramCount++;
      query += ` AND price >= $${paramCount}`;
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      paramCount++;
      query += ` AND price <= $${paramCount}`;
      params.push(parseFloat(maxPrice));
    }

    if (minRating) {
      paramCount++;
      query += ` AND (review->>'traction')::numeric >= $${paramCount}`;
      params.push(parseFloat(minRating));
    }

    if (search) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR brand ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (sortBy) {
      const validSorts = {
        price: "price",
        name: "name",
        created_at: "created_at",
        rating: "(review->>'traction')::numeric",
      };
      const sortColumn = validSorts[sortBy] || "created_at";
      const sortOrder = order === "asc" ? "ASC" : "DESC";
      query += ` ORDER BY ${sortColumn} ${sortOrder}`;
    } else {
      query += " ORDER BY created_at DESC";
    }

    const result = await pool.query(query, params);
    const sneakers = result.rows.map(mapSneakerRow);

    res.json(sneakers);
  } catch (error) {
    console.error("Error fetching sneakers:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

app.get("/api/sneakers/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM sneakers WHERE id = $1", [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(mapSneakerRow(result.rows[0]));
  } catch (error) {
    console.error("Error fetching sneaker:", error);
    res.status(500).json({ error: "Error al obtener producto" });
  }
});

app.post("/api/sneakers", authenticateToken, async (req, res) => {
  try {
    const { name, brand, price, description, images, video, sizes, review, pros, cons } = req.body;
    const missing = requiredFields(req.body, ["name", "brand", "price"]);
    if (missing.length > 0) {
      return res.status(400).json({ error: `Campos requeridos faltantes: ${missing.join(", ")}` });
    }

    const result = await pool.query(
      `INSERT INTO sneakers (name, brand, price, description, images, video, sizes, review, pros, cons)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        name,
        brand,
        price,
        description,
        JSON.stringify(images || []),
        video || null,
        JSON.stringify(sizes || []),
        JSON.stringify(review || {}),
        JSON.stringify(pros || []),
        JSON.stringify(cons || []),
      ]
    );

    res.status(201).json(mapSneakerRow(result.rows[0]));
  } catch (error) {
    console.error("Error creating sneaker:", error);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

app.put("/api/sneakers/:id", authenticateToken, async (req, res) => {
  try {
    const { name, brand, price, description, images, video, sizes, review, pros, cons } = req.body;
    const missing = requiredFields(req.body, ["name", "brand", "price"]);
    if (missing.length > 0) {
      return res.status(400).json({ error: `Campos requeridos faltantes: ${missing.join(", ")}` });
    }

    const result = await pool.query(
      `UPDATE sneakers
       SET name = $1, brand = $2, price = $3, description = $4, images = $5,
           video = $6, sizes = $7, review = $8, pros = $9, cons = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [
        name,
        brand,
        price,
        description,
        JSON.stringify(images || []),
        video || null,
        JSON.stringify(sizes || []),
        JSON.stringify(review || {}),
        JSON.stringify(pros || []),
        JSON.stringify(cons || []),
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(mapSneakerRow(result.rows[0]));
  } catch (error) {
    console.error("Error updating sneaker:", error);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});

app.delete("/api/sneakers/:id", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM sneakers WHERE id = $1 RETURNING *", [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ message: "Producto eliminado", deleted: result.rows[0] });
  } catch (error) {
    console.error("Error deleting sneaker:", error);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

app.post("/api/login", loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Usuario y contraseña son requeridos" });
    }

    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const accessToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, refreshToken, expiresAt]
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      accessToken,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.post("/api/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token requerido" });
    }

    const tokenResult = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()",
      [refreshToken]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(403).json({ error: "Refresh token inválido o expirado" });
    }

    try {
      const decoded = await jwtVerify(refreshToken, process.env.JWT_REFRESH_SECRET);

      const newAccessToken = jwt.sign(
        { id: decoded.id, username: decoded.username, role: decoded.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ accessToken: newAccessToken });
    } catch {
      return res.status(403).json({ error: "Refresh token inválido" });
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.post("/api/logout", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [refreshToken]);
    }

    res.clearCookie("refreshToken");
    res.json({ message: "Logout exitoso" });
  } catch (error) {
    console.error("Error en logout:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor JM Shoes corriendo en http://localhost:${PORT}`);
    console.log(`📁 Archivos estáticos en http://localhost:${PORT}/uploads`);
    console.log(`🖼️  Imágenes optimizadas automáticamente a WebP (80% calidad, max 1200x1200)`);
    console.log(`🔐 Autenticación JWT habilitada`);
    console.log(`🛡️  Helmet + rate-limit activos`);
    console.log(`🗄️  PostgreSQL conectado`);
  });
});
