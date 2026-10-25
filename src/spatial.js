import * as THREE from './vendor/three/three.module.min.js';
import {GLTFLoader} from './vendor/three/addons/loaders/GLTFLoader.js';
import {icon} from './art.js';

// One renderer is reused between activities. All scene geometry is released on navigation.
let renderer, activeCleanup, activeGarden, spatialInstance=0;
const textures=new Map(), views=new Map(), models=new Map();
// GLB scenes are loaded once and shared by clones; cleanup skips them via userData.shared.
function loadModel(key){if(!models.has(key))models.set(key,new GLTFLoader().loadAsync(`/assets/models/${key}.glb`).then(g=>{g.scene.traverse(o=>{o.userData.shared=true;});return g.scene;}));return models.get(key);}
function loadTexture(key){
 if(!textures.has(key)){
  const entry={};entry.ready=new Promise((resolve,reject)=>{entry.texture=new THREE.TextureLoader().load(`/assets/generated/${key}.webp`,resolve,undefined,reject);});
  entry.texture.colorSpace=THREE.SRGBColorSpace;textures.set(key,entry);
 }
 return textures.get(key);
}
const colors={water:0x79c8d4,grass:0x96b85d,dry:0xd9b67b,empty:0xbca78a};
// Seeded random: leaves and petals land in the same places every time the season scene opens.
const seeded=seed=>()=>{seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};
// Twig tips = the outermost crown vertices, spread out by farthest-point sampling.
function twigTips(root,count){
 root.updateMatrixWorld(true);const pts=[],v=new THREE.Vector3();
 root.traverse(o=>{if(!o.isMesh||!/crown/.test(o.name))return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i+=2)pts.push(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld).clone());});
 if(!pts.length)return [];
 const box=new THREE.Box3().setFromPoints(pts),c=box.getCenter(new THREE.Vector3()),h=box.getSize(new THREE.Vector3()).multiplyScalar(.5);
 const score=q=>((q.x-c.x)/h.x)**2+((q.y-c.y)/h.y)**2+((q.z-c.z)/h.z)**2;
 const outer=pts.map(q=>[q,score(q)]).sort((a,b)=>b[1]-a[1]).slice(0,Math.max(count,Math.floor(pts.length*.25))).map(x=>x[0]);
 const picked=[outer[0]],dist=outer.map(q=>q.distanceToSquared(outer[0]));
 while(picked.length<count){let best=0;for(let i=1;i<outer.length;i++)if(dist[i]>dist[best])best=i;if(!dist[best])break;picked.push(outer[best]);for(let i=0;i<outer.length;i++)dist[i]=Math.min(dist[i],outer[i].distanceToSquared(outer[best]));}
 picked.center=c;picked.half=h;return picked;
}
// One draw call for every leaf, petal cluster or bud card around the twig tips.
function tipCards(parent,tex,anchors,per,sx,sy,spread,draw,tint=0xffffff,seed=7){
 if(!anchors.length)return null;
 const rand=seeded(seed),geo=new THREE.PlaneGeometry(sx,sy);geo.translate(0,sy*.42,0);
 const material=new THREE.MeshStandardMaterial({map:tex.texture,color:tint,alphaTest:.45,side:THREE.DoubleSide,roughness:.82});
 const inst=new THREE.InstancedMesh(geo,material,anchors.length*per),m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),at=new THREE.Vector3(),sc=new THREE.Vector3();
 let k=0;for(const a of anchors)for(let j=0;j<per;j++){at.set(rand()-.5,rand()-.5,rand()-.5).normalize().multiplyScalar(spread*rand()).add(a);e.set((rand()-.5)*2.2,rand()*Math.PI*2,(rand()-.5)*2.2);q.setFromEuler(e);sc.setScalar(.75+rand()*.5);m.compose(at,q,sc);inst.setMatrixAt(k++,m);}
 inst.instanceMatrix.needsUpdate=true;parent.add(inst);tex.ready.then(draw).catch(()=>{});return inst;
}
function groundCards(parent,tex,count,w,d,size,draw,seed=11){
 const rand=seeded(seed),geo=new THREE.PlaneGeometry(size,size*1.25);geo.rotateX(-Math.PI/2);
 const inst=new THREE.InstancedMesh(geo,new THREE.MeshStandardMaterial({map:tex.texture,alphaTest:.45,side:THREE.DoubleSide,roughness:.9}),count),m=new THREE.Matrix4(),q=new THREE.Quaternion(),at=new THREE.Vector3(),one=new THREE.Vector3(1,1,1),up=new THREE.Vector3(0,1,0);
 for(let i=0;i<count;i++){at.set((rand()-.5)*w*.85,.042+i*.0005,(rand()-.5)*d*.85);q.setFromAxisAngle(up,rand()*Math.PI*2);m.compose(at,q,one);inst.setMatrixAt(i,m);}
 inst.instanceMatrix.needsUpdate=true;parent.add(inst);tex.ready.then(draw).catch(()=>{});return inst;
}
export function unmountSpatial(){activeCleanup?.();activeCleanup=null;}
// Reuse the attached canvas while editing a garden: no empty frame or GLB reload.
export function reuseGarden(nextHost,state,ui){
 if(!activeGarden||nextHost.dataset.spatial!=='garden')return false;
 const {host,update}=activeGarden;
 const nextGrid=nextHost.querySelector('.garden-grid');
 if(nextGrid)host.querySelector('.garden-grid')?.replaceWith(nextGrid);
 nextHost.replaceWith(host);update(state,ui);return true;
}
export function mountSpatial(host,s,u,send,paint){
 unmountSpatial();
 if(!host?.isConnected)return;
 try{renderer??=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{host.dataset.spatialUnavailable='true';return;}
 const kind=host.dataset.spatial,abort=new AbortController(),signal=abort.signal;
 let disposed=false,frame=0,drag=null,flat=false,unavailable=false;
 const scene=new THREE.Scene(),group=new THREE.Group();scene.add(group);
 const camera=new THREE.PerspectiveCamera(34,1,.1,100);
 const cameraTarget=new THREE.Vector3(0,kind==='garden'?0:.2,0);
 const initial=kind==='garden'?{yaw:.55,pitch:.8,zoom:1}:kind==='season'?{yaw:.5,pitch:.16,zoom:1.55}:{yaw:.24,pitch:.12,zoom:1};
 const view=views.get(kind)||{...initial};
 flat=view.flat===true||(kind==='bag'&&view.flat!==false);
 const light=new THREE.DirectionalLight(0xfff4d8,3.1);light.position.set(-3,6,6);scene.add(light,new THREE.HemisphereLight(0xf2fcff,0x7c6951,2.5));
 const fill=new THREE.DirectionalLight(0xd5efff,1.2);fill.position.set(4,2,-3);scene.add(fill);
 const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.7,...extra});
 const mesh=(geometry,material,x=0,y=0,z=0,parent=group)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m;};
 const box=(w,h,d,color,x=0,y=0,z=0,parent=group)=>mesh(new THREE.BoxGeometry(w,h,d),mat(color),x,y,z,parent);
 const sphere=(x,y,z,sx,sy,sz,color,parent=group)=>{const m=mesh(new THREE.SphereGeometry(1,24,16),mat(color),x,y,z,parent);m.scale.set(sx,sy,sz);return m;};
 const model=(key,parent=group,scale=1,x=0,y=0,z=0,onLoad)=>{const holder=new THREE.Group();holder.position.set(x,y,z);holder.scale.setScalar(scale);parent.add(holder);loadModel(key).then(src=>{if(disposed)return;const copy=src.clone();holder.add(copy);onLoad?.(copy);draw();}).catch(()=>{models.delete(key);if(disposed)return;host.dataset.modelFailed=key;showFallback();});return holder;};
 let tiles=[],rain=[],bubbles=[];const gardenPlants=new Map(),waterRipples=[],extraMaterials=[];
 let seasonTap=null,seasonPlant='cherry',fit=1;
 if(kind==='leaf'){
  const key={cherry:'cherry_leaf',ginkgo:'ginkgo_leaf',grass:'grass_leaf'}[u.plant]||'cherry_leaf';
  const texture=loadTexture(key);texture.ready.then(()=>draw()).catch(()=>{textures.delete(key);if(!disposed)showFallback();});
  const geometry=new THREE.PlaneGeometry(3.9,3.9,28,28),p=geometry.attributes.position;
  for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)*1.5)*.1+Math.cos(p.getY(i))* .12);
  geometry.computeVertexNormals();mesh(geometry,mat(0xffffff,{map:texture.texture,transparent:true,side:THREE.DoubleSide,alphaTest:.05}));
  group.scale.setScalar(u.zoom||1);group.rotation.z=(u.rotation||0)*Math.PI/180;
 }else if(kind==='garden'){
  box(6.45,.35,4.45,0x8b7753,0,-.33);
  s.terrain.forEach((t,i)=>{const tile=box(.98,.18,.98,colors[t],i%6-2.5,-.07,Math.floor(i/6)-1.5);tile.userData.cell=i;tiles.push(tile);const ripples=[];for(let j=0;j<2;j++){const ripple=mesh(new THREE.TorusGeometry(.13+j*.09,.008,5,30),mat(0xc6f5ed),tile.position.x,.04,tile.position.z);ripple.rotation.x=-Math.PI/2;ripple.visible=t==='water';ripples.push(ripple);}waterRipples.push(ripples);});
  for(const id of ['hyacinth','aloe','cherry']){
   const plant=new THREE.Group();group.add(plant);gardenPlants.set(id,plant);
   const shadow=mesh(new THREE.CircleGeometry(.35,24),new THREE.MeshBasicMaterial({color:0x1f3a24,transparent:true,opacity:.15,depthWrite:false}),0,.035,0,plant);shadow.rotation.x=-Math.PI/2;
   if(id==='aloe')model('plant_aloe',plant,.7);
   else{
    const texture=loadTexture(id==='cherry'?'cherry_tree':'water_hyacinth_whole');
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture.texture,transparent:true,alphaTest:.05,depthWrite:false}));
    sprite.center.set(.5,0);sprite.scale.set(id==='cherry'?1.55:1.05,id==='cherry'?1.8:1.15,1);plant.add(sprite);
    texture.ready.then(()=>{if(!disposed)draw();}).catch(()=>{});
   }
   const cell=s.garden[id];plant.visible=Number.isInteger(cell);if(plant.visible)plant.position.set(cell%6-2.5,.05,Math.floor(cell/6)-1.5);
  }
 }else if(kind==='lab'){
  const cut=s.experiment.step>=1;
  // A genuinely volumetric, deliberately simplified model. The former cut GLB
  // was only 0.25 units deep; its pores looked like marks on a flat leaf.
  const profile=[[-1,.17],[-.93,.38],[-.7,.59],[-.3,.72],[.18,.67],[.55,.48],[.8,.18],[1,.12]].map(([y,r])=>new THREE.Vector2(r,y));
  const shell=mesh(new THREE.LatheGeometry(profile,64,cut?.48:0,cut?Math.PI*2-.96:Math.PI*2),mat(0x78a94c,{side:THREE.DoubleSide,roughness:.54}));
  if(cut){
   const section=new THREE.Shape();section.absellipse(0,-.04,.61,.89,0,Math.PI*2,false,0);
   for(let row=-4;row<=4;row++)for(let col=-3;col<=3;col++){
    const x=col*.175+(row%2?.087:0),y=row*.185-.04;
    if((x/.52)**2+((y+.04)/.79)**2>.85)continue;
    const hole=new THREE.Path();hole.absellipse(x,y,.059,.073,0,Math.PI*2,true);section.holes.push(hole);
   }
   const tissue=new THREE.MeshStandardMaterial({color:0xc9de8b,roughness:.67,side:THREE.DoubleSide});
   const walls=new THREE.MeshStandardMaterial({color:0x699a43,roughness:.8,side:THREE.DoubleSide});
   const inside=mesh(new THREE.ExtrudeGeometry(section,{depth:.44,bevelEnabled:true,bevelThickness:.018,bevelSize:.012,bevelSegments:2,curveSegments:16}),[tissue,walls],0,0,.02);
   inside.userData.observation='Air spaces between tissues; explanatory model, not to scale.';
  }
  mesh(new THREE.CylinderGeometry(.11,.15,.45,24),mat(0x5b963d),0,1.04,-.05);
  const blade=sphere(0,1.34,-.19,.84,.14,.66,0x509c43);blade.rotation.x=.25;
  const vein=mesh(new THREE.CylinderGeometry(.018,.028,1.1,10),mat(0xadd073),0,1.43,-.22);vein.rotation.x=Math.PI/2-.25;
  shell.userData.observation='Swollen petiole supporting the leaf blade.';
  if(s.experiment.step>=3){mesh(new THREE.BoxGeometry(3.4,2.3,1.9),mat(0x8ddde7,{transparent:true,opacity:.16,depthWrite:false}),0,-.5,-.45);box(3.5,.08,2,0x83abb5,0,-1.67,-.45);}
  if(u.bubbling)for(let i=0;i<14;i++){const b=sphere((i%5-2)*.13,(i%4)*.25-.4,.15,.07,.07,.07,0xc7f3fa);b.material.transparent=true;b.material.opacity=.75;bubbles.push(b);}
 }else if(kind==='bag'){
  const green=s.design.surface==='lotus',color=green?0x759c58:0xd7bd87;
  box(2.1,.16,.95,color,0,-1);box(2.1,1.65,.12,color,0,-.16,.48);box(2.1,1.65,.12,color,0,-.16,-.48);box(.12,1.65,.95,color,-1,-.16);box(.12,1.65,.95,color,1,-.16);
  box(1.35,.1,.62,0xefce73,0,-.65);box(1.24,.07,.57,0xfff6d7,0,-.57);
  if(s.design.cover==='flap'){const cover=box(2.19,.14,1.12,green?0x507e45:0xb39769,0,.72);cover.rotation.x=.08;box(.23,.46,.15,0x77573c,0,.5,.59);box(.27,.15,.05,0xe8c781,0,.38,.69);}
  const handle=mesh(new THREE.TorusGeometry(.43,.065,10,30,Math.PI),mat(0x846445),0,.72,-.39);handle.rotation.y=0;
  box(1.1,.72,.09,green?0x668d4b:0xc2a777,0,-.42,.58);
  if(green){for(let j=0;j<3;j++){const leaf=sphere(-.5+j*.5,-.3+j*.1,.64,.12,.24,.025,0xb1ca82);leaf.rotation.z=-.4;}}
  if(s.page===9&&(u.testing||u.replaying||s.tests.at(-1)?.key===`${s.design.surface}:${s.design.cover}`)){
   for(let i=0;i<28;i++){const drop=mesh(new THREE.CylinderGeometry(.018,.028,.17,6),mat(0x61b7e5),((i*37)%29)/8-1.7,((i*17)%31)/8-1,.1+((i*7)%11)/12);rain.push(drop);}
  }
 }else if(kind==='season'){
  // The same plant all year: the Meshy body (trunk·roots, or sowthistle root·rosette·flowers) never changes.
  // Season parts are instanced cards on the twig tips and tints on the rosette; the soil front opens for the roots.
  const plant=seasonPlant=s.seasonPlant==='sowthistle'?'sowthistle':'cherry',n=s.season,winterish=n===3||n===4;
  const open=s.underground&&!(winterish&&!s.seasonPrediction?.[plant]);
  const searching=n===3&&u.budLens===true&&(s.undergroundSeen||[]).includes(plant);
  const groundTone={1:0x84ad52,2:0xb6a35a,3:0xeef2f4,4:0xbac89b,0:0x8fc25b}[n]??0x84ad52;
  const parts=[];let anchors=[];const crownPoint=new THREE.Vector3(0,.03,0);
  const soil=(w,d,depth)=>{
   const dirt=mat(0x7a5536,{roughness:.96}),cut=mat(0x93693f,{roughness:.96}),top=mat(groundTone,{roughness:.9});
   mesh(new THREE.BoxGeometry(w,depth,d/2),[dirt,dirt,top,dirt,cut,dirt],0,-depth/2,-d/4);
   const front=new THREE.Group();group.add(front);front.visible=!open;
   mesh(new THREE.BoxGeometry(w,depth,d/2),[dirt,dirt,top,dirt,dirt,dirt],0,-depth/2,d/4,front);
  };
  // Frame what is visible: hidden flowers don't count, and a closed soil block only shows its top slice.
  const frame=()=>{const box=new THREE.Box3();group.traverseVisible(o=>{if(o.isMesh)box.expandByObject(o);});if(!open)box.min.y=Math.max(box.min.y,-.4);const size=box.getSize(new THREE.Vector3());fit=Math.max(.5,Math.max(size.y,size.x*.9)/2.3);cameraTarget.set(0,box.getCenter(new THREE.Vector3()).y,0);draw();};
  const tint=(root,hex)=>root.traverse(o=>{if(!o.isMesh)return;o.material=o.material.clone();o.material.color.setHex(hex);extraMaterials.push(o.material);});
  const panelOf=a=>{const c=anchors.center,h=anchors.half,vx=(a.x-c.x)/h.x,vy=(a.y-c.y)/h.y,vz=(a.z-c.z)/h.z,d=Math.max(.75,Math.min(1.02,Math.hypot(vx,vy,vz))),side=Math.sign(vx||1)*Math.hypot(vx,vz),r=Math.hypot(side,vy)||1;return [Math.min(1,Math.max(0,.5+.39*side/r*d)),Math.min(1,Math.max(0,.26-.27*vy/r*d))];};
  const markers=()=>{
   if(n!==3)return;const found=s.budsFound?.[plant]||[];if(!found.length)return;
   const tex=loadTexture(plant==='cherry'?'season_cherry_winter_bud':'season_sowthistle_crown_bud');
   for(const spot of found){
    const at=plant==='cherry'?anchors.reduce((best,a)=>{const q=panelOf(a),b=panelOf(best);return Math.hypot(q[0]-spot[0],q[1]-spot[1])<Math.hypot(b[0]-spot[0],b[1]-spot[1])?a:best;},anchors[0]):crownPoint;
    if(!at)continue;const mark=new THREE.Sprite(new THREE.SpriteMaterial({map:tex.texture,depthTest:false,transparent:true}));mark.position.copy(at);mark.scale.setScalar(.24);mark.renderOrder=5;group.add(mark);
   }
   tex.ready.then(draw).catch(()=>{});
  };
  if(plant==='cherry'){
   parts.push(model('season_cherry_bare',group,1,0,0,0,root=>{
    // Meshy built the crown as one flat sheet; two turned copies of the same geometry give it depth.
    const crown=root.getObjectByName('crown');
    if(crown)for(const turn of [Math.PI/3,Math.PI*2/3]){const copy=crown.clone();copy.name='crown-copy';copy.rotation.y+=turn;crown.parent.add(copy);}
    const box=new THREE.Box3().setFromObject(root),size=box.getSize(new THREE.Vector3());
    soil(Math.max(size.x,1.7)*1.06,Math.max(size.z,1.3)*1.06,Math.max(.35,-box.min.y*1.12+.05));
    anchors=twigTips(root,90);
    const leaf=loadTexture('cherry_leaf');
    if(n===1)tipCards(group,leaf,anchors,6,.17,.21,.15,draw);
    if(n===2){tipCards(group,loadTexture('season_cherry_leaf_autumn'),anchors,3,.17,.21,.14,draw);groundCards(group,loadTexture('season_cherry_leaf_autumn'),26,size.x,size.z,.15,draw);}
    if(n===4){tipCards(group,loadTexture('season_cherry_winter_bud'),anchors,1,.16,.16,.02,draw,0xffffff,3);tipCards(group,leaf,anchors,1,.09,.1,.06,draw,0xd9f0b0,5);}
    if(n===0){tipCards(group,loadTexture('season_cherry_blossom'),anchors,3,.2,.2,.12,draw);tipCards(group,leaf,anchors,2,.1,.12,.12,draw,0xd7efb4,9);}
    markers();frame();
   }));
  }else{
   const look={1:[0xffffff,1,1],2:[0xd9c46a,.95,.9],3:[0x9a7148,.92,.42],4:[0xcdf2a6,.45,.6],0:[0xeaffd8,.82,.85]}[n]||[0xffffff,1,1];
   let pending=3;const loaded=()=>{if(--pending)return;const rootBox=new THREE.Box3().setFromObject(parts[0]);parts[0].visible=open;soil(1.25,.95,open?Math.max(.35,-rootBox.min.y*1.12+.05):.3);markers();frame();};
   parts.push(model('season_sowthistle_root',group,1,0,0,0,loaded));
   const rosette=model('season_sowthistle_rosette',group,1,0,0,0,root=>{if(look[0]!==0xffffff)tint(root,look[0]);loaded();});rosette.scale.set(look[1],look[2],look[1]);parts.push(rosette);
   const flowers=model('season_sowthistle_flowers',group,1,0,0,0,root=>{if(n===2)tint(root,0xb08a52);loaded();});flowers.visible=n===1||n===2;if(n===2)flowers.scale.set(.92,.8,.92);parts.push(flowers);
  }
  if(searching)seasonTap=e=>{
   const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);
   const shown=h=>{for(let o=h.object;o;o=o.parent)if(!o.visible)return false;return true;},at=raycaster.intersectObjects(parts,true).find(shown)?.point;let spot;
   // Twigs are thin, so a tip counts when the finger lands within ~32px of it on screen.
   const px=v=>{const p=v.clone().project(camera);return Math.hypot((p.x-pointer.x)*r.width/2,(p.y-pointer.y)*r.height/2);};
   if(plant==='cherry'){const a=anchors.reduce((best,q)=>px(q)<px(best)?q:best,anchors[0]);spot=a&&px(a)<32?panelOf(a):!at?[.02,.02]:at.y<.02?[.5,.8]:[.5,.3];}
   else spot=px(crownPoint)<40?[.5,.6]:at&&at.y<-.05?[.5,.8]:[.35,.45];
   send('bud-look',`${spot[0].toFixed(3)},${spot[1].toFixed(3)},600,400`);
  };
 }
 const canvas=renderer.domElement;canvas.className='spatial-canvas';canvas.dataset.spatialInstance=String(++spatialInstance);canvas.setAttribute('aria-label',kind==='garden'?'입체 정원. 땅을 쓸어 칠하거나 식물을 놓아 봐.':kind==='season'?`입체 ${seasonPlant==='cherry'?'벚나무':'씀바귀'}. 끌어서 돌리고, 렌즈를 들었으면 눌러서 살펴봐.`:'입체 관찰 모형. 끌어서 돌려 봐.');if(seasonTap)canvas.style.cursor='zoom-in';canvas.setAttribute('role','img');
 const layer=document.createElement('div');layer.className='spatial-layer';layer.append(canvas);host.append(layer);host.classList.add('spatial-ready');host.classList.toggle('spatial-flat',flat);
 const controls=document.createElement('div');controls.className='spatial-controls';controls.innerHTML=`<span>${kind==='garden'?(s.page===6&&u.gardenMode!=='plant'?'쓸어서 땅 만들기':'식물을 고르고 땅 누르기'):kind==='lab'?(s.experiment.step===0?'옆으로 쓸어 잘라 보기':s.experiment.step>=3?'잎자루를 톡 눌러 보기':'끌어서 단면 돌리기'):seasonTap?'돌려 보고, 렌즈로 눌러 찾기':'끌어서 돌려 보기'}</span><button type="button" data-view="rotate" aria-label="모형 돌리기">${icon('rotate')}</button><button type="button" data-view="zoom" aria-label="모형 확대">${icon('zoom')}</button><button type="button" data-view="reset" aria-label="시점 초기화">${icon('reset')}</button><button type="button" data-view="flat">${flat?'입체로 보기':'그림으로 보기'}</button>`;host.append(controls);
 function showFallback(){
  unavailable=true;flat=true;host.dataset.spatialUnavailable='true';host.classList.add('spatial-flat');
  const toggle=controls.querySelector('[data-view="flat"]');toggle.textContent='그림으로 보는 중';toggle.disabled=true;toggle.title='입체 자료를 불러오지 못해 그림으로 보여요.';
 }
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
 const hit=e=>{const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(tiles,false)[0]?.object;};
 function setCamera(){const distance=(kind==='garden'?Math.max(7.6,6.5/camera.aspect):7.2)*fit/view.zoom;camera.position.set(Math.sin(view.yaw)*Math.cos(view.pitch)*distance,Math.sin(view.pitch)*distance+cameraTarget.y,Math.cos(view.yaw)*Math.cos(view.pitch)*distance);camera.lookAt(cameraTarget);}
 function draw(){if(disposed||!host.isConnected||flat)return;setCamera();renderer.render(scene,camera);}
 function resize(){if(disposed)return;const r=host.getBoundingClientRect();const w=Math.max(1,r.width),h=Math.max(1,r.height);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();draw();}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 controls.addEventListener('click',e=>{const b=e.target.closest('[data-view]'),v=b?.dataset.view;if(!v||unavailable)return;if(v==='flat'){flat=!flat;view.flat=flat;host.classList.toggle('spatial-flat',flat);b.textContent=flat?'입체로 보기':'그림으로 보기';}if(v==='rotate')view.yaw+=.4;if(v==='zoom')view.zoom=view.zoom>=1.6?1:view.zoom+.2;if(v==='reset')Object.assign(view,initial);views.set(kind,view);draw();},{signal});
 canvas.addEventListener('pointerdown',e=>{if(e.button!==0||drag)return;canvas.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,cells:new Set()};if(kind==='garden'&&s.page===6&&u.gardenMode!=='plant'){const tile=hit(e);if(tile){drag.cells.add(tile.userData.cell);tile.material.color.setHex(colors[u.brush]);draw();}}},{signal});
 canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;if(kind==='garden'){if(s.page===6&&u.gardenMode!=='plant'){const tile=hit(e);if(tile){drag.cells.add(tile.userData.cell);tile.material.color.setHex(colors[u.brush]);draw();}}}else if(!(kind==='lab'&&s.experiment.step===0)){view.yaw+=(e.clientX-drag.lastX)*.009;view.pitch=Math.max(-.45,Math.min(.9,view.pitch+(e.clientY-drag.lastY)*.006));draw();}drag.lastX=e.clientX;drag.lastY=e.clientY;},{signal});
 const finish=e=>{if(!drag||drag.id!==e.pointerId)return;const d=drag;drag=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);views.set(kind,view);if(kind==='garden'){if(s.page===6&&u.gardenMode!=='plant'&&d.cells.size)paint([...d.cells]);else if((s.page===7||u.gardenMode==='plant')&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<12){const tile=hit(e);if(tile)send('garden-cell',String(tile.userData.cell));}}else if(kind==='lab'){if(s.experiment.step===0&&Math.abs(e.clientX-d.x)>55)send('lab-next','cut');else if(s.experiment.step>=3&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<12)send('press-petiole');}else if(seasonTap&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<12)seasonTap(e);};
 const cancel=e=>{if(!drag||drag.id!==e.pointerId)return;const d=drag;drag=null;if(kind==='garden'&&d.cells.size)paint([...d.cells]);};
 canvas.addEventListener('pointerup',finish,{signal});canvas.addEventListener('pointercancel',cancel,{signal});canvas.addEventListener('lostpointercapture',cancel,{signal});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();showFallback();},{signal});
 canvas.addEventListener('wheel',e=>{e.preventDefault();view.zoom=Math.max(.8,Math.min(1.7,view.zoom-e.deltaY*.001));draw();},{passive:false,signal});
 const animated=(rain.length&&(u.testing||u.replaying)&&!u.paused)||bubbles.length;
 if(animated&&!matchMedia('(prefers-reduced-motion: reduce)').matches){let last=performance.now();const tick=now=>{if(disposed)return;const dt=Math.min(.05,(now-last)/1000);last=now;rain.forEach((r,i)=>{r.position.y-=dt*2.2;if(r.position.y< -1.5)r.position.y=2.5;if(s.design.cover==='flap'&&r.position.y<.85&&Math.abs(r.position.x)<1.1)r.position.x+=(i%2?1:-1)*dt*2;});bubbles.forEach(b=>{b.position.y+=dt*1.1;if(b.position.y>1.4)b.position.y=-.6;});draw();frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);}
 if(kind==='garden')activeGarden={host,update:(nextState,nextUi)=>{
  s=nextState;u=nextUi;
  tiles.forEach((tile,i)=>{tile.material.color.setHex(colors[s.terrain[i]]);waterRipples[i].forEach(r=>r.visible=s.terrain[i]==='water');});
  for(const [id,plant] of gardenPlants){const cell=s.garden[id];plant.visible=Number.isInteger(cell);if(plant.visible)plant.position.set(cell%6-2.5,.05,Math.floor(cell/6)-1.5);}
  const label=controls.querySelector('span');if(label)label.textContent=s.page===6&&u.gardenMode!=='plant'?'쓸어서 땅 만들기':'식물을 고르고 땅 누르기';
  resize();
 }};
 activeCleanup=()=>{if(activeGarden?.host===host)activeGarden=undefined;disposed=true;drag=null;abort.abort();cancelAnimationFrame(frame);observer.disconnect();scene.traverse(o=>{if(o.userData.shared)return;o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});extraMaterials.forEach(m=>m.dispose());layer.remove();controls.remove();host.classList.remove('spatial-ready','spatial-flat');};
}
