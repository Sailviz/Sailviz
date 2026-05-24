#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "..", "db", "dist");
const dest1 = path.join(__dirname, "..", "dist", "packages", "db", "src");

const dest2 = path.join(__dirname, "..", "dist", "db", "src");

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

copyRecursiveSync(src, dest1);
console.log(`Copied generated prisma client from ${src} to ${dest1}`);
copyRecursiveSync(src, dest2);
console.log(`Copied generated prisma client from ${src} to ${dest2}`);

// copy package.json
fs.copyFileSync("package.json", "dist/package.json");

copyRecursiveSync("dist/types", "dist/packages/types");
