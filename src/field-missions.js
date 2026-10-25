import {assetImage} from './asset-catalog.js';
import {icon,plantArt,seasonArt,bagArt} from './art.js';
import {FIELD_LEAVES,FIELD_ORDER,FIELD_ZONES,FIELD_ENV,FIELD_PLANTS,normalizeFieldEvidence,fieldSteps,fieldMissionReady,fieldBagPair,FIELD_BAG_ROLES,applyFieldAction} from './field-missions-state.js';
export {normalizeFieldEvidence,fieldMissionReady};
const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const btn=(label,action,id='',cls='')=>`<button type="button" class="btn mission-tool ${cls}" data-action="${action}" data-id="${esc(id)}">${label}</button>`;
const source=(label,item,u,cls='')=>`<button type="button" class="mission-tool field-token ${u.selected===item?'selected':''} ${cls}" data-action="field-select" data-id="${esc(item)}" data-field-item="${esc(item)}" aria-pressed="${u.selected===item}" draggable="false">${label}</button>`;
const target=(label,id,cls='')=>`<button type="button" class="field-target ${cls}" data-action="field-drop" data-id="${esc(id)}" data-field-drop="${esc(id)}">${label}</button>`;
const envNames={water:'물가',grass:'풀밭',dry:'건조한 곳'};
const plantNames={hyacinth:'부레옥잠',cherry:'벚나무',aloe:'알로에'};
const modelName=id=>id==='air'?'공기 공간 모형':'속을 채운 비교 모형';
const stages=[['돋보기로 찾기','톱니로 나누기','새 기준으로 나누기'],['살아 있는 부분 잇기','나무 시간 잇기','풀 시간 잇기'],['결과 예상하기','같은 수조에서 시험','관찰 결과 연결하기'],['빗물 자리 찾기','식물 옮겨 심기','비로 복구 확인'],['의뢰 가방 조립','부품 하나만 비교','역할 설명하고 완성']];
const objectives=[['돋보기를 각 잎의 전체와 가장자리에 가져가 봐.','새 표본 세 개를 톱니가 있는 잎과 없는 잎으로 옮겨 봐.','같은 잎을 이번에는 가늘고 긴 모양인지로 다시 나눠 봐.'],['겨울에 살아 있는 부분을 다음 봄의 같은 부분에 이어 줘.','같은 벚나무가 겨울을 지나 다시 자라는 순서로 놓아 줘.','땅속에 뿌리가 남는 씀바귀의 사진 순서를 완성해 줘.'],['두 모형을 물에 넣으면 어떻게 될지 예상 칸에 놓아 줘.','두 모형을 같은 수조에 하나씩 넣고 위치를 살펴봐.','본 결과를 기록하고 공기 공간이 있던 모형을 연결해 줘.'],['비 온 뒤 모습을 보고 환경 카드를 알맞은 자리에 놓아 줘.','각 식물을 특징이 도움이 되는 자리에 심어 줘.','비를 뿌려 정원 배치를 시험하고 필요하면 고쳐 봐.'],['물방울이 잘 굴러가고 공책과 바깥 주머니가 마를 가방을 조립해 줘.','같은 비로 시험하고 겉면·입구·주머니 중 하나만 바꿔 다시 시험해 줘.','바뀐 부품을 시험 결과에 연결하고 의뢰 조건을 완성해 줘.']];

function leafPicture(id){
 return assetImage('field_leaf_'+id,'field-leaf-picture leaf-'+id,true);
}
function leaves(e,u,stage){
 if(stage===0)return `<div class="field-tools">${source(icon('zoom',30)+' 돋보기','lens',u)}<p class="microcopy">끌어도 되고, 돋보기 → 관찰 자리 순서로 눌러도 돼.</p></div><div class="field-leaf-tray">${FIELD_LEAVES.map(p=>`<article class="field-specimen"><h3>${p.name}</h3>${leafPicture(p.id)}<div class="field-hotspots">${target(`${e.leaves.scans[p.id].includes('shape')?'✓ ':''}잎 전체`,'scan:'+p.id+':shape','field-hotspot')}${target(`${e.leaves.scans[p.id].includes('edge')?'✓ ':''}가장자리 확대`,'scan:'+p.id+':edge','field-hotspot')}</div><p>${e.leaves.scans[p.id].includes('shape')?p.shape:'잎 전체에서 모양을 찾아봐.'}</p>${e.leaves.scans[p.id].includes('edge')?`<div class="field-magnified">${leafPicture(p.id)}<strong>${p.edge?'작은 톱니가 이어져 있어':'큰 톱니가 보이지 않아'}</strong></div>`:''}</article>`).join('')}</div>`;
 const rule=stage===1?'edge':'narrow';
 return `<div class="field-tools">${FIELD_LEAVES.map(p=>source(`${leafPicture(p.id)}<span>${p.name}</span>`,'leaf:'+p.id,u,'field-leaf-token')).join('')}</div><div class="field-sort-bins">${['yes','no'].map(answer=>target(`<strong>${rule==='edge'?(answer==='yes'?'톱니가 있어':'큰 톱니가 없어'):(answer==='yes'?'가늘고 길어':'가늘고 긴 모양은 아니야')}</strong><span class="field-bin-content">${FIELD_LEAVES.filter(p=>e.leaves[rule][p.id]===answer).map(p=>`<span>${leafPicture(p.id)}${p.name}</span>`).join('')||'여기로 표본을 옮겨 줘'}</span>`,`sort:${rule}:${answer}`,'field-sort-bin')).join('')}</div><p class="microcopy">관찰 그림의 특징으로 나누는 활동이야. 식물 이름이 기준은 아니야.</p>`;
}
function seedlingArt(herb){return assetImage(herb?'sowthistle_bud_spring':'cherry_bud_spring','field-bud-picture',true);}
function frameArt(kind,phase){return phase==='bud'?seedlingArt(kind==='herb'):seasonArt(kind==='tree'?'cherry':'sowthistle',phase==='winter'?3:0,true).replace(/aria-label="[^"]*"/,`aria-label="${phase==='winter'?'잎이 없고 땅속 뿌리와 줄기가 남은 모습':'같은 식물에 잎과 꽃이 자란 모습'}"`);}
const frameName={winter:'겨울 · 살아 있는 부분이 남아 있어',bud:'초봄 · 같은 부분에서 새눈·새싹이 나와',spring:'다음 봄 · 잎과 꽃이 자랐어'};
function seasons(e,u,stage){
 if(stage===0&&!['tree','herb'].every(k=>e.seasons.predictions[k]))return `<div class="field-season-predictions"><p class="direct-hint">도움 없는 첫 예상 · 겨울에 잎이 보이지 않으면 땅속은 어떨까?</p>${['tree','herb'].map(k=>`<section><h3>${k==='tree'?'벚나무':'씀바귀'}</h3><div class="field-predict-picture">${seasonArt(k==='tree'?'cherry':'sowthistle',3,false)}</div>${e.seasons.predictions[k]?'<p>처음 예상을 보관했어.</p>':btn('뿌리가 남아 있을 것 같아','field-season-predict',k+':roots')+btn('아무것도 없을 것 같아','field-season-predict',k+':none')}</section>`).join('')}</div>`;
 if(stage===0)return `<div class="field-season-pairs">${['tree','herb'].map(kind=>`<article class="field-season-pair"><h3>${kind==='tree'?'벚나무':'씀바귀'}</h3><div class="field-season-images"><div>${seasonArt(kind==='tree'?'cherry':'sowthistle',3,true)}${source('겨울의 살아 있는 부분 →','season:'+kind,u)}</div><div>${seasonArt(kind==='tree'?'cherry':'sowthistle',0,true)}<div class="field-link-targets">${(kind==='tree'?['trunk','leaf']:['root','leaf']).map(part=>target(`${e.seasons.links[kind]===part?'✓ ':''}${part==='trunk'?'같은 줄기와 뿌리':part==='root'?'살아 있던 뿌리':'새로 나온 잎'}`,`link:${kind}:${part}`)).join('')}</div></div></div></article>`).join('')}</div>`;
 const kind=stage===1?'tree':'herb';
 return `<div class="field-frame-tray">${['spring','winter','bud'].map(phase=>source(`${frameArt(kind,phase)}<span>${e.seasons.clues[kind]===(kind==='tree'?'branches':'rootbud')?frameName[phase]:`관찰 사진 ${['spring','winter','bud'].indexOf(phase)+1}`}</span>`,`frame:${kind}:${phase}`,u,'field-frame')).join('')}</div><div class="field-timeline">${[0,1,2].map(i=>target(`<b>${i+1}</b>${e.seasons[kind][i]?`${frameArt(kind,e.seasons[kind][i])}<span>${e.seasons.clues[kind]===(kind==='tree'?'branches':'rootbud')?frameName[e.seasons[kind][i]]:'놓은 사진'}</span>`:'사진 놓는 자리'}`,`order:${kind}:${i}`,'field-time-slot')).join('')}</div><div class="reason-cards"><p>그림의 어떤 특징을 근거로 이어 놓았어?</p>${btn('같은 가지에서 새눈이 돋았어','field-season-clue',kind+':branches')}${btn('땅속 뿌리에서 새싹이 돋았어','field-season-clue',kind+':rootbud')}${btn('꽃 색깔만 같아','field-season-clue',kind+':color')}</div><p class="microcopy">달력 순서만 맞추는 게 아니야. 겨울에 남아 있던 부분에서 무엇이 다시 자랐는지 봐.</p>`;
}
function modelArt(id){return assetImage(id==='air'?'float_model_air':'float_model_solid','field-float-model',true);}
function modelTools(u){return `<div class="field-tools">${['air','solid'].map(id=>source(`${modelArt(id)}<span>${modelName(id)}</span>`,'model:'+id,u,'field-model-token')).join('')}</div>`;}
function floatLab(e,u,stage){
 const f=e.float;
 const tank=`<div class="field-tank" role="img" aria-label="같은 물이 담긴 수조">${f.tested.includes('air')?`<div class="field-tank-model is-floating">${modelArt('air')}<span>수면에 떠 있어</span></div>`:''}${f.tested.includes('solid')?`<div class="field-tank-model is-sinking">${modelArt('solid')}<span>수조 바닥에 있어</span></div>`:''}<span class="field-water-line">같은 물 수조</span></div>`;
 if(stage===0)return `${modelTools(u)}<div class="field-sort-bins">${['float','sink'].map(r=>target(`<strong>${r==='float'?'물 위에 뜰 것 같아':'물속으로 내려갈 것 같아'}</strong>${['air','solid'].filter(m=>f.predictions[m]===r).map(m=>`<span>${modelName(m)}</span>`).join('')}`,`predict:${r}`,'field-sort-bin')).join('')}</div><p class="microcopy">겉 크기는 같아. 한 모형은 안에 공기 공간이 있고, 다른 모형은 무겁게 채웠어. 예상이 달라도 괜찮아.</p>`;
 if(stage===1)return `${modelTools(u)}${target(tank,'tank','field-tank-drop')}<p class="microcopy">모형을 수조로 옮겨. 두 모형 모두 시험해야 공기 공간의 역할을 견줄 수 있어.</p>`;
 return `${tank}${modelTools(u)}<div class="field-sort-bins">${['float','sink'].map(r=>target(`<strong>관찰 기록 · ${r==='float'?'수면에 떠 있음':'바닥으로 내려감'}</strong>${['air','solid'].filter(m=>f.observed[m]===r).map(m=>`<span>${modelName(m)} ✓</span>`).join('')}`,`observe:${r}`,'field-sort-bin')).join('')}</div><div class="field-tools">${source('안에 공기가 차지하는 공간','reason:air-space',u)}${['air','solid'].map(m=>target(`${f.reason===m?'✓ ':''}${modelName(m)}`,`reason:${m}`)).join('')}</div>`;
}
function garden(e,u,stage){
 const g=e.garden,zoneClue={pond:'빗물이 낮은 자리에 오래 고여 있어',meadow:'빗물이 흙에 고르게 배어들어',ridge:'물이 빠르게 빠지고 땅이 말라 있어'};
 const tools=stage===0?Object.entries(envNames).map(([id,n])=>source(`${assetImage('habitat_'+id,'field-habitat-picture',true)}<span>${n}</span>`,'environment:'+id,u,'field-env-token')).join(''):Object.entries(plantNames).map(([id,n])=>source(`${plantArt(id)}<span>${n}</span>`,'plant:'+id,u,'field-plant-token')).join('');
 return `<div class="field-tools">${tools}</div><div class="field-restoration">${FIELD_ZONES.map(z=>{const p=Object.keys(FIELD_PLANTS).find(p=>g.plants[p]===z);return target(`<strong>${zoneClue[z]}</strong><span class="field-zone-name">${envNames[g.environments[z]]||'환경 카드를 놓아 줘'}</span>${p?plantArt(p)+`<span>${plantNames[p]}</span>`:'<span class="field-plant-space">심을 식물 자리</span>'}`,`${stage===0?'environment':'plant'}:${z}`,'field-garden-zone zone-'+z);}).join('')}</div>${stage===2?`${btn(icon('drop')+' 같은 비로 정원 시험','field-garden-rain','','primary')}<p class="microcopy">배치를 바꾸면 다시 시험해야 해. 비는 식물을 바로 자라거나 시들게 만드는 장치가 아니라 물이 머무르는 환경을 확인하는 모형이야.</p>`:''}`;
}
const partName={surface:'겉면',cover:'입구 덮개',pocket:'바깥 주머니 덮개'};
const partLabel=(part,value)=>part==='surface'?(value==='lotus'?'연잎을 본뜬 겉면':'기본 천 겉면'):(value==='flap'?'닫힌 덮개':'열린 입구');
function bagTools(u){return `<div class="field-bag-parts">${Object.keys(partName).map(part=>`<div><strong>${partName[part]}</strong>${(part==='surface'?['plain','lotus']:['open','flap']).map(value=>source(partLabel(part,value),`part:${part}:${value}`,u)).join('')}</div>`).join('')}</div>`;}
function trialCard(t,label){return `<article class="field-trial-card"><h4>${label} · 같은 비 10방울</h4>${bagArt(t,false,t)}<p>겉면: ${t.rolls?'물방울 잘 굴러감':'물방울 남음'}</p><p>공책: ${t.notebookDry?'마름':'젖음'} · 바깥 주머니: ${t.pocketDry?'마름':'젖음'}</p><small>${partLabel('surface',t.surface)} / 입구 ${t.cover==='flap'?'닫힘':'열림'} / 주머니 ${t.pocket==='flap'?'닫힘':'열림'}</small></article>`;}
function invention(e,u,stage){
 const b=e.bag,pair=fieldBagPair(b);
 const assembly=`${bagTools(u)}<div class="field-bag-assembly">${bagArt(b.design)}<div>${Object.keys(partName).map(part=>target(`<strong>${partName[part]}</strong><span>${b.assembled.includes(part)?partLabel(part,b.design[part]):'이 부품을 옮겨 조립해 줘'}</span>`,`part:${part}`,'field-part-slot')).join('')}</div></div>`;
 if(stage===0&&!b.prediction)return `<div class="field-bag-predict"><div class="field-predict-picture">${bagArt({surface:'plain',cover:'open'})}</div><div><p class="field-request">도움 없는 첫 예상 · 비가 와도 공책을 지키려면?</p><div class="field-predict-choices">${btn('연잎 겉면만 바꾸면 돼','field-bag-predict','surface')}${btn('입구로 오는 비도 막아야 해','field-bag-predict','cover')}</div></div></div>`;
 if(stage===0)return `<p class="field-request">리피의 의뢰: 바깥의 물방울은 잘 굴러가게, 안쪽 공책과 바깥 주머니는 젖지 않게!</p>${assembly}`;
 if(stage===1)return `${assembly}${btn(icon('drop')+' 같은 비 10방울로 시험','field-bag-test','','primary')}<div class="field-trials">${b.tests.slice(-2).map((t,i)=>trialCard(t,`시험 ${b.tests.length- Math.min(b.tests.length,2)+i+1}`)).join('')||'<p>첫 가방을 시험해 줘. 그다음 부품 하나만 바꿔 다시 시험해.</p>'}</div><p class="microcopy">겉면·입구·주머니 중 하나만 바꾸고 나머지 두 부품과 비의 양은 같게 해. 이번에는 한 부품의 역할을 비교하면 돼.</p>`;
 return `${pair?`<div class="field-trials">${trialCard(pair.before,'바꾸기 전')}${trialCard(pair.after,'바꾼 뒤')}</div><div class="field-tools">${source('겉면을 바꿨어','compare:surface',u)}${source('입구 덮개를 바꿨어','compare:cover',u)}${source('주머니 덮개를 바꿨어','compare:pocket',u)}${target('두 시험에서 바뀐 부품을 여기 연결해 줘','compare','field-comparison-slot')}</div>`:'<p>먼저 부품 하나만 다른 두 시험을 만들어 줘.</p>'}${btn('의뢰 조건 확인하고 가방 완성','field-bag-deliver','','primary')}<div class="field-repair-actions">${btn('조립으로 돌아가기','field-stage','0')}${btn('비교 시험하기','field-stage','1')}</div><p class="microcopy">${pair&&b.compared.part===pair.part?`이 비교로 확인한 역할: ${FIELD_BAG_ROLES[pair.part]}`:'바뀐 부품 하나의 결과만 설명해 줘.'}</p>`;
}
const DEFAULT_FEEDBACK='도구나 표본을 끌어 옮겨 봐. 하나를 누르고 놓을 자리를 눌러도 똑같이 할 수 있어.';
const stageOf=u=>Number.isInteger(u?.stage)&&u.stage>=0&&u.stage<3?u.stage:0;
export function renderFieldMission(state,ui,page=state.page){
 const mission=Math.floor(page/2);if(mission<0||mission>4)return '';
 const e=normalizeFieldEvidence(state.fieldEvidence),u=ui.fieldMission??={},done=fieldSteps(e,mission);
 if(u.mission!==mission){u.mission=mission;u.stage=Math.max(0,done.findIndex(v=>!v));u.selected='';u.feedback='';}
 const stage=stageOf(u);
 const views=[leaves,seasons,floatLab,garden,invention],ready=done.every(Boolean);
 return `<section class="field-mission mission-${mission}" aria-label="리피와 현장 탐구"><div class="mission-objective ${done[stage]?'step-done':''}"><span><b class="objective-num" aria-hidden="true">${done[stage]?icon('check',18):stage+1}</b>${objectives[mission][stage]}</span>${done[stage]&&stage<2?btn('다음 도전 '+icon('arrow',18),'field-stage',String(stage+1),'primary objective-next'):''}</div>${ready?'<div class="mission-loot" role="status">현장 복구 성공! 발견한 단서를 본 탐구에도 써 보자.</div>':''}<div class="mission-workspace">${views[mission](e,u,stage)}</div>${mission===2?'<p class="microcopy">원리 확인용 모형이야. 식물에서 공기 공간이 차지하는 역할을 살펴보는 실험이며 실제 식물 전체를 재현한 것은 아니야.</p>':''}</section>`;
}
// The step list and Leafy's reply live in the activity's left "오늘의 연구" panel.
export function renderFieldSteps(state,ui,page=state.page){
 const mission=Math.floor(page/2);if(mission<0||mission>4)return '';
 const done=fieldSteps(normalizeFieldEvidence(state.fieldEvidence),mission),stage=stageOf(ui.fieldMission);
 return `<div class="mission-journey today-steps">${stages[mission].map((label,i)=>`<button class="mission-step ${i===stage?'active':''} ${done[i]?'done':''}" data-action="field-stage" data-id="${i}" ${i===stage?'aria-current="step"':''}><b>${done[i]?icon('check',16):i+1}</b><span>${label}</span></button>`).join('')}</div>`;
}
export const fieldFeedback=ui=>({text:ui.fieldMission?.feedback||DEFAULT_FEEDBACK,success:!!ui.fieldMission?.success});
export const FIELD_KEYBOARD_HELP='<details class="field-access-help microcopy"><summary>키보드로 조작하기</summary><p>Tab으로 표본을 찾고 Enter로 선택 → 놓을 자리에서 Enter. Escape로 선택 취소.</p></details>';

function dropAction(item,targetId){
 const [kind,a,b]=String(item).split(':'),[zone,x,y]=String(targetId).split(':');
 if(zone==='scan'&&kind==='lens')return ['field-scan',`${x}:${y}`];
 if(zone==='sort'&&kind==='leaf')return ['field-sort',`${x}:${a}:${y}`];
 if(zone==='link'&&kind==='season'&&a===x)return ['field-season-link',`${x}:${y}`];
 if(zone==='order'&&kind==='frame'&&a===x)return ['field-order',`${x}:${b}:${y}`];
 if(zone==='predict'&&kind==='model')return ['field-predict',`${a}:${x}`];
 if(zone==='tank'&&kind==='model')return ['field-test-model',a];
 if(zone==='observe'&&kind==='model')return ['field-observe-model',`${a}:${x}`];
 if(zone==='reason'&&kind==='reason')return ['field-model-reason',x];
 if(zone==='environment'&&kind==='environment')return ['field-place-environment',`${a}:${x}`];
 if(zone==='plant'&&kind==='plant')return ['field-place-plant',`${a}:${x}`];
 if(zone==='part'&&kind==='part'&&a===x)return ['field-bag-part',`${a}:${b}`];
 if(zone==='compare'&&kind==='compare')return ['field-bag-compare',a];
 return null;
}
export function fieldMissionAction(state,ui,action,id=''){
 if(action==='field-cancel'){if(ui.fieldMission)ui.fieldMission.selected='';return '';}
 if(action==='field-drop'||action==='field-place'){
  const [item,targetId]=action==='field-place'?String(id).split('|'):[ui.fieldMission?.selected||'',id];
  const mapped=dropAction(item,targetId);if(mapped)return applyFieldAction(state,ui,...mapped);
  const u=ui.fieldMission??={};u.success=false;return u.feedback=item?'리피: 이 도구가 필요한 자리를 찾아 줘.':'먼저 옮길 도구나 표본을 하나 골라 줘.';
 }
 return applyFieldAction(state,ui,action,id);
}

// One pointer implementation covers mouse, pen and touch; native buttons provide
// the equivalent select-then-place operation to touch and keyboard users.
export function mountFieldInteractions(root,state,ui,onAction){
 if(!root)return ()=>{};
 let drag=null,ghost=null,blockedClick=false,blockTimer;
 const clear=()=>{ghost?.remove();ghost=null;root.querySelectorAll('.field-drag-over').forEach(el=>el.classList.remove('field-drag-over'));if(drag?.el?.hasPointerCapture?.(drag.pointer))drag.el.releasePointerCapture(drag.pointer);drag=null;};
 const down=event=>{if(event.pointerType==='touch')return;const el=event.target.closest('[data-field-item]');if(!el||!root.contains(el)||event.button>0)return;drag={el,item:el.dataset.fieldItem,x:event.clientX,y:event.clientY,pointer:event.pointerId,moved:false};el.setPointerCapture?.(event.pointerId);};
 const move=event=>{if(!drag||event.pointerId!==drag.pointer)return;if(!drag.moved&&Math.hypot(event.clientX-drag.x,event.clientY-drag.y)<8)return;event.preventDefault();drag.moved=true;if(!ghost){ghost=drag.el.cloneNode(true);ghost.removeAttribute('id');ghost.setAttribute('aria-hidden','true');ghost.classList.add('field-drag-ghost');ghost.style.cssText='position:fixed;pointer-events:none;z-index:40;width:120px;max-height:140px;overflow:hidden;opacity:.9;transform:translate(-50%,-50%);';document.body.append(ghost);}ghost.style.left=event.clientX+'px';ghost.style.top=event.clientY+'px';const over=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-field-drop]');root.querySelectorAll('.field-drag-over').forEach(el=>el.classList.toggle('field-drag-over',el===over));if(over&&root.contains(over))over.classList.add('field-drag-over');};
 const up=event=>{if(!drag||event.pointerId!==drag.pointer)return;const item=drag.item,moved=drag.moved,target=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-field-drop]');clear();if(!moved)return;event.preventDefault();blockedClick=true;clearTimeout(blockTimer);blockTimer=setTimeout(()=>{blockedClick=false;},400);if(target&&root.contains(target))onAction('field-place',`${item}|${target.dataset.fieldDrop}`);};
 const click=event=>{if(blockedClick){event.preventDefault();event.stopImmediatePropagation();blockedClick=false;}};
 const cancel=()=>clear();const key=event=>{if(event.key==='Escape'){clear();onAction('field-cancel','');}};
 root.addEventListener('pointerdown',down);root.addEventListener('pointermove',move,{passive:false});root.addEventListener('pointerup',up);root.addEventListener('pointercancel',cancel);root.addEventListener('click',click,true);root.addEventListener('keydown',key);
 return ()=>{clear();clearTimeout(blockTimer);root.removeEventListener('pointerdown',down);root.removeEventListener('pointermove',move);root.removeEventListener('pointerup',up);root.removeEventListener('pointercancel',cancel);root.removeEventListener('click',click,true);root.removeEventListener('keydown',key);};
}
