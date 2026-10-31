import {designKey,currentTrial,testValid} from './model.js';
import {FIELD_LEAVES,FIELD_BAG_VARIANTS,normalizeFieldEvidence,fieldSteps,fieldBagKey,fieldGardenKey,fieldGardenValid} from './field-missions-state.js';
// 자동 진행: returns the next hands-on step ([action,id]) of the current screen, or null.
// Only observation steps (looking, testing, watching) run here. Sorting, predictions, linking, design changes and
// answer choices are the student's own; the steps stop right before them.
const stageOf=u=>Number.isInteger(u?.stage)&&u.stage>=0&&u.stage<3?u.stage:0;
function fieldStageStep(e,u,m,stage){
 // Every leaf on the bench gets looked at (maple, pine, camellia), not only the maple the step requires.
 if(m===0&&stage===0)return FIELD_LEAVES.flatMap(p=>['shape','edge'].filter(k=>!e.leaves.scans[p.id].includes(k)).map(k=>['field-scan',`${p.id}:${k}`]))[0]||null;
 if(m===1&&stage===0){if(!['tree','herb'].every(k=>e.seasons.predictions[k]))return null;const kind=['tree','herb'].find(k=>!e.seasons.links[k]&&!u.dug?.[k]);return kind?['field-dig',kind]:null;}
 if(m===2&&stage===1){
  const id=['air','solid'].find(k=>e.float.predictions[k]&&!e.float.tested.includes(k));if(id)return ['field-test-model',id];
  // With both in the tank, the floating model is pushed under once and let go, so the water pushing back is seen.
  return ['air','solid'].every(k=>e.float.tested.includes(k))&&!u.floatPushed?['field-push','air']:null;
 }
 if(m===2&&stage===2)return ['air','solid'].every(k=>e.float.tested.includes(k))&&!e.float.reason&&!u.floatCut?['field-cut','']:null;
 if(m===3&&stage===0)return fieldSteps(e,3)[0]?null:['field-garden-ground',''];
 if(m===3&&stage===2)return fieldGardenValid(e.garden)&&e.garden.testedKey!==fieldGardenKey(e.garden)?['field-garden-rain','']:null;
 if(m===4&&stage<2){
  const b=e.bag;if(!b.prediction)return null;
  if(stage===0)return b.tests.length?null:['field-bag-test',''];
  // A bag already on the stand gets its rain; then each bag card not yet rained on, in order.
  if(b.tests.at(-1)?.key!==fieldBagKey(b.design))return ['field-bag-test',''];
  const next=FIELD_BAG_VARIANTS.find(k=>!b.tests.some(t=>t.key===k));return next?['field-bag-try',next]:null;
 }
 return null;
}
function fieldStep(s,u,m){
 const e=normalizeFieldEvidence(s.fieldEvidence),stage=stageOf(u),step=fieldStageStep(e,u,m,stage);
 if(step)return step;
 // A finished step moves on only when the next step starts with something to do by hand.
 return fieldSteps(e,m)[stage]&&stage<2&&fieldStageStep(e,u,m,stage+1)?['field-stage',String(stage+1)]:null;
}
function seasonStep(s){
 const plant=s.seasonPlant,seen=s.undergroundSeen.includes(plant),has=n=>s.seasonalRecords.includes(`${plant}:${n}`)&&s.seasonPhotos[`${plant}:${n}`];
 if(!has(3)){if(s.season!==3)return ['season','3'];if(!s.seasonPrediction[plant])return null;if(!seen||!s.underground)return ['underground',''];return ['record-season',''];}
 if(!has(0))return s.season!==0?['season','0']:['record-season',''];
 const other=plant==='cherry'?'sowthistle':'cherry';
 return [0,3].every(n=>s.seasonalRecords.includes(`${other}:${n}`)&&s.seasonPhotos[`${other}:${n}`])?null:['season-plant',other];
}
function bagTestStep(s,u){
 if(u.testing||!s.design.linked||testValid(s))return null;
 if(!currentTrial(s))return s.tests.some(t=>t.key===designKey(s.design))?['use-tested-design','']:['run-test',''];
 return null;
}
export function nextAutoStep(s,u){
 if(s.screen!=='activity')return null;
 const p=s.page;
 if(u.activityMode==='field')return fieldStep(s,u.fieldMission??{},Math.floor(p/2));
 switch(p){
  case 2:return seasonStep(s);
  case 4:{const n=s.experiment.step;return n===0?['lab-next','cut']:n<3?['lab-next','water']:n===3&&s.experiment.prediction?['press-petiole','']:null;}
  case 8:return !u.lotusDrop&&!s.design.observed?['lotus-drop','']:null;
  case 9:return bagTestStep(s,u);
  default:return null;
 }
}
