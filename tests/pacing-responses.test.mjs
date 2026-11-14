import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshState,restoreState} from '../src/model.js';
import {fieldMissionAction} from '../src/field-missions.js';
import {learningStamp} from '../src/learning-records.js';
import {learningAction} from '../src/learning.js';

function setup(){
 const s=freshState(),u={};
 const act=(action,id)=>fieldMissionAction(s,u,action,id);
 const observe=()=>{for(const region of ['shape','edge'])act('field-scan','maple:'+region);};
 return {s,u,act,observe};
}

test('다른 잎을 따로 스캔하지 않아도 분류의 첫 오답과 수정이 기록된다',()=>{
 const {s,act,observe}=setup();observe();
 for(const [plant,wrong,right] of [['pine','yes','no'],['camellia','no','yes']]){
  act('field-sort',`edge:${plant}:${wrong}`);act('field-sort',`edge:${plant}:${right}`);
  const record=s.learningRecords[0].responses[`field:sort:edge:${plant}`];
  assert.deepEqual(s.fieldEvidence.leaves.scans[plant],[]);
  assert.equal(record.first,wrong==='yes'?'톱니 있음':'톱니 없음');
  assert.equal(record.last,right==='yes'?'톱니 있음':'톱니 없음');
  assert.equal(record.attempts,2);assert.equal(record.wrong,1);
  assert.equal(record.firstCorrect,false);assert.equal(record.correct,true);
 }
 assert.equal(learningStamp(s,0),'fixed');
 assert.deepEqual(restoreState(JSON.stringify(s)).learningRecords,s.learningRecords);
});


test('필수 관찰 전이나 무효 분류 입력은 이전 피드백이 있어도 학습 응답을 만들지 않는다',()=>{
 const {s,act,observe}=setup();
 act('field-scan','maple:edge');act('field-sort','edge:maple:no');
 assert.deepEqual(s.fieldEvidence.leaves.edge,{});
 assert.deepEqual(s.learningRecords[0].responses,{});
 observe();act('field-sort','edge:pine:no');
 const before=JSON.stringify({evidence:s.fieldEvidence,records:s.learningRecords});
 for(const id of ['color:pine:yes','edge:oak:no','edge:pine:maybe','edge:pine',':pine:no']){
  act('field-sort',id);
  assert.equal(JSON.stringify({evidence:s.fieldEvidence,records:s.learningRecords}),before,id);
 }
});

test('은행잎 새 짝의 첫 선택과 고친 선택이 남고 맞춘 뒤에는 기록이 바뀌지 않는다',()=>{
 const s=freshState(),u={};learningAction(s,u,'leaf-zoom','large');s.page=1;
 learningAction(s,u,'leaf-partner','grass');learningAction(s,u,'leaf-partner','cherry');
 const record=s.learningRecords[0].responses['core:leaf-partner'];
 assert.equal(record.first,'강아지풀');assert.equal(record.last,'벚나무');
 assert.equal(record.wrong,1);assert.equal(record.correct,true);
 assert.deepEqual(s.leafEvidence,{});
 learningAction(s,u,'leaf-partner','grass');assert.equal(record.attempts,2);
 assert.deepEqual(restoreState(JSON.stringify(s)).learningRecords,s.learningRecords);
});

test('한 번의 식물 비교에서 실제 선택과 수정만 기록한다',()=>{
 const s=freshState(),u={};s.page=5;s.experiment.step=4;s.experimentAnswer='air';
 learningAction(s,u,'habitat-compare-answer','unknown');
 assert.deepEqual(s.learningRecords[2].responses,{});
 learningAction(s,u,'habitat-compare-answer','hyacinth');
 learningAction(s,u,'habitat-compare-answer','aloe');
 learningAction(s,u,'habitat-compare-answer','cherry');
 const r=s.learningRecords[2].responses['core:habitat-compare'];
 assert.equal(r.first,'부레옥잠');assert.equal(r.last,'알로에');
 assert.equal(r.attempts,2);assert.equal(r.wrong,1);assert.equal(r.correct,true);
});
