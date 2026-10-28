import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshState,restoreState} from '../src/model.js';
import {fieldMissionAction} from '../src/field-missions.js';
import {learningStamp} from '../src/learning-records.js';
import {coreResponse} from '../src/response-tracking.js';

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

test('기준을 바꾸어 분류하면 각 기준의 선택과 수정이 따로 보존된다',()=>{
 const {s,act,observe}=setup();observe();
 act('field-sort','edge:pine:no');act('field-sort','narrow:pine:no');act('field-sort','narrow:pine:yes');
 const records=s.learningRecords[0].responses;
 assert.equal(records['field:sort:edge:pine'].first,'톱니 없음');
 assert.equal(records['field:sort:edge:pine'].attempts,1);
 assert.equal(records['field:sort:edge:pine'].wrong,0);
 assert.equal(records['field:sort:narrow:pine'].first,'다른 모양');
 assert.equal(records['field:sort:narrow:pine'].last,'길쭉함');
 assert.equal(records['field:sort:narrow:pine'].wrong,1);
 assert.equal(records['field:sort:narrow:pine'].correct,true);
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

test('새 잎 분류는 별도 특징 문답 없이 각 배치의 오답과 수정을 남긴다',()=>{
 const s=freshState(),u={selected:'cherry'};s.page=1;
 const record=id=>coreResponse(s,u,'assign-group',id)?.();
 record('no');record('yes');
 const edge=s.learningRecords[0].responses['core:classify:edge:cherry'];
 assert.equal(edge.first,'톱니 없음');assert.equal(edge.last,'톱니 있음');
 assert.equal(edge.wrong,1);assert.equal(edge.correct,true);
 s.rule='narrow';record('no');
 assert.equal(s.learningRecords[0].responses['core:classify:narrow:cherry'].correct,true);
 assert.deepEqual(s.leafEvidence,{},'답하지 않은 잎 모양 문답을 정답으로 만들지 않는다');
 const before=JSON.stringify(s.learningRecords);
 record('maybe');u.selected='pine';record('yes');u.selected='cherry';s.rule='color';record('yes');
 assert.equal(JSON.stringify(s.learningRecords),before);
});

test('알맞은 환경을 고른 뒤 특징과 도움을 한 번에 연결한 실제 응답만 기록한다',()=>{
 const s=freshState(),u={selected:'hyacinth'};s.page=5;
 const record=id=>coreResponse(s,u,'habitat-answer',id)?.();
 record('hyacinth');s.habitats.hyacinth='dry';record('hyacinth');
 assert.deepEqual(s.learningRecords[2].responses,{});
 s.habitats.hyacinth='water';record('aloe');record('hyacinth');
 const r=s.learningRecords[2].responses['core:reason:hyacinth'];
 assert.equal(r.first,'알로에');assert.equal(r.last,'부레옥잠');
 assert.equal(r.wrong,1);assert.equal(r.correct,true);
 assert.match(r.label,/특징과 생활 연결/);
 const before=JSON.stringify(s.learningRecords);record('unknown');u.selected='pine';record('hyacinth');
 assert.equal(JSON.stringify(s.learningRecords),before);
});
