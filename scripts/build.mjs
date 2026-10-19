import { readdir, readFile, writeFile, mkdir, copyFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ASSETS, THUMBS } from '../src/asset-catalog.js';
import { APP_VERSION } from '../src/settings-content.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const {version} = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
if (APP_VERSION !== version) throw new Error(`src/settings-content.js APP_VERSION ${APP_VERSION} must match package.json ${version}.`);
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
const assets = (await walk('assets')).filter(file => /\.webp$/i.test(file) || /(?:credits|licenses?|provenance)[^/]*\.(?:md|json|txt|csv)$/i.test(path.basename(file))
  || /^assets\/icons\/[^/]+\.png$/i.test(file) || /^assets\/fonts\/[^/]+(?:\.woff2|-OFL\.txt)$/i.test(file));
const pwa = ['sw.js', 'manifest.webmanifest'];
const files = ['index.html', ...pwa, ...source, ...assets];
const allowed = new Set(files);
for (const key of Object.keys(ASSETS)) {
  const asset = `assets/generated/${key}.webp`;
  if (!allowed.has(asset)) throw new Error(`Missing catalog image: ${asset}. Run npm run assets:optimize after all PNGs arrive.`);
}
for (const key of THUMBS) if (!allowed.has(`assets/generated/${key}_thumb.webp`)) throw new Error(`Missing thumbnail: assets/generated/${key}_thumb.webp`);
// Root-relative URLs are intentional: deploy dist as the site root.
for (const file of ['index.html', ...pwa, ...source]) {
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
// Service worker: version + content hash so any redeploy replaces old caches; precache the app shell.
const hash = createHash('sha1');
for (const file of files) hash.update(file).update(await readFile(path.join(root, file)));
const shell = ['/', ...files.filter(file => file !== 'sw.js' && !file.startsWith('src/vendor/') && !file.startsWith('assets/icons/') && !/\.(?:md|txt)$/i.test(file)
  && (!file.startsWith('assets/generated/') || /\/(?:garden_hero|mascot_[a-z]+|map_trail_v2|reward_[a-z]+_thumb)\.webp$/.test(file))).map(file => `/${file}`)];
const swPath = path.join(output, 'sw.js');
let sw = await readFile(swPath, 'utf8');
const versioned = sw.replace(/const CACHE_VERSION='[^']*';/, `const CACHE_VERSION='${version}-${hash.digest('hex').slice(0, 8)}';`).replace(/const APP_SHELL=\[[^\]]*\];/, `const APP_SHELL=${JSON.stringify(shell)};`);
if (versioned === sw || !versioned.includes(`'${version}-`)) throw new Error('sw.js CACHE_VERSION/APP_SHELL markers not found.');
await writeFile(swPath, versioned);
bytes += Buffer.byteLength(versioned) - Buffer.byteLength(sw);
console.log(JSON.stringify({directory: output, version, files: files.length, assets: assets.length, precache: shell.length, bytes, hosting: 'site root', excluded: ['source PNGs', 'docs', 'tests', 'scripts', 'server.mjs']}));
