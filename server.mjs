import http from 'node:http';
import { stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const root = process.argv.includes('--dist') ? path.join(projectRoot, 'dist') : projectRoot;
const port = Number(process.env.PORT || 4318);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.mp3':'audio/mpeg','.webp':'image/webp','.avif':'image/avif','.svg':'image/svg+xml','.woff2':'font/woff2','.glb':'model/gltf-binary','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.md':'text/plain; charset=utf-8'};
http.createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    const rel = path.relative(root,file);
    if (rel.startsWith('..') || path.isAbsolute(rel) || rel.split(path.sep).some(p=>p.startsWith('.'))) { res.writeHead(403); return res.end(); }
    const info=await stat(file);
    if(!info.isFile()){res.writeHead(404);return res.end('Not found');}
    const headers={'Content-Type':path.extname(file)==='.mp4'?'video/mp4':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','Accept-Ranges':'bytes'};
    let start=0,end=info.size-1,status=200;
    if(req.headers.range){
      const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if(!match||(!match[1]&&!match[2])){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});return res.end();}
      start=match[1]?Number(match[1]):Math.max(0,info.size-Number(match[2]));
      end=match[1]&&match[2]?Math.min(Number(match[2]),info.size-1):info.size-1;
      if(start>end||start>=info.size){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});return res.end();}
      status=206;headers['Content-Range']=`bytes ${start}-${end}/${info.size}`;
    }
    headers['Content-Length']=Math.max(0,end-start+1);
    res.writeHead(status,headers);
    if(req.method==='HEAD'||!info.size)return res.end();
    const stream=createReadStream(file,{start,end});
    stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, '127.0.0.1',()=>console.log(`초록정원 연구기지 http://127.0.0.1:${port}`));
