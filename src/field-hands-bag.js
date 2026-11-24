// Stage 5 by hand: tap the cloud for ten drops; the trial is recorded once they have landed.
// State still changes only through the field actions; the falling drops live in the DOM.

// Every trial uses the same ten landing points on the opening or the cloth.
const RAIN=[
 ['cover',.44,.30],['surface',.30,.53],['surface',.50,.55],['surface',.37,.63],['cover',.57,.27],
 ['surface',.67,.54],['surface',.29,.66],['cover',.51,.32],['surface',.74,.61],['surface',.43,.74]
];

export function mountBagHands(root,ui,onAction){
 const offs=[],timers=[],animations=new Set();let disposed=false;
 const ctx={ui,onAction,
  on:(el,type,fn,opt)=>{el.addEventListener(type,fn,opt);offs.push(()=>el.removeEventListener(type,fn,opt));},
  later:(fn,ms)=>{if(!disposed)timers.push(setTimeout(()=>{if(!disposed)fn();},ms));},
  animate:(el,frames,options,done)=>{if(disposed)return;const animation=el.animate(frames,options);animations.add(animation);animation.onfinish=()=>{if(!disposed)done?.();};},
  calm:matchMedia('(prefers-reduced-motion: reduce)').matches,
  say:text=>{const el=root.querySelector('[data-bag-say]');if(el)el.textContent=text;}};
 const sky=root.querySelector('[data-bag-stage][data-rain]');
 if(sky){
  mountRain(sky,ctx);
  // The button and keyboard paths run the same observation before anything is recorded.
  root.querySelectorAll('[data-action="field-bag-test"]').forEach(button=>ctx.on(button,'click',event=>{
   if(!sky.autoRain())return;
   event.preventDefault();
   event.stopPropagation();
  }));
 }
 return ()=>{disposed=true;offs.forEach(off=>off());timers.forEach(clearTimeout);animations.forEach(animation=>{animation.onfinish=null;animation.cancel();});animations.clear();};
}

const replay=(el,cls)=>{el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);};

// Rain by taps; the trial is recorded once every drop has landed.
function mountRain(stage,{ui,onAction,on,later,animate,calm,say}){
 const cloud=stage.querySelector('[data-bag-cloud]'),canvas=stage.querySelector('[data-bag-canvas]'),count=stage.querySelector('[data-rain-count]');
 const art=canvas.querySelector('.bag-art'),lotus=art.classList.contains('lotus-surface'),covered=art.classList.contains('with-cover');
 const fall=calm?180:560,flow=calm?160:720;
 const backdrop=document.createElement('i');
 backdrop.className='rain-backdrop';
 backdrop.ariaHidden='true';
 let n=0,landed=0,phase='rain';
 const box=el=>{const s=stage.getBoundingClientRect(),r=el.getBoundingClientRect();return {x:r.left-s.left,y:r.top-s.top,w:r.width,h:r.height};};
 const outcome=part=>part==='surface'?(lotus?'bead':'stain'):covered?'roll':'enter';
 const mark=(kind,fx,fy,index=0)=>{
  const el=document.createElement('i');
  el.className='bag-wet '+kind;
  el.ariaHidden='true';
  el.style.left=fx*100+'%';
  el.style.top=fy*100+'%';
  if(kind==='stain'){
   el.style.setProperty('--wet-scale',String(.72+(index%4)*.12));
   el.style.setProperty('--wet-angle',((index%5)-2)*10+'deg');
  }
  canvas.append(el);
 };
 const drop=i=>{
  const [part,fx,fy]=RAIN[i],kind=outcome(part),el=document.createElement('i'),c=box(cloud),b=box(canvas);
  el.className='rain-drop';
  el.ariaHidden='true';
  el.style.fontSize=Math.min(18,Math.max(12,b.w*.033))*(.88+(i%3)*.12)+'px';
  stage.append(el);
  const x=b.x+fx*b.w,y=b.y+fy*b.h,cloudX=c.x+c.w*(.18+fx*.64),cloudY=c.y+c.h*.67;
  const at=(dx=0,dy=0,scale='')=>`translate(${x+dx}px,${y+dy}px) ${scale}`;
  const landing=at(0,0,'scale(1.12,.84)');
  const origin=calm?at():`translate(${cloudX}px,${cloudY}px) scale(.68,1.34)`;
  animate(el,[{transform:origin,opacity:0},{opacity:1,offset:.25},{transform:landing,opacity:1}],{duration:fall,easing:'cubic-bezier(.5,.08,.75,.36)',fill:'forwards'},()=>{
   el.classList.add(kind);
   mark('impact',fx,fy);
   let consequence,frames;
   if(kind==='stain'){
    mark('stain',fx,fy,i);
    frames=[{transform:landing},{transform:at(0,0,'scale(1.9,.48)'),opacity:0}];
   }else if(kind==='enter'){
    consequence=()=>mark('inside',fx,fy+.045);
    frames=[{transform:landing},{transform:at(0,b.h*.045,'scale(.8,1.18)'),offset:.55},{transform:at(0,b.h*.11,'scale(.35)'),opacity:0}];
   }else{
    // Water on the leaf coating stays rounded. On either closed lid it runs away from the opening.
    const edge=fx<.49?.17:.87,dx=(edge-fx)*b.w,dy=(.91-fy)*b.h;
    consequence=()=>mark('runoff',edge,.91);
    frames=[{transform:landing},{transform:at(dx*.25,dy*.16,'scale(.92)'),offset:.24},{transform:at(dx*.78,dy*.52),offset:.60},{transform:at(dx,dy,'scale(.58,1.16)'),opacity:.32}];
   }
   if(calm)frames=[{opacity:1},{opacity:0}];
   animate(el,frames,{duration:flow,easing:'ease-in',fill:'forwards'},()=>{
    el.remove();
    consequence?.();
   });
   if(++landed===RAIN.length)later(finish,flow);
  });
 };
 const finish=()=>{
  phase='done';
  stage.classList.remove('raining');
  say((lotus?'겉면의 물방울이 굴러갔어.':'천에 젖은 자국이 남았어.')+' '+(covered?'덮개가 입구로 향한 물을 막았어.':'열린 입구로 물이 들어갔어.'));
  later(()=>onAction('field-bag-test',''),calm?700:1000);
 };
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
  phase='falling';stage.classList.add('locked','raining');replay(cloud,'puff');
  const c=box(cloud),b=box(canvas);
  Object.assign(backdrop.style,{left:b.x+'px',top:c.y+c.h*.4+'px',width:b.w+'px',height:b.y+b.h-c.y-c.h*.4+'px'});
  stage.append(backdrop);
  say('같은 비 10방울이 내려! 물이 어디로 가는지 봐.');
  RAIN.forEach((_,i)=>later(()=>{drop(n++);count.innerHTML=`<b>${n}</b>/10`;replay(count,'pop');},i*(calm?65:140)));
 }
}
