import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const sharp=require(process.env.SHARP_MODULE_PATH||'C:/Users/bongb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const assets=JSON.parse(await readFile('docs/new-assets-20261015.json','utf8'));
const checks=[];
for(const {key} of assets){
 const {data,info}=await sharp(`assets/generated/${key}.webp`).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let transparent=0,minX=info.width,minY=info.height,maxX=-1,maxY=-1;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){const a=data[(y*info.width+x)*4+3];if(a===0)transparent++;if(a>128){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}}
 const corners=[0,info.width-1,(info.height-1)*info.width,info.width*info.height-1].map(p=>data[p*4+3]);
 if(key.startsWith('mascot_')&&(!corners.every(v=>v<=1)||minX<10||minY<10||maxX>info.width-10||maxY>info.height-10))throw Error(`Mascot alpha or margin failed: ${key}`);
 checks.push({key,width:info.width,height:info.height,transparentPercent:Math.round(100*transparent/info.width/info.height),corners,bounds:[minX,minY,maxX,maxY]});
}
await writeFile('docs/ALPHA-CHECK-20261015.json',JSON.stringify(checks,null,2));
console.log(JSON.stringify(checks.filter(c=>c.key.startsWith('mascot_'))));
