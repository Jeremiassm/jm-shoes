const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const { pool, initDatabase } = require("./db");
const { ensureSecrets, isProd } = require("./config");
const errorHandler = require("./middleware/errorHandler");
const apiRoutes = require("./routes");
const sitemapRouter = require("./routes/sitemap");
const { globalLimiter } = require("./lib/rateLimit");
const log = require("./lib/logger");

ensureSecrets();

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: isProd
      ? {
          useDefaults: true,
          directives: {
            "default-src": ["'self'"],
            "img-src": ["'self'", "data:", "blob:", "https:"],
            "script-src": ["'self'"],
            "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
            "connect-src": ["'self'"],
            "frame-ancestors": ["'none'"],
            "object-src": ["'none'"],
            "base-uri": ["'self'"],
            "form-action": ["'self'"],
          },
        }
      : false,
    hsts: isProd ? { maxAge: 63072000, includeSubDomains: true, preload: true } : false,
  })
);
app.use(
  cors({
    origin: CORS_ORIGIN.split(",").map((s) => s.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// Servir /uploads con Content-Disposition y cache inmutable
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders(res) {
      res.set("Content-Disposition", "inline");
      res.set("Cache-Control", "public, max-age=31536000, immutable");
    },
  })
);

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "ok", uptime: process.uptime() });
  } catch (err) {
    res.status(503).json({ status: "error", db: "down", error: err.message });
  }
});

app.get("/", (_req, res) => {
  res.json({
    name: "JM Shoes API",
    version: "1.0.0",
    endpoints: ["/api/sneakers", "/api/login", "/api/upload", "/api/brands", "/health"],
  });
});

app.use(globalLimiter);
app.use("/api", apiRoutes);
app.use("/sitemap.xml", sitemapRouter);
app.use(errorHandler);

let server;

async function start() {
  await initDatabase();
  server = app.listen(PORT, () => {
    log.info("server", `API escuchando en http://localhost:${PORT}`);
    log.info("server", `CORS origin: ${CORS_ORIGIN}`);
  });
}

async function shutdown(signal) {
  log.info("server", `Senial ${signal} recibida, cerrando...`);
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await pool.end().catch(() => {});
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (err) => {
  log.error("server", "Unhandled rejection", { message: err?.message });
});

start().catch((err) => {
  log.error("server", "Fallo al iniciar", { message: err?.message });
  process.exit(1);
});
