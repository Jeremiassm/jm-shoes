const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL no está configurado. Definilo en .env");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err) => {
  console.error("❌ Error inesperado en el pool de PostgreSQL:", err);
});

async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sneakers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        brand VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        images JSONB DEFAULT '[]',
        video VARCHAR(500),
        sizes JSONB DEFAULT '[]',
        review JSONB DEFAULT '{}',
        pros JSONB DEFAULT '[]',
        cons JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_sneakers_brand ON sneakers(brand);
      CREATE INDEX IF NOT EXISTS idx_sneakers_price ON sneakers(price);
      CREATE INDEX IF NOT EXISTS idx_sneakers_created_at ON sneakers(created_at DESC);
    `);

    console.log("✅ Tablas creadas correctamente");

    const result = await pool.query("SELECT COUNT(*) FROM sneakers");
    if (parseInt(result.rows[0].count) === 0) {
      const dataPath = path.join(__dirname, "data.json");

      if (fs.existsSync(dataPath)) {
        const data = JSON.parse(fs.readFileSync(dataPath));

        for (const sneaker of data) {
          await pool.query(
            `INSERT INTO sneakers (name, brand, price, description, images, video, sizes, review, pros, cons, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
              sneaker.name,
              sneaker.brand,
              sneaker.price,
              sneaker.description,
              JSON.stringify(sneaker.images || []),
              sneaker.video || null,
              JSON.stringify(sneaker.sizes || []),
              JSON.stringify(sneaker.review || {}),
              JSON.stringify(sneaker.pros || []),
              JSON.stringify(sneaker.cons || []),
              sneaker.createdAt || new Date(),
            ]
          );
        }

        console.log(`✅ ${data.length} productos migrados desde data.json`);
      }
    }

    const userResult = await pool.query("SELECT COUNT(*) FROM users");
    if (parseInt(userResult.rows[0].count) === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await pool.query(
        "INSERT INTO users (username, password, role) VALUES ($1, $2, $3)",
        ["admin", hashedPassword, "admin"]
      );
      console.log("✅ Usuario admin creado (password: admin123)");
    }
  } catch (error) {
    console.error("❌ Error inicializando base de datos:", error);
    process.exit(1);
  }
}

module.exports = { pool, initDatabase };
