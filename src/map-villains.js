// Optional map combat. Learning completion and rewards are never changed here.
export const normalizeMapVillains=value=>Array.from({length:5},(_,i)=>Number.isInteger(value?.[i])&&value[i]>=0&&value[i]<=3?value[i]:0);
export const COMBAT={range:108,contact:35,cooldown:.55,invincible:1.3};
export function createGardenCombat(points,progress){
 const enemies=points.map(p=>({...p,d:p.distance,hp:4+p.id%2,max:4+p.id%2,phase:'patrol',clock:0,hit:0,cleared:progress[p.id]===3}));
 return {enemies,hp:4,invincible:1.5,hurtTime:0,cooldown:0,attackTime:0,face:1,paused:false,
  attack(player){if(this.hp<=0||this.cooldown>0||this.paused)return [];this.cooldown=COMBAT.cooldown;this.attackTime=.32;const hits=[];
   for(const e of enemies)if(!e.cleared&&Math.abs(e.d-player)<COMBAT.range&&(e.d-player)*this.face>=-22){e.hp--;e.hit=.32;e.d+=this.face*28;e.phase='recover';e.clock=.65;if(e.hp<=0)e.cleared=true;hits.push(e);}return hits;},
  tick(dt,player){dt=Math.min(.04,Math.max(0,dt));if(this.paused||this.hp<=0)return false;this.hurtTime=Math.max(0,this.hurtTime-dt);this.invincible=Math.max(0,this.invincible-dt);this.cooldown=Math.max(0,this.cooldown-dt);this.attackTime=Math.max(0,this.attackTime-dt);let hurt=false;
   for(const e of enemies){e.hit=Math.max(0,e.hit-dt);if(e.cleared)continue;e.clock-=dt;const gap=player-e.d,near=Math.abs(player-e.distance)<230;
    if(!near){e.phase='patrol';e.d+=Math.sign(e.distance-e.d)*Math.min(Math.abs(e.distance-e.d),25*dt);continue;}
    if(e.phase==='patrol'){e.d+=Math.sign(gap)*(28+e.id*5)*dt;if(Math.abs(gap)<76){e.phase='windup';e.clock=.65+e.id*.04;}}
    else if(e.phase==='windup'&&e.clock<=0){e.phase='lunge';e.clock=.3;e.direction=Math.sign(gap)||1;}
    else if(e.phase==='lunge'){e.d+=e.direction*(150+e.id*12)*dt;if(e.clock<=0){e.phase='recover';e.clock=.9;}}
    else if(e.phase==='recover'&&e.clock<=0)e.phase='patrol';
    e.d=Math.max(e.distance-150,Math.min(e.distance+150,e.d));
    if(Math.abs(e.d-player)<COMBAT.contact&&this.invincible<=0){this.hp--;this.hurtTime=COMBAT.invincible;this.invincible=COMBAT.invincible;e.phase='recover';e.clock=1;e.d-=Math.sign(gap||1)*45;hurt=true;break;}
   }return hurt;
  },
  retry(){this.hp=4;this.hurtTime=0;this.invincible=2;this.cooldown=0;this.attackTime=0;for(const e of enemies)if(!e.cleared){e.hp=e.max;e.d=e.distance;e.phase='patrol';e.clock=0;}}
 };
}
const reveals=[
 ['잎 표찰 되찾기','잎을 두 기준으로 나누어 찾은 표찰이 제자리로! 다음은 겨울을 지낸 식물의 비밀이야.'],
 ['정원 이름표 정리','겨울과 봄을 연결하는 표찰이 돌아왔어! 다음은 식물이 사는 환경을 찾아볼까?'],
 ['관찰길 표찰 복구','식물의 특징과 사는 곳을 연결한 표찰이 돌아왔어! 다음은 네 정원을 만들 차례야.'],
 ['서식지 표찰 복구','네 정원의 이름표를 되찾았어! 마지막 공방에서는 식물을 본뜬 가방을 발명해 보자.'],
 ['연구기지 표찰 완성','모든 관찰길의 표찰이 제자리야! 연구 노트에 담은 발견을 다시 살펴봐.']
];
export function mountMapVillains(host,{progress,points=[],getPlayer,pathPoint,project,onHit=()=>{},onHurt=()=>{},stop=()=>{},blocked=()=>false,sound=()=>{},reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches}={}){
 const doc=host.ownerDocument,abort=new AbortController(),{signal}=abort;
 const model=createGardenCombat(points,progress),layer=doc.createElement('div');layer.className='garden-combat';host.append(layer);
 const hero=doc.createElement('div');hero.className='garden-sprite garden-hero';hero.setAttribute('aria-hidden','true');layer.append(hero);
 const hud=doc.createElement('section');hud.className='garden-combat-hud';hud.setAttribute('aria-label','표찰 되찾기');hud.innerHTML='<span class="garden-health"></span><button type="button" class="garden-attack">공격 <small>Space / J</small></button><button type="button" class="garden-retry" hidden>다시 도전</button>';host.append(hud);
 const notice=doc.createElement('p');notice.className='garden-combat-notice';notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');host.append(notice);
 const health=hud.querySelector('.garden-health'),attack=hud.querySelector('.garden-attack'),retry=hud.querySelector('.garden-retry');
 const nodes=new Map();for(const e of model.enemies){const n=doc.createElement('div');n.className='garden-enemy';n.dataset.villain=e.id;n.innerHTML='<span class="garden-sprite"></span><span class="garden-enemy-hp"></span><span class="garden-warning">!</span>';layer.append(n);nodes.set(e.id,n);}
 let raf=0,last=0,old=getPlayer(),noticeUntil=0,disposed=false;
 const say=(text,seconds=4)=>{notice.textContent=text;noticeUntil=performance.now()+seconds*1000;notice.hidden=false;};
 const pose=(node,frame,face=1)=>{node.style.backgroundPosition=(frame%4)*100/3+'% '+Math.floor(frame/4)*100/3+'%';node.style.setProperty('--sprite-face',face);};
 const place=(node,p)=>{const screen=project(p);node.style.left=screen.x+'px';node.style.top=screen.y+'px';};
 function strike(){model.paused=blocked()||doc.hidden;const hits=model.attack(getPlayer());if(!model.attackTime)return;sound('attack');for(const e of hits){sound('hit');if(e.cleared){progress[e.id]=3;onHit(e.id,3);say(reveals[e.id][0]+'! '+reveals[e.id][1],7);}else say('탁! 표찰 장난꾸러기 표르가 물러났어. 노란 느낌표가 뜨면 피하자.',2);}if(!hits.length)say('표르 가까이 다가가서 바라보는 쪽으로 공격해 봐.',2);}
 attack.addEventListener('click',strike,{signal});for(const b of [attack,retry])b.addEventListener('pointerdown',e=>e.stopPropagation(),{signal});
 retry.addEventListener('click',()=>{model.retry();say('다시 도전! 표르가 표찰을 들면 물러났다가 공격해 봐.');attack.focus();},{signal});
 doc.addEventListener('keydown',e=>{if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,select,[contenteditable="true"]'))return;if(e.code==='Space'&&e.target.closest('button'))return;if(e.code==='Space'||e.code==='KeyJ'){if(blocked())return;e.preventDefault();strike();}},{signal});
 function tick(now){if(disposed)return;const dt=Math.min(.04,(now-(last||now))/1000);last=now;const p=getPlayer();model.paused=blocked()||doc.hidden;
  if(Math.abs(p-old)>.1)model.face=Math.sign(p-old);const moving=Math.abs(p-old)>.1;old=p;
  if(model.tick(dt,p)){sound('hurt');onHurt();old=getPlayer();say(model.hp?'앗! 부딪혔어. 잠깐 무적일 때 거리를 벌려 봐.':'잠깐 쉬자. 다시 도전해도 탐구 기록은 그대로야.',5);}
  const down=model.hp<=0;if(down)stop();health.textContent='리피 '+('♥'.repeat(model.hp))+('♡'.repeat(4-model.hp));health.setAttribute('aria-label','체력 '+model.hp+' / 4');retry.hidden=!down;attack.disabled=down||model.cooldown>0||model.paused;
  hud.hidden=!points.length;hero.hidden=false;const frame=model.hurtTime>0?7:model.attackTime>.2?4:model.attackTime>.1?5:model.attackTime>0?6:moving&&!reduced()?Math.floor(now/130)%4:0;
  pose(hero,frame,model.face);place(hero,pathPoint(p));hero.classList.toggle('is-hurt',model.hurtTime>0);hero.classList.toggle('is-striking',model.attackTime>0);
  for(const e of model.enemies){const n=nodes.get(e.id);place(n,pathPoint(e.d));n.hidden=false;n.classList.toggle('is-restored',e.cleared);n.classList.toggle('is-hit',e.hit>0);n.classList.toggle('is-winding',e.phase==='windup'&&!e.cleared);n.querySelector('.garden-enemy-hp').textContent=e.cleared?'표찰 복구 ✓':'표르 '+e.hp+'/'+e.max;pose(n.querySelector('.garden-sprite'),e.cleared?15:e.hit>0?15:e.phase==='windup'?12:e.phase==='lunge'?13:e.phase==='recover'?14:8+(reduced()?0:Math.floor(now/160)%4),p<e.d?1:-1);}
  if(now>noticeUntil)notice.hidden=true;raf=requestAnimationFrame(tick);
 }
 if(points.some(p=>progress[p.id]!==3))say('표찰을 뒤섞는 표르가 길에 나타났어! 가까이 가서 공격하고, 부딪히지 않게 피해 봐.',6);
 raf=requestAnimationFrame(tick);
 return {model,attack:strike,scale(){},position(){},destroy(){disposed=true;cancelAnimationFrame(raf);abort.abort();layer.remove();hud.remove();notice.remove();}};
}
