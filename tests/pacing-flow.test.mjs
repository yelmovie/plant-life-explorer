import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshState,restoreState,pageReady} from '../src/model.js';
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
test('현장에서 두 기준으로 나눈 1장은 새 잎을 다시 나누지 않고 기록을 마친다',()=>{
 const s=freshState(),u={activityMode:'explore'};s.journeyRequired[0]=true;
 assert.equal(pageReady(s,1),false);
 leaves(s);assert.equal(pageReady(s,0),true);assert.equal(pageReady(s,1),true);
 assert.deepEqual(s.leafEvidence,{});assert.deepEqual(s.groups,freshState().groups);
 s.page=1;const html=renderActivity(s,u,()=>'');
 assert.doesNotMatch(html,/sort-board|data-action="assign-group"/);assert.match(html,/단풍나무/);
 assert.equal(pageReady(restoreState(JSON.stringify(s)),1),true);
});
test('현장 분류를 다 마치지 않으면 1장 기록도 마칠 수 없다',()=>{
 const s=freshState(),u={};s.journeyRequired[0]=true;s.page=0;
 for(const feature of ['shape','edge'])fieldMissionAction(s,u,'field-scan',`maple:${feature}`);
 for(const id of ['maple','pine','camellia'])fieldMissionAction(s,u,'field-sort',`edge:${id}:${id!=='pine'?'yes':'no'}`);
 assert.equal(pageReady(s,1),false);
});
test('완료 전 이어 쓰기를 눌러도 이후의 실제 계절 증거를 막지 않고 설명은 한 번만 한다',()=>{
 const s=freshState();carryFieldEvidence(s,1);assert.equal(s.fieldBridges[1],false);assert.deepEqual(s.seasonExplained,[]);
 seasons(s);carryFieldEvidence(s,1);assert.equal(pageReady(s,3),true);assert.equal(s.completed[2],false);
 assert.deepEqual([...s.seasonExplained].sort(),['cherry','sowthistle']);assert.equal(s.seasonPrediction.cherry,'none');
 s.page=3;assert.doesNotMatch(renderActivity(s,{activityMode:'explore'},()=>''),/data-action="season-explain"/);
 const old=restoreState(JSON.stringify(s));old.seasonExplained=[];carryFieldEvidence(old,1);assert.equal(pageReady(old,3),true);
});
