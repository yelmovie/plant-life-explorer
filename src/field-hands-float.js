// Field mission 3 by hand: drop the models into one tank, push them under and let go,
// then carry them out of the water onto the observation record.
const SETTLE_MS={air:950,solid:1800};

export function mountFloatHands(root,ui,onAction){
 const tank=root?.querySelector('[data-float-tank]');if(!tank)return ()=>{};
 const u=ui.fieldMission??={},say=tank.querySelector('.float-say'),offs=[],timers=[];
 let busy=false;
 const on=(el,type,fn,opt)=>{el.addEventListener(type,fn,opt);offs.push(()=>el.removeEventListener(type,fn,opt));};
 const later=(fn,ms)=>timers.push(setTimeout(fn,ms));
 const within=(el,x,y)=>{const r=el.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;};
 const tankX=cx=>{const r=tank.getBoundingClientRect();return Math.min(.86,Math.max(.14,(cx-r.left)/r.width));};
 const ripple=x=>{const i=document.createElement('i');i.className='float-ripple';i.style.left=x*100+'%';tank.append(i);later(()=>i.remove(),900);};
 const speak=text=>{say.textContent=text;say.classList.remove('show');void say.offsetWidth;say.classList.add('show');};
 // Let go: the water carries the model back to its resting place (surface or bottom).
 // left and transform share one easing, so moving --x to the release point cancels out sideways.
 const settle=(el,id,x)=>{el.classList.remove('held');el.classList.add('settling');el.style.setProperty('--x',x);u.floatX={...u.floatX,[id]:x};el.style.transform='';later(()=>el.classList.remove('settling'),SETTLE_MS[id]);};
 const hold=(el,move,drop)=>{let d=null;
  on(el,'pointerdown',e=>{if(e.button>0||busy||el.classList.contains('settling'))return;e.preventDefault();e.stopPropagation();d={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};el.setPointerCapture?.(e.pointerId);});
  on(el,'pointermove',e=>{if(!d||e.pointerId!==d.id)return;e.preventDefault();const dx=e.clientX-d.x,dy=e.clientY-d.y;if(!d.moved&&Math.hypot(dx,dy)<6)return;d.moved=true;el.classList.add('held');el.style.transform=`translate(${dx}px,${dy}px)`;move(e);});
  const end=e=>{if(!d||e.pointerId!==d.id)return;const {moved,y}=d;d=null;if(moved)el.dataset.dragged='1';drop(e,moved,e.clientY-y,e.type==='pointercancel');};
  on(el,'pointerup',end);on(el,'pointercancel',end);
  // A drag must not also count as a tap on the same element.
  on(el,'click',e=>{if(!el.dataset.dragged)return;delete el.dataset.dragged;e.preventDefault();e.stopPropagation();},true);
 };
 const binAt=e=>{const b=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-field-drop^="observe:"]');return b&&root.contains(b)?b:null;};
 const mark=e=>{const b=binAt(e);root.querySelectorAll('[data-field-drop^="observe:"]').forEach(x=>x.classList.toggle('field-drag-over',x===b));};

 // Models already in the water: push one under (or lift it) and let go.
 tank.querySelectorAll('[data-tank-model]').forEach(el=>{
  const id=el.dataset.tankModel;
  hold(el,mark,(e,moved,dy,cancelled)=>{
   root.querySelectorAll('.field-drag-over').forEach(x=>x.classList.remove('field-drag-over'));
   if(!moved)return;
   const bin=cancelled?null:binAt(e),inTank=!cancelled&&within(tank,e.clientX,e.clientY),r=el.getBoundingClientRect();
   const x=inTank?tankX(r.left+r.width/2):parseFloat(el.style.getPropertyValue('--x'))||.5;
   if(inTank&&id==='air'&&dy>20){speak('손을 떼니 다시 수면으로 떠올랐어!');later(()=>ripple(x),380);}
   if(inTank&&id==='solid'&&dy<-20)speak('놓으니 다시 바닥으로 가라앉았어.');
   settle(el,id,x);
   if(bin)onAction('field-place',`model:${id}|${bin.dataset.fieldDrop}`);
  });
 });

 // Models still on the bench: carry one over the water and let go (a tap drops it in too).
 root.querySelectorAll('[data-float-item]').forEach(el=>{
  const id=el.dataset.floatItem,img=el.querySelector('img');
  hold(el,e=>tank.classList.toggle('drop-ready',within(tank,e.clientX,e.clientY)),(e,moved,dy,cancelled)=>{
   tank.classList.remove('drop-ready');
   if(cancelled||moved&&!within(tank,e.clientX,e.clientY)){el.classList.remove('held');el.classList.add('settling');el.style.transform='';later(()=>el.classList.remove('settling'),400);return;}
   // No prediction yet: the state's feedback asks for one first.
   if(el.dataset.ready!=='true'){el.classList.remove('held');el.style.transform='';onAction('field-place',`model:${id}|tank`);return;}
   const from=img.getBoundingClientRect(),x=moved?tankX(from.left+from.width/2):(id==='air'?.32:.68);
   const m=document.createElement('div');m.className=`float-model in-tank rest-${id}`;m.style.setProperty('--x',x);m.append(img.cloneNode());tank.append(m);
   const to=m.getBoundingClientRect(),top=tank.getBoundingClientRect().top;
   m.style.transform=moved?`translate(${from.left-to.left}px,${from.top-to.top}px)`:`translateY(${top-to.top-to.height}px)`;
   el.style.visibility='hidden';busy=true;void m.offsetWidth;
   settle(m,id,x);later(()=>ripple(x),220);
   later(()=>onAction('field-place',`model:${id}|tank`),SETTLE_MS[id]+150);
  });
 });
 return ()=>{timers.forEach(clearTimeout);offs.forEach(off=>off());};
}
