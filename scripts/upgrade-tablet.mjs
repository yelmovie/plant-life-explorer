// One-time, reviewable upgrade script. Source backups are in docs/implementation-backup-20261016.
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8').replaceAll('\r\n','\n');
const write=(p,s)=>writeFileSync(new URL(p,root),s);
let m=read('src/model.js');
const replace=(a,b)=>{if(!m.includes(a))throw Error('Missing model anchor: '+a.slice(0,60));m=m.replace(a,b);};
replace("export const STORAGE_KEY = 'green-garden-mvp-v1';","export const STORAGE_KEY = 'green-garden-mvp-v2';\nexport const LEGACY_STORAGE_KEY = 'green-garden-mvp-v1';");
replace("edgeText:'가장자리에 톱니가 있어'","edgeText:'큰 톱니가 보여'");
replace("edgeText:'가장자리에 톱니가 없어'","edgeText:'큰 톱니가 보이지 않아'");
replace("edgeText:'눈에 띄는 톱니가 없어'","edgeText:'큰 톱니가 보이지 않아'");
const pages=[['잎을 살펴봐요','잎의 모양과 가장자리를 보고, 보이는 특징을 골라 줘.'],['잎을 나누어 봐요','기준 하나를 고른 뒤, 식물을 고르고 놓을 곳을 눌러 줘.'],['계절을 바꿔 봐요','한 식물의 겨울과 다음 해 봄 모습을 남겨 줘.'],['겨울과 봄을 비교해요','두 그림에서 달라진 모습을 찾아 줘.'],['잎자루를 살펴봐요','잎을 받치는 부분인 잎자루를 물속에서 눌러 봐.'],['식물이 사는 곳','식물이 살 곳과 그곳에서 도움이 되는 특징을 골라 줘.'],['정원 꾸미기','준비된 정원을 살펴봐. 원하는 곳은 바꿔도 좋아.'],['정원에 식물을 심어요','식물을 고르고 땅을 누른 뒤, 그곳에 심은 까닭을 골라 줘.'],['나의 탐험 가방 만들기','연잎의 물방울을 살펴보고 가방에 쓸 특징을 골라 줘.'],['비 뿌리고 비교해요','부품 하나만 바꾸어 시험하고, 달라진 까닭을 골라 줘.']];
m=m.replace(/export const PAGES = \[[\s\S]*?\n\];/,`export const PAGES = ${JSON.stringify(pages,null,2)};`);
replace('return {version:1,',"return {version:2,legacyCompleted:[],legacyFinished:false,leafEvidence:{},groupsByRule:{edge:{},narrow:{}},classificationEvidence:{},seasonPhotos:{},seasonExplanation:'',experimentAnswer:'',gardenReviewed:false,testExplanation:null,sharing:{status:'pending',question:'',response:''},highlight:0,");
replace("seasonPlant:'cherry',season:0","seasonPlant:'cherry',season:1");
replace("terrain:Array(24).fill('empty')","terrain:presetTerrain()");
replace('export function evidenceCount',"export function presetTerrain(){return Array.from({length:24},(_,i)=>['water','grass','dry'][Math.floor((i%6)/2)]);}\nexport function evidenceCount");
replace("export function testValid(s){const last=s.tests.at(-1);return !!last&&last.key===designKey(s.design)&&last.clean&&last.dry&&new Set(s.tests.map(t=>t.key)).size>=2;}",`export function comparisonPair(s){
  const last=s.tests.at(-1);if(!last||last.key!==designKey(s.design))return null;
  const before=s.tests.slice(0,-1).reverse().find(t=>Number(t.surface!==last.surface)+Number(t.cover!==last.cover)===1);
  return before?{before,last,part:before.surface!==last.surface?'surface':'cover'}:null;
}
export function testValid(s){const pair=comparisonPair(s);return !!pair&&s.design.linked&&s.design.surface==='lotus'&&s.testExplanation?.key===pair.last.key&&s.testExplanation?.before===pair.before.key&&s.testExplanation?.part===pair.part;}
export function recordFeature(s,plant,region,answer){
  const p=PLANTS.find(x=>x.id===plant);if(!p||!['shape','edge'].includes(region))return false;
  if(answer!==(region==='shape'?p.id:p.edge?'yes':'no'))return false;
  s.leafEvidence[plant]??={};s.leafEvidence[plant][region]={answer,asset:plant,region};
  if(!s.observation[plant].includes(region))s.observation[plant].push(region);return true;
}`);
replace("case 1:return pageReady(s,0)&&PLANTS.every(x=>s.groups[x.id]===(x[s.rule]?'yes':'no'));","case 1:return pageReady(s,0)&&PLANTS.every(x=>s.groups[x.id]===(x[s.rule]?'yes':'no'))&&PLANTS.some(x=>s.classificationEvidence[s.rule]===x.id&&s.observation[x.id].includes(s.rule==='edge'?'edge':'shape')); ");
replace("case 2:return ['cherry','sowthistle'].every(p=>[0,1,3].every(n=>s.seasonalRecords.includes(`${p}:${n}`)));","case 2:return [0,3].every(n=>s.seasonalRecords.includes(`${s.seasonPlant}:${n}`));");
replace("case 3:return pageReady(s,2)&&['cherry:3','cherry:0'].every(k=>s.linkedEvidence.includes(k));","case 3:return pageReady(s,2)&&s.seasonExplanation===s.seasonPlant;");
replace("case 4:return s.experiment.step===5&&s.experiment.compared;","case 4:return s.experiment.step>=4&&s.experimentAnswer==='air';");
replace("case 6:return ['water','grass','dry'].every(t=>s.terrain.filter(c=>c===t).length>=3);","case 6:return s.gardenReviewed&&['water','grass','dry'].every(t=>s.terrain.includes(t));");
replace("export function canFinish(s){return evidenceCount(s)===5&&pageReady(s,7)&&pageReady(s,9)&&Object.values(s.finalChecks).every(Boolean);}","export function canFinish(s){return evidenceCount(s)===5&&pageReady(s,7)&&pageReady(s,9)&&(s.finalChecks.classification||s.finalChecks.habitat)&&['shared','later'].includes(s.sharing.status);}");
replace('if(!v||v.version!==1)return s;','if(!v||![1,2].includes(v.version))return s;');
replace('s.finished=v.finished===true&&canFinish(s);',`// Legacy achievements are historical records, never invented evidence for the new activities.
    s.legacyCompleted=v.version===1?s.completed.map((done,i)=>done?i:-1).filter(i=>i>=0):Array.isArray(v.legacyCompleted)?v.legacyCompleted.filter(i=>Number.isInteger(i)&&i>=0&&i<10&&s.completed[i]):[];
    s.legacyFinished=(v.version===1?v.finished===true:v.legacyFinished===true)&&evidenceCount(s)===5;
    if(v.version===2){
      for(const p of PLANTS)for(const region of ['shape','edge']){const e=v.leafEvidence?.[p.id]?.[region];if(e)recordFeature(s,p.id,region,e.answer);}
      for(const rule of ['edge','narrow']){
        for(const p of PLANTS)if(member(v.groupsByRule?.[rule]?.[p.id],['yes','no']))s.groupsByRule[rule][p.id]=v.groupsByRule[rule][p.id];
        if(PLANTS.some(p=>p.id===v.classificationEvidence?.[rule]))s.classificationEvidence[rule]=v.classificationEvidence[rule];
      }
      if(member(v.seasonExplanation,['cherry','sowthistle']))s.seasonExplanation=v.seasonExplanation;
      for(const key of s.seasonalRecords){const photo=v.seasonPhotos?.[key];if(photo)s.seasonPhotos[key]={underground:photo.underground===true};}
      if(v.experimentAnswer==='air'&&s.experiment.step>=4)s.experimentAnswer='air';
      s.gardenReviewed=v.gardenReviewed===true;
      const pair=comparisonPair(s),e=v.testExplanation;
      if(pair&&e?.key===pair.last.key&&e?.before===pair.before.key&&e?.part===pair.part)s.testExplanation={key:e.key,before:e.before,part:e.part};
      if(member(v.sharing?.status,['pending','later','shared']))s.sharing.status=v.sharing.status;
      if(member(v.sharing?.question,['surface','cover']))s.sharing.question=v.sharing.question;
      if(member(v.sharing?.response,['keep','revise']))s.sharing.response=v.sharing.response;
      if(s.sharing.status==='shared'&&(!s.sharing.question||!s.sharing.response))s.sharing.status='pending';
      if(Number.isInteger(v.highlight)&&v.highlight>=0&&v.highlight<5)s.highlight=v.highlight;
    }
    s.groupsByRule[s.rule]={...s.groups};
    if(!pageReady(s,7))s.finalChecks.garden=false;
    if(!pageReady(s,9))s.finalChecks.invention=false;
    s.finished=v.finished===true&&(s.legacyFinished||canFinish(s));`);
write('src/model.js',m);
let html=read('index.html').replace('width=device-width, initial-scale=1','width=device-width, initial-scale=1, viewport-fit=cover').replace('<link rel="stylesheet" href="/src/adventure.css">','<link rel="stylesheet" href="/src/adventure.css">\n  <link rel="stylesheet" href="/src/tablet.css">');write('index.html',html);
console.log('Model upgraded; next add tablet screen module and styles.');
