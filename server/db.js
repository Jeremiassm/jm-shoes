const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL no esta configurado. Definilo en .env");
  process.exit(1);
}

const isProd = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.PG_POOL_MAX) || 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  statement_timeout: 15_000,
});

pool.on("error", (err) => {
  console.error("[db] Error inesperado en el pool de PostgreSQL:", err.message);
});

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

async function columnExists(tableName, columnName) {
  const { rows } = await pool.query(
    "SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2 LIMIT 1",
    [tableName, columnName]
  );
  return rows.length > 0;
}

async function tableExists(tableName) {
  const { rows } = await pool.query(
    "SELECT 1 FROM information_schema.tables WHERE table_name = $1 LIMIT 1",
    [tableName]
  );
  return rows.length > 0;
}

async function indexExists(indexName) {
  const { rows } = await pool.query(
    "SELECT 1 FROM pg_indexes WHERE indexname = $1 LIMIT 1",
    [indexName]
  );
  return rows.length > 0;
}

async function ensureSchema() {
  // 1) Extensiones
  await pool.query("CREATE EXTENSION IF NOT EXISTS pg_trgm");

  // 2) Tabla brands (nueva, OK con IF NOT EXISTS)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS brands (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      slug VARCHAR(120) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3) Tabla users: la tabla ya existe del schema viejo. Solo agregar columnas
  //    nuevas. No tocamos columnas existentes para no romper data.
  if (!(await tableExists("users"))) {
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        must_change_password BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } else {
    if (!(await columnExists("users", "must_change_password"))) {
      await pool.query("ALTER TABLE users ADD COLUMN must_change_password BOOLEAN DEFAULT FALSE");
    }
  }

  // 4) Tabla sneakers: ya existe. Agregamos columnas nuevas idempotentemente.
  if (!(await tableExists("sneakers"))) {
    await pool.query(`
      CREATE TABLE sneakers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        brand VARCHAR(100),
        brand_id INTEGER,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        images JSONB DEFAULT '[]'::jsonb,
        video VARCHAR(500),
        sizes JSONB DEFAULT '[]'::jsonb,
        review JSONB DEFAULT '{}'::jsonb,
        review_avg DECIMAL(3, 1),
        pros JSONB DEFAULT '[]'::jsonb,
        cons JSONB DEFAULT '[]'::jsonb,
        slug VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } else {
    const adds = [
      ["brand_id", "INTEGER"],
      ["review_avg", "DECIMAL(3, 1)"],
      ["slug", "VARCHAR(255)"],
    ];
    for (const [col, type] of adds) {
      if (!(await columnExists("sneakers", col))) {
        await pool.query(`ALTER TABLE sneakers ADD COLUMN ${col} ${type}`);
      }
    }
  }

  // 5) sneaker_sizes (nueva)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sneaker_sizes (
      sneaker_id INTEGER REFERENCES sneakers(id) ON DELETE CASCADE,
      size NUMERIC(4, 1) NOT NULL CHECK (size > 0),
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      PRIMARY KEY (sneaker_id, size)
    )
  `);

  // 6) refresh_tokens: ya existe con schema viejo. Migramos columnas.
  if (!(await tableExists("refresh_tokens"))) {
    await pool.query(`
      CREATE TABLE refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT,
        expires_at TIMESTAMP NOT NULL,
        revoked_at TIMESTAMP,
        replaced_by INTEGER REFERENCES refresh_tokens(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } else {
    // 6a) token -> token_hash (backfill de los tokens existentes)
    if (await columnExists("refresh_tokens", "token") && !(await columnExists("refresh_tokens", "token_hash"))) {
      await pool.query("ALTER TABLE refresh_tokens ADD COLUMN token_hash TEXT");
    }
    if (await columnExists("refresh_tokens", "token") && await columnExists("refresh_tokens", "token_hash")) {
      // backfill en Node (no depende de pgcrypto): hash sha256 de cada token
      const { rows: legacy } = await pool.query(
        "SELECT id, token FROM refresh_tokens WHERE token_hash IS NULL AND token IS NOT NULL"
      );
      for (const row of legacy) {
        const hash = crypto.createHash("sha256").update(row.token).digest("hex");
        await pool.query("UPDATE refresh_tokens SET token_hash = $1 WHERE id = $2", [hash, row.id]);
      }
      // la columna vieja `token` quedo con NOT NULL del schema anterior y
      // ya no se usa: la dropeamos para que los inserts nuevos no fallen.
      await pool.query("ALTER TABLE refresh_tokens ALTER COLUMN token DROP NOT NULL");
      await pool.query("ALTER TABLE refresh_tokens DROP COLUMN token");
    }
    if (!(await columnExists("refresh_tokens", "revoked_at"))) {
      await pool.query("ALTER TABLE refresh_tokens ADD COLUMN revoked_at TIMESTAMP");
    }
    if (!(await columnExists("refresh_tokens", "replaced_by"))) {
      await pool.query("ALTER TABLE refresh_tokens ADD COLUMN replaced_by INTEGER REFERENCES refresh_tokens(id) ON DELETE SET NULL");
    }
  }

  // 7) Indices idempotentes. Solo los creamos si la columna existe.
  if (await columnExists("refresh_tokens", "token_hash")) {
    if (!(await indexExists("idx_refresh_tokens_hash"))) {
      await pool.query(
        "CREATE UNIQUE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash) WHERE revoked_at IS NULL"
      );
    }
  }
  if (await columnExists("refresh_tokens", "expires_at") && !(await indexExists("idx_refresh_tokens_expires"))) {
    await pool.query("CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at)");
  }

  if (await columnExists("sneakers", "brand_id") && !(await indexExists("idx_sneakers_brand_id"))) {
    await pool.query("CREATE INDEX idx_sneakers_brand_id ON sneakers(brand_id)");
  }
  if (await columnExists("sneakers", "price") && !(await indexExists("idx_sneakers_price"))) {
    await pool.query("CREATE INDEX idx_sneakers_price ON sneakers(price)");
  }
  if (await columnExists("sneakers", "created_at") && !(await indexExists("idx_sneakers_created_at"))) {
    await pool.query("CREATE INDEX idx_sneakers_created_at ON sneakers(created_at DESC)");
  }
  if (await columnExists("sneakers", "name") && !(await indexExists("idx_sneakers_name_trgm"))) {
    await pool.query("CREATE INDEX idx_sneakers_name_trgm ON sneakers USING gin (name gin_trgm_ops)");
  }
  if (await columnExists("sneakers", "description") && !(await indexExists("idx_sneakers_description_trgm"))) {
    await pool.query("CREATE INDEX idx_sneakers_description_trgm ON sneakers USING gin (description gin_trgm_ops)");
  }
  if (await columnExists("sneakers", "review_avg") && !(await indexExists("idx_sneakers_review_avg"))) {
    await pool.query("CREATE INDEX idx_sneakers_review_avg ON sneakers(review_avg)");
  }

  // 8) Trigger de updated_at (idempotente via CREATE OR REPLACE)
  if (await tableExists("sneakers")) {
    await pool.query(`
      CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    // El trigger puede no existir; lo creamos si no esta.
    const trig = await pool.query(
      "SELECT 1 FROM pg_trigger WHERE tgname = 'trg_sneakers_updated_at'"
    );
    if (trig.rows.length === 0) {
      await pool.query(`
        CREATE TRIGGER trg_sneakers_updated_at
        BEFORE UPDATE ON sneakers
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
      `);
    }
  }
}

async function ensureBrand(brandName, client = pool) {
  const trimmed = String(brandName || "").trim();
  if (!trimmed) return null;

  const existing = await client.query(
    "SELECT id FROM brands WHERE LOWER(name) = LOWER($1) LIMIT 1",
    [trimmed]
  );
  if (existing.rows.length > 0) return existing.rows[0].id;

  const slug = slugify(trimmed) + "-" + crypto.randomBytes(2).toString("hex");
  const inserted = await client.query(
    "INSERT INTO brands (name, slug) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING RETURNING id",
    [trimmed, slug]
  );
  if (inserted.rows.length > 0) return inserted.rows[0].id;

  const fallback = await client.query(
    "SELECT id FROM brands WHERE LOWER(name) = LOWER($1) LIMIT 1",
    [trimmed]
  );
  return fallback.rows[0]?.id || null;
}

function reviewAvg(review) {
  if (!review || typeof review !== "object") return null;
  const values = Object.values(review).filter(
    (v) => typeof v === "number" && Number.isFinite(v)
  );
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

async function backfillBrandsAndSlugs() {
  // Backfill: crear brands desde la columna legacy `sneakers.brand`
  // y popular `sneakers.brand_id` + `slug` + `review_avg`.
  if (!(await columnExists("sneakers", "brand"))) return;

  const { rows } = await pool.query(
    "SELECT id, brand, slug, review FROM sneakers WHERE brand_id IS NULL"
  );
  if (rows.length === 0) return;

  console.log(`[db] Backfill: ${rows.length} productos sin brand_id`);
  for (const row of rows) {
    const brandId = await ensureBrand(row.brand);
    if (!brandId) continue;

    const baseSlug = row.slug && row.slug.length > 0
      ? row.slug
      : `${slugify(`${row.brand}-${row.id}`)}-${crypto.randomBytes(2).toString("hex")}`;

    await pool.query(
      `UPDATE sneakers
       SET brand_id = $1, slug = $2, review_avg = $3
       WHERE id = $4`,
      [brandId, baseSlug, reviewAvg(row.review), row.id]
    );
  }
}

async function seedFromDataJson() {
  const dataPath = path.join(__dirname, "data.json");
  if (!fs.existsSync(dataPath)) return;

  const data = JSON.parse(fs.readFileSync(dataPath));
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const sneaker of data) {
      const brandId = await ensureBrand(sneaker.brand, client);
      if (!brandId) continue;

      const baseSlug = slugify(`${sneaker.brand}-${sneaker.name}`);
      const slug = `${baseSlug}-${crypto.randomBytes(2).toString("hex")}`;

      await client.query(
        `INSERT INTO sneakers
          (name, brand, brand_id, price, description, images, video, sizes, review, review_avg, pros, cons, slug, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT DO NOTHING`,
        [
          sneaker.name,
          sneaker.brand,
          brandId,
          sneaker.price,
          sneaker.description || null,
          JSON.stringify(sneaker.images || []),
          sneaker.video || null,
          JSON.stringify(sneaker.sizes || []),
          JSON.stringify(sneaker.review || {}),
          reviewAvg(sneaker.review),
          JSON.stringify(sneaker.pros || []),
          JSON.stringify(sneaker.cons || []),
          slug,
          sneaker.createdAt ? new Date(sneaker.createdAt) : new Date(),
        ]
      );
    }
    await client.query("COMMIT");
    console.log(`[db] ${data.length} productos procesados desde data.json`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function ensureDefaultAdmin() {
  if (isProd) {
    console.warn(
      "[db] NODE_ENV=production: NO se crea admin por defecto. Crear manualmente con un script externo."
    );
    return;
  }

  const { rows } = await pool.query("SELECT COUNT(*)::int AS c FROM users");
  if (rows[0].c > 0) return;

  const hashedPassword = await bcrypt.hash("admin123", 10);
  await pool.query(
    `INSERT INTO users (username, password, role, must_change_password)
     VALUES ($1, $2, 'admin', TRUE)`,
    ["admin", hashedPassword]
  );
  console.warn(
    "[db] Usuario admin creado (solo en dev). Usuario: admin / Password: admin123 - CAMBIAR AL PRIMER LOGIN."
  );
}

async function initDatabase() {
  try {
    await ensureSchema();
    console.log("[db] Esquema verificado");

    await backfillBrandsAndSlugs();

    const { rows } = await pool.query("SELECT COUNT(*)::int AS c FROM sneakers");
    if (rows[0].c === 0) {
      await seedFromDataJson();
    }

    await ensureDefaultAdmin();

    // Limpieza periodica de refresh tokens expirados/revocados
    await pool.query(
      "DELETE FROM refresh_tokens WHERE expires_at < NOW() - INTERVAL '1 day'"
    );
  } catch (error) {
    console.error("[db] Error inicializando:", error);
    process.exit(1);
  }
}

module.exports = { pool, initDatabase, slugify, reviewAvg, ensureBrand };
