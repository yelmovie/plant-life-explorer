// Stage 5 by hand: tap the cloud for ten drops; the trial is recorded once they have landed.
// Last step: the finished bag on a turntable; one full turn (drag, fling or arrows) unlocks 마무리.
// State still changes only through the field actions; the falling drops live in the DOM.

// The same rain every trial: which part each drop lands on and where (fraction of bag width).
const RAIN=[['cover',.44],['surface',.16],['surface',.5],['surface',.26],['cover',.56],['surface',.62],['surface',.1],['cover',.5],['surface',.56],['surface',.22]];
const LAND={cover:.22,surface:.46};
const FALL=420,AFTER=600;

export function mountBagHands(root,ui,onAction){
 const offs=[],timers=[],animations=new Set();let disposed=false;
 const ctx={root,ui,onAction,
  on:(el,type,fn,opt)=>{el.addEventListener(type,fn,opt);offs.push(()=>el.removeEventListener(type,fn,opt));},
  off:fn=>offs.push(fn),
  later:(fn,ms)=>{if(!disposed)timers.push(setTimeout(()=>{if(!disposed)fn();},ms));},
  animate:(el,frames,options,done)=>{if(disposed)return;const animation=el.animate(frames,options);animations.add(animation);animation.onfinish=()=>{if(!disposed)done?.();};},
  calm:matchMedia('(prefers-reduced-motion: reduce)').matches,
  say:text=>{const el=root.querySelector('[data-bag-say]');if(el)el.textContent=text;}};
 const sky=root.querySelector('[data-bag-stage][data-rain]');
 if(sky)mountRain(sky,ctx);
 const table=root.querySelector('[data-bag-turn]');
 if(table)mountTurn(table,ctx);
 return ()=>{disposed=true;offs.forEach(off=>off());timers.forEach(clearTimeout);animations.forEach(animation=>{animation.onfinish=null;animation.cancel();});animations.clear();};
}

const replay=(el,cls)=>{el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);};

// Rain by taps; the trial is recorded once every drop has landed.
function mountRain(stage,{ui,onAction,on,later,animate,calm,say}){
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
 // 자동 진행 rains the same way a tap on the cloud does.
 // A rain already falling (a bag card started it) counts as under way, so 자동 진행 waits for it instead of recording at once.
 stage.autoRain=()=>{if(phase!=='rain')return true;if(stage.dataset.rain!=='go'||n>=RAIN.length)return false;start();return true;};
 on(cloud,'pointerdown',e=>{
  if(e.button>0)return;e.preventDefault();e.stopPropagation();
  // Nothing new to test: the state feedback explains why (same design, or not assembled).
  if(stage.dataset.rain!=='go')return onAction('field-bag-test','');
  start();
 });
 // A bag card was just tapped: its rain starts by itself once the bag is on the stand.
 const u=ui.fieldMission;if(u?.bagAutoRain){delete u.bagAutoRain;if(stage.dataset.rain==='go')later(()=>stage.autoRain(),450);}
 function start(){
  if(phase!=='rain'||n>=RAIN.length)return;
  phase='falling';stage.classList.add('locked');replay(cloud,'puff');
  say('같은 비 10방울이 내려! 물이 어디로 가는지 봐.');
  RAIN.forEach((_,i)=>later(()=>{drop(n++,false);count.innerHTML=`<b>${n}</b>/10`;replay(count,'pop');},i*120*k));
 }
}

// Turntable: sideways drag turns the bag (a fling keeps it spinning), a tap spins one full turn, the arrows turn a quarter.
// The angle lives in ui so a re-render (the turned feedback) does not snap the bag back.
const DEG_PER_PX=.55,QUARTER=90,FULL=360,SPIN_MS=1100,FRICTION=.0025;
function mountTurn(stage,{ui,onAction,on,off,later,calm,say}){
 const spinner=stage.querySelector('[data-bag-spinner]'),ring=stage.querySelector('[data-turn-ring]'),u=ui.fieldMission??={},k=calm?.25:1;
 let angle=Number(u.bagAngle)||0,total=Number(u.bagTurnTotal)||0,notified=!!u.bagTurned,d=null,raf=0,motion=null,pending=false;
 const show=()=>{stage.style.setProperty('--angle',angle+'deg');stage.style.setProperty('--turn',Math.min(FULL,total)+'deg');
  const rad=angle*Math.PI/180;stage.style.setProperty('--side',Math.abs(Math.sin(rad)).toFixed(3));stage.style.setProperty('--flat',Math.abs(Math.cos(rad)).toFixed(3));};
 // The turned action re-renders the step, so it waits until the finger is up and any spin has settled;
 // the bag first eases back to face the front so the finished screen shows it whole.
 // (pending stays set until the action goes out, so a tap that interrupts the ease-back only postpones it.)
 const dispatch=()=>{pending=false;later(()=>onAction('field-bag-turned',''),200*k);};
 const notify=()=>{if(!pending||motion||d)return;const home=angle>FULL/2?FULL-angle:-angle;
  if(Math.abs(home)<1)return dispatch();
  motion={from:angle,at:angle,by:home,ms:Math.max(16,520*k),p:0,home:true};raf=requestAnimationFrame(frame);};
 const turn=delta=>{if(!delta)return;angle=(angle+delta)%FULL;total+=Math.abs(delta);u.bagAngle=Math.round(angle*10)/10;u.bagTurnTotal=Math.round(total);show();
  if(total>=FULL&&!notified){notified=true;pending=true;stage.classList.add('turned');ring?.classList.add('full');say('한 바퀴 다 봤어!');notify();}};
 // Tweened turn by a set amount (arrows, tap) or a decelerating fling; a new input cancels the one under way.
 const stop=()=>{motion=null;cancelAnimationFrame(raf);};
 const settle=()=>{const home=motion?.home;stop();if(home)dispatch();else notify();};
 off(stop);
 const frame=t=>{if(!motion)return;const m=motion,dt=Math.min(48,t-(m.t||t));m.t=t;
  if(m.v!==undefined){const v0=m.v,sign=Math.sign(v0);m.v=sign*Math.max(0,Math.abs(v0)-FRICTION*dt*Math.abs(v0)*4-.0004*dt);turn(v0*dt);if(Math.abs(m.v)<.01)return settle();}
  else{m.p=Math.min(1,m.p+dt/m.ms);const e=1-Math.pow(1-m.p,3),target=m.from+m.by*e;turn(target-m.at);m.at=target;if(m.p>=1)return settle();}
  raf=requestAnimationFrame(frame);};
 const tween=(by,ms)=>{stop();motion={from:angle,at:angle,by,ms:Math.max(16,ms*k),p:0};raf=requestAnimationFrame(frame);};
 const fling=v=>{stop();motion={v};raf=requestAnimationFrame(frame);};
 show();
 on(spinner,'pointerdown',e=>{if(e.button>0||d)return;e.preventDefault();e.stopPropagation();stop();d={id:e.pointerId,x:e.clientX,t:performance.now(),v:0,moved:false};spinner.setPointerCapture?.(e.pointerId);stage.classList.add('held');});
 on(spinner,'pointermove',e=>{if(!d||e.pointerId!==d.id)return;const dx=e.clientX-d.x,now=performance.now(),dt=now-d.t;if(!d.moved&&Math.abs(dx)<4)return;d.moved=true;
  const delta=dx*DEG_PER_PX;turn(delta);d.v=dt>0?delta/dt:0;d.x=e.clientX;d.t=now;});
 const up=e=>{if(!d||e.pointerId!==d.id)return;const {moved,v,t}=d;d=null;stage.classList.remove('held');
  if(e.type!=='pointercancel'){if(!moved)return tween(FULL,SPIN_MS);if(performance.now()-t<80&&Math.abs(v)>.15)return fling(Math.sign(v)*Math.min(1.6,Math.abs(v)));}
  notify();};
 on(spinner,'pointerup',up);on(spinner,'pointercancel',up);
 stage.querySelectorAll('[data-bag-spin]').forEach(b=>on(b,'click',()=>tween(Number(b.dataset.bagSpin)*QUARTER,420)));
 // 자동 진행 and the keyboard: a full spin by itself.
 stage.autoTurn=()=>{if(notified)return true;tween(FULL,SPIN_MS);return true;};
}
