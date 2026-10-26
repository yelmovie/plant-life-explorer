import {assetImage} from './asset-catalog.js';
import {icon,plantArt,seasonArt,bagArt} from './art.js';
import {mountGardenHands} from './field-hands-garden.js';
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
const objectives=[['돋보기를 끌어 세 잎의 가운데와 가장자리를 살펴봐.','새 표본 세 개를 톱니가 있는 잎과 없는 잎으로 옮겨 봐.','같은 잎을 이번에는 가늘고 긴 모양인지로 다시 나눠 봐.'],['겨울에 살아 있는 부분을 다음 봄의 같은 부분에 이어 줘.','같은 벚나무가 겨울을 지나 다시 자라는 순서로 놓아 줘.','땅속에 뿌리가 남는 씀바귀의 사진 순서를 완성해 줘.'],['두 모형을 물에 넣으면 어떻게 될지 예상 칸에 놓아 줘.','두 모형을 같은 수조에 하나씩 넣고 위치를 살펴봐.','본 결과를 기록하고 공기 공간이 있던 모형을 연결해 줘.'],['비 온 뒤 모습을 보고 환경 카드를 알맞은 자리에 놓아 줘.','각 식물을 특징이 도움이 되는 자리에 심어 줘.','비를 뿌려 정원 배치를 시험하고 필요하면 고쳐 봐.'],['물방울이 잘 굴러가고 공책과 바깥 주머니가 마를 가방을 조립해 줘.','같은 비로 시험하고 겉면·입구·주머니 중 하나만 바꿔 다시 시험해 줘.','바뀐 부품을 시험 결과에 연결하고 의뢰 조건을 완성해 줘.']];

function leafPicture(id){
 return assetImage('field_leaf_'+id,'field-leaf-picture leaf-'+id,true);
}
// Where each clue sits on the leaf picture, as fractions of the drawn image.
const LENS_SPOTS={maple:{shape:[[.5,.6]],edge:[[.33,.33],[.68,.33],[.17,.55],[.83,.5],[.3,.69],[.7,.69]]},pine:{shape:[[.5,.45]],edge:[[.3,.25],[.7,.25],[.4,.65],[.58,.65]]},camellia:{shape:[[.5,.45]],edge:[[.14,.4],[.86,.42],[.2,.66],[.8,.64],[.32,.17],[.68,.17]]}};
const edgeNote=p=>p.edge?'작은 톱니가 이어져 있어':'큰 톱니가 없어';
function lensClue(p,kind,found,fresh){const text=kind==='shape'?`모양 · ${p.shape}`:`가장자리 · ${edgeNote(p)}`;return `<span class="lens-clue ${found?'found':''} ${fresh?'just-found':''}" data-clue="${p.id}:${kind}" data-text="✓ ${text}">${found?'✓ '+text:`? ${kind==='shape'?'잎 가운데를 살펴봐':'가장자리를 살펴봐'}`}</span>`;}
function leaves(e,u,stage){
 if(stage===0)return `<div class="lens-bench" data-lens-bench><p class="lens-hint"><span>돋보기를 끌어서 잎의 <b>가운데</b>와 <b>가장자리</b>에 대고 잠깐 멈춰 봐.</span></p><div class="field-leaf-tray">${FIELD_LEAVES.map(p=>{const s=e.leaves.scans[p.id];return `<article class="field-specimen"><h3>${p.name}</h3><div class="lens-leaf" data-lens-leaf="${p.id}">${leafPicture(p.id)}</div><div class="lens-clues">${['shape','edge'].map(k=>lensClue(p,k,s.includes(k),u.lastFound===p.id+':'+k)).join('')}</div><div class="lens-fallback">${target('잎 가운데 살펴보기','scan:'+p.id+':shape','field-hotspot')}${target('가장자리 살펴보기','scan:'+p.id+':edge','field-hotspot')}</div></article>`;}).join('')}</div><div class="field-lens" data-lens aria-hidden="true"><div class="field-lens-glass"><img alt=""></div><span class="field-lens-ring"></span></div></div>`;
 const rule=stage===1?'edge':'narrow';
 return `<div class="field-tools">${FIELD_LEAVES.map(p=>source(`${leafPicture(p.id)}<span>${p.name}</span><small class="leaf-token-clue">${e.leaves.scans[p.id].includes(rule==='edge'?'edge':'shape')?(rule==='edge'?edgeNote(p):p.shape):'돋보기로 아직 안 봤어'}</small>`,'leaf:'+p.id,u,'field-leaf-token')).join('')}</div><div class="field-sort-bins">${['yes','no'].map(answer=>target(`<strong>${rule==='edge'?(answer==='yes'?'톱니가 있어':'큰 톱니가 없어'):(answer==='yes'?'가늘고 길어':'가늘고 긴 모양은 아니야')}</strong><span class="field-bin-content">${FIELD_LEAVES.filter(p=>e.leaves[rule][p.id]===answer).map(p=>`<span>${leafPicture(p.id)}${p.name}</span>`).join('')||'여기로 표본을 옮겨 줘'}</span>`,`sort:${rule}:${answer}`,'field-sort-bin')).join('')}</div><p class="microcopy">관찰 그림의 특징으로 나누는 활동이야. 식물 이름이 기준은 아니야.</p>`;
}
function seedlingArt(herb){return assetImage(herb?'sowthistle_bud_spring':'cherry_bud_spring','field-bud-picture',true);}
function frameArt(kind,phase){return phase==='bud'?seedlingArt(kind==='herb'):seasonArt(kind==='tree'?'cherry':'sowthistle',phase==='winter'?3:0,true).replace(/aria-label="[^"]*"/,`aria-label="${phase==='winter'?'잎이 없고 땅속 뿌리와 줄기가 남은 모습':'같은 식물에 잎과 꽃이 자란 모습'}"`);}
const frameName={winter:'겨울 · 살아 있는 부분이 남아 있어',bud:'초봄 · 같은 부분에서 새눈·새싹이 나와',spring:'다음 봄 · 잎과 꽃이 자랐어'};
// Stage-2 picture geometry, as fractions of one atlas cell.
const LINK_HANDLE={tree:[.49,.7],herb:[.49,.68]},LINK_CUT={tree:.42,herb:.58},DIG_TOP=.6,DIG_CELLS=24;
const regrowZone=(kind,x,y)=>kind==='tree'?(y<.6?'branches':'rootbud'):(x>.3&&x<.7&&y>.15&&y<.8?'rootbud':'color');
function seasons(e,u,stage){
 if(stage===0&&!['tree','herb'].every(k=>e.seasons.predictions[k]))return `<div class="field-season-predictions"><p class="direct-hint">도움 없는 첫 예상 · 겨울에 잎이 보이지 않으면 땅속은 어떨까?</p>${['tree','herb'].map(k=>`<section><h3>${k==='tree'?'벚나무':'씀바귀'}</h3><div class="field-predict-picture">${seasonArt(k==='tree'?'cherry':'sowthistle',3,false)}</div>${e.seasons.predictions[k]?'<p>처음 예상을 보관했어.</p>':btn('뿌리가 남아 있을 것 같아','field-season-predict',k+':roots')+btn('아무것도 없을 것 같아','field-season-predict',k+':none')}</section>`).join('')}</div>`;
 if(stage===0)return `<p class="lens-hint season-hint"><span>겨울 그림의 <b>흙을 문질러</b> 걷어 내고, 빛나는 점을 <b>다음 봄의 같은 부분</b>까지 끌어 이어 봐.</span></p><div class="field-season-pairs">${['tree','herb'].map(kind=>{const plant=kind==='tree'?'cherry':'sowthistle',linked=e.seasons.links[kind],dug=linked||u.dug?.[kind],[hx,hy]=LINK_HANDLE[kind];return `<article class="field-season-pair" data-season-pair="${kind}"><h3>${kind==='tree'?'벚나무':'씀바귀'}</h3><div class="field-season-images"><div><div class="season-dig" data-dig="${kind}">${seasonArt(plant,3,true)}${dug?`<span class="link-handle ${linked?'linked':''}" data-link-handle="${kind}" style="left:${hx*100}%;top:${hy*100}%"></span>`:`<div class="dig-cover" style="top:${DIG_TOP*100}%">${'<i></i>'.repeat(DIG_CELLS)}</div>`}</div><p class="season-cap">겨울 · ${linked?'이었어':dug?'점을 끌어 이어 봐':'흙을 문질러 봐'}</p></div><div><div class="link-target" data-link-target="${kind}" style="--cut:${LINK_CUT[kind]*100}%">${seasonArt(plant,0,true)}<span class="link-zone upper ${linked==='leaf'?'picked':''}">새로 나온 잎</span><span class="link-zone lower ${linked&&linked!=='leaf'?'picked':''}">${kind==='tree'?'같은 줄기와 뿌리':'살아 있던 뿌리'}</span></div><p class="season-cap">다음 봄</p></div></div><svg class="link-line" aria-hidden="true"><line/></svg><div class="lens-fallback">${(kind==='tree'?['trunk','leaf']:['root','leaf']).map(part=>target(`${part==='trunk'?'같은 줄기와 뿌리':part==='root'?'살아 있던 뿌리':'새로 나온 잎'}에 잇기`,`link:${kind}:${part}`)).join('')}</div></article>`;}).join('')}</div>`;
 const kind=stage===1?'tree':'herb';
 return `<div class="field-frame-tray">${['spring','winter','bud'].map(phase=>source(`${frameArt(kind,phase)}<span>${e.seasons.clues[kind]===(kind==='tree'?'branches':'rootbud')?frameName[phase]:`관찰 사진 ${['spring','winter','bud'].indexOf(phase)+1}`}</span>`,`frame:${kind}:${phase}`,u,'field-frame')).join('')}</div><div class="field-timeline">${[0,1,2].map(i=>target(`<b>${i+1}</b>${e.seasons[kind][i]?`${frameArt(kind,e.seasons[kind][i])}<span>${e.seasons.clues[kind]===(kind==='tree'?'branches':'rootbud')?frameName[e.seasons[kind][i]]:'놓은 사진'}</span>`:'사진 놓는 자리'}`,`order:${kind}:${i}`,'field-time-slot')).join('')}</div><div class="regrow-find" data-regrow="${kind}"><div class="regrow-copy"><p>초봄 사진에서 <b>새로 돋은 곳</b>을 찾아 새싹 핀을 꽂아 봐.</p><span class="regrow-pin" data-regrow-pin aria-hidden="true"></span></div><div class="regrow-pic">${frameArt(kind,'bud')}${u.pin?.[kind]&&e.seasons.clues[kind]?`<span class="regrow-mark ${e.seasons.clues[kind]===(kind==='tree'?'branches':'rootbud')?'ok':''}" style="left:${u.pin[kind][0]*100}%;top:${u.pin[kind][1]*100}%"></span>`:''}</div><div class="lens-fallback">${btn('같은 가지에서 새눈이 돋았어','field-season-clue',kind+':branches')}${btn('땅속 뿌리에서 새싹이 돋았어','field-season-clue',kind+':rootbud')}${btn('꽃 색깔만 같아','field-season-clue',kind+':color')}</div></div>`;
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
const envVerb={water:'물 붓기 · 물가',grass:'풀씨 뿌리기 · 풀밭',dry:'모래 뿌리기 · 건조한 곳'};
const gardenHint=['도구를 끌어 땅 위에서 <b>잠깐 멈추면</b> 부어져. 빗물 단서를 보고 골라 봐.','식물을 끌어 <b>특징이 도움이 되는 자리</b>에 쏙 심어 봐.','구름을 끌어 <b>세 자리 위를 모두</b> 지나가며 비를 뿌려 봐.'];
function garden(e,u,stage){
 const g=e.garden,rained=fieldSteps(e,3)[2],zoneClue={pond:'빗물이 낮은 자리에 오래 고여 있어',meadow:'빗물이 흙에 고르게 배어들어',ridge:'물이 빠르게 빠지고 땅이 말라 있어'};
 const envSources=Object.entries(envNames).map(([id,n])=>source(`${assetImage('habitat_'+id,'field-habitat-picture',true)}<span>${n}</span>`,'environment:'+id,u,'field-env-token')).join('');
 const tools=stage===0?Object.keys(envNames).map(id=>`<div class="mission-tool field-token field-env-token garden-tool" data-garden-tool="${id}" aria-hidden="true">${assetImage('habitat_'+id,'field-habitat-picture',true)}<span>${envVerb[id]}</span></div>`).join('')+`<div class="lens-fallback">${envSources}</div>`:Object.entries(plantNames).map(([id,n])=>source(`${plantArt(id)}<span>${n}</span>`,'plant:'+id,u,'field-plant-token')).join('');
 const zones=FIELD_ZONES.map(z=>{const env=g.environments[z],p=Object.keys(FIELD_PLANTS).find(p=>g.plants[p]===z);return target(`<i class="zone-state" data-zone="${z}" data-env="${env||''}" data-plant="${p||''}" data-fit="${p&&FIELD_ENV[z]===FIELD_PLANTS[p]?'1':''}" hidden></i><span class="zone-ground" aria-hidden="true">${env?assetImage('habitat_'+env,'zone-ground-picture',true):''}</span><span class="zone-water" aria-hidden="true"></span><strong>${zoneClue[z]}</strong><span class="field-zone-name">${envNames[env]||'도구로 땅을 만들어 줘'}</span>${p?plantArt(p)+`<span>${plantNames[p]}</span>`:'<span class="field-plant-space">심을 식물 자리</span>'}`,`${stage===0?'environment':'plant'}:${z}`,`field-garden-zone zone-${z} ${env?'has-env':''} ${rained?'rained':''}`);}).join('');
 return `<p class="lens-hint season-hint" data-garden-tip><span>${gardenHint[stage]}</span></p><div class="field-tools">${tools}</div><div class="garden-field ${stage===2?'has-cloud':''}" data-garden-field>${stage===2?'<div class="garden-cloud" data-garden-cloud aria-hidden="true"><span class="cloud-rain"></span></div>':''}<div class="field-restoration">${zones}</div></div>${stage===2?`<div class="lens-fallback">${btn(icon('drop')+' 같은 비로 정원 시험','field-garden-rain','','primary')}</div><p class="microcopy">배치를 바꾸면 다시 시험해야 해. 비는 식물을 바로 자라거나 시들게 만드는 장치가 아니라 물이 머무르는 환경을 확인하는 모형이야.</p>`:''}`;
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
 if(action==='field-dig'){(ui.fieldMission??={}).dug={...ui.fieldMission.dug,[id]:true};return '';}
 if(action==='field-drop'||action==='field-place'){
  const [picked,targetId]=action==='field-place'?String(id).split('|'):[ui.fieldMission?.selected||'',id];
  // The magnifier is the only tool in the scan step, so tapping a scan spot uses it directly.
  const t=String(targetId),item=picked||(t.startsWith('scan:')?'lens':t.startsWith('link:')?'season:'+t.split(':')[1]:'');
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
 const down=event=>{const el=event.target.closest('[data-field-item]');if(!el||!root.contains(el)||event.button>0)return;drag={el,item:el.dataset.fieldItem,x:event.clientX,y:event.clientY,pointer:event.pointerId,moved:false};el.setPointerCapture?.(event.pointerId);};
 const move=event=>{if(!drag||event.pointerId!==drag.pointer)return;if(!drag.moved&&Math.hypot(event.clientX-drag.x,event.clientY-drag.y)<8)return;event.preventDefault();drag.moved=true;if(!ghost){ghost=drag.el.cloneNode(true);ghost.removeAttribute('id');ghost.setAttribute('aria-hidden','true');ghost.classList.add('field-drag-ghost');ghost.style.cssText='position:fixed;pointer-events:none;z-index:40;width:120px;max-height:140px;overflow:hidden;opacity:.9;transform:translate(-50%,-50%);';document.body.append(ghost);}ghost.style.left=event.clientX+'px';ghost.style.top=event.clientY+'px';const over=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-field-drop]');root.querySelectorAll('.field-drag-over').forEach(el=>el.classList.toggle('field-drag-over',el===over));if(over&&root.contains(over))over.classList.add('field-drag-over');};
 const up=event=>{if(!drag||event.pointerId!==drag.pointer)return;const item=drag.item,moved=drag.moved,target=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-field-drop]');clear();if(!moved)return;event.preventDefault();blockedClick=true;clearTimeout(blockTimer);blockTimer=setTimeout(()=>{blockedClick=false;},400);if(target&&root.contains(target))onAction('field-place',`${item}|${target.dataset.fieldDrop}`);};
 const click=event=>{if(blockedClick){event.preventDefault();event.stopImmediatePropagation();blockedClick=false;}};
 const cancel=()=>clear();const key=event=>{if(event.key==='Escape'){clear();onAction('field-cancel','');}};
 const bench=root.querySelector('[data-lens-bench]'),lensCleanup=bench?mountLens(bench,ui,onAction):null,seasonCleanup=mountSeasonHands(root,ui,onAction);
 const gardenCleanup=mountGardenHands(root,ui,onAction);
 root.addEventListener('pointerdown',down);root.addEventListener('pointermove',move,{passive:false});root.addEventListener('pointerup',up);root.addEventListener('pointercancel',cancel);root.addEventListener('click',click,true);root.addEventListener('keydown',key);
 return ()=>{gardenCleanup();lensCleanup?.();seasonCleanup();clear();clearTimeout(blockTimer);root.removeEventListener('pointerdown',down);root.removeEventListener('pointermove',move);root.removeEventListener('pointerup',up);root.removeEventListener('pointercancel',cancel);root.removeEventListener('click',click,true);root.removeEventListener('keydown',key);};
}

// object-fit:contain leaves blank margins; clue spots are measured on the painted image only.
function drawnRect(img){const r=img.getBoundingClientRect(),nw=img.naturalWidth||1,nh=img.naturalHeight||1,k=(getComputedStyle(img).objectFit==='cover'?Math.max:Math.min)(r.width/nw,r.height/nh),w=nw*k,h=nh*k;return {left:r.left+(r.width-w)/2,top:r.top+(r.height-h)/2,width:w,height:h};}
// Drag the magnifier; resting on a clue spot for a moment records that observation.
function mountLens(bench,ui,onAction){
 const lens=bench.querySelector('[data-lens]'),glass=lens.querySelector('.field-lens-glass'),zoom=glass.querySelector('img'),u=ui.fieldMission??={},Z=2.6;
 let drag=null,timer=0,spot='',queued=[];
 const record=key=>{u.lastFound=key;onAction('field-place','lens|scan:'+key);};
 const discover=key=>{lens.classList.remove('charging');const chip=bench.querySelector(`[data-clue="${key}"]`);if(!chip||chip.classList.contains('found'))return;chip.classList.add('found','just-found');chip.textContent=chip.dataset.text;lens.classList.add('found-flash');setTimeout(()=>lens.classList.remove('found-flash'),500);if(drag)queued.push(key);else record(key);};
 const look=()=>{const g=glass.getBoundingClientRect(),cx=g.left+g.width/2,cy=g.top+g.height/2;let hit='',over=false;
  for(const box of bench.querySelectorAll('[data-lens-leaf]')){const img=box.querySelector('img'),r=drawnRect(img);if(cx<r.left-30||cx>r.left+r.width+30||cy<r.top-30||cy>r.top+r.height+30)continue;over=true;
   if(zoom.dataset.src!==img.src){zoom.src=img.src;zoom.dataset.src=img.src;}
   Object.assign(zoom.style,{width:r.width*Z+'px',height:r.height*Z+'px',left:g.width/2-(cx-r.left)*Z+'px',top:g.height/2-(cy-r.top)*Z+'px'});
   const id=box.dataset.lensLeaf,x=(cx-r.left)/r.width,y=(cy-r.top)/r.height;
   for(const kind of ['shape','edge'])if(LENS_SPOTS[id][kind].some(([a,b])=>Math.hypot((x-a)*r.width,(y-b)*r.height)<r.height*.11))hit=`${id}:${kind}`;
   break;}
  lens.classList.toggle('over',over);
  if(hit===spot)return;spot=hit;clearTimeout(timer);lens.classList.remove('charging');
  if(hit&&!bench.querySelector(`[data-clue="${hit}"]`)?.classList.contains('found')){void lens.offsetWidth;lens.classList.add('charging');timer=setTimeout(()=>discover(hit),650);}
 };
 const place=(x,y)=>{const b=bench.getBoundingClientRect();u.lens={x:Math.max(40,Math.min(b.width-40,x)),y:Math.max(40,Math.min(b.height-40,y))};lens.style.left=u.lens.x+'px';lens.style.top=u.lens.y+'px';look();};
 const down=e=>{if(e.button>0)return;e.preventDefault();e.stopPropagation();const b=bench.getBoundingClientRect();drag={id:e.pointerId,dx:e.clientX-b.left-u.lens.x,dy:e.clientY-b.top-u.lens.y};lens.setPointerCapture?.(e.pointerId);lens.classList.add('dragging');};
 const move=e=>{if(!drag||e.pointerId!==drag.id)return;e.preventDefault();const b=bench.getBoundingClientRect();place(e.clientX-b.left-drag.dx,e.clientY-b.top-drag.dy);};
 const up=e=>{if(!drag||e.pointerId!==drag.id)return;drag=null;lens.classList.remove('dragging');const keys=queued;queued=[];keys.forEach(record);};
 const settle=()=>place(u.lens?.x??150,u.lens?.y??58);
 lens.addEventListener('pointerdown',down);lens.addEventListener('pointermove',move);lens.addEventListener('pointerup',up);lens.addEventListener('pointercancel',up);
 bench.querySelectorAll('[data-lens-leaf] img').forEach(img=>img.complete||img.addEventListener('load',look,{once:true}));addEventListener('resize',settle);settle();
 return ()=>{clearTimeout(timer);removeEventListener('resize',settle);};
}

// Stage 2 by hand: rub the soil away, pull a string to the same part next spring, pin where it regrew.
function mountSeasonHands(root,ui,onAction){
 const offs=[];const on=(el,type,fn,opt)=>{el.addEventListener(type,fn,opt);offs.push(()=>el.removeEventListener(type,fn,opt));};
 const local=(el,e)=>{const r=el.getBoundingClientRect();return [(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height];};
 root.querySelectorAll('.dig-cover').forEach(cover=>{
  const kind=cover.closest('[data-dig]').dataset.dig,cells=[...cover.children];let rubbing=false,done=false;
  const rub=e=>{if(!rubbing||done)return;const r=cover.getBoundingClientRect(),reach=Math.max(r.width/6,26);cells.forEach(c=>{const b=c.getBoundingClientRect();if(Math.hypot(b.left+b.width/2-e.clientX,b.top+b.height/2-e.clientY)<reach)c.classList.add('gone');});
   if(cells.filter(c=>c.classList.contains('gone')).length>=cells.length*.6){done=true;cover.classList.add('cleared');setTimeout(()=>onAction('field-dig',kind),450);}};
  on(cover,'pointerdown',e=>{e.preventDefault();e.stopPropagation();rubbing=true;cover.setPointerCapture?.(e.pointerId);rub(e);});
  on(cover,'pointermove',e=>{e.preventDefault();rub(e);});on(cover,'pointerup',()=>{rubbing=false;});on(cover,'pointercancel',()=>{rubbing=false;});
 });
 root.querySelectorAll('[data-season-pair]').forEach(pair=>{
  const kind=pair.dataset.seasonPair,handle=pair.querySelector('[data-link-handle]'),targetBox=pair.querySelector('[data-link-target]'),svg=pair.querySelector('.link-line'),line=svg?.querySelector('line');if(!handle||!line)return;
  const cut=LINK_CUT[kind],partAt=y=>y>=cut?(kind==='tree'?'trunk':'root'):'leaf';
  const draw=(x,y)=>{const p=pair.getBoundingClientRect(),h=handle.getBoundingClientRect();line.setAttribute('x1',h.left+h.width/2-p.left);line.setAttribute('y1',h.top+h.height/2-p.top);line.setAttribute('x2',x-p.left);line.setAttribute('y2',y-p.top);svg.classList.add('show');};
  const zoneCenter=part=>{const z=targetBox.querySelector(part==='leaf'?'.upper':'.lower').getBoundingClientRect();return [z.left+z.width/2,z.top+z.height/2];};
  const linked=targetBox.querySelector('.link-zone.picked');
  const restore=()=>{if(!linked){svg.classList.remove('show');return;}const [x,y]=zoneCenter(linked.classList.contains('upper')?'leaf':'trunk');draw(x,y);svg.classList.add('fixed');};
  requestAnimationFrame(restore);
  let pulling=false;
  on(handle,'pointerdown',e=>{e.preventDefault();e.stopPropagation();pulling=true;handle.setPointerCapture?.(e.pointerId);pair.classList.add('linking');svg.classList.remove('fixed');draw(e.clientX,e.clientY);});
  on(handle,'pointermove',e=>{if(!pulling)return;e.preventDefault();draw(e.clientX,e.clientY);const t=targetBox.getBoundingClientRect(),inside=e.clientX>=t.left&&e.clientX<=t.right&&e.clientY>=t.top&&e.clientY<=t.bottom;targetBox.querySelectorAll('.link-zone').forEach(z=>z.classList.remove('hover'));if(inside)targetBox.querySelector(partAt((e.clientY-t.top)/t.height)==='leaf'?'.upper':'.lower').classList.add('hover');});
  const end=e=>{if(!pulling)return;pulling=false;pair.classList.remove('linking');targetBox.querySelectorAll('.link-zone').forEach(z=>z.classList.remove('hover'));const t=targetBox.getBoundingClientRect();if(e.type==='pointerup'&&e.clientX>=t.left&&e.clientX<=t.right&&e.clientY>=t.top&&e.clientY<=t.bottom){const part=partAt((e.clientY-t.top)/t.height),[x,y]=zoneCenter(part);draw(x,y);onAction('field-season-link',`${kind}:${part}`);}else restore();};
  on(handle,'pointerup',end);on(handle,'pointercancel',end);
 });
 root.querySelectorAll('[data-regrow]').forEach(box=>{
  const kind=box.dataset.regrow,pin=box.querySelector('[data-regrow-pin]'),pic=box.querySelector('.regrow-pic'),img=pic.querySelector('img');let ghost=null;
  const drop=e=>{const r=drawnRect(img),p=pic.getBoundingClientRect();if(e.clientX<p.left||e.clientX>p.right||e.clientY<p.top||e.clientY>p.bottom)return;const x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height,u=ui.fieldMission??={};u.pin={...u.pin,[kind]:local(pic,e)};onAction('field-season-clue',`${kind}:${regrowZone(kind,x,y)}`);};
  on(pin,'pointerdown',e=>{e.preventDefault();e.stopPropagation();pin.setPointerCapture?.(e.pointerId);ghost=pin.cloneNode();ghost.classList.add('dragging');document.body.append(ghost);Object.assign(ghost.style,{position:'fixed',left:e.clientX+'px',top:e.clientY+'px'});});
  on(pin,'pointermove',e=>{if(!ghost)return;e.preventDefault();ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';});
  const end=e=>{if(!ghost)return;ghost.remove();ghost=null;if(e.type==='pointerup')drop(e);};on(pin,'pointerup',end);on(pin,'pointercancel',end);
  on(pic,'click',drop);
 });
 return ()=>offs.forEach(off=>off());
}
