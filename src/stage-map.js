import {assetImage} from './asset-catalog.js';
import {REWARDS} from './rewards.js';

// One continuous walkable road, traced from the existing 1536 × 1024 artwork.
// Movement and taps project onto this road, so the river and forest cannot be crossed.
export const TRAIL = [[170,870],[250,820],[290,744],[363,700],[422,649],[437,607],[428,568],[405,533],[432,487],[495,441],[581,412],[650,399],[700,363],[727,337],[771,322],[872,302],[951,296],[988,321],[995,358],[1021,390],[1080,419],[1143,457],[1200,490],[1295,536],[1325,477],[1360,430],[1386,368],[1378,326],[1340,295],[1328,254],[1359,217],[1390,195]];
const segments=TRAIL.slice(1).map((p,i)=>({a:TRAIL[i],b:p,length:Math.hypot(p[0]-TRAIL[i][0],p[1]-TRAIL[i][1])}));
let length=0;
for(const segment of segments){segment.start=length;length+=segment.length;}
export const TRAIL_LENGTH=length;
export function trailPoint(distance){
  const d=Math.max(0,Math.min(length,distance)),s=segments.find(s=>d<=s.start+s.length)||segments.at(-1),t=(d-s.start)/s.length;
  return {x:s.a[0]+(s.b[0]-s.a[0])*t,y:s.a[1]+(s.b[1]-s.a[1])*t,dx:(s.b[0]-s.a[0])/s.length,dy:(s.b[1]-s.a[1])/s.length};
}
export function projectToTrail(x,y){
  let closest={distance:0,gap:Infinity};
  for(const s of segments){const t=Math.max(0,Math.min(1,((x-s.a[0])*(s.b[0]-s.a[0])+(y-s.a[1])*(s.b[1]-s.a[1]))/s.length**2)),gap=Math.hypot(x-s.a[0]-(s.b[0]-s.a[0])*t,y-s.a[1]-(s.b[1]-s.a[1])*t);if(gap<closest.gap)closest={distance:s.start+s.length*t,gap};}
  return closest;
}
export const ENTRANCES=[[250,820],[405,533],[771,322],[1295,536],[1390,195]].map(([x,y])=>({...projectToTrail(x,y),x,y}));
const vectors={up:[0,-1],left:[-1,0],down:[0,1],right:[1,0]};
const keys={ArrowUp:'up',ArrowLeft:'left',ArrowDown:'down',ArrowRight:'right',w:'up',a:'left',s:'down',d:'right'};

export function mountStageMap(root,ui,onArrive){
  const viewport=root.querySelector('.stage-map-viewport'),world=viewport.querySelector('.island-map');
  const controller=new AbortController(),{signal}=controller,held=new Set();
  const actor=document.createElement('div');actor.className='map-walker';actor.setAttribute('aria-hidden','true');actor.innerHTML=assetImage('mascot_leaf');world.append(actor);
  const road=document.createElementNS('http://www.w3.org/2000/svg','svg');road.setAttribute('viewBox','0 0 1536 1024');road.setAttribute('aria-hidden','true');road.classList.add('map-road');road.innerHTML=`<polyline points="${TRAIL.map(p=>p.join(',')).join(' ')}"/>`;world.prepend(road);
  let distance=Number.isFinite(ui.mapDistance)?ui.mapDistance:ENTRANCES[0].distance+90,target=null,frame=0,lastTime=0,scale=1,offsetX=0,offsetY=0,disposed=false;
  let overview=ui.mapOverview===true;
  // Hand mode: dragging the map pans a free camera; moving Leafy again returns to following.
  let hand=false,free=null,grab=null,dragged=false;
  const blocked=()=>document.querySelector('#dialog')?.open||root.querySelector('.map-load-error');
  const near=()=>ENTRANCES.findIndex(e=>Math.abs(e.distance-distance)<24);
  let previousEntrance=near(); // Returning to a door does not immediately re-enter it.
  function draw(){
    const p=trailPoint(distance),width=viewport.clientWidth,height=viewport.clientHeight;
    scale=(overview?Math.min:Math.max)(width/1536,height/1024);
    offsetX=overview?(width-1536*scale)/2:Math.max(width-1536*scale,Math.min(0,free?free.x:width*.5-p.x*scale));
    offsetY=overview?(height-1024*scale)/2:Math.max(height-1024*scale,Math.min(0,free?free.y:height*.6-p.y*scale));
    world.style.transform=`translate(${offsetX}px,${offsetY}px) scale(${scale})`;world.style.setProperty('--map-scale',scale);
    actor.style.left=`${p.x/1536*100}%`;actor.style.top=`${p.y/1024*100}%`;
    ui.mapDistance=distance;ui.mapOverview=overview;
    const button=root.querySelector('[data-action="map-overview"]');button.setAttribute('aria-pressed',String(overview));button.textContent=overview?'리피 따라 보기':'지도 한눈에 보기';
    root.querySelector('[data-action="map-pan"]')?.setAttribute('aria-pressed',String(hand));viewport.classList.toggle('hand-on',hand);
  }
  function stop(){target=null;held.clear();root.querySelectorAll('.map-direction').forEach(b=>b.classList.remove('pressed'));actor.classList.remove('walking');cancelAnimationFrame(frame);frame=0;lastTime=0;}
  function arrive(i){stop();previousEntrance=i;root.querySelector('.map-walk-status').textContent=`${REWARDS[i].name}에 도착했어.`;onArrive(i);}
  function tick(now){
    frame=0;if(disposed||blocked()){stop();return;}
    const dt=Math.min((now-(lastTime||now-16))/1000,.04);lastTime=now;
    const old=distance,p=trailPoint(distance);
    if(held.size){const [vx,vy]=[...held].reduce(([x,y],dir)=>[x+vectors[dir][0],y+vectors[dir][1]],[0,0]),dot=vx*p.dx+vy*p.dy;if(Math.abs(dot)>.08)distance=Math.max(0,Math.min(length,distance+Math.sign(dot)*300*dt));}
    else if(target!==null){distance+=Math.sign(target.distance-distance)*Math.min(600*dt,Math.abs(target.distance-distance));}
    actor.classList.toggle('walking',Math.abs(distance-old)>.01);draw();
    if(target!==null&&Math.abs(target.distance-distance)<.1){const destination=target.id,entrance=near();stop();if(destination!==undefined)arrive(destination);else if(entrance>=0&&entrance!==previousEntrance)arrive(entrance);else previousEntrance=entrance;return;}
    const entrance=near();if(target===null&&entrance>=0&&entrance!==previousEntrance){arrive(entrance);return;}previousEntrance=entrance;
    if(held.size||target!==null)frame=requestAnimationFrame(tick);else lastTime=0;
  }
  function start(){free=null;if(!frame)frame=requestAnimationFrame(tick);}
  function goTo(i){if(!ENTRANCES[i]||blocked())return;stop();target={distance:ENTRANCES[i].distance,id:i};root.querySelector('.map-walk-status').textContent=`${REWARDS[i].name}로 이동 중이야.`;start();}
  viewport.addEventListener('pointerdown',e=>{if(!hand||e.button>0||blocked())return;grab={id:e.pointerId,x:e.clientX,y:e.clientY,ox:offsetX,oy:offsetY};dragged=false;},{signal});
  viewport.addEventListener('pointermove',e=>{if(grab?.id!==e.pointerId)return;const dx=e.clientX-grab.x,dy=e.clientY-grab.y;if(!dragged&&Math.hypot(dx,dy)<6)return;if(!dragged){dragged=true;viewport.setPointerCapture(e.pointerId);viewport.classList.add('grabbing');}free={x:grab.ox+dx,y:grab.oy+dy};draw();},{signal});
  const letGo=e=>{if(grab?.id!==e.pointerId)return;grab=null;viewport.classList.remove('grabbing');};
  viewport.addEventListener('pointerup',letGo,{signal});viewport.addEventListener('pointercancel',letGo,{signal});
  // A drag never ends in a tap on a place or the road.
  viewport.addEventListener('click',e=>{if(!dragged)return;dragged=false;e.preventDefault();e.stopPropagation();},{signal,capture:true});
  viewport.addEventListener('click',e=>{if(e.target.closest('button')||hand)return;const box=viewport.getBoundingClientRect(),point=projectToTrail((e.clientX-box.left-offsetX)/scale,(e.clientY-box.top-offsetY)/scale);if(point.gap>90)return;stop();target={distance:point.distance};start();viewport.focus({preventScroll:true});},{signal});
  for(const button of root.querySelectorAll('[data-map-direction]')){
    button.addEventListener('pointerdown',e=>{if(e.button!==0||blocked())return;e.preventDefault();stop();button.setPointerCapture(e.pointerId);held.add(button.dataset.mapDirection);button.classList.add('pressed');start();},{signal});
    button.addEventListener('click',e=>{if(e.detail!==0||blocked())return;stop();const p=trailPoint(distance),v=vectors[button.dataset.mapDirection],sign=Math.sign(v[0]*p.dx+v[1]*p.dy);target={distance:Math.max(0,Math.min(length,distance+sign*64))};start();},{signal});
    button.addEventListener('lostpointercapture',()=>{if(held.has(button.dataset.mapDirection))stop();},{signal});
  }
  const release=()=>{if(held.size)stop();};
  addEventListener('pointerup',release,{signal});addEventListener('pointercancel',release,{signal});addEventListener('blur',stop,{signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();},{signal});
  document.addEventListener('keydown',e=>{if(blocked()||e.target.closest('input,textarea,select,summary,[contenteditable="true"]')||e.ctrlKey||e.altKey||e.metaKey)return;const direction=keys[e.key]||keys[e.key.toLowerCase()];if(direction){e.preventDefault();if(!held.size)stop();held.add(direction);start();}else if(e.key==='Enter'&&e.target===viewport){e.preventDefault();const i=near();if(i>=0)arrive(i);}},{signal});
  document.addEventListener('keyup',e=>{const direction=keys[e.key]||keys[e.key.toLowerCase()];held.delete(direction);if(!held.size&&target===null)stop();},{signal});
  const observer=new ResizeObserver(()=>{stop();draw();});observer.observe(viewport);
  addEventListener('orientationchange',stop,{signal});draw();
  return {goTo,stop,toggleOverview(){stop();overview=!overview;hand=false;free=null;draw();},toggleHand(){stop();hand=!hand;free=null;if(hand)overview=false;draw();},destroy(){disposed=true;stop();observer.disconnect();controller.abort();}};
}
