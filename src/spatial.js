import * as THREE from './vendor/three/three.module.min.js';
import {GLTFLoader} from './vendor/three/addons/loaders/GLTFLoader.js';
import {icon} from './art.js';

// One renderer is reused between activities. All scene geometry is released on navigation.
let renderer, activeCleanup;
const textures=new Map(), views=new Map(), models=new Map();
// GLB scenes are loaded once and shared by clones; cleanup skips them via userData.shared.
function loadModel(key){if(!models.has(key))models.set(key,new GLTFLoader().loadAsync(`/assets/models/${key}.glb`).then(g=>{g.scene.traverse(o=>{o.userData.shared=true;});return g.scene;}));return models.get(key);}
const colors={water:0x79c8d4,grass:0x96b85d,dry:0xd9b67b,empty:0xbca78a};
export function unmountSpatial(){activeCleanup?.();activeCleanup=null;}
export function mountSpatial(host,s,u,send,paint){
 unmountSpatial();
 if(!host?.isConnected)return;
 try{renderer??=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{host.dataset.spatialUnavailable='true';return;}
 const kind=host.dataset.spatial,abort=new AbortController(),signal=abort.signal;
 let disposed=false,frame=0,drag=null,flat=false;
 const scene=new THREE.Scene(),group=new THREE.Group();scene.add(group);
 const camera=new THREE.PerspectiveCamera(34,1,.1,100);
 const cameraTarget=new THREE.Vector3(0,kind==='garden'?0:.2,0);
 const initial=kind==='garden'?{yaw:.55,pitch:.8,zoom:1}:{yaw:.24,pitch:.12,zoom:1};
 const view=views.get(kind)||{...initial};
 flat=view.flat===true;
 const light=new THREE.DirectionalLight(0xfff4d8,3.1);light.position.set(-3,6,6);scene.add(light,new THREE.HemisphereLight(0xf2fcff,0x7c6951,2.5));
 const fill=new THREE.DirectionalLight(0xd5efff,1.2);fill.position.set(4,2,-3);scene.add(fill);
 const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.7,...extra});
 const mesh=(geometry,material,x=0,y=0,z=0,parent=group)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m;};
 const box=(w,h,d,color,x=0,y=0,z=0,parent=group)=>mesh(new THREE.BoxGeometry(w,h,d),mat(color),x,y,z,parent);
 const sphere=(x,y,z,sx,sy,sz,color,parent=group)=>{const m=mesh(new THREE.SphereGeometry(1,24,16),mat(color),x,y,z,parent);m.scale.set(sx,sy,sz);return m;};
 const model=(key,parent=group,scale=1,x=0,y=0,z=0)=>{const holder=new THREE.Group();holder.position.set(x,y,z);holder.scale.setScalar(scale);parent.add(holder);loadModel(key).then(src=>{if(disposed)return;holder.add(src.clone());draw();}).catch(()=>{models.delete(key);host.dataset.modelFailed=key;});return holder;};
 let tiles=[],rain=[],bubbles=[];
 if(kind==='leaf'){
  const key={cherry:'cherry_leaf',ginkgo:'ginkgo_leaf',grass:'grass_leaf'}[u.plant]||'cherry_leaf';
  let texture=textures.get(key);
  if(!texture){texture=new THREE.TextureLoader().load(`/assets/generated/${key}.webp`,()=>draw());texture.colorSpace=THREE.SRGBColorSpace;textures.set(key,texture);}
  const geometry=new THREE.PlaneGeometry(3.9,3.9,28,28),p=geometry.attributes.position;
  for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)*1.5)*.1+Math.cos(p.getY(i))* .12);
  geometry.computeVertexNormals();mesh(geometry,mat(0xffffff,{map:texture,transparent:true,side:THREE.DoubleSide,alphaTest:.05}));
  group.scale.setScalar(u.zoom||1);group.rotation.z=(u.rotation||0)*Math.PI/180;
 }else if(kind==='garden'){
  box(6.45,.35,4.45,0x8b7753,0,-.33);
  s.terrain.forEach((t,i)=>{const tile=box(.96,.22, .96,colors[t],i%6-2.5,-.07,Math.floor(i/6)-1.5);tile.userData.cell=i;tiles.push(tile);if(t==='water')for(let j=0;j<2;j++){const ripple=mesh(new THREE.TorusGeometry(.15+j*.09,.008,5,30),mat(0xc6f5ed),tile.position.x,.05,tile.position.z);ripple.rotation.x=-Math.PI/2;}});
  Object.entries(s.garden).forEach(([id,i])=>{const plant=new THREE.Group();plant.position.set(i%6-2.5,.06,Math.floor(i/6)-1.5);group.add(plant);
   if(id==='cherry'){mesh(new THREE.CylinderGeometry(.055,.09,.65,10),mat(0x80603c),0,.3,0,plant);[[-.2,.7,0],[.18,.8,.05],[0,.95,-.05]].forEach(([x,y,z])=>sphere(x,y,z,.34,.35,.3,0x74a74e,plant));}
   else if(id==='aloe'){model('plant_aloe',plant,.52);}
   else{for(let j=0;j<5;j++){const a=j*Math.PI*2/5;sphere(Math.sin(a)*.19,.17,Math.cos(a)*.19,.15,.13,.19,0x4d9b65,plant);}mesh(new THREE.CylinderGeometry(.025,.035,.4),mat(0x629d61),0,.3,0,plant);sphere(0,.54,0,.12,.14,.12,0xaea4df,plant);}
  });
 }else if(kind==='lab'){
  const cut=s.experiment.step>=1;
  model(cut?'petiole_cut':'petiole_whole',group,1.25);
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
 }
 const canvas=renderer.domElement;canvas.className='spatial-canvas';canvas.setAttribute('aria-label',kind==='garden'?'입체 정원. 땅을 쓸어 칠하거나 식물을 놓아 봐.':'입체 관찰 모형. 끌어서 돌려 봐.');canvas.setAttribute('role','img');
 const layer=document.createElement('div');layer.className='spatial-layer';layer.append(canvas);host.append(layer);host.classList.add('spatial-ready');host.classList.toggle('spatial-flat',flat);
 const controls=document.createElement('div');controls.className='spatial-controls';controls.innerHTML=`<span>${kind==='garden'?(s.page===6?'쓸어서 땅 만들기':'식물을 고르고 땅 누르기'):kind==='lab'?(s.experiment.step===0?'옆으로 쓸어 잘라 보기':s.experiment.step>=3?'잎자루를 톡 눌러 보기':'끌어서 단면 돌리기'):'끌어서 돌려 보기'}</span><button type="button" data-view="rotate" aria-label="모형 돌리기">${icon('rotate')}</button><button type="button" data-view="zoom" aria-label="모형 확대">${icon('zoom')}</button><button type="button" data-view="reset" aria-label="시점 초기화">${icon('reset')}</button><button type="button" data-view="flat">${flat?'입체로 보기':'그림으로 보기'}</button>`;host.append(controls);
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
 const hit=e=>{const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(tiles,false)[0]?.object;};
 function setCamera(){const distance=(kind==='garden'?10.7:7.2)/view.zoom;camera.position.set(Math.sin(view.yaw)*Math.cos(view.pitch)*distance,Math.sin(view.pitch)*distance+cameraTarget.y,Math.cos(view.yaw)*Math.cos(view.pitch)*distance);camera.lookAt(cameraTarget);}
 function draw(){if(disposed||!host.isConnected||flat)return;setCamera();renderer.render(scene,camera);}
 function resize(){if(disposed)return;const r=host.getBoundingClientRect();const w=Math.max(1,r.width),h=Math.max(1,r.height);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();draw();}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 controls.addEventListener('click',e=>{const b=e.target.closest('[data-view]'),v=b?.dataset.view;if(!v)return;if(v==='flat'){flat=!flat;view.flat=flat;host.classList.toggle('spatial-flat',flat);b.textContent=flat?'입체로 보기':'그림으로 보기';}if(v==='rotate')view.yaw+=.4;if(v==='zoom')view.zoom=view.zoom>=1.6?1:view.zoom+.2;if(v==='reset')Object.assign(view,initial);views.set(kind,view);draw();},{signal});
 canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;canvas.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,cells:new Set()};if(kind==='garden'&&s.page===6){const tile=hit(e);if(tile){drag.cells.add(tile.userData.cell);tile.material.color.setHex(colors[u.brush]);draw();}}},{signal});
 canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;if(kind==='garden'){if(s.page===6){const tile=hit(e);if(tile){drag.cells.add(tile.userData.cell);tile.material.color.setHex(colors[u.brush]);draw();}}}else if(!(kind==='lab'&&s.experiment.step===0)){view.yaw+=(e.clientX-drag.lastX)*.009;view.pitch=Math.max(-.45,Math.min(.9,view.pitch+(e.clientY-drag.lastY)*.006));draw();}drag.lastX=e.clientX;drag.lastY=e.clientY;},{signal});
 const finish=e=>{if(!drag||drag.id!==e.pointerId)return;const d=drag;drag=null;views.set(kind,view);if(kind==='garden'){if(s.page===6&&d.cells.size)paint([...d.cells]);else if(s.page===7&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<12){const tile=hit(e);if(tile)send('garden-cell',String(tile.userData.cell));}}else if(kind==='lab'){if(s.experiment.step===0&&Math.abs(e.clientX-d.x)>55)send('lab-next','cut');else if(s.experiment.step>=3&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<12)send('press-petiole');}};
 canvas.addEventListener('pointerup',finish,{signal});canvas.addEventListener('pointercancel',e=>{if(kind==='garden'&&drag?.cells.size)paint([...drag.cells]);drag=null;},{signal});
 canvas.addEventListener('wheel',e=>{e.preventDefault();view.zoom=Math.max(.8,Math.min(1.7,view.zoom-e.deltaY*.001));draw();},{passive:false,signal});
 const animated=(rain.length&&(u.testing||u.replaying)&&!u.paused)||bubbles.length;
 if(animated&&!matchMedia('(prefers-reduced-motion: reduce)').matches){let last=performance.now();const tick=now=>{if(disposed)return;const dt=Math.min(.05,(now-last)/1000);last=now;rain.forEach((r,i)=>{r.position.y-=dt*2.2;if(r.position.y< -1.5)r.position.y=2.5;if(s.design.cover==='flap'&&r.position.y<.85&&Math.abs(r.position.x)<1.1)r.position.x+=(i%2?1:-1)*dt*2;});bubbles.forEach(b=>{b.position.y+=dt*1.1;if(b.position.y>1.4)b.position.y=-.6;});draw();frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);}
 activeCleanup=()=>{disposed=true;abort.abort();cancelAnimationFrame(frame);observer.disconnect();scene.traverse(o=>{if(o.userData.shared)return;o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});layer.remove();controls.remove();host.classList.remove('spatial-ready');};
}
