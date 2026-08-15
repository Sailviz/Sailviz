#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const vendorRoot = path.join(__dirname, "..", "dist", "vendor");

const packagesToVendor = [
  {
    name: "types",
    sourceRoot: path.join(__dirname, "..", "..", "..", "packages", "types"),
  },
  {
    name: "auth",
    sourceRoot: path.join(__dirname, "..", "..", "..", "packages", "auth"),
  },
  {
    name: "db",
    sourceRoot: path.join(__dirname, "..", "..", "..", "packages", "db"),
  },
];

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

for (const pkg of packagesToVendor) {
  const distSrc = path.join(pkg.sourceRoot, "dist");
  const vendorDestRoot = path.join(vendorRoot, pkg.name);
  console.log(
    `Vendoring @sailviz/${pkg.name} from ${distSrc} to ${vendorDestRoot}`,
  );
  fs.mkdirSync(vendorDestRoot, { recursive: true });
  copyRecursiveSync(distSrc, path.join(vendorDestRoot, "dist"));
  console.log(`Vendored @sailviz/${pkg.name} to ${vendorDestRoot}`);
}
