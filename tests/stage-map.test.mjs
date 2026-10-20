import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshState,missionDone,rewardCount} from '../src/model.js';
import {nextMapMission,mapPrerequisite,worldMap} from '../src/rewards.js';
import {TRAIL,TRAIL_LENGTH,ENTRANCES,projectToTrail,trailPoint} from '../src/stage-map.js';

test('다음 목적지는 완료 개수가 아니라 실제 선행 탐구로 결정한다',()=>{
  const s=freshState();s.completed[4]=s.completed[5]=true;
  assert.equal(nextMapMission(s),0);assert.equal(mapPrerequisite(s,4),0);
  s.completed[0]=s.completed[1]=true;
  assert.equal(nextMapMission(s),1);assert.equal(mapPrerequisite(s,4),1);
  assert.match(worldMap(s),/data-reason="계절 꽃돔을 깨우면 열려/);
  assert.match(worldMap(s),/data-id="1" aria-current="step"/);
});
test('다섯 출입구는 순서대로 같은 길 위에 있으며 이동이 보상을 만들지 않는다',()=>{
  const s=freshState();let previous=-1;
  for(const e of ENTRANCES){assert.ok(e.distance>previous);assert.ok(e.gap<.001);const p=trailPoint(e.distance);assert.ok(Math.hypot(p.x-e.x,p.y-e.y)<.001);previous=e.distance;}
  for(let d=0;d<=TRAIL_LENGTH;d+=7){const p=trailPoint(d),projected=projectToTrail(p.x,p.y);assert.ok(projected.gap<.001);assert.ok(Math.abs(projected.distance-d)<.001);}
  assert.equal(rewardCount(s),0);assert.equal(missionDone(s,0),false);
});
test('강을 가로지르는 탭은 강 위 좌표로 순간이동하지 않는다',()=>{
  const p=projectToTrail(1030,670);assert.ok(p.gap>90);
  assert.deepEqual([trailPoint(-100).x,trailPoint(-100).y],TRAIL[0]);
  const end=trailPoint(TRAIL_LENGTH+100);assert.ok(Math.hypot(end.x-TRAIL.at(-1)[0],end.y-TRAIL.at(-1)[1])<.001);
});
