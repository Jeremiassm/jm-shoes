const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { pool } = require("../db");
const { loginLimiter } = require("../lib/rateLimit");
const { validateLogin } = require("../lib/validation");
const { HttpError } = require("../middleware/errorHandler");
const { isProd } = require("../config");
const log = require("../lib/logger");

const router = express.Router();
const jwtVerify = (token, secret) =>
  new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function setRefreshCookie(res, refreshToken) {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: REFRESH_TTL_MS,
    path: "/api",
  });
}

async function issueTokens(user) {
  const accessToken = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { id: user.id, username: user.username, role: user.role, jti: crypto.randomUUID() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [user.id, hashToken(refreshToken), expiresAt]
  );
  return { accessToken, refreshToken };
}

router.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const errors = validateLogin(req.body);
    if (errors.length > 0) throw new HttpError(400, "Datos invalidos", errors);

    const { username, password } = req.body;
    const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (rows.length === 0) throw new HttpError(401, "Credenciales invalidas");

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw new HttpError(401, "Credenciales invalidas");

    const { accessToken, refreshToken } = await issueTokens(user);
    setRefreshCookie(res, refreshToken);

    res.json({
      success: true,
      accessToken,
      mustChangePassword: user.must_change_password === true,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) throw new HttpError(401, "Refresh token requerido");

    const tokenHash = hashToken(refreshToken);
    const { rows } = await pool.query(
      `SELECT id, user_id, revoked_at, replaced_by, expires_at
       FROM refresh_tokens WHERE token_hash = $1`,
      [tokenHash]
    );

    if (rows.length === 0) {
      throw new HttpError(403, "Refresh token invalido");
    }
    const record = rows[0];

    if (record.revoked_at) {
      // Reuso de un refresh revocado: revocar toda la familia.
      log.warn("auth", "Refresh token reusado detectado. Revocando familia.", { userId: record.user_id });
      await pool.query(
        `UPDATE refresh_tokens SET revoked_at = NOW()
         WHERE user_id = $1 AND revoked_at IS NULL`,
        [record.user_id]
      );
      res.clearCookie("refreshToken", { path: "/api" });
      throw new HttpError(403, "Refresh token comprometido. Sesiones revocadas.");
    }

    if (new Date(record.expires_at) < new Date()) {
      await pool.query("UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1", [record.id]);
      throw new HttpError(403, "Refresh token expirado");
    }

    let decoded;
    try {
      decoded = await jwtVerify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      await pool.query("UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1", [record.id]);
      throw new HttpError(403, "Refresh token invalido");
    }

    // Rotacion: marcar el viejo como revocado y emitir uno nuevo.
    const accessToken = jwt.sign(
      { id: decoded.id, username: decoded.username, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    const newRefreshToken = jwt.sign(
      { id: decoded.id, username: decoded.username, role: decoded.role, jti: crypto.randomUUID() },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );
    const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);
    const { rows: inserted } = await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3) RETURNING id`,
      [decoded.id, hashToken(newRefreshToken), expiresAt]
    );
    await pool.query(
      "UPDATE refresh_tokens SET revoked_at = NOW(), replaced_by = $1 WHERE id = $2",
      [inserted[0].id, record.id]
    );

    setRefreshCookie(res, newRefreshToken);
    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (refreshToken) {
      await pool.query(
        "UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL",
        [hashToken(refreshToken)]
      );
    }
    res.clearCookie("refreshToken", { path: "/api" });
    res.json({ message: "Logout exitoso" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
