import * as THREE from './vendor/three/three.module.min.js';

// Small local textures are generated once. No downloads or changes to the Meshy assets.
const surfaces=new Map();
const random=seed=>()=>{seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};
function surface(kind,season){
 const key=`${kind}:${season}`;
 if(surfaces.has(key))return surfaces.get(key);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
 const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(512,512),rand=random(31);
 const tones=[[92,120,52],[81,111,45],[126,112,61],[221,230,230],[117,137,77]];
 const base=kind==='grass'?tones[season]||tones[0]:[111,77,49];
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){
  const grain=(rand()-.5)*28,patch=Math.sin(x*.039+Math.sin(y*.024)*2)*Math.cos(y*.047)*9;
  const layer=kind==='soil'?Math.sin(y*.051+Math.sin(x*.019)*.8)*7+(1-y/512)*14:0;
  const shade=grain+patch+layer,i=(y*512+x)*4;
  for(let c=0;c<3;c++)pixels.data[i+c]=Math.max(0,Math.min(255,base[c]+shade));
  pixels.data[i+3]=255;
 }
 ctx.putImageData(pixels,0,0);
 if(kind==='soil'){
  // Uneven mineral bands and grains remain visible behind the exposed roots.
  for(let band=0;band<6;band++){
   ctx.beginPath();
   for(let x=0;x<=512;x+=8){const y=band*94+Math.sin(x*.025+band)*7+Math.sin(x*.08)*2;x?ctx.lineTo(x,y):ctx.moveTo(x,y);}
   ctx.strokeStyle=band%2?'#d0a07124':'#35291d28';ctx.lineWidth=9+rand()*12;ctx.stroke();
  }
  for(let i=0;i<2600;i++){
   const x=rand()*512,y=rand()*512,r=.4+rand()*2;
   ctx.fillStyle=i%3?'#30251b55':'#d8b98d66';ctx.beginPath();ctx.ellipse(x,y,r*1.5,r,rand()*3,0,Math.PI*2);ctx.fill();
  }
 }else{
  for(let i=0;i<5500;i++){
   const x=rand()*512,y=rand()*512;
   ctx.strokeStyle=season===3?(i%2?'#ffffff45':'#aabcc138'):(i%3?'#ced79c33':'#29361b44');
   ctx.lineWidth=.5+rand();ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+rand()*4-2,y-2-rand()*5);ctx.stroke();
  }
 }
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;
 const bump=new THREE.CanvasTexture(canvas);
 const result={map,bump};surfaces.set(key,result);return result;
}

export function groundMaterial(kind,season){
 const {map,bump}=surface(kind,kind==='soil'?0:season);
 return new THREE.MeshStandardMaterial({map,bumpMap:bump,bumpScale:kind==='soil'?.018:.009,roughness:.96});
}

function grass(parent,w,d,season,plant,front){
 const rand=random(57),positions=[-.5,0,0,.5,0,0,-.36,.48,.13,.36,.48,.13,-.15,.82,.31,.15,.82,.31,0,1,.53];
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geometry.setIndex([0,1,2,1,3,2,2,3,4,3,5,4,4,5,6]);geometry.computeVertexNormals();
 const material=new THREE.MeshStandardMaterial({side:THREE.DoubleSide,roughness:.92});
 const count=Math.round(w*d*(season===3?12:380)),blades=new THREE.InstancedMesh(geometry,material,count);
 const matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),scale=new THREE.Vector3(),at=new THREE.Vector3(),up=new THREE.Vector3(0,1,0);
 const tint=new THREE.Color(),palette=season===3?[0x9c966d,0xb6b190]:season===2?[0x8a8846,0xa79c53,0x667a36]:[0x4d712d,0x789746,0x9aac58,0x608333];
 let i=0;
 // Keep the root crown clear so decorative grass cannot be mistaken for the observed plant.
 while(i<count){
  const x=(rand()-.5)*w*.985,z=(rand()-.5)*d*.985;
  if(Math.hypot(x,z)<(plant==='cherry'?.19:.33))continue;
  at.set(x,.006,z);q.setFromAxisAngle(up,rand()*Math.PI*2);
  const h=(.025+rand()*.055)*(season===3?.5:season===4?.65:1);
  scale.set(.008+rand()*.009,h,h*.55);matrix.compose(at,q,scale);blades.setMatrixAt(i,matrix);
  blades.setColorAt(i,tint.setHex(palette[Math.floor(rand()*palette.length)]));i++;
 }
 // Split along the same cut as the soil; opening it removes all grass in front of the roots.
 const back=blades.clone();back.geometry=geometry;back.material=material;
 for(let k=0;k<count;k++){
  blades.getMatrixAt(k,matrix);at.setFromMatrixPosition(matrix);
  if(at.z>=0){back.setMatrixAt(k,new THREE.Matrix4().makeScale(0,0,0));}
  else blades.setMatrixAt(k,new THREE.Matrix4().makeScale(0,0,0));
 }
 blades.receiveShadow=back.receiveShadow=true;
 parent.add(back);front.add(blades);
}

export function seasonSoil(parent,{width:w,depth:d,height,season,plant,open}){
 const dirt=groundMaterial('soil',season),top=groundMaterial('grass',season),front=new THREE.Group();
 front.visible=!open;parent.add(front);
 for(const [z,target] of [[-d/4,parent],[d/4,front]]){
  const block=new THREE.Mesh(new THREE.BoxGeometry(w,height,d/2),[dirt,dirt,top,dirt,dirt,dirt]);
  block.position.set(0,-height/2,z);block.receiveShadow=true;target.add(block);
 }
 grass(parent,w,d,season,plant,front);
 const rand=random(92),count=Math.round(w*d*18),stones=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),new THREE.MeshStandardMaterial({color:0xab9678,roughness:1}),count);
 const matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),at=new THREE.Vector3(),scale=new THREE.Vector3();
 for(let i=0;i<count;i++){
  const size=.007+rand()*.012;
  at.set((rand()-.5)*w*.96,.004,-rand()*d*.48);
  q.setFromEuler(new THREE.Euler(rand()*3,rand()*3,rand()*3));scale.set(size*1.6,size*.65,size);
  matrix.compose(at,q,scale);stones.setMatrixAt(i,matrix);
 }
 stones.receiveShadow=true;parent.add(stones);
}

function blossomGeometry(){
 const positions=[],colors=[],pink=new THREE.Color();
 const point=(petal,t)=>{
  const angle=petal*Math.PI*2/5,radial=.52+Math.cos(t)*.45,side=Math.sin(t)*.31;
  return [Math.cos(angle)*radial-Math.sin(angle)*side,Math.sin(angle)*radial+Math.cos(angle)*side,.08+Math.cos(t)*.055+Math.abs(Math.sin(t))*.12];
 };
 const vertex=(p,color)=>{positions.push(...p);pink.setHex(color);colors.push(pink.r,pink.g,pink.b);};
 for(let petal=0;petal<5;petal++)for(let j=0;j<12;j++){
  const angle=petal*Math.PI*2/5;
  vertex([Math.cos(angle)*.42,Math.sin(angle)*.42,.025],0xffd4e1);
  vertex(point(petal,j*Math.PI*2/12),0xfff5f8);vertex(point(petal,(j+1)*Math.PI*2/12),0xffedf3);
 }
 // A small warm center makes each flower readable from close up.
 for(let j=0;j<10;j++){
  vertex([0,0,.065],0xeec46e);
  vertex([Math.cos(j*Math.PI/5)*.13,Math.sin(j*Math.PI/5)*.13,.07],0xf5d991);
  vertex([Math.cos((j+1)*Math.PI/5)*.13,Math.sin((j+1)*Math.PI/5)*.13,.07],0xf5d991);
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();return geometry;
}

export function seasonBlossoms(parent,anchors){
 if(!anchors.length)return;
 const rand=random(83),count=anchors.length*9;
 const flowers=new THREE.InstancedMesh(blossomGeometry(),new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.72,emissive:0x532034,emissiveIntensity:.15}),count);
 const matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),at=new THREE.Vector3(),scale=new THREE.Vector3(),color=new THREE.Color();
 let i=0;
 for(const anchor of anchors)for(let j=0;j<9;j++){
  at.copy(anchor).add(new THREE.Vector3((rand()-.5)*.16,(rand()-.5)*.14,(rand()-.5)*.16));
  q.setFromEuler(new THREE.Euler(rand()*Math.PI*2,rand()*Math.PI*2,rand()*Math.PI*2));
  scale.setScalar(.044+rand()*.022);matrix.compose(at,q,scale);flowers.setMatrixAt(i,matrix);
  color.setHex([0xffffff,0xffe4ee,0xffc5d9][Math.floor(rand()*3)]);flowers.setColorAt(i++,color);
 }
 flowers.castShadow=true;flowers.receiveShadow=true;parent.add(flowers);
}
