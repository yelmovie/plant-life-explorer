// Field mission 3 by hand. Tap to compare; pressing a floating model is optional play.
// Step 1: push a switch up/down to predict.
// Step 2: tap each model into the tank; optionally push the floating one down and release it.
// Step 3: slice the petiole open (its air rooms bubble by themselves), pick the matching model.
const HOLD_MS=1300,SINK_MS=1800;
// Cut axis of the petiole picture (bottom-left end to top-right end), in picture fractions.
const AXIS=[[.21,.875],[.89,.125]],CUT_BINS=20,CUT_NEED=.7;
const HINT={reason:'공기 방을 봤지? 같은 원리로 떠 있던 모형을 수조에서 <b>톡</b> 눌러 봐.'};

export function mountFloatHands(root,ui,onAction){
 const lab=root?.querySelector('.float-lab');if(!lab)return ()=>{};
 const u=ui.fieldMission??={},offs=[],timers=[];
 const cleanup=()=>{timers.forEach(clearTimeout);offs.forEach(off=>off());};
 const on=(el,type,fn,opt)=>{el.addEventListener(type,fn,opt);offs.push(()=>el.removeEventListener(type,fn,opt));};
 const later=(fn,ms)=>timers.push(setTimeout(fn,ms));
 const tank=root.querySelector('[data-float-tank]'),say=tank?.querySelector('.float-say');
 const speak=text=>{if(!say)return;say.textContent=text;say.classList.remove('show');void say.offsetWidth;say.classList.add('show');};
 const hint=html=>{const h=root.querySelector('.float-hint > span');if(h)h.innerHTML=html;};
 const nudge=el=>{if(!el)return;el.classList.remove('nope');void el.offsetWidth;el.classList.add('nope');};
 const ripple=x=>{const i=document.createElement('i');i.className='float-ripple';i.style.left=x*100+'%';tank.append(i);later(()=>i.remove(),900);};
 const xOf=el=>parseFloat(el.style.getPropertyValue('--x'))||.5;

 // Press-and-hold with a 0..1 progress that fills over HOLD_MS while the finger stays down.
 const press=(el,h)=>{let d=null,raf=0;
  const loop=t=>{if(!d)return;h.tick?.(Math.min(1,(t-d.t)/HOLD_MS));raf=requestAnimationFrame(loop);};
  on(el,'pointerdown',e=>{if(e.button>0||d||h.can?.()===false)return;e.preventDefault();e.stopPropagation();d={id:e.pointerId,t:performance.now()};el.setPointerCapture?.(e.pointerId);h.start?.();raf=requestAnimationFrame(loop);});
  const end=e=>{if(!d||e.pointerId!==d.id)return;const p=Math.min(1,(performance.now()-d.t)/HOLD_MS);d=null;cancelAnimationFrame(raf);h.end(p,e.type==='pointercancel');};
  on(el,'pointerup',end);on(el,'pointercancel',end);offs.push(()=>cancelAnimationFrame(raf));
 };

 // Step 1: predict with a vertical switch (slide the knob or tap a label).
 root.querySelectorAll('[data-heft]:not([data-done])').forEach(card=>{
  const id=card.dataset.heft,word=card.querySelector('.heft-word'),sw=card.querySelector('[data-heft-switch]'),knob=sw.querySelector('.sw-knob'),track=sw.querySelector('.sw-track');
  const choose=r=>{knob.style.transform='';
   sw.classList.add('set-'+r);word.textContent='딸깍! 예상을 남겼어';later(()=>onAction('field-place',`model:${id}|predict:${r}`),320);};
  let d=null;
  on(knob,'pointerdown',e=>{if(e.button>0)return;e.preventDefault();e.stopPropagation();d={id:e.pointerId,y:e.clientY,dy:0,half:1};knob.setPointerCapture?.(e.pointerId);knob.classList.add('held');});
  on(knob,'pointermove',e=>{if(!d||e.pointerId!==d.id)return;d.half=(track.clientHeight-knob.offsetHeight)/2;d.dy=Math.max(-d.half,Math.min(d.half,e.clientY-d.y));knob.style.transform=`translateY(${d.dy}px)`;});
  const up=e=>{if(!d||e.pointerId!==d.id)return;const {dy,half}=d;d=null;knob.classList.remove('held');if(e.type!=='pointercancel'&&Math.abs(dy)>half*.55)choose(dy<0?'float':'sink');else knob.style.transform='';};
  on(knob,'pointerup',up);on(knob,'pointercancel',up);
  sw.querySelectorAll('[data-heft-pick]').forEach(l=>on(l,'click',()=>choose(l.dataset.heftPick)));
 });

 if(!tank)return cleanup;
 const stage3=!!lab.dataset.phase;

 // Step 2: push a model under and hold. Air fights back; the filled one is already on the bottom.
 const gauge=root.querySelector('[data-press-gauge]');
 const pushable=(m,id)=>{let full=false;
  press(m,{
   can:()=>!m.classList.contains('settling'),
   start:()=>{full=false;m.classList.remove('pop');m.classList.add('pushing');gauge?.classList.add('on');if(id==='solid')speak('이미 바닥이라 더 내려가지 않아. 누르지 않아도 가라앉아 있네.');},
   tick:p=>{gauge?.style.setProperty('--p',id==='air'?p:p*.12);if(id!=='air')return;
    m.style.transform=`translateY(${p*tank.clientHeight*.36}px)`;m.style.setProperty('--shake',p);
    if(p>=1&&!full){full=true;gauge?.classList.add('full');speak('물이 위로 밀어 올려! 손이 떨려!');}},
   end:p=>{m.classList.remove('pushing');gauge?.classList.remove('on','full');gauge?.style.setProperty('--p',0);if(id!=='air')return;
    m.style.removeProperty('--shake');m.classList.add('settling','pop');m.style.transform='';later(()=>m.classList.remove('settling'),950);later(()=>ripple(xOf(m)),300);
    speak(p>=1?'놓자마자 퐁! 다시 떠올랐어.':'꾹 눌러도 손을 떼면 다시 떠오르네.');}
  });
 };
 if(!stage3){
  const dropped=u.floatDrop;delete u.floatDrop;
  tank.querySelectorAll('[data-tank-model]').forEach(m=>{
   const id=m.dataset.tankModel;pushable(m,id);
   if(id!==dropped)return;
   // The trial is already saved. This animation can be cancelled without losing the observation.
   const to=m.getBoundingClientRect(),top=tank.getBoundingClientRect().top;
   m.style.transform=`translateY(${top-to.top-to.height}px)`;void m.offsetWidth;
   m.classList.add('settling');m.style.transform='';later(()=>ripple(xOf(m)),220);
   later(()=>m.classList.remove('settling'),id==='air'?950:SINK_MS);
   speak(id==='air'?'둥실! 물 위에 떴어. 더 살펴보려면 꾹 눌렀다 놓아 봐.':'손을 대지 않아도 스르르 가라앉네…');
  });
 }

 // A tap records the trial just like the keyboard path. Holding is never a completion gate.
 let busy=false;
 root.querySelectorAll('[data-float-item]').forEach(el=>{
  const id=el.dataset.floatItem;
  on(el,'click',()=>{
   if(busy)return;
   // No prediction yet: the state's feedback asks for one first.
   if(el.dataset.ready!=='true')return onAction('field-place',`model:${id}|tank`);
   busy=true;u.floatX={...u.floatX,[id]:id==='air'?.32:.68};u.floatDrop=id;
   onAction('field-place',`model:${id}|tank`);
  });
 });

 if(!stage3)return cleanup;

 // Step 3a: before the cut a tank model only nudges the petiole; after it, tapping one links it.
 const models=[...tank.querySelectorAll('[data-tank-model]')],pet=root.querySelector('[data-petiole]');
 models.forEach(m=>on(m,'click',()=>{
  const id=m.dataset.tankModel,phase=lab.dataset.phase;
  if(phase==='reason'){m.classList.add('picked');later(()=>onAction('field-place',`reason:air-space|reason:${id}`),450);}
  else if(phase==='cut')nudge(pet);
 }));
 if(!pet)return cleanup;

 const bubble=r=>{for(let i=0;i<5;i++){const b=document.createElement('i');b.className='air-bubble';b.style.cssText=`left:${r.style.left};top:${r.style.top};--dx:${(Math.random()*40-20).toFixed(0)}px;--s:${(.6+Math.random()*.8).toFixed(2)};animation-delay:${i*90}ms`;pet.append(b);later(()=>b.remove(),1800);}r.classList.remove('popped');void r.offsetWidth;r.classList.add('popped');};
 // Step 3b: slice along the petiole; the skin opens once most of its length is traced.
 const count=root.querySelector('.petiole-count'),trail=pet.querySelector('.cut-trail polyline');
 if(lab.dataset.phase==='cut'){
  let d=null;const seen=new Set(),[[ax,ay],[bx,by]]=AXIS,vx=bx-ax,vy=by-ay,len2=vx*vx+vy*vy;
  const norm=e=>{const r=pet.getBoundingClientRect();return [(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height];};
  on(pet,'pointerdown',e=>{if(e.button>0||pet.classList.contains('open'))return;e.preventDefault();d={id:e.pointerId,pts:[]};pet.setPointerCapture?.(e.pointerId);pet.classList.add('cutting');});
  on(pet,'pointermove',e=>{if(!d||e.pointerId!==d.id)return;const [x,y]=norm(e),t=((x-ax)*vx+(y-ay)*vy)/len2,dist=Math.hypot(x-(ax+t*vx),y-(ay+t*vy));
   d.pts.push(`${x.toFixed(3)},${y.toFixed(3)}`);trail.setAttribute('points',d.pts.slice(-60).join(' '));
   if(dist<.13&&t>=0&&t<=1)seen.add(Math.floor(t*CUT_BINS));
   if(seen.size/CUT_BINS<CUT_NEED)return;
   d=null;u.floatCut=true;pet.classList.remove('cutting');pet.classList.add('open','just-open');trail.setAttribute('points','');
   count.textContent='공기 방이 가득해! 톡 누르면 뽀글';speak('짠! 잎자루 속 빈 방에서 공기가 뽀글뽀글 나와!');
   pet.querySelectorAll('[data-air-room]').forEach((r,i)=>later(()=>bubble(r),250+i*120));
   later(()=>{lab.dataset.phase='reason';pet.dataset.petiole='reason';hint(HINT.reason);tank.classList.add('choose');},1400);});
  const up=e=>{if(!d||e.pointerId!==d.id)return;d=null;pet.classList.remove('cutting');trail.setAttribute('points','');if(seen.size)speak('잎자루를 따라 끝까지 쓱 그어 봐.');};
  on(pet,'pointerup',up);on(pet,'pointercancel',up);
 }

 // Once open, any air room can still be tapped for another stream of bubbles.
 pet.querySelectorAll('[data-air-room]').forEach(r=>on(r,'pointerdown',e=>{
  if(!pet.classList.contains('open'))return;e.stopPropagation();bubble(r);speak('뽀글뽀글! 공기가 나와.');
 }));

 return cleanup;
}
