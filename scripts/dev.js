#!/usr/bin/env node
const { spawn } = require("node:child_process");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const isWindows = process.platform === "win32";

function colorize(text, color) {
  const codes = { blue: 34, green: 32, yellow: 33, red: 31, gray: 90 };
  const c = codes[color] || 0;
  return `\x1b[${c}m${text}\x1b[0m`;
}

function npmInvocation(args) {
  const execPath = process.env.npm_execpath;
  if (execPath && execPath.endsWith(".js")) {
    return { cmd: process.execPath, args: [execPath, ...args] };
  }
  if (isWindows) {
    return { cmd: "cmd.exe", args: ["/d", "/s", "/c", "npm", ...args] };
  }
  return { cmd: "npm", args };
}

function spawnChild(name, color, cwd, npmArgs) {
  const { cmd, args } = npmInvocation(npmArgs);
  const child = spawn(cmd, args, {
    cwd,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });

  const tag = colorize(`[${name}]`, color);
  const prefix = (line) => {
    const trimmed = line.replace(/\r?\n$/, "");
    if (!trimmed) return;
    process.stdout.write(`${tag} ${trimmed}\n`);
  };

  child.stdout.on("data", (buf) => buf.toString().split(/\r?\n/).forEach(prefix));
  child.stderr.on("data", (buf) => buf.toString().split(/\r?\n/).forEach(prefix));
  child.on("error", (err) => {
    process.stderr.write(`${tag} ${colorize(`error: ${err.message}`, "red")}\n`);
  });
  child.on("exit", (code) => {
    process.stdout.write(`${tag} ${colorize(`exit ${code}`, "gray")}\n`);
  });
  return child;
}

const children = [];

function shutdown() {
  for (const c of children) {
    try { c.kill(); } catch (_) { /* noop */ }
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

const server = spawnChild("server", "blue", path.join(root, "server"), ["run", "dev"]);
children.push(server);

setTimeout(() => {
  const cliente = spawnChild("cliente", "green", path.join(root, "cliente"), ["run", "dev"]);
  children.push(cliente);
}, 1500);
