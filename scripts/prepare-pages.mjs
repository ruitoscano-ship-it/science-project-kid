#!/usr/bin/env node
/**
 * Copia apenas os ficheiros servidos pelo Pages para ./dist
 * (evita publicar node_modules, scripts, etc.).
 */
import { copyFileSync, mkdirSync, rmSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dist = join(root, "dist");

const files = [
  "index.html",
  "styles.css",
  "data.js",
  "app.jsx",
  "scenes.jsx",
  "icons.jsx",
  "_headers"
];

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

for (const f of files) {
  const src = join(root, f);
  if (!existsSync(src)) {
    console.warn("skip missing:", f);
    continue;
  }
  copyFileSync(src, join(dist, f));
}

const vendorDir = join(root, "vendor");
const vendorDist = join(dist, "vendor");
if (existsSync(vendorDir)) {
  mkdirSync(vendorDist, { recursive: true });
  for (const f of readdirSync(vendorDir)) {
    copyFileSync(join(vendorDir, f), join(vendorDist, f));
  }
}

console.log("Pages bundle ready:", dist);
