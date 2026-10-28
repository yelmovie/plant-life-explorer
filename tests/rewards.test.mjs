import {completeInvention} from './invention-fixture.mjs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshState,restoreState,rewardCount,canChooseGardenTheme,testDesign,testValid} from '../src/model.js';
import {inventionHint} from '../src/invention.js';
import {seedProgress,worldMap,themePicker} from '../src/rewards.js';

test('보상은 완료한 미션당 하나이며 관리자 해금이나 재표시로 늘지 않는다',()=>{
 const s=freshState();s.adminUnlocked=true;assert.equal(rewardCount(s),0);
 s.completed[0]=true;assert.equal(rewardCount(s),0);s.completed[1]=true;
 for(let i=0;i<4;i++){seedProgress(s);worldMap(s);assert.equal(rewardCount(s),1);}
 assert.equal((worldMap(s).match(/class="world-node restored/g)||[]).length,1);
});
test('꽃길 꾸미기는 두 번째 미션 뒤 열리고 유효한 선택만 저장 복원한다',()=>{
 const s=freshState();s.gardenTheme='blue';assert.equal(canChooseGardenTheme(s),false);assert.equal(themePicker(s),'');
 assert.equal(restoreState(JSON.stringify(s)).gardenTheme,'pink');
 s.seasonalRecords=['cherry:0','cherry:1','cherry:3','sowthistle:0','sowthistle:1','sowthistle:3'];s.linkedEvidence=['cherry:0','cherry:3'];s.completed[2]=s.completed[3]=true;
 assert.equal(canChooseGardenTheme(s),true);assert.equal(restoreState(JSON.stringify(s)).gardenTheme,'blue');
 s.gardenTheme='invalid';assert.equal(restoreState(JSON.stringify(s)).gardenTheme,'pink');
});
test('가방 네 조합의 결과와 한 부품 비교 안내',()=>{
 const s=freshState();assert.match(inventionHint(s).title,/비/);
 for(const surface of ['plain','lotus'])for(const cover of ['open','flap']){
  s.design={surface,cover,linked:true};const result=testDesign(s.design);s.tests=[result];
  assert.equal(result.clean,surface==='lotus');assert.equal(result.dry,cover==='flap');assert.equal(testValid(s),false);assert.match(inventionHint(s).text,/하나만/);
 }
 s.tests.unshift(testDesign({surface:'plain',cover:'flap'}));s.testExplanation={key:'lotus:flap',before:'plain:flap',part:'surface'};assert.equal(testValid(s),false);completeInvention(s);assert.equal(testValid(s),true);
 s.design.cover='open';assert.equal(testValid(s),false);assert.match(inventionHint(s).title,/시험/);
});

// --- 잠금 이유·스탬프 표시·렌더 ---
import {stampBoard,REWARDS} from '../src/rewards.js';
import {renderActivity,renderEnding,renderReport,renderFinal} from '../src/learning.js';
import {QUESTS} from '../src/inquiry.js';
test('잠긴 장소와 미완료 버튼은 disabled 대신 이유를 가진 aria-disabled로 나온다',()=>{
 const s=freshState(),map=worldMap(s);
 assert.match(map,/aria-disabled="true" data-reason="표본 온실을 깨우면 열려\."/);assert.doesNotMatch(map,/\sdisabled[\s>]/);
 const page=renderActivity(s,{plant:'cherry',region:'shape',zoom:1,rotation:0,selected:'cherry',undo:[]},()=>'');
 assert.match(page,/data-action="complete" aria-disabled="true" data-reason="[^"]+"/);
});
test('스탬프 두 종은 같은 칭찬으로 보이고 미션마다 배울 것·생활 연결이 있다',()=>{
 const s=freshState();s.completed[0]=s.completed[1]=s.completed[2]=s.completed[3]=true;s.stamps={direct:[0],fixed:[1]};
 const board=stampBoard(s);assert.match(board,/스스로 찾았어/);assert.match(board,/관찰하고 고쳤어/);assert.doesNotMatch(board,/무결점|점수|등급/);
 assert.ok(QUESTS.every(q=>q.learn&&q.life));assert.ok(REWARDS.every(r=>/기록|정원/.test(r.why)));assert.ok(REWARDS.every(r=>!r.why.includes('나는')));
});
test('모든 활동·보고·엔딩 화면이 오류 없이 그려지고 엔딩은 완료와 이해를 구분한다',()=>{
 const s=freshState(),u={plant:'cherry',region:'shape',zoom:1,rotation:0,selected:'hyacinth',undo:[]};
 for(let p=0;p<10;p++){s.page=p;assert.ok(renderActivity(s,u,()=>'').length>100);}
 s.season=3;s.page=2;assert.match(renderActivity(s,u,()=>''),/겨울 땅속에는 무엇이 남아 있을까/);
 s.page=5;s.habitats.hyacinth='grass';const board=renderActivity(s,u,()=>'');// A wrong home stays marked on the card with a clue instead of a drawn line.
 assert.match(board,/habitat-option picked" data-action="habitat" data-id="grass"/);assert.match(board,/풀밭 흙 위에서는 부레옥잠이/);
 assert.ok(renderReport(s).length&&renderFinal(s,()=>'').length);
 const end=renderEnding(s,()=>'');assert.match(end,/이해한 내용은 연구노트의 선택과 관찰 근거/);assert.doesNotMatch(end,/📷|○/);
});
