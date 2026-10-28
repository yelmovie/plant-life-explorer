// Field mission 2 by hand. Step 1: rub the winter soil away and pull a glowing string to
// the same part next spring. Steps 2-3: a time dial. Photo cards sit on the dial rim in
// season order; turning the hand clockwise a full lap plays a time-lapse of the plant in the
// viewer. After the lap, the time-lapse rests on early spring and a sprout pin marks where the
// plant regrew. State changes go through field actions, fired after the pointer is released.
import {assetImage} from './asset-catalog.js';
import {seasonArt} from './art.js';
import {FIELD_ORDER} from './field-missions-state.js';

// Stage-2 picture geometry, as fractions of one atlas cell.
export const LINK_HANDLE={tree:[.49,.7],herb:[.49,.68]},LINK_CUT={tree:.42,herb:.58},DIG_TOP=.6,DIG_CELLS=24;
const regrowZone=(kind,x,y)=>kind==='tree'?(y<.6?'branches':'rootbud'):(x>.3&&x<.7&&y>.15&&y<.8?'rootbud':'color');
function seedlingArt(herb){return assetImage(herb?'sowthistle_bud_spring':'cherry_bud_spring','field-bud-picture',true);}
export function frameArt(kind,phase){return phase==='bud'?seedlingArt(kind==='herb'):seasonArt(kind==='tree'?'cherry':'sowthistle',phase==='winter'?3:0,true).replace(/aria-label="[^"]*"/,`aria-label="${phase==='winter'?'잎이 없고 땅속 뿌리와 줄기가 남은 모습':'같은 식물에 잎과 꽃이 자란 모습'}"`);}
const shortName={winter:'겨울',bud:'초봄',spring:'다음 봄'};
// A numbered season tab above each rim card names the time the hand is passing through.
const seatIcon={winter:'❄',bud:'🌱',spring:'🌸'};
// Card k sits at HALF+k*SPAN on the rim; the hand shows it in full when pointing at it.
const SPAN=120,HALF=60,FULL=360;
const inOrder=a=>FIELD_ORDER.every((x,i)=>a[i]===x);
const clueOK=(e,kind)=>e.seasons.clues[kind]===(kind==='tree'?'branches':'rootbud');

export function timeDial(e,u,kind,fallback){
 const arr=FIELD_ORDER,done=inOrder(e.seasons[kind]),named=clueOK(e,kind),herb=kind==='herb';
 const descend=herb&&!u.camDown;if(herb)u.camDown=true;
 const pin=u.pin?.[kind],mark=done&&pin&&e.seasons.clues[kind]?`<span class="regrow-mark ${named?'ok':''}" style="left:${pin[0]*100}%;top:${pin[1]*100}%"></span>`:'';
 const tip=done&&!named?'타임랩스가 <b>초봄</b>에서 멈췄어. 새로 돋은 곳에 <b>새싹 핀</b>을 꽂아 봐.'
  :done?'다시 자란 모습과 근거를 모두 찾았어. 바늘을 다시 돌려 타임랩스를 봐도 돼.'
  :herb?'이번엔 카메라가 <b>땅속</b>으로 내려갔어. 바늘을 <b>한 바퀴</b> 돌려 겨울 땅속에서 무슨 일이 생기는지 봐.'
  :'바늘을 잡아 <b>시계 방향으로 한 바퀴</b> 돌려 봐. 겨울 → 초봄 → 다음 봄으로 시간이 흘러가.';
 const card=(phase,slot)=>`<div class="dial-card" data-dial-card="${phase}" style="--a:${HALF+slot*SPAN}deg">${frameArt(kind,phase)}</div>`;
 const seat=(phase,slot)=>`<span class="dial-seat seat-${phase}" style="--a:${HALF+slot*SPAN}deg"><b>${slot+1}</b>${seatIcon[phase]} ${shortName[phase]}</span>`;
 const side=done&&!named?`<span class="regrow-pin" data-regrow-pin aria-hidden="true"></span><p>핀을 끌어 화면에 꽂거나, 화면을 눌러 꽂아 봐.</p>`
  :done?`<p class="dial-status ok">✓ ${herb?'땅속 뿌리에서 새싹이 돋았어.':'같은 가지에서 새눈이 돋았어.'}</p>`
  :'<p class="dial-status">바늘을 돌리는 만큼 오른쪽 화면에서 시간이 흘러가.</p>';
 return `<p class="lens-hint season-hint" data-dial-tip><span>${tip}</span></p><div class="time-bench kind-${kind} ${done?'is-done':''} ${done&&!named?'pin-mode':''}" data-time-dial="${kind}" data-arr="${arr.join(',')}" data-turn="${done?HALF+SPAN:0}">
<div class="time-dial" aria-hidden="true"><span class="dial-sweep"></span><span class="dial-start">출발</span><div class="dial-face" data-dial-face>${[0,1,2].map(i=>`<i class="dial-tick" style="--a:${i*SPAN}deg"></i>`).join('')}<span class="dial-hand"><span class="dial-knob"></span></span><span class="dial-hub"></span></div>${arr.map(card).join('')}${FIELD_ORDER.map(seat).join('')}</div>
<div class="time-view"><div class="time-viewer ${herb?'underground-cam':''} ${descend?'cam-descend':''}" data-viewer role="img" aria-label="${herb?'씀바귀':'벚나무'} 타임랩스 화면"><div class="viewer-film">${arr.map(phase=>`<div class="viewer-layer" data-layer="${phase}">${frameArt(kind,phase)}</div>`).join('')}</div><span class="viewer-badge">${herb?'땅속 카메라':'타임랩스'}</span><span class="viewer-bloom" aria-hidden="true">${Array.from({length:16},(_,i)=>`<i style="--x:${(i*37+11)%96}%;--d:${(i%5)*.09}s;--s:${.7+(i%3)*.3}"></i>`).join('')}</span>${mark}</div><div class="time-side">${side}</div></div>
</div><div class="lens-fallback">${fallback}</div>`;
}

const angleOf=(e,cx,cy)=>Math.atan2(e.clientX-cx,cy-e.clientY)*180/Math.PI;
// object-fit leaves blank margins or crops; clue spots are measured on the painted image only.
function drawnRect(img){const r=img.getBoundingClientRect(),nw=img.naturalWidth||1,nh=img.naturalHeight||1,k=(getComputedStyle(img).objectFit==='cover'?Math.max:Math.min)(r.width/nw,r.height/nh),w=nw*k,h=nh*k;return {left:r.left+(r.width-w)/2,top:r.top+(r.height-h)/2,width:w,height:h};}

function mountDial(bench,ui,onAction,on,later,capture){
 const kind=bench.dataset.timeDial,arr=bench.dataset.arr.split(',');
 const face=bench.querySelector('[data-dial-face]'),viewer=bench.querySelector('[data-viewer]'),layers=[...viewer.querySelectorAll('[data-layer]')];
 const u=ui.fieldMission??={},done=bench.classList.contains('is-done'),pinMode=bench.classList.contains('pin-mode');
 let turn=Number(bench.dataset.turn)||0,bloomed=false,spin=null;

 // Blend the three photos along the hand, card to card; the last stretch to the top grows.
 const paint=t=>{bench.style.setProperty('--turn',t+'deg');const x=Math.max(0,Math.min(t-HALF,2*SPAN))/SPAN,i=Math.floor(x),f=x-i;
  layers.forEach(l=>{const s=arr.indexOf(l.dataset.layer);l.style.opacity=s===i?1-f:s===i+1?f:0;});
  bench.style.setProperty('--grow',Math.max(0,(t-HALF-2*SPAN)/HALF).toFixed(3));};
 const rewind=()=>{bloomed=false;bench.classList.remove('bloomed');bench.classList.add('rewind');turn=0;paint(0);later(()=>bench.classList.remove('rewind'),500);};
 paint(turn);

 // Turning back rewinds time; letting go keeps the hand in place, and a full lap blooms the plant.
 if(!pinMode){
  on(face,'pointerdown',e=>{if(e.button>0)return;e.preventDefault();e.stopPropagation();capture(face,e.pointerId);const r=face.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
   if(bloomed)rewind();
   spin={id:e.pointerId,cx,cy,last:angleOf(e,cx,cy)};bench.classList.add('spinning');});
  on(face,'pointermove',e=>{if(!spin||e.pointerId!==spin.id)return;e.preventDefault();if(Math.hypot(e.clientX-spin.cx,e.clientY-spin.cy)<18)return;
   const a=angleOf(e,spin.cx,spin.cy);let d=a-spin.last;if(d>180)d-=360;if(d<-180)d+=360;spin.last=a;if(bloomed)return;
   let t=Math.max(0,turn+d);if(t>=FULL){t=FULL;bloomed=true;bench.classList.add('bloomed');}
   turn=t;paint(t);});
  const end=e=>{if(!spin||e.pointerId!==spin.id)return;spin=null;bench.classList.remove('spinning');
   if(e.type==='pointerup'&&bloomed&&!done)later(()=>onAction('field-season-turn',kind),900);};
  on(face,'pointerup',end);on(face,'pointercancel',end);
 }

 // Early-spring pin: drag the sprout pin onto the paused frame, or tap the frame.
 const pin=bench.querySelector('[data-regrow-pin]'),bud=viewer.querySelector('[data-layer="bud"] img');
 if(pinMode&&bud){let ghost=null;
  const drop=e=>{const v=viewer.getBoundingClientRect();if(e.clientX<v.left||e.clientX>v.right||e.clientY<v.top||e.clientY>v.bottom)return;
   const r=drawnRect(bud),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
   u.pin={...u.pin,[kind]:[(e.clientX-v.left)/v.width,(e.clientY-v.top)/v.height]};onAction('field-season-clue',`${kind}:${regrowZone(kind,x,y)}`);};
  if(pin){on(pin,'pointerdown',e=>{if(e.button>0)return;e.preventDefault();e.stopPropagation();capture(pin,e.pointerId);ghost=pin.cloneNode();ghost.classList.add('dragging');document.body.append(ghost);Object.assign(ghost.style,{position:'fixed',left:e.clientX+'px',top:e.clientY+'px'});});
   on(pin,'pointermove',e=>{if(!ghost)return;e.preventDefault();ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';});
   const end=e=>{if(!ghost)return;ghost.remove();ghost=null;if(e.type==='pointerup')drop(e);};on(pin,'pointerup',end);on(pin,'pointercancel',end);}
  on(viewer,'click',drop);
 }
}

export function mountSeasonHands(root,ui,onAction){
 const offs=[],timers=[];const on=(el,type,fn,opt)=>{el.addEventListener(type,fn,opt);offs.push(()=>el.removeEventListener(type,fn,opt));};
 const later=(fn,ms)=>timers.push(setTimeout(fn,ms)),capture=(el,id)=>{try{el.setPointerCapture(id);}catch{}};
 root.querySelectorAll('.dig-cover').forEach(cover=>{
  const kind=cover.closest('[data-dig]').dataset.dig,cells=[...cover.children];let rubbing=false,done=false;
  const rub=e=>{if(!rubbing||done)return;const r=cover.getBoundingClientRect(),reach=Math.max(r.width/6,26);cells.forEach(c=>{const b=c.getBoundingClientRect();if(Math.hypot(b.left+b.width/2-e.clientX,b.top+b.height/2-e.clientY)<reach)c.classList.add('gone');});
   if(cells.filter(c=>c.classList.contains('gone')).length>=cells.length*.3){done=true;cover.classList.add('cleared');later(()=>onAction('field-dig',kind),450);}};
  on(cover,'pointerdown',e=>{e.preventDefault();e.stopPropagation();rubbing=true;capture(cover,e.pointerId);rub(e);});
  on(cover,'pointermove',e=>{e.preventDefault();rub(e);});on(cover,'pointerup',()=>{rubbing=false;});on(cover,'pointercancel',()=>{rubbing=false;});
 });
 root.querySelectorAll('[data-season-pair]').forEach(pair=>{
  const kind=pair.dataset.seasonPair,handle=pair.querySelector('[data-link-handle]'),targetBox=pair.querySelector('[data-link-target]'),svg=pair.querySelector('.link-line'),line=svg?.querySelector('line');if(!handle||!line)return;
  const cut=LINK_CUT[kind],partAt=y=>y>=cut?(kind==='tree'?'trunk':'root'):'leaf';
  const draw=(x,y)=>{const p=pair.getBoundingClientRect(),h=handle.getBoundingClientRect();line.setAttribute('x1',h.left+h.width/2-p.left);line.setAttribute('y1',h.top+h.height/2-p.top);line.setAttribute('x2',x-p.left);line.setAttribute('y2',y-p.top);svg.classList.add('show');};
  const zoneCenter=part=>{const z=targetBox.querySelector(part==='leaf'?'.upper':'.lower').getBoundingClientRect();return [z.left+z.width/2,z.top+z.height/2];};
  const linked=targetBox.querySelector('.link-zone.picked');
  const restore=()=>{if(!linked){svg.classList.remove('show');return;}const [x,y]=zoneCenter(linked.classList.contains('upper')?'leaf':'trunk');draw(x,y);svg.classList.add('fixed');};
  // A ghost dot glides from the handle to the middle of the spring picture (never to the answer).
  const ghost=pair.querySelector('.link-ghost'),aim=()=>{if(!ghost)return;const p=pair.getBoundingClientRect(),h=handle.getBoundingClientRect(),t=targetBox.getBoundingClientRect();
   ghost.style.cssText=`--x1:${h.left+h.width/2-p.left}px;--y1:${h.top+h.height/2-p.top}px;--x2:${t.left+t.width/2-p.left}px;--y2:${t.top+t.height/2-p.top}px`;};
  const raf=requestAnimationFrame(()=>{restore();aim();});offs.push(()=>cancelAnimationFrame(raf));on(window,'resize',aim);
  let pulling=false;
  on(handle,'pointerdown',e=>{e.preventDefault();e.stopPropagation();pulling=true;capture(handle,e.pointerId);pair.classList.add('linking');svg.classList.remove('fixed');draw(e.clientX,e.clientY);});
  on(handle,'pointermove',e=>{if(!pulling)return;e.preventDefault();draw(e.clientX,e.clientY);const t=targetBox.getBoundingClientRect(),inside=e.clientX>=t.left&&e.clientX<=t.right&&e.clientY>=t.top&&e.clientY<=t.bottom;targetBox.querySelectorAll('.link-zone').forEach(z=>z.classList.remove('hover'));if(inside)targetBox.querySelector(partAt((e.clientY-t.top)/t.height)==='leaf'?'.upper':'.lower').classList.add('hover');});
  const end=e=>{if(!pulling)return;pulling=false;pair.classList.remove('linking');targetBox.querySelectorAll('.link-zone').forEach(z=>z.classList.remove('hover'));const t=targetBox.getBoundingClientRect();if(e.type==='pointerup'&&e.clientX>=t.left&&e.clientX<=t.right&&e.clientY>=t.top&&e.clientY<=t.bottom){const part=partAt((e.clientY-t.top)/t.height),[x,y]=zoneCenter(part);draw(x,y);onAction('field-season-link',`${kind}:${part}`);}else restore();};
  on(handle,'pointerup',end);on(handle,'pointercancel',end);
 });
 root.querySelectorAll('[data-time-dial]').forEach(bench=>mountDial(bench,ui,onAction,on,later,capture));
 return ()=>{timers.forEach(clearTimeout);offs.forEach(off=>off());document.querySelectorAll('.dial-ghost,.regrow-pin.dragging').forEach(g=>g.remove());};
}
