import * as THREE from './vendor/three/three.module.min.js';
import {GLTFLoader} from './vendor/three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from './vendor/three/addons/libs/meshopt_decoder.module.js';
import {icon} from './art.js';
import {seasonSoil,seasonBlossoms} from './season-environment.js';
import {createGardenTerrain} from './garden-environment.js';
import {GARDEN_VIEWS,gardenCameraFrame} from './garden-view.js';

// One renderer is reused between activities. All scene geometry is released on navigation.
let renderer, activeCleanup, activeGarden, spatialInstance=0;
const textures=new Map(), views=new Map(), models=new Map();
// GLB scenes are loaded once and shared by clones; cleanup skips them via userData.shared.
function loadModel(key){if(!models.has(key))models.set(key,new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(`/assets/models/${key}.glb`).then(g=>{g.scene.traverse(o=>{o.userData.shared=true;});return g.scene;}));return models.get(key);}
function loadTexture(key){
 if(!textures.has(key)){
  const entry={};entry.ready=new Promise((resolve,reject)=>{entry.texture=new THREE.TextureLoader().load(`/assets/generated/${key}.webp`,resolve,undefined,reject);});
  entry.texture.colorSpace=THREE.SRGBColorSpace;textures.set(key,entry);
 }
 return textures.get(key);
}
// Turntable on bg_m1_1_scan (1600x900, center/cover on .activity-0): top-face center and width in image pixels.
const TURNTABLE={x:797,y:563,width:535},LEAF_SIZE=4.2,LEAF_TILT=.5;
// Seeded random: leaves and petals land in the same places every time the season scene opens.
const seeded=seed=>()=>{seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};
// Twig tips = the outermost crown vertices, spread out by farthest-point sampling.
function twigTips(root,count,coverage=.25){
 root.updateMatrixWorld(true);const pts=[],v=new THREE.Vector3();
 root.traverse(o=>{if(!o.isMesh||!/crown/.test(o.name))return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i+=2)pts.push(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld).clone());});
 if(!pts.length)return [];
 const box=new THREE.Box3().setFromPoints(pts),c=box.getCenter(new THREE.Vector3()),h=box.getSize(new THREE.Vector3()).multiplyScalar(.5);
 const score=q=>((q.x-c.x)/h.x)**2+((q.y-c.y)/h.y)**2+((q.z-c.z)/h.z)**2;
 const outer=pts.map(q=>[q,score(q)]).sort((a,b)=>b[1]-a[1]).slice(0,Math.max(count,Math.floor(pts.length*coverage))).map(x=>x[0]);
 const picked=[outer[0]],dist=outer.map(q=>q.distanceToSquared(outer[0]));
 while(picked.length<count){let best=0;for(let i=1;i<outer.length;i++)if(dist[i]>dist[best])best=i;if(!dist[best])break;picked.push(outer[best]);for(let i=0;i<outer.length;i++)dist[i]=Math.min(dist[i],outer[i].distanceToSquared(outer[best]));}
 picked.center=c;picked.half=h;return picked;
}
// Twig tips sit on the crown's shell; seeded points inside it fill the canopy so its middle isn't hollow.
function crownFill(tips,count,seed=21){
 const rand=seeded(seed),c=tips.center,h=tips.half,out=[];if(!c)return out;
 while(out.length<count){const x=rand()*2-1,y=rand()*2-1,z=rand()*2-1,r=x*x+y*y+z*z;if(r>1||r<.08)continue;out.push(new THREE.Vector3(c.x+x*h.x*.78,c.y+y*h.y*.68+h.y*.08,c.z+z*h.z*.78));}
 return out;
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
 // Keep the supplied bag illustration until an actual bag GLB is available.
 if(host.dataset.spatial==='bag'){host.dataset.spatialReferenceOnly='true';return;}
 try{renderer??=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{host.dataset.spatialUnavailable='true';return;}
 const kind=host.dataset.spatial,abort=new AbortController(),signal=abort.signal;
 renderer.shadowMap.enabled=kind==='season'||kind==='garden';renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 let disposed=false,frame=0,drag=null,flat=false,unavailable=false;
 const scene=new THREE.Scene(),group=new THREE.Group();scene.add(group);
 const camera=new THREE.PerspectiveCamera(34,1,.1,100);
 const cameraTarget=new THREE.Vector3(0,kind==='garden'||kind==='lab'?0:.2,0);
 const initial=kind==='garden'?{...GARDEN_VIEWS.perspective,zoom:1,mode:'edit',preset:'perspective'}:kind==='season'?{yaw:.5,pitch:.16,zoom:1.55}:kind==='lab'?{yaw:.16,pitch:.1,zoom:1.12}:{yaw:.24,pitch:.12,zoom:1};
 const view=views.get(kind)||{...initial};
 flat=view.flat===true;
 const light=new THREE.DirectionalLight(0xfff4d8,3.1);light.position.set(-3,6,6);scene.add(light,new THREE.HemisphereLight(0xf2fcff,0x7c6951,2.5));
 const fill=new THREE.DirectionalLight(0xd5efff,1.2);fill.position.set(4,2,-3);scene.add(fill);
 if(kind==='season'||kind==='garden'){
  light.intensity=2;fill.intensity=.65;scene.children.find(o=>o.isHemisphereLight).intensity=1.65;
  light.castShadow=true;light.shadow.mapSize.set(1024,1024);light.shadow.bias=-.0003;light.shadow.normalBias=.018;
  if(kind==='garden'){Object.assign(light.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:.1,far:20});light.shadow.camera.updateProjectionMatrix();}
 }
 const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.7,...extra});
 const mesh=(geometry,material,x=0,y=0,z=0,parent=group)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m;};
 const box=(w,h,d,color,x=0,y=0,z=0,parent=group)=>mesh(new THREE.BoxGeometry(w,h,d),mat(color),x,y,z,parent);
 const sphere=(x,y,z,sx,sy,sz,color,parent=group)=>{const m=mesh(new THREE.SphereGeometry(1,24,16),mat(color),x,y,z,parent);m.scale.set(sx,sy,sz);return m;};
 const model=(key,parent=group,scale=1,x=0,y=0,z=0,onLoad)=>{const holder=new THREE.Group();holder.position.set(x,y,z);holder.scale.setScalar(scale);parent.add(holder);loadModel(key).then(src=>{if(disposed)return;const copy=src.clone();holder.add(copy);onLoad?.(copy);draw();}).catch(()=>{models.delete(key);if(disposed)return;host.dataset.modelFailed=key;showFallback();});return holder;};
 let tiles=[],bubbles=[],gardenSurface;const gardenPlants=new Map(),extraMaterials=[];
 let seasonTap=null,seasonPlant='cherry',fit=1;
 if(kind==='leaf'){
  const key={cherry:'cherry_leaf',ginkgo:'ginkgo_leaf',grass:'grass_leaf'}[u.plant]||'cherry_leaf';
  const texture=loadTexture(key);texture.ready.then(()=>draw()).catch(()=>{textures.delete(key);if(!disposed)showFallback();});
  // The leaf rests on the scan table's turntable: petiole at the origin, blade leaning back, a soft shadow under it.
  const geometry=new THREE.PlaneGeometry(LEAF_SIZE,LEAF_SIZE,28,28),p=geometry.attributes.position;
  for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)*1.5)*.1+Math.cos(p.getY(i))* .12);
  geometry.computeVertexNormals();
  const stand=new THREE.Group();stand.rotation.x=-LEAF_TILT;group.add(stand);
  const blade=mesh(geometry,mat(0xffffff,{map:texture.texture,transparent:true,side:THREE.DoubleSide,alphaTest:.05}),0,LEAF_SIZE*.44,0,stand);blade.rotation.z=(u.rotation||0)*Math.PI/180;
  const shade=document.createElement('canvas');shade.width=shade.height=64;const g=shade.getContext('2d'),fade=g.createRadialGradient(32,32,0,32,32,32);fade.addColorStop(0,'rgba(40,58,30,.38)');fade.addColorStop(1,'rgba(40,58,30,0)');g.fillStyle=fade;g.fillRect(0,0,64,64);
  const shadow=mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shade),transparent:true,depthWrite:false}),.15,.01,-LEAF_SIZE*.2);shadow.rotation.x=-Math.PI/2;shadow.scale.set(LEAF_SIZE*.6,LEAF_SIZE*.55,1);extraMaterials.push(shadow.material.map);
  group.scale.setScalar(u.zoom||1);cameraTarget.set(0,1.3,0);
 }else if(kind==='garden'){
  gardenSurface=createGardenTerrain(group,s.terrain);tiles=gardenSurface.tiles;
  const shadows=root=>root.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=true;});
  for(const id of ['hyacinth','aloe','cherry']){
   const plant=new THREE.Group();group.add(plant);gardenPlants.set(id,plant);
   const shadow=mesh(new THREE.CircleGeometry(.35,24),new THREE.MeshBasicMaterial({color:0x1f3a24,transparent:true,opacity:.15,depthWrite:false}),0,.035,0,plant);shadow.rotation.x=-Math.PI/2;
   if(id==='aloe')model('plant_aloe',plant,.7,0,0,0,shadows);
   else if(id==='cherry')model('plant_cherry_full',plant,.85,0,0,0,shadows);
   else{
    // Only the petiole GLB exists; use the whole-plant reference until its GLB is supplied.
    const texture=loadTexture('water_hyacinth_whole');
    const picture=new THREE.Sprite(new THREE.SpriteMaterial({map:texture.texture,transparent:true,alphaTest:.05,depthWrite:false}));
    picture.center.set(.5,.32);picture.scale.set(1.05,1.15,1);plant.add(picture);
    texture.ready.then(()=>{if(!disposed)draw();}).catch(()=>{});
   }
   const cell=s.garden[id];plant.visible=Number.isInteger(cell);if(plant.visible)plant.position.set(cell%6-2.5,.05,Math.floor(cell/6)-1.5);
  }
 }else if(kind==='lab'){
  const cut=s.experiment.step>=1;
  model(cut?'petiole_cut':'petiole_whole',group,1.35,0,0,0,root=>{
   // Both specimens are exported upright with the opened cut facing the camera (+Z); only their height is matched.
   root.updateWorldMatrix(true,true);const size=new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3());if(size.y>0)root.scale.multiplyScalar(2.7/size.y);
   const center=new THREE.Box3().setFromObject(root).getCenter(new THREE.Vector3());root.parent.worldToLocal(center);root.position.sub(center);
  });
  if(u.bubbling)for(let i=0;i<14;i++){const b=sphere((i%5-2)*.13,(i%4)*.25-.4,.45,.07,.07,.07,0xc7f3fa);b.material.transparent=true;b.material.opacity=.75;bubbles.push(b);}
 }else if(kind==='season'){
  // The same plant all year: the Meshy body (trunk·roots, or sowthistle root·rosette·flowers) never changes.
  // Leaves and buds use cards; spring flowers have cupped petals. The soil front opens for the roots.
  const plant=seasonPlant=s.seasonPlant==='sowthistle'?'sowthistle':'cherry',n=s.season,winterish=n===3||n===4;
  const open=s.underground&&!(winterish&&!s.seasonPrediction?.[plant]);
  const searching=n===3&&u.budLens===true&&(s.undergroundSeen||[]).includes(plant);
  const parts=[];let anchors=[];const crownPoint=new THREE.Vector3(0,.03,0);
  const soil=(w,d,depth)=>seasonSoil(group,{width:w,depth:d,height:depth,season:n,plant,open});
  // Fit the visible plant and complete soil base, including the exposed roots when open.
  const frame=()=>{
   const box=new THREE.Box3();group.traverseVisible(o=>{if(o.isMesh)box.expandByObject(o);});
   const size=box.getSize(new THREE.Vector3());fit=Math.max(.5,Math.max(size.y,size.x*.9)/2.1);
   // At the low observation angle the near soil edge projects below the box center.
   cameraTarget.set(0,box.getCenter(new THREE.Vector3()).y-(plant==='cherry'&&!open?size.y*.07:0),0);
   const reach=Math.max(size.x,size.y,size.z)*.7;
   Object.assign(light.shadow.camera,{left:-reach,right:reach,top:reach,bottom:-reach,near:.1,far:20});light.shadow.camera.updateProjectionMatrix();draw();
  };
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
    root.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=true;});
    const box=new THREE.Box3().setFromObject(root),size=box.getSize(new THREE.Vector3());
    soil(Math.max(size.x,1.7)*1.06,Math.max(size.z,1.3)*1.06,Math.max(.35,-box.min.y*1.12+.05));
    anchors=twigTips(root,90);
    const leaf=loadTexture('cherry_leaf');
    if(n===1){tipCards(group,leaf,anchors,6,.17,.21,.15,draw);tipCards(group,leaf,crownFill(anchors,150),6,.19,.24,.13,draw,0xf2fbe6,13);}
    if(n===2){tipCards(group,loadTexture('season_cherry_leaf_autumn'),anchors,3,.17,.21,.14,draw);tipCards(group,loadTexture('season_cherry_leaf_autumn'),crownFill(anchors,90),3,.18,.22,.12,draw,0xffffff,15);groundCards(group,loadTexture('season_cherry_leaf_autumn'),26,size.x,size.z,.15,draw);}
    if(n===4){tipCards(group,loadTexture('season_cherry_winter_bud'),anchors,1,.16,.16,.02,draw,0xffffff,3);tipCards(group,leaf,anchors,1,.09,.1,.06,draw,0xd9f0b0,5);}
    if(n===0){const fill=crownFill(anchors,80);seasonBlossoms(group,[...twigTips(root,190,.7),...fill]);tipCards(group,leaf,[...anchors,...fill],2,.1,.12,.12,draw,0xd7efb4,9);}
    markers();frame();
   }));
  }else{
   const look={1:[0xffffff,1,1],2:[0xd9c46a,.95,.9],3:[0x9a7148,.92,.42],4:[0xcdf2a6,.45,.6],0:[0xeaffd8,.82,.85]}[n]||[0xffffff,1,1];
   let pending=3;const loaded=()=>{if(--pending)return;for(const part of parts)part.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=true;});const rootBox=new THREE.Box3().setFromObject(parts[0]);parts[0].visible=open;soil(1.25,.95,open?Math.max(.35,-rootBox.min.y*1.12+.05):.3);markers();frame();};
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
 const controls=document.createElement('div');controls.className='spatial-controls';
 controls.innerHTML=kind==='garden'?`<button type="button" data-view="orbit" aria-label="시점 돌리기" aria-pressed="${view.mode==='orbit'}">${view.mode==='orbit'?'돌리는 중':'시점 돌리기'}</button><label class="garden-angle">보는 방향<select aria-label="정원 보는 방향"><option value="free" disabled>자유 시점</option>${Object.entries(GARDEN_VIEWS).map(([id,p])=>`<option value="${id}" ${id===(view.preset||'perspective')?'selected':''}>${p.label}</option>`).join('')}</select></label><button type="button" data-view="zoom-out" aria-label="정원 축소">−</button><button type="button" data-view="zoom" aria-label="정원 확대">${icon('zoom')}</button><button type="button" data-view="reset" aria-label="시점 초기화">${icon('reset')}</button><button type="button" data-view="flat">${flat?'입체로 보기':'그림으로 보기'}</button><span class="garden-view-hint"></span>`:`<span>${kind==='lab'?(s.experiment.step===0?'옆으로 쓸어 잘라 보기':s.experiment.step>=3?'잎자루를 톡 눌러 보기':'끌어서 단면 돌리기'):seasonTap?'돌려 보고, 렌즈로 눌러 찾기':'끌어서 돌려 보기'}</span><button type="button" data-view="rotate" aria-label="모형 돌리기">${icon('rotate')}</button><button type="button" data-view="zoom" aria-label="모형 확대">${icon('zoom')}</button><button type="button" data-view="reset" aria-label="시점 초기화">${icon('reset')}</button><button type="button" data-view="flat">${flat?'입체로 보기':'그림으로 보기'}</button>`;host.append(controls);
 function gardenControls(){
  if(kind!=='garden')return;
  const orbit=view.mode==='orbit';host.dataset.gardenViewMode=orbit?'orbit':'edit';canvas.style.cursor=orbit?'grab':'crosshair';
  const toggle=controls.querySelector('[data-view="orbit"]');toggle.setAttribute('aria-pressed',String(orbit));toggle.textContent=orbit?'돌리는 중':'시점 돌리기';
  controls.querySelector('select').value=view.preset||'free';
  controls.querySelector('.garden-view-hint').textContent=orbit?'끌어서 방향·높이를 바꿔 봐. 다시 누르면 꾸밀 수 있어.':s.page===6&&u.gardenMode!=='plant'?'쓸어서 땅 칠하기 · 돌려 보려면 시점 돌리기':'땅을 눌러 식물 심기 · 돌려 보려면 시점 돌리기';
 }
 gardenControls();
 function showFallback(){
  unavailable=true;flat=true;host.dataset.spatialUnavailable='true';host.classList.add('spatial-flat');
  const toggle=controls.querySelector('[data-view="flat"]');toggle.textContent='그림으로 보는 중';toggle.disabled=true;toggle.title='입체 자료를 불러오지 못해 그림으로 보여요.';
 }
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
 const hit=e=>{const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(tiles,false)[0]?.object;};
 function setCamera(){
  let gardenPoints;
  if(kind==='garden'){
   gardenPoints=[];
   const corners=box=>{for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])gardenPoints.push([x,y,z]);};
   corners(new THREE.Box3(new THREE.Vector3(-3.25,-.55,-2.25),new THREE.Vector3(3.25,.2,2.25)));
   for(const plant of gardenPlants.values())if(plant.visible){plant.updateWorldMatrix(true,true);const bounds=new THREE.Box3().setFromObject(plant);if(!bounds.isEmpty())corners(bounds);}
  }
  const gardenFrame=kind==='garden'?gardenCameraFrame(camera.aspect,view.yaw,view.pitch,camera.fov,gardenPoints):null;
  if(gardenFrame)cameraTarget.fromArray(gardenFrame.target);
  const distance=(gardenFrame?gardenFrame.distance:kind==='lab'?Math.max(7.2,6.6/camera.aspect):7.2)*fit/view.zoom;
  camera.position.set(Math.sin(view.yaw)*Math.cos(view.pitch)*distance+cameraTarget.x,Math.sin(view.pitch)*distance+cameraTarget.y,Math.cos(view.yaw)*Math.cos(view.pitch)*distance+cameraTarget.z);camera.lookAt(cameraTarget);
 }
 function draw(){if(disposed||!host.isConnected||flat)return;setCamera();renderer.render(scene,camera);}
 function resize(){if(disposed)return;if(kind==='garden'){const height=`${controls.getBoundingClientRect().height+16}px`;layer.style.bottom=height;host.style.setProperty('--garden-controls-height',height);}const r=(kind==='garden'?layer:host).getBoundingClientRect();const w=Math.max(1,r.width),h=Math.max(1,r.height);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();if(kind==='leaf')placeOnTurntable(r,w,h);draw();}
 // Shift the view so the world origin lands on the painted turntable, and size the leaf to the turntable.
 function placeOnTurntable(r,w,h){
  const bg=host.closest('.activity-0')?.getBoundingClientRect(),k=bg&&Math.max(bg.width/1600,bg.height/900);
  const x=bg&&bg.left+(bg.width-1600*k)/2+TURNTABLE.x*k-r.left,y=bg&&bg.top+(bg.height-900*k)/2+TURNTABLE.y*k-r.top;
  const on=!!bg&&x>=w*.15&&x<=w*.85&&y>=h*.45&&y<=h;host.classList.toggle('on-turntable',on);
  if(!on){camera.clearViewOffset();fit=1;cameraTarget.set(0,1.3,0);return;}
  const span=2*Math.tan(camera.fov*Math.PI/360)*7.2;
  fit=Math.max(h*5.4/(span*TURNTABLE.width*k),LEAF_SIZE*.75*h/(span*(y-12)));cameraTarget.set(0,0,0);camera.setViewOffset(w,h,w/2-x,h/2-y,w,h);
  // The flat picture stands on the same spot, about as tall as the 3D leaf.
  host.style.setProperty('--turntable-x',`${x}px`);host.style.setProperty('--turntable-y',`${y}px`);host.style.setProperty('--turntable-leaf',`${Math.min(LEAF_SIZE*.8*h/(span*fit),(y-8)/.95)}px`);
 }
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 controls.addEventListener('click',e=>{const b=e.target.closest('[data-view]'),v=b?.dataset.view;if(!v||unavailable)return;if(v==='flat'){flat=!flat;view.flat=flat;host.classList.toggle('spatial-flat',flat);b.textContent=flat?'입체로 보기':'그림으로 보기';}if(v==='orbit')view.mode=view.mode==='orbit'?'edit':'orbit';if(v==='rotate')view.yaw+=.4;if(v==='zoom')view.zoom=kind==='garden'?Math.min(2,view.zoom+.15):view.zoom>=1.6?1:view.zoom+.2;if(v==='zoom-out')view.zoom=Math.max(.65,view.zoom-.15);if(v==='reset')Object.assign(view,initial);views.set(kind,view);gardenControls();resize();},{signal});
 controls.querySelector('select')?.addEventListener('change',e=>{const preset=GARDEN_VIEWS[e.target.value];if(!preset)return;Object.assign(view,preset,{preset:e.target.value,zoom:1});views.set(kind,view);gardenControls();resize();},{signal});
 canvas.addEventListener('pointerdown',e=>{if((e.button!==0&&!(kind==='garden'&&e.button===2))||drag)return;canvas.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,cells:new Set(),orbit:kind==='garden'&&(view.mode==='orbit'||e.button===2)};if(kind==='garden'&&!drag.orbit&&s.page===6&&u.gardenMode!=='plant'){const tile=hit(e);if(tile){drag.cells.add(tile.userData.cell);gardenSurface.preview(tile.userData.cell,u.brush);draw();}}},{signal});
 canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;if(kind==='garden'&&!drag.orbit){if(s.page===6&&u.gardenMode!=='plant'){const tile=hit(e);if(tile&&!drag.cells.has(tile.userData.cell)){drag.cells.add(tile.userData.cell);gardenSurface.preview(tile.userData.cell,u.brush);draw();}}}else if(!(kind==='lab'&&s.experiment.step===0)){view.yaw+=(e.clientX-drag.lastX)*.009;view.pitch=kind==='garden'?Math.max(.12,Math.min(1.52,view.pitch+(e.clientY-drag.lastY)*.006)):Math.max(-.45,Math.min(.9,view.pitch+(e.clientY-drag.lastY)*.006));if(kind==='garden'){view.preset='free';gardenControls();}draw();}drag.lastX=e.clientX;drag.lastY=e.clientY;},{signal});
 const finish=e=>{if(!drag||drag.id!==e.pointerId)return;const d=drag;drag=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);views.set(kind,view);if(kind==='garden'){if(d.orbit)return;if(s.page===6&&u.gardenMode!=='plant'&&d.cells.size)paint([...d.cells]);else if((s.page===7||u.gardenMode==='plant')&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<12){const tile=hit(e);if(tile)send('garden-cell',String(tile.userData.cell));}}else if(kind==='lab'){if(s.experiment.step===0&&Math.abs(e.clientX-d.x)>55)send('lab-next','cut');else if(s.experiment.step>=3&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<12)send('press-petiole');}else if(seasonTap&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<12)seasonTap(e);};
 const cancel=e=>{if(!drag||drag.id!==e.pointerId)return;const d=drag;drag=null;if(kind==='garden'&&!d.orbit&&d.cells.size)paint([...d.cells]);};
 canvas.addEventListener('pointerup',finish,{signal});canvas.addEventListener('pointercancel',cancel,{signal});canvas.addEventListener('lostpointercapture',cancel,{signal});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();showFallback();},{signal});
 canvas.addEventListener('contextmenu',e=>{if(kind==='garden')e.preventDefault();},{signal});
 canvas.addEventListener('wheel',e=>{e.preventDefault();view.zoom=Math.max(kind==='garden'?.65:.8,Math.min(kind==='garden'?2:1.7,view.zoom-e.deltaY*.001));views.set(kind,view);draw();},{passive:false,signal});
 const animated=bubbles.length||kind==='garden';
 if(animated&&!matchMedia('(prefers-reduced-motion: reduce)').matches){let last=performance.now();const tick=now=>{if(disposed)return;const dt=Math.min(.05,(now-last)/1000);last=now;if(kind==='garden'){if(!flat&&!document.hidden&&gardenSurface.animate(now))draw();}else{bubbles.forEach(b=>{b.position.y+=dt*1.1;if(b.position.y>1.4)b.position.y=-.6;});draw();}frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);}
 if(kind==='garden')activeGarden={host,update:(nextState,nextUi)=>{
  s=nextState;u=nextUi;
  gardenSurface.update(s.terrain);
  for(const [id,plant] of gardenPlants){const cell=s.garden[id];plant.visible=Number.isInteger(cell);if(plant.visible)plant.position.set(cell%6-2.5,.05,Math.floor(cell/6)-1.5);}
  gardenControls();
  resize();
 }};
 activeCleanup=()=>{if(activeGarden?.host===host)activeGarden=undefined;disposed=true;drag=null;abort.abort();cancelAnimationFrame(frame);observer.disconnect();light.shadow.dispose();gardenSurface?.dispose();scene.traverse(o=>{if(o.userData.shared)return;if(o.isInstancedMesh)o.dispose();o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});extraMaterials.forEach(m=>m.dispose());layer.remove();controls.remove();host.classList.remove('spatial-ready','spatial-flat','on-turntable');};
}
