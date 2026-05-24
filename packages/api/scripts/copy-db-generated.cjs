#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "..", "db", "dist");
const dest1 = path.join(__dirname, "..", "dist", "packages", "db", "src");

const dest2 = path.join(__dirname, "..", "dist", "db", "src");
const nodeModulesRoot = path.join(
  __dirname,
  "..",
  "dist",
  "node_modules",
  "@sailviz",
);
const vendorRoot = path.join(__dirname, "..", "dist", "vendor");

const packagesToVendor = [
  {
    name: "types",
    sourceRoot: path.join(__dirname, "..", "..", "types"),
    packageJson: {
      name: "@sailviz/types",
      type: "module",
      main: "./dist/index.js",
      types: "./dist/index.d.ts",
      exports: {
        ".": {
          types: "./dist/index.d.ts",
          default: "./dist/index.js",
        },
      },
    },
  },
  {
    name: "auth",
    sourceRoot: path.join(__dirname, "..", "..", "auth"),
    packageJson: {
      name: "@sailviz/auth",
      type: "module",
      main: "./dist/index.js",
      types: "./dist/index.d.ts",
      exports: {
        ".": {
          types: "./dist/index.d.ts",
          default: "./dist/index.js",
        },
        "./client": {
          types: "./dist/client.d.ts",
          default: "./dist/client.js",
        },
        "./auth": {
          types: "./dist/auth.d.ts",
          default: "./dist/auth.js",
        },
      },
    },
  },
  {
    name: "db",
    sourceRoot: path.join(__dirname, "..", "..", "db"),
    packageJson: {
      name: "@sailviz/db",
      type: "module",
      main: "./dist/index.js",
      types: "./dist/index.d.ts",
      exports: {
        ".": {
          types: "./dist/index.d.ts",
          default: "./dist/index.js",
        },
      },
    },
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

// copyRecursiveSync(src, dest1);
// console.log(`Copied generated prisma client from ${src} to ${dest1}`);
// copyRecursiveSync(src, dest2);
// console.log(`Copied generated prisma client from ${src} to ${dest2}`);

// copy package.json
const packageJsonPath = path.join(__dirname, "..", "package.json");
const distPackageJsonPath = path.join(__dirname, "..", "dist", "package.json");
const apiPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

if (apiPackageJson.dependencies) {
  for (const [dep, version] of Object.entries(apiPackageJson.dependencies)) {
    if (typeof version === "string" && version.startsWith("workspace:")) {
      const name = dep.replace("@sailviz/", "");
      apiPackageJson.dependencies[dep] = `file:./vendor/${name}`;
    }
  }
}

fs.writeFileSync(
  distPackageJsonPath,
  `${JSON.stringify(apiPackageJson, null, 2)}\n`,
);

copyRecursiveSync("dist/types", "dist/packages/types");

for (const pkg of packagesToVendor) {
  const distSrc = path.join(pkg.sourceRoot, "dist");
  const pkgDestRoot = path.join(nodeModulesRoot, pkg.name);
  const vendorDestRoot = path.join(vendorRoot, pkg.name);

  fs.mkdirSync(pkgDestRoot, { recursive: true });
  fs.writeFileSync(
    path.join(pkgDestRoot, "package.json"),
    `${JSON.stringify(pkg.packageJson, null, 2)}\n`,
  );
  copyRecursiveSync(distSrc, path.join(pkgDestRoot, "dist"));

  fs.mkdirSync(vendorDestRoot, { recursive: true });
  fs.writeFileSync(
    path.join(vendorDestRoot, "package.json"),
    `${JSON.stringify(pkg.packageJson, null, 2)}\n`,
  );
  copyRecursiveSync(distSrc, path.join(vendorDestRoot, "dist"));
  console.log(`Vendored @sailviz/${pkg.name} to ${pkgDestRoot}`);
}
