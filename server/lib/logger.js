const isProd = process.env.NODE_ENV === "production";

function ts() {
  return new Date().toISOString();
}

function format(level, scope, message, meta) {
  if (isProd) {
    return JSON.stringify({ ts: ts(), level, scope, message, ...(meta || {}) });
  }
  const tag = `[${ts()}] [${level.toUpperCase()}] [${scope}]`;
  if (meta && Object.keys(meta).length > 0) {
    return `${tag} ${message} ${JSON.stringify(meta)}`;
  }
  return `${tag} ${message}`;
}

function info(scope, message, meta) {
  console.log(format("info", scope, message, meta));
}

function warn(scope, message, meta) {
  console.warn(format("warn", scope, message, meta));
}

function error(scope, message, meta) {
  console.error(format("error", scope, message, meta));
}

function debug(scope, message, meta) {
  if (!isProd) console.log(format("debug", scope, message, meta));
}

module.exports = { info, warn, error, debug };
