import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {freshState,restoreState} from '../src/model.js';
import {rewardCardsOwned,newRewardCards} from '../src/achievement-cards.js';

const read=file=>readFileSync(new URL(`../${file}`,import.meta.url),'utf8');

test('성취 카드 보유는 기존 지도 타격 기록(3타)에서 계산하고 저장 형식을 바꾸지 않는다',()=>{
 assert.deepEqual(rewardCardsOwned({leaf:3,season:2,bag:3}),[true,false,false,false,true]);
 assert.deepEqual(rewardCardsOwned(undefined),[false,false,false,false,false]);
 const save=freshState();save.mapEncounters={leaf:3,tag:1};
 const restored=restoreState(JSON.stringify(save));
 assert.deepEqual(rewardCardsOwned(restored.mapEncounters),[true,false,false,false,false]);
 assert.deepEqual(Object.keys(restored).sort(),Object.keys(restoreState(JSON.stringify(freshState()))).sort());
});

test('카드는 타격 수가 3이 되는 순간에만 새로 나온다',()=>{
 assert.deepEqual(newRewardCards({leaf:2},{leaf:3}),[0]);
 assert.deepEqual(newRewardCards({},{season:1}),[]);
 assert.deepEqual(newRewardCards({leaf:3},{leaf:3,season:2}),[]);
 assert.deepEqual(newRewardCards({leaf:3,bag:2},{leaf:3,bag:3}),[4]);
});

test('카드 그림·스타일·효과음이 배포물에 들어간다',()=>{
 assert.match(read('index.html'),/<link rel="stylesheet" href="\/src\/reward-cards\.css">/);
 for(const [n,id] of ['leaf','season','tag','seedling','bag'].entries())for(const kind of ['card','thumb'])
  assert.ok(existsSync(new URL(`../assets/reward-cards/${kind}-${n+1}-${id}.webp`,import.meta.url)),`${kind}-${n+1}-${id}.webp`);
 const audio=read('src/audio.js');
 for(const [,file] of audio.matchAll(/'card-[a-z]+':\['\/(assets\/audio\/sfx\/[\w-]+\.mp3)'/g))assert.ok(existsSync(new URL(`../${file}`,import.meta.url)),file);
 assert.equal([...audio.matchAll(/'card-[a-z]+':\[/g)].length,5);
});

test('카드 차례가 파이널보다 먼저다: 창이 열려 있으면 카드가 기다리고, 그동안 악당 모듈이 멈춘다',()=>{
 const cards=read('src/achievement-cards.js');
 assert.match(cards,/if\(covered\(\)\)\{setTimeout\(show,300\);return;\}/);
 assert.match(cards,/export const rewardCardDue=\(\)=>due>0;/);
 assert.match(read('src/app.js'),/hold:rewardCardDue,/);
 assert.match(read('src/stage-map.js'),/blocked:\(\)=>!!blocked\(\)\|\|overview\|\|!!encounterOptions\.hold\?\.\(\),/);
});
