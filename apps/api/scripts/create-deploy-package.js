// scripts/create-deploy-package.js

const fs = require("fs");
const path = require("path");

const pkg = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf8"));

function stripWorkspaceDeps(deps = {}) {
  return Object.fromEntries(
    Object.entries(deps).filter(
      ([, version]) =>
        typeof version !== "string" || !version.startsWith("workspace:"),
    ),
  );
}

pkg.dependencies = stripWorkspaceDeps(pkg.dependencies);
pkg.devDependencies = undefined;

fs.mkdirSync("dist", { recursive: true });

fs.writeFileSync("dist/package.json", JSON.stringify(pkg, null, 2));

console.log("Created dist/package.json");
console.log("Copied package-lock.json");
