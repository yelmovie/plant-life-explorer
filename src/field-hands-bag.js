// Stage 5 by hand, one gesture family per step:
//  0 assemble: tap each numbered place to click the next part in; choosing both assembles the bag.
//  1 compare: tap once for ten drops; the trial is recorded once they have landed.
//  2 explain:  spot-the-difference — draw a circle around the part that differs between the two trials.
// State still changes only through the existing field actions; gesture progress lives in the DOM / ui.fieldMission.
import {bagArt} from './art.js';

// The same rain every trial: which part each drop lands on and where (fraction of bag width).
const RAIN=[['cover',.44],['surface',.16],['surface',.5],['surface',.26],['cover',.56],['surface',.62],['surface',.1],['cover',.5],['surface',.56],['surface',.22]];
const LAND={cover:.22,surface:.46};
const FALL=420,AFTER=600;

export function mountBagHands(root,ui,onAction){
 const offs=[],timers=[],animations=new Set();let disposed=false;
 const ctx={root,ui,onAction,
  on:(el,type,fn,opt)=>{el.addEventListener(type,fn,opt);offs.push(()=>el.removeEventListener(type,fn,opt));},
  later:(fn,ms)=>{if(!disposed)timers.push(setTimeout(()=>{if(!disposed)fn();},ms));},
  animate:(el,frames,options,done)=>{if(disposed)return;const animation=el.animate(frames,options);animations.add(animation);animation.onfinish=()=>{if(!disposed)done?.();};},
  calm:matchMedia('(prefers-reduced-motion: reduce)').matches,
  say:text=>{const el=root.querySelector('[data-bag-say]');if(el)el.textContent=text;}};
 const frame=root.querySelector('[data-bag-frame]');
 root.querySelectorAll('[data-bag-dial]').forEach(d=>mountDial(d,ctx,frame));
 const sky=root.querySelector('[data-bag-stage][data-rain]');
 if(sky)mountRain(sky,ctx);
 root.querySelectorAll('[data-diff]').forEach(box=>mountCircle(box,ctx));
 return ()=>{disposed=true;offs.forEach(off=>off());timers.forEach(clearTimeout);animations.forEach(animation=>{animation.onfinish=null;animation.cancel();});animations.clear();};
}

const fieldMission=ui=>ui.fieldMission??={};
const replay=(el,cls)=>{el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);};

// Tap dial. While assembling (frame present) the choice stays local until both places are chosen;
// while testing it swaps the part right away so the next rain compares one change.
function mountDial(dial,{ui,onAction,on,later,say},frame){
 const part=dial.dataset.bagDial,values=dial.dataset.values.split('|'),labels=dial.dataset.labels.split('|');
 on(dial,'click',e=>{
  e.preventDefault();if(dial.closest('.locked'))return;
  const next=values[(values.indexOf(dial.dataset.value)+1)%values.length];
  if(!frame)return onAction('field-place',`part:${part}:${next}|part:${part}`);
  const u=fieldMission(ui);u.bagDial={...u.bagDial,[part]:next};
  dial.dataset.value=next;dial.classList.add('set');dial.querySelector('span').textContent=labels[values.indexOf(next)];replay(dial,'turn');
  const canvas=dial.closest('[data-bag-canvas]'),dials=[...canvas.querySelectorAll('[data-bag-dial]')],design={};
  dials.forEach(d=>{design[d.dataset.bagDial]=d.dataset.value||d.dataset.values.split('|')[0];});
  canvas.querySelector('.bag-art').outerHTML=bagArt(design);
  if(!dials.every(d=>d.dataset.value))return say('나머지 자리도 톡 눌러 골라 줘.');
  // Each action re-renders the mission, so the parts are sent together once the click settles.
  frame.classList.add('sewn','just-sewn');say('딸깍! 가방 조립 완료!');
  later(()=>{u.bagDial=null;dials.forEach(d=>onAction('field-place',`part:${d.dataset.bagDial}:${d.dataset.value}|part:${d.dataset.bagDial}`));},450);
 });
}

// Rain by taps; the trial is recorded once every drop has landed.
function mountRain(stage,{onAction,on,later,animate,calm,say}){
 const cloud=stage.querySelector('[data-bag-cloud]'),canvas=stage.querySelector('[data-bag-canvas]'),count=stage.querySelector('[data-rain-count]');
 const art=canvas.querySelector('.bag-art'),lotus=art.classList.contains('lotus-surface'),k=calm?.2:1;
 let n=0,landed=0,phase='rain';
 const box=el=>{const s=stage.getBoundingClientRect(),r=el.getBoundingClientRect();return {x:r.left-s.left,y:r.top-s.top,w:r.width,h:r.height};};
 const outcome=part=>part==='surface'?(lotus?'bead':'stain'):art.classList.contains('with-cover')?'roll':'enter';
 const rest=(kind,fx,fy)=>{const el=document.createElement('i');el.className='bag-wet '+kind;el.style.left=fx*100+'%';el.style.top=fy*100+'%';canvas.append(el);};
 const drop=(i,beat)=>{
  const [part,fx]=RAIN[i],kind=outcome(part),el=document.createElement('i'),c=box(cloud),b=box(canvas);
  el.className='rain-drop'+(beat?' beat':'');stage.append(el);
  const x=b.x+fx*b.w,y0=c.y+c.h*.7,y1=b.y+LAND[part]*b.h,dir=fx<.4?-1:1,at=(dx,dy,s='')=>`translate(${x+dx}px,${y1+dy}px) ${s}`;
  animate(el,[{transform:`translate(${x}px,${y0}px)`},{transform:at(0,0)}],{duration:FALL*k,easing:'ease-in',fill:'forwards'},()=>{
   if(kind==='bead'||kind==='stain'){el.remove();rest(kind,fx,LAND[part]);}
   else{el.classList.add(kind);animate(el,kind==='roll'?[{transform:at(0,0,'scale(1.1,.9)')},{transform:at(dir*b.w*.14,b.h*.04),offset:.45},{transform:at(dir*b.w*.24,b.h*.5),opacity:0}]:[{transform:at(0,0)},{transform:at(0,b.h*.12,'scale(.4)'),opacity:0}],{duration:AFTER*k,easing:'ease-out',fill:'forwards'});}
   if(++landed===RAIN.length)later(finish,AFTER*k);
  });
 };
 const finish=()=>{phase='done';say(lotus?'물방울이 동글동글 맺혀 굴러가!':'겉면에 젖은 얼룩이 남았어.');later(()=>onAction('field-bag-test',''),900*k+200);};
 on(cloud,'pointerdown',e=>{
  if(e.button>0)return;e.preventDefault();e.stopPropagation();
  // Nothing new to test: the state feedback explains why (same design, or not assembled).
  if(stage.dataset.rain!=='go')return onAction('field-bag-test','');
  if(phase!=='rain'||n>=RAIN.length)return;
  phase='falling';stage.classList.add('locked');replay(cloud,'puff');
  say('같은 비 10방울이 내려! 물이 어디로 가는지 봐.');
  RAIN.forEach((_,i)=>later(()=>{drop(n++,false);count.innerHTML=`<b>${n}</b>/10`;replay(count,'pop');},i*120*k));
 });
}

// Spot the difference: a closed loop drawn on either trial picture picks the nearest numbered part.
function mountCircle(box,{root,ui,onAction,on,later,say}){
 const live=box.querySelector('[data-diff-ink] .live'),spots=box.dataset.spots.split(',').map(s=>{const [p,x,y]=s.split(':');return [p,+x,+y];});
 let pts=null,id=null;
 const at=e=>{const r=box.getBoundingClientRect();return [Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))];};
 const draw=p=>live.setAttribute('d',p.length?'M'+p.map(([x,y])=>`${(x*100).toFixed(1)} ${(y*100).toFixed(1)}`).join('L'):'');
 on(box,'pointerdown',e=>{if(e.button>0)return;e.preventDefault();id=e.pointerId;box.setPointerCapture?.(id);pts=[at(e)];root.querySelectorAll('[data-diff-ink] .saved').forEach(p=>p.remove());live.classList.remove('fade','closed');draw(pts);});
 on(box,'pointermove',e=>{if(!pts||e.pointerId!==id)return;e.preventDefault();pts.push(at(e));draw(pts);});
 const end=e=>{
  if(!pts||e.pointerId!==id)return;const p=pts;pts=null;id=null;
  if(e.type!=='pointerup')return draw([]);
  const r=box.getBoundingClientRect(),xs=p.map(q=>q[0]*r.width),ys=p.map(q=>q[1]*r.height),w=Math.max(...xs)-Math.min(...xs),h=Math.max(...ys)-Math.min(...ys);
  const gap=Math.hypot(xs[0]-xs.at(-1),ys[0]-ys.at(-1));
  if(p.length<8||w<36||h<28||gap>Math.max(w,h)*.55){live.classList.add('fade');say('다른 곳 하나를 빙 둘러 동그라미를 그려 줘.');later(()=>draw([]),450);return;}
  const cx=p.reduce((a,q)=>a+q[0],0)/p.length,cy=p.reduce((a,q)=>a+q[1],0)/p.length;
  // Canvas is 3:2, so a vertical fraction counts 2/3 as much distance.
  const dist=s=>Math.hypot(s[1]-cx,(s[2]-cy)*2/3),part=spots.reduce((a,s)=>dist(s)<dist(a)?s:a)[0];
  live.classList.add('closed');
  const step=Math.ceil(p.length/60);
  fieldMission(ui).bagCircle={key:box.dataset.key,side:box.dataset.diff,part,pts:p.filter((_,i)=>i%step===0).concat([p[0]]).map(([x,y])=>[+x.toFixed(3),+y.toFixed(3)])};
  later(()=>onAction('field-place',`compare:${part}|compare`),260);
 };
 on(box,'pointerup',end);on(box,'pointercancel',end);
}
