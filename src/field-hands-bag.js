// Stage 5 by hand: drag a rain cloud over the bag for the same ten drops every time,
// then stick the "after" result card onto the part that was changed.
// Parts themselves are dragged by the shared field-token drag in field-missions.js.

// The same rain every trial: which part each drop lands on and where (fraction of bag width).
const RAIN=[['cover',.44],['surface',.16],['pocket',.5],['surface',.26],['cover',.56],['pocket',.62],['surface',.1],['cover',.5],['pocket',.56],['surface',.22]];
const LAND={cover:.22,surface:.46,pocket:.5};
const GAP=170,FALL=420,AFTER=700;

export function mountBagHands(root,ui,onAction){
 const offs=[],timers=[];let ghost=null;
 const on=(el,type,fn)=>{el.addEventListener(type,fn);offs.push(()=>el.removeEventListener(type,fn));};
 const later=(fn,ms)=>timers.push(setTimeout(fn,ms));
 const stage=root.querySelector('[data-bag-stage][data-rain]');
 if(stage)mountRain(stage,on,later,onAction);
 const card=root.querySelector('[data-bag-result]');
 if(card)mountStick(root,card,on,onAction,g=>{ghost=g;});
 return ()=>{offs.forEach(off=>off());timers.forEach(clearTimeout);ghost?.remove();};
}

function mountRain(stage,on,later,onAction){
 const cloud=stage.querySelector('[data-bag-cloud]'),canvas=stage.querySelector('[data-bag-canvas]'),count=stage.querySelector('[data-rain-count]'),art=canvas.querySelector('.bag-art');
 const slow=matchMedia('(prefers-reduced-motion: reduce)').matches?.15:1;
 let drag=null,raining=false,done=false,fired=false;
 const box=el=>{const s=stage.getBoundingClientRect(),r=el.getBoundingClientRect();return {x:r.left-s.left,y:r.top-s.top,w:r.width,h:r.height};};
 // Fire only once the hand is off the cloud: the action re-renders the whole mission.
 const fire=()=>{if(fired||drag||!done)return;fired=true;onAction('field-bag-test','');};
 const outcome=part=>part==='surface'?(art.classList.contains('lotus-surface')?'roll':'soak'):(part==='cover'?art.classList.contains('with-cover'):art.dataset.pocket==='flap')?'roll':'enter';
 const drop=(i,c,b)=>{
  const [part,fx]=RAIN[i],kind=outcome(part),el=document.createElement('i');el.className='rain-drop';stage.append(el);
  const x=b.x+fx*b.w,y0=c.y+c.h*.7,y1=b.y+LAND[part]*b.h,dir=fx<.4?-1:1,at=(dx,dy,s='')=>`translate(${x+dx}px,${y1+dy}px) ${s}`;
  el.animate([{transform:`translate(${x}px,${y0}px)`},{transform:at(0,0)}],{duration:FALL*slow,easing:'ease-in',fill:'forwards'}).onfinish=()=>{
   count.textContent=`비 ${i+1}/10`;
   const end=kind==='roll'?[{transform:at(0,0,'scale(1.1,.9)')},{transform:at(dir*b.w*.14,b.h*.04),offset:.45},{transform:at(dir*b.w*.24,b.h*.5),opacity:0}]
    :kind==='soak'?[{transform:at(0,0)},{transform:at(0,4,'scale(2.4,.55)'),opacity:.75}]
    :[{transform:at(0,0)},{transform:at(0,b.h*.12,'scale(.4)'),opacity:0}];
   el.classList.add(kind);el.animate(end,{duration:AFTER*slow,easing:'ease-out',fill:'forwards'});
  };
 };
 const start=()=>{
  raining=true;cloud.classList.add('raining');stage.classList.add('raining');
  const b=box(canvas);cloud.style.left=b.x+b.w*.36+'px';cloud.style.top=Math.max(0,b.y-cloud.offsetHeight*.75)+'px';
  if(stage.dataset.rain!=='go'){done=true;return fire();}
  count.textContent='비 0/10';
  // Measure after the cloud settles so every drop starts from the same place.
  later(()=>{const c=box(cloud);RAIN.forEach((_,i)=>later(()=>drop(i,c,b),i*GAP*slow));later(()=>{done=true;fire();},(RAIN.length*GAP+FALL+AFTER)*slow);},250*slow);
 };
 const place=(x,y)=>{
  const s=stage.getBoundingClientRect();cloud.style.left=Math.max(0,Math.min(s.width-cloud.offsetWidth,x))+'px';cloud.style.top=Math.max(0,Math.min(s.height-cloud.offsetHeight,y))+'px';
  const c=box(cloud),b=box(canvas),cx=c.x+c.w/2;
  const over=cx>b.x+b.w*.15&&cx<b.x+b.w*.85&&c.y+c.h>b.y-10&&c.y<b.y+b.h*.6;
  cloud.classList.toggle('over',over);if(over)start();
 };
 on(cloud,'pointerdown',e=>{if(e.button>0||raining)return;e.preventDefault();e.stopPropagation();const c=box(cloud),s=stage.getBoundingClientRect();drag={id:e.pointerId,dx:e.clientX-s.left-c.x,dy:e.clientY-s.top-c.y};cloud.setPointerCapture?.(e.pointerId);cloud.classList.add('dragging');});
 on(cloud,'pointermove',e=>{if(!drag||e.pointerId!==drag.id||raining)return;e.preventDefault();const s=stage.getBoundingClientRect();place(e.clientX-s.left-drag.dx,e.clientY-s.top-drag.dy);});
 const up=e=>{if(!drag||e.pointerId!==drag.id)return;drag=null;cloud.classList.remove('dragging');fire();};
 on(cloud,'pointerup',up);on(cloud,'pointercancel',up);
}

function mountStick(root,card,on,onAction,keep){
 const hots=[...root.querySelectorAll('[data-bag-hot]')];let ghost=null,id=null;
 const hit=e=>hots.find(h=>{const r=h.getBoundingClientRect();return e.clientX>=r.left-12&&e.clientX<=r.right+12&&e.clientY>=r.top-12&&e.clientY<=r.bottom+12;});
 const follow=e=>{ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';const h=hit(e);hots.forEach(x=>x.classList.toggle('hover',x===h));};
 on(card,'pointerdown',e=>{if(e.button>0)return;e.preventDefault();e.stopPropagation();id=e.pointerId;card.setPointerCapture?.(id);
  ghost=card.cloneNode(true);ghost.removeAttribute('data-bag-result');ghost.setAttribute('aria-hidden','true');ghost.classList.add('bag-result-ghost');document.body.append(ghost);keep(ghost);
  card.classList.add('lifted');root.querySelector('[data-bag-stage]')?.classList.add('sticking');follow(e);});
 on(card,'pointermove',e=>{if(!ghost||e.pointerId!==id)return;e.preventDefault();follow(e);});
 const end=e=>{if(!ghost||e.pointerId!==id)return;const h=e.type==='pointerup'?hit(e):null;ghost.remove();ghost=null;keep(null);id=null;card.classList.remove('lifted');root.querySelector('[data-bag-stage]')?.classList.remove('sticking');hots.forEach(x=>x.classList.remove('hover'));
  if(h)onAction('field-place',`compare:${h.dataset.bagHot}|compare`);};
 on(card,'pointerup',end);on(card,'pointercancel',end);
}
