const isProd = process.env.NODE_ENV === "production";

function fail(message) {
  console.error(`[config] ${message}`);
  process.exit(1);
}

function isWeakSecret(value) {
  if (!value) return true;
  if (value.length < 32) return true;
  if (/change-?in-?production/i.test(value)) return true;
  if (/^replace[-_]?with/i.test(value)) return true;
  // deteccion de baja entropia: mismo caracter repetido o valores obvios
  if (/^(.)\1+$/.test(value)) return true;
  return false;
}

function ensureSecrets() {
  const checks = [
    { name: "JWT_SECRET", value: process.env.JWT_SECRET },
    { name: "JWT_REFRESH_SECRET", value: process.env.JWT_REFRESH_SECRET },
  ];

  for (const { name, value } of checks) {
    if (isWeakSecret(value)) {
      fail(
        `${name} no esta configurado o es debil. Genera uno con: openssl rand -base64 48`
      );
    }
  }

  if (!process.env.DATABASE_URL) {
    fail("DATABASE_URL no esta configurado.");
  }

  if (isProd && !process.env.CORS_ORIGIN) {
    fail(
      "CORS_ORIGIN es obligatorio en produccion. Definilo en .env con la URL del frontend."
    );
  }

  if (process.env.CORS_ORIGIN === "*") {
    fail("CORS_ORIGIN no puede ser '*' (incompatible con credentials).");
  }
}

const REVIEW_AVG_SQL = `((
  COALESCE((review->>'traction')::numeric, 0) +
  COALESCE((review->>'cushion')::numeric, 0) +
  COALESCE((review->>'materials')::numeric, 0) +
  COALESCE((review->>'durability')::numeric, 0) +
  COALESCE((review->>'fit')::numeric, 0)
) / 5.0)`;

module.exports = { ensureSecrets, REVIEW_AVG_SQL, isProd };
