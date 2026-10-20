import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshState,restoreState,PLANTS,recordFeature,pageReady,rewardCount} from '../src/model.js';
import {EXPEDITIONS,earnedTools,renderToolPack} from '../src/expedition.js';
import {renderActivity} from '../src/learning.js';

function observedAndClassified(){
  const s=freshState();
  for(const p of PLANTS){recordFeature(s,p.id,'shape',p.id);recordFeature(s,p.id,'edge',p.edge?'yes':'no');}
  for(const rule of ['edge','narrow']){s.groupsByRule[rule]=Object.fromEntries(PLANTS.map(p=>[p.id,p[rule]?'yes':'no']));s.classificationEvidence[rule]='cherry';}
  s.groups={...s.groupsByRule.edge};return s;
}
test('새로 시작한 탐구는 기존 정답만으로 현장 임무를 건너뛰어 보상을 받지 못한다',()=>{
  const s=observedAndClassified();assert.equal(pageReady(s,1),true);
  s.journeyRequired[0]=true;assert.equal(pageReady(s,1),false);
  assert.equal(pageReady(restoreState(JSON.stringify(s)),1),false);assert.equal(rewardCount(s),0);
});
test('기존에 마친 탐구는 신규 현장 임무 조건 때문에 취소하지 않는다',()=>{
  const s=observedAndClassified();s.completed[0]=s.completed[1]=true;s.journeyRequired[0]=true;
  const restored=restoreState(JSON.stringify(s));assert.equal(restored.completed[1],true);assert.equal(pageReady(restored,1),true);assert.equal(rewardCount(restored),1);
});
test('도구와 배지는 실제 미션 완료에서만 계산하고 미리보기나 재표시로 늘지 않는다',()=>{
  const s=freshState();s.adminUnlocked=true;assert.equal(earnedTools(s).length,0);
  s.completed[0]=true;assert.equal(earnedTools(s).length,0);s.completed[1]=true;
  for(let n=0;n<3;n++)renderToolPack(s);
  assert.deepEqual(earnedTools(s).map(p=>p.tool),['관찰 렌즈']);assert.equal(rewardCount(s),1);
  assert.ok(EXPEDITIONS.every(p=>p.goal&&p.steps.length===3&&p.use&&p.standard));
});
test('모든 활동에서 같은 리피와 현장 임무에서 보상까지의 연결이 보인다',()=>{
  const s=freshState(),ui={plant:'cherry',region:'shape',selected:'hyacinth',zoom:1,rotation:0,undo:[],activityMode:'explore'};
  for(let p=0;p<10;p++){s.page=p;const html=renderActivity(s,ui,()=>'<div></div>');assert.match(html,/mood_leaf_/);assert.match(html,/현장 임무/);assert.match(html,/탐구하며 기록/);assert.match(html,/리피 · 정원 구조대/);}
});
