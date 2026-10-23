import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeFieldEvidence,fieldMissionReady,fieldBagPair,fieldSteps} from '../src/field-missions-state.js';
import {fieldMissionAction,renderFieldMission} from '../src/field-missions.js';
const setup=page=>{const s={page,fieldEvidence:normalizeFieldEvidence(null)},u={};return {s,u,act:(a,id)=>fieldMissionAction(s,u,a,id),drop:(item,target)=>fieldMissionAction(s,u,'field-place',`${item}|${target}`)};};
test('현장 기록은 손상값과 무관한 완료 플래그를 버리고 빈 연구를 통과시키지 않는다',()=>{
 const e=normalizeFieldEvidence({leaves:{scans:{maple:['shape','edge','x']}},bag:{tests:[{surface:'lotus',cover:'flap',pocket:'flap',rolls:false}]},ready:true});
 assert.deepEqual(e.leaves.scans.maple,['shape','edge']);assert.equal(e.bag.tests[0].rolls,true);
 for(let i=0;i<5;i++)assert.equal(fieldMissionReady({fieldEvidence:e},i),false);
 assert.deepEqual(normalizeFieldEvidence(JSON.parse(JSON.stringify(e))),e);
});
test('새 표본은 관찰 두 곳과 두 가지 기준의 실제 배치가 모두 필요하다',()=>{
 const {s,u,act,drop}=setup(0);
 drop('leaf:maple','sort:edge:yes');assert.deepEqual(s.fieldEvidence.leaves.edge,{});
 for(const id of ['maple','pine','camellia'])for(const region of ['shape','edge'])drop('lens',`scan:${id}:${region}`);
 for(const id of ['maple','pine','camellia'])drop('leaf:'+id,`sort:edge:${id==='pine'?'no':'yes'}`);
 assert.equal(fieldMissionReady(s,0),false);
 for(const id of ['maple','pine','camellia']){act('field-select','leaf:'+id);act('field-drop',`sort:narrow:${id==='pine'?'yes':'no'}`);}
 assert.equal(fieldMissionReady(s,0),true);assert.match(renderFieldMission(s,u,0),/현장 복구 성공/);
});
test('계절 사진의 잘못된 연결과 중복 사진 순서는 증거가 되지 않는다',()=>{
 const {s,drop,act}=setup(2);act('field-season-clue','tree:branches');act('field-season-clue','herb:rootbud');drop('season:tree','link:tree:leaf');drop('season:herb','link:herb:root');
 for(const k of ['tree','herb'])for(const [i,p] of ['winter','bud','spring'].entries())drop(`frame:${k}:${p}`,`order:${k}:${i}`);
 assert.equal(fieldMissionReady(s,1),false);drop('season:tree','link:tree:trunk');assert.equal(fieldMissionReady(s,1),true);
 drop('frame:herb:winter','order:herb:2');assert.equal(fieldMissionReady(s,1),false);
 drop('frame:herb:winter','order:herb:0');assert.equal(fieldMissionReady(s,1),true);
});
test('모형 실험은 예상, 두 실험, 관찰 결과와 공기 공간의 연결을 요구한다',()=>{
 const {s,drop}=setup(4);drop('model:air','tank');assert.deepEqual(s.fieldEvidence.float.tested,[]);
 drop('model:air','predict:sink');drop('model:solid','predict:float');
 for(const id of ['air','solid'])drop('model:'+id,'tank');
 drop('model:air','observe:float');drop('model:solid','observe:sink');assert.equal(fieldMissionReady(s,2),false);
 drop('reason:air-space','reason:solid');assert.equal(fieldMissionReady(s,2),false);
 drop('reason:air-space','reason:air');assert.equal(fieldMissionReady(s,2),true);
 assert.equal(s.fieldEvidence.float.predictions.air,'sink','틀린 예상도 관찰을 거쳐 성공할 수 있고 처음 예상은 보존된다');
});
test('정원 복구는 환경과 식물 배치 후 시험이 필요하며 변경하면 재시험한다',()=>{
 const {s,act,drop}=setup(6);act('field-garden-rain');assert.equal(fieldMissionReady(s,3),false);
 for(const [env,z] of [['water','pond'],['grass','meadow'],['dry','ridge']])drop('environment:'+env,'environment:'+z);
 for(const [plant,z] of [['hyacinth','pond'],['cherry','meadow'],['aloe','ridge']])drop('plant:'+plant,'plant:'+z);
 assert.equal(fieldMissionReady(s,3),false);act('field-garden-rain');assert.equal(fieldMissionReady(s,3),true);
 drop('plant:aloe','plant:meadow');assert.equal(fieldMissionReady(s,3),false);
 drop('plant:cherry','plant:meadow');drop('plant:aloe','plant:ridge');assert.equal(fieldMissionReady(s,3),false);act('field-garden-rain');assert.equal(fieldMissionReady(s,3),true);
});
test('가방 의뢰는 세 부품 조립·공정 비교·부품 역할·현재 설계 시험을 요구한다',()=>{
 const {s,act,drop}=setup(8);act('field-bag-test');assert.equal(s.fieldEvidence.bag.tests.length,0);
 for(const [p,v] of [['surface','plain'],['cover','flap'],['pocket','flap']])drop(`part:${p}:${v}`,'part:'+p);
 act('field-bag-test');act('field-bag-test');assert.equal(s.fieldEvidence.bag.tests.length,1);
 drop('part:surface:lotus','part:surface');act('field-bag-test');assert.equal(fieldBagPair(s.fieldEvidence.bag).part,'surface');
 drop('compare:cover','compare');act('field-bag-deliver');assert.equal(fieldMissionReady(s,4),false);
 drop('compare:surface','compare');act('field-bag-deliver');assert.equal(fieldMissionReady(s,4),true);
 drop('part:cover:open','part:cover');assert.equal(fieldMissionReady(s,4),false);
});
test('가방 두 부품을 함께 바꾼 시험이나 조건 다른 주머니는 공정 비교가 아니다',()=>{
 const {s,act,drop}=setup(8);for(const p of ['surface','cover','pocket'])drop(`part:${p}:${p==='surface'?'plain':'open'}`,'part:'+p);act('field-bag-test');
 drop('part:surface:lotus','part:surface');drop('part:cover:flap','part:cover');act('field-bag-test');assert.equal(fieldBagPair(s.fieldEvidence.bag),null);
 assert.equal(fieldSteps(s.fieldEvidence,4)[1],false);
});
test('선택 후 놓기와 드래그는 같은 결과를 만들고 무관한 조합은 상태를 바꾸지 않는다',()=>{
 const a=setup(0),b=setup(0);a.act('field-select','lens');a.act('field-drop','scan:maple:edge');b.drop('lens','scan:maple:edge');assert.deepEqual(a.s.fieldEvidence,b.s.fieldEvidence);
 const before=JSON.stringify(a.s.fieldEvidence);a.drop('model:air','part:cover');assert.equal(JSON.stringify(a.s.fieldEvidence),before);assert.equal(a.act('something',''),false);
 for(let i=0;i<5;i++)assert.match(renderFieldMission({page:i*2,fieldEvidence:normalizeFieldEvidence(null)},{},i*2),/mission-workspace/);
});
