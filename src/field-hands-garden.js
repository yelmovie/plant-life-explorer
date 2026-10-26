// Field mission 4 by hand: pour an environment onto a plot, watch a planting settle,
// then drag a rain cloud across all three plots. State changes go through the
// existing field actions only, fired after the pointer is released.
const POUR_MS=850,RAIN_SETTLE_MS=900;
const POUR_TINT={water:'#6fb7d6',grass:'#8cbf5a',dry:'#e0c48a'};

export function mountGardenHands(root,ui,onAction){
 const field=root?.querySelector('[data-garden-field]');if(!field)return ()=>{};
 const u=ui.fieldMission??={},offs=[],timers=[],tip=root.querySelector('[data-garden-tip]'),tipText=tip?.innerHTML;
 const on=(el,type,fn)=>{el.addEventListener(type,fn);offs.push(()=>el.removeEventListener(type,fn));};
 const later=(fn,ms)=>timers.push(setTimeout(fn,ms)),capture=(el,id)=>{try{el.setPointerCapture(id);}catch{}};
 const say=text=>{if(!tip)return;tip.textContent=text;later(()=>{tip.innerHTML=tipText;},2600);};
 const zones=[...field.querySelectorAll('.field-garden-zone')],idOf=box=>box.querySelector('[data-zone]').dataset.zone;
 const zoneAt=(x,y)=>zones.find(b=>{const r=b.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;});

 // Animate whatever changed since the last render, whichever input path changed it.
 const seen=u.gardenSeen;u.gardenSeen={};
 zones.forEach(box=>{const {zone,env,plant,fit}=box.querySelector('[data-zone]').dataset,was=seen?.[zone];u.gardenSeen[zone]={env,plant};if(!was)return;
  if(env&&env!==was.env)box.classList.add('just-env');
  if(plant&&plant!==was.plant){box.classList.add('just-planted');if(!fit)box.classList.add('misfit');}
 });

 // Pour: hold a tool over a plot until it fills, then let go.
 field.parentElement.querySelectorAll('[data-garden-tool]').forEach(tool=>{
  const env=tool.dataset.gardenTool;let drag=null;
  const unmark=box=>box?.classList.remove('pour-target','poured');
  const end=e=>{if(!drag||e.pointerId!==drag.id)return;const {ghost,zone,done}=drag;clearTimeout(drag.timer);drag=null;ghost.remove();tool.classList.remove('lifted');
   if(done&&e.type==='pointerup')return later(()=>onAction('field-place',`environment:${env}|environment:${idOf(done)}`),120);
   unmark(zone);unmark(done);if(zone&&e.type==='pointerup')say('조금 더 머물러야 다 부어져. 땅 위에서 잠깐 멈춰 봐.');};
  on(tool,'pointerdown',e=>{if(e.button>0)return;e.preventDefault();e.stopPropagation();capture(tool,e.pointerId);
   const ghost=document.createElement('div');ghost.className='garden-ghost tool-'+env;ghost.innerHTML=tool.querySelector('img')?.outerHTML||'';document.body.append(ghost);
   drag={id:e.pointerId,ghost,zone:null,done:null,timer:0};tool.classList.add('lifted');Object.assign(ghost.style,{left:e.clientX+'px',top:e.clientY+'px'});});
  on(tool,'pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;e.preventDefault();Object.assign(drag.ghost.style,{left:e.clientX+'px',top:e.clientY+'px'});
   const box=zoneAt(e.clientX,e.clientY+40)||null;if(box===drag.zone)return;
   clearTimeout(drag.timer);if(drag.zone!==drag.done)unmark(drag.zone);drag.zone=box;drag.ghost.classList.toggle('pouring',!!box);
   if(!box||box===drag.done)return;box.style.setProperty('--pour',POUR_TINT[env]);box.classList.add('pour-target');
   drag.timer=setTimeout(()=>{if(!drag)return;unmark(drag.done);drag.done=box;box.classList.add('poured');},POUR_MS);});
  on(tool,'pointerup',end);on(tool,'pointercancel',end);
 });

 // Rain: the cloud must pass over every plot; each plot shows what its water does.
 const cloud=field.querySelector('[data-garden-cloud]');
 if(cloud){
  let drag=null;const visited=new Set();
  const place=(x,y)=>{const f=field.getBoundingClientRect(),w=cloud.offsetWidth,h=cloud.offsetHeight;u.cloud={x:Math.max(0,Math.min(f.width-w,x)),y:Math.max(0,Math.min(f.height*.45,y))};cloud.style.left=u.cloud.x+'px';cloud.style.top=u.cloud.y+'px';};
  if(u.cloud)place(u.cloud.x,u.cloud.y);
  on(cloud,'pointerdown',e=>{if(e.button>0)return;e.preventDefault();e.stopPropagation();capture(cloud,e.pointerId);const c=cloud.getBoundingClientRect();drag={id:e.pointerId,dx:e.clientX-c.left,dy:e.clientY-c.top};cloud.classList.add('dragging');});
  on(cloud,'pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;e.preventDefault();const f=field.getBoundingClientRect();place(e.clientX-f.left-drag.dx,e.clientY-f.top-drag.dy);
   const c=cloud.getBoundingClientRect(),cx=c.left+c.width/2,box=zones.find(b=>{const r=b.getBoundingClientRect();return cx>=r.left&&cx<=r.right&&c.bottom<r.bottom;});
   cloud.classList.toggle('raining',!!box);if(box){box.classList.add('wet');visited.add(box);}});
  const end=e=>{if(!drag||e.pointerId!==drag.id)return;drag=null;cloud.classList.remove('dragging');
   if(visited.size===zones.length&&e.type==='pointerup'){cloud.classList.add('raining');return later(()=>onAction('field-garden-rain',''),RAIN_SETTLE_MS);}
   cloud.classList.remove('raining');if(visited.size&&e.type==='pointerup')say(`아직 ${zones.length-visited.size}곳에 비가 안 왔어. 세 자리 위를 모두 지나가게 끌어 봐.`);};
  on(cloud,'pointerup',end);on(cloud,'pointercancel',end);
 }
 return ()=>{timers.forEach(clearTimeout);offs.forEach(off=>off());document.querySelectorAll('.garden-ghost').forEach(g=>g.remove());};
}
