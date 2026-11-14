import {fieldMissionReady,normalizeFieldEvidence,FIELD_ZONES} from './field-missions-state.js';
// Carry observations, never a student's explanation. Each field bed maps to two columns of the garden.
const bedCenter=Object.fromEntries(FIELD_ZONES.map((z,i)=>[z,6+2*i]));
export function carryFieldEvidence(s, mission) {
  s.fieldBridges??=Array(5).fill(false);
  if(!fieldMissionReady(s,mission))return;
  if(s.fieldBridges[mission]&&![2,3].includes(mission))return;
  const e=normalizeFieldEvidence(s.fieldEvidence);
  if(mission===1){
    for(const [field,core] of [['tree','cherry'],['herb','sowthistle']])
      if(e.seasons.predictions[field]&&!s.seasonPrediction[core])s.seasonPrediction[core]=e.seasons.predictions[field];
  }
  if(mission===2&&!s.completed[4]&&s.experiment.step<3)s.experiment.step=3;
  if(mission===3&&!s.completed[6]&&!s.completed[7]&&!s.terrain.some(t=>t!=='empty')&&!Object.keys(s.garden).length){
    s.terrain=Array.from({length:24},(_,i)=>e.garden.environments[FIELD_ZONES[Math.floor((i%6)/2)]]);
    s.garden=Object.fromEntries(Object.entries(e.garden.plants).map(([plant,zone])=>[plant,bedCenter[zone]]));
    s.gardenReviewed=true;s.gardenFromField=true;
  }
  if(mission===4&&e.bag.prediction&&!s.testPrediction)s.testPrediction=e.bag.prediction;
  s.fieldBridges[mission]=true;
}
export const BRIDGE_NOTES=[
  '세 잎을 나란히 살펴보고, 기준을 바꾸면 은행잎의 짝이 어떻게 달라지는지 알아보자.',
  '현장에서 본 겨울과 봄을 나란히 놓고, 두 식물이 어디에서 다시 자랐는지 비교해 보자.',
  '물속 잎자루를 눌러 공기 방울을 보고, 부레옥잠이 물에 뜨는 까닭을 알아보자.',
  '현장에서 심은 정원에서 한 자리를 골라, 왜 잘 맞는지 확인해 보자.',
  '현장 비 시험을 나란히 보고 두 부품이 각각 무엇을 했는지 알아보자.'
];
