// scripts/generate-config.js
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Decide which env file to load
const env = process.env.NODE_ENV || "development";
const envFile = `.env.${env}`;
const envPath = path.resolve(process.cwd(), envFile);

// Fallback to plain .env if specific file not found
const finalPath = fs.existsSync(envPath)
  ? envPath
  : path.resolve(process.cwd(), ".env");

console.log(`Loading environment from: ${finalPath}`);

// Parse the env file
const parsed = dotenv.config({ path: finalPath }).parsed || {};

// Generate TypeScript config file
const lines = Object.entries(parsed).map(
  ([key, value]) => `export const ${key} = ${JSON.stringify(value)};`
);

const output = `// AUTO-GENERATED FILE. Do not edit.
${lines.join("\n")}
`;

fs.writeFileSync(path.resolve(process.cwd(), "src/config.ts"), output);
console.log("Generated src/config.ts");
