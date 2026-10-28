import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshState,restoreState,pageReady,PLANTS} from '../src/model.js';
import {fieldMissionAction} from '../src/field-missions.js';
import {carryFieldEvidence} from '../src/field-bridge.js';
import {learningAction,renderActivity} from '../src/learning.js';

function leaves(s){
 const u={};s.page=0;
 for(const feature of ['shape','edge'])fieldMissionAction(s,u,'field-scan',`maple:${feature}`);
 for(const rule of ['edge','narrow'])for(const id of ['maple','pine','camellia'])fieldMissionAction(s,u,'field-sort',`${rule}:${id}:${(rule==='edge'?id!=='pine':id==='pine')?'yes':'no'}`);
}
function seasons(s){
 const u={};s.page=2;
 for(const [plant,part,clue] of [['tree','trunk','branches'],['herb','root','rootbud']]){
  fieldMissionAction(s,u,'field-season-predict',`${plant}:none`);
  fieldMissionAction(s,u,'field-season-link',`${plant}:${part}`);
  fieldMissionAction(s,u,'field-season-turn',plant);
  fieldMissionAction(s,u,'field-season-clue',`${plant}:${clue}`);
 }
}
test('두 기준을 배운 뒤 새 잎은 한 기준으로 적용하고 관찰하지 않은 세부 특징은 만들지 않는다',()=>{
 for(const rule of ['edge','narrow']){
  const s=freshState(),u={activityMode:'explore',selected:'cherry'};
  assert.equal(pageReady(s,0),false);leaves(s);assert.equal(pageReady(s,0),true);
  s.page=1;learningAction(s,u,'rule',rule);
  for(const p of PLANTS){u.selected=p.id;learningAction(s,u,'assign-group',p[rule]?'yes':'no');}
  assert.equal(pageReady(s,1),true);assert.deepEqual(s.leafEvidence,{});
  const restored=restoreState(JSON.stringify(s));assert.equal(pageReady(restored,1),true);assert.deepEqual(restored.leafEvidence,{});
  assert.doesNotMatch(renderActivity(restored,u,()=>''),/data-action="classification-proof"/);
  u.selected='cherry';learningAction(s,u,'assign-group',PLANTS[0][rule]?'no':'yes');assert.equal(pageReady(s,1),false);
 }
});
test('이전 분류 저장의 확인 버튼도 실제 배치를 근거로 완료하며 틀린 배치는 통과하지 않는다',()=>{
 const s=freshState(),u={};leaves(s);s.page=1;s.groups={cherry:'yes',ginkgo:'no',grass:'no'};
 assert.equal(pageReady(s,1),false);learningAction(s,u,'check-rule');assert.equal(pageReady(s,1),true);
 delete s.classificationEvidence.edge;s.groups.cherry='no';learningAction(s,u,'check-rule');assert.equal(pageReady(s,1),false);
});
test('완료 전 이어 쓰기를 눌러도 이후의 실제 계절 증거를 막지 않고 설명은 한 번만 한다',()=>{
 const s=freshState();carryFieldEvidence(s,1);assert.equal(s.fieldBridges[1],false);assert.deepEqual(s.seasonExplained,[]);
 seasons(s);carryFieldEvidence(s,1);assert.equal(pageReady(s,3),true);assert.equal(s.completed[2],false);
 assert.deepEqual([...s.seasonExplained].sort(),['cherry','sowthistle']);assert.equal(s.seasonPrediction.cherry,'none');
 s.page=3;assert.doesNotMatch(renderActivity(s,{activityMode:'explore'},()=>''),/data-action="season-explain"/);
 const old=restoreState(JSON.stringify(s));old.seasonExplained=[];carryFieldEvidence(old,1);assert.equal(pageReady(old,3),true);
});
