import {test} from 'node:test';
import assert from 'node:assert/strict';
import {renderActivity} from '../src/learning.js';
import {freshState} from '../src/model.js';
import {normalizeFieldEvidence,fieldMissionReady,fieldBagPair,fieldSteps} from '../src/field-missions-state.js';
import {fieldMissionAction,renderFieldMission,fieldFeedback} from '../src/field-missions.js';
const setup=page=>{const s={page,fieldEvidence:normalizeFieldEvidence(null)},u={};return {s,u,act:(a,id)=>fieldMissionAction(s,u,a,id),drop:(item,target)=>fieldMissionAction(s,u,'field-place',`${item}|${target}`)};};
test('버튼 모드 안내를 바꾸고 분류가 끝난 표본 버튼을 제외한다',()=>{
 const {s,u,act,drop}=setup(0);
 renderFieldMission(s,u);
 for(const region of ['shape','edge'])drop('lens',`scan:maple:${region}`);
 act('field-stage','1');
 act('field-keys');
 assert.match(fieldFeedback(u).text,/버튼으로 해 보자/);
 assert.match(renderFieldMission(s,u),/분류 버튼/);
 drop('leaf:maple','sort:edge:yes');
 assert.doesNotMatch(renderFieldMission(s,u),/data-field-item="leaf:maple"/);
 assert.match(renderFieldMission(s,u),/data-field-item="leaf:pine"/);
 drop('leaf:pine','sort:edge:no');
 drop('leaf:camellia','sort:edge:yes');
 assert.doesNotMatch(renderFieldMission(s,u),/data-field-drop="sort:edge:/);
 act('field-keys');
 assert.match(fieldFeedback(u).text,/손으로 직접/);
});
test('현장 기록은 손상값과 무관한 완료 플래그를 버리고 빈 연구를 통과시키지 않는다',()=>{
 const e=normalizeFieldEvidence({leaves:{scans:{maple:['shape','edge','x']}},bag:{tests:[{surface:'lotus',cover:'flap',pocket:'flap',rolls:false}]},ready:true});
 assert.deepEqual(e.leaves.scans.maple,['shape','edge']);assert.equal(e.bag.tests[0].rolls,true);
 for(let i=0;i<5;i++)assert.equal(fieldMissionReady({fieldEvidence:e},i),false);
 assert.deepEqual(normalizeFieldEvidence(JSON.parse(JSON.stringify(e))),e);
});
test('새 표본은 관찰 두 곳과 두 가지 기준의 실제 배치가 모두 필요하다',()=>{
 const {s,u,act,drop}=setup(0);
 drop('leaf:maple','sort:edge:yes');assert.deepEqual(s.fieldEvidence.leaves.edge,{});
 for(const region of ['shape','edge'])drop('lens',`scan:maple:${region}`);
 assert.equal(fieldSteps(s.fieldEvidence,0)[0],true);assert.deepEqual(s.fieldEvidence.leaves.scans.pine,[]);
 for(const id of ['maple','pine','camellia'])drop('leaf:'+id,`sort:edge:${id==='pine'?'no':'yes'}`);
 assert.equal(fieldMissionReady(s,0),false);
 for(const id of ['maple','pine','camellia']){act('field-select','leaf:'+id);act('field-drop',`sort:narrow:${id==='pine'?'yes':'no'}`);}
 assert.equal(fieldMissionReady(s,0),true);
 const full=Object.assign(freshState(),{screen:'activity',page:0,fieldEvidence:s.fieldEvidence});full.journeyRequired[0]=true;assert.match(renderActivity(full,{...u,activityMode:'field'},()=>''),/현장 임무 성공.*발견을 연구 노트에 담기/,'리피가 다음에 누를 곳을 알려 준다');
});
test('계절 사진의 잘못된 연결과 중복 사진 순서는 증거가 되지 않는다',()=>{
 const {s,drop,act}=setup(2);act('field-season-clue','tree:branches');act('field-season-clue','herb:rootbud');drop('season:tree','link:tree:leaf');drop('season:herb','link:herb:root');
 for(const k of ['tree','herb'])for(const [i,p] of ['winter','bud','spring'].entries())drop(`frame:${k}:${p}`,`order:${k}:${i}`);
 assert.equal(fieldMissionReady(s,1),false);drop('season:tree','link:tree:trunk');assert.equal(fieldMissionReady(s,1),true);
 drop('frame:herb:winter','order:herb:2');assert.equal(fieldMissionReady(s,1),false);
 drop('frame:herb:winter','order:herb:0');assert.equal(fieldMissionReady(s,1),true);
});
test('시간 다이얼은 계절 순서대로 놓이고 한 바퀴 돌리면 순서가 기록된다',()=>{
 const {s,u,act,drop}=setup(2);for(const k of ['tree','herb'])act('field-season-predict',k+':roots');
 act('field-stage','1');assert.deepEqual([...renderFieldMission(s,u,2).matchAll(/data-dial-card="(\w+)"/g)].map(m=>m[1]),['winter','bud','spring']);
 act('field-season-turn','plant');assert.deepEqual(s.fieldEvidence.seasons.tree,['','','']);
 drop('season:tree','link:tree:trunk');drop('season:herb','link:herb:root');act('field-season-clue','tree:branches');act('field-season-clue','herb:rootbud');
 act('field-season-turn','tree');assert.equal(fieldMissionReady(s,1),false);
 act('field-season-turn','herb');assert.equal(fieldMissionReady(s,1),true);
});
test('모형 실험은 예상, 두 실험, 관찰 결과와 공기 공간의 연결을 요구한다',()=>{
 const {s,drop}=setup(4);drop('model:air','tank');assert.deepEqual(s.fieldEvidence.float.tested,[]);
 drop('model:air','predict:sink');drop('model:solid','predict:float');
 for(const id of ['air','solid'])drop('model:'+id,'tank');
 // Dropping a model in the tank records where it came to rest; the link to air is still needed.
 assert.deepEqual(s.fieldEvidence.float.observed,{air:'float',solid:'sink'});assert.equal(fieldMissionReady(s,2),false);
 drop('reason:air-space','reason:solid');assert.equal(fieldMissionReady(s,2),false);
 drop('reason:air-space','reason:air');assert.equal(fieldMissionReady(s,2),true);
 assert.equal(s.fieldEvidence.float.predictions.air,'sink','틀린 예상도 관찰을 거쳐 성공할 수 있고 처음 예상은 보존된다');
});
test('정원은 비로 땅을 만들고 맞는 땅에 심어 시험하며 같은 자리를 다시 눌러도 시험을 보존한다',()=>{
 const {s,act,drop,u}=setup(6);act('field-garden-rain');assert.equal(fieldMissionReady(s,3),false);
 drop('plant:hyacinth','plant:pond');assert.deepEqual(s.fieldEvidence.garden.plants,{},'비를 내려 땅이 생기기 전에는 심을 수 없다');
 act('field-garden-ground');assert.deepEqual(s.fieldEvidence.garden.environments,{pond:'water',meadow:'grass',ridge:'dry'});
 drop('plant:aloe','plant:pond');assert.deepEqual(s.fieldEvidence.garden.plants,{},'맞지 않는 땅에는 심기지 않는다');assert.equal(u.fieldMission.gardenMiss,'pond');
 for(const [plant,z] of [['hyacinth','pond'],['cherry','meadow'],['aloe','ridge']])drop('plant:'+plant,'plant:'+z);
 assert.equal(fieldMissionReady(s,3),false);act('field-garden-rain');assert.equal(fieldMissionReady(s,3),true);
 drop('plant:aloe','plant:meadow');assert.equal(fieldMissionReady(s,3),true,'틀린 자리는 거절되어 시험 결과가 그대로다');
 drop('plant:cherry','plant:meadow');assert.equal(fieldMissionReady(s,3),true);
 drop('environment:grass','environment:meadow');assert.equal(fieldMissionReady(s,3),true);act('field-garden-ground');assert.equal(fieldMissionReady(s,3),true);
 act('field-place-environment','water:meadow');assert.equal(fieldMissionReady(s,3),false,'실제로 환경을 바꾸면 이전 시험은 더 이상 유효하지 않다');
});
test('가방 의뢰는 첫 비·연잎만·덮개만·둘 다 비 시험·완성 가방 한 바퀴 돌려 보기·마무리를 요구한다',()=>{
 const {s,act}=setup(8),bag=()=>s.fieldEvidence.bag;act('field-bag-test');assert.equal(bag().tests.length,0,'예상 전에는 비를 내리지 않는다');
 act('field-bag-predict','surface');act('field-bag-test');act('field-bag-test');assert.equal(bag().tests.length,1);assert.deepEqual(fieldSteps(s.fieldEvidence,4),[true,false,false]);
 act('field-bag-upgrade','surface');act('field-bag-test');assert.equal(bag().comparisons.surface.part,'surface');
 act('field-bag-upgrade','cover');act('field-bag-test');assert.equal(bag().comparisons.cover.before,'lotus:open');
 assert.equal(bag().tests.at(-1).notebookDry,true,'둘 다 달면 공책이 뽀송');assert.deepEqual(fieldSteps(s.fieldEvidence,4),[true,false,false],'덮개만 단 가방은 아직');
 act('field-bag-upgrade','surface');assert.deepEqual(bag().design,{surface:'plain',cover:'flap'},'연잎 겉면을 뗄 수 있다');act('field-bag-test');
 assert.equal(bag().tests.at(-1).notebookDry,false,'덮개만 달면 천에 빗물이 스며든다');assert.deepEqual(fieldSteps(s.fieldEvidence,4),[true,true,false]);
 assert.match(act('field-bag-finish'),/한 바퀴 돌려 본 뒤에/,'돌려 보기 전에는 마무리하지 않는다');assert.equal(fieldMissionReady(s,4),false);
 assert.match(act('field-bag-turned'),/한 바퀴 다 돌려 봤어/);assert.equal(act('field-bag-turned'),'','두 번째 바퀴는 알리지 않는다');assert.equal(fieldMissionReady(s,4),false,'돌려 보기만으로는 끝나지 않는다');
 assert.match(act('field-bag-finish'),/둘이 함께.*처음엔 겉면만/);assert.equal(fieldMissionReady(s,4),true);
 assert.deepEqual(bag().design,{surface:'lotus',cover:'flap'},'마무리한 가방은 연잎 겉면 + 덮개');assert.equal(bag().delivered,'lotus:flap');assert.equal(bag().compared.part,'cover');
 assert.equal(act('field-bag-finish'),'','이미 마무리한 가방은 다시 넘기지 않는다');
});
test('가방 카드: 한 번 누르면 그 가방이 올라가고, 어떤 순서로 비를 내려도 세 가방을 마치면 비교가 채워진다',()=>{
 const {s,u:ui,act}=setup(8),bag=()=>s.fieldEvidence.bag;
 assert.match(act('field-bag-try','lotus:flap'),/먼저 무엇을 바꾸면|예상/,'예상 전에는 가방을 올리지 않는다');
 act('field-bag-predict','surface');assert.match(act('field-bag-try','lotus:flap'),/처음 가방에 비를/,'처음 가방 비가 먼저다');
 act('field-bag-test');
 assert.match(act('field-bag-try','lotus:flap'),/덮개 가방을 올렸어/);assert.deepEqual(bag().design,{surface:'lotus',cover:'flap'});assert.equal(ui.fieldMission.bagAutoRain,true,'카드를 누르면 비가 저절로 시작된다');
 act('field-bag-test');assert.equal(act('field-bag-try','plain:open'),'','처음 가방 카드는 없다');
 act('field-bag-try','plain:flap');act('field-bag-test');act('field-bag-try','lotus:open');act('field-bag-test');
 assert.deepEqual(fieldSteps(s.fieldEvidence,4),[true,true,false],'두 부품을 함께 바꾼 순서여도 비교가 채워진다');
 for(const part of ['surface','cover']){const c=bag().comparisons[part],k=c.before.split(':'),m=c.after.split(':');assert.equal(['surface','cover'].filter((p,i)=>k[i]!==m[i]).join(),part);}
 assert.match(act('field-bag-try','lotus:open'),/방금 비를 맞았어/,'방금 시험한 가방은 다시 비를 내리지 않는다');
 act('field-bag-turned');assert.match(act('field-bag-finish'),/둘이 함께/);assert.equal(fieldMissionReady(s,4),true);
});
test('가방은 한 번에 한 부품만 달 수 있어 두 부품을 함께 바꾼 시험이 생기지 않는다',()=>{
 const {s,act}=setup(8);act('field-bag-predict','cover');act('field-bag-test');act('field-bag-upgrade','surface');
 assert.match(act('field-bag-upgrade','cover'),/먼저 비를 내려/);assert.equal(s.fieldEvidence.bag.design.cover,'open');
 act('field-bag-test');assert.equal(fieldBagPair(s.fieldEvidence.bag).part,'surface');assert.equal(fieldSteps(s.fieldEvidence,4)[1],false);
 assert.equal(act('field-bag-turned'),'','세 가방을 다 시험하기 전에는 완성 가방을 돌려 보지 않는다');assert.match(act('field-bag-finish'),/비를 내려 본 뒤에 마무리/);
});
test('선택 후 놓기와 드래그는 같은 결과를 만들고 무관한 조합은 상태를 바꾸지 않는다',()=>{
 const a=setup(0),b=setup(0);a.act('field-select','lens');a.act('field-drop','scan:maple:edge');b.drop('lens','scan:maple:edge');assert.deepEqual(a.s.fieldEvidence,b.s.fieldEvidence);
 const before=JSON.stringify(a.s.fieldEvidence);a.drop('model:air','part:cover');assert.equal(JSON.stringify(a.s.fieldEvidence),before);assert.equal(a.act('something',''),false);
 for(let i=0;i<5;i++)assert.match(renderFieldMission({page:i*2,fieldEvidence:normalizeFieldEvidence(null)},{},i*2),/mission-workspace/);
});
