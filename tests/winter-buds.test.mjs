import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshState,restoreState} from '../src/model.js';
import {learningAction,renderActivity} from '../src/learning.js';
import {lookForBud,nextBudSpot,normalizeBuds,BUD_GOAL} from '../src/winter-buds.js';
import {notebookEntry} from '../src/research-notebook.js';

const winterChecked=(plant='cherry')=>{const s=freshState();s.screen='activity';s.page=2;s.completed[0]=s.completed[1]=true;s.seasonPlant=plant;s.season=3;s.seasonPrediction[plant]='roots';s.undergroundSeen=[plant];return s;};

test('겨울눈은 가지 끝에서만 찾고 같은 자리는 두 번 세지 않는다',()=>{
  assert.equal(lookForBud('cherry',.17,.13).hit,true);
  assert.match(lookForBud('cherry',.5,.3).message,/가지 끝/);
  assert.match(lookForBud('cherry',.02,.02).message,/가지가 없어/);
  assert.match(lookForBud('cherry',.5,.8).message,/땅 위/);
  assert.equal(lookForBud('cherry',.18,.14,[[.17,.13]]).hit,false);
  assert.equal(lookForBud('cherry',.87,.3,[[.17,.13],[.55,.03],[.13,.38]]).hit,false);
  assert.equal(lookForBud('sowthistle',.5,.6).hit,true);
  assert.equal(lookForBud('sowthistle',.5,.8).hit,false);
  assert.equal(lookForBud('cherry',2,.1).message,'');
});

test('렌즈 도움은 아직 찾지 않은 자리로 안내하고 저장은 범위·개수를 지킨다',()=>{
  assert.deepEqual(nextBudSpot("cherry",[[.17,.13]]),[.55,.07]);
  assert.equal(nextBudSpot('sowthistle',[[.5,.6]]),null);
  const buds=normalizeBuds({cherry:[[.2,.1],[.21,.11],[1.5,.2],'x',[.5,.02],[.85,.3],[.13,.4]],sowthistle:[[.5,.6],[.4,.6]]});
  assert.equal(buds.cherry.length,BUD_GOAL.cherry);
  assert.equal(buds.sowthistle.length,1);
  assert.deepEqual(normalizeBuds(null),{cherry:[],sowthistle:[]});
});

test('겨울 땅속을 확인하기 전에는 렌즈를 쓸 수 없고, 찾은 눈은 기록·복원·노트에 남는다',()=>{
  const fresh=freshState();fresh.page=2;fresh.season=3;fresh.seasonPrediction.cherry='roots';const ui={};
  assert.match(learningAction(fresh,ui,'bud-lens',''),/땅속을 확인한 뒤/);
  assert.equal(ui.budLens,undefined);
  const s=winterChecked(),u={};
  assert.equal(learningAction(s,u,'bud-look','.17,.13,600,400'),'');
  learningAction(s,u,'bud-lens','');assert.equal(u.budLens,true);
  assert.match(learningAction(s,u,'bud-look','.17,.13,600,400'),/1\/3/);
  assert.equal(u.budLook.hit,true);
  assert.match(learningAction(s,u,'bud-look','.5,.3,600,400'),/가지 끝/);
  assert.equal(u.budLook.hit,false);
  learningAction(s,u,'bud-hint','600,400');learningAction(s,u,'bud-hint','600,400');
  assert.equal(s.budsFound.cherry.length,3);
  assert.equal(s.learningRecords[1].hints,2);
  s.seasonPlant='sowthistle';s.seasonPrediction.sowthistle='none';s.undergroundSeen.push('sowthistle');
  assert.match(learningAction(s,u,'bud-look','.5,.6,600,400'),/모두 찾았어/);
  const back=restoreState(JSON.stringify(s));
  assert.equal(back.budsFound.cherry.length+back.budsFound.sowthistle.length,4);
  assert.match(notebookEntry(back,1).body,/겨울눈 4\/4|가지 끝 겨울눈 3개/);
  learningAction(s,u,'season','2');assert.equal(u.budLens,false);assert.equal(u.budLook,null);
});

test('초봄은 보기 전용이고 겨울 예상 전에는 땅속을 열지 않는다',()=>{
  const s=freshState();s.screen='activity';s.page=2;s.completed[0]=true;s.season=4;const u={};
  assert.match(learningAction(s,u,'underground',''),/겨울에서 땅속을 예상/);
  assert.equal(s.underground,false);
  assert.match(learningAction(s,u,'record-season',''),/초봄은 살펴보는 단계/);
  assert.equal(s.seasonalRecords.length,0);
  const html=renderActivity(s,{activityMode:'explore'},()=>'');
  assert.match(html,/cherry_bud_spring\.webp/);
  assert.match(html,/max="4"/);
  assert.doesNotMatch(html,/data-action="record-season"/);
  s.seasonPrediction.cherry='roots';
  learningAction(s,u,'underground','');
  assert.equal(s.underground,true);
  assert.ok(s.undergroundSeen.includes('cherry'));
  assert.equal(restoreState(JSON.stringify(s)).season,4);
});
