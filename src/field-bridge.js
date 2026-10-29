import {HABITAT_PLANTS, comparisonPair, designKey, testDesign} from './model.js';
import {fieldMissionReady} from './field-missions-state.js';
import {normalizeFieldEvidence} from './field-missions-state.js';
// Carry only actual choices and tested comparisons. Never award a core completion.
export function carryFieldEvidence(s, mission) {
  s.fieldBridges??=Array(5).fill(false);
  if(!fieldMissionReady(s,mission))return;
  // Existing field saves already contain the two explanations; do not ask for them again.
  if(mission===1)s.seasonExplained=[...new Set([...s.seasonExplained,'cherry','sowthistle'])];
  if(s.fieldBridges[mission])return;
  const e=normalizeFieldEvidence(s.fieldEvidence);
  // Carry only observations and placements actually completed in the field.
  if(fieldMissionReady(s,mission)&&mission===1){
    for(const [field,plant] of [['tree','cherry'],['herb','sowthistle']]){
      if(e.seasons.predictions[field]&&!s.seasonPrediction[plant])s.seasonPrediction[plant]=e.seasons.predictions[field];
      if(!s.undergroundSeen.includes(plant))s.undergroundSeen.push(plant);
      for(const n of [3,0]){const key=`${plant}:${n}`;if(!s.seasonalRecords.includes(key))s.seasonalRecords.push(key);s.seasonPhotos[key]??={underground:true};if(!s.linkedEvidence.includes(key))s.linkedEvidence.push(key);}
    }
  }
  // The field cut already showed air bubbling out of the petiole, so the same lab page is not repeated.
  if(fieldMissionReady(s,mission)&&mission===2&&e.float.reason==='air'){s.experiment.step=Math.max(4,s.experiment.step);s.experimentAnswer='air';}
  if(fieldMissionReady(s,mission)&&mission===3&&!s.gardenReviewed&&!s.terrain.some(t=>t!=='empty')&&!Object.keys(s.garden).length){
    s.terrain=['water','water','grass','grass','dry','dry','water','empty','grass','empty','dry','empty',...Array(12).fill('empty')];
    s.garden={hyacinth:0,cherry:2,aloe:4};s.gardenReviewed=true;
  }
  if(fieldMissionReady(s,mission)&&mission===3)s.gardenReasons=[...new Set([...s.gardenReasons,...HABITAT_PLANTS.filter(p=>s.reasons[p.id]===p.id).map(p=>p.id)])];
  if(mission===1){
    for(const [field,core] of [['tree','cherry'],['herb','sowthistle']])
      if(e.seasons.predictions[field]&&!s.seasonPrediction[core])s.seasonPrediction[core]=e.seasons.predictions[field];
  }
  if(mission===4){
    const b=e.bag;
    if(b.prediction&&!s.testPrediction)s.testPrediction=b.prediction;
    if(!s.tests.length && b.delivered){
      s.design={...s.design,surface:b.design.surface,cover:b.design.cover};
      s.tests=b.tests.map(testDesign);
      for(const part of ['surface','cover']){
        const c=b.comparisons[part],before=b.tests.find(t=>t.key===c?.before),after=b.tests.find(t=>t.key===c?.after);
        if(!before||!after||before[part]===after[part]||before[part==='surface'?'cover':'surface']!==after[part==='surface'?'cover':'surface'])continue;
        s.inventionExplanations[part]={before:designKey(before),key:designKey(after),part};
        if(part==='surface')s.design.observed=s.design.linked=true;
      }
      const pair=comparisonPair(s),proof=pair&&s.inventionExplanations[pair.part];
      if(proof?.before===pair?.before.key&&proof?.key===pair?.last.key)s.testExplanation={...proof};
    }
  }
  s.fieldBridges[mission]=true;
}
export const BRIDGE_NOTES=[
  '현장에서 톱니와 모양, 두 기준으로 나눈 기록을 가져왔어. 확인하고 관찰 렌즈를 받자.',
  '겨울과 봄을 잇고 새로 자란 곳까지 찾았어. 그 발견을 연구노트에 담았어.',
  '현장에서 잎자루 속 공기 방을 확인했어. 이번에는 부레옥잠·알로에·벚나무의 특징과 사는 곳을 이어 보자.',
  '식물이 살 곳과 까닭을 정원에 이어 썼어. 바로 복구하거나 원하는 만큼 더 꾸며도 좋아.',
  '현장에서 두 부품을 하나씩 달아 본 시험 기록을 가져왔어. 확인하고 공방을 복구하자.'
];
