// Stage 1 by hand: a magnifier that discovers clues by resting on them,
// then a deck of specimen cards flicked into one of two baskets.

// Where each clue sits on the leaf picture, as fractions of the drawn image.
export const LENS_SPOTS={maple:{shape:[[.5,.6]],edge:[[.33,.33],[.68,.33],[.17,.55],[.83,.5],[.3,.69],[.7,.69]]},pine:{shape:[[.5,.45]],edge:[[.3,.25],[.7,.25],[.4,.65],[.58,.65]]},camellia:{shape:[[.5,.45]],edge:[[.14,.4],[.86,.42],[.2,.66],[.8,.64],[.32,.17],[.68,.17]]}};
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
// object-fit:contain leaves blank margins; clue spots are measured on the painted image only.
function drawnRect(img){const r=img.getBoundingClientRect(),nw=img.naturalWidth||1,nh=img.naturalHeight||1,k=(getComputedStyle(img).objectFit==='cover'?Math.max:Math.min)(r.width/nw,r.height/nh),w=nw*k,h=nh*k;return {left:r.left+(r.width-w)/2,top:r.top+(r.height-h)/2,width:w,height:h};}

// Drag the magnifier; resting on a clue spot for a moment records that observation.
// ×4 shows the leaf pictures at about their source resolution, so camellia's small teeth stay visible.
export function mountLens(bench,ui,onAction){
 const lens=bench.querySelector('[data-lens]'),glass=lens.querySelector('.field-lens-glass'),zoom=glass.querySelector('img'),u=ui.fieldMission??={},Z=4;
 const gauge=bench.querySelector('[data-clue-gauge]'),total=2;
 let drag=null,timer=0,spot='',queued=[],dragged=false;
 const record=key=>{u.lastFound=key;onAction('field-place','lens|scan:'+key);};
 // Sparkles stay on the leaf where a clue was found.
 const sparks=()=>bench.querySelectorAll('[data-spark]').forEach(s=>{const [id,kind]=s.dataset.spark.split(':'),box=s.closest('[data-lens-leaf]'),img=box.querySelector('img');if(!img?.naturalWidth)return;const r=drawnRect(img),b=box.getBoundingClientRect(),[x,y]=LENS_SPOTS[id][kind][0];s.style.left=r.left-b.left+x*r.width+'px';s.style.top=r.top-b.top+y*r.height+'px';s.classList.add('placed');});
 const bump=()=>{if(!gauge)return;const n=Math.min(total,Number(gauge.dataset.clueGauge)+1);gauge.dataset.clueGauge=n;gauge.querySelector('b').textContent=`단서 ${n}/${total}`;gauge.querySelector('.clue-bar i').style.width=n/total*100+'%';gauge.classList.remove('tick');void gauge.offsetWidth;gauge.classList.add('tick');};
 const discover=key=>{lens.classList.remove('charging');const chip=bench.querySelector(`[data-clue="${key}"]`);if(!chip||chip.classList.contains('found'))return;chip.classList.add('found','just-found');chip.textContent=chip.dataset.text;if(key.startsWith('maple:'))bump();lens.classList.add('found-flash');setTimeout(()=>lens.classList.remove('found-flash'),500);if(drag)queued.push(key);else record(key);};
 const look=()=>{const g=glass.getBoundingClientRect(),cx=g.left+g.width/2,cy=g.top+g.height/2;let hit='',over=false;
  for(const box of bench.querySelectorAll('[data-lens-leaf]')){const img=box.querySelector('img'),r=drawnRect(img);if(cx<r.left-30||cx>r.left+r.width+30||cy<r.top-30||cy>r.top+r.height+30)continue;over=true;
   if(zoom.dataset.src!==img.src){zoom.src=img.src;zoom.dataset.src=img.src;}
   Object.assign(zoom.style,{width:r.width*Z+'px',height:r.height*Z+'px',left:g.width/2-(cx-r.left)*Z+'px',top:g.height/2-(cy-r.top)*Z+'px'});
   const id=box.dataset.lensLeaf,x=(cx-r.left)/r.width,y=(cy-r.top)/r.height;
   for(const kind of ['shape','edge'])if(LENS_SPOTS[id][kind].some(([a,b])=>Math.hypot((x-a)*r.width,(y-b)*r.height)<r.height*.11))hit=`${id}:${kind}`;
   break;}
  lens.classList.toggle('over',over);
  if(hit===spot)return;spot=hit;clearTimeout(timer);lens.classList.remove('charging');
  if(hit&&!bench.querySelector(`[data-clue="${hit}"]`)?.classList.contains('found')){void lens.offsetWidth;lens.classList.add('charging');timer=setTimeout(()=>discover(hit),650);}
 };
 const place=(x,y)=>{const b=bench.getBoundingClientRect();u.lens={x:Math.max(40,Math.min(b.width-40,x)),y:Math.max(40,Math.min(b.height-40,y))};lens.style.left=u.lens.x+'px';lens.style.top=u.lens.y+'px';look();};
 const down=e=>{if(e.button>0)return;e.preventDefault();e.stopPropagation();const b=bench.getBoundingClientRect();dragged=false;drag={id:e.pointerId,dx:e.clientX-b.left-u.lens.x,dy:e.clientY-b.top-u.lens.y};lens.setPointerCapture?.(e.pointerId);lens.classList.add('dragging');};
 const move=e=>{if(!drag||e.pointerId!==drag.id)return;e.preventDefault();const b=bench.getBoundingClientRect();dragged=true;place(e.clientX-b.left-drag.dx,e.clientY-b.top-drag.dy);};
 const up=e=>{if(!drag||e.pointerId!==drag.id)return;drag=null;lens.classList.remove('dragging');const keys=queued;queued=[];keys.forEach(record);};
 const settle=()=>{place(u.lens?.x??150,u.lens?.y??58);sparks();};
 lens.addEventListener('pointerdown',down);lens.addEventListener('pointermove',move);lens.addEventListener('pointerup',up);lens.addEventListener('pointercancel',up);
 // Without dragging: tapping a spot on a leaf (or a scan button) carries the lens there, so the clue is still seen through the glass.
 const goto=(x,y)=>{const b=bench.getBoundingClientRect();place(x-b.left,y-b.top);};
 // A tap on the glass itself (it may be covering the leaf) also moves it; the click that ends a real drag does not.
 const tap=e=>{if(drag)return;if(e.target.closest('[data-lens]')){if(!dragged)goto(e.clientX,e.clientY);return;}const box=e.target.closest('[data-lens-leaf]');if(box)return goto(e.clientX,e.clientY);
  // A scan button still records at once (keyboard pace); the lens only goes along to show the spot.
  const key=e.target.closest('[data-field-drop^="scan:"]')?.dataset.fieldDrop;if(!key)return;
  const [,id,kind]=key.split(':'),img=bench.querySelector(`[data-lens-leaf="${id}"] img`),r=drawnRect(img),[x,y]=LENS_SPOTS[id][kind][0];goto(r.left+x*r.width,r.top+y*r.height);};
 // Scan buttons may sit in the button-mode panel outside the bench, so listen on the whole mission.
 const host=bench.closest('.field-mission')||bench;host.addEventListener('click',tap,true);
 bench.querySelectorAll('[data-lens-leaf] img').forEach(img=>img.complete||img.addEventListener('load',settle,{once:true}));addEventListener('resize',settle);settle();
 return ()=>{clearTimeout(timer);removeEventListener('resize',settle);host.removeEventListener('click',tap,true);};
}

// Flick the top card toward a basket. A fast flick or letting go over a basket throws it;
// a slow drag released elsewhere springs back. The action fires after the flight ends.
export function mountLeafSwipe(root,ui,onAction){
 const box=root.querySelector('[data-swipe-sort]'),card=box?.querySelector('[data-swipe-top]');if(!card)return ()=>{};
 const u=ui.fieldMission??={},rule=box.dataset.swipeSort,vertical=box.dataset.axis==='y',bins=[...box.querySelectorAll('[data-swipe-bin]')],slow=reduced()?.3:1;
 let drag=null,timer=0,flying=false,animation=null,disposed=false;
 const offs=[],on=(el,type,fn)=>{el.addEventListener(type,fn);offs.push(()=>el.removeEventListener(type,fn));};
 const binAt=(x,y)=>bins.find(b=>{const r=b.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;});
 const lean=d=>Math.abs(d)<50?'':d<0?'yes':'no';
 const mark=answer=>bins.forEach(b=>b.classList.toggle('lean',b.dataset.swipeBin===answer));
 const pose=(dx,dy)=>`translate(${dx}px,${dy}px) rotate(${vertical?dy*.02:dx*.07}deg)`;
 const fly=(answer,dx,dy)=>{
  if(flying||disposed)return;
  flying=true;const bin=bins.find(b=>b.dataset.swipeBin===answer),c=card.getBoundingClientRect(),t=bin.getBoundingClientRect();
  const tx=dx+t.left+t.width/2-(c.left+c.width/2),ty=dy+t.top+t.height/2-(c.top+c.height/2);
  card.classList.add('thrown');mark(answer);
  animation=card.animate([{transform:pose(dx,dy)},{transform:`translate(${tx}px,${ty}px) rotate(${vertical?0:(answer==='yes'?-1:1)*25}deg) scale(.25)`,opacity:.35}],{duration:340*slow,easing:'cubic-bezier(.4,0,.9,.6)',fill:'forwards'});
  animation.onfinish=()=>{
   if(disposed)return;
   bin.classList.add('catch');u.leafThrown=card.dataset.swipeCard;
   timer=setTimeout(()=>onAction('field-place',`leaf:${card.dataset.swipeCard}|sort:${rule}:${answer}`),160*slow);
  };
 };
 // The same throw works with one tap or keyboard activation when a flick is awkward.
 for(const bin of bins){
  bin.setAttribute('role','button');bin.tabIndex=0;
  bin.setAttribute('aria-label',card.querySelector('strong').textContent+' · '+bin.querySelector('strong').textContent+' 바구니에 넣기');
  bin.style.cursor='pointer';bin.style.touchAction='manipulation';
  const choose=e=>{e.preventDefault();e.stopPropagation();if(!drag)fly(bin.dataset.swipeBin,0,0);};
  on(bin,'click',choose);
  on(bin,'keydown',e=>{if(e.key==='Enter'||e.key===' ')choose(e);});
 }
 const back=moved=>{card.classList.add('return');card.style.transform='';mark('');if(moved){box.classList.remove('too-slow');void box.offsetWidth;box.classList.add('too-slow');}else{card.classList.remove('nudge');void card.offsetWidth;card.classList.add('nudge');}};
 on(card,'pointerdown',e=>{if(e.button>0||flying)return;e.preventDefault();e.stopPropagation();card.setPointerCapture?.(e.pointerId);card.classList.remove('return','nudge');card.classList.add('grabbed');drag={id:e.pointerId,x:e.clientX,y:e.clientY,trail:[[e.timeStamp,e.clientX,e.clientY]]};});
 on(card,'pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;e.preventDefault();const dx=e.clientX-drag.x,dy=e.clientY-drag.y;card.style.transform=pose(dx,dy);drag.trail.push([e.timeStamp,e.clientX,e.clientY]);if(drag.trail.length>8)drag.trail.shift();mark(binAt(e.clientX,e.clientY)?.dataset.swipeBin||lean(vertical?dy:dx));});
 const end=e=>{if(!drag||e.pointerId!==drag.id)return;const d=drag;drag=null;card.classList.remove('grabbed');
  const dx=e.clientX-d.x,dy=e.clientY-d.y,dist=vertical?dy:dx;
  if(e.type==='pointercancel')return back(false);
  // Speed along the throw axis over roughly the last 100 ms.
  const old=d.trail.find(([t])=>e.timeStamp-t<=100)||d.trail[0],dt=Math.max(16,e.timeStamp-old[0]),v=((vertical?e.clientY-old[2]:e.clientX-old[1]))/dt;
  const answer=binAt(e.clientX,e.clientY)?.dataset.swipeBin||(Math.abs(v)>.5&&Math.abs(dist)>30&&Math.sign(v)===Math.sign(dist)?(v<0?'yes':'no'):'');
  if(answer)fly(answer,dx,dy);else back(Math.hypot(dx,dy)>12);};
 on(card,'pointerup',end);on(card,'pointercancel',end);
 return ()=>{disposed=true;clearTimeout(timer);animation?.cancel();offs.forEach(off=>off());};
}
