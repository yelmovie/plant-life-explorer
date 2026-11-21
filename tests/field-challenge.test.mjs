// 재도전 목표(2026-11-21, A17): 끝낸 장의 현장 임무를 리피 힌트 없이·한 번도 안 틀리고 다시 해 보는 기록.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {freshState,restoreState} from '../src/model.js';
import {challengeScore} from '../src/field-challenge.js';

const empty=Array.from({length:5},()=>({tries:0,cleared:false}));

test('새 기록에는 다섯 장의 도전 칸이 비어 있다',()=>{
  assert.deepEqual(freshState().fieldChallenges,empty);
});

test('도전 칸이 없는 옛 저장(지금 운영 형식·v1)도 그대로 열리고 도전 칸만 빈 값으로 채운다',()=>{
  const completed=JSON.parse(readFileSync(new URL('../docs/reviews/integrity-20261024/completed-test-record.json',import.meta.url),'utf8'));
  assert.equal(completed.fieldChallenges,undefined);
  const s=restoreState(JSON.stringify(completed));
  assert.deepEqual(s.fieldChallenges,empty);
  assert.deepEqual(s.completed,completed.completed.map(x=>x===true));
  assert.deepEqual(restoreState(JSON.stringify({version:1,completed:Array(10).fill(false)})).fieldChallenges,empty);
});

test('저장된 도전 결과는 그대로 살리고, 손상된 값은 그 칸만 빈 값으로 둔다',()=>{
  const saved={...freshState(),fieldChallenges:[{tries:3,cleared:true},{tries:'x',cleared:'yes'},null,{tries:-2,cleared:false},{tries:2.5,cleared:true}]};
  assert.deepEqual(restoreState(JSON.stringify(saved)).fieldChallenges,[
    {tries:3,cleared:true},{tries:0,cleared:false},{tries:0,cleared:false},{tries:0,cleared:false},{tries:2,cleared:true}]);
  assert.deepEqual(restoreState(JSON.stringify({...freshState(),fieldChallenges:'broken'})).fieldChallenges,empty);
});

test('예상은 틀려도 세지 않고, 관찰·적용에서 틀린 곳과 리피 힌트만 센다',()=>{
  const record={known:true,hints:0,responses:{
    'field:float-predict:air':{phase:'prediction',wrong:1},
    'field:sort:edge:maple':{phase:'observation',wrong:0},
    'field:plant:aloe':{phase:'application',wrong:0}}};
  assert.deepEqual(challengeScore(record),{hints:0,wrong:0,clean:true});
  record.responses['field:plant:aloe'].wrong=2;record.hints=1;
  assert.deepEqual(challengeScore(record),{hints:1,wrong:1,clean:false});
  assert.deepEqual(challengeScore(undefined),{hints:0,wrong:0,clean:true});
});

test('한 번 성공한 도전은 다시 했다가 실패해도 성공으로 남는다',async()=>{
  const {recordChallenge}=await import('../src/field-challenge.js');
  let c=recordChallenge(empty,2,true);
  assert.deepEqual(c[2],{tries:1,cleared:true});
  c=recordChallenge(c,2,false);
  assert.deepEqual(c[2],{tries:2,cleared:true});
  assert.deepEqual(c[0],{tries:0,cleared:false});
  assert.notEqual(c,empty);
});

test('도전 중에는 원래 기록을 저장하지 않는다(화면 코드 연결)',()=>{
  const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
  assert.match(app,/function save\(\)\{[^}]*if\(studentState!==null\|\|challenge!==null\)return Promise\.resolve\(true\);/);
  assert.match(app,/case 'challenge-start':/);
});
