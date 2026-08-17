function isNonEmptyString(v, max = 255) {
  return typeof v === "string" && v.trim().length > 0 && v.length <= max;
}

function isPositiveNumber(v, max = 10_000_000) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 && n <= max;
}

function isOptionalString(v, max = 10_000) {
  return v === undefined || v === null || (typeof v === "string" && v.length <= max);
}

function isOptionalUrl(v, max = 500) {
  return v === undefined || v === null || v === "" ||
    (typeof v === "string" && (v.startsWith("/uploads/") || v.startsWith("http://") || v.startsWith("https://")) && v.length <= max);
}

function isStringArray(v, maxItems = 50, itemMax = 500) {
  if (v === undefined || v === null) return true;
  if (!Array.isArray(v) || v.length > maxItems) return false;
  return v.every((item) => typeof item === "string" && item.length > 0 && item.length <= itemMax);
}

function isNumberArray(v, maxItems = 50) {
  if (v === undefined || v === null) return true;
  if (!Array.isArray(v) || v.length > maxItems) return false;
  return v.every((item) => Number.isFinite(Number(item)) && Number(item) > 0);
}

function isReviewObject(v) {
  if (v === undefined || v === null) return true;
  if (typeof v !== "object" || Array.isArray(v)) return false;
  const allowed = ["traction", "cushion", "materials", "durability", "fit"];
  for (const key of Object.keys(v)) {
    if (!allowed.includes(key)) return false;
    const n = Number(v[key]);
    if (!Number.isFinite(n) || n < 0 || n > 10) return false;
  }
  return true;
}

function validateSneakerInput(body) {
  const errors = [];
  if (!isNonEmptyString(body.name)) errors.push("name es requerido (string no vacio)");
  if (!isNonEmptyString(body.brand, 100)) errors.push("brand es requerido (string no vacio)");
  if (!isPositiveNumber(body.price)) errors.push("price es requerido (numero > 0)");
  if (!isOptionalString(body.description, 10_000)) errors.push("description demasiado largo");
  if (!isStringArray(body.images, 30)) errors.push("images debe ser array de strings (max 30)");
  if (!isOptionalUrl(body.video)) errors.push("video debe ser una URL valida o path /uploads/...");
  if (!isNumberArray(body.sizes, 50)) errors.push("sizes debe ser array de numeros > 0");
  if (!isReviewObject(body.review)) errors.push("review invalido (claves: traction/cushion/materials/durability/fit, valores 0-10)");
  if (!isStringArray(body.pros, 30)) errors.push("pros debe ser array de strings");
  if (!isStringArray(body.cons, 30)) errors.push("cons debe ser array de strings");
  return errors;
}

function validateLogin(body) {
  const errors = [];
  if (!isNonEmptyString(body.username, 100)) errors.push("username requerido");
  if (typeof body.password !== "string" || body.password.length < 1 || body.password.length > 200) {
    errors.push("password invalido");
  }
  return errors;
}

module.exports = {
  validateSneakerInput,
  validateLogin,
  isPositiveNumber,
  isNonEmptyString,
  isOptionalString,
  isOptionalUrl,
  isStringArray,
  isNumberArray,
  isReviewObject,
};
