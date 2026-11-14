import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshState,restoreState,pageReady} from '../src/model.js';
import {fieldMissionAction} from '../src/field-missions.js';
import {carryFieldEvidence} from '../src/field-bridge.js';
import {learningAction,renderActivity} from '../src/learning.js';

function leaves(s){
 const u={};s.page=0;
 for(const feature of ['shape','edge'])fieldMissionAction(s,u,'field-scan',`maple:${feature}`);
 for(const id of ['maple','pine','camellia'])fieldMissionAction(s,u,'field-sort',`edge:${id}:${id!=='pine'?'yes':'no'}`);
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
test('현장 분류를 마쳐도 1장의 잎 살피기와 나누기는 학생이 직접 풀어야 기록을 마친다',()=>{
 const s=freshState(),u={activityMode:'explore'};s.journeyRequired[0]=true;
 assert.equal(pageReady(s,1),false);
 leaves(s);carryFieldEvidence(s,0);assert.equal(pageReady(s,0),false);assert.equal(pageReady(s,1),false);
 assert.deepEqual(s.leafEvidence,{});assert.deepEqual(s.groups,freshState().groups);
 s.page=1;assert.match(renderActivity(s,u,()=>''),/data-action="leaf-partner"/,'새 짝은 학생이 고른다');
 // A page saved as done under the old field shortcut stays done.
 const old=restoreState(JSON.stringify({...s,completed:[true,true,false,false,false,false,false,false,false,false]}));assert.equal(pageReady(old,1),true);
});
test('현장 분류를 다 마치지 않으면 1장 기록도 마칠 수 없다',()=>{
 const s=freshState(),u={};s.journeyRequired[0]=true;s.page=0;
 for(const feature of ['shape','edge'])fieldMissionAction(s,u,'field-scan',`maple:${feature}`);
 for(const id of ['maple','pine','camellia'])fieldMissionAction(s,u,'field-sort',`edge:${id}:${id!=='pine'?'yes':'no'}`);
 assert.equal(pageReady(s,1),false);
});
test('계절 현장 뒤에는 사진을 다시 찍지 않고 두 식물의 차이를 한 번 기록한다',()=>{
 const s=freshState();carryFieldEvidence(s,1);assert.equal(s.fieldBridges[1],false);assert.deepEqual(s.seasonExplained,[]);
 seasons(s);carryFieldEvidence(s,1);assert.equal(s.fieldBridges[1],true);
 assert.equal(pageReady(s,2),false);assert.equal(pageReady(s,3),false);assert.equal(s.completed[2],false);
 assert.deepEqual(s.seasonExplained,[]);assert.deepEqual(s.seasonalRecords,[]);assert.equal(s.seasonPrediction.cherry,'none');
 s.page=3;const u={activityMode:'explore'};assert.match(renderActivity(s,u,()=>''),/현장에서 살펴본 겨울과 다음 봄/);
 learningAction(s,u,'season-review-answer','new');assert.equal(pageReady(s,3),false);
 learningAction(s,u,'season-review-answer','parts');assert.equal(pageReady(restoreState(JSON.stringify(s)),3),true);assert.deepEqual(s.seasonalRecords,[]);
});
