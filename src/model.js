import {emptyLearningRecords,normalizeLearningRecords,learningStamp,normalizeNotebook} from './learning-records.js';
import {normalizeFieldEvidence,fieldMissionReady} from './field-missions-state.js';
import {normalizeBuds} from './winter-buds.js';
export const STORAGE_KEY = 'green-garden-mvp-v2';
export const LEGACY_STORAGE_KEY = 'green-garden-mvp-v1';
export const PLANTS = [
  {id:'cherry',name:'벚나무',edge:true,narrow:false,shape:'넓고 끝이 뾰족한 잎',edgeText:'가장자리에 톱니가 있어',habitat:'grass',reason:'땅에 뿌리를 내려 물을 빨아들여'},
  {id:'ginkgo',name:'은행나무',edge:false,narrow:false,shape:'부채처럼 넓게 펼쳐진 잎',edgeText:'가장자리에 톱니가 없어'},
  {id:'grass',name:'강아지풀',edge:false,narrow:true,shape:'가늘고 길쭉한 잎',edgeText:'가장자리에 톱니가 없어'},
];
export const HABITAT_PLANTS = [
  {id:'hyacinth',name:'부레옥잠',habitat:'water',reason:'잎자루 속 공기가 물에 뜨는 데 도움을 줘'},
  {id:'aloe',name:'알로에',habitat:'dry',reason:'두꺼운 잎에 물을 저장해'},
  PLANTS[0],
];
export const HABITATS = {water:'물가',grass:'풀밭',dry:'건조 구역'};
export const MISSIONS = [
  {name:'식물 기록 보관소',short:'관찰과 분류',npc:'leaf',evidence:'표본 관찰·분류 기록',desc:'잎 속에 숨은 단서를 찾아봐!',color:'#638948'},
  {name:'계절 관찰 돔',short:'계절과 생활',npc:'flower',evidence:'계절 생활 증거',desc:'시간을 움직여 겨울의 비밀을 찾아봐.',color:'#bd805b'},
  {name:'환경 실험실',short:'환경과 특징',npc:'water',evidence:'환경 연결 보고서',desc:'식물은 어떤 곳에서 살아갈까?',color:'#568f9a'},
  {name:'우리의 연구정원',short:'정원 만들기',npc:'leaf',evidence:'나의 연구정원 설계도',desc:'연구한 식물에게 알맞은 집을 만들어 줘.',color:'#7e9643'},
  {name:'식물 발명 공방',short:'발명과 개선',npc:'flower',evidence:'발명품 테스트 보고서',desc:'식물의 지혜로 생활 문제를 해결해 봐.',color:'#af8261'},
];
export const PAGES = [
  [
    "잎을 살펴봐요",
    "잎의 모양과 가장자리를 보고, 보이는 특징을 골라 줘."
  ],
  [
    "잎을 나누어 봐요",
    "기준 하나를 골라 새로운 잎을 나누어 봐. 다른 기준은 더 해 봐도 좋아."
  ],
  [
    "계절을 바꿔 봐요",
    "벚나무와 씀바귀의 겨울·다음 봄을 찍어 줘."
  ],
  [
    "겨울과 봄을 비교해요",
    "두 그림에서 달라진 모습을 찾아 줘."
  ],
  [
    "잎자루를 살펴봐요",
    "잎을 받치는 부분인 잎자루를 물속에서 눌러 봐."
  ],
  [
    "식물이 사는 곳",
    "식물이 살 곳과 그곳에서 도움이 되는 특징을 골라 줘."
  ],
  [
    "정원 꾸미기",
    "땅을 쓸어 물가·풀밭·건조 구역을 만들어 줘."
  ],
  [
    "정원에 식물을 심어요",
    "식물을 고르고 땅을 누른 뒤, 그곳에 심은 까닭을 골라 줘."
  ],
  [
    "나의 탐험 가방 만들기",
    "연잎의 물방울을 살펴보고 가방에 쓸 특징을 골라 줘."
  ],
  [
    "비 뿌리고 비교해요",
    "부품 하나만 바꾸어 시험하고, 달라진 까닭을 골라 줘."
  ]
];
// Index 4 (초봄) is a view-only stop between winter and the next spring; records keep keys 0-3.
export const SEASONS=['봄','여름','가을','겨울','초봄'];
export function freshState() {
  return {version:2,learningRecords:emptyLearningRecords(),fieldBridges:Array(5).fill(false),notebook:normalizeNotebook(),fieldEvidence:normalizeFieldEvidence(null),journeyRequired:Array(5).fill(false),legacyCompleted:[],legacyFinished:false,leafEvidence:{},groupsByRule:{edge:{},narrow:{}},classificationEvidence:{},seasonPhotos:{},seasonExplanation:'',seasonExplained:[],habitatFeatures:{},experimentAnswer:'',gardenReviewed:false,testExplanation:null,inventionRevision:2,inventionExplanations:{},testPrediction:'',activeTestKey:'',seasonPrediction:{},undergroundSeen:[],budsFound:normalizeBuds(),misses:Array(5).fill(0),stamps:{direct:[],fixed:[],helped:[],unknown:[]},sharing:{status:'pending',question:'',response:''},highlight:0,screen:'home',page:0,completed:Array(10).fill(false),observation:{cherry:[],ginkgo:[],grass:[]},rule:'edge',groups:{},seasonPlant:'cherry',season:1,underground:false,seasonalRecords:[],linkedEvidence:[],experiment:{step:0,compared:false,prediction:''},habitats:{},reasons:{},terrain:Array(24).fill('empty'),garden:{},gardenExtras:[],gardenReasons:[],gardenPick:'',design:{surface:'plain',cover:'open',linked:false},tests:[],reportSubmitted:[],finalChecks:{classification:false,habitat:false,garden:false,invention:false},finished:false,gardenTheme:'pink',largeText:false,soundEnabled:true,adminUnlocked:false};
}
export function presetTerrain(){return Array.from({length:24},(_,i)=>['water','grass','dry'][Math.floor((i%6)/2)]);}
export function evidenceCount(s){return MISSIONS.filter((_,i)=>s.completed[i*2]&&s.completed[i*2+1]).length;}
export function missionDone(s,i){return !!(s.completed[i*2]&&s.completed[i*2+1]);}
export const GARDEN_THEMES=['pink','yellow','blue'];
export function rewardCount(s){return MISSIONS.reduce((n,_,i)=>n+Number(missionDone(s,i)),0);}
export function canChooseGardenTheme(s){return missionDone(s,1);}
export function openMission(s,i){return Number.isInteger(i)&&i>=0&&i<MISSIONS.length&&(s.adminUnlocked===true||i===0||missionDone(s,i-1));}
export const PAGE_ROUTES=[{screen:'home',label:'메인'},{screen:'map',label:'스테이지 선택'},...PAGES.map(([label],page)=>({screen:'activity',page,label})),{screen:'report',label:'최종 연구 보고'},{screen:'final',label:'최종 시운전'},{screen:'ending',label:'엔딩 · 인증서'}];
export function routeIndex(s){return PAGE_ROUTES.findIndex(r=>r.screen===s.screen&&(r.screen!=='activity'||r.page===s.page));}
export function previousRoute(s){return PAGE_ROUTES[Math.max(0,routeIndex(s)-1)];}
export function designKey(d){return `${d.surface}:${d.cover}`;}
export function testDesign(d){return {key:designKey(d),surface:d.surface,cover:d.cover,clean:d.surface==='lotus',dry:d.cover==='flap'};}
export const TERRAIN_MIN=3;
export function terrainCount(s,t){return s.terrain.filter(x=>x===t).length;}
export function terrainReady(s){return ['water','grass','dry'].every(t=>terrainCount(s,t)>=TERRAIN_MIN);}
// Proof for a classification must be an observation of the same kind as the rule.
export const RULE_FEATURE={edge:'edge',narrow:'shape'};
export function proofFits(rule,feature){return RULE_FEATURE[rule]===feature;}
// Stamps (equal praise, not grades): 'direct' = found without a wrong pick, 'fixed' = fixed after wrong picks.
// Given once, on the mission's first completion. Completed results and rewards are never cleared.
export const STAMP_KINDS=['direct','fixed','helped','unknown'];
export function addMiss(s,i){if(!missionDone(s,i))s.misses[i]=(s.misses[i]||0)+1;}
export function missionStamps(s,i){if(!s.learningRecords?.[i]?.known)return missionDone(s,i)?['unknown']:[];const kinds=STAMP_KINDS.filter(k=>s.stamps[k]?.includes(i));return kinds.length?kinds:missionDone(s,i)?[learningStamp(s,i)]:[];}
export function awardStamp(s,i){
  if(missionDone(s,i)||missionStamps(s,i).length)return null;
  const kind=learningStamp(s,i);(s.stamps[kind]??=[]).push(i);return kind;
}
// The first plant of each kind is the one the lesson checks; more of the same kind can be added around it.
export function plantAt(s,cell){const id=HABITAT_PLANTS.find(p=>s.garden[p.id]===cell)?.id;if(id)return {id,extra:false};const x=s.gardenExtras.find(x=>x.cell===cell);return x?{id:x.id,extra:true}:null;}
export function gardenPlants(s){return [...HABITAT_PLANTS.filter(p=>Number.isInteger(s.garden[p.id])).map(p=>({id:p.id,cell:s.garden[p.id]})),...s.gardenExtras];}
export function gardenPlaced(s){return HABITAT_PLANTS.every(p=>Number.isInteger(s.garden[p.id])&&s.terrain[s.garden[p.id]]===p.habitat)&&new Set(Object.values(s.garden)).size===3;}
export function gardenValid(s){return gardenPlaced(s)&&HABITAT_PLANTS.every(p=>s.gardenReasons.includes(p.id));}
export function currentTrial(s){const key=designKey(s.design);return s.activeTestKey===key?s.tests.findLast(t=>t.key===key):s.tests.at(-1)?.key===key?s.tests.at(-1):null;}
export function comparisonPair(s){
  const last=currentTrial(s);if(!last)return null;
  const before=s.tests.filter(t=>t!==last).slice().reverse().find(t=>Number(t.surface!==last.surface)+Number(t.cover!==last.cover)===1);
  return before?{before,last,part:before.surface!==last.surface?'surface':'cover'}:null;
}
export function inventionEvidence(s){
 const valid=part=>{const e=s.inventionExplanations?.[part];if(!e||e.part!==part)return false;const before=s.tests.find(t=>t.key===e.before),last=s.tests.find(t=>t.key===e.key);return !!before&&!!last&&before[part]!==last[part]&&before[part==='surface'?'cover':'surface']===last[part==='surface'?'cover':'surface'];};
 return {surface:valid('surface'),cover:valid('cover')};
}
export function testValid(s){
 const pair=comparisonPair(s),current=!!pair&&s.design.linked&&s.design.surface==='lotus'&&s.testExplanation?.key===pair.last.key&&s.testExplanation?.before===pair.before.key&&s.testExplanation?.part===pair.part;
 if(s.inventionRevision===1)return current;
 const evidence=inventionEvidence(s);return !!currentTrial(s)&&s.design.linked&&s.design.surface==='lotus'&&s.design.cover==='flap'&&evidence.surface&&evidence.cover;
}
export function recordFeature(s,plant,region,answer){
  const p=PLANTS.find(x=>x.id===plant);if(!p||!['shape','edge'].includes(region))return false;
  if(answer!==(region==='shape'?p.id:p.edge?'yes':'no'))return false;
  s.leafEvidence[plant]??={};s.leafEvidence[plant][region]={answer,asset:plant,region};
  if(!s.observation[plant].includes(region))s.observation[plant].push(region);return true;
}
export function classificationComplete(s,rule){const groups=rule===s.rule?s.groups:s.groupsByRule[rule];return PLANTS.every(p=>groups[p.id]===(p[rule]?'yes':'no'))&&PLANTS.some(p=>p.id===s.classificationEvidence[rule]&&(s.observation[p.id].includes(rule==='edge'?'edge':'shape')||fieldMissionReady(s,0)));}
export function pageReady(s,p){
  const mission=Math.floor(p/2);if(p%2&&!s.completed[p]&&s.journeyRequired?.[mission]&&!fieldMissionReady(s,mission))return false;
  switch(p){
    case 0:return fieldMissionReady(s,0)||PLANTS.every(x=>['shape','edge'].every(f=>s.leafEvidence[x.id]?.[f]?.answer===(f==='shape'?x.id:x.edge?'yes':'no')));
    case 1:return pageReady(s,0)&&['edge','narrow'].some(rule=>classificationComplete(s,rule));
    case 2:return ['cherry','sowthistle'].every(plant=>[0,3].every(n=>s.seasonalRecords.includes(`${plant}:${n}`)&&s.seasonPhotos[`${plant}:${n}`]));
    case 3:return pageReady(s,2)&&['cherry','sowthistle'].every(plant=>s.seasonExplained.includes(plant)&&[0,3].every(n=>s.seasonalRecords.includes(`${plant}:${n}`)));
    case 4:return s.experiment.step>=4&&s.experimentAnswer==='air';
    case 5:return pageReady(s,4)&&HABITAT_PLANTS.every(p=>s.habitats[p.id]===p.habitat&&s.habitatFeatures[p.id]===p.id&&s.reasons[p.id]===p.id);
    // New rules (3-cell area, prediction) apply only to pages not yet completed; saved completions keep the old rule.
    case 6:return s.gardenReviewed&&(s.completed[6]?['water','grass','dry'].every(t=>s.terrain.includes(t)):terrainReady(s)&&gardenPlaced(s));
    // A garden carried over from the field still needs the student's own keep-or-change pick; saved completions keep the old rule.
    case 7:return pageReady(s,6)&&gardenValid(s)&&(s.completed[7]||!!s.gardenPick);
    case 8:return s.design.linked&&(s.completed[8]||!!s.testPrediction);
    case 9:return s.design.linked&&testValid(s);
    default:return false;
  }
}
export function canFinish(s){return evidenceCount(s)===5&&pageReady(s,7)&&pageReady(s,9)&&(s.finalChecks.classification||s.finalChecks.habitat)&&['shared','later'].includes(s.sharing.status);}
export function restoreState(raw){
  const s=freshState();
  try {
    const v=JSON.parse(raw); if(!v||![1,2].includes(v.version))return s;
    s.learningRecords=normalizeLearningRecords(v.learningRecords);
    s.notebook=normalizeNotebook(v.notebook);
    s.fieldBridges=s.fieldBridges.map((_,i)=>v.fieldBridges?.[i]===true);
    const member=(x,a)=>a.includes(x);
    s.inventionRevision=v.inventionRevision===1?1:v.inventionRevision===2?2:v.completed?.[9]?1:2;
    s.fieldEvidence=normalizeFieldEvidence(v.fieldEvidence);
    s.journeyRequired=s.journeyRequired.map((_,i)=>v.journeyRequired?.[i]===true);
    if(member(v.screen,['home','map','activity','report','final','ending']))s.screen=v.screen;
    if(Number.isInteger(v.page)&&v.page>=0&&v.page<10)s.page=v.page;
    if(Array.isArray(v.completed)&&v.completed.length===10)s.completed=v.completed.map(x=>x===true);
    for(const p of PLANTS)if(Array.isArray(v.observation?.[p.id]))s.observation[p.id]=[...new Set(v.observation[p.id].filter(x=>member(x,['shape','edge'])))];
    if(member(v.rule,['edge','narrow']))s.rule=v.rule;
    for(const p of PLANTS)if(member(v.groups?.[p.id],['yes','no']))s.groups[p.id]=v.groups[p.id];
    if(member(v.seasonPlant,['cherry','sowthistle']))s.seasonPlant=v.seasonPlant;
    if(Number.isInteger(v.season)&&v.season>=0&&v.season<5)s.season=v.season;
    s.budsFound=normalizeBuds(v.budsFound);
    s.underground=v.underground===true;
    const recordKeys=['cherry','sowthistle'].flatMap(p=>[0,1,2,3].map(n=>`${p}:${n}`));
    for(const key of ['seasonalRecords','linkedEvidence'])if(Array.isArray(v[key]))s[key]=[...new Set(v[key].filter(x=>recordKeys.includes(x)))];
    s.linkedEvidence=s.linkedEvidence.filter(x=>s.seasonalRecords.includes(x));
    if(Number.isInteger(v.experiment?.step)&&v.experiment.step>=0&&v.experiment.step<=5)s.experiment.step=v.experiment.step;
    s.experiment.compared=v.experiment?.compared===true;if(member(v.experiment?.prediction,['bubbles','none']))s.experiment.prediction=v.experiment.prediction;
    for(const p of HABITAT_PLANTS){
      if(member(v.habitats?.[p.id],Object.keys(HABITATS)))s.habitats[p.id]=v.habitats[p.id];
      if(v.habitatFeatures?.[p.id]===p.id)s.habitatFeatures[p.id]=p.id;
      if(member(v.reasons?.[p.id],HABITAT_PLANTS.map(p=>p.id)))s.reasons[p.id]=v.reasons[p.id];
      if(Number.isInteger(v.garden?.[p.id])&&v.garden[p.id]>=0&&v.garden[p.id]<24)s.garden[p.id]=v.garden[p.id];
    }
    if(Array.isArray(v.terrain)&&v.terrain.length===24)s.terrain=v.terrain.map(t=>member(t,['water','grass','dry','empty'])?t:'empty');
    if(HABITAT_PLANTS.some(p=>p.id===v.gardenPick))s.gardenPick=v.gardenPick;
    if(Array.isArray(v.gardenReasons))s.gardenReasons=[...new Set(v.gardenReasons.filter(id=>HABITAT_PLANTS.some(p=>p.id===id)))];
    // Extra copies only decorate: each sits alone on land that suits it.
    if(Array.isArray(v.gardenExtras))for(const x of v.gardenExtras){const p=HABITAT_PLANTS.find(p=>p.id===x?.id);if(p&&Number.isInteger(x.cell)&&s.terrain[x.cell]===p.habitat&&!plantAt(s,x.cell))s.gardenExtras.push({id:p.id,cell:x.cell});}
    if(member(v.design?.surface,['plain','lotus']))s.design.surface=v.design.surface;
    if(member(v.design?.cover,['open','flap']))s.design.cover=v.design.cover;
    s.design.linked=v.design?.linked===true;
    if(v.design?.observed===true||s.design.linked)s.design.observed=true;
    if(Array.isArray(v.tests))s.tests=v.tests.filter(t=>t&&member(t.surface,['plain','lotus'])&&member(t.cover,['open','flap'])).slice(-30).map(testDesign);
    if(v.activeTestKey===designKey(s.design)&&s.tests.some(t=>t.key===v.activeTestKey))s.activeTestKey=v.activeTestKey;
    if(Array.isArray(v.reportSubmitted))s.reportSubmitted=[...new Set(v.reportSubmitted.filter(i=>Number.isInteger(i)&&i>=0&&i<MISSIONS.length&&missionDone(s,i)))];
    if(member(v.testPrediction,['surface','cover']))s.testPrediction=v.testPrediction;
    for(const p of ['cherry','sowthistle'])if(member(v.seasonPrediction?.[p],['roots','none']))s.seasonPrediction[p]=v.seasonPrediction[p];
    if(Array.isArray(v.undergroundSeen))s.undergroundSeen=[...new Set(v.undergroundSeen.filter(p=>s.seasonPrediction[p]))];
    if(Array.isArray(v.misses))s.misses=s.misses.map((_,i)=>Number.isInteger(v.misses[i])&&v.misses[i]>0?Math.min(v.misses[i],999):0);
    for(const k of STAMP_KINDS)if(Array.isArray(v.stamps?.[k]))s.stamps[k]=[...new Set(v.stamps[k].filter(i=>Number.isInteger(i)&&i>=0&&i<MISSIONS.length&&missionDone(s,i)))];
    for(const k of Object.keys(s.finalChecks))s.finalChecks[k]=v.finalChecks?.[k]===true;
    // Current confirmations are checked after all v2 evidence is restored below.
    s.gardenTheme=canChooseGardenTheme(s)&&GARDEN_THEMES.includes(v.gardenTheme)?v.gardenTheme:'pink';
    s.largeText=v.largeText===true;
    s.adminUnlocked=v.adminUnlocked===true;
    s.soundEnabled=v.soundEnabled!==false;
    // Legacy achievements are historical records, never invented evidence for the new activities.
    s.legacyCompleted=v.version===1?s.completed.map((done,i)=>done?i:-1).filter(i=>i>=0):Array.isArray(v.legacyCompleted)?v.legacyCompleted.filter(i=>Number.isInteger(i)&&i>=0&&i<10&&s.completed[i]):[];
    s.legacyFinished=(v.version===1?v.finished===true:v.legacyFinished===true)&&evidenceCount(s)===5;
    if(v.version===2){
      for(const p of PLANTS)for(const region of ['shape','edge']){const e=v.leafEvidence?.[p.id]?.[region];if(e)recordFeature(s,p.id,region,e.answer);}
      for(const rule of ['edge','narrow']){
        for(const p of PLANTS)if(member(v.groupsByRule?.[rule]?.[p.id],['yes','no']))s.groupsByRule[rule][p.id]=v.groupsByRule[rule][p.id];
        if(PLANTS.some(p=>p.id===v.classificationEvidence?.[rule]))s.classificationEvidence[rule]=v.classificationEvidence[rule];
      }
      if(member(v.seasonExplanation,['cherry','sowthistle']))s.seasonExplanation=v.seasonExplanation;
      if(Array.isArray(v.seasonExplained))s.seasonExplained=[...new Set(v.seasonExplained.filter(p=>member(p,['cherry','sowthistle'])))];
      for(const key of s.seasonalRecords){const photo=v.seasonPhotos?.[key];if(photo)s.seasonPhotos[key]={underground:photo.underground===true};}
      if(v.experimentAnswer==='air'&&s.experiment.step>=4)s.experimentAnswer='air';
      s.gardenReviewed=v.gardenReviewed===true;
      const pair=comparisonPair(s),e=v.testExplanation;
      if(pair&&e?.key===pair.last.key&&e?.before===pair.before.key&&e?.part===pair.part)s.testExplanation={key:e.key,before:e.before,part:e.part};
      for(const part of ['surface','cover']){const proof=v.inventionExplanations?.[part];if(proof&&typeof proof.key==='string'&&typeof proof.before==='string')s.inventionExplanations[part]={key:proof.key,before:proof.before,part};if(!inventionEvidence(s)[part])delete s.inventionExplanations[part];}
      if(member(v.sharing?.status,['pending','later','shared']))s.sharing.status=v.sharing.status;
      if(member(v.sharing?.question,['surface','cover']))s.sharing.question=v.sharing.question;
      if(member(v.sharing?.response,['keep','revise']))s.sharing.response=v.sharing.response;
      if(s.sharing.status==='shared'&&(!s.sharing.question||!s.sharing.response))s.sharing.status='pending';
      if(Number.isInteger(v.highlight)&&v.highlight>=0&&v.highlight<5)s.highlight=v.highlight;
    }
    s.groupsByRule[s.rule]={...s.groups};
    if(!pageReady(s,7))s.finalChecks.garden=false;
    if(!pageReady(s,9))s.finalChecks.invention=false;
    s.finished=v.finished===true&&(s.legacyFinished||canFinish(s));
    if(s.screen==='activity'&&!openMission(s,Math.floor(s.page/2)))s.screen='map';
    if(!s.adminUnlocked&&['report','final','ending'].includes(s.screen)&&evidenceCount(s)<5)s.screen='map';
    if(!s.adminUnlocked&&s.screen==='ending'&&!s.finished)s.screen='final';
    return s;
  } catch {return s;}
}
