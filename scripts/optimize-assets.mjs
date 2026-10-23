import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ASSETS, THUMBS } from '../src/asset-catalog.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const sharpPath = process.env.SHARP_MODULE_PATH || 'C:/Users/bongb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp';
let sharp;
try { sharp = require(sharpPath); }
catch { throw new Error('Bundled sharp is unavailable. Set SHARP_MODULE_PATH to an existing sharp installation; no packages are installed by this script.'); }

// Editing originals live outside the runtime asset directory. Only active images are converted.
const active = new Set([...Object.keys(ASSETS), ...THUMBS.map(key => key+'_thumb')]);
const files = [{source:'_source/branding/title.png',target:'assets/title.webp'}];
for (const entry of await readdir(path.join(root, '_source/generated-images'), {withFileTypes: true})) {
  if (entry.isFile() && /\.png$/i.test(entry.name) && active.has(entry.name.replace(/\.png$/i,'')))
    files.push({source:`_source/generated-images/${entry.name}`,target:`assets/generated/${entry.name.replace(/\.png$/i,'.webp')}`});
}
let sourceBytes = 0, outputBytes = 0;
for (const {source:file,target} of files.sort((a,b)=>a.source.localeCompare(b.source))) {
  if (process.argv.includes('--missing-only') && await stat(path.join(root, target)).then(()=>true,()=>false)) continue;
  const input = await readFile(path.join(root, file));
  const before = await sharp(input).metadata();
  const output = await sharp(input).webp({quality: 90, alphaQuality: 100, effort: 6}).toBuffer();
  const after = await sharp(output).metadata();
  if (before.width !== after.width || before.height !== after.height || Boolean(before.hasAlpha) !== Boolean(after.hasAlpha)) {
    throw new Error(`Dimensions or alpha changed: ${file}`);
  }
  await writeFile(path.join(root, target), output);
  sourceBytes += input.length;
  outputBytes += output.length;
  console.log(`${target}: ${before.width}x${before.height}, ${input.length} -> ${output.length} bytes`);
}
console.log(JSON.stringify({images: files.length, sourceBytes, outputBytes, reductionPercent: Number((100 - outputBytes / sourceBytes * 100).toFixed(1))}));
