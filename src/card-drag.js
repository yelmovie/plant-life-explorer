import {playDragSound} from './audio.js';

// One drag path for mouse, pen and fingers: [data-drag] cards onto [data-drop] targets.
// The card lifts and leans with the hand, is pulled toward a nearby box, then drops in or springs home.
const still=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const buzz=ms=>{try{navigator.vibrate?.(ms);}catch{/* Vibration is optional. */}};
let hold=null,quietUntil=0;

export function installCardDrag(onDrop){
 document.addEventListener('pointerdown',e=>{
  if(hold||e.button!==0)return;const el=e.target.closest('[data-drag]');if(!el)return;
  hold={el,id:el.dataset.drag,pointer:e.pointerId,x:e.clientX,y:e.clientY,lifted:false};
 });
 document.addEventListener('pointermove',e=>{
  if(!hold||e.pointerId!==hold.pointer)return;
  if(!hold.lifted){if(Math.hypot(e.clientX-hold.x,e.clientY-hold.y)<7)return;lift(e);}
  e.preventDefault();hold.px=e.clientX;hold.py=e.clientY;
 },{passive:false});
 document.addEventListener('pointerup',e=>{if(hold?.pointer===e.pointerId)release(true,onDrop);});
 document.addEventListener('pointercancel',e=>{if(hold?.pointer===e.pointerId)release(false,onDrop);});
 // The click that ends a drag must not also select or assign.
 document.addEventListener('click',e=>{if(performance.now()<quietUntil){e.stopPropagation();e.preventDefault();}},true);
}

// The floating copy lives on <body>, so it carries its own resolved styles.
function copyLook(from,to){
 const a=[from,...from.querySelectorAll('*')],b=[to,...to.querySelectorAll('*')];
 a.forEach((n,i)=>{const cs=getComputedStyle(n);let css='';for(const k of cs)css+=`${k}:${cs.getPropertyValue(k)};`;b[i].style.cssText=css;});
}
function lift(e){
 const {el}=hold,r=el.getBoundingClientRect(),ghost=el.cloneNode(true);
 copyLook(el,ghost);
 for(const k of ['id','data-action','data-drag','data-id'])ghost.removeAttribute(k);
 ghost.setAttribute('aria-hidden','true');ghost.classList.add('card-float');
 const dx=e.clientX-r.left,dy=e.clientY-r.top;
 Object.assign(ghost.style,{position:'fixed',left:'0',top:'0',width:`${r.width}px`,height:`${r.height}px`,margin:'0',zIndex:'80',pointerEvents:'none',transition:'none',animation:'none',transformOrigin:`${dx}px ${dy}px`,transform:`translate3d(${r.left}px,${r.top}px,0)`,boxShadow:'0 24px 40px #2a3a1e47,0 6px 0 #d6cdb1',cursor:'grabbing'});
 document.body.append(ghost);
 Object.assign(hold,{lifted:true,ghost,home:r,dx,dy,px:e.clientX,py:e.clientY,cx:r.left,cy:r.top,lastX:e.clientX,tilt:0,scale:1,over:null,placed:!el.closest('[data-drop="tray"]')});
 el.classList.remove('just-placed');el.classList.add('drag-origin');document.body.classList.add('card-dragging');
 playDragSound('lift');buzz(10);
 hold.frame=requestAnimationFrame(step);
}
// A box counts when the finger is inside it or just outside (forgiving for small hands).
function target(h){
 let best=null,dist=Infinity;
 for(const el of document.querySelectorAll('[data-drop]')){
  if(el.dataset.drop==='tray'?!h.placed:el.contains(h.el))continue;
  const r=el.getBoundingClientRect(),pad=28;
  if(h.px<r.left-pad||h.px>r.right+pad||h.py<r.top-pad||h.py>r.bottom+pad)continue;
  const d=Math.hypot(h.px-(r.left+r.width/2),h.py-(r.top+r.height/2));if(d<dist){dist=d;best=el;}
 }
 return best;
}
function step(){
 const h=hold;if(!h?.ghost)return;
 const w=h.home.width,ht=h.home.height,calm=still();
 let tx=h.px-h.dx,ty=h.py-h.dy;
 const over=target(h);
 if(over!==h.over){h.over?.classList.remove('drop-ready');over?.classList.add('drop-ready');h.over=over;if(over)buzz(6);}
 if(over){const b=over.getBoundingClientRect();tx+=(b.left+b.width/2-w/2-tx)*.2;ty+=(b.top+b.height/2-ht/2-ty)*.2;}
 const k=calm?1:.36;h.cx+=(tx-h.cx)*k;h.cy+=(ty-h.cy)*k;
 const vx=h.px-h.lastX;h.lastX=h.px;
 h.tilt+=((calm?0:Math.max(-14,Math.min(14,vx*1.2)))-h.tilt)*.18;
 h.scale+=((over?.dataset.drop==='group'?.9:1.07)-h.scale)*.22;
 h.ghost.style.transform=`translate3d(${h.cx}px,${h.cy}px,0) rotate(${h.tilt}deg) scale(${h.scale})`;
 h.frame=requestAnimationFrame(step);
}
function fly(h,x,y,scale,opacity,easing,duration){
 if(!duration)return Promise.resolve();
 const moving=h.ghost.animate([{transform:h.ghost.style.transform,opacity:1},{transform:`translate3d(${x}px,${y}px,0) rotate(0deg) scale(${scale})`,opacity}],{duration,easing,fill:'forwards'}).finished.catch(()=>{});
 // A paused timeline (hidden tab) must never hold the drop back.
 return Promise.race([moving,new Promise(r=>setTimeout(r,duration+200))]);
}
function release(dropped,onDrop){
 const h=hold;hold=null;if(!h.lifted)return;
 cancelAnimationFrame(h.frame);quietUntil=performance.now()+350;
 document.body.classList.remove('card-dragging');h.over?.classList.remove('drop-ready');
 // Decide from the final finger position, not the last animation frame.
 const done=()=>{h.ghost.remove();h.el.classList.remove('drag-origin');},calm=still(),bin=dropped&&target(h);
 if(!bin){
  playDragSound('back');const r=h.el.isConnected?h.el.getBoundingClientRect():h.home;
  fly(h,r.left,r.top,1,1,'cubic-bezier(.34,1.56,.64,1)',calm?0:430).then(done);return;
 }
 playDragSound('drop');buzz(18);
 const slot=(bin.querySelector('.bin-slots,.classify-leaves')||bin).getBoundingClientRect();
 fly(h,slot.left+slot.width/2-h.home.width/2,slot.top+slot.height/2-h.home.height/2,.5,.25,'cubic-bezier(.55,0,.8,.45)',calm?0:240).then(()=>{done();onDrop(h.id,bin);});
}

// After a card lands, its new copy pops in, the box bounces, and leaf bits scatter.
export function celebrateCard(id){
 const card=document.querySelector(`:is(.sort-bin,.sort-tray) [data-drag="${id}"]`);if(!card)return;
 card.classList.add('just-placed');const bin=card.closest('.sort-bin');
 if(!bin)return;bin.classList.add('just-filled');if(still())return;
 const r=card.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
 for(let i=0;i<10;i++){
  const p=document.createElement('i');p.className='leaf-spark';p.style.background=['#7fb24f','#a9cf6d','#5d9440','#e6c35c'][i%4];p.style.left=`${cx}px`;p.style.top=`${cy}px`;document.body.append(p);
  const a=i/10*Math.PI*2+Math.random()*.5,d=48+Math.random()*44,x=Math.cos(a)*d,y=Math.sin(a)*d-18;
  p.animate([{transform:'translate(-50%,-50%) rotate(0deg) scale(.5)',opacity:1},{transform:`translate(calc(-50% + ${x}px),calc(-50% + ${y}px)) rotate(${(Math.random()-.5)*300}deg) scale(1)`,opacity:0}],{duration:650+Math.random()*250,easing:'cubic-bezier(.2,.7,.3,1)'}).finished.then(()=>p.remove(),()=>p.remove());
 }
}
