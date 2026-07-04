import { cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const outputDirectory = join(projectRoot, "dist");

const publicFiles = [
  "index.html",
  "admin.html",
  "styles.css",
  "admin.css",
  "script.js",
  "admin.js",
  "content-store.js",
  "assets/favicon.svg",
  "assets/gallery-kitchen.jpg",
  "assets/hero-kitchen.jpg"
];

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

for (const file of publicFiles) {
  await cp(join(projectRoot, file), join(outputDirectory, file), { recursive: true });
}

async function collectFiles(directory) {
  const entries = await readdir(directory);
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry);
    const details = await stat(path);
    if (details.isDirectory()) files.push(...await collectFiles(path));
    else files.push(path);
  }

  return files;
}

const builtFiles = await collectFiles(outputDirectory);
console.log(`Static build ready: ${builtFiles.length} files in ${dirname(builtFiles[0]) === outputDirectory ? "dist" : "dist/"}.`);
