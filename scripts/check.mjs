import { readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = ['server.mjs','src/vendor/three/three.module.min.js','src/vendor/three/three.core.min.js'];
for (const directory of ['src', 'scripts']) {
  for (const entry of await readdir(path.join(root, directory), {withFileTypes: true})) {
    if (entry.isFile() && /\.(m?js)$/.test(entry.name)) files.push(`${directory}/${entry.name}`);
  }
}
for (const file of files) execFileSync(process.execPath, ['--check', path.join(root, file)], {stdio: 'inherit'});
console.log(`Syntax checked: ${files.length} JavaScript files.`);
