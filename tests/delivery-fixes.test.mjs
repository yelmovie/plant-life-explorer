// Pre-delivery fixes: one tooth rule, a real keep-or-change pick for the carried-over garden, objectives that match the screen.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshState,restoreState,pageReady,presetTerrain} from '../src/model.js';
import {learningAction} from '../src/learning.js';
import {normalizeFieldEvidence} from '../src/field-missions-state.js';
import {fieldMissionAction,renderFieldMission} from '../src/field-missions.js';

test('톱니 기준은 크기와 상관없이 있음/없음 하나로 판정하고, 오답 힌트는 지금 기준의 단서만 준다',()=>{
 const s={page:0,fieldEvidence:normalizeFieldEvidence({leaves:{scans:{maple:['shape','edge']}}})};
 const u={stage:1,mission:0},html=renderFieldMission(s,u);
 assert.doesNotMatch(html,/큰 톱니/);assert.match(html,/톱니가 있어/);assert.match(html,/톱니가 없어/);
 const wrong=fieldMissionAction(s,u,'field-place','leaf:camellia|sort:edge:no');
 assert.match(wrong,/작은 톱니/);assert.doesNotMatch(wrong,/타원/);
 assert.match(fieldMissionAction(s,u,'field-place','leaf:camellia|sort:edge:yes'),/톱니 있음/);
 assert.match(fieldMissionAction(s,u,'field-place','leaf:pine|sort:narrow:no'),/폭보다 길이/);
});

test('현장에서 넘어온 기본 정원은 자리 하나를 골라야 기록되고, 이미 완료한 기록은 그대로 둔다',()=>{
 const s=freshState();s.terrain=presetTerrain();s.garden={hyacinth:0,cherry:2,aloe:4};s.gardenReasons=['hyacinth','cherry','aloe'];s.gardenReviewed=true;
 for(const p of ['hyacinth','cherry','aloe'])assert.equal(s.terrain[s.garden[p]],{hyacinth:'water',cherry:'grass',aloe:'dry'}[p]);
 assert.equal(pageReady(s,7),false);
 const u={selected:'aloe'};
 assert.match(learningAction(s,u,'garden-pick','aloe'),/알로에는 건조 구역/);assert.equal(pageReady(s,7),true);
 assert.equal(restoreState(JSON.stringify(s)).gardenPick,'aloe');
 const done=freshState();Object.assign(done,{terrain:s.terrain,garden:s.garden,gardenReasons:s.gardenReasons,gardenReviewed:true});done.completed[6]=done.completed[7]=true;
 assert.equal(pageReady(done,7),true,'a garden page finished before this rule stays finished');
});

test('예상 화면에서는 위 안내도 예상만 말하고, 잎자루는 버튼으로도 먼저 잘라 봐야 모형을 이을 수 있다',()=>{
 const s={page:8,fieldEvidence:normalizeFieldEvidence(null)};
 assert.match(renderFieldMission(s,{}),/먼저 예상/);assert.doesNotMatch(renderFieldMission(s,{}),/①② 자리를 톡톡/);
 const f={page:4,fieldEvidence:normalizeFieldEvidence({float:{predictions:{air:'float',solid:'sink'},tested:['air','solid']}})},u={mission:2,stage:2};
 let html=renderFieldMission(f,u);assert.match(html,/잎자루 잘라 열기/);assert.doesNotMatch(html,/reason:air-space/);
 fieldMissionAction(f,u,'field-cut','');html=renderFieldMission(f,u);assert.match(html,/reason:air-space/);
});
