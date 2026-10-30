import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshState} from '../src/model.js';
import {fieldSteps} from '../src/field-missions-state.js';
import {fieldMissionAction} from '../src/field-missions.js';
import {nextAutoStep} from '../src/auto-play.js';

// Choices that belong to the student; auto-play must never make them.
const STUDENT_ONLY=new Set(['field-sort','field-season-turn','field-bag-upgrade','field-season-predict','field-season-link','field-season-clue','field-order','field-predict','field-model-reason','field-place-plant','field-place-environment','field-bag-predict','field-bag-answer']);
const fieldSetup=(mission,stage=0)=>{
 const s=freshState();s.screen='activity';s.page=mission*2;
 const u={activityMode:'field',fieldMission:{mission,stage}};
 return {s,u,act:(a,id='')=>fieldMissionAction(s,u,a,id)};
};
// Runs auto-play until it stops and returns every step it took.
function drive(s,u,limit=20){
 const steps=[];
 for(let i=0;i<limit;i++){
  const step=nextAutoStep(s,u);if(!step)return steps;
  assert.ok(!STUDENT_ONLY.has(step[0]),`auto-play made a student choice: ${step.join(' ')}`);
  steps.push(step);fieldMissionAction(s,u,...step);
 }
 assert.fail(`auto-play did not stop within ${limit} steps: ${JSON.stringify(steps)}`);
}

test('현장 0: 단풍잎을 돋보기로 살피는 것까지만 하고 카드 나누기는 학생에게 맡긴다',()=>{
 const {s,u}=fieldSetup(0);
 assert.deepEqual(drive(s,u),[['field-scan','maple:shape'],['field-scan','maple:edge']]);
 assert.equal(u.fieldMission.stage,0,'나누기 단계로 넘어가지 않는다');
 const sort=fieldSetup(0,1);assert.equal(nextAutoStep(sort.s,sort.u),null,'톱니 나누기는 학생 몫이다');
 const shape=fieldSetup(0,2);assert.equal(nextAutoStep(shape.s,shape.u),null,'모양 나누기는 학생 몫이다');
});

test('현장 1: 예상 전에는 아무것도 하지 않고, 예상 뒤에는 파 보기만 한다',()=>{
 const blank=fieldSetup(1);assert.equal(nextAutoStep(blank.s,blank.u),null,'예상이 없으면 바로 멈춘다');
 const {s,u,act}=fieldSetup(1);for(const k of ['tree','herb'])act('field-season-predict',k+':roots');
 assert.deepEqual(drive(s,u),[['field-dig','tree'],['field-dig','herb']]);
 assert.deepEqual(s.fieldEvidence.seasons.links,{},'잇기는 학생 몫이다');assert.equal(u.fieldMission.stage,0);
 const later=fieldSetup(1,1);for(const k of ['tree','herb'])later.act('field-season-predict',k+':roots');
 assert.deepEqual(drive(later.s,later.u),[],'시간 순서 잇기는 학생 몫이다');
 assert.deepEqual(later.s.fieldEvidence.seasons.clues,{},'근거 고르기는 학생 몫이다');
});

test('현장 2: 예상 전에는 멈추고, 예상 뒤에는 두 모형 시험과 잎자루 자르기까지만 한다',()=>{
 const blank=fieldSetup(2);assert.equal(nextAutoStep(blank.s,blank.u),null);
 const {s,u,act}=fieldSetup(2,1);act('field-predict','air:sink');act('field-predict','solid:float');
 assert.deepEqual(drive(s,u),[['field-test-model','air'],['field-test-model','solid'],['field-stage','2'],['field-cut','']]);
 assert.equal(u.fieldMission.stage,2);assert.equal(u.fieldMission.floatCut,true);
 assert.equal(s.fieldEvidence.float.reason,'','공기 공간 연결은 학생 몫이다');
 assert.deepEqual(s.fieldEvidence.float.predictions,{air:'sink',solid:'float'},'처음 예상은 그대로다');
});

test('현장 3: 비로 땅만 만들고 심기 전에서 멈추며, 맞게 심은 정원에는 비를 내린다',()=>{
 const {s,u}=fieldSetup(3);
 assert.deepEqual(drive(s,u),[['field-garden-ground','']]);
 assert.equal(u.fieldMission.stage,0,'심기 단계로 넘어가지 않는다');assert.deepEqual(s.fieldEvidence.garden.plants,{});
 const g=fieldSetup(3,2);g.act('field-garden-ground');
 for(const [plant,zone] of [['hyacinth','pond'],['cherry','meadow'],['aloe','ridge']])g.act('field-place-plant',`${plant}:${zone}`);
 assert.deepEqual(drive(g.s,g.u),[['field-garden-rain','']]);
 assert.deepEqual(fieldSteps(g.s.fieldEvidence,3),[true,true,true]);
});

test('현장 4: 예상 전에는 멈추고, 예상 뒤에는 첫 비만 내리며 부품 달기는 학생이 한다',()=>{
 const blank=fieldSetup(4);assert.equal(nextAutoStep(blank.s,blank.u),null);
 const {s,u,act}=fieldSetup(4);act('field-bag-predict','surface');
 assert.deepEqual(drive(s,u),[['field-bag-test','']]);
 assert.equal(u.fieldMission.stage,0,'부품 달기 단계로 넘어가지 않는다');
 const later=fieldSetup(4,1);later.act('field-bag-predict','surface');later.act('field-bag-test');
 assert.equal(nextAutoStep(later.s,later.u),null,'부품 고르기는 학생 몫이다');
 later.act('field-bag-upgrade','surface');assert.deepEqual(nextAutoStep(later.s,later.u),['field-bag-test',''],'학생이 바꾼 가방은 비로 시험해 본다');
 assert.equal(later.s.fieldEvidence.bag.delivered,'');
});

test('활동 화면이 아니면 자동 진행은 아무것도 하지 않는다',()=>{
 const s=freshState();s.page=4;assert.equal(nextAutoStep(s,{activityMode:'explore'}),null);
});

const core=(page,patch={})=>Object.assign(freshState(),{screen:'activity',page},patch);
const explore={activityMode:'explore'};

test('본 탐구 4쪽: 자르고 물에 넣은 뒤 예상이 있어야 잎자루를 누른다',()=>{
 const s=core(4);
 assert.deepEqual(nextAutoStep(s,explore),['lab-next','cut']);
 s.experiment.step=1;assert.deepEqual(nextAutoStep(s,explore),['lab-next','water']);
 s.experiment.step=2;assert.deepEqual(nextAutoStep(s,explore),['lab-next','water']);
 s.experiment.step=3;assert.equal(nextAutoStep(s,explore),null,'예상 전에는 멈춘다');
 s.experiment.prediction='bubbles';assert.deepEqual(nextAutoStep(s,explore),['press-petiole','']);
 s.experiment.step=4;assert.equal(nextAutoStep(s,explore),null,'방울의 정체는 학생이 답한다');
});

test('본 탐구 2쪽: 겨울로 넘긴 뒤 땅속 예상 전에서 멈춘다',()=>{
 const s=core(2);
 assert.deepEqual(nextAutoStep(s,explore),['season','3']);
 s.season=3;assert.equal(nextAutoStep(s,explore),null);
 s.seasonPrediction={cherry:'roots'};assert.deepEqual(nextAutoStep(s,explore),['underground','']);
});

test('본 탐구 8쪽: 연잎에 물방울을 한 번 떨어뜨리고 관찰한 뒤에는 멈춘다',()=>{
 const s=core(8);
 assert.deepEqual(nextAutoStep(s,explore),['lotus-drop','']);
 assert.equal(nextAutoStep(s,{...explore,lotusDrop:true}),null);
 s.design.observed=true;assert.equal(nextAutoStep(s,explore),null);
});

test('본 탐구 9쪽: 연잎 특징을 잇기 전에는 가방 시험을 하지 않는다',()=>{
 const s=core(9);assert.equal(s.design.linked,false);
 assert.equal(nextAutoStep(s,explore),null);
});

test('본 탐구 6쪽: 땅 칠하기는 학생이 직접 한다',()=>{
 const s=core(6,{terrain:Array(24).fill('empty')});
 assert.equal(nextAutoStep(s,explore),null);
});
