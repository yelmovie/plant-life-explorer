import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const root = process.argv.includes('--dist') ? path.join(projectRoot, 'dist') : projectRoot;
const port = Number(process.env.PORT || 4318);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.svg':'image/svg+xml','.woff2':'font/woff2','.glb':'model/gltf-binary','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.md':'text/plain; charset=utf-8'};
http.createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    const rel = path.relative(root,file);
    if (rel.startsWith('..') || path.isAbsolute(rel) || rel.split(path.sep).some(p=>p.startsWith('.'))) { res.writeHead(403); return res.end(); }
    const data=await readFile(file);
    res.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream', 'Cache-Control':'no-cache'}); res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, '127.0.0.1',()=>console.log(`초록정원 연구기지 http://127.0.0.1:${port}`));
