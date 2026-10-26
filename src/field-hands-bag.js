// Stage 5 by hand, one gesture family per step:
//  0 assemble: tap each numbered place to click the next part in, then trace the dotted seam to sew it.
//  1 compare:  tap the cloud ten times (one drop per tap, on the beat sparkles), then shake the bag side to side.
//  2 explain:  spot-the-difference — draw a circle around the part that differs between the two trials.
// State still changes only through the existing field actions; gesture progress lives in the DOM / ui.fieldMission.
import {bagArt} from './art.js';

// The same rain every trial: which part each drop lands on and where (fraction of bag width).
const RAIN=[['cover',.44],['surface',.16],['pocket',.5],['surface',.26],['cover',.56],['pocket',.62],['surface',.1],['cover',.5],['pocket',.56],['surface',.22]];
const LAND={cover:.22,surface:.46,pocket:.5};
const FALL=420,AFTER=600,BEAT=600,FLIPS=6,STITCHES=32;

export function mountBagHands(root,ui,onAction){
 const offs=[],timers=[];
 const ctx={root,ui,onAction,
  on:(el,type,fn,opt)=>{el.addEventListener(type,fn,opt);offs.push(()=>el.removeEventListener(type,fn,opt));},
  later:(fn,ms)=>timers.push(setTimeout(fn,ms)),
  calm:matchMedia('(prefers-reduced-motion: reduce)').matches,
  say:text=>{const el=root.querySelector('[data-bag-say]');if(el)el.textContent=text;}};
 const frame=root.querySelector('[data-bag-stitch]');
 root.querySelectorAll('[data-bag-dial]').forEach(d=>mountDial(d,ctx,frame));
 if(frame)mountStitch(frame,ctx);
 const sky=root.querySelector('[data-bag-stage][data-rain]');
 if(sky)mountRain(sky,ctx);
 root.querySelectorAll('[data-diff]').forEach(box=>mountCircle(box,ctx));
 return ()=>{offs.forEach(off=>off());timers.forEach(clearTimeout);};
}

const fieldMission=ui=>ui.fieldMission??={};
const replay=(el,cls)=>{el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);};

// Tap dial. While assembling (frame present) the choice stays local until the seam is sewn;
// while testing it swaps the part right away so the next rain compares one change.
function mountDial(dial,{ui,onAction,on,say},frame){
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
  const all=dials.every(d=>d.dataset.value);
  frame.dataset.sewn='false';frame.dataset.ready=String(all);frame.resetSeam?.();
  say(all?'좋아! 이제 둘레 점선을 손가락으로 쭉 따라 그어 꿰매 봐.':'나머지 자리도 톡 눌러 골라 줘.');
 });
}

// Sewing: dotted seam points around the bag; a finger passing near a point stitches it.
function mountStitch(frame,{ui,onAction,on,later,say}){
 const svg=frame.querySelector('[data-stitch-svg]');
 let pts=[],tracing=null,sent=false;
 const build=()=>{
  const w=frame.clientWidth,h=frame.clientHeight,m=13,W=w-2*m,H=h-2*m,per=2*(W+H);
  svg.setAttribute('viewBox',`0 0 ${w} ${h}`);pts=[];
  for(let i=0;i<STITCHES;i++){let d=(i+.5)*per/STITCHES,p;
   if(d<W)p=[m+d,m,1,0];else if((d-=W)<H)p=[m+W,m+d,0,1];else if((d-=H)<W)p=[m+W-d,m+H,1,0];else p=[m,m+H-(d-W),0,1];
   pts.push(p);}
  const sewn=frame.dataset.sewn==='true';
  svg.innerHTML=`<rect class="seam-guide" x="${m}" y="${m}" width="${W}" height="${H}" rx="22"/>`+pts.map(([x,y,dx,dy],i)=>`<line class="seam-stitch ${sewn?'done':''}" data-i="${i}" x1="${x-dx*7}" y1="${y-dy*7}" x2="${x+dx*7}" y2="${y+dy*7}"/>`).join('')+'<circle class="seam-needle" r="9" cx="-40" cy="-40"/>';
 };
 frame.resetSeam=()=>{frame.classList.remove('just-sewn');build();};
 const stitch=e=>{
  const r=frame.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,reach=Math.max(28,r.width*.06);
  const needle=svg.querySelector('.seam-needle');needle.setAttribute('cx',x);needle.setAttribute('cy',y);
  pts.forEach(([px,py],i)=>{if(Math.hypot(px-x,py-y)<reach)svg.querySelector(`[data-i="${i}"]`)?.classList.add('done');});
  const done=svg.querySelectorAll('.seam-stitch.done').length;
  if(done>=STITCHES*.9&&frame.dataset.sewn!=='true'){frame.dataset.sewn='true';frame.dataset.ready='false';svg.querySelectorAll('.seam-stitch').forEach(s=>s.classList.add('done'));frame.classList.add('just-sewn');say('꿰맸어! 가방 조립 완료!');}
  else if(frame.dataset.sewn!=='true')say(`꿰매는 중… ${Math.round(done/STITCHES*100)}%`);
 };
 // Fire only after the finger lifts: each action re-renders the mission.
 const send=()=>{if(sent||tracing||frame.dataset.sewn!=='true'||!frame.classList.contains('just-sewn'))return;sent=true;
  later(()=>{const u=fieldMission(ui),dial={};u.bagDial=null;
   frame.querySelectorAll('[data-bag-dial]').forEach(d=>{dial[d.dataset.bagDial]=d.dataset.value;});
   Object.entries(dial).forEach(([part,value])=>value&&onAction('field-place',`part:${part}:${value}|part:${part}`));},450);};
 on(frame,'pointerdown',e=>{
  if(e.button>0||e.target.closest('[data-bag-dial]'))return;
  if(frame.dataset.ready!=='true'){say(frame.dataset.sewn==='true'?'이미 꿰맸어. 부품을 바꾸려면 자리를 톡 눌러.':'①②③ 세 자리를 모두 골라야 꿰맬 수 있어.');return;}
  e.preventDefault();tracing=e.pointerId;frame.setPointerCapture?.(e.pointerId);frame.classList.add('sewing');stitch(e);
 });
 on(frame,'pointermove',e=>{if(tracing!==e.pointerId)return;e.preventDefault();stitch(e);});
 const end=e=>{if(tracing!==e.pointerId)return;tracing=null;frame.classList.remove('sewing');svg.querySelector('.seam-needle')?.setAttribute('cx',-40);send();};
 on(frame,'pointerup',end);on(frame,'pointercancel',end);
 build();on(window,'resize',()=>frame.dataset.sewn==='true'||build());
}

// Rain by taps, then a shake test.
function mountRain(stage,{onAction,on,later,calm,say}){
 const cloud=stage.querySelector('[data-bag-cloud]'),canvas=stage.querySelector('[data-bag-canvas]'),count=stage.querySelector('[data-rain-count]'),meter=stage.querySelector('[data-shake-meter]');
 const art=canvas.querySelector('.bag-art'),lotus=art.classList.contains('lotus-surface'),k=calm?.2:1;
 let n=0,landed=0,lastTap=0,phase='rain',shake=null,flips=0,fired=false;
 const box=el=>{const s=stage.getBoundingClientRect(),r=el.getBoundingClientRect();return {x:r.left-s.left,y:r.top-s.top,w:r.width,h:r.height};};
 const outcome=part=>part==='surface'?(lotus?'bead':'stain'):(part==='cover'?art.classList.contains('with-cover'):art.dataset.pocket==='flap')?'roll':'enter';
 // Water resting on the bag lives inside the canvas so it moves when the bag is shaken.
 const rest=(kind,fx,fy)=>{const el=document.createElement('i');el.className='bag-wet '+kind;el.style.left=fx*100+'%';el.style.top=fy*100+'%';canvas.append(el);};
 const drop=(i,beat)=>{
  const [part,fx]=RAIN[i],kind=outcome(part),el=document.createElement('i'),c=box(cloud),b=box(canvas);
  el.className='rain-drop'+(beat?' beat':'');stage.append(el);
  const x=b.x+fx*b.w,y0=c.y+c.h*.7,y1=b.y+LAND[part]*b.h,dir=fx<.4?-1:1,at=(dx,dy,s='')=>`translate(${x+dx}px,${y1+dy}px) ${s}`;
  el.animate([{transform:`translate(${x}px,${y0}px)`},{transform:at(0,0)}],{duration:FALL*k,easing:'ease-in',fill:'forwards'}).onfinish=()=>{
   if(kind==='bead'||kind==='stain'){el.remove();rest(kind,fx,LAND[part]);}
   else{el.classList.add(kind);el.animate(kind==='roll'?[{transform:at(0,0,'scale(1.1,.9)')},{transform:at(dir*b.w*.14,b.h*.04),offset:.45},{transform:at(dir*b.w*.24,b.h*.5),opacity:0}]:[{transform:at(0,0)},{transform:at(0,b.h*.12,'scale(.4)'),opacity:0}],{duration:AFTER*k,easing:'ease-out',fill:'forwards'});}
   if(++landed===RAIN.length)later(startShake,AFTER*k);
  };
 };
 const startShake=()=>{phase='shake';stage.classList.add('shake-ready');meter.classList.add('show');say('이제 가방을 꾹 잡고 좌우로 빠르게 흔들어 털어 봐!');};
 const fire=()=>{if(fired||shake||phase!=='done')return;fired=true;later(()=>onAction('field-bag-test',''),700*k+200);};
 on(cloud,'pointerdown',e=>{
  if(e.button>0)return;e.preventDefault();e.stopPropagation();
  // Nothing new to test: the state feedback explains why (same design, or not assembled).
  if(stage.dataset.rain!=='go')return onAction('field-bag-test','');
  if(phase!=='rain'||n>=RAIN.length)return;
  const now=performance.now(),gap=lastTap?now-lastTap:0,beat=gap>BEAT-160&&gap<BEAT+160;lastTap=now;
  stage.classList.add('locked');replay(cloud,gap&&gap<220?'rush':'puff');
  drop(n++,beat);
  count.innerHTML=`<b>${n}</b>/10${beat?'<em>박자 딱!</em>':''}`;replay(count,'pop');
  if(n===RAIN.length)say('비 10방울 끝! 물이 어디로 갔는지 잘 봐.');
 });
 const flip=dir=>{
  flips++;meter.children[flips-1]?.classList.add('on');
  // Beads on a lotus surface fling off a few at a time; stains on plain cloth stay put.
  const beads=[...canvas.querySelectorAll('.bag-wet.bead:not(.fly)')];
  beads.slice(0,Math.ceil(beads.length/Math.max(1,FLIPS-flips+1))).forEach(el=>{el.style.setProperty('--fly',dir*(90+Math.random()*60)+'px');el.classList.add('fly');});
  canvas.querySelectorAll('.bag-wet.stain').forEach(el=>replay(el,'wobble'));
  if(flips>=FLIPS){phase='done';
   const left=canvas.querySelectorAll('.bag-wet.stain').length;
   if(lotus&&!left)stage.classList.add('rainbow');
   say(lotus?(left?'털었어! 그래도 남은 물이 있어.':'털었더니 물방울이 다 날아갔어!'):'털어 봐도 젖은 얼룩이 그대로 남았어.');}
 };
 on(canvas,'pointerdown',e=>{
  if(phase!=='shake'||e.button>0)return;e.preventDefault();e.stopPropagation();
  canvas.setPointerCapture?.(e.pointerId);shake={id:e.pointerId,x0:e.clientX,ext:e.clientX,dir:0};canvas.classList.add('shaking');
 });
 on(canvas,'pointermove',e=>{
  if(!shake||e.pointerId!==shake.id)return;e.preventDefault();
  const dx=e.clientX-shake.x0,max=calm?10:46,t=Math.max(-max,Math.min(max,dx));
  canvas.style.transform=`translateX(${t}px) rotate(${calm?0:t*.18}deg)`;
  if(phase!=='shake')return;
  const s=shake;if(!s.dir){if(Math.abs(e.clientX-s.ext)>18){s.dir=Math.sign(e.clientX-s.ext);s.ext=e.clientX;}return;}
  if((e.clientX-s.ext)*s.dir>0)s.ext=e.clientX;else if((s.ext-e.clientX)*s.dir>24){s.dir=-s.dir;s.ext=e.clientX;flip(s.dir);}
 });
 const end=e=>{if(!shake||e.pointerId!==shake.id)return;shake=null;canvas.classList.remove('shaking');canvas.style.transform='';
  if(phase==='shake'&&flips<FLIPS)say(`조금 더! 좌우로 ${FLIPS-flips}번 더 흔들어 봐.`);fire();};
 on(canvas,'pointerup',end);on(canvas,'pointercancel',end);
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
