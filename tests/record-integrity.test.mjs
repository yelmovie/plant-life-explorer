// Pre-delivery QA (2026-10-30): the invention record never claims a check or a revision the saved data does not show,
// optional bud hunting is not a completion metric, next-step copy matches the screen, and particles follow each name.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {freshState,restoreState,testDesign,HABITAT_PLANTS} from '../src/model.js';
import {fieldMissionAction} from '../src/field-missions.js';
import {carryFieldEvidence} from '../src/field-bridge.js';
import {renderTests,renderDesign,predictionLine,predictionRecord} from '../src/invention.js';
import {learningAction,renderActivity} from '../src/learning.js';
import {renderResearchNotebook,notebookEntry} from '../src/research-notebook.js';
import {normalizeLearningRecords} from '../src/learning-records.js';
import {REWARDS} from '../src/rewards.js';
import {josa,repairPlantLabel} from '../src/josa.js';

const CLAIMS=/시험으로 확인했어|생각을 고쳤어/;
function bagRun(prediction,steps=['test','surface','test','cover','test','answer']){
 const s=freshState(),u={};s.page=8;
 const act=(action,id='')=>fieldMissionAction(s,u,action,id);
 act('field-bag-predict',prediction);
 const said=[];
 for(const step of steps)said.push(step==='test'?act('field-bag-test'):step==='answer'?act('field-bag-answer','cover'):act('field-bag-upgrade',step));
 return {s,u,act,said};
}
const text=html=>html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');

test('A. 첫 예상이 틀리면 첫 예상·시험 결과·결론을 따로 쓰고 "시험으로 생각을 고쳤어"라고 기록한다',()=>{
 const {s,said}=bagRun('surface');
 assert.match(said.at(-1),/시험으로 생각을 고쳤어/);
 carryFieldEvidence(s,4);
 const rows=predictionRecord(s);
 assert.deepEqual(rows.map(r=>r.kind),['prediction','result','conclusion','change']);
 assert.equal(rows[0].text,'연잎 겉면만 바꾸면 돼.','첫 예상은 학생이 고른 그대로');
 assert.equal(rows[1].text,'처음 가방 공책 젖음 → 연잎 겉면 공책 젖음 → 연잎 겉면+덮개 공책 뽀송');
 assert.equal(rows[3].text,'시험으로 생각을 고쳤어.');
 const page=text(renderTests(s,{}));
 assert.match(page,/현장에서 남긴 첫 예상 연잎 겉면만 바꾸면 돼\. 시험 결과 .* 알아낸 것 덮개가 입구로 오는 비를 막아 공책을 지켰어\. 시험으로 생각을 고쳤어\./);
 assert.doesNotMatch(page,/시험으로 확인했어/,'틀린 예상을 확인한 것처럼 쓰지 않는다');
 // The student notebook shows the revision from the saved response, not a pre-written thought.
 const r=s.learningRecords[4].responses['field:bag-prediction'];
 assert.equal(r.first,'겉면만 바꾸면 됨');assert.equal(r.last,'입구로 오는 비도 막아야 함');
 assert.match(text(notebookEntry(s,4).body),/바뀐 생각.*겉면만 바꾸면 됨.*입구로 오는 비도 막아야 함/);
});

test('B. 첫 예상이 맞으면 "예상을 시험으로 확인했어"만 쓰고 생각을 고쳤다고 쓰지 않는다',()=>{
 const {s,said}=bagRun('cover');
 assert.match(said.at(-1),/처음 예상을 시험으로 확인했어/);assert.doesNotMatch(said.at(-1),/고쳤어/);
 carryFieldEvidence(s,4);
 const page=text(renderTests(s,{}));
 assert.match(page,/입구로 오는 비도 막아야 해\..*알아낸 것 덮개가.*예상을 시험으로 확인했어\./);
 assert.doesNotMatch(page,/생각을 고쳤어/);
 const r=s.learningRecords[4].responses['field:bag-prediction'];
 assert.equal(r.changes,0);assert.equal(r.first,r.last);
 assert.doesNotMatch(text(notebookEntry(s,4).body),/바뀐 생각 [^처]*겉면만/);
});

test('C. 시험 도중 새로고침하면 첫 예상과 한 시험만 남고, 결론은 실제로 답한 뒤에만 생긴다',()=>{
 const {s}=bagRun('surface',['test','surface','test']);
 const back=restoreState(JSON.stringify(s));back.page=8;
 const bag=back.fieldEvidence.bag;
 assert.equal(bag.prediction,'surface');assert.equal(bag.tests.length,2);assert.equal(bag.delivered,'');
 assert.doesNotMatch(predictionLine(back),CLAIMS,'현장 임무를 마치기 전에는 기록 페이지에 확인·수정 문구가 없다');
 // Even if the half-finished field trials were carried over, the record shows only what was done.
 const peek=restoreState(JSON.stringify(back));peek.testPrediction=bag.prediction;peek.tests=bag.tests.map(testDesign);
 const rows=predictionRecord(peek);
 assert.deepEqual(rows.map(r=>r.kind),['prediction','result'],'결론과 생각 수정은 아직 없다');
 assert.equal(rows[1].text,'처음 가방 공책 젖음 → 연잎 겉면 공책 젖음');
 const u={};for(const [a,id] of [['field-bag-upgrade','cover'],['field-bag-test',''],['field-bag-answer','cover']])fieldMissionAction(back,u,a,id);
 carryFieldEvidence(back,4);
 assert.match(predictionLine(back),/시험으로 생각을 고쳤어/);
 // Pressing the answer again (연타) does not add trials or a second revision.
 fieldMissionAction(back,u,'field-bag-answer','cover');
 assert.equal(back.fieldEvidence.bag.tests.length,3);assert.equal(back.learningRecords[4].responses['field:bag-prediction'].changes,1);
});

test('C. 본 탐구에서 예상만 고른 화면은 아직 시험하지 않았으니 확인했다고 쓰지 않는다',()=>{
 const s=freshState(),u={};s.page=8;s.design.observed=s.design.linked=true;
 learningAction(s,u,'test-predict','surface');
 const html=text(renderDesign(s,u));
 assert.match(html,/처음 예상 연잎 겉면만 바꾸면 돼\./);assert.doesNotMatch(html,CLAIMS);assert.doesNotMatch(html,/알아낸 것/);
});

test('D. 기존 완료 기록으로 다시 들어가도 저장된 시험이 보여 준 만큼만 쓴다',()=>{
 // A core-flow record: surface prediction, then one-part comparisons that prove both roles.
 const s=freshState();s.page=9;s.testPrediction='surface';Object.assign(s.design,{surface:'lotus',cover:'flap',observed:true,linked:true});
 s.tests=[testDesign({surface:'plain',cover:'open'}),testDesign({surface:'lotus',cover:'open'}),testDesign({surface:'lotus',cover:'flap'})];
 s.inventionExplanations={surface:{before:'plain:open',key:'lotus:open',part:'surface'},cover:{before:'lotus:open',key:'lotus:flap',part:'cover'}};
 s.completed[8]=s.completed[9]=true;
 const back=restoreState(JSON.stringify(s));
 assert.match(predictionLine(back),/처음 예상.*연잎 겉면만 바꾸면 돼.*알아낸 것.*시험으로 생각을 고쳤어/);
 // A completion carried from an older save without trials: only the first prediction, nothing invented.
 const old=freshState();old.testPrediction='surface';old.completed[8]=old.completed[9]=true;
 const rows=predictionRecord(restoreState(JSON.stringify(old)));
 assert.deepEqual(rows.map(r=>r.kind),['prediction']);
 assert.equal(predictionRecord(restoreState(JSON.stringify(freshState()))).length,0,'예상이 없으면 아무 줄도 만들지 않는다');
});

test('겨울눈 찾기는 선택 활동이라 찾지 않았으면 연구노트 표지에 0/4로 남지 않는다',()=>{
 const s=freshState();s.seasonalRecords=['cherry:0','cherry:3','sowthistle:0','sowthistle:3'];s.completed[2]=s.completed[3]=true;
 let cover=text(renderResearchNotebook(s));
 assert.match(cover,/4장의 계절 기록/);assert.doesNotMatch(cover,/겨울눈/);
 s.budsFound={cherry:[[.17,.13],[.55,.07]],sowthistle:[]};
 cover=text(renderResearchNotebook(s));
 assert.match(cover,/겨울눈 찾기\(선택\) 2\/4/,'실제로 찾은 수만, 선택임을 밝혀서');
 assert.match(text(renderResearchNotebook(restoreState(JSON.stringify(s)))),/겨울눈 찾기\(선택\) 2\/4/);
});

test('두 기준 분류를 마친 안내는 실제 다음 버튼과 화면(두 기준 기록 확인)을 가리킨다',()=>{
 const src=readFileSync(new URL('../src/field-missions-state.js',import.meta.url),'utf8');
 assert.doesNotMatch(src,/처음 보는 잎에 기준을 써 보자/);
 assert.match(src,/“발견을 연구 노트에 담기”를 눌러 두 기준으로 나눈 기록을 확인하자/);
 assert.match(readFileSync(new URL('../src/learning.js',import.meta.url),'utf8'),/발견을 연구 노트에 담기/);
});

test('식물·장소 이름 뒤 조사는 받침과 ㄹ 받침에 맞춘다',()=>{
 assert.equal(josa('동백나무','은/는'),'동백나무는');assert.equal(josa('벚나무','은/는'),'벚나무는');
 assert.equal(josa('알로에','을/를'),'알로에를');assert.equal(josa('부레옥잠','을/를'),'부레옥잠을');
 assert.equal(josa('물가','과/와'),'물가와');assert.equal(josa('건조 구역','과/와'),'건조 구역과');assert.equal(josa('풀밭','과/와'),'풀밭과');
 assert.equal(josa('물가','이야/야'),'물가야');assert.equal(josa('빈 땅','이야/야'),'빈 땅이야');
 const to=Object.fromEntries(REWARDS.map(r=>[r.name,josa(r.name,'으로/로')]));
 assert.deepEqual(to,{'표본 온실':'표본 온실로','계절 꽃돔':'계절 꽃돔으로','물길 실험실':'물길 실험실로','나의 연구정원':'나의 연구정원으로','발명 공방':'발명 공방으로'});
 assert.equal(josa('물길','으로/로'),'물길로','ㄹ 받침은 로');
});

test('사는 곳 잇기 문구에 개발용 조사 표기가 없고 식물마다 조사가 맞다',()=>{
 const said={};
 for(const [plant,habitat] of [['hyacinth','water'],['aloe','dry'],['cherry','grass']]){const s=freshState(),u={selected:plant};said[plant]=learningAction(s,u,'habitat',habitat);}
 assert.equal(said.hyacinth,'부레옥잠을 물가와 이었어.');assert.equal(said.aloe,'알로에를 건조 구역과 이었어.');assert.equal(said.cherry,'벚나무를 풀밭과 이었어.');
 for(const plant of ['hyacinth','aloe','cherry']){
  const s=freshState();s.page=5;const html=text(renderActivity(s,{activityMode:'explore',habitatPlant:plant},null));
  const name=HABITAT_PLANTS.find(p=>p.id===plant).name;
  assert.match(html,new RegExp(`${josa(name,'은/는')} 어디에 살까\\?`));
 }
 for(const file of ['app.js','learning.js','stage-map.js','rewards.js','response-tracking.js','research-notebook.js','field-missions.js','field-missions-state.js','invention.js']){
  const src=readFileSync(new URL('../src/'+file,import.meta.url),'utf8');
  assert.doesNotMatch(src,/을\(를\)|은\(는\)|이\(가\)|과\(와\)|와\(과\)|\(으\)로/,file);
  assert.doesNotMatch(src,/\.name\}(로|을|은) /,file+': 이름 뒤 고정 조사');
 }
});

test('정원 식물의 수량 단위는 나무는 그루, 알로에·부레옥잠은 포기다',()=>{
 assert.deepEqual(Object.fromEntries(HABITAT_PLANTS.map(p=>[p.name,p.unit])),{'부레옥잠':'포기','알로에':'포기','벚나무':'그루'});
 const s=freshState();s.page=6;s.terrain[0]='dry';s.garden.aloe=0;
 assert.match(text(renderActivity(s,{activityMode:'explore',gardenMode:'plant',undo:[]},()=>'')),/알로에 1포기 ✓/);
 assert.doesNotMatch(readFileSync(new URL('../src/app.js',import.meta.url),'utf8'),/한 그루를 뽑았어/);
});

test('예전 저장의 "알로에을 심을 자리" 같은 기록 이름은 불러올 때 고치고 학생 답은 그대로 둔다',()=>{
 assert.equal(repairPlantLabel('알로에을 심을 자리'),'알로에를 심을 자리');
 assert.equal(repairPlantLabel('벚나무을 심은 까닭'),'벚나무를 심은 까닭');
 assert.equal(repairPlantLabel('부레옥잠을 심을 자리'),'부레옥잠을 심을 자리');
 const records=normalizeLearningRecords([0,0,0,{known:true,responses:{'core:plant:aloe':{label:'알로에을 심을 자리',first:'풀밭',last:'건조 구역',attempts:2,wrong:1,changes:1,phase:'application'}}}]);
 const r=records[3].responses['core:plant:aloe'];
 assert.equal(r.label,'알로에를 심을 자리');assert.equal(r.first,'풀밭');assert.equal(r.last,'건조 구역');
});
