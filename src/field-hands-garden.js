// Field mission 4 by hand, a different gesture for each step:
// 1) draw a rain stream across the garden: where it ends the water pools, the
//    ground it passes gets damp, and ground it never reaches stays dry;
// 2) tap a seed card, tap a plot, then tilt the watering can until it grows;
// 3) circle a finger in the sky to gather a cloud until it rains.
// State changes go through the existing field actions only, fired after the gesture ends.
import {FIELD_ENV} from './field-missions-state.js';
const FLOW_MS=900,SETTLE_MS=1000,GROW_MS=1300,POUR_DEG=35,RAIN_TURNS=2,RAIN_SETTLE_MS=1500;
const NS='http://www.w3.org/2000/svg';

export function mountGardenHands(root,ui,onAction){
 const field=root?.querySelector('[data-garden-field]');if(!field)return ()=>{};
 const u=ui.fieldMission??={},stage=Number(field.dataset.stage),offs=[],timers=[],frames=[],tip=root.querySelector('[data-garden-tip]'),tipText=tip?.innerHTML;
 const on=(el,type,fn,opt)=>{el.addEventListener(type,fn,opt);offs.push(()=>el.removeEventListener(type,fn,opt));};
 const later=(fn,ms)=>timers.push(setTimeout(fn,ms)),capture=(el,id)=>{try{el.setPointerCapture(id);}catch{}};
 const say=text=>{if(!tip)return;tip.textContent=text;later(()=>{tip.innerHTML=tipText;},2800);};
 const zones=[...field.querySelectorAll('.field-garden-zone')],idOf=box=>box.querySelector('[data-zone]').dataset.zone;
 const zoneAt=(x,y)=>zones.find(b=>{const r=b.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;});
 const svg=field.querySelector('[data-garden-flow]'),box=()=>field.getBoundingClientRect();
 const local=e=>{const f=box();return [e.clientX-f.left,e.clientY-f.top];};
 const pts=list=>list.map(p=>p.map(Math.round).join(',')).join(' ');
 const line=(list,cls)=>{const l=document.createElementNS(NS,'polyline');l.setAttribute('points',pts(list));l.setAttribute('class',cls);l.setAttribute('pathLength','1');svg.append(l);return l;};
 const fitSvg=()=>{const f=box();svg.setAttribute('viewBox',`0 0 ${Math.round(f.width)} ${Math.round(f.height)}`);return f;};
 let busy=false;

 // Plots answer to taps and keyboard through the fallback controls; a finger on
 // the garden is a gesture, so the zone buttons must not also fire a drop.
 on(field,'click',e=>{if(e.detail>0){e.preventDefault();e.stopImmediatePropagation();}},true);

 // Animate whatever changed since the last render, whichever input path changed it.
 const seen=u.gardenSeen;u.gardenSeen={};
 zones.forEach(b=>{const {zone,env,plant,fit}=b.querySelector('[data-zone]').dataset,was=seen?.[zone];u.gardenSeen[zone]={env,plant};if(!was)return;
  if(env&&env!==was.env)b.classList.add('just-env');
  if(plant&&plant!==was.plant){b.classList.add('just-planted');if(!fit)b.classList.add('misfit');}
 });

 if(stage===0){
  // Keep the last stream on screen so the ground it made still makes sense.
  const f0=fitSvg();if(u.gardenPath?.length>1)line(u.gardenPath.map(([x,y])=>[x*f0.width,y*f0.height]),'flow-water');
  let draw=null;
  const fizzle=(d,text)=>{d.live.classList.add('flow-fizzle');later(()=>d.live.remove(),600);say(text);};
  on(field,'pointerdown',e=>{if(e.button>0||busy)return;e.preventDefault();capture(field,e.pointerId);fitSvg();
   const p=local(e);draw={id:e.pointerId,list:[p],len:0,hit:new Set(),live:line([p],'flow-live')};const z=zoneAt(e.clientX,e.clientY);if(z){draw.hit.add(z);z.classList.add('flow-touched');}});
  on(field,'pointermove',e=>{if(!draw||e.pointerId!==draw.id)return;e.preventDefault();const p=local(e),q=draw.list.at(-1),step=Math.hypot(p[0]-q[0],p[1]-q[1]);if(step<5)return;
   draw.len+=step;draw.list.push(p);draw.live.setAttribute('points',pts(draw.list));const z=zoneAt(e.clientX,e.clientY);if(z){draw.hit.add(z);z.classList.add('flow-touched');}});
  const end=e=>{if(!draw||e.pointerId!==draw.id)return;const d=draw;draw=null;zones.forEach(z=>z.classList.remove('flow-touched'));
   if(e.type!=='pointerup'||d.len<40){d.live.remove();if(e.type==='pointerup')say('손가락을 떼지 말고 쭉 이어서 물길을 그려 봐.');return;}
   const last=zoneAt(e.clientX,e.clientY);
   if(!last)return fizzle(d,'물길이 땅 밖에서 끝났어. 빗물이 고일 땅 위에서 손을 떼 봐.');
   if(d.hit.size<2)return fizzle(d,'물길이 땅 한 곳에만 닿았어. 다른 땅을 지나서 흘러가게 그려 봐.');
   if(d.hit.size>2)return fizzle(d,'세 땅을 모두 지나면 마른 땅이 남지 않아. 두 곳만 지나게 그려 봐.');
   busy=true;d.live.remove();svg.querySelectorAll('.flow-water').forEach(l=>l.remove());line(d.list,'flow-water flowing');
   const f=box(),made=Object.fromEntries(zones.map(z=>[idOf(z),z===last?'water':d.hit.has(z)?'grass':'dry']));
   u.gardenPath=d.list.map(([x,y])=>[+(x/f.width).toFixed(3),+(y/f.height).toFixed(3)]);
   later(()=>zones.forEach(z=>z.classList.add({water:'pooling',grass:'damp',dry:'dried'}[made[idOf(z)]])),FLOW_MS);
   // Correct plots first, so Leafy's reply speaks about a mismatch if there is one.
   const order=Object.entries(made).sort(([z1,e1],[z2,e2])=>(FIELD_ENV[z1]===e1?0:1)-(FIELD_ENV[z2]===e2?0:1));
   later(()=>order.forEach(([zone,env])=>onAction('field-place',`environment:${env}|environment:${zone}`)),FLOW_MS+SETTLE_MS);
  };
  on(field,'pointerup',end);on(field,'pointercancel',end);
 }else{
  const seeds=[...root.querySelectorAll('[data-garden-seed]')],can=field.querySelector('[data-garden-can]'),sky=field.querySelector('[data-garden-sky]');
  let pick='',pending=null,sprout=null,tilt=null,raf=0,turn=0,g=null;

  // Tap: choose a seed card, then tap a plot to sow it.
  seeds.forEach(s=>on(s,'click',()=>{if(busy)return;pick=s.dataset.gardenSeed;seeds.forEach(x=>x.classList.toggle('selected',x===s));}));
  const sow=z=>{
   if(!pick)return say('먼저 위에서 심을 씨앗 카드를 톡 골라 줘.');
   const f=box(),r=z.getBoundingClientRect(),x=r.left-f.left+r.width/2,y=r.top-f.top+r.height*.72;
   zones.forEach(b=>b.classList.toggle('sown',b===z));pending={plant:pick,zone:idOf(z),grow:0};
   sprout?.remove();sprout=document.createElement('span');sprout.className='garden-sprout';sprout.setAttribute('aria-hidden','true');Object.assign(sprout.style,{left:x+'px',top:y+'px'});field.append(sprout);
   can.hidden=false;can.classList.remove('pouring');can.style.setProperty('--tilt','0deg');can.style.setProperty('--fill','0');
   Object.assign(can.style,{left:Math.min(f.width-can.offsetWidth-4,x+18)+'px',top:Math.max(0,y-can.offsetHeight-40)+'px'});
   say('씨앗을 심었어! 이제 물뿌리개를 잡고 빙그르 기울여 봐.');
  };

  // Tilt: turn the can around its middle; water flows while it leans far enough.
  const grow=t0=>{let last=t0;const tick=now=>{if(!tilt||!pending)return;const dt=now-last;last=now;
    if(can.classList.contains('pouring')){pending.grow=Math.min(1,pending.grow+dt/GROW_MS);sprout.style.setProperty('--grow',pending.grow.toFixed(3));can.style.setProperty('--fill',pending.grow.toFixed(3));}
    if(pending.grow>=1)return done();raf=requestAnimationFrame(tick);frames.push(raf);};raf=requestAnimationFrame(tick);frames.push(raf);};
  const done=()=>{busy=true;tilt=null;can.classList.remove('pouring','held');can.style.setProperty('--tilt','0deg');sprout.classList.add('grown');
   const {plant,zone}=pending;later(()=>onAction('field-place',`plant:${plant}|plant:${zone}`),650);};
  if(can){
   on(can,'pointerdown',e=>{if(e.button>0||!pending||busy)return;e.preventDefault();e.stopPropagation();capture(can,e.pointerId);
    const r=can.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;tilt={id:e.pointerId,cx,cy,a0:Math.atan2(e.clientY-cy,e.clientX-cx)};can.classList.add('held');grow(performance.now());});
   on(can,'pointermove',e=>{if(!tilt||e.pointerId!==tilt.id)return;e.preventDefault();if(Math.hypot(e.clientX-tilt.cx,e.clientY-tilt.cy)<12)return;
    const d=((Math.atan2(e.clientY-tilt.cy,e.clientX-tilt.cx)-tilt.a0)*180/Math.PI+540)%360-180,deg=Math.min(80,Math.abs(d));
    can.style.setProperty('--tilt',-deg+'deg');can.classList.toggle('pouring',deg>=POUR_DEG);});
   const letGo=e=>{if(!tilt||e.pointerId!==tilt.id)return;tilt=null;cancelAnimationFrame(raf);can.classList.remove('pouring','held');can.style.setProperty('--tilt','0deg');
    if(e.type==='pointerup'&&pending&&pending.grow<1)say(pending.grow>0?'싹이 나고 있어! 조금 더 기울여서 물을 줘.':'물뿌리개를 잡은 채 손가락을 빙그르 돌려 기울여 봐.');};
   on(can,'pointerup',letGo);on(can,'pointercancel',letGo);
  }

  // Swirl: the turning of the finger's path, summed up, is how many circles were drawn.
  const meter=sky?.querySelector('[data-sky-count]');
  const swirl=e=>{const p=local(e),q=g.last;if(Math.hypot(p[0]-q[0],p[1]-q[1])<8)return;const h=Math.atan2(p[1]-q[1],p[0]-q[0]);
   if(g.heading!==null){let d=h-g.heading;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;turn+=d;}
   g.heading=h;g.last=p;g.list.push(p);if(g.list.length>48)g.list.shift();g.trail.setAttribute('points',pts(g.list));
   const k=Math.min(1,Math.abs(turn)/(RAIN_TURNS*2*Math.PI));sky.style.setProperty('--gather',k.toFixed(3));meter.textContent=`${Math.floor(k*RAIN_TURNS)}/${RAIN_TURNS}바퀴`;
   if(k>=1)rain();};
  const rain=()=>{busy=true;g?.trail.remove();g=null;sky.classList.add('raining');field.classList.add('storm');meter.textContent='비가 와!';
   zones.forEach((z,i)=>later(()=>z.classList.add('wet'),250+i*220));later(()=>onAction('field-garden-rain',''),RAIN_SETTLE_MS);};

  on(field,'pointerdown',e=>{if(e.button>0||busy||e.target.closest('[data-garden-can]'))return;e.preventDefault();capture(field,e.pointerId);
   const p=local(e);g={id:e.pointerId,x:e.clientX,y:e.clientY,moved:0,last:p,heading:null,list:[p],trail:null};if(sky){fitSvg();g.trail=line([p],'swirl-live');}});
  on(field,'pointermove',e=>{if(!g||e.pointerId!==g.id)return;e.preventDefault();g.moved=Math.max(g.moved,Math.hypot(e.clientX-g.x,e.clientY-g.y));if(sky)swirl(e);});
  const end=e=>{if(!g||e.pointerId!==g.id)return;const s=g;g=null;s.trail?.remove();if(e.type!=='pointerup')return;
   if(s.moved<12){const z=zoneAt(e.clientX,e.clientY);if(z&&seeds.length)sow(z);return;}
   if(sky){const k=Math.abs(turn)/(RAIN_TURNS*2*Math.PI);say(k>.08?`구름이 ${Math.round(k*100)}% 모였어. 같은 방향으로 계속 빙글빙글!`:'한 자리에서 동그라미를 그리듯 빙글빙글 돌려 봐.');}};
  on(field,'pointerup',end);on(field,'pointercancel',end);

  // A rainbow once after a successful rain test.
  if(stage===2){const ok=!!field.querySelector('.rained');if(ok&&!u.rainbowSeen)field.classList.add('rainbow');u.rainbowSeen=ok;}
 }
 return ()=>{timers.forEach(clearTimeout);frames.forEach(cancelAnimationFrame);offs.forEach(off=>off());};
}
