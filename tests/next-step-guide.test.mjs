// 남은 활동 안내: the left-panel list and the pointing hand follow pageReady() item by item on every page.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshState,pageReady,HABITAT_PLANTS,presetTerrain,testDesign} from '../src/model.js';
import {activityGuide,renderRemaining} from '../src/next-step-guide.js';
import {learningAction,renderActivity} from '../src/learning.js';
import {fieldMissionAction} from '../src/field-missions.js';

const open=(page,extra={})=>{const s=freshState();s.screen='activity';s.page=page;return [s,{activityMode:'explore',plant:'cherry',region:'shape',selected:'cherry',undo:[],brush:'water',gardenMode:page===7?'plant':'terrain',...extra}];};
const html=(s,u)=>renderActivity(s,u,()=>'<div class="garden-grid"></div>');
// The hand's target must be a control that is really on screen (data-action / class in the rendered page).
const onScreen=(s,u,guide)=>{const page=html(s,u);const m=guide.target.match(/^(?:\.([\w-]+) )?(?:\[data-action="([^"]+)"\](?:\[data-id="([^"]+)"\])?|\.([\w-]+)(?:\[data-id="([^"]+)"\])?)(?: > p)?$/);assert.ok(m,guide.target);
 if(m[2])assert.match(page,new RegExp(`data-action="${m[2]}"${m[3]?`[^>]*data-id="${m[3]}"`:''}`),guide.target);else assert.match(page,new RegExp(`class="[^"]*\\b${m[4]}\\b`),guide.target);};
// The hand never gives the answer away: no choice control is ever its target, and a question line is marked from above ('ask').
const CHOICE=/data-action="leaf-partner"|season-predict|season-explain|experiment-predict|experiment-answer|"habitat"|habitat-answer|garden-answer|garden-pick|test-predict|test-explain/;
const QUESTION=/(?: > p|\.(?:habitat|leaf-partner)-question)$/;
function noAnswer(g){for(const it of g.items){if(!it.target)continue;assert.doesNotMatch(it.target,CHOICE,`${it.key} points at a choice`);if(QUESTION.test(it.target))assert.equal(it.anchor,'ask',`${it.key}: a question line is marked from above`);}
 assert.doesNotMatch(g.tip,/기준과 달라/,'the tip never names the leaf that is wrong');}
function expectLeft(s,u,n){const g=activityGuide(s,u);assert.equal(g.ready,pageReady(s,s.page));assert.equal(g.left,n);noAnswer(g);if(!g.ready){assert.ok(g.next&&g.target&&g.tip,`page ${s.page} needs a target`);onScreen(s,u,g);}return g;}

test('잎 비교는 같은 확대 버튼 하나로 마치고, 짝 고르기 안내는 답을 가리키지 않는다',()=>{
 const [s,u]=open(0);let g=expectLeft(s,u,1);
 assert.equal(g.target,'[data-action="leaf-zoom"][data-id="large"]');
 assert.equal((html(s,u).match(/class="leaf-specimen"/g)||[]).length,3);
 learningAction(s,u,'leaf-zoom','large');expectLeft(s,u,0);
 s.page=1;g=expectLeft(s,u,1);assert.equal(g.target,'.leaf-partner-question');assert.equal(g.anchor,'ask');
 learningAction(s,u,'leaf-partner','grass');expectLeft(s,u,1);
 learningAction(s,u,'leaf-partner','cherry');expectLeft(s,u,0);
});
test('계절 사진: 식물 탭 → 겨울로 이동 → 예상 → 땅속 보기 → 찍기 순서로 손가락이 안내한다',()=>{
 const [s,u]=open(2);let g=expectLeft(s,u,2);assert.equal(g.target,'[data-action="season"][data-id="3"]');assert.deepEqual(g.next.jump,['season','3']);
 s.season=3;g=expectLeft(s,u,2);assert.equal(g.target,'.prediction > p');assert.equal(g.anchor,'ask');
 learningAction(s,u,'season-predict','roots');g=expectLeft(s,u,2);assert.equal(g.target,'[data-action="underground"]');
 learningAction(s,u,'underground');g=expectLeft(s,u,2);assert.equal(g.target,'[data-action="record-season"]');
 learningAction(s,u,'record-season');s.season=0;learningAction(s,u,'record-season');
 g=expectLeft(s,u,1);assert.equal(g.next.key,'season:sowthistle');assert.equal(g.target,'[data-action="season-plant"][data-id="sowthistle"]');
 learningAction(s,u,'season-plant','sowthistle');s.season=3;learningAction(s,u,'season-predict','none');learningAction(s,u,'underground');learningAction(s,u,'record-season');s.season=0;learningAction(s,u,'record-season');
 expectLeft(s,u,0);
 // The open tab (씀바귀) is answered first; the finished tab hands over to 벚나무.
 s.page=3;g=expectLeft(s,u,2);assert.equal(g.next.key,'explain:sowthistle');assert.equal(g.target,'.season-question > p');
 learningAction(s,u,'season-explain','growth');g=expectLeft(s,u,1);assert.equal(g.target,'[data-action="season-plant"][data-id="cherry"]');
 learningAction(s,u,'season-plant','cherry');g=expectLeft(s,u,1);assert.equal(g.target,'.season-question > p');learningAction(s,u,'season-explain','growth');expectLeft(s,u,0);
});
test('비교 페이지에서 사진이 없으면 앞 활동 버튼을 가리킨다',()=>{
 const [s,u]=open(3);const g=expectLeft(s,u,2);assert.equal(g.target,'[data-action="previous"]');assert.deepEqual(g.next.jump,['previous']);
});
test('잎자루 실험과 사는 곳 잇기도 남은 항목과 손가락 자리가 맞는다',()=>{
 const [s,u]=open(4);let g=expectLeft(s,u,4);assert.equal(g.target,'[data-action="lab-next"][data-id="cut"]');
 learningAction(s,u,'lab-next','cut');g=expectLeft(s,u,3);assert.equal(g.target,'[data-action="lab-next"][data-id="water"]');
 learningAction(s,u,'lab-next','water');g=expectLeft(s,u,2);assert.equal(g.target,'[data-action="press-petiole"]');
 s.experiment.step=4;g=expectLeft(s,u,1);assert.equal(g.target,'.reason-cards > p');learningAction(s,u,'experiment-answer','air');expectLeft(s,u,0);
 s.page=5;g=expectLeft(s,u,3);assert.equal(g.target,'.habitat-question');assert.equal(g.anchor,'ask');assert.match(g.tip,/사는 곳/);
 // The open tab comes first; a finished tab hands over to the first plant left.
 u.habitatPlant='aloe';g=expectLeft(s,u,3);assert.equal(g.next.key,'habitat:aloe');assert.equal(g.target,'.habitat-question');
 u.selected='aloe';learningAction(s,u,'habitat','dry');learningAction(s,u,'habitat-answer','aloe');g=expectLeft(s,u,2);assert.equal(g.next.key,'habitat:hyacinth');assert.equal(g.target,'[data-action="habitat-plant"][data-id="hyacinth"]');
 for(const p of HABITAT_PLANTS){u.habitatPlant=p.id;u.selected=p.id;learningAction(s,u,'habitat',p.habitat);learningAction(s,u,'habitat-answer',p.id);}
 expectLeft(s,u,0);
});
test('정원: 땅 칸 수와 식물 심기가 항목으로 남고 심기 전엔 카드, 고른 뒤엔 정원을 가리킨다',()=>{
 const [s,u]=open(6);let g=expectLeft(s,u,6);assert.equal(g.next.key,'land:water');assert.equal(g.target,'.garden-frame');
 u.brush='grass';g=expectLeft(s,u,6);assert.equal(g.next.key,'land:grass','the brush in hand comes first');assert.equal(g.target,'.garden-frame');
 u.gardenMode='plant';g=expectLeft(s,u,6);assert.equal(g.target,'[data-action="brush"][data-id="water"]');assert.deepEqual(g.next.jump,['brush','water']);u.gardenMode='terrain';
 s.terrain=presetTerrain();s.gardenReviewed=true;g=expectLeft(s,u,3);assert.equal(g.next.key,'plant:hyacinth');assert.equal(g.target,'.garden-plant-pick[data-id="hyacinth"]');
 u.gardenMode='plant';u.selected='hyacinth';g=expectLeft(s,u,3);assert.equal(g.target,'.garden-frame');assert.match(g.tip,/물가/);
 s.garden={hyacinth:0,aloe:2,cherry:4};g=expectLeft(s,u,2);assert.match(g.tip,/알로에 카드/);
 u.selected='aloe';g=expectLeft(s,u,2);assert.match(g.tip,/건조 구역으로 끌어서/);
 s.garden={hyacinth:0,aloe:4,cherry:2};expectLeft(s,u,0);
 s.page=7;g=expectLeft(s,u,3);assert.equal(g.next.key,'plant:aloe','the picked card comes first');assert.equal(g.next.sub.find(x=>x.id==='why').done,false);assert.equal(g.target,'.reason-cards > p');
 u.gardenMode='terrain';g=expectLeft(s,u,3);assert.equal(g.target,'.garden-plant-pick[data-id="hyacinth"]');u.gardenMode='plant';u.selected='hyacinth';g=expectLeft(s,u,3);assert.equal(g.target,'.reason-cards > p');
 for(const p of HABITAT_PLANTS){u.selected=p.id;learningAction(s,u,'garden-answer',p.id);}
 g=expectLeft(s,u,1);assert.equal(g.next.key,'pick');assert.equal(g.target,'.garden-confirm > p');
 learningAction(s,u,'garden-pick','cherry');expectLeft(s,u,0);
});
test('가방 설계와 시험: 관찰 → 특징 → 예상, 비 뿌리기 → 달라진 점 → 한 부품 바꾸기를 차례로 가리킨다',()=>{
 const [s,u]=open(8);let g=expectLeft(s,u,3);assert.equal(g.target,'[data-action="lotus-drop"]');
 s.design.observed=true;g=expectLeft(s,u,2);assert.equal(g.target,'.reason-cards > p');
 s.design.linked=true;g=expectLeft(s,u,1);assert.equal(g.target,'.invention-brief > p');learningAction(s,u,'test-predict','surface');expectLeft(s,u,0);
 s.page=9;g=expectLeft(s,u,3);assert.equal(g.target,'[data-action="run-test"]');
 const run=()=>{s.tests.push(testDesign(s.design));s.activeTestKey=`${s.design.surface}:${s.design.cover}`;};
 run();g=expectLeft(s,u,3);assert.equal(g.target,'[data-action="surface"][data-id="lotus"]');
 s.design.surface='lotus';s.activeTestKey='';g=expectLeft(s,u,3);assert.equal(g.target,'[data-action="run-test"]');
 run();g=expectLeft(s,u,3);assert.equal(g.target,'.comparison-question > p');assert.equal(g.anchor,'ask');
 learningAction(s,u,'test-explain','surface');g=expectLeft(s,u,2);assert.equal(g.target,'[data-action="cover"][data-id="flap"]');
 s.design.cover='flap';s.activeTestKey='';run();g=expectLeft(s,u,1);assert.equal(g.next.key,'cover');assert.equal(g.target,'.comparison-question > p');
 learningAction(s,u,'test-explain','cover');expectLeft(s,u,0);
 u.testing=true;s.tests=[];s.activeTestKey='';g=activityGuide(s,u);assert.equal(g.target,null);assert.match(g.tip,/비가 내리는 중/);
});
test('현장 임무에서는 단계 목록이 체크리스트이고 손가락은 다음 도전 버튼이나 남은 단계만 가리킨다',()=>{
 const [s,u]=open(0,{activityMode:'field'});s.journeyRequired[0]=true;
 let g=activityGuide(s,u);assert.equal(g.field,true);assert.equal(g.items.length,2);assert.equal(g.target,null);assert.equal(renderRemaining(g),'');
 fieldMissionAction(s,u,'field-scan','maple:shape');fieldMissionAction(s,u,'field-scan','maple:edge');
 html(s,u);g=activityGuide(s,u);assert.equal(g.items[0].done,true);assert.equal(u.fieldMission.stage,1);assert.equal(g.target,null,'the current step is done by hand');
 u.fieldMission.stage=0;g=activityGuide(s,u);assert.equal(g.target,'.objective-next');assert.match(html(s,u),/objective-next/);
 fieldMissionAction(s,u,'field-stage','2');assert.equal(u.fieldMission.stage,0);
});
test('남은 활동 목록은 오늘의 연구 패널에 들어가고 다음 항목에만 손 아이콘이 붙는다',()=>{
 const [s,u]=open(0);const page=html(s,u);
 assert.match(page,/class="today-panel"[\s\S]*remaining-list[\s\S]*guide-talk/);
 assert.equal((page.match(/data-action="guide-jump"/g)||[]).length,1);
 assert.equal((page.match(/guide-hand mini/g)||[]).length,1);assert.match(page,/남은 활동 <b>1<\/b>/);
 assert.doesNotMatch(renderRemaining(null),/remaining/);
});
