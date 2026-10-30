import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshState,restoreState} from '../src/model.js';
import {learningAction} from '../src/learning.js';
import {notebookEntry} from '../src/research-notebook.js';

test('내 정원 사진: 심은 뒤에만 찍히고, 찍은 순간의 땅과 식물이 연구 노트에 남는다',()=>{
 const s=freshState(),u={};s.page=7;
 assert.match(learningAction(s,u,'garden-photo',''),/먼저 식물을 심고/);assert.equal(s.gardenPhoto,null);
 s.terrain[0]='water';s.garden.hyacinth=0;
 assert.match(learningAction(s,u,'garden-photo',''),/연구 노트에 붙였어/);
 assert.deepEqual(s.gardenPhoto.cells[0],['water','hyacinth']);assert.deepEqual(s.gardenPhoto.cells[1],['empty','']);
 s.terrain[0]='dry';assert.equal(s.gardenPhoto.cells[0][0],'water','찍은 뒤에 바꿔도 사진은 그대로다');
 assert.deepEqual(restoreState(JSON.stringify(s)).gardenPhoto,s.gardenPhoto,'저장했다 불러와도 같은 사진');
 assert.match(notebookEntry(s,3).body,/내가 만든 정원/);
});

test('모양이 맞지 않는 정원 사진은 불러올 때 버린다',()=>{
 const s=freshState();
 for(const bad of [{cells:[]},{cells:Array(24).fill(['lava',''])},{cells:Array(24).fill(['water','rose'])},'photo'])
  assert.equal(restoreState(JSON.stringify({...s,gardenPhoto:bad})).gardenPhoto,null);
});

test('계절 사진: 찍은 계절이 연구 노트에 사진으로 붙고, 왜 찍는지 화면에서 알려 준다',()=>{
 const s=freshState(),u={};s.page=2;s.seasonPlant='cherry';s.season=3;s.underground=true;
 assert.match(learningAction(s,u,'record-season',''),/연구 노트에 붙였어/);
 const body=notebookEntry(s,1).body;
 assert.match(body,/내가 찍은 사진/);assert.match(body,/벚나무 · 겨울 · 땅속/);
});
