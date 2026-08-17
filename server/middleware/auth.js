const jwt = require("jsonwebtoken");
const log = require("../lib/logger");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token de acceso requerido" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      log.warn("auth", "Token invalido o expirado", { path: req.path });
      return res.status(403).json({ error: "Token invalido o expirado" });
    }
    req.user = user;
    next();
  });
};

const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ error: "Permisos insuficientes" });
  }
  next();
};

module.exports = { authenticateToken, requireRole };
