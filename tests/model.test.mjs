import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PLANTS,recordFeature,comparisonPair,freshState,restoreState,pageReady,evidenceCount,openMission,testDesign,testValid,gardenValid,canFinish,PAGE_ROUTES,previousRoute} from '../src/model.js';
test('새 연구는 첫 미션만 열리고 빈 활동은 통과하지 못한다',()=>{
 const s=freshState(); assert.equal(evidenceCount(s),0);assert.equal(openMission(s,0),true);assert.equal(openMission(s,1),false);
 for(let i=0;i<10;i++)assert.equal(pageReady(s,i),false);
});
test('관리자 전체 해금은 성과를 바꾸지 않고 모든 페이지 접근을 저장한다',()=>{
 const s=freshState();s.adminUnlocked=true;s.soundEnabled=false;
 for(let i=0;i<5;i++)assert.equal(openMission(s,i),true);
 assert.equal(openMission(s,5),false);assert.equal(evidenceCount(s),0);assert.equal(canFinish(s),false);
 for(const route of PAGE_ROUTES){s.screen=route.screen;s.page=route.page??0;const restored=restoreState(JSON.stringify(s));assert.equal(restored.screen,route.screen);assert.equal(restored.adminUnlocked,true);assert.equal(restored.soundEnabled,false);assert.equal(evidenceCount(restored),0);}
 s.adminUnlocked=false;s.screen='activity';s.page=9;assert.equal(restoreState(JSON.stringify(s)).screen,'map');
});
test('이전 페이지는 전체 화면 순서를 따르고 메인에서는 범위를 벗어나지 않는다',()=>{
 for(let i=0;i<PAGE_ROUTES.length;i++)assert.deepEqual(previousRoute(PAGE_ROUTES[i]),PAGE_ROUTES[Math.max(0,i-1)]);
 const old=restoreState(JSON.stringify({version:1}));assert.equal(old.soundEnabled,true);assert.equal(old.adminUnlocked,false);
});
test('관찰 데이터 없이 분류 정답만으로 통과하지 못한다',()=>{
 const s=freshState();s.groups={cherry:'yes',ginkgo:'no',grass:'no'};assert.equal(pageReady(s,1),false);
 for(const p of PLANTS){recordFeature(s,p.id,'shape',p.id);recordFeature(s,p.id,'edge',p.edge?'yes':'no');}s.classificationEvidence.edge='cherry';assert.equal(pageReady(s,1),false);s.groupsByRule.edge={...s.groups};
 s.rule='narrow';assert.equal(pageReady(s,1),false);s.groups={cherry:'no',ginkgo:'no',grass:'yes'};s.classificationEvidence.narrow='grass';assert.equal(pageReady(s,1),true);
});
test('계절 관찰과 증거 연결은 실제 기록을 요구한다',()=>{
 const s=freshState();s.linkedEvidence=['cherry:0','cherry:3'];assert.equal(pageReady(s,3),false);
 s.seasonalRecords=['cherry:3','cherry:0'];s.seasonPhotos={'cherry:3':{underground:false},'cherry:0':{underground:false}};s.seasonExplained=['cherry'];assert.equal(pageReady(s,3),false);s.seasonalRecords.push('sowthistle:3','sowthistle:0');s.seasonPhotos['sowthistle:3']={underground:true};s.seasonPhotos['sowthistle:0']={underground:true};s.linkedEvidence.push('sowthistle:3','sowthistle:0');s.seasonExplained.push('sowthistle');assert.equal(pageReady(s,3),true);
});
test('정원은 확인, 환경, 서로 다른 위치, 근거를 모두 검사한다',()=>{
 const s=freshState();s.terrain=['water','water','water','grass','grass','grass','dry','dry','dry',...Array(15).fill('empty')];
 s.gardenReviewed=true;assert.equal(pageReady(s,6),true);s.garden={hyacinth:0,cherry:3,aloe:6};assert.equal(gardenValid(s),false);
 s.gardenReasons=['hyacinth','cherry','aloe'];assert.equal(gardenValid(s),true);s.terrain[0]='dry';assert.equal(gardenValid(s),false);
});
test('같은 제품 반복 시험은 개선으로 세지 않으며 최신 설계가 시험과 일치해야 한다',()=>{
 const s=freshState();s.design={surface:'lotus',cover:'flap',linked:true};s.tests=[testDesign(s.design),testDesign(s.design)];assert.equal(testValid(s),false);
 s.tests.unshift(testDesign({surface:'plain',cover:'open'}));assert.equal(testValid(s),false);s.tests.unshift(testDesign({surface:'plain',cover:'flap'}));s.testExplanation={key:'lotus:flap',before:'plain:flap',part:'surface'};assert.equal(testValid(s),true);
 s.design.cover='open';assert.equal(testValid(s),false);
});
test('손상된 저장과 외부 문자열은 안전하게 복원한다',()=>{
 assert.deepEqual(restoreState('{bad'),freshState());assert.deepEqual(restoreState('null'),freshState());
 const s=restoreState(JSON.stringify({version:1,screen:'ending',page:99,terrain:Array(24).fill('<script>'),tests:[null],observation:{cherry:['shape','<img>']}}));
 assert.equal(s.screen,'map');assert.equal(s.page,0);assert.deepEqual(s.observation.cherry,['shape']);assert.ok(s.terrain.every(x=>x==='empty'));
});
test('저장 왕복은 활동과 정원 데이터를 보존한다',()=>{
 const s=freshState();s.completed[0]=true;s.observation.cherry=['shape'];s.terrain[4]='water';s.garden.hyacinth=4;
 assert.deepEqual(restoreState(JSON.stringify(s)),s);
});
test('증거는 미션 두 장을 마쳐야 획득하며 엔딩은 현재 산출물을 검증한다',()=>{
 const s=freshState();s.completed[0]=true;assert.equal(evidenceCount(s),0);s.completed[1]=true;assert.equal(evidenceCount(s),1);
 s.completed.fill(true);Object.keys(s.finalChecks).forEach(k=>s.finalChecks[k]=true);assert.equal(canFinish(s),false);
 s.terrain=['water','grass','dry','water','grass','dry','water','grass','dry',...Array(15).fill('empty')];s.garden={hyacinth:0,cherry:1,aloe:2};s.gardenReasons=['hyacinth','cherry','aloe'];
 s.design={surface:'lotus',cover:'flap',linked:true};s.tests=[testDesign({surface:'plain',cover:'flap'}),testDesign(s.design)];s.testExplanation={key:'lotus:flap',before:'plain:flap',part:'surface'};s.gardenReviewed=true;s.sharing.status='later';assert.equal(canFinish(s),true);s.terrain[0]='empty';assert.equal(canFinish(s),false);
});
test('보고서 연결은 새로고침해도 보존하고 완료한 미션만 복원한다',()=>{
 const s=freshState();s.completed[0]=true;s.completed[1]=true;s.completed[4]=true;s.completed[5]=true;
 s.reportSubmitted=[0,2];assert.deepEqual(restoreState(JSON.stringify(s)).reportSubmitted,[0,2]);
 s.reportSubmitted=[0,0,2,1,5,-1,'2',null];assert.deepEqual(restoreState(JSON.stringify(s)).reportSubmitted,[0,2]);
 assert.deepEqual(restoreState(JSON.stringify({version:1})).reportSubmitted,[]);
});
test('복원된 최종 확인은 현재 정원과 발명 시험이 유효할 때만 유지한다',()=>{
 const s=freshState();s.completed.fill(true);s.finalChecks={classification:true,habitat:true,garden:true,invention:true};s.finished=true;s.screen='ending';
 s.terrain=['water','grass','dry','water','grass','dry','water','grass','dry',...Array(15).fill('empty')];s.garden={hyacinth:0,cherry:1,aloe:2};s.gardenReasons=['hyacinth','cherry','aloe'];
 s.design={surface:'lotus',cover:'flap',linked:true};s.tests=[testDesign({surface:'plain',cover:'flap'}),testDesign(s.design)];s.testExplanation={key:'lotus:flap',before:'plain:flap',part:'surface'};s.gardenReviewed=true;s.sharing.status='later';
 assert.equal(restoreState(JSON.stringify(s)).finished,true);
 s.terrain[0]='empty';s.design.cover='open';const restored=restoreState(JSON.stringify(s));
 assert.equal(restored.finalChecks.garden,false);assert.equal(restored.finalChecks.invention,false);assert.equal(restored.finalChecks.classification,true);
 assert.equal(restored.finished,false);assert.equal(restored.screen,'final');
});
