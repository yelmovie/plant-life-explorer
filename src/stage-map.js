import {bindDirectionPad,mapKeyDirection} from './map-controls.js';
import {assetImage} from './asset-catalog.js';
import {REWARDS} from './rewards.js';
import {josa} from './josa.js';
import {mountVillageEncounters} from './village-encounters.js';

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

export function mountStageMap(root,ui,onArrive,encounterOptions={}){
  const viewport=root.querySelector('.stage-map-viewport'),world=viewport.querySelector('.island-map');

  const controller=new AbortController(),{signal}=controller,held=new Set();
  const actor=document.createElement('div');actor.className='map-walker';actor.setAttribute('aria-hidden','true');actor.innerHTML=assetImage('mascot_leaf');world.append(actor);
  const road=document.createElementNS('http://www.w3.org/2000/svg','svg');road.setAttribute('viewBox','0 0 1536 1024');road.setAttribute('aria-hidden','true');road.classList.add('map-road');road.innerHTML=`<polyline points="${TRAIL.map(p=>p.join(',')).join(' ')}"/>`;world.prepend(road);
  let distance=Number.isFinite(ui.mapDistance)?ui.mapDistance:ENTRANCES[0].distance+90,target=null,frame=0,lastTime=0,scale=1,offsetX=0,offsetY=0,disposed=false;
  let overview=ui.mapOverview===true;
  let hand=false,free=null,grab=null,dragged=false,zoom=1,saved=null,cameraAt=0,settle=0;
  const touches=new Map();let pinch=null;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const blocked=()=>document.querySelector('#dialog')?.open||root.querySelector('.map-load-error');
  const flower=document.createElement('div');flower.className='map-walker map-flower';flower.setAttribute('aria-hidden','true');
  flower.innerHTML=assetImage('mascot_flower');flower.style.width='54px';
  const encounters=mountVillageEncounters({host:viewport,stages:ENTRANCES.map((entry,i)=>{
    if(!encounterOptions.completed?.[i])return null;
    const p=trailPoint(entry.distance+(i===4?-42:42));return {x:p.x,y:p.y,name:REWARDS[i].name};
  }),progress:encounterOptions.progress,onSave:encounterOptions.onSave,tone:encounterOptions.tone,
    blocked:()=>!!blocked()||overview,reduced:()=>reduce.matches,actors:[actor,flower]});
  if(encounters)world.append(flower);
  let encounterFrame=0;
  function drawEncounters(now){
    if(disposed||!encounters)return;
    const hero=trailPoint(distance),friend=trailPoint(distance-45),ally={x:friend.x-14,y:friend.y+10};
    flower.style.left=`${ally.x/1536*100}%`;flower.style.top=`${ally.y/1024*100}%`;
    encounters.update({hero,ally,now,scale,project:({x,y})=>({x:offsetX+x*scale,y:offsetY+y*scale})});
    encounterFrame=requestAnimationFrame(drawEncounters);
  }
  const near=()=>ENTRANCES.findIndex(e=>Math.abs(e.distance-distance)<24);
  const base=()=>Math.max(viewport.clientWidth/1536,viewport.clientHeight/1024);
  const clamp=(value,view,size)=>size<view?(view-size)/2:Math.max(view-size,Math.min(0,value));
  const snapshot=()=>({zoom,hand,free:free?[(viewport.clientWidth/2-offsetX)/scale,(viewport.clientHeight/2-offsetY)/scale]:null});
  function restore(savedView){
    if(!savedView)return;({zoom,hand}=savedView);const k=base()*zoom;
    free=savedView.free?{x:viewport.clientWidth/2-savedView.free[0]*k,y:viewport.clientHeight/2-savedView.free[1]*k}:null;
  }
  function draw(snap=false){
    const p=trailPoint(distance),width=viewport.clientWidth,height=viewport.clientHeight;
    scale=overview?Math.min(width/1536,Math.max(1,height-220)/1024):base()*zoom;
    const x=overview?(width-1536*scale)/2:clamp(free?.x??width*.5-p.x*scale,width,1536*scale);
    const y=overview?80+(Math.max(1,height-220)-1024*scale)/2:clamp(free?.y??height*.6-p.y*scale,height,1024*scale);
    const now=performance.now(),blend=snap||!cameraAt||overview||free||reduce.matches?1:1-Math.exp(-Math.min(40,now-cameraAt)/72);
    cameraAt=now;offsetX+=blend*(x-offsetX);offsetY+=blend*(y-offsetY);
    cancelAnimationFrame(settle);
    if(Math.hypot(x-offsetX,y-offsetY)>.6)settle=requestAnimationFrame(()=>draw());
    else {offsetX=x;offsetY=y;}
    world.style.transform=`translate(${offsetX}px,${offsetY}px) scale(${scale})`;world.style.setProperty('--map-scale',scale);
    actor.style.left=`${p.x/1536*100}%`;actor.style.top=`${p.y/1024*100}%`;
    ui.mapDistance=distance;ui.mapOverview=overview;
    const button=root.querySelector('[data-action="map-overview"]');button.setAttribute('aria-pressed',String(overview));button.setAttribute('aria-label',overview?'이전 지도 보기':'지도 한눈에 보기');button.title=button.getAttribute('aria-label');
    root.querySelector('[data-action="map-pan"]')?.setAttribute('aria-pressed',String(hand&&!overview));viewport.classList.toggle('hand-on',hand&&!overview);
  }
  const fingers=()=>{const [a,b]=[...touches.values()];return {x:(a.x+b.x)/2,y:(a.y+b.y)/2,d:Math.hypot(a.x-b.x,a.y-b.y)};};
  function zoomAt(ratio,x,y,wx,wy){overview=false;saved=null;hand=true;zoom=Math.max(1,Math.min(2,ratio));const k=base()*zoom;free={x:x-wx*k,y:y-wy*k};draw(true);}
  const nextButton=root.querySelector('.map-next-card > [data-action="map-select"]');
  function guideBusy(busy){if(!nextButton)return;nextButton.disabled=busy;if(busy)nextButton.setAttribute('aria-busy','true');else nextButton.removeAttribute('aria-busy');}
  function stop(){target=null;guideBusy(false);held.clear();root.querySelectorAll('.map-direction').forEach(b=>b.classList.remove('pressed'));actor.classList.remove('walking');cancelAnimationFrame(frame);frame=0;lastTime=0;}
  function arrive(i,enter=false){stop();root.querySelector('.map-walk-status').textContent=`${REWARDS[i].name}에 도착했어.`;onArrive(i,enter);}
  function tick(now){
    frame=0;if(disposed||blocked()){stop();return;}
    const dt=Math.min((now-(lastTime||now-16))/1000,.04);lastTime=now;
    const old=distance,p=trailPoint(distance);
    if(held.size){const [vx,vy]=[...held].reduce(([x,y],dir)=>[x+vectors[dir][0],y+vectors[dir][1]],[0,0]),ahead=trailPoint(distance+36),behind=trailPoint(distance-36),forward=vx*(ahead.x-p.x)+vy*(ahead.y-p.y),backward=vx*(behind.x-p.x)+vy*(behind.y-p.y);if(Math.max(forward,backward)>2)distance=Math.max(0,Math.min(length,distance+(forward>=backward?1:-1)*240*dt));}
    else if(target!==null){distance+=Math.sign(target.distance-distance)*Math.min(600*dt,Math.abs(target.distance-distance));}
    actor.classList.toggle('walking',Math.abs(distance-old)>.01);draw();
    if(target!==null&&Math.abs(target.distance-distance)<.1){const {id,enter}=target;if(id===undefined)stop();else arrive(id,enter);return;}
    if(held.size||target!==null)frame=requestAnimationFrame(tick);else lastTime=0;
  }
  function start(){touches.clear();pinch=null;grab=null;viewport.classList.remove('grabbing');if(overview||hand||free){free=null;hand=false;overview=false;saved=null;zoom=1;draw(true);}if(!frame)frame=requestAnimationFrame(tick);}
  function goTo(i,{enter=false}={}){if(!ENTRANCES[i]||blocked())return;stop();guideBusy(true);target={distance:ENTRANCES[i].distance,id:i,enter};root.querySelector('.map-walk-status').textContent=`${josa(REWARDS[i].name,'으로/로')} 이동 중이야.`;start();}
  const local=e=>{const box=viewport.getBoundingClientRect();return {x:e.clientX-box.left,y:e.clientY-box.top};};
  viewport.addEventListener('pointerdown',e=>{
    if(e.button>0||blocked()||e.target.closest('button'))return;
    if(e.pointerType==='touch'){
      if(!touches.size)dragged=false;
      touches.set(e.pointerId,local(e));viewport.setPointerCapture?.(e.pointerId);
      if(touches.size===2){stop();grab=null;dragged=true;const m=fingers();pinch={...m,zoom:overview?scale/base():zoom,wx:(m.x-offsetX)/scale,wy:(m.y-offsetY)/scale};return;}
    }
    if(overview||grab||pinch)return;
    if(target?.id!==undefined)stop();grab={id:e.pointerId,x:e.clientX,y:e.clientY,ox:offsetX,oy:offsetY};dragged=false;
  },{signal});
  viewport.addEventListener('pointermove',e=>{
    if(blocked())return;
    if(touches.has(e.pointerId))touches.set(e.pointerId,local(e));
    if(pinch&&touches.size>=2){const m=fingers();zoomAt(pinch.zoom*m.d/Math.max(8,pinch.d),m.x,m.y,pinch.wx,pinch.wy);return;}
    if(grab?.id!==e.pointerId)return;
    const dx=e.clientX-grab.x,dy=e.clientY-grab.y;if(!dragged&&Math.hypot(dx,dy)<6)return;
    if(!dragged){dragged=true;stop();if(e.pointerType==='mouse')viewport.setPointerCapture(e.pointerId);viewport.classList.add('grabbing');}
    hand=true;free={x:grab.ox+dx,y:grab.oy+dy};draw(true);
  },{signal});
  const letGo=e=>{touches.delete(e.pointerId);if(touches.size<2)pinch=null;if(grab?.id!==e.pointerId)return;grab=null;viewport.classList.remove('grabbing');};
  viewport.addEventListener('pointerup',letGo,{signal});viewport.addEventListener('pointercancel',letGo,{signal});viewport.addEventListener('lostpointercapture',letGo,{signal});
  viewport.addEventListener('wheel',e=>{if(blocked()||e.target.closest('button'))return;e.preventDefault();stop();const p=local(e),k=overview?scale/base():zoom;zoomAt(k*Math.exp(-e.deltaY*.0015),p.x,p.y,(p.x-offsetX)/scale,(p.y-offsetY)/scale);},{signal,passive:false});
  // A drag never ends in a tap on a place or the road.
  viewport.addEventListener('click',e=>{if(!dragged)return;dragged=false;e.preventDefault();e.stopPropagation();},{signal,capture:true});
  viewport.addEventListener('click',e=>{if(e.target.closest('button')||hand)return;const box=viewport.getBoundingClientRect(),point=projectToTrail((e.clientX-box.left-offsetX)/scale,(e.clientY-box.top-offsetY)/scale);if(point.gap>90)return;stop();target={distance:point.distance};start();viewport.focus({preventScroll:true});},{signal});
  bindDirectionPad(root,'[data-map-direction]',b=>b.dataset.mapDirection,{signal,blocked:()=>!!blocked(),
    press:direction=>{stop();held.add(direction);start();},release:direction=>{held.delete(direction);if(!held.size)stop();},
    tap:direction=>{stop();const p=trailPoint(distance),v=vectors[direction];target={distance:Math.max(0,Math.min(length,distance+Math.sign(v[0]*p.dx+v[1]*p.dy)*40))};start();}
  });
  addEventListener('blur',stop,{signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();},{signal});
  document.addEventListener('keydown',e=>{if(blocked()||e.target.closest('input,textarea,select,summary,[contenteditable="true"]')||e.ctrlKey||e.altKey||e.metaKey)return;const direction=mapKeyDirection(e);if(direction){e.preventDefault();if(!held.size)stop();held.add(direction);start();}else if(e.key==='Enter'&&e.target===viewport){e.preventDefault();const i=near();if(i>=0)arrive(i,true);}},{signal});
  document.addEventListener('keyup',e=>{const direction=mapKeyDirection(e);held.delete(direction);if(!held.size&&target===null)stop();},{signal});
  let previousWidth=viewport.clientWidth,previousHeight=viewport.clientHeight;
  const observer=new ResizeObserver(()=>{if(free&&!overview){const x=(previousWidth/2-offsetX)/scale,y=(previousHeight/2-offsetY)/scale,k=base()*zoom;free={x:viewport.clientWidth/2-x*k,y:viewport.clientHeight/2-y*k};}previousWidth=viewport.clientWidth;previousHeight=viewport.clientHeight;draw(true);});observer.observe(viewport);
  addEventListener('orientationchange',stop,{signal});draw(true);if(encounters)drawEncounters(performance.now());
  return {goTo,stop,toggleOverview(){stop();if(overview){overview=false;restore(saved);saved=null;}else{saved=snapshot();overview=true;}draw(true);},toggleHand(){stop();if(overview){overview=false;restore(saved);saved=null;draw(true);}hand=!hand;free=hand?{x:offsetX,y:offsetY}:null;if(!hand)zoom=1;draw(true);},destroy(){disposed=true;stop();cancelAnimationFrame(encounterFrame);encounters?.destroy();cancelAnimationFrame(settle);observer.disconnect();controller.abort();}};
}
