// 남은 활동 안내: what still blocks "다음" on the current activity page, and where to tap first.
// The checks mirror model.js pageReady() item by item, so the list and the locked button never disagree.
// Each item: {key,label,done,sub?,target?,tip?,jump?,anchor?}. target = selector inside <main class="activity"> for the
// pointing hand; jump = [action,id] that brings that control on screen (tab, plant card, season stop).
// The hand never tells the answer. It never points at a choice, never names the leaf that is wrong, and never lies over the
// choices: a question line is marked from above (anchor 'ask'), a picture or a row by its bottom edge (anchor 'edge').
import {PLANTS,HABITAT_PLANTS,HABITATS,TERRAIN_MIN,terrainCount,gardenValid,pageReady,designKey,currentTrial,comparisonPair,inventionEvidence,classificationComplete} from './model.js';
import {checkClassification,classificationKey,seasonEvidenceReady} from './inquiry.js';
import {fieldSteps,normalizeFieldEvidence,fieldMissionReady} from './field-missions-state.js';
import {fieldTodo,fieldStageLabels} from './field-missions.js';
import {icon} from './art.js';
import {josa} from './josa.js';

const esc=t=>String(t??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const sel=(action,id)=>`[data-action="${action}"]`+(id===undefined?'':`[data-id="${id}"]`);
const seasonName=id=>id==='cherry'?'벚나무':'씀바귀';
const item=(key,label,done,rest={})=>({key,label,done:!!done,...rest});
// A question line: the hand comes from above, so its body never rests on the answers below.
const ask=(target,tip)=>({target,tip,anchor:'ask'});

function leavesItems(s,u){
 return PLANTS.map(p=>{
  const e=s.leafEvidence[p.id]||{},sub=[{id:'shape',label:'모양',done:!!e.shape},{id:'edge',label:'가장자리',done:!!e.edge}],left=sub.find(x=>!x.done)?.id;
  const region=u.region||'shape',here=u.plant===p.id;
  const recheck=here&&u.recheck===`${p.id}:${left}`;
  const target=!here?sel('specimen',p.id):region!==left?sel('region',left):recheck?'.feature-choices [data-action="region"]':'.specimen-stage',anchor=target==='.specimen-stage'?'edge':undefined;
  const tip=!here?`${p.name} 잎을 눌러 봐`:region!==left?(left==='shape'?'잎 전체 보기를 눌러 봐':'가장자리 보기를 눌러 봐'):recheck?'잎을 다시 살펴보기를 눌러 봐':(left==='shape'?'잎 모양을 보고 아래에서 골라 봐':'가장자리를 보고 톱니가 있는지 골라 봐');
  return item('leaf:'+p.id,p.name,!left,{sub,target,tip,anchor,jump:!here?['specimen',p.id]:region!==left?['region',left]:null});
 });
}
function classifyItems(s,u){
 const rule=s.rule,right=p=>s.groups[p.id]===(p[rule]?'yes':'no'),placed=PLANTS.filter(p=>s.groups[p.id]),allPlaced=placed.length===PLANTS.length;
 const checked=u.ruleCheck?.key===classificationKey(s)?u.ruleCheck:classificationComplete(s,rule)?checkClassification(s):null;
 const unplaced=PLANTS.find(p=>!s.groups[p.id]),wrong=!!checked?.conflicts;
 const sortTarget=unplaced?(u.selected===unplaced.id?'.sort-bins':`.sort-tray .plant-card[data-id="${unplaced.id}"]`):wrong?'.rule-result':sel('check-rule');
 const sortTip=unplaced?(u.selected===unplaced.id?'상자를 눌러 넣어 봐':`${unplaced.name} 잎을 눌러 봐`):wrong?'기준과 다른 잎이 있어. 상자에서 꺼내 다시 넣어 봐':'내 분류 확인하기를 눌러 봐';
 const items=[item('sort',`잎 상자에 넣기 ${placed.length}/3`,allPlaced&&PLANTS.every(right),{target:sortTarget,tip:sortTip,anchor:sortTarget==='.sort-bins'?'edge':undefined}),
  item('check','내 분류 확인하기',!!checked?.valid,{target:sel('check-rule'),tip:'내 분류 확인하기를 눌러 봐'})];
 if(!fieldMissionReady(s,0))items.push(item('proof','어떤 관찰로 나눴는지 고르기',classificationComplete(s,rule),ask('.reason-cards > p','관찰한 특징을 골라 봐')));
 return items;
}
function seasonsItems(s){
 return ['cherry','sowthistle'].map(plant=>{
  const has=n=>s.seasonalRecords.includes(`${plant}:${n}`)&&!!s.seasonPhotos[`${plant}:${n}`];
  const sub=[{id:3,label:'겨울',done:has(3)},{id:0,label:'다음 봄',done:has(0)}],n=sub.find(x=>!x.done)?.id;
  let target=null,tip='',jump=null,anchor;
  if(s.seasonPlant!==plant){target=sel('season-plant',plant);tip=`${seasonName(plant)} 탭을 눌러 봐`;jump=['season-plant',plant];}
  else if(s.season!==n){target=sel('season',String(n));tip=n===3?'시간을 겨울로 옮겨 봐':'시간을 다음 봄으로 옮겨 봐';jump=['season',String(n)];}
  else if(n===3&&!s.seasonPrediction[plant]){target='.prediction > p';tip='땅속에 무엇이 있을지 예상해 봐';anchor='ask';}
  else if(n===3&&!s.undergroundSeen.includes(plant)){target=sel('underground');tip='땅속 보기를 눌러 봐';}
  else{target=sel('record-season');tip='찍어서 연구 노트에 붙여 봐';}
  return item('season:'+plant,seasonName(plant)+' 사진',n===undefined,{sub,target,tip,jump,anchor});
 });
}
function compareItems(s){
 return ['cherry','sowthistle'].map(plant=>{
  const here=s.seasonPlant===plant,photos=here?seasonEvidenceReady(s):[3,0].every(n=>s.seasonPhotos[`${plant}:${n}`]&&s.seasonalRecords.includes(`${plant}:${n}`));
  const target=!here?sel('season-plant',plant):!photos?sel('previous'):'.season-question > p';
  const tip=!here?`${seasonName(plant)} 탭을 눌러 봐`:!photos?'앞 활동에서 사진을 먼저 찍어 줘':'무슨 일이 있었는지 골라 봐';
  return item('explain:'+plant,seasonName(plant)+'의 겨울과 다음 봄',s.seasonExplained.includes(plant),{target,tip,anchor:target==='.season-question > p'?'ask':undefined,jump:!here?['season-plant',plant]:!photos?['previous']:null});
 });
}
function experimentItems(s){
 const n=s.experiment.step;
 return [item('cut','잎자루 잘라 보기',n>=1,{target:sel('lab-next','cut'),tip:'잎자루 잘라 보기를 눌러 봐'}),
  item('water','물속에 넣기',n>=3,{target:sel('lab-next','water'),tip:'물속에 넣기를 눌러 봐'}),
  item('press','물속에서 눌러 보기',n>=4,{target:sel('press-petiole'),tip:s.experiment.prediction?'잎자루를 눌러 봐':'예상을 고르고 잎자루를 눌러 봐'}),
  item('answer','공기 방울의 까닭 고르기',s.experimentAnswer==='air',ask('.reason-cards > p','무엇을 알 수 있는지 골라 봐'))];
}
function habitatItems(s,u){
 const done=id=>{const p=HABITAT_PLANTS.find(q=>q.id===id);return s.habitats[id]===p.habitat&&s.habitatFeatures[id]===id&&s.reasons[id]===id;};
 const shown=HABITAT_PLANTS.find(q=>q.id===u.habitatPlant)||HABITAT_PLANTS.find(q=>!done(q.id))||HABITAT_PLANTS[0];
 return HABITAT_PLANTS.map(p=>{
  const here=shown.id===p.id,placed=s.habitats[p.id]===p.habitat;
  const target=!here?sel('habitat-plant',p.id):'.habitat-question',tip=!here?`${p.name} 탭을 눌러 봐`:!placed?'사는 곳을 골라 봐':'도움이 되는 특징을 골라 봐';
  return item('habitat:'+p.id,p.name+' 사는 곳 → 특징',done(p.id),{target,tip,anchor:here?'ask':undefined,jump:!here?['habitat-plant',p.id]:null});
 });
}
function plantItem(s,u,p,withReason){
 const cell=s.garden[p.id],planted=Number.isInteger(cell),fits=planted&&s.terrain[cell]===p.habitat,picked=u.gardenMode==='plant'&&u.selected===p.id;
 const reason=s.gardenReasons.includes(p.id),land=HABITATS[p.habitat];
 let target,tip,jump=null,anchor;
 if(!fits){if(!picked){target=`.garden-plant-pick[data-id="${p.id}"]`;tip=`${p.name} 카드를 눌러 봐`;jump=['select-plant',p.id];}else{target='.garden-frame';tip=planted?`${josa(land,'으로/로')} 끌어서 옮겨 봐`:`${land} 칸을 눌러 심어 봐`;}}
 else if(withReason&&!reason){if(!picked){target=`.garden-plant-pick[data-id="${p.id}"]`;tip=`${p.name} 카드를 눌러 봐`;jump=['select-plant',p.id];}else{target='.reason-cards > p';tip='심은 까닭을 골라 봐';anchor='ask';}}
 const sub=withReason?[{id:'spot',label:'자리',done:fits},{id:'why',label:'까닭',done:reason}]:undefined;
 return item('plant:'+p.id,withReason?p.name:`${p.name} 심기`,fits&&(!withReason||reason),{sub,target,tip,jump,anchor});
}
function terrainItems(s,u){
 const lands=Object.entries(HABITATS).map(([id,name])=>{const n=terrainCount(s,id),painting=u.gardenMode!=='plant'&&u.brush===id;
  return item('land:'+id,`${name} ${Math.min(n,TERRAIN_MIN)}/${TERRAIN_MIN}칸`,n>=TERRAIN_MIN,{target:painting?'.garden-frame':sel('brush',id),tip:painting?'정원 칸을 눌러 칠해 봐':`${name} 타일을 눌러 봐`,jump:painting?null:['brush',id]});});
 // Land first: until the three areas exist, a plant row points where the land is painted.
 const land=lands.find(l=>!l.done);
 return [...lands,...HABITAT_PLANTS.map(p=>{const it=plantItem(s,u,p,false);return land&&!it.done?{...it,target:land.target,tip:land.tip,jump:land.jump}:it;})];
}
function gardenItems(s,u){
 const plants=HABITAT_PLANTS.map(p=>plantItem(s,u,p,true));
 if(gardenValid(s)||s.gardenPick)plants.push(item('pick','내 정원 확인',s.completed[7]||!!s.gardenPick,ask('.garden-confirm > p','소개할 자리 하나를 골라 봐')));
 return plants;
}
function designItems(s){
 const seen=s.design.observed||s.design.linked;
 return [item('drop','물방울 떨어뜨려 보기',seen,{target:sel('lotus-drop'),tip:'물방울 떨어뜨리기를 눌러 봐'}),
  item('link','가방에 쓸 특징 고르기',s.design.linked,ask('.reason-cards > p','연잎의 특징을 골라 봐')),
  item('predict','어느 가방이 덜 젖을지 예상하기',s.completed[8]||!!s.testPrediction,ask('.invention-brief > p','먼저 예상해 봐'))];
}
function testItems(s,u){
 const last=currentTrial(s),pair=comparisonPair(s),proof=inventionEvidence(s),finished=s.design.surface==='lotus'&&s.design.cover==='flap';
 let target=null,tip='',anchor;
 if(u.testing){tip='비가 내리는 중…';}
 else if(!last){const reuse=s.tests.some(t=>t.key===designKey(s.design));target=sel(reuse?'use-tested-design':'run-test');tip=reuse?'이 설계의 시험 기록 사용하기를 눌러 봐':'비 뿌리기를 눌러 봐';}
 else if(pair&&!proof[pair.part]){target='.comparison-question > p';tip='무엇이 달라졌는지 골라 봐';anchor='ask';}
 else if(!proof.surface){target=sel('surface',s.design.surface==='lotus'?'plain':'lotus');tip='겉면 하나만 바꿔 봐';}
 else if(!proof.cover){target=sel('cover',s.design.cover==='flap'?'open':'flap');tip='입구 덮개만 바꿔 봐';}
 else if(!finished){target=sel(s.design.surface!=='lotus'?'surface':'cover',s.design.surface!=='lotus'?'lotus':'flap');tip='연잎 겉면과 덮개를 모두 달아 봐';}
 else{target=sel('run-test');tip='완성 가방에 비를 뿌려 봐';}
 const items=[item('surface','겉면 역할 발견',proof.surface),item('cover','덮개 역할 발견',proof.cover),item('final','연잎 겉면 + 덮개 가방 시험',!!last&&finished&&s.design.linked)];
 const next=items.find(i=>!i.done);if(next){next.target=target;next.tip=tip;next.anchor=anchor;}
 return items;
}
function fieldItems(s,u){
 const i=Math.floor(s.page/2),e=normalizeFieldEvidence(s.fieldEvidence),done=fieldSteps(e,i),todo=fieldTodo(s,u,s.page),stage=u.fieldMission?.stage??0;
 return fieldStageLabels(i).map((label,n)=>{
  const current=n===stage,target=done[n]?null:todo?.currentDone?(n===todo.i?'.objective-next':null):current?null:`.today-steps ${sel('field-stage',n)}`;
  const tip=!target?'':todo?.currentDone?'다음 도전을 눌러 봐':`${n+1}번 임무를 눌러 봐`;
  return item('stage:'+n,label,done[n],{target,tip,jump:current||done[n]?null:['field-stage',String(n)]});
 });
}

// The guide for the current activity: items, the first one left, and where the hand should point.
export function activityGuide(s,u={}){
 if(s.screen!=='activity')return null;
 const p=s.page,i=Math.floor(p/2),field=u.activityMode==='field';
 const ready=field?fieldMissionReady(s,i):pageReady(s,p);
 const builders=[leavesItems,classifyItems,seasonsItems,compareItems,experimentItems,habitatItems,terrainItems,gardenItems,designItems,testItems];
 let items=field?fieldItems(s,u):(builders[p]||(()=>[]))(s,u);
 // A page saved as done under an earlier rule stays done: nothing is left to do on it.
 if(ready)items=items.map(it=>({...it,done:true,sub:it.sub?.map(x=>({...x,done:true}))}));
 // What is in front of the student comes first (the open tab, the picked card); only then the first item left.
 const undone=items.filter(it=>!it.done),next=undone.find(it=>!it.jump)||undone[0]||null,left=undone.length;
 const target=ready?null:next?.target||null,tip=ready?'다 했어! 아래 버튼을 눌러 봐':next?.tip||'';
 return {field,ready,items,next,left,target,tip,anchor:next?.anchor||'in'};
}

const HAND=`<svg viewBox="0 0 48 56" aria-hidden="true"><image href="/assets/generated/guide_hand_leaf.webp" width="48" height="56"/></svg>`;
export const handIcon=(cls='')=>`<span class="guide-hand ${cls}">${HAND}</span>`;

// Left panel block: every item of this page with ✓ / ○, the pointing hand beside the first one left.
export function renderRemaining(guide){
 if(!guide||guide.field)return '';
 const subs=it=>it.sub?`<small class="remaining-subs">${it.sub.map(x=>`<i class="${x.done?'done':''}">${x.done?'✓':'○'} ${esc(x.label)}</i>`).join('')}</small>`:'';
 const rows=guide.items.map(it=>{const next=it===guide.next;return `<li class="${it.done?'done':next?'next':''}"><button type="button" data-action="guide-jump" data-id="${esc(it.key)}" ${next?'aria-current="step"':''}><span class="remaining-mark">${it.done?icon('check',14):next?handIcon('mini'):'○'}</span><span class="remaining-label">${esc(it.label)}${subs(it)}</span></button></li>`;}).join('');
 const head=guide.ready?`${icon('check',18)} 다 했어! 다음으로 가 보자`:`남은 활동 <b>${guide.left}</b>`;
 return `<section class="remaining-list ${guide.ready?'all-done':''}" aria-label="남은 활동"><h3>${head}</h3><ol>${rows}</ol></section>`;
}

// The hand on the stage: its fingertip rests on the control to tap next; the tip chip says what to do there.
// Nothing moves except the hand (targets never move: a moving button is hard to tap).
export function mountGuideFinger(main,guide){
 // A long list scrolls inside 오늘의 연구 (Leafy and the bubble stay put): keep the row to do next in view.
 const row=main?.querySelector('.remaining-list li.next'),panel=row?.closest('.today-panel');
 if(panel){const gap=row.getBoundingClientRect().bottom-panel.getBoundingClientRect().bottom;if(gap>0)panel.scrollTop+=gap+8;}
 if(!main||!guide?.target)return ()=>{};
 const target=main.querySelector(guide.target);if(!target)return ()=>{};
 const el=document.createElement('div');el.className='guide-finger';el.setAttribute('aria-hidden','true');
 el.innerHTML=`${HAND}<span class="guide-finger-tip">${esc(guide.tip)}</span>`;
 main.append(el);main.dataset.guideTarget=guide.target;
 const place=()=>{
  const m=main.getBoundingClientRect(),t=target.getBoundingClientRect();
  if(!t.width||!t.height){el.classList.add('off');return;}
  el.classList.remove('off');
  // 'edge': the fingertip touches the bottom edge of a picture or a row, so no single choice is singled out.
  // 'ask': the fingertip rests on the first words of a question and the hand hangs above it, never over the answers.
  const edge=guide.anchor==='edge',askLine=guide.anchor==='ask';
  const x=t.left-m.left+(askLine?Math.min(26,t.width*.5):t.width*.5),below=t.top-m.top+(edge?t.height+4:t.height*.78),above=t.top-m.top+(edge?-4:askLine?Math.min(18,t.height*.5):t.height*.22);
  // The hand sits below the target; near the bottom of the frame (or on a question line with room above) it comes from above.
  const fromAbove=below+70>m.height||(askLine&&above>=76);el.classList.toggle('above',fromAbove);
  el.style.left=`${Math.round(x)}px`;el.style.top=`${Math.round(fromAbove?above:below)}px`;
  // The tip chip (up to 210px, 34px right of the fingertip) would leave the frame on the right: put it on the left instead.
  el.classList.toggle('flip',x>m.width-260);
 };
 place();
 const observer=typeof ResizeObserver==='function'?new ResizeObserver(place):null;observer?.observe(main);observer?.observe(target);
 document.addEventListener('scroll',place,true);window.addEventListener('resize',place);
 const timers=[160,600,1500].map(ms=>setTimeout(place,ms));
 return ()=>{observer?.disconnect();document.removeEventListener('scroll',place,true);window.removeEventListener('resize',place);timers.forEach(clearTimeout);el.remove();delete main.dataset.guideTarget;};
}
// A locked "다음" was tapped: bring the next control into view and make the hand (and its list row) jump once.
export function nudgeGuide(main){
 if(!main)return false;
 const el=main.querySelector('.guide-finger'),target=main.dataset.guideTarget?main.querySelector(main.dataset.guideTarget):null;
 target?.scrollIntoView?.({block:'nearest',inline:'nearest',behavior:'smooth'});
 for(const node of [el,main.querySelector('.remaining-list li.next')]){if(!node)continue;node.classList.remove('jump');void node.offsetWidth;node.classList.add('jump');}
 return !!(el||target);
}
