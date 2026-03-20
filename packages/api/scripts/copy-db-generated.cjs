#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "..", "db", "dist", "generated");
const dest = path.join(__dirname, "..", "dist", "db", "src", "generated");

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const file of fs.readdirSync(src)) {
      copyRecursiveSync(path.join(src, file), path.join(dest, file));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

copyRecursiveSync(src, dest);
console.log(`Copied generated prisma client from ${src} to ${dest}`);
