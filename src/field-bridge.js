import {comparisonPair, designKey, testDesign} from './model.js';
import {normalizeFieldEvidence} from './field-missions-state.js';
// Carry only actual choices and tested comparisons. Never award a core completion.
export function carryFieldEvidence(s, mission) {
  s.fieldBridges??=Array(5).fill(false);
  if(s.fieldBridges[mission])return;
  const e=normalizeFieldEvidence(s.fieldEvidence);
  if(mission===1){
    for(const [field,core] of [['tree','cherry'],['herb','sowthistle']])
      if(e.seasons.predictions[field]&&!s.seasonPrediction[core])s.seasonPrediction[core]=e.seasons.predictions[field];
  }
  if(mission===4){
    const b=e.bag;
    if(b.prediction&&!s.testPrediction)s.testPrediction=b.prediction;
    if(!s.tests.length && b.delivered){
      s.design={...s.design,surface:b.design.surface,cover:b.design.cover};
      s.tests=b.tests.filter(t=>t.pocket===b.design.pocket).map(testDesign);
      for(const part of ['surface','cover']){
        const c=b.comparisons[part],before=b.tests.find(t=>t.key===c?.before),after=b.tests.find(t=>t.key===c?.after);
        if(!before||!after||before.pocket!==b.design.pocket||after.pocket!==b.design.pocket||before[part]===after[part]||before[part==='surface'?'cover':'surface']!==after[part==='surface'?'cover':'surface'])continue;
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
  '새 표본 적용 · 현장에서 찾은 모양과 가장자리 기준을 벚나무·은행나무·강아지풀에 써 보자.',
  '관찰 기록 남기기 · 현장의 첫 예상을 이어 쓰고, 시간 손잡이로 겨울과 다음 봄의 증거를 사진에 담자.',
  '새 상황 실험 · 모형의 뜨고 가라앉음을 살펴봤어. 이번에는 실제 식물의 잎자루에서 공기의 증거를 찾아보자.',
  '내 정원 설계 · 현장의 빗물 단서를 바탕으로 물가·풀밭·건조 구역의 크기와 모양을 직접 정하자.',
  '현장 가방 이어 쓰기 · 바깥 주머니는 닫힌 상태로 두고, 본 탐구에서는 공책을 담는 겉면과 입구 두 부품에 집중해. 같은 조건의 시험과 비교 증거는 가져왔어.'
];
