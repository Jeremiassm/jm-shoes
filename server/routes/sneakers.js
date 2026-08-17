const express = require("express");
const crypto = require("crypto");
const { pool, slugify, reviewAvg, ensureBrand } = require("../db");
const { authenticateToken, requireRole } = require("../middleware/auth");
const { mapSneakerRow } = require("../lib/mapping");
const { validateSneakerInput } = require("../lib/validation");
const { adminWriteLimiter, catalogLimiter } = require("../lib/rateLimit");
const { HttpError } = require("../middleware/errorHandler");
const log = require("../lib/logger");

const router = express.Router();
const adminWrite = [authenticateToken, requireRole("admin"), adminWriteLimiter];

const SIZES_PER_SNEAKER_QUERY = `
  SELECT COALESCE(json_agg(json_build_object('size', size, 'stock', stock) ORDER BY size), '[]'::json) AS sizes
  FROM sneaker_sizes
  WHERE sneaker_id = $1
`;

const SNEAKER_SELECT = `
  SELECT s.*, b.name AS brand_name, b.slug AS brand_slug
  FROM sneakers s
  LEFT JOIN brands b ON b.id = s.brand_id
`;

async function attachSizes(rows) {
  if (rows.length === 0) return rows;
  const ids = rows.map((r) => r.id);
  const { rows: sizeRows } = await pool.query(
    `SELECT sneaker_id, size, stock FROM sneaker_sizes WHERE sneaker_id = ANY($1::int[])`,
    [ids]
  );
  const byId = new Map();
  for (const r of sizeRows) {
    if (!byId.has(r.sneaker_id)) byId.set(r.sneaker_id, []);
    byId.get(r.sneaker_id).push({ size: Number(r.size), stock: r.stock });
  }
  return rows.map((r) => {
    const relational = byId.get(r.id) || [];
    // fallback: si no hay filas en sneaker_sizes, usar el JSONB legacy `sizes`
    if (relational.length > 0) return { ...r, sizes: relational };
    const legacy = Array.isArray(r.sizes)
      ? r.sizes.map((n) => ({ size: Number(n), stock: 1 })).filter((s) => Number.isFinite(s.size))
      : [];
    return { ...r, sizes: legacy };
  });
}

router.get("/sneakers", catalogLimiter, async (req, res, next) => {
  try {
    const {
      brand, minPrice, maxPrice, minRating, search, sortBy, order,
      page = "1", limit = "24",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 24));
    const offset = (pageNum - 1) * limitNum;

    const where = [];
    const params = [];
    let p = 0;

    if (brand) {
      p++; where.push(`(b.name = $${p} OR b.slug = $${p})`); params.push(brand);
    }
    if (minPrice) {
      p++; where.push(`s.price >= $${p}`); params.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      p++; where.push(`s.price <= $${p}`); params.push(parseFloat(maxPrice));
    }
    if (minRating) {
      p++; where.push(`s.review_avg >= $${p}`); params.push(parseFloat(minRating));
    }
    if (search) {
      p++;
      where.push(`(s.name ILIKE $${p} OR s.description ILIKE $${p} OR b.name ILIKE $${p})`);
      params.push(`%${search}%`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const validSorts = {
      price: "s.price",
      name: "s.name",
      created_at: "s.created_at",
      rating: "s.review_avg",
    };
    const sortColumn = validSorts[sortBy] || "s.created_at";
    const sortOrder = order === "asc" ? "ASC" : "DESC";

    const countQuery = `SELECT COUNT(*)::int AS total FROM sneakers s LEFT JOIN brands b ON b.id = s.brand_id ${whereSql}`;
    const countResult = await pool.query(countQuery, params);
    const total = countResult.rows[0].total;

    const dataQuery = `
      ${SNEAKER_SELECT}
      ${whereSql}
      ORDER BY ${sortColumn} ${sortOrder} NULLS LAST
      LIMIT ${limitNum} OFFSET ${offset}
    `;
    const result = await pool.query(dataQuery, params);
    const withSizes = await attachSizes(result.rows);
    res.json({
      items: withSizes.map(mapSneakerRow),
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/sneakers/:idOrSlug", async (req, res, next) => {
  try {
    const key = req.params.idOrSlug;
    const isNumeric = /^\d+$/.test(key);
    const { rows } = await pool.query(
      `${SNEAKER_SELECT} WHERE ${isNumeric ? "s.id = $1" : "s.slug = $1"} LIMIT 1`,
      [key]
    );
    if (rows.length === 0) throw new HttpError(404, "Producto no encontrado");
    const [withSizes] = await attachSizes(rows);
    res.json(mapSneakerRow(withSizes));
  } catch (error) {
    next(error);
  }
});

router.get("/brands", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT b.id, b.name, b.slug, COUNT(s.id)::int AS product_count
       FROM brands b
       LEFT JOIN sneakers s ON s.brand_id = b.id
       GROUP BY b.id
       ORDER BY b.name ASC`
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

async function persistSneaker(body, existingId = null) {
  const errors = validateSneakerInput(body);
  if (errors.length > 0) {
    throw new HttpError(400, "Datos invalidos", errors);
  }

  const brandId = await ensureBrand(body.brand);
  const baseSlug = slugify(`${body.brand}-${body.name}`);
  const slug = existingId
    ? body.slug && body.slug === baseSlug
      ? body.slug
      : `${baseSlug}-${crypto.randomBytes(2).toString("hex")}`
    : `${baseSlug}-${crypto.randomBytes(2).toString("hex")}`;

  const reviewAvgValue = reviewAvg(body.review);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    let row;
    if (existingId) {
      const { rows } = await client.query(
        `UPDATE sneakers
         SET name = $1, brand = $2, brand_id = $3, price = $4, description = $5,
             images = $6, video = $7, review = $8, review_avg = $9,
             pros = $10, cons = $11, slug = $12
         WHERE id = $13
         RETURNING *`,
        [
          body.name.trim(),
          body.brand.trim(),
          brandId,
          Number(body.price),
          body.description || null,
          JSON.stringify(body.images || []),
          body.video || null,
          JSON.stringify(body.review || {}),
          reviewAvgValue,
          JSON.stringify(body.pros || []),
          JSON.stringify(body.cons || []),
          slug,
          existingId,
        ]
      );
      if (rows.length === 0) {
        await client.query("ROLLBACK");
        throw new HttpError(404, "Producto no encontrado");
      }
      row = rows[0];
    } else {
      const { rows } = await client.query(
        `INSERT INTO sneakers
          (name, brand, brand_id, price, description, images, video, sizes, review, review_avg, pros, cons, slug)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [
          body.name.trim(),
          body.brand.trim(),
          brandId,
          Number(body.price),
          body.description || null,
          JSON.stringify(body.images || []),
          body.video || null,
          JSON.stringify(
            (body.sizes || []).map((s) => Number(s?.size ?? s)).filter((n) => Number.isFinite(n) && n > 0)
          ),
          JSON.stringify(body.review || {}),
          reviewAvgValue,
          JSON.stringify(body.pros || []),
          JSON.stringify(body.cons || []),
          slug,
        ]
      );
      row = rows[0];
    }

    if (Array.isArray(body.sizes)) {
      await client.query("DELETE FROM sneaker_sizes WHERE sneaker_id = $1", [row.id]);
      for (const entry of body.sizes) {
        const sizeValue = Number(entry?.size ?? entry);
        // talles enviados como numeros planos => "disponible" (stock 1);
        // objetos con stock explicito se respetan.
        const stockRaw = entry && typeof entry === "object" ? entry.stock : undefined;
        const stock = Number.isFinite(Number(stockRaw)) ? Number(stockRaw) : 1;
        if (!Number.isFinite(sizeValue) || sizeValue <= 0) continue;
        await client.query(
          `INSERT INTO sneaker_sizes (sneaker_id, size, stock) VALUES ($1, $2, $3)
           ON CONFLICT (sneaker_id, size) DO UPDATE SET stock = EXCLUDED.stock`,
          [row.id, sizeValue, stock]
        );
      }
    }

    await client.query("COMMIT");
    return row;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

router.post("/sneakers", adminWrite, async (req, res, next) => {
  try {
    const row = await persistSneaker(req.body);
    const [withSizes] = await attachSizes([row]);
    const { rows: brandRows } = await pool.query("SELECT name FROM brands WHERE id = $1", [row.brand_id]);
    res.status(201).json(mapSneakerRow({ ...withSizes, brand_name: brandRows[0]?.name }));
  } catch (error) {
    next(error);
  }
});

router.put("/sneakers/:id", adminWrite, async (req, res, next) => {
  try {
    const row = await persistSneaker(req.body, parseInt(req.params.id, 10));
    const [withSizes] = await attachSizes([row]);
    const { rows: brandRows } = await pool.query("SELECT name FROM brands WHERE id = $1", [row.brand_id]);
    res.json(mapSneakerRow({ ...withSizes, brand_name: brandRows[0]?.name }));
  } catch (error) {
    next(error);
  }
});

router.delete("/sneakers/:id", adminWrite, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "DELETE FROM sneakers WHERE id = $1 RETURNING id",
      [req.params.id]
    );
    if (rows.length === 0) throw new HttpError(404, "Producto no encontrado");
    res.json({ message: "Producto eliminado", deleted: rows[0] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
