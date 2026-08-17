const express = require("express");
const { pool } = require("../db");
const { isProd } = require("../config");

const router = express.Router();

const STATIC_ROUTES = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/zapatillas", changefreq: "daily", priority: "0.9" },
  { loc: "/nosotros", changefreq: "monthly", priority: "0.7" },
  { loc: "/como-comprar", changefreq: "monthly", priority: "0.8" },
  { loc: "/contacto", changefreq: "monthly", priority: "0.6" },
];

const BASE_URL = process.env.PUBLIC_BASE_URL || null;

function escapeXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(loc, changefreq, priority, lastmod) {
  return `  <url>\n    <loc>${escapeXml(loc)}</loc>${
    lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""
  }\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

router.get("/", async (req, res, next) => {
  try {
    const baseUrl = BASE_URL || `${req.protocol}://${req.get("host")}`;
    const entries = STATIC_ROUTES.map((r) =>
      urlEntry(`${baseUrl}${r.loc}`, r.changefreq, r.priority)
    );

    const { rows } = await pool.query(
      "SELECT id, slug, updated_at FROM sneakers ORDER BY updated_at DESC"
    );
    for (const row of rows) {
      const path = row.slug ? `/zapatilla/${row.slug}` : `/zapatilla/${row.id}`;
      const lastmod = row.updated_at
        ? new Date(row.updated_at).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);
      entries.push(urlEntry(`${baseUrl}${path}`, "weekly", "0.7", lastmod));
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;

    res.set("Content-Type", "application/xml");
    res.set("Cache-Control", isProd ? "public, max-age=900" : "no-store");
    res.send(xml);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
