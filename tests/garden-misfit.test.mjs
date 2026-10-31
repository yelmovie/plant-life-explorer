import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshState,presetTerrain,misplacedPlants,misfitNote,HABITAT_PLANTS} from '../src/model.js';
import {nextHint} from '../src/learning.js';

// presetTerrain: columns 0-1 water, 2-3 grass, 4-5 dry.
const planted=garden=>{const s=freshState();s.terrain=presetTerrain();s.gardenReviewed=true;s.garden=garden;return s;};
const plant=id=>HABITAT_PLANTS.find(p=>p.id===id);

test('잘못된 구역에 심은 식물은 지금 자리·어울리는 땅·까닭을 알려 준다',()=>{
 const s=planted({hyacinth:0,aloe:1,cherry:2});
 assert.deepEqual(misplacedPlants(s).map(p=>p.id),['aloe']);
 assert.equal(misfitNote(s,plant('aloe')),'알로에는 지금 물가에 있어. 두꺼운 잎에 물을 저장하니까 건조 구역이 어울려. 끌어서 옮겨 줘.');
 const wet=planted({hyacinth:4,aloe:5,cherry:2});
 assert.equal(misfitNote(wet,plant('hyacinth')),'부레옥잠은 지금 건조 구역에 있어. 잎자루 속 공기로 물에 떠서 사니까 물가가 어울려. 끌어서 옮겨 줘.');
 const dry=planted({hyacinth:0,aloe:4,cherry:5});
 assert.equal(misfitNote(dry,plant('cherry')),'벚나무는 지금 건조 구역에 있어. 땅에 뿌리를 내려 흙의 물을 빨아들이니까 들판이 어울려. 끌어서 옮겨 줘.');
});

test('다음 기록이 잠긴 까닭으로 잘못 심은 식물을 먼저 알려 준다',()=>{
 const s=planted({hyacinth:0,aloe:1,cherry:2});
 for(const p of [6,7])assert.match(nextHint(s,p),/^알로에는 지금 물가에 있어/);
 const fine=planted({hyacinth:0,aloe:4,cherry:2});
 assert.deepEqual(misplacedPlants(fine),[]);
 assert.doesNotMatch(nextHint(fine,7),/지금 .*에 있어/);
});
