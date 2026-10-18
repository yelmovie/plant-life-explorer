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
 s.tests.unshift(testDesign({surface:'plain',cover:'flap'}));s.testExplanation={key:'lotus:flap',before:'plain:flap',part:'surface'};assert.equal(testValid(s),true);
 s.design.cover='open';assert.equal(testValid(s),false);assert.match(inventionHint(s).title,/시험/);
});
