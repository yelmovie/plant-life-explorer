// Field mission 2 by hand. Step 1: rub the winter soil away and pull a glowing string to
// the same part next spring. Steps 2-3: a time dial. Photo cards sit shuffled on the dial
// rim; swapping them sets the order, and turning the hand clockwise plays a time-lapse of
// the plant in the viewer. A wrong order jams the dial. Once the order holds, the time-lapse
// rests on early spring and a sprout pin marks where the plant regrew. State changes go
// through the existing field actions only, fired after the pointer is released.
import {assetImage} from './asset-catalog.js';
import {seasonArt} from './art.js';
import {FIELD_ORDER} from './field-missions-state.js';

// Stage-2 picture geometry, as fractions of one atlas cell.
export const LINK_HANDLE={tree:[.49,.7],herb:[.49,.68]},LINK_CUT={tree:.42,herb:.58},DIG_TOP=.6,DIG_CELLS=24;
const regrowZone=(kind,x,y)=>kind==='tree'?(y<.6?'branches':'rootbud'):(x>.3&&x<.7&&y>.15&&y<.8?'rootbud':'color');
function seedlingArt(herb){return assetImage(herb?'sowthistle_bud_spring':'cherry_bud_spring','field-bud-picture',true);}
export function frameArt(kind,phase){return phase==='bud'?seedlingArt(kind==='herb'):seasonArt(kind==='tree'?'cherry':'sowthistle',phase==='winter'?3:0,true).replace(/aria-label="[^"]*"/,`aria-label="${phase==='winter'?'잎이 없고 땅속 뿌리와 줄기가 남은 모습':'같은 식물에 잎과 꽃이 자란 모습'}"`);}
export const frameName={winter:'겨울 · 살아 있는 부분이 남아 있어',bud:'초봄 · 같은 부분에서 새눈·새싹이 나와',spring:'다음 봄 · 잎과 꽃이 자랐어'};
const shortName={winter:'겨울',bud:'초봄',spring:'다음 봄'};
// First deal on the rim; never already in order. The tree jams at once, the herb mid-play.
const DEAL={tree:['spring','winter','bud'],herb:['winter','spring','bud']};
// Card k sits at HALF+k*SPAN on the rim; the hand shows it in full when pointing at it.
const SPAN=120,HALF=60,FULL=360;
const inOrder=a=>FIELD_ORDER.every((x,i)=>a[i]===x);
const clueOK=(e,kind)=>e.seasons.clues[kind]===(kind==='tree'?'branches':'rootbud');
const isDeal=a=>Array.isArray(a)&&a.length===3&&FIELD_ORDER.every(x=>a.includes(x));
function arrangement(e,u,kind){
 const saved=e.seasons[kind],dial=u.dial??={};
 if(inOrder(saved))return dial[kind]=[...saved];
 if(!isDeal(dial[kind]))dial[kind]=saved.every(Boolean)?[...saved]:[...DEAL[kind]];
 return dial[kind];
}

export function timeDial(e,u,kind,fallback){
 const arr=arrangement(e,u,kind),done=inOrder(e.seasons[kind]),named=clueOK(e,kind),jam=!done&&u.jam?.kind===kind?u.jam.slot:-1,herb=kind==='herb';
 const descend=herb&&!u.camDown;if(herb)u.camDown=true;
 const pin=u.pin?.[kind],mark=done&&pin&&e.seasons.clues[kind]?`<span class="regrow-mark ${named?'ok':''}" style="left:${pin[0]*100}%;top:${pin[1]*100}%"></span>`:'';
 const tip=done&&!named?'타임랩스가 <b>초봄</b>에서 멈췄어. 새로 돋은 곳에 <b>새싹 핀</b>을 꽂아 봐.'
  :done?'시간 순서와 근거를 모두 찾았어. 바늘을 다시 돌려 타임랩스를 봐도 돼.'
  :herb?'이번엔 카메라가 <b>땅속</b>으로 내려갔어. 카드 자리를 바꾸고 바늘을 <b>한 바퀴</b> 돌려 봐.'
  :'사진 카드를 끌어 <b>자리를 바꾸고</b>, 바늘을 잡아 <b>시계 방향으로 한 바퀴</b> 돌려 봐.';
 const card=(phase,slot)=>`<div class="dial-card ${jam===slot?'jam':''}" data-dial-card="${phase}" style="--a:${HALF+slot*SPAN}deg">${frameArt(kind,phase)}${named?`<span>${shortName[phase]}</span>`:''}</div>`;
 const side=done&&!named?`<span class="regrow-pin" data-regrow-pin aria-hidden="true"></span><p>핀을 끌어 화면에 꽂거나, 화면을 눌러 꽂아 봐.</p>`
  :done?`<p class="dial-status ok">✓ ${herb?'땅속 뿌리에서 새싹이 돋았어.':'같은 가지에서 새눈이 돋았어.'}</p>`
  :`<p class="dial-status">${jam>=0?'덜컥 멈춘 카드를 다른 카드와 바꿔 봐.':'카드를 눌러 고른 뒤 다른 카드를 눌러도 자리가 바뀌어.'}</p>`;
 return `<p class="lens-hint season-hint" data-dial-tip><span>${tip}</span></p><div class="time-bench kind-${kind} ${done?'is-done':''} ${done&&!named?'pin-mode':''}" data-time-dial="${kind}" data-arr="${arr.join(',')}" data-saved="${e.seasons[kind].join(',')}" data-turn="${done?HALF+SPAN:0}">
<div class="time-dial" aria-hidden="true"><span class="dial-sweep"></span><span class="dial-start">출발</span><div class="dial-face" data-dial-face>${[0,1,2].map(i=>`<i class="dial-tick" style="--a:${i*SPAN}deg"></i>`).join('')}<span class="dial-hand"><span class="dial-knob"></span></span><span class="dial-hub"></span></div>${arr.map(card).join('')}</div>
<div class="time-view"><div class="time-viewer ${herb?'underground-cam':''} ${descend?'cam-descend':''}" data-viewer role="img" aria-label="${herb?'씀바귀':'벚나무'} 타임랩스 화면"><div class="viewer-film">${arr.map(phase=>`<div class="viewer-layer" data-layer="${phase}">${frameArt(kind,phase)}</div>`).join('')}</div><span class="viewer-badge">${herb?'땅속 카메라':'타임랩스'}</span><span class="viewer-jam" aria-hidden="true">덜컥!</span><span class="viewer-bloom" aria-hidden="true">${Array.from({length:16},(_,i)=>`<i style="--x:${(i*37+11)%96}%;--d:${(i%5)*.09}s;--s:${.7+(i%3)*.3}"></i>`).join('')}</span>${mark}</div><div class="time-side">${side}</div></div>
</div><div class="lens-fallback">${fallback}</div>`;
}

const angleOf=(e,cx,cy)=>Math.atan2(e.clientX-cx,cy-e.clientY)*180/Math.PI;
// object-fit leaves blank margins or crops; clue spots are measured on the painted image only.
function drawnRect(img){const r=img.getBoundingClientRect(),nw=img.naturalWidth||1,nh=img.naturalHeight||1,k=(getComputedStyle(img).objectFit==='cover'?Math.max:Math.min)(r.width/nw,r.height/nh),w=nw*k,h=nh*k;return {left:r.left+(r.width-w)/2,top:r.top+(r.height-h)/2,width:w,height:h};}

function mountDial(bench,ui,onAction,on,later,capture){
 const kind=bench.dataset.timeDial,u=ui.fieldMission??={},arr=bench.dataset.arr.split(','),saved=bench.dataset.saved.split(',');
 const dial=bench.querySelector('.time-dial'),face=bench.querySelector('[data-dial-face]'),viewer=bench.querySelector('[data-viewer]');
 const cards=[...bench.querySelectorAll('[data-dial-card]')],layers=[...viewer.querySelectorAll('[data-layer]')],status=bench.querySelector('.dial-status');
 const tip=bench.parentElement.querySelector('[data-dial-tip]'),tipText=tip?.innerHTML;
 const done=bench.classList.contains('is-done'),pinMode=bench.classList.contains('pin-mode');
 let turn=Number(bench.dataset.turn)||0,jammed=-1,bloomed=false,spin=null,picked=null;
 const say=html=>{if(!tip)return;tip.innerHTML=`<span>${html}</span>`;later(()=>{tip.innerHTML=tipText;},2600);};

 // Blend the three photos along the hand, card to card; the last stretch to the top grows.
 const paint=t=>{bench.style.setProperty('--turn',t+'deg');const x=Math.max(0,Math.min(t-HALF,2*SPAN))/SPAN,i=Math.floor(x),f=x-i;
  layers.forEach(l=>{const s=arr.indexOf(l.dataset.layer);l.style.opacity=s===i?1-f:s===i+1?f:0;});
  bench.style.setProperty('--grow',Math.max(0,(t-HALF-2*SPAN)/HALF).toFixed(3));};
 // The hand runs freely while every card so far continues the plant's own time.
 const leading=()=>{let k=0;while(k<3&&arr[k]===FIELD_ORDER[k])k++;return k;};
 const limit=k=>k===3?FULL:k===0?30:HALF+(k-1)*SPAN+48;
 const reset=()=>{jammed=-1;bloomed=false;bench.classList.remove('jammed','bloomed');cards.forEach(c=>c.classList.remove('jam'));};
 const rewind=()=>{bench.classList.add('rewind');turn=0;paint(0);later(()=>bench.classList.remove('rewind'),500);};
 const place=()=>cards.forEach(c=>c.style.setProperty('--a',HALF+arr.indexOf(c.dataset.dialCard)*SPAN+'deg'));
 // Save the rim order slot by slot, mirroring field-order's swap so unchanged slots are skipped.
 const commit=()=>{const cur=[...saved];(u.dial??={})[kind]=[...arr];
  arr.forEach((phase,slot)=>{if(cur[slot]===phase)return;const from=cur.indexOf(phase),occ=cur[slot];if(from>=0)cur[from]=occ||'';cur[slot]=phase;onAction('field-place',`frame:${kind}:${phase}|order:${kind}:${slot}`);});};
 paint(turn);

 if(!pinMode){
  on(face,'pointerdown',e=>{if(e.button>0)return;e.preventDefault();e.stopPropagation();capture(face,e.pointerId);const r=face.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
   if(jammed>=0||bloomed){reset();rewind();}
   spin={id:e.pointerId,cx,cy,last:angleOf(e,cx,cy)};bench.classList.add('spinning');if(picked){picked.classList.remove('picked');picked=null;}});
  on(face,'pointermove',e=>{if(!spin||e.pointerId!==spin.id)return;e.preventDefault();if(Math.hypot(e.clientX-spin.cx,e.clientY-spin.cy)<18)return;
   const a=angleOf(e,spin.cx,spin.cy);let d=a-spin.last;if(d>180)d-=360;if(d<-180)d+=360;spin.last=a;if(jammed>=0||bloomed)return;
   const k=leading(),lim=limit(k);let t=Math.max(0,turn+d);
   if(t>=lim){t=lim;if(k===3){bloomed=true;bench.classList.add('bloomed');}else{jammed=k;bench.classList.add('jammed');cards.find(c=>c.dataset.dialCard===arr[k])?.classList.add('jam');say('덜컥! 시간이 이어지지 않는 사진이 있어.');}}
   turn=t;paint(t);});
  const end=e=>{if(!spin||e.pointerId!==spin.id)return;spin=null;bench.classList.remove('spinning');
   if(e.type!=='pointerup'){if(jammed>=0){reset();rewind();}return;}
   if(jammed>=0){u.jam={kind,slot:jammed};later(()=>{reset();rewind();commit();},650);}
   else if(bloomed){u.jam=null;later(commit,900);}};
  on(face,'pointerup',end);on(face,'pointercancel',end);
 }

 // Swap two rim cards by dragging one onto the other, or by tapping both.
 if(!done)cards.forEach(card=>{let drag=null;
  const swap=other=>{const i=arr.indexOf(card.dataset.dialCard),j=arr.indexOf(other.dataset.dialCard);[arr[i],arr[j]]=[arr[j],arr[i]];(u.dial??={})[kind]=[...arr];u.jam=null;
   reset();place();turn=0;paint(0);[card,other].forEach(c=>{c.classList.remove('swapped');void c.offsetWidth;c.classList.add('swapped');});if(status)status.textContent='좋아, 이제 바늘을 돌려서 확인해 봐.';};
  const over=e=>document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-dial-card]');
  on(card,'pointerdown',e=>{if(e.button>0)return;e.preventDefault();e.stopPropagation();capture(card,e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY,ghost:null};});
  on(card,'pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;e.preventDefault();if(!drag.ghost){if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<8)return;
    drag.ghost=card.cloneNode(true);drag.ghost.className='dial-card dial-ghost';drag.ghost.style.cssText='';document.body.append(drag.ghost);card.classList.add('lifted');}
   Object.assign(drag.ghost.style,{left:e.clientX+'px',top:e.clientY+'px'});const t=over(e);cards.forEach(c=>c.classList.toggle('swap-over',c===t&&c!==card));});
  const end=e=>{if(!drag||e.pointerId!==drag.id)return;const {ghost}=drag;drag=null;card.classList.remove('lifted');cards.forEach(c=>c.classList.remove('swap-over'));
   if(ghost){ghost.remove();const t=e.type==='pointerup'&&over(e);if(t&&t!==card&&cards.includes(t))swap(t);return;}
   if(e.type!=='pointerup')return;
   if(picked&&picked!==card){const other=picked;picked.classList.remove('picked');picked=null;swap(other);}
   else{picked=picked===card?null:card;card.classList.toggle('picked',!!picked);}};
  on(card,'pointerup',end);on(card,'pointercancel',end);
 });

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
   if(cells.filter(c=>c.classList.contains('gone')).length>=cells.length*.6){done=true;cover.classList.add('cleared');later(()=>onAction('field-dig',kind),450);}};
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
  const raf=requestAnimationFrame(restore);offs.push(()=>cancelAnimationFrame(raf));
  let pulling=false;
  on(handle,'pointerdown',e=>{e.preventDefault();e.stopPropagation();pulling=true;capture(handle,e.pointerId);pair.classList.add('linking');svg.classList.remove('fixed');draw(e.clientX,e.clientY);});
  on(handle,'pointermove',e=>{if(!pulling)return;e.preventDefault();draw(e.clientX,e.clientY);const t=targetBox.getBoundingClientRect(),inside=e.clientX>=t.left&&e.clientX<=t.right&&e.clientY>=t.top&&e.clientY<=t.bottom;targetBox.querySelectorAll('.link-zone').forEach(z=>z.classList.remove('hover'));if(inside)targetBox.querySelector(partAt((e.clientY-t.top)/t.height)==='leaf'?'.upper':'.lower').classList.add('hover');});
  const end=e=>{if(!pulling)return;pulling=false;pair.classList.remove('linking');targetBox.querySelectorAll('.link-zone').forEach(z=>z.classList.remove('hover'));const t=targetBox.getBoundingClientRect();if(e.type==='pointerup'&&e.clientX>=t.left&&e.clientX<=t.right&&e.clientY>=t.top&&e.clientY<=t.bottom){const part=partAt((e.clientY-t.top)/t.height),[x,y]=zoneCenter(part);draw(x,y);onAction('field-season-link',`${kind}:${part}`);}else restore();};
  on(handle,'pointerup',end);on(handle,'pointercancel',end);
 });
 root.querySelectorAll('[data-time-dial]').forEach(bench=>mountDial(bench,ui,onAction,on,later,capture));
 return ()=>{timers.forEach(clearTimeout);offs.forEach(off=>off());document.querySelectorAll('.dial-ghost,.regrow-pin.dragging').forEach(g=>g.remove());};
}
