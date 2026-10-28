import {fieldResponse} from './response-tracking.js';
// New challenge evidence never replaces the original saved research records.
export const FIELD_LEAVES = [
 {id:'maple',name:'단풍나무',edge:true,narrow:false,shape:'손바닥처럼 여러 갈래',clue:'갈래 사이와 가장자리를 따라 작은 톱니를 봐.'},
 {id:'pine',name:'소나무',edge:false,narrow:true,shape:'바늘처럼 가늘고 길어',clue:'폭보다 길이가 훨씬 길어. 이 그림에는 큰 톱니가 없어.'},
 {id:'camellia',name:'동백나무',edge:true,narrow:false,shape:'넓고 타원에 가까워',clue:'반들반들한 잎도 가장자리에는 작은 톱니가 있어.'},
];
export const FIELD_ORDER=['winter','bud','spring'];
export const FIELD_ZONES=['pond','meadow','ridge'];
export const FIELD_ENV={pond:'water',meadow:'grass',ridge:'dry'};
export const FIELD_PLANTS={hyacinth:'water',cherry:'grass',aloe:'dry'};
const FLOAT_RESULT={air:'float',solid:'sink'};
const GARDEN_CLUE={hyacinth:'부레옥잠은 잎자루 속 공기로 물에 떠서 살아. 물이 고인 곳을 찾아 봐.',cherry:'벚나무는 땅속 뿌리로 흙의 물을 빨아들여. 빗물이 스며든 흙을 찾아 봐.',aloe:'알로에는 두꺼운 잎에 물을 저장해. 물이 금방 빠지는 마른 땅을 찾아 봐.'};
const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
const unique=(v,allowed)=>[...new Set(Array.isArray(v)?v.filter(x=>allowed.includes(x)):[])];
const map=(v,keys,values)=>Object.fromEntries(keys.filter(k=>values.includes(obj(v)[k])).map(k=>[k,v[k]]));
// The field bag has the same two parts as the core invention page, so its trials carry over as they are.
const BAG_PARTS=['surface','cover'];
export const fieldBagKey=d=>`${d.surface}:${d.cover}`;
const designOK=d=>['plain','lotus'].includes(d?.surface)&&['open','flap'].includes(d?.cover);
const copy=d=>({surface:d.surface,cover:d.cover});
// Saves from the three-part bag keep their first two parts.
const bagKey=k=>typeof k==='string'?k.split(':').slice(0,2).join(':').slice(0,70):'';
function comparisonRecords(b){
 const tests=(Array.isArray(b.tests)?b.tests:[]).filter(designOK).map(fieldBagTrial);
 return Object.fromEntries(BAG_PARTS.flatMap(part=>{
  const c=obj(b.comparisons)[part],before=tests.find(t=>t.key===bagKey(c?.before)),after=tests.find(t=>t.key===bagKey(c?.after));
  return before&&after&&c.part===part&&before[part]!==after[part]&&BAG_PARTS.filter(k=>k!==part).every(k=>before[k]===after[k])?[[part,{before:before.key,after:after.key,part}]]:[];
 }));
}
export const fieldBagTrial=d=>({...copy(d),key:fieldBagKey(d),rolls:d.surface==='lotus',notebookDry:d.cover==='flap'});
export function normalizeFieldEvidence(value){
 const v=obj(value),l=obj(v.leaves),s=obj(v.seasons),f=obj(v.float),g=obj(v.garden),b=obj(v.bag),c=obj(b.compared);
 return {version:1,
  leaves:{scans:Object.fromEntries(FIELD_LEAVES.map(p=>[p.id,unique(obj(l.scans)[p.id],['shape','edge'])])),edge:map(l.edge,FIELD_LEAVES.map(p=>p.id),['yes','no']),narrow:map(l.narrow,FIELD_LEAVES.map(p=>p.id),['yes','no'])},
  seasons:{predictions:map(s.predictions,['tree','herb'],['roots','none']),clues:map(s.clues,['tree','herb'],['branches','rootbud','color']),links:map(s.links,['tree','herb'],['trunk','root','leaf']),tree:Array.from({length:3},(_,i)=>FIELD_ORDER.includes(s.tree?.[i])?s.tree[i]:''),herb:Array.from({length:3},(_,i)=>FIELD_ORDER.includes(s.herb?.[i])?s.herb[i]:'')},
  // A model's resting place is seen the moment it goes in the tank, so the observation is recorded with the test.
  float:{predictions:map(f.predictions,['air','solid'],['float','sink']),tested:unique(f.tested,['air','solid']),observed:Object.fromEntries(unique(f.tested,['air','solid']).map(m=>[m,FLOAT_RESULT[m]])),reason:f.reason==='air'?'air':''},
  garden:{environments:map(g.environments,FIELD_ZONES,['water','grass','dry']),plants:map(g.plants,Object.keys(FIELD_PLANTS),FIELD_ZONES),testedKey:typeof g.testedKey==='string'?g.testedKey.slice(0,160):''},
  bag:{prediction:['surface','cover'].includes(b.prediction)?b.prediction:'',comparisons:comparisonRecords(b),design:designOK(b.design)?copy(b.design):{surface:'plain',cover:'open'},assembled:unique(b.assembled,BAG_PARTS),tests:(Array.isArray(b.tests)?b.tests:[]).filter(designOK).slice(-16).map(fieldBagTrial),compared:BAG_PARTS.includes(c.part)?{before:bagKey(c.before),after:bagKey(c.after),part:c.part}:{before:'',after:'',part:''},delivered:bagKey(b.delivered)},
 };
}
export const fieldEvidence=state=>state.fieldEvidence=normalizeFieldEvidence(state.fieldEvidence);
const ordered=a=>FIELD_ORDER.every((x,i)=>a[i]===x);
export const fieldGardenKey=g=>FIELD_ZONES.map(z=>g.environments[z]||'-').join(':')+'|'+Object.keys(FIELD_PLANTS).map(p=>g.plants[p]||'-').join(':');
export const fieldGardenValid=g=>FIELD_ZONES.every(z=>g.environments[z]===FIELD_ENV[z])&&Object.entries(FIELD_PLANTS).every(([p,env])=>FIELD_ENV[g.plants[p]]===env)&&new Set(Object.values(g.plants)).size===3;
export function fieldBagPair(b){
 const after=b.tests.at(-1);if(!after||after.key!==fieldBagKey(b.design))return null;
 const before=b.tests.slice(0,-1).reverse().find(t=>BAG_PARTS.filter(k=>t[k]!==after[k]).length===1);
 return before?{before,after,part:BAG_PARTS.find(k=>before[k]!==after[k])}:null;
}
export function fieldSteps(e,m){
 switch(m){
  case 0:return [['shape','edge'].every(k=>e.leaves.scans.maple.includes(k)),FIELD_LEAVES.every(p=>e.leaves.edge[p.id]===(p.edge?'yes':'no')),FIELD_LEAVES.every(p=>e.leaves.narrow[p.id]===(p.narrow?'yes':'no'))];
  case 1:return [e.seasons.links.tree==='trunk'&&e.seasons.links.herb==='root',ordered(e.seasons.tree)&&e.seasons.clues.tree==='branches',ordered(e.seasons.herb)&&e.seasons.clues.herb==='rootbud'];
  case 2:return [Object.keys(e.float.predictions).length===2,['air','solid'].every(m=>e.float.tested.includes(m)),e.float.observed.air==='float'&&e.float.observed.solid==='sink'&&e.float.reason==='air'];
  case 3:return [FIELD_ZONES.every(z=>e.garden.environments[z]===FIELD_ENV[z]),Object.entries(FIELD_PLANTS).every(([p,env])=>FIELD_ENV[e.garden.plants[p]]===env),fieldGardenValid(e.garden)&&e.garden.testedKey===fieldGardenKey(e.garden)];
  case 4:{const b=e.bag,p=fieldBagPair(b),c=b.compared;return [b.assembled.length===2,!!p,!!p&&c.before===p.before.key&&c.after===p.after.key&&c.part===p.part&&b.design.surface==='lotus'&&b.design.cover==='flap'&&b.delivered===fieldBagKey(b.design)];}
  default:return [false,false,false];
 }
}
export const fieldMissionReady=(state,m)=>Number.isInteger(m)&&m>=0&&m<5&&fieldSteps(normalizeFieldEvidence(state.fieldEvidence),m).every(Boolean);
const feedback=(u,message,success=false)=>{u.feedback=message;u.success=success;return message;};
const removeValue=(m,value)=>{for(const k of Object.keys(m))if(m[k]===value)delete m[k];};
export function applyFieldAction(state,ui,action,id=''){
 const before=JSON.stringify(state.fieldEvidence);
 const capture=fieldResponse(state,action,id);
 const result=applyFieldActionCore(state,ui,action,id);
 if(capture&&(before!==JSON.stringify(state.fieldEvidence)||ui.fieldMission?.feedback))capture(ui.fieldMission?.success===true);
 return result;
}
function applyFieldActionCore(state,ui,action,id=''){
 if(!action.startsWith('field-'))return false;
 const e=fieldEvidence(state),u=ui.fieldMission??={},[a,b,c]=String(id).split(':');
 if(action==='field-stage'){const m=Math.floor(state.page/2);if(Number(a)>0&&((m===1&&!['tree','herb'].every(k=>e.seasons.predictions[k]))||(m===4&&!e.bag.prediction)))return feedback(u,'관찰 전에 첫 예상을 먼저 남겨 줘. 첫 단계에서 골라 보자.');const n=Number(a);if(Number.isInteger(n)&&n>=0&&n<3){u.stage=n;u.mission=Math.floor(state.page/2);u.selected='';u.feedback='';}return '';}
 if(action==='field-select'){u.selected=id;return '';}
 if(action==='field-scan'){
  const p=FIELD_LEAVES.find(p=>p.id===a);if(!p||!['shape','edge'].includes(b))return '';
  if(!e.leaves.scans[a].includes(b))e.leaves.scans[a].push(b);
  return feedback(u,b==='shape'?`${p.name}: ${p.shape}.`:p.edge?'가장자리를 따라 작은 톱니가 이어져 있어.':'가장자리에서 큰 톱니가 보이지 않아.',true);
 }
 if(action==='field-sort'){
  const p=FIELD_LEAVES.find(p=>p.id===b);if(!p||!['edge','narrow'].includes(a)||!['yes','no'].includes(c))return '';
  if(!['shape','edge'].every(k=>e.leaves.scans.maple.includes(k)))return feedback(u,'먼저 단풍나무의 모양과 가장자리를 돋보기로 살펴봐.');
  e.leaves[a][b]=c;u.selected='';const ok=c===(p[a]?'yes':'no');return feedback(u,ok?`${p.name}을 같은 기준으로 놓았어.`:`리피: ${p.clue} 지금 기준은 ${a==='edge'?'톱니가 있는지':'가늘고 긴지'}야.`,ok);
 }
 if(action==='field-season-predict'){
  if(!['tree','herb'].includes(a)||!['roots','none'].includes(b)||e.seasons.predictions[a])return '';
  e.seasons.predictions[a]=b;return feedback(u,'처음 예상을 남겼어. 이제 겨울 땅속과 다음 봄을 비교해 봐.',true);
 }
 if(action==='field-season-clue'){
  if(!['tree','herb'].includes(a)||!['branches','rootbud','color'].includes(b))return '';
  e.seasons.clues[a]=b;const ok=b===(a==='tree'?'branches':'rootbud');return feedback(u,ok?'그림에서 다시 자란 부분을 근거로 골랐어.':'색깔만 보지 말고, 새눈이나 새싹이 어디에서 돋았는지 살펴봐.',ok);
 }
 if(action==='field-season-link'){
  if(!['tree','herb'].includes(a)||!['trunk','root','leaf'].includes(b))return '';
  e.seasons.links[a]=b;u.selected='';const ok=b===(a==='tree'?'trunk':'root');return feedback(u,ok?'겨울에 살아 있던 부분과 다음 봄 모습을 이었어.':a==='tree'?'리피: 잎이 떨어져도 같은 나무의 줄기와 뿌리가 살아 있어.':'리피: 땅 위가 시들어도 땅속에 살아 있던 뿌리에서 새싹이 나와.',ok);
 }
 // The time dial deals photos in order; a full turn of the hand records the plant's own time.
 if(action==='field-season-turn'){
  if(!['tree','herb'].includes(a))return '';e.seasons[a]=[...FIELD_ORDER];return feedback(u,'겨울에 살아 있던 부분에서 다시 자라는 시간을 지켜봤어.',true);
 }
 if(action==='field-order'){
  const slot=Number(c);if(!['tree','herb'].includes(a)||!FIELD_ORDER.includes(b)||!Number.isInteger(slot)||slot<0||slot>2)return '';
  const order=[...e.seasons[a]],from=order.indexOf(b),occupant=order[slot];if(from>=0)order[from]=occupant||'';order[slot]=b;e.seasons[a]=order;u.selected='';
  return feedback(u,ordered(order)?'같은 식물이 겨울을 지나 다시 자라는 순서를 만들었어.':'살아 있던 부분 → 새로 돋는 모습 → 자란 모습을 사진으로 이어 봐.',ordered(order));
 }
 if(action==='field-predict'){
  if(!['air','solid'].includes(a)||!['float','sink'].includes(b))return '';if(e.float.tested.includes(a))return feedback(u,'이미 시험했어. 처음 예상과 실제 결과를 견줘 봐.');
  if(e.float.predictions[a])return feedback(u,'처음 예상은 보관했어. 관찰 결과에서 달라진 생각을 기록하자.');e.float.predictions[a]=b;u.selected='';return feedback(u,'예상을 놓았어. 이제 같은 물 수조에 두 모형을 넣어 보자.',true);
 }
 if(action==='field-test-model'){
  if(!['air','solid'].includes(a))return '';if(!e.float.predictions[a])return feedback(u,'물에 넣기 전에 이 모형이 어떻게 될지 예상 표시를 옮겨 줘.');
  const result=FLOAT_RESULT[a];if(!e.float.tested.includes(a))e.float.tested.push(a);e.float.observed[a]=result;u.selected='';return feedback(u,`${a==='air'?'공기 공간이 있는 모형은 수면에 떠 있어.':'공간 없이 무겁게 채운 비교 모형은 바닥으로 내려갔어.'} ${e.float.predictions[a]===result?'예상과 같아!':'예상과 달랐어. 본 결과로 생각을 고쳐 보자.'}`,true);
 }
 if(action==='field-model-reason'){
  if(!['air','solid'].every(m=>e.float.tested.includes(m)))return feedback(u,'두 모형을 같은 수조에서 시험한 뒤 비교하자.');if(a!=='air')return feedback(u,'겉 크기는 같아. 안에 공기가 차지하는 공간이 있는 모형을 찾아 줘.');
  e.float.reason='air';u.selected='';return feedback(u,'공기 공간과 뜨는 결과를 연결했어. 부레옥잠의 부푼 잎자루를 이해하는 원리 모형이야.',true);
 }
 if(action==='field-place-environment'){
  if(!['water','grass','dry'].includes(a)||!FIELD_ZONES.includes(b))return '';removeValue(e.garden.environments,a);e.garden.environments[b]=a;e.garden.testedKey='';u.selected='';const ok=FIELD_ENV[b]===a;
  return feedback(u,ok?'빗물이 머무르는 모습과 환경을 이었어.':'자리의 빗물 단서를 봐. 오래 고여 있어, 고르게 배어들어, 아니면 빠르게 빠져?',ok);
 }
 // One rain on the three bare beds shows where water pools, soaks in, or runs off; that makes each bed's ground.
 if(action==='field-garden-ground'){
  FIELD_ZONES.forEach(z=>{e.garden.environments[z]=FIELD_ENV[z];});e.garden.testedKey='';return feedback(u,'빗물이 고인 곳은 물가, 스며든 곳은 풀밭, 흘러간 곳은 건조한 곳이 됐어.',true);
 }
 // A plant only goes into ground that suits it; a wrong bed keeps the card and says why.
 if(action==='field-place-plant'){
  if(!Object.hasOwn(FIELD_PLANTS,a)||!FIELD_ZONES.includes(b))return '';if(!FIELD_ZONES.every(z=>e.garden.environments[z]))return feedback(u,'먼저 구름을 눌러 비를 내리고 땅을 살펴봐.');
  u.selected='';if(FIELD_ENV[b]!==FIELD_PLANTS[a]){u.gardenMiss=b;return feedback(u,GARDEN_CLUE[a],false);}
  removeValue(e.garden.plants,b);e.garden.plants[a]=b;e.garden.testedKey='';return feedback(u,'딱 맞는 땅이야! 식물의 특징과 땅의 환경이 잘 맞아.',true);
 }
 if(action==='field-garden-rain'){
  if(!fieldGardenValid(e.garden))return feedback(u,'아직 맞지 않는 자리가 있어. 먼저 물이 오래 고이는지, 흙에 배어드는지, 빠르게 빠지는지 봐. 식물 한 개의 특징과 연결하고 다시 시험해 봐.');
  e.garden.testedKey=fieldGardenKey(e.garden);return feedback(u,'복구 성공! 물가·풀밭·건조한 곳에 각각 알맞은 식물을 심었어.',true);
 }
 if(action==='field-bag-predict'){
  if(!['surface','cover'].includes(a)||e.bag.prediction)return '';e.bag.prediction=a;return feedback(u,'처음 예상을 남겼어. 부품을 조립하고 비로 확인하자.',true);
 }
 if(action==='field-bag-part'){
  if(!BAG_PARTS.includes(a)||!(a==='surface'?['plain','lotus']:['open','flap']).includes(b))return '';e.bag.design[a]=b;if(!e.bag.assembled.includes(a))e.bag.assembled.push(a);e.bag.delivered='';u.selected='';return feedback(u,'부품을 조립했어. 시험할 때는 한 번에 하나만 바꿔 보자.',true);
 }
 if(action==='field-bag-test'){
  const b=e.bag;if(b.assembled.length!==2)return feedback(u,'두 자리의 부품을 먼저 직접 조립해 줘.');const t=fieldBagTrial(b.design);if(b.tests.at(-1)?.key===t.key)return feedback(u,'이 시험은 이미 있어. 부품 하나를 바꿔서 달라진 까닭을 비교해 봐.');
  b.tests.push(t);if(b.tests.length>16)b.tests.shift();b.delivered='';return feedback(u,`같은 비 10방울! 겉면 물방울 ${t.rolls?'잘 굴러감':'남아 있음'} · 안쪽 공책 ${t.notebookDry?'마름':'젖음'}.`,true);
 }
 if(action==='field-bag-compare'){
  const p=fieldBagPair(e.bag);if(!p)return feedback(u,'겉면과 입구 덮개 중 하나만 다른 두 시험이 필요해. 나머지 부품은 그대로 두자.');if(a!==p.part)return feedback(u,p.part==='surface'?'입구 덮개는 같아. 바뀐 겉면과 물방울 움직임을 봐.':'겉면은 같아. 입구 덮개와 공책의 젖음을 봐.');
  e.bag.compared={before:p.before.key,after:p.after.key,part:p.part};e.bag.comparisons[p.part]={...e.bag.compared};u.selected='';return feedback(u,FIELD_BAG_ROLES[a],true);
 }
 if(action==='field-bag-deliver'){
  const b=e.bag,p=fieldBagPair(b);if(!p||b.compared.before!==p.before.key||b.compared.after!==p.after.key||b.compared.part!==p.part)return feedback(u,'부품 하나만 바꾼 두 시험을 비교하고 바뀐 부품을 연결해 줘.');
  if(b.design.surface!=='lotus'||b.design.cover!=='flap')return feedback(u,'물방울은 잘 굴러가고, 안쪽 공책은 마르게 설계해 줘.');
  b.delivered=fieldBagKey(b.design);return feedback(u,`탐험 가방 완성! 이번 비교로 확인한 역할: ${FIELD_BAG_ROLES[p.part]} 나머지 부품은 이 비교만으로 확인했다고 할 수 없어.`,true);
 }
 return false;
}

export const FIELD_BAG_ROLES={surface:'연잎 겉면은 물방울이 굴러가는 데 도움을 줘.',cover:'입구 덮개는 안쪽 공책으로 들어오는 비를 막아.'};
