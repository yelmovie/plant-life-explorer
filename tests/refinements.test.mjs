import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshState,restoreState,testDesign,testValid,inventionEvidence,pageReady,presetTerrain} from '../src/model.js';
import {learningAction,renderReport,renderEnding} from '../src/learning.js';
import {completeInvention} from './invention-fixture.mjs';
import {notebookEntry} from '../src/research-notebook.js';

test('두 부품의 설명은 실제 한 부품 비교가 남아 있을 때만 보존된다',()=>{
 const s=completeInvention(freshState());assert.equal(testValid(s),true);
 const restored=restoreState(JSON.stringify(s));assert.deepEqual(inventionEvidence(restored),{surface:true,cover:true});assert.equal(testValid(restored),true);
 restored.inventionExplanations.cover.before='plain:open';assert.equal(inventionEvidence(restored).cover,false);assert.equal(testValid(restored),false);
});
test('겉면만 관찰하거나 덮개만 확인한 새 연구는 완성되지 않는다',()=>{
 const s=freshState();s.design={surface:'lotus',cover:'open',linked:true};s.tests=[testDesign({surface:'plain',cover:'open'}),testDesign(s.design)];
 learningAction(s,{},'test-explain','surface');assert.equal(inventionEvidence(s).surface,true);assert.equal(testValid(s),false);
 s.design.cover='flap';s.tests.push(testDesign(s.design));learningAction(s,{},'test-explain','cover');assert.equal(testValid(s),true);
});
test('기존에 완료한 가방 기록은 새 설명 규칙으로 지우지 않는다',()=>{
 const s=freshState();delete s.inventionRevision;delete s.inventionExplanations;s.completed[9]=true;
 s.design={surface:'lotus',cover:'open',linked:true};s.tests=[testDesign({surface:'plain',cover:'open'}),testDesign(s.design)];s.testExplanation={key:'lotus:open',before:'plain:open',part:'surface'};
 const r=restoreState(JSON.stringify(s));assert.equal(r.inventionRevision,1);assert.equal(testValid(r),true);
});
test('정원 만들기는 지형뿐 아니라 세 식물의 실제 배치도 필요하다',()=>{
 const s=freshState(),u={undo:[]};s.terrain=presetTerrain();learningAction(s,u,'garden-ready');assert.equal(u.gardenMode,'plant');assert.equal(pageReady(s,6),false);
 s.garden={hyacinth:0,cherry:2,aloe:4};assert.equal(pageReady(s,6),true);s.garden.aloe=1;assert.equal(pageReady(s,6),false);
});
test('연구노트와 엔딩은 없는 학생 기록을 완료한 것으로 꾸미지 않는다',()=>{
 const s=freshState();assert.match(renderReport(s),/나의 초록정원 연구노트/);assert.doesNotMatch(renderReport(s),/소개할 기록/);
 assert.match(notebookEntry(s,0).body,/내 탐구를 마치고/);assert.doesNotMatch(notebookEntry(s,0).body,/서로 달랐다/);
 const ending=renderEnding(s,()=> '');assert.match(ending,/ending_diary_20261023/);assert.doesNotMatch(ending,/내가 심은 정원|내가 만든 가방/);
});
