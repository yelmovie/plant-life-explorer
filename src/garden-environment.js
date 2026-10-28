import * as THREE from './vendor/three/three.module.min.js';
import {groundMaterial} from './season-environment.js';

const maps=new Map();
const seeded=seed=>()=>{seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};
function terrainMap(kind){
 if(maps.has(kind))return maps.get(kind);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
 const ctx=canvas.getContext('2d'),data=ctx.createImageData(256,256),rand=seeded(312);
 for(let y=0;y<256;y++)for(let x=0;x<256;x++){
  const i=(y*256+x)*4,noise=(rand()-.5)*(kind==='water'?8:30),wave=Math.sin(x*.075+Math.sin(y*.06)*2)*Math.cos(y*.044);
  const base=kind==='water'?[41,132,149]:[184,152,98];
  for(let c=0;c<3;c++)data.data[i+c]=base[c]+noise+wave*(kind==='water'?13:8);
  data.data[i+3]=255;
 }
 ctx.putImageData(data,0,0);
 if(kind==='dry'){
  for(let i=0;i<38;i++){
   const x=rand()*256,y=rand()*256;ctx.beginPath();ctx.moveTo(x,y);
   ctx.lineTo(x+rand()*22-11,y+10+rand()*18);ctx.lineTo(x+rand()*32-16,y+20+rand()*18);
   ctx.strokeStyle='#70533755';ctx.lineWidth=.5+rand();ctx.stroke();
  }
  for(let i=0;i<1200;i++){ctx.fillStyle=i%3?'#765c3a66':'#f4d6a16b';ctx.fillRect(rand()*256,rand()*256,1+rand()*2,1);}
 }else{
  for(let i=0;i<24;i++){
   const y=i*12;ctx.beginPath();ctx.moveTo(-12,y);
   ctx.bezierCurveTo(70,y-14,170,y+16,270,y-2);
   ctx.strokeStyle=i%3?'#bdebd325':'#e4ffff66';ctx.lineWidth=.6+rand();ctx.stroke();
  }
 }
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=4;
 const bump=new THREE.CanvasTexture(canvas);bump.wrapS=bump.wrapT=THREE.RepeatWrapping;
 const result={map,bump};
 if(kind==='water'){
  const normal=new Uint8Array(256*256*4);
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){
   const i=(y*256+x)*4;normal[i]=128+Math.sin(x*Math.PI/32+y*Math.PI/64)*38;
   normal[i+1]=128+Math.cos(y*Math.PI/32+x*Math.PI/64)*30;normal[i+2]=248;normal[i+3]=255;
  }
  result.normal=new THREE.DataTexture(normal,256,256);result.normal.wrapS=result.normal.wrapT=THREE.RepeatWrapping;result.normal.needsUpdate=true;
 }
 maps.set(kind,result);return result;
}

export function createGardenTerrain(parent,terrain){
 const soil=groundMaterial('soil',0),grass=groundMaterial('grass',1),dryMaps=terrainMap('dry'),waterMaps=terrainMap('water');
 const dry=new THREE.MeshStandardMaterial({map:dryMaps.map,bumpMap:dryMaps.bump,bumpScale:.028,roughness:1});
 const water=new THREE.MeshPhysicalMaterial({map:waterMaps.map,normalMap:waterMaps.normal,normalScale:new THREE.Vector2(.38,.38),roughness:.22,metalness:.04,clearcoat:1,clearcoatRoughness:.15});
 water.onBeforeCompile=shader=>{
  shader.uniforms.gardenTime={value:0};
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float gardenTime;').replace('#include <begin_vertex>','#include <begin_vertex>\nvec2 gardenXZ = (modelMatrix * vec4(position, 1.0)).xz;\ntransformed.y += sin(gardenXZ.x * 7.0 + gardenTime) * cos(gardenXZ.y * 6.0 - gardenTime * 0.7) * 0.012;');
  water.userData.shader=shader;
 };
 water.customProgramCacheKey=()=> 'garden-water-v1';
 const materials={empty:soil,grass,dry,water};
 const base=new THREE.Mesh(new THREE.BoxGeometry(6.38,.38,4.38),soil);base.position.y=-.32;base.receiveShadow=true;parent.add(base);
 const geometry=new THREE.BoxGeometry(.987,.18,.987),tiles=[];
 for(let i=0;i<24;i++){
  const tile=new THREE.Mesh(geometry,[soil,soil,materials[terrain[i]]||soil,soil,soil,soil]);
  tile.position.set(i%6-2.5,-.055,Math.floor(i/6)-1.5);tile.userData.cell=i;tile.receiveShadow=true;parent.add(tile);tiles.push(tile);
 }
 const blades=new THREE.BufferGeometry();
 blades.setAttribute('position',new THREE.Float32BufferAttribute([-.5,0,0,.5,0,0,-.32,.5,.1,.32,.5,.1,-.12,.83,.3,.12,.83,.3,0,1,.56],3));
 blades.setIndex([0,1,2,1,3,2,2,3,4,3,5,4,4,5,6]);blades.computeVertexNormals();
 const grassMaterial=new THREE.MeshStandardMaterial({side:THREE.DoubleSide,roughness:.95});
 const grassBlades=new THREE.InstancedMesh(blades,grassMaterial,24*100);grassBlades.receiveShadow=true;grassBlades.frustumCulled=false;parent.add(grassBlades);
 const stoneMaterial=new THREE.MeshStandardMaterial({color:0xac9471,roughness:1});
 const stones=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),stoneMaterial,24*24);stones.receiveShadow=true;stones.frustumCulled=false;parent.add(stones);
 const rippleMaterial=new THREE.MeshBasicMaterial({color:0xd1f8ef,transparent:true,opacity:.35,depthWrite:false});
 const rings=new THREE.InstancedMesh(new THREE.TorusGeometry(.12,.008,4,24),rippleMaterial,48);rings.frustumCulled=false;parent.add(rings);
 const matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),at=new THREE.Vector3(),scale=new THREE.Vector3(),up=new THREE.Vector3(0,1,0),color=new THREE.Color();
 let shown=[],waterCells=[],lastFrame=0;
 function update(next){
  if(next.every((t,i)=>t===shown[i]))return;
  shown=[...next];waterCells=[];let bladeIndex=0,stoneIndex=0,ringIndex=0;
  for(let i=0;i<24;i++){
   const type=shown[i],tile=tiles[i],rand=seeded(900+i),x=tile.position.x,z=tile.position.z;
   tile.material[2]=materials[type]||soil;
   if(type==='grass')for(let j=0;j<100;j++){
    const h=.055+rand()*.085;at.set(x+(rand()-.5)*.96,.037,z+(rand()-.5)*.96);q.setFromAxisAngle(up,rand()*Math.PI*2);scale.set(.014+rand()*.014,h,h*.7);
    matrix.compose(at,q,scale);grassBlades.setMatrixAt(bladeIndex,matrix);grassBlades.setColorAt(bladeIndex++,color.setHex([0x527a31,0x789545,0x98ae56,0x466e2c][j%4]));
   }
   if(type==='dry')for(let j=0;j<12;j++){
    const r=.012+rand()*.028;at.set(x+(rand()-.5)*.9,.037,z+(rand()-.5)*.9);q.setFromEuler(new THREE.Euler(rand()*3,rand()*3,rand()*3));scale.set(r*1.4,r*.6,r);
    matrix.compose(at,q,scale);stones.setMatrixAt(stoneIndex++,matrix);
   }
   if(type==='water'){
    waterCells.push(i);
    // Small banks between water and land make the surface read as a shallow pool.
    for(const [dx,dz] of [[-1,0],[1,0],[0,-1],[0,1]]){
     const cx=i%6+dx,cz=Math.floor(i/6)+dz;
     if(cx<0||cx>5||cz<0||cz>3||shown[cz*6+cx]==='water')continue;
     for(let j=0;j<3;j++){
      const along=(j-1)*.28,r=.045+rand()*.018;
      at.set(x+dx*.45+(dz?along:0),.045,z+dz*.45+(dx?along:0));q.setFromEuler(new THREE.Euler(rand(),rand()*3,rand()));scale.set(r*1.5,r*.65,r);
      matrix.compose(at,q,scale);stones.setMatrixAt(stoneIndex++,matrix);
     }
    }
    for(let j=0;j<2;j++){
     at.set(x+(j-.5)*.27,.041,z+(rand()-.5)*.24);q.setFromAxisAngle(new THREE.Vector3(1,0,0),-Math.PI/2);scale.setScalar(1+j*.55);
     matrix.compose(at,q,scale);rings.setMatrixAt(ringIndex++,matrix);
    }
   }
  }
  for(const [inst,count] of [[grassBlades,bladeIndex],[stones,stoneIndex],[rings,ringIndex]]){inst.count=count;inst.instanceMatrix.needsUpdate=true;if(inst.instanceColor)inst.instanceColor.needsUpdate=true;}
 }
 update(terrain);
 return {
  tiles,update,
  preview(cell,type){if(shown[cell]===type)return;const next=[...shown];next[cell]=type;update(next);},
  animate(now){
   if(!waterCells.length||now-lastFrame<90)return false;
   lastFrame=now;waterMaps.normal.offset.set(now*.000012,now*.000008);waterMaps.map.offset.set(now*.000004,0);
   if(water.userData.shader)water.userData.shader.uniforms.gardenTime.value=now*.001;
   rippleMaterial.opacity=.28+Math.sin(now*.0015)*.08;return true;
  },
  dispose(){for(const material of [...Object.values(materials),grassMaterial,stoneMaterial,rippleMaterial])material.dispose();}
 };
}
