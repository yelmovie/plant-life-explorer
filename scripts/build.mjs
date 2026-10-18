import { readdir, readFile, mkdir, copyFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ASSETS } from '../src/asset-catalog.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
async function walk(directory) {
  let entries;
  try { entries = await readdir(path.join(root, directory), {withFileTypes: true}); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  const files = [];
  for (const entry of entries) {
    const file = `${directory}/${entry.name}`;
    if (entry.isSymbolicLink()) throw new Error(`Symlinks are not supported in the delivery package: ${file}`);
    if (entry.isDirectory()) files.push(...await walk(file));
    else if (entry.isFile()) files.push(file);
  }
  return files;
}

const source = (await walk('src')).filter(file => /\.(m?js|css)$/.test(file));
const assets = (await walk('assets')).filter(file => /\.webp$/i.test(file) || /(?:credits|licenses?|provenance)[^/]*\.(?:md|json|txt|csv)$/i.test(path.basename(file)));
const files = ['index.html', ...source, ...assets];
const allowed = new Set(files);
for (const key of Object.keys(ASSETS)) {
  const asset = `assets/generated/${key}.webp`;
  if (!allowed.has(asset)) throw new Error(`Missing catalog image: ${asset}. Run npm run assets:optimize after all PNGs arrive.`);
}
// Root-relative URLs are intentional: deploy dist as the site root.
for (const file of ['index.html', ...source]) {
  const content = await readFile(path.join(root, file), 'utf8');
  for (const match of content.matchAll(/["'`(](\/(?:src|assets)\/[^"'`()\s?#]+)(?:[?#][^"'`()\s]*)?["'`)]/g)) {
    const target = match[1].slice(1);
    if (target.includes('${')) continue;
    if (!allowed.has(target)) throw new Error(`Missing or excluded delivery reference in ${file}: /${target}. Generate WebP assets and update references before building.`);
  }
}
const obsolete = (await walk('dist')).map(file => file.slice('dist/'.length)).filter(file => !allowed.has(file));
if (obsolete.length) throw new Error(`Existing dist contains files not in this build. No files were deleted. Review or move them before retrying:\n${obsolete.join('\n')}`);
await mkdir(output, {recursive: true});
let bytes = 0;
for (const file of files) {
  const destination = path.join(output, file);
  await mkdir(path.dirname(destination), {recursive: true});
  await copyFile(path.join(root, file), destination);
  bytes += (await stat(destination)).size;
}
console.log(JSON.stringify({directory: output, files: files.length, assets: assets.length, bytes, hosting: 'site root', excluded: ['source PNGs', 'docs', 'tests', 'scripts', 'server.mjs']}));
