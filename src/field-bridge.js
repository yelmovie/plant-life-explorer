import {fieldMissionReady} from './field-missions-state.js';
import {normalizeFieldEvidence} from './field-missions-state.js';
// Carry only the student's own first predictions. Every record page is still solved on that page; nothing is pre-filled.
export function carryFieldEvidence(s, mission) {
  s.fieldBridges??=Array(5).fill(false);
  if(!fieldMissionReady(s,mission)||s.fieldBridges[mission])return;
  const e=normalizeFieldEvidence(s.fieldEvidence);
  if(mission===1){
    for(const [field,core] of [['tree','cherry'],['herb','sowthistle']])
      if(e.seasons.predictions[field]&&!s.seasonPrediction[core])s.seasonPrediction[core]=e.seasons.predictions[field];
  }
  if(mission===4&&e.bag.prediction&&!s.testPrediction)s.testPrediction=e.bag.prediction;
  s.fieldBridges[mission]=true;
}
export const BRIDGE_NOTES=[
  '현장에서 찾은 단서로 세 잎을 직접 살피고 기준에 맞게 나눠 보자.',
  '겨울과 봄의 같은 식물을 직접 비교하고 새로 자란 곳을 기록해 보자.',
  '잎자루 속 공기 방을 직접 실험하고, 세 식물의 특징과 사는 곳을 이어 보자.',
  '정원의 땅을 직접 만들고 식물이 살 곳과 까닭을 골라 보자.',
  '연잎을 관찰하고 가방을 직접 바꿔 가며 비 시험으로 비교해 보자.'
];
