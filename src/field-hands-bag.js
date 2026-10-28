// Stage 5 by hand: tap the cloud for ten drops; the trial is recorded once they have landed.
// State still changes only through the field actions; the falling drops live in the DOM.

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
 const sky=root.querySelector('[data-bag-stage][data-rain]');
 if(sky)mountRain(sky,ctx);
 return ()=>{disposed=true;offs.forEach(off=>off());timers.forEach(clearTimeout);animations.forEach(animation=>{animation.onfinish=null;animation.cancel();});animations.clear();};
}

const replay=(el,cls)=>{el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);};

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
