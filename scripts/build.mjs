import { readdir, readFile, writeFile, mkdir, copyFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
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
  || /^assets\/icons\/[^/]+\.png$/i.test(file) || /^assets\/models\/[^/]+\.glb$/i.test(file) || /^assets\/audio\/[^/]+\.mp3$/i.test(file) || /^assets\/videos\/[^/]+\.mp4$/i.test(file) || /^assets\/fonts\/[^/]+(?:\.woff2|-OFL\.txt)$/i.test(file));
const pwa = ['sw.js', 'manifest.webmanifest'];
const files = ['index.html', ...pwa, ...source, ...assets];
const allowed = new Set([...files,'build-info.json','src/bundle.css','src/app.bundle.js']);
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
// One stylesheet request instead of one per layer: concatenate index.html's links in cascade order.
// Source files keep their layers for editing; every url() in them is root-relative, so joining is safe.
const indexHtml = await readFile(path.join(root, 'index.html'), 'utf8');
const styleLinks = [...indexHtml.matchAll(/<link rel="stylesheet" href="\/(src\/[^"]+\.css)">\n?/g)];
const styles = styleLinks.map(match => match[1]);
if (!styles.length) throw new Error('index.html stylesheet links not found.');
const bundle = (await Promise.all(styles.map(async file => `/* ${file} */\n${await readFile(path.join(root, file), 'utf8')}`))).join('\n');
await writeFile(path.join(output, 'src/bundle.css'), bundle);
let bundledHtml = indexHtml.replace(styleLinks[0][0], '<link rel="stylesheet" href="/src/bundle.css">\n');
for (const match of styleLinks.slice(1)) bundledHtml = bundledHtml.replace(match[0], '');
// Optional single script request: an already-installed esbuild (ESBUILD_MODULE_PATH, else wrangler's copy) bundles
// app.js's static graph. spatial.js stays a separate lazy chunk. Without esbuild the modules ship unbundled.
let scriptBundle = null;
try {
  const esbuild = createRequire(import.meta.url)(process.env.ESBUILD_MODULE_PATH || 'C:/Users/bongb/AppData/Roaming/npm/node_modules/wrangler/node_modules/esbuild');
  await esbuild.build({entryPoints: [path.join(root, 'src/app.js')], bundle: true, format: 'esm', target: 'es2020', external: ['./spatial.js'], outfile: path.join(output, 'src/app.bundle.js'), minify: true, legalComments: 'none', logLevel: 'error'});
  const css = await esbuild.transform(bundle, {loader: 'css', minify: true, logLevel: 'error'});
  await writeFile(path.join(output, 'src/bundle.css'), css.code);
  bytes += Buffer.byteLength(css.code) - Buffer.byteLength(bundle);
  const entry = '<script type="module" src="/src/app.js"></script>';
  if (!bundledHtml.includes(entry)) throw new Error('index.html app.js entry not found.');
  bundledHtml = bundledHtml.replace(entry, '<script type="module" src="/src/app.bundle.js"></script>');
  scriptBundle = 'src/app.bundle.js';
  bytes += (await stat(path.join(output, scriptBundle))).size;
} catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') throw error;
  console.warn('esbuild not found: shipping unbundled ES modules.');
}
await writeFile(path.join(output, 'index.html'), bundledHtml);
bytes += Buffer.byteLength(bundle) + Buffer.byteLength(bundledHtml) - Buffer.byteLength(indexHtml);
// Service worker: version + content hash so any redeploy replaces old caches; precache the app shell.
const hash = createHash('sha1');
for (const file of files) hash.update(file).update(await readFile(path.join(root, file)));
const shell = ['/', '/src/bundle.css', ...(scriptBundle ? ['/'+scriptBundle] : []), ...files.filter(file => file !== 'sw.js' && !styles.includes(file) && !file.startsWith('src/vendor/') && !file.startsWith('assets/icons/') && !file.startsWith('assets/models/') && !/\.(mp4|mp3)$/.test(file) && !/\.(?:md|txt)$/i.test(file)
  && (!file.startsWith('assets/generated/') || /\/(?:expedition_hero_20261020|mascot_[a-z]+|map_trail_v2|reward_[a-z]+_thumb)\.webp$/.test(file))).map(file => `/${file}`)];
const swPath = path.join(output, 'sw.js');
let sw = await readFile(swPath, 'utf8');
const versioned = sw.replace(/const CACHE_VERSION='[^']*';/, `const CACHE_VERSION='${version}-${hash.digest('hex').slice(0, 8)}';`).replace(/const APP_SHELL=\[[^\]]*\];/, `const APP_SHELL=${JSON.stringify(shell)};`);
if (versioned === sw || !versioned.includes(`'${version}-`)) throw new Error('sw.js CACHE_VERSION/APP_SHELL markers not found.');
await writeFile(swPath, versioned);
bytes += Buffer.byteLength(versioned) - Buffer.byteLength(sw);
const git=(...args)=>execFileSync('git',['-c',`safe.directory=${root.replaceAll('\\','/')}`,...args],{cwd:root,encoding:'utf8'}).trim();
const manifest={version,commit:git('rev-parse','HEAD'),branch:git('branch','--show-current'),dirty:!!git('status','--porcelain'),builtAt:new Date().toISOString(),files:[]};
for(const file of [...files,'src/bundle.css',...(scriptBundle?[scriptBundle]:[])]){const content=await readFile(path.join(output,file));manifest.files.push({path:file,bytes:content.length,sha256:createHash('sha256').update(content).digest('hex')});}
await writeFile(path.join(output,'build-info.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify({directory: output, version, files: files.length, assets: assets.length, precache: shell.length, bytes, hosting: 'site root', excluded: ['source PNGs', 'docs', 'tests', 'scripts', 'server.mjs']}));
