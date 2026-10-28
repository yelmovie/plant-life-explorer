import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshState,restoreState,awardStamp,missionStamps,testValid} from '../src/model.js';
import {recordHint,recordResponse} from '../src/learning-records.js';
import {fieldMissionAction,renderFieldMission,renderFieldSteps} from '../src/field-missions.js';
import {fieldBagPair,fieldBagTrial} from '../src/field-missions-state.js';
import {carryFieldEvidence} from '../src/field-bridge.js';
import {notebookEntry} from '../src/research-notebook.js';
import {bagArt} from '../src/art.js';
import {learningAction} from '../src/learning.js';
import {createSaveStore,LAST_GOOD_KEY,RECOVERY_KEY} from '../src/safe-storage.js';
import {STORAGE_KEY,LEGACY_STORAGE_KEY} from '../src/model.js';

test('현장 오답과 본 탐구의 첫 응답이 함께 칭찬·노트에 남고 재도전은 완료를 막지 않는다',()=>{
 const s=freshState(),u={plant:'cherry',region:'shape'};
 fieldMissionAction(s,u,'field-scan','maple:shape');
 fieldMissionAction(s,u,'field-scan','maple:edge');
 fieldMissionAction(s,u,'field-sort','edge:maple:no');
 fieldMissionAction(s,u,'field-sort','edge:maple:yes');
 learningAction(s,u,'feature-answer','cherry');
 const record=s.learningRecords[0].responses['field:sort:edge:maple'];
 assert.equal(record.first,'톱니 없음');assert.equal(record.last,'톱니 있음');assert.equal(record.wrong,1);assert.equal(record.attempts,2);
 assert.equal(awardStamp(s,0),'fixed');
 s.completed[0]=s.completed[1]=true;
 const r=restoreState(JSON.stringify(s));assert.deepEqual(missionStamps(r,0),['fixed']);assert.deepEqual(r.learningRecords,s.learningRecords);
 assert.match(notebookEntry(r,0).body,/톱니 없음 → 톱니 있음/);
});
test('정답 기록이 있어야 스스로 칭찬하고 요청한 힌트는 도움 칭찬으로 구분한다',()=>{
 const s=freshState();assert.equal(awardStamp(s,0),'unknown');
 recordResponse(s,1,'prediction','뿌리가 남음',true,'첫 예상','prediction');assert.equal(awardStamp(s,1),'direct');
 recordResponse(s,2,'answer','흙',false,'방울');recordHint(s,2);recordResponse(s,2,'answer','공기',true,'방울');assert.equal(awardStamp(s,2),'helped');
});
test('이전 저장의 direct 스탬프와 없는 응답은 첫 정답의 증거로 추정하지 않는다',()=>{
 const old=freshState();delete old.learningRecords;old.completed[0]=old.completed[1]=true;old.stamps.direct=[0];
 const r=restoreState(JSON.stringify(old));assert.equal(r.completed[0],true);assert.deepEqual(missionStamps(r,0),['unknown']);assert.match(notebookEntry(r,0).body,/확인되지 않음/);
});
test('입구 덮개만 바꾼 두 시험은 덮개 그림·설명·공책 젖음과 정확히 대응한다',()=>{
 const before=fieldBagTrial({surface:'lotus',cover:'open'}),after=fieldBagTrial({...before,cover:'flap'});
 const pair=fieldBagPair({design:after,tests:[before,after]});assert.equal(pair.part,'cover');
 assert.equal(before.rolls,after.rolls);assert.equal(before.notebookDry,false);assert.equal(after.notebookDry,true);
 assert.match(bagArt(before),/입구 덮개: 열림/);assert.match(bagArt(after),/입구 덮개: 닫힘/);
});
test('겉면만 비교하면 세 부품을 모두 확인했다는 결론을 만들지 않고 기존 시험을 이어 쓴다',()=>{
 const s=freshState(),u={};s.page=8;
 const act=(a,id='')=>fieldMissionAction(s,u,a,id);
 act('field-bag-predict','surface');
 for(const [part,value] of [['surface','plain'],['cover','flap']])act('field-bag-part',part+':'+value);
 act('field-bag-test');act('field-bag-part','surface:lotus');act('field-bag-test');act('field-bag-compare','surface');
 assert.match(act('field-bag-deliver'),/이번 비교로 확인한 역할/);assert.doesNotMatch(u.fieldMission.feedback,/두 덮개의 다른 역할을 시험으로 확인/);
 carryFieldEvidence(s,4);assert.equal(s.tests.length,2);assert.equal(s.design.surface,'lotus');assert.equal(s.testPrediction,'surface');assert.equal(s.inventionExplanations.surface.part,'surface');assert.equal(s.inventionExplanations.cover,undefined);assert.equal(testValid(s),false);
 u.fieldMission.mission=4;u.fieldMission.stage=2;// Going back to earlier stages is the step list's job; stage 3 keeps a single finish button.
 assert.doesNotMatch(renderFieldMission(s,u),/조립으로 돌아가기|비교 시험하기/);assert.match(renderFieldSteps(s,u),/data-action="field-stage" data-id="0"/);
});
test('첫 예상은 관찰 이후 바뀌지 않고 노트 퀴즈와 읽음은 왕복 보존된다',()=>{
 const s=freshState(),u={};s.page=4;
 fieldMissionAction(s,u,'field-predict','air:sink');fieldMissionAction(s,u,'field-predict','air:float');assert.equal(s.fieldEvidence.float.predictions.air,'sink');
 s.notebook[2]={read:true,answer:0,firstAnswer:1,attempts:2};const r=restoreState(JSON.stringify(s));assert.deepEqual(r.notebook,s.notebook);assert.match(notebookEntry(r,2).body,/note-read-sticker stuck/);assert.match(notebookEntry(r,2).body,/note-quiz-feedback correct/);
});
function memory(initial={}){const data=new Map(Object.entries(initial));return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),data};}
function locks(){let queue=Promise.resolve();return {request:(_key,fn)=>{const next=queue.then(fn);queue=next.catch(()=>{});return next;}};}
test('손상 JSON·null·구조 오류·미지원 버전의 원본을 반복 저장으로 덮어쓰지 않는다',async()=>{
 for(const raw of ['{broken','null','{"version":2}','{"version":2,"completed":[]}',JSON.stringify({...freshState(),version:99})]){
  const storage=memory({[STORAGE_KEY]:raw}),store=createSaveStore(storage,locks());store.load();
  assert.equal(store.status,'invalid');for(let i=0;i<3;i++)assert.equal(await store.save(freshState()),false);
  assert.equal(storage.getItem(STORAGE_KEY),raw);
 }
});
test('쓰기 실패 후 마지막 정상 기록을 보존하고 성공하면 실패 상태가 해제된다',async()=>{
 const original=JSON.stringify(freshState()),storage=memory({[STORAGE_KEY]:original}),store=createSaveStore(storage,locks()),s=store.load();
 const write=storage.setItem;storage.setItem=(k,v)=>{if(k===STORAGE_KEY)throw Error('quota');write(k,v);};s.screen='map';
 assert.equal(await store.save(s),false);assert.equal(store.status,'failed');assert.equal(storage.getItem(STORAGE_KEY),original);assert.equal(storage.getItem(LAST_GOOD_KEY),original);
 storage.setItem=write;assert.equal(await store.save(s),true);assert.equal(store.status,'ready');
});
test('두 탭의 동시 저장은 잠금 아래 하나만 저장하고 오래된 탭·초기화는 충돌한다',async()=>{
 const storage=memory(),lock=locks(),a=createSaveStore(storage,lock),b=createSaveStore(storage,lock),first=a.load(),stale=b.load();
 first.screen='map';stale.page=4;
 assert.deepEqual(await Promise.all([a.save(first),b.save(stale)]),[true,false]);assert.equal(b.status,'conflict');assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).screen,'map');
 assert.equal(await b.save(freshState()),false);assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).screen,'map');
});
test('지원하는 구버전과 마지막 정상 복구는 원본과 실제 기록을 보존한다',async()=>{
 const legacy=JSON.stringify({...freshState(),version:1,completed:[true,true,...Array(8).fill(false)]}),storage=memory({[LEGACY_STORAGE_KEY]:legacy}),store=createSaveStore(storage,locks()),s=store.load();
 assert.equal(s.completed[0],true);assert.equal(await store.save(s),true);assert.equal(storage.getItem(LEGACY_STORAGE_KEY),legacy);
 storage.setItem(STORAGE_KEY,'broken');const broken=createSaveStore(storage,locks());broken.load();const restored=await broken.recover();
 assert.equal(restored.completed[0],true);assert.equal(storage.getItem(RECOVERY_KEY),'broken');
});
test('잠금이 없는 환경에서는 보호되지 않은 저장을 수행하지 않는다',async()=>{
 const storage=memory(),store=createSaveStore(storage,null);store.load();assert.equal(await store.save(freshState()),false);assert.equal(store.status,'unsupported');assert.equal(storage.getItem(STORAGE_KEY),null);
});
test('틀린 첫 예상과 관찰 뒤 고친 선택을 연결하되 원래 예상은 지우지 않는다',()=>{
 const s=freshState(),u={};s.page=4;
 fieldMissionAction(s,u,'field-predict','air:sink');fieldMissionAction(s,u,'field-test-model','air');
 assert.equal(s.fieldEvidence.float.predictions.air,'sink');
 const response=s.learningRecords[2].responses['field:float-predict:air'];assert.equal(response.first,'가라앉음');assert.equal(response.last,'뜸');assert.equal(response.correct,true);
 assert.match(notebookEntry(restoreState(JSON.stringify(s)),2).body,/가라앉음 → 뜸/);
});
test('동일 조건의 시험 기록을 다시 선택하면 반복 시험 없이 완성 설계를 확인한다',()=>{
 const s=freshState();s.page=9;s.design={surface:'lotus',cover:'flap',linked:true};
 s.tests=[{key:'lotus:flap',surface:'lotus',cover:'flap',clean:true,dry:true},{key:'lotus:open',surface:'lotus',cover:'open',clean:true,dry:false},{key:'plain:open',surface:'plain',cover:'open',clean:false,dry:false}];
 s.inventionExplanations={surface:{key:'plain:open',before:'lotus:open',part:'surface'},cover:{key:'lotus:open',before:'lotus:flap',part:'cover'}};
 assert.equal(testValid(s),false);s.activeTestKey='lotus:flap';assert.equal(testValid(s),true);
 const r=restoreState(JSON.stringify(s));assert.equal(r.tests.length,3);assert.equal(testValid(r),true);
});

test('계절 현장 연결이 완성된 경우에만 실제 관찰과 예상을 다음 탐구로 이어 쓴다',()=>{
 const s=freshState(),u={};s.page=2;
 const act=(a,id)=>fieldMissionAction(s,u,a,id);
 act('field-season-predict','tree:none');act('field-season-predict','herb:roots');
 for(const [k,part,clue] of [['tree','trunk','branches'],['herb','root','rootbud']]){
  act('field-season-link',`${k}:${part}`);
  for(const [i,phase] of ['winter','bud','spring'].entries())act('field-order',`${k}:${phase}:${i}`);
  act('field-season-clue',`${k}:${clue}`);
 }
 carryFieldEvidence(s,1);
 assert.equal(s.seasonPrediction.cherry,'none');assert.equal(s.seasonPrediction.sowthistle,'roots');
 assert.equal(s.seasonalRecords.length,4);assert.equal(s.linkedEvidence.length,4);assert.equal(s.completed[2],false);
 const restored=restoreState(JSON.stringify(s));assert.deepEqual(restored.seasonalRecords,s.seasonalRecords);assert.deepEqual(restored.linkedEvidence,s.linkedEvidence);
 const before=JSON.stringify(s.seasonPhotos);s.seasonPhotos['cherry:3'].underground=false;carryFieldEvidence(s,1);assert.equal(s.seasonPhotos['cherry:3'].underground,false);
 const unfinished=freshState();carryFieldEvidence(unfinished,1);assert.deepEqual(unfinished.seasonPhotos,{});assert.notEqual(before,'{}');
});

test('현장 정원은 복구와 시험을 마친 경우에만 빈 정원에 이어지고 기존 작품은 보존한다',()=>{
 function complete(s){s.page=6;const u={};for(const [env,z] of [['water','pond'],['grass','meadow'],['dry','ridge']])fieldMissionAction(s,u,'field-place-environment',`${env}:${z}`);for(const [plant,z] of [['hyacinth','pond'],['cherry','meadow'],['aloe','ridge']])fieldMissionAction(s,u,'field-place-plant',`${plant}:${z}`);fieldMissionAction(s,u,'field-garden-rain','');}
 const s=freshState();complete(s);carryFieldEvidence(s,3);
 assert.deepEqual(s.garden,{hyacinth:0,cherry:2,aloe:4});assert.equal(s.gardenReviewed,true);assert.deepEqual(s.gardenReasons,[]);assert.equal(s.completed[6],false);
 const restored=restoreState(JSON.stringify(s));assert.deepEqual(restored.garden,s.garden);assert.deepEqual(restored.terrain,s.terrain);
 const own=freshState();complete(own);own.terrain[0]='dry';carryFieldEvidence(own,3);assert.equal(own.terrain[0],'dry');assert.deepEqual(own.garden,{});
 const unfinished=freshState();carryFieldEvidence(unfinished,3);assert.deepEqual(unfinished.garden,{});assert.equal(unfinished.gardenReviewed,false);
});
