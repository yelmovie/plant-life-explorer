import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const sharpPath = process.env.SHARP_MODULE_PATH || 'C:/Users/bongb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp';
let sharp;
try { sharp = require(sharpPath); }
catch { throw new Error('Bundled sharp is unavailable. Set SHARP_MODULE_PATH to an existing sharp installation; no packages are installed by this script.'); }

// Original PNG files remain intact. No resize, crop, recolor or rotation is applied.
const files = ['assets/characters.png', 'assets/title.png'];
for (const entry of await readdir(path.join(root, 'assets/generated'), {withFileTypes: true})) {
  if (entry.isFile() && /\.png$/i.test(entry.name)) files.push(`assets/generated/${entry.name}`);
}
let sourceBytes = 0, outputBytes = 0;
for (const file of files.sort()) {
  if (process.argv.includes('--missing-only') && await stat(path.join(root, file.replace(/\.png$/i, '.webp'))).then(()=>true,()=>false)) continue;
  const input = await readFile(path.join(root, file));
  const before = await sharp(input).metadata();
  const output = await sharp(input).webp({quality: 90, alphaQuality: 100, effort: 6}).toBuffer();
  const after = await sharp(output).metadata();
  if (before.width !== after.width || before.height !== after.height || Boolean(before.hasAlpha) !== Boolean(after.hasAlpha)) {
    throw new Error(`Dimensions or alpha changed: ${file}`);
  }
  const target = file.replace(/\.png$/i, '.webp');
  await writeFile(path.join(root, target), output);
  sourceBytes += input.length;
  outputBytes += output.length;
  console.log(`${target}: ${before.width}x${before.height}, ${input.length} -> ${output.length} bytes`);
}
console.log(JSON.stringify({images: files.length, sourceBytes, outputBytes, reductionPercent: Number((100 - outputBytes / sourceBytes * 100).toFixed(1))}));
